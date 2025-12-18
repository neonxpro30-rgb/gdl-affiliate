import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
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
