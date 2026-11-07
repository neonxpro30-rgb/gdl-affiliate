import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Question bank per course (admin only — includes correctIndex).
export async function GET(_req: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { courseSlug } = await params;
    const doc = await db.collection('tests').doc(courseSlug).get();
    return NextResponse.json({ test: doc.exists ? { courseSlug, ...doc.data() } : { courseSlug, questions: [] } });
}

export async function POST(req: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { courseSlug } = await params;
        const { questions, passMarkPct } = await req.json();
        if (!Array.isArray(questions)) return NextResponse.json({ error: 'questions must be an array' }, { status: 400 });
        for (const q of questions) {
            if (!q.id || !q.text || !Array.isArray(q.options) || q.options.length < 2 || typeof q.correctIndex !== 'number') {
                return NextResponse.json({ error: `Invalid question: ${q.id || '(missing id)'}` }, { status: 400 });
            }
        }
        await db.collection('tests').doc(courseSlug).set({
            questions, ...(passMarkPct !== undefined ? { passMarkPct } : {}),
            updatedAt: new Date().toISOString(),
        }, { merge: true });
        return NextResponse.json({ ok: true, count: questions.length });
    } catch (error) {
        console.error('Admin tests error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
