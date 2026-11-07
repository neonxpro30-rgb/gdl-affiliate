import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';
import { buildPayoutBatch, markBatchRowsPaid } from '@/lib/payouts';

// Payout batches: GET lists batches, POST builds a new batch from all
// approved commissions + approved projects (min amount + KYC enforced
// in the builder; rows move to 'batched'), PATCH marks an OPEN batch
// paid — a disbursement reference is required — and only then flips
// its rows from 'batched' to 'paid'.
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
        const { batchId, note, reference } = await req.json();
        if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 });
        if (!reference || !String(reference).trim()) {
            return NextResponse.json({ error: 'A disbursement reference is required to mark a batch paid' }, { status: 400 });
        }
        const batchRef = db.collection('payouts').doc(batchId);
        const batchDoc = await batchRef.get();
        if (!batchDoc.exists) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        if ((batchDoc.data() as any).status !== 'open') {
            return NextResponse.json({ error: 'Only an open batch can be marked paid' }, { status: 409 });
        }
        const flipped = await markBatchRowsPaid(batchId);
        await batchRef.update({
            status: 'paid', paidAt: new Date().toISOString(),
            reference: String(reference).trim(), paidNote: note || '',
        });
        return NextResponse.json({ ok: true, rowsPaid: flipped });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
