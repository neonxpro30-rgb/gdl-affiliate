import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { referralId } = await req.json();

        if (!referralId) {
            return NextResponse.json({ error: 'Referral ID is required' }, { status: 400 });
        }

        // Transition guard (audit #23): paid/reversed are terminal —
        // re-marking a settled referral PAID would double-pay it.
        const ref = db.collection('referrals').doc(referralId);
        const doc = await ref.get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
        }
        const current = String((doc.data() as any)?.status || '');
        if (['paid', 'reversed'].includes(current.toLowerCase())) {
            return NextResponse.json({ error: `Referral is already '${current}' and cannot be paid again` }, { status: 409 });
        }

        await ref.update({
            status: 'PAID',
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
