import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const snap = await db.collection('licenses').get();
    const licenses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ licenses });
}
