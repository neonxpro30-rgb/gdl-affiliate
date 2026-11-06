import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Certificate admin: revoke / reinstate. /verify/<id> reflects this live.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const { status } = await req.json();
        if (!['valid', 'revoked'].includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        const ref = db.collection('certificates').doc(id);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        await ref.update({ status, updatedAt: new Date().toISOString() });
        return NextResponse.json({ ok: true, status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
