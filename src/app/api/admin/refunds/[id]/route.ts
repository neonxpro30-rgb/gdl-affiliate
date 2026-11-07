import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';
import { reverseCommissionsForOrder } from '@/lib/commission';
import { courseSlugsForProductSlug } from '@/lib/products';

// Admin refund decision. Approving revalidates the request and order
// (audit #10), marks the order REFUNDED, reverses the affiliate
// commission, and revokes the licences and certificates the purchase
// granted. The money movement itself happens in PayU — the admin
// completes the gateway refund and passes its reference
// (gatewayRefundRef) so it is stored on the record.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const { action, note, gatewayRefundRef } = await req.json();
        const ref = db.collection('refundRequests').doc(id);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        const request = doc.data() as any;

        if (action === 'approve') {
            // Revalidate first: a stale or double-submitted approval must
            // not refund twice or touch an already-refunded order.
            if (request.status !== 'pending') {
                return NextResponse.json({ error: `Request is already ${request.status}` }, { status: 409 });
            }
            const orderRef = db.collection('orders').doc(request.orderId);
            const orderDoc = await orderRef.get();
            if (!orderDoc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            const order = orderDoc.data() as any;
            if (order.status !== 'SUCCESS' || order.refundStatus === 'REFUNDED') {
                return NextResponse.json({ error: 'Order is no longer refundable' }, { status: 409 });
            }

            await orderRef.update({
                refundStatus: 'REFUNDED', refundedAt: new Date().toISOString(),
                gatewayRefundRef: gatewayRefundRef || null,
                updatedAt: new Date().toISOString(),
            });
            const reversed = await reverseCommissionsForOrder(request.orderId, 'refund approved');

            // Revoke licences issued for this order.
            let licencesRevoked = 0;
            const licSnap = await db.collection('licenses').where('orderId', '==', request.orderId).get();
            for (const lic of licSnap.docs) {
                if ((lic.data() as any).status !== 'revoked') {
                    await lic.ref.update({ status: 'revoked', revokedAt: new Date().toISOString(), revokeReason: 'order refunded' });
                    licencesRevoked++;
                }
            }

            // Revoke certificates for the courses this order covered.
            const courseSet = (request.courseSlugs && request.courseSlugs.length)
                ? request.courseSlugs
                : await courseSlugsForProductSlug(order.productSlug);
            let certificatesRevoked = 0;
            if (courseSet.length) {
                const certSnap = await db.collection('certificates').where('userId', '==', order.userId).get();
                for (const cert of certSnap.docs) {
                    const data = cert.data() as any;
                    if (courseSet.includes(data.courseSlug) && data.status === 'valid') {
                        await cert.ref.update({ status: 'revoked', revokedAt: new Date().toISOString(), revokeReason: 'order refunded' });
                        certificatesRevoked++;
                    }
                }
            }

            await ref.update({
                status: 'approved', processedAt: new Date().toISOString(), adminNote: note || '',
                gatewayRefundRef: gatewayRefundRef || null,
                commissionsReversed: reversed, licencesRevoked, certificatesRevoked,
            });
            return NextResponse.json({ ok: true, commissionsReversed: reversed, licencesRevoked, certificatesRevoked });
        }
        if (action === 'reject') {
            await ref.update({ status: 'rejected', processedAt: new Date().toISOString(), adminNote: note || '' });
            return NextResponse.json({ ok: true });
        }
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin refund error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
