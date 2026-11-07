import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// New-model (v2-flat) commission ledger for the admin Affiliates view.
export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const snap = await db.collection('referrals').where('model', '==', 'v2-flat').get();
    const commissions = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return NextResponse.json({ commissions });
}
