import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyHash } from '@/lib/payu';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const data: any = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        console.log('PayU Response:', data);

        const isValidHash = verifyHash(data);
        if (!isValidHash) {
            console.error('Invalid Hash');
            return NextResponse.redirect(new URL('/payment/failure?error=InvalidHash', req.url));
        }

        const orderId = data.txnid;
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            console.error('Order not found:', orderId);
            return NextResponse.redirect(new URL('/payment/failure?error=OrderNotFound', req.url));
        }

        if (data.status === 'success') {
            const orderData = orderDoc.data();

            // Update Order
            await orderRef.update({
                status: 'SUCCESS',
                transactionId: data.mihpayid,
                updatedAt: new Date().toISOString(),
                paymentData: data
            });

            // Activate User
            if (orderData?.userId) {
                await db.collection('users').doc(orderData.userId).update({
                    isActive: true,
                    updatedAt: new Date().toISOString()
                });
            }

            // Commission logic removed to prevent duplication. Handled in /api/payment/verify

            return NextResponse.redirect(new URL(`/dashboard?payment=success&orderId=${orderId}`, req.url));
        } else {
            await orderRef.update({
                status: 'FAILED',
                updatedAt: new Date().toISOString(),
                paymentData: data
            });
            return NextResponse.redirect(new URL('/payment/failure?error=TransactionFailed', req.url));
        }

    } catch (error) {
        console.error('PayU Response Error:', error);
        return NextResponse.redirect(new URL('/payment/failure?error=ServerError', req.url));
    }
}
