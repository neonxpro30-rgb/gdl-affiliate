import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Admin project actions: assign/reassign, request revision, approve.
// Approval makes the project payable in the next payout batch.
const ADMIN_STATUSES = ['assigned', 'in_progress', 'submitted', 'revision', 'approved', 'unassigned'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const { assigneeId, status, adminNote } = await req.json();
        const ref = db.collection('projects').doc(id);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        const updates: any = { updatedAt: new Date().toISOString() };
        if (assigneeId !== undefined) { updates.assigneeId = assigneeId; if (doc.data()?.status === 'unassigned') updates.status = 'assigned'; }
        if (status !== undefined) {
            if (!ADMIN_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            updates.status = status;
        }
        if (adminNote !== undefined) updates.adminNote = adminNote;
        await ref.update(updates);
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
