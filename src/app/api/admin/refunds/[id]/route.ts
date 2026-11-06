import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';
import { reverseCommissionsForOrder } from '@/lib/commission';

// Admin refund decision. Approving marks the order REFUNDED and reverses
// the affiliate commission. The money movement itself happens in PayU —
// this records the decision and its effects; the admin completes the
// gateway refund and can note the reference.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const { action, note } = await req.json();
        const ref = db.collection('refundRequests').doc(id);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        const request = doc.data() as any;

        if (action === 'approve') {
            await db.collection('orders').doc(request.orderId).update({
                refundStatus: 'REFUNDED', refundedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const reversed = await reverseCommissionsForOrder(request.orderId, 'refund approved');
            await ref.update({ status: 'approved', processedAt: new Date().toISOString(), adminNote: note || '', commissionsReversed: reversed });
            return NextResponse.json({ ok: true, commissionsReversed: reversed });
        }
        if (action === 'reject') {
            await ref.update({ status: 'rejected', processedAt: new Date().toISOString(), adminNote: note || '' });
            return NextResponse.json({ ok: true });
        }
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin refund error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
