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

        // Never log the full callback (PII + payment fields) — ids/status only
        console.log('PayU Response:', { txnid: data.txnid, status: data.status, mihpayid: data.mihpayid });

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

        const orderData = orderDoc.data() as any;

        if (data.status === 'success') {
            // Reconcile the paid amount with the stored order BEFORE settling
            // (audit 2026-11-07, critical #3): a validly-signed callback for a
            // smaller amount must never settle a larger order.
            if (Number(data.amount) !== Number(orderData.amount)) {
                console.error('PayU amount mismatch for order:', orderId);
                return NextResponse.redirect(new URL('/payment/failure?error=AmountMismatch', req.url), 303);
            }
            // Replay of an already-settled order: no re-processing
            if (orderData.status === 'SUCCESS') {
                return NextResponse.redirect(new URL(`/dashboard?payment=success&orderId=${orderId}`, req.url), 303);
            }
            const { processSuccessfulPayment } = await import('@/lib/payment-processor');

            // Unified Processor handles: Order Update, User Activation, Commission, Emails
            await processSuccessfulPayment(orderId, data.mihpayid, data);

            // Use 303 status code (See Other) to properly redirect from POST to GET
            return NextResponse.redirect(new URL(`/dashboard?payment=success&orderId=${orderId}`, req.url), 303);
        } else {
            // A late failure callback must never regress a settled order
            if (orderData.status === 'PENDING') {
                await orderRef.update({
                    status: 'FAILED',
                    updatedAt: new Date().toISOString(),
                    paymentData: { status: data.status, mihpayid: data.mihpayid, error: data.error_Message || data.error || '' }
                });
            }
            return NextResponse.redirect(new URL('/payment/failure?error=TransactionFailed', req.url), 303);
        }

    } catch (error) {
        console.error('PayU Response Error:', error);
        return NextResponse.redirect(new URL('/payment/failure?error=ServerError', req.url), 303);
    }
}
