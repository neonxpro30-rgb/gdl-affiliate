import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Portfolio review: approve -> the student joins the Pro Pool
// (users.proPool = true); reject -> feedback the student can act on.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const { reviewStatus, feedback } = await req.json();
        if (!['approved', 'rejected'].includes(reviewStatus)) return NextResponse.json({ error: 'Invalid reviewStatus' }, { status: 400 });
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
