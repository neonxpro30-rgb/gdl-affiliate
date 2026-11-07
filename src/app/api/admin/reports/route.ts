import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Basic relaunch reports: sales by product, demo -> course conversion,
// refund rate, certificates issued, affiliate performance, paid projects.
export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const ordersSnap = await db.collection('orders').where('status', '==', 'SUCCESS').get();
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        const salesByProduct: Record<string, { count: number; revenue: number }> = {};
        const demoBuyers = new Set<string>();
        const courseBuyers = new Set<string>();
        let refunded = 0;
        for (const o of orders) {
            const key = o.productSlug || o.packageId || 'unknown';
            salesByProduct[key] = salesByProduct[key] || { count: 0, revenue: 0 };
            salesByProduct[key].count++;
            salesByProduct[key].revenue += Number(o.amount) || 0;
            if (o.productSlug === 'demo') demoBuyers.add(o.userId);
            if (o.productSlug && o.productSlug !== 'demo') courseBuyers.add(o.userId);
            if (o.refundStatus === 'REFUNDED') refunded++;
        }
        const demoConverted = [...demoBuyers].filter(u => courseBuyers.has(u)).length;

        const certSnap = await db.collection('certificates').get();
        const projSnap = await db.collection('projects').get();
        const commSnap = await db.collection('referrals').where('model', '==', 'v2-flat').get();
        const affiliatePerf = new Map<string, { sales: number; earned: number }>();
        for (const d of commSnap.docs) {
            const data = d.data() as any;
            const t = affiliatePerf.get(data.referrerId) || { sales: 0, earned: 0 };
            t.sales++;
            if (['approved', 'paid'].includes(data.status)) t.earned += Number(data.amount) || 0;
            affiliatePerf.set(data.referrerId, t);
        }

        return NextResponse.json({
            salesByProduct,
            totalOrders: orders.length,
            refundRate: orders.length ? Math.round((refunded / orders.length) * 1000) / 10 : 0,
            demoBuyers: demoBuyers.size,
            demoConverted,
            demoConversionPct: demoBuyers.size ? Math.round((demoConverted / demoBuyers.size) * 1000) / 10 : 0,
            certificatesIssued: certSnap.size,
            paidProjects: projSnap.docs.filter(d => (d.data() as any).status === 'paid').length,
            totalProjects: projSnap.size,
            affiliatePerformance: [...affiliatePerf.entries()].map(([userId, v]) => ({ userId, ...v }))
                .sort((a, b) => b.earned - a.earned).slice(0, 20),
        });
    } catch (error) {
        console.error('Reports error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
