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
        const { title, client, clientName, footageLink, deadline, payAmount, assigneeId } = await req.json();
        if (!title || !footageLink) return NextResponse.json({ error: 'Project title and footage link are required' }, { status: 400 });
        const pay = Number(payAmount) || 0;
        if (pay < 0) return NextResponse.json({ error: 'Pay amount cannot be negative' }, { status: 400 });
        const name = clientName || client || '';
        const ref = await db.collection('projects').add({
            // clientName is what the admin panel reads; client kept for older rows
            title, clientName: name, client: name, footageLink, deadline: deadline || '',
            payAmount: pay,
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
