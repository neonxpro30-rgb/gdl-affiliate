import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { generateHash } from '@/lib/payu';

// PayU hash generation — hardened (audit 2026-11-07, critical #3).
// Previously this was a public signing oracle: anyone could get a valid
// hash for arbitrary amounts against any order ID. Now the caller must own
// a PENDING order, and the signed amount must equal the stored order
// amount, so a ₹1 hash can never settle a ₹6,999 order.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 } = body;

        if (!txnid || !amount || !productinfo || !firstname || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // txnid IS the order id in this integration — bind the hash to the
        // caller's own PENDING order and its stored amount.
        const orderDoc = await db.collection('orders').doc(txnid).get();
        if (!orderDoc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        const order = orderDoc.data() as any;
        if (order.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (order.status !== 'PENDING') {
            return NextResponse.json({ error: 'Order is not payable' }, { status: 409 });
        }
        if (Number(amount) !== Number(order.amount)) {
            return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
        }

        const hash = generateHash({
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            udf1,
            udf2,
            udf3,
            udf4,
            udf5
        });

        return NextResponse.json({ hash });
    } catch (error) {
        console.error('Hash generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
