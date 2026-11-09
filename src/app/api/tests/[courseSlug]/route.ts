import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { getSettings } from '@/lib/settings';
import { getCertificate } from '@/lib/certificates';
import { hasFullCourseAccess } from '@/lib/access';

// Final test per course: MCQ (auto-graded) + one practical edit
// (link, admin-reviewed). Pass = MCQ >= pass mark AND practical approved.
// Retakes allowed after a configurable cooldown.

async function latestAttempt(userId: string, courseSlug: string) {
    const snap = await db.collection('testAttempts')
        .where('userId', '==', userId).where('courseSlug', '==', courseSlug).get();
    if (snap.empty) return null;
    const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    attempts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return attempts[0];
}

export async function GET(_req: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { courseSlug } = await params;
        // Ownership gate (audit 2026-11-07, high #7): the final test belongs
        // to buyers of the course — a non-buyer must not fetch questions,
        // earn a certificate, or unlock the paid-work gate with it.
        if (!(await hasFullCourseAccess(session.user.id, courseSlug))) {
            return NextResponse.json({ error: 'Course not purchased' }, { status: 403 });
        }
        const settings = await getSettings();

        const testDoc = await db.collection('tests').doc(courseSlug).get();
        const test = testDoc.exists ? (testDoc.data() as any) : { questions: [] };
        const questions = (test.questions || []).map((q: any) => ({ id: q.id, text: q.text, options: q.options }));

        const attempt = await latestAttempt(session.user.id, courseSlug);
        let certificate = null;
        if (attempt?.status === 'PASSED') {
            const certSnap = await db.collection('certificates')
                .where('userId', '==', session.user.id).where('courseSlug', '==', courseSlug).limit(1).get();
            if (!certSnap.empty) certificate = { id: certSnap.docs[0].id, ...certSnap.docs[0].data() };
        }

        return NextResponse.json({
            courseSlug,
            questions,
            passMarkPct: test.passMarkPct ?? settings.test.passMarkPct,
            cooldownHours: settings.test.retakeCooldownHours,
            lastAttempt: attempt,
            certificate,
        });
    } catch (error) {
        console.error('Test fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { courseSlug } = await params;
        if (!(await hasFullCourseAccess(session.user.id, courseSlug))) {
            return NextResponse.json({ error: 'Course not purchased' }, { status: 403 });
        }
        const { answers, practicalLink } = await req.json();
        // Links are opened by the admin reviewer — only real web links.
        if (practicalLink && !/^https?:\/\/\S+$/i.test(String(practicalLink).trim())) {
            return NextResponse.json({ error: 'Practical link must be a full https:// link (Drive, YouTube, Vimeo…)' }, { status: 400 });
        }
        const settings = await getSettings();

        const prev = await latestAttempt(session.user.id, courseSlug);
        if (prev?.status === 'PASSED') {
            return NextResponse.json({ error: 'Already passed', status: 'PASSED', mcqScorePct: prev.mcqScorePct }, { status: 400 });
        }
        if (prev?.cooldownUntil && new Date(prev.cooldownUntil).getTime() > Date.now() && prev.status === 'FAILED') {
            return NextResponse.json({ error: 'Retake cooldown active', cooldownUntil: prev.cooldownUntil }, { status: 429 });
        }

        const testDoc = await db.collection('tests').doc(courseSlug).get();
        if (!testDoc.exists) return NextResponse.json({ error: 'Test not configured for this course yet' }, { status: 404 });
        const test = testDoc.data() as any;
        const questions: any[] = test.questions || [];
        if (!questions.length) return NextResponse.json({ error: 'No questions yet' }, { status: 404 });

        let correct = 0;
        for (const q of questions) {
            if (Number(answers?.[q.id]) === Number(q.correctIndex)) correct++;
        }
        const mcqScorePct = Math.round((correct / questions.length) * 100);
        const passMark = test.passMarkPct ?? settings.test.passMarkPct;
        const mcqPassed = mcqScorePct >= passMark;

        // Carry forward an approved practical ONLY for the exact same work
        // (audit 2026-11-07, high #8): a prior approval must never bless a
        // brand-new, unreviewed link.
        const approvedLink = prev?.practical?.reviewStatus === 'approved' ? (prev.practical.link || '') : null;
        const carryApproved = !!approvedLink && (!practicalLink || practicalLink === approvedLink);
        const practical = practicalLink
            ? { link: practicalLink, reviewStatus: carryApproved ? 'approved' : 'pending', reviewerNote: '' }
            : (prev?.practical || { link: '', reviewStatus: 'pending', reviewerNote: '' });
        const priorPracticalApproved = carryApproved;

        const now = new Date().toISOString();
        let status: string;
        let cooldownUntil: string | null = null;
        if (!mcqPassed) {
            status = 'FAILED';
            cooldownUntil = new Date(Date.now() + settings.test.retakeCooldownHours * 3600000).toISOString();
        } else if (priorPracticalApproved || practical.reviewStatus === 'approved') {
            status = 'PASSED';
        } else {
            status = 'AWAITING_REVIEW';
        }

        const ref = await db.collection('testAttempts').add({
            userId: session.user.id, courseSlug,
            answers: answers || {}, mcqScorePct, practical,
            status, cooldownUntil, createdAt: now, updatedAt: now,
        });

        if (status === 'PASSED') {
            const { issueCertificate } = await import('@/lib/certificates');
            const product = await (await import('@/lib/products')).getProduct(courseSlug);
            await issueCertificate(session.user.id, courseSlug, product?.title || courseSlug);
        }

        return NextResponse.json({ attemptId: ref.id, mcqScorePct, status, cooldownUntil });
    } catch (error) {
        console.error('Test submit error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
