import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const snap = await db.collection('portfolios').get();
    const portfolios = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return NextResponse.json({ portfolios });
}
