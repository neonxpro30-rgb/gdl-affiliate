import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { courseWatchedPercent } from '@/lib/progress';
import { courseSlugsForProductSlug } from '@/lib/products';

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
        if (order.refundStatus === 'REFUNDED') return NextResponse.json({ error: 'This order has already been refunded' }, { status: 409 });

        // One active request per order (audit #9/#10).
        const existing = await db.collection('refundRequests')
            .where('orderId', '==', orderId).where('status', 'in', ['pending', 'approved']).limit(1).get();
        if (!existing.empty) return NextResponse.json({ error: 'A refund request for this order is already active' }, { status: 409 });

        // The refundable course set comes from the ORDER's product —
        // never from the client (audit #9). A client-supplied courseSlug
        // outside that set is rejected.
        const courseSet = await courseSlugsForProductSlug(order.productSlug);
        let slug = '';
        if (courseSet.length) {
            if (courseSlug && !courseSet.includes(courseSlug)) {
                return NextResponse.json({ error: 'Course does not belong to this order' }, { status: 400 });
            }
            slug = courseSlug || courseSet[0];
        } else {
            // Legacy package order (no catalog product): keep prior behaviour.
            slug = courseSlug || order.productSlug || '';
        }

        // The most-watched course in the set governs eligibility.
        const watchedSet = courseSet.length ? courseSet : (slug ? [slug] : []);
        let watchedPct = 0;
        for (const s of watchedSet) {
            watchedPct = Math.max(watchedPct, await courseWatchedPercent(session.user.id, s));
        }
        const ageHours = (Date.now() - new Date(order.updatedAt || order.createdAt).getTime()) / 3600000;
        const within24h = ageHours <= 24;
        const reasons: string[] = [];
        if (!within24h) reasons.push('More than 24 hours have passed since purchase');
        if (watchedPct >= 20) reasons.push(`Course watched ${watchedPct}% (limit is under 20%)`);
        const eligible = reasons.length === 0;

        const ref = await db.collection('refundRequests').add({
            orderId, courseSlug: slug, courseSlugs: watchedSet, userId: session.user.id,
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
