import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';
import { getSettings } from '@/lib/settings';
import { issueCertificate } from '@/lib/certificates';
import { getProduct } from '@/lib/products';

// Practical-edit review. Approving the practical of an attempt whose
// MCQ already passed completes the pass and issues the certificate.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const { reviewStatus, note } = await req.json();
        if (!['approved', 'rejected'].includes(reviewStatus)) return NextResponse.json({ error: 'Invalid reviewStatus' }, { status: 400 });

        const ref = db.collection('testAttempts').doc(id);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        const attempt = doc.data() as any;

        const settings = await getSettings();
        const testDoc = await db.collection('tests').doc(attempt.courseSlug).get();
        const passMark = (testDoc.data() as any)?.passMarkPct ?? settings.test.passMarkPct;

        let status = attempt.status;
        if (reviewStatus === 'approved' && attempt.mcqScorePct >= passMark) status = 'PASSED';
        if (reviewStatus === 'rejected' && attempt.status === 'AWAITING_REVIEW') status = 'FAILED';

        const updates: any = {
            practical: { ...(attempt.practical || {}), reviewStatus, reviewerNote: note || '' },
            status,
            updatedAt: new Date().toISOString(),
        };
        if (status === 'FAILED') {
            updates.cooldownUntil = new Date(Date.now() + settings.test.retakeCooldownHours * 3600000).toISOString();
        }
        await ref.update(updates);

        let certificate = null;
        if (status === 'PASSED') {
            const product = await getProduct(attempt.courseSlug);
            certificate = await issueCertificate(attempt.userId, attempt.courseSlug, product?.title || attempt.courseSlug);
        }
        return NextResponse.json({ ok: true, status, certificate });
    } catch (error) {
        console.error('Practical review error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
