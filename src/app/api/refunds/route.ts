import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { courseWatchedPercent } from '@/lib/progress';

// Refund requests — NEW policy: full refund within 24 hours of purchase
// if less than 20% of the course has been watched. Eligibility is
// computed automatically at request time; an admin approves/rejects.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { orderId, courseSlug, reason } = await req.json();
        if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        const order = orderDoc.data() as any;
        if (order.userId !== session.user.id) return NextResponse.json({ error: 'Not your order' }, { status: 403 });
        if (order.status !== 'SUCCESS') return NextResponse.json({ error: 'Only successful purchases can be refunded' }, { status: 400 });

        const slug = courseSlug || order.productSlug || '';
        const watchedPct = slug ? await courseWatchedPercent(session.user.id, slug) : 0;
        const ageHours = (Date.now() - new Date(order.updatedAt || order.createdAt).getTime()) / 3600000;
        const within24h = ageHours <= 24;
        const reasons: string[] = [];
        if (!within24h) reasons.push('More than 24 hours have passed since purchase');
        if (watchedPct >= 20) reasons.push(`Course watched ${watchedPct}% (limit is under 20%)`);
        const eligible = reasons.length === 0;

        const ref = await db.collection('refundRequests').add({
            orderId, courseSlug: slug, userId: session.user.id,
            reason: reason || '', status: 'pending',
            autoEligibility: { within24h, watchedPct, eligible, reasons },
            createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ id: ref.id, eligible, reasons });
    } catch (error) {
        console.error('Refund request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const snap = await db.collection('refundRequests').where('userId', '==', session.user.id).get();
        const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        return NextResponse.json({ requests });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
