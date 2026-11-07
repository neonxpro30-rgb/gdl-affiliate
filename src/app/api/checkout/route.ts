import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';
import { getProduct } from '@/lib/products';
import { resolveCoupon } from '@/lib/commission';

// Creates an order for a NEW catalog product (products collection).
// Legacy package purchases keep flowing through signup / user upgrade.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { productSlug, couponCode } = await req.json();
        const product = await getProduct(productSlug);
        if (!product || !product.active) {
            return NextResponse.json({ error: 'Product not available' }, { status: 404 });
        }

        const userDoc = await db.collection('users').doc(session.user.id).get();
        const user = userDoc.data() as any;

        let amount = product.price;
        let affiliateId: string | null = null;
        let appliedCoupon: string | null = null;

        if (couponCode) {
            const resolved = await resolveCoupon(String(couponCode));
            if (resolved && resolved.affiliateId !== session.user.id) {
                affiliateId = resolved.affiliateId;
                appliedCoupon = String(couponCode).toUpperCase();
                amount = Math.round(amount * (1 - resolved.discountPct / 100) * 100) / 100;
            }
        }
        if (!affiliateId && user?.referrerId) affiliateId = user.referrerId;

        const orderRef = db.collection('orders').doc();
        const now = new Date().toISOString();
        await orderRef.set({
            userId: session.user.id,
            productSlug: product.slug,
            packageId: null,
            listAmount: product.price,
            amount,
            couponCode: appliedCoupon,
            affiliateId,
            status: 'PENDING',
            ip: req.headers.get('x-forwarded-for') || '',
            deviceId: req.headers.get('user-agent') || '',
            createdAt: now,
            updatedAt: now,
        });

        // Coupon usage is counted on successful payment, not here
        // (audit #29) — abandoned/failed checkouts must not burn uses.
        // See processSuccessfulPayment in src/lib/payment-processor.ts.

        return NextResponse.json({ orderId: orderRef.id, amount });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
