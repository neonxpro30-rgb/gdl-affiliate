import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';
import { buildPayoutBatch } from '@/lib/payouts';

// Payout batches: GET lists batches, POST builds a new batch from all
// approved commissions + approved projects (min amount + KYC enforced
// in the builder), PATCH marks a batch paid with a note/txn ref.
export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const snap = await db.collection('payouts').get();
    const batches = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return NextResponse.json({ batches });
}

export async function POST() {
    const guard = await requireAdmin();
    if (!guard.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const result = await buildPayoutBatch(guard.userId || 'admin');
        return NextResponse.json(result);
    } catch (error) {
        console.error('Payout build error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { batchId, note } = await req.json();
        if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 });
        await db.collection('payouts').doc(batchId).update({
            status: 'paid', paidAt: new Date().toISOString(), paidNote: note || '',
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
