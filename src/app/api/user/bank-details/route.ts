import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { bankName, accountNumber, ifscCode, upiId } = body;

        // Firestore rejects undefined values — store empty strings instead.
        const clean = (v: unknown) => String(v ?? '').trim();
        const ifsc = clean(ifscCode).toUpperCase();
        if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
            return NextResponse.json({ error: 'Enter a valid IFSC code (e.g. SBIN0001234)' }, { status: 400 });
        }
        await db.collection('users').doc(session.user.id).update({
            bankName: clean(bankName), accountNumber: clean(accountNumber), ifscCode: ifsc, upiId: clean(upiId),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bank details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
