import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';

// READ-ONLY payment status check for the dashboard.
//
// SECURITY (audit 2026-11-07, critical #1): this endpoint previously called
// processSuccessfulPayment() for ANY caller who knew an order ID — free
// course activation without paying. Payment success is now established ONLY
// by the server-verified PayU callback (/api/payment/payu-response). This
// route never changes an order; it just reports the stored status to the
// order's owner.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ error: 'orderId required' }, { status: 400 });
        }

        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderDoc.data() as any;
        if (order.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({
            success: order.status === 'SUCCESS',
            status: order.status,
        });
    } catch (error) {
        console.error('Payment status check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
