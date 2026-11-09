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
        const body = await req.json();
        const rawQuestions = body.questions;
        const passMarkPct = body.passMarkPct;
        if (!Array.isArray(rawQuestions)) return NextResponse.json({ error: 'questions must be an array' }, { status: 400 });
        if (passMarkPct !== undefined && !(typeof passMarkPct === 'number' && passMarkPct >= 0 && passMarkPct <= 100)) {
            return NextResponse.json({ error: 'Pass mark must be between 0 and 100' }, { status: 400 });
        }
        // Accept both { id, text, options, correctIndex } and the format the
        // admin panel shows: { question, options, correctIndex }. Missing ids
        // are generated so answers can be matched.
        const questions: { id: string; text: string; options: string[]; correctIndex: number }[] = [];
        for (let i = 0; i < rawQuestions.length; i++) {
            const q = rawQuestions[i] || {};
            const text = String(q.text ?? q.question ?? '').trim();
            const options = Array.isArray(q.options) ? q.options.map((o: unknown) => String(o)) : [];
            const correctIndex = Number(q.correctIndex);
            if (!text || options.length < 2 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
                return NextResponse.json({ error: `Question ${i + 1} is invalid: it needs text, at least 2 options and a correctIndex inside the options` }, { status: 400 });
            }
            questions.push({ id: String(q.id || `q${i + 1}`), text, options, correctIndex });
        }
        if (new Set(questions.map(q => q.id)).size !== questions.length) {
            return NextResponse.json({ error: 'Two questions share the same id' }, { status: 400 });
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
