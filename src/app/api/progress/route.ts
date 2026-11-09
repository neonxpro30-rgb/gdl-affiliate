import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { courseWatchedPercent } from '@/lib/progress';

// Watch progress tracking. The player sends a heartbeat while a lesson
// is open; we accumulate watchedSeconds per user/course/lesson in the
// `progress` collection. Course-level % drives refund auto-eligibility.

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { courseSlug, lessonId, watchedSeconds, durationSec } = await req.json();
        if (!courseSlug || !lessonId) return NextResponse.json({ error: 'courseSlug and lessonId required' }, { status: 400 });
        // Ids become part of a Firestore doc id — a '/' would break it.
        if (!/^[A-Za-z0-9_-]{1,120}$/.test(String(courseSlug)) || !/^[A-Za-z0-9_-]{1,120}$/.test(String(lessonId))) {
            return NextResponse.json({ error: 'Invalid courseSlug or lessonId' }, { status: 400 });
        }

        const docId = `${session.user.id}_${courseSlug}_${lessonId}`;
        const ref = db.collection('progress').doc(docId);
        const existing = await ref.get();
        const prev = existing.exists ? (existing.data() as any) : null;
        const watched = Math.max(prev?.watchedSeconds || 0, Number(watchedSeconds) || 0);
        const duration = Number(durationSec) || prev?.durationSec || 0;
        const percent = duration > 0 ? Math.min(100, Math.round((watched / duration) * 1000) / 10) : (prev?.percent || 0);
        await ref.set({
            userId: session.user.id, courseSlug, lessonId,
            watchedSeconds: watched, durationSec: duration, percent,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
        return NextResponse.json({ ok: true, percent });
    } catch (error) {
        console.error('Progress error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const courseSlug = new URL(req.url).searchParams.get('courseSlug');
        let q = db.collection('progress').where('userId', '==', session.user.id);
        if (courseSlug) q = q.where('courseSlug', '==', courseSlug);
        const snap = await q.get();
        const lessons = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return NextResponse.json({ lessons, coursePercent: await courseWatchedPercent(session.user.id, courseSlug || '') });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
