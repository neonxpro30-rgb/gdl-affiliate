import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { getOrCreateCoupon } from '@/lib/commission';
import { getUserPayouts } from '@/lib/payouts';
import { getSettings } from '@/lib/settings';

// Affiliate dashboard data for the NEW flat model. Free to join: any
// logged-in user gets their link + coupon + ledger, no purchase needed.
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.user.id;

        const userDoc = await db.collection('users').doc(userId).get();
        const user = userDoc.data() as any;
        const coupon = await getOrCreateCoupon(userId);
        const settings = await getSettings();

        const snap = await db.collection('referrals')
            .where('referrerId', '==', userId)
            .where('model', '==', 'v2-flat')
            .get();
        const commissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const byStatus: Record<string, { count: number; amount: number }> = {};
        for (const c of commissions as any[]) {
            const s = c.status || 'pending';
            byStatus[s] = byStatus[s] || { count: 0, amount: 0 };
            byStatus[s].count++;
            byStatus[s].amount += Number(c.amount) || 0;
        }

        const payouts = await getUserPayouts(userId);
        const totalTds = payouts.reduce((s, p) => s + (p.lines || []).reduce((a: number, l: any) => a + (l.tdsAmount || 0), 0), 0);

        return NextResponse.json({
            referralCode: user?.referralCode || '',
            referralLink: `https://learnpeak.in/signup?ref=${user?.referralCode || ''}`,
            coupon: { code: coupon.code, discountPct: coupon.discountPct },
            partnerTier: user?.partnerTier || 'none',
            rates: settings.rates,
            sales: commissions.length,
            commissions: (commissions as any[])
                .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                .slice(0, 50),
            byStatus,
            payouts,
            totalTds,
            kyc: user?.kyc || { status: 'none' },
            payoutMinimum: settings.payout.minAmount,
        });
    } catch (error) {
        console.error('Affiliate dashboard error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
