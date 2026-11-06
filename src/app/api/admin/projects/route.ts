import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Paid-work projects (admin): create + list. Assignment = assigneeId.
export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const snap = await db.collection('projects').get();
    const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return NextResponse.json({ projects });
}

export async function POST(req: Request) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { title, client, footageLink, deadline, payAmount, assigneeId } = await req.json();
        if (!title || !footageLink) return NextResponse.json({ error: 'title and footageLink required' }, { status: 400 });
        const ref = await db.collection('projects').add({
            title, client: client || '', footageLink, deadline: deadline || '',
            payAmount: Number(payAmount) || 0,
            assigneeId: assigneeId || null,
            status: assigneeId ? 'assigned' : 'unassigned',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        return NextResponse.json({ id: ref.id });
    } catch (error) {
        console.error('Admin project error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
