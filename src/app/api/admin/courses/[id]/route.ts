import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminGuard';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { title, description, videoLink, category } = body;

        // Only send fields that were provided — Firestore rejects undefined.
        const updates: Record<string, unknown> = { title, description, videoLink, category, updatedAt: new Date().toISOString() };
        Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
        if (updates.title !== undefined && !String(updates.title).trim()) {
            return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
        }
        const ref = db.collection('courses').doc(id);
        if (!(await ref.get()).exists) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        await ref.update(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await db.collection('courses').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
