import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Affiliates list for admin: partner tier, KYC, Pro Pool, fraud flags,
// and v2 commission totals per user.
export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const usersSnap = await db.collection('users').get();
        const commSnap = await db.collection('referrals').where('model', '==', 'v2-flat').get();
        const totals = new Map<string, { sales: number; earned: number; pending: number }>();
        for (const d of commSnap.docs) {
            const data = d.data() as any;
            const t = totals.get(data.referrerId) || { sales: 0, earned: 0, pending: 0 };
            t.sales++;
            if (['approved', 'paid'].includes(data.status)) t.earned += Number(data.amount) || 0;
            if (data.status === 'pending') t.pending += Number(data.amount) || 0;
            totals.set(data.referrerId, t);
        }
        const affiliates = usersSnap.docs.map(d => {
            const u = d.data() as any;
            return {
                id: d.id, name: u.name || '', email: u.email || '', phone: u.phone || '',
                referralCode: u.referralCode || '',
                partnerTier: u.partnerTier || 'none',
                kyc: u.kyc || { status: 'none' },
                proPool: !!u.proPool,
                fraudFlags: u.fraudFlags || [],
                ...(totals.get(d.id) || { sales: 0, earned: 0, pending: 0 }),
            };
        }).filter(a => a.sales > 0 || a.partnerTier !== 'none' || a.kyc.status !== 'none' || a.proPool);
        return NextResponse.json({ affiliates });
    } catch (error) {
        console.error('Admin affiliates error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
