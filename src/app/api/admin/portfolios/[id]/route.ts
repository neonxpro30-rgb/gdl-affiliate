import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Portfolio review: approve -> the student joins the Pro Pool
// (users.proPool = true); reject -> feedback the student can act on.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const body = await req.json();
        // Accept { reviewStatus: 'approved'|'rejected' } and the admin
        // panel's { decision: 'approve'|'reject' }.
        const decisionMap: Record<string, string> = { approve: 'approved', reject: 'rejected', approved: 'approved', rejected: 'rejected' };
        const reviewStatus = decisionMap[String(body.reviewStatus ?? body.decision ?? '')];
        const feedback = body.feedback;
        if (!reviewStatus) return NextResponse.json({ error: 'Invalid decision (use approve or reject)' }, { status: 400 });
        const ref = db.collection('portfolios').doc(id);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
        await ref.update({ reviewStatus, feedback: feedback || '', reviewedAt: new Date().toISOString() });
        const userId = (doc.data() as any).userId;
        if (userId) {
            await db.collection('users').doc(userId).update({
                proPool: reviewStatus === 'approved',
                updatedAt: new Date().toISOString(),
            });
        }
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Portfolio review error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
