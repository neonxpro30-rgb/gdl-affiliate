import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Lessons subcollection for a course. A course with no lessons docs
// falls back to its single videoLink as Lesson 1 in the player.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const snap = await db.collection('courses').doc(id).collection('lessons').get();
    const lessons = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return NextResponse.json({ lessons });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const body = await req.json();
        const col = db.collection('courses').doc(id).collection('lessons');
        if (body.lessonId) {
            await col.doc(body.lessonId).set({
                title: body.title || 'Lesson', videoLink: body.videoLink || '',
                durationSec: Number(body.durationSec) || 0, order: Number(body.order) || 0,
                isAssignment: !!body.isAssignment, updatedAt: new Date().toISOString(),
            }, { merge: true });
            return NextResponse.json({ ok: true, id: body.lessonId });
        }
        const ref = await col.add({
            title: body.title || 'Lesson', videoLink: body.videoLink || '',
            durationSec: Number(body.durationSec) || 0, order: Number(body.order) || 0,
            isAssignment: !!body.isAssignment, createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true, id: ref.id });
    } catch (error) {
        console.error('Lessons error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const lessonId = new URL(req.url).searchParams.get('lessonId');
    if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
    await db.collection('courses').doc(id).collection('lessons').doc(lessonId).delete();
    return NextResponse.json({ ok: true });
}
