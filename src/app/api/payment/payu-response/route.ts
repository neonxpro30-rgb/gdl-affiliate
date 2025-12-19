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
            // Use 303 status for POST to GET redirect
            return NextResponse.redirect(new URL('/payment/failure?error=InvalidHash', req.url), 303);
        }

        const orderId = data.txnid;
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            console.error('Order not found:', orderId);
            return NextResponse.redirect(new URL('/payment/failure?error=OrderNotFound', req.url), 303);
        }

        if (data.status === 'success') {
            const { processSuccessfulPayment } = await import('@/lib/payment-processor');

            // Unified Processor handles: Order Update, User Activation, Commission, Emails
            await processSuccessfulPayment(orderId, data.mihpayid, data);

            // Use 303 status code (See Other) to properly redirect from POST to GET
            return NextResponse.redirect(new URL(`/dashboard?payment=success&orderId=${orderId}`, req.url), 303);
        } else {
            await orderRef.update({
                status: 'FAILED',
                updatedAt: new Date().toISOString(),
                paymentData: data
            });
            return NextResponse.redirect(new URL('/payment/failure?error=TransactionFailed', req.url), 303);
        }

    } catch (error) {
        console.error('PayU Response Error:', error);
        return NextResponse.redirect(new URL('/payment/failure?error=ServerError', req.url), 303);
    }
}
