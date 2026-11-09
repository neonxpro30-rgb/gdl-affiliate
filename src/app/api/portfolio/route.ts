import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { hasPassedCourse } from '@/lib/access';
import { COURSE_SLUGS } from '@/lib/products';

// Paid-work pipeline, step 1: students who PASSED Course 03 (Pro Wedding
// Trailer) submit a portfolio (showreel + 2-3 edits) for Pro Pool review.
// Paid work depends on quality and is never guaranteed.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const passed = await hasPassedCourse(session.user.id, COURSE_SLUGS.proTrailer);
        if (!passed) return NextResponse.json({ error: 'Pass Course 03 (Pro Wedding Trailer) to unlock portfolio submission' }, { status: 403 });

        const { showreelLink, edits } = await req.json();
        if (!showreelLink) return NextResponse.json({ error: 'showreelLink required' }, { status: 400 });
        const isWebLink = (v: unknown) => /^https?:\/\/\S+$/i.test(String(v || '').trim());
        if (!isWebLink(showreelLink) || (Array.isArray(edits) && edits.some((e: unknown) => e && !isWebLink(e)))) {
            return NextResponse.json({ error: 'All links must be full https:// links' }, { status: 400 });
        }

        const existing = await db.collection('portfolios').where('userId', '==', session.user.id).limit(1).get();
        const data = {
            userId: session.user.id,
            showreelLink,
            edits: Array.isArray(edits) ? edits.filter(Boolean).slice(0, 3) : [],
            reviewStatus: 'pending',
            feedback: '',
            updatedAt: new Date().toISOString(),
        };
        if (!existing.empty) {
            await existing.docs[0].ref.update(data);
            return NextResponse.json({ id: existing.docs[0].id, ...data });
        }
        const ref = await db.collection('portfolios').add({ ...data, createdAt: new Date().toISOString() });
        return NextResponse.json({ id: ref.id, ...data });
    } catch (error) {
        console.error('Portfolio error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const snap = await db.collection('portfolios').where('userId', '==', session.user.id).limit(1).get();
        if (snap.empty) return NextResponse.json({ portfolio: null });
        return NextResponse.json({ portfolio: { id: snap.docs[0].id, ...snap.docs[0].data() } });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
