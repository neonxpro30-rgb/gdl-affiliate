import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
    // SECURITY: this endpoint marks orders SUCCESS without real payment.
    // Admin-only — used for testing. Never expose to regular users.
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const orderData = orderDoc.data();

        // Update Order
        await orderRef.update({
            status: 'SUCCESS',
            transactionId: `mock_razorpay_${Date.now()}`,
            updatedAt: new Date().toISOString(),
            paymentData: {
                method: 'mock_razorpay',
                amount: orderData?.amount,
                date: new Date().toISOString()
            }
        });

        // Process payment including user activation and commission calculation
        const { processSuccessfulPayment } = await import('@/lib/payment-processor');
        await processSuccessfulPayment(orderId, `mock_razorpay_${Date.now()}`, {
            method: 'mock_razorpay',
            amount: orderData?.amount,
            date: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Mock Payment Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
