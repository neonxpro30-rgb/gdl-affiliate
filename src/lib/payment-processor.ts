import { db } from '@/lib/firebaseAdmin';
import { getProduct, type Product } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import { createCommissionForOrder, type BuyerFingerprint } from '@/lib/commission';
import { issueLicencesForOrder } from '@/lib/licenses';

// Payment success processing.
// RELAUNCH (2026-11-07): orders carrying a productSlug use the NEW flat
// affiliate engine (30% / 40% partner / 15-20% extensions / 0% demo,
// single-tier, free to join — see src/lib/commission.ts). Legacy package
// orders keep the old 70% + Upgrade Bonus behaviour ONLY until the
// cutover timestamp in settings; after cutover they also use the flat
// engine and no new pendings are ever created.

export async function processSuccessfulPayment(orderId: string, paymentId: string, paymentData: any = {}) {
    console.log(`Processing payment for Order: ${orderId}`);

    const orderRef = db.collection('orders').doc(orderId);

    // Idempotency (audit 2026-11-07, high #11): an order that is already
    // SUCCESS is never re-processed — replayed/concurrent callbacks must not
    // double-issue commissions, licences or emails. The check-and-set runs
    // in ONE transaction: two callbacks arriving together could otherwise
    // both read PENDING and both process the order.
    // 1. Claim the order (PENDING/FAILED -> SUCCESS) atomically
    const nowIso = new Date().toISOString();
    const claimed = await db.runTransaction(async (tx) => {
        const doc = await tx.get(orderRef);
        if (!doc.exists) throw new Error('Order not found');
        const data: any = doc.data() || {};
        if (data.status === 'SUCCESS') return null;
        tx.update(orderRef, {
            status: 'SUCCESS',
            transactionId: paymentId,
            paidAt: nowIso,
            updatedAt: nowIso,
            paymentData: paymentData,
        });
        return { id: orderId, ...data } as any;
    });
    if (!claimed) {
        console.log(`Order ${orderId} already SUCCESS — skipping re-processing`);
        return;
    }
    const orderData: any = claimed;

    // 1b. Count the coupon use exactly once — here, on successful
    // payment (audit #29). This processor is idempotency-guarded above,
    // so replays never double-count. (Previously counted at PENDING
    // order creation in checkout, where abandoned orders burned uses.)
    if (orderData.couponCode) {
        try {
            const cSnap = await db.collection('coupons').where('code', '==', orderData.couponCode).limit(1).get();
            if (!cSnap.empty) {
                const c = cSnap.docs[0];
                await c.ref.update({ uses: (c.data().uses || 0) + 1 });
            }
        } catch (err) {
            console.error('Coupon use count failed (non-blocking):', err);
        }
    }

    // 2. Activate User
    if (orderData.userId) {
        await db.collection('users').doc(orderData.userId).update({
            isActive: true,
            updatedAt: new Date().toISOString(),
        });
    }

    const userDoc = await db.collection('users').doc(orderData.userId).get();
    const userData: any = userDoc.data() || {};

    const settings = await getSettings();
    const cutoverPassed = !!settings.cutoverAt && new Date(settings.cutoverAt).getTime() <= Date.now();

    // 3a. NEW catalog orders -> flat commission engine
    const product: Product | null = orderData.productSlug ? await getProduct(orderData.productSlug) : null;
    if (product) {
        // Extension licences (also auto-issued for the bundle)
        try {
            await issueLicencesForOrder(orderData.userId, product, orderId);
        } catch (err) {
            console.error('Licence issuance failed (non-blocking):', err);
        }

        const affiliateId = orderData.affiliateId || userData.referrerId || null;
        if (affiliateId) {
            const fingerprint: BuyerFingerprint = {
                ip: paymentData?.ip || orderData.ip || undefined,
                device: paymentData?.device || orderData.deviceId || undefined,
                paymentInstrumentHash: paymentData?.paymentInstrumentHash || undefined,
            };
            try {
                const result = await createCommissionForOrder({
                    order: orderData, buyer: userData, product,
                    affiliateId, couponCode: orderData.couponCode || null, fingerprint,
                });
                if (!result.created) console.log(`Commission not created for order ${orderId}: ${result.reason}`);
            } catch (err) {
                console.error('Commission creation failed (non-blocking):', err);
            }

            // Mentor/affiliate sale notification
            try {
                const affDoc = await db.collection('users').doc(affiliateId).get();
                const aff = affDoc.data() as any;
                if (aff?.email && aff?.name) {
                    const { sendSaleNotificationEmail } = await import('@/lib/email');
                    sendSaleNotificationEmail(aff.email, aff.name, userData.name || 'New Student', product.title)
                        .catch(err => console.error('Mentor notification failed:', err));
                }
            } catch { /* non-blocking */ }
        }
    } else if (!cutoverPassed) {
        // 3b. LEGACY package order BEFORE cutover -> old behaviour preserved
        await processLegacyCommission(orderData, userData);
    } else {
        // 3c. LEGACY package order AFTER cutover -> flat engine, no pendings
        const affiliateId = orderData.affiliateId || userData.referrerId || null;
        if (affiliateId && orderData.packageId) {
            const pkgDoc = await db.collection('packages').doc(orderData.packageId).get();
            const pkg = pkgDoc.data() as any;
            const pseudoProduct: Product = {
                slug: orderData.packageId,
                title: pkg?.name || 'Legacy package',
                type: 'course',
                price: Number(orderData.amount) || Number(pkg?.price) || 0,
                active: true, visible: false, commissionRateOverride: null,
            };
            try {
                await createCommissionForOrder({
                    order: orderData, buyer: userData, product: pseudoProduct,
                    affiliateId, couponCode: orderData.couponCode || null, fingerprint: {},
                });
            } catch (err) {
                console.error('Post-cutover legacy commission failed (non-blocking):', err);
            }
        }
    }

    // 4. Welcome Email
    if (userData?.email && userData?.name) {
        const { sendWelcomeEmail } = await import('@/lib/email');
        sendWelcomeEmail(userData.email, userData.name).catch(err => console.error('Email send failed:', err));
    }

    return { success: true };
}

// --- Legacy commission path (pre-cutover only): 70% direct + Upgrade
// Bonus pendings. Kept verbatim so sales before the cutover are settled
// exactly under the terms they were promised. ---
async function processLegacyCommission(orderData: any, userData: any) {
    if (!userData?.referrerId) return;

    const referrerRef = db.collection('users').doc(userData.referrerId);
    const referrerDoc = await referrerRef.get();
    const referrerData = referrerDoc.data();
    if (!referrerData) return;

    const packageRef = db.collection('packages').doc(orderData.packageId);
    const packageDoc = await packageRef.get();
    const soldPackage = packageDoc.data();
    const soldPackagePrice = soldPackage?.price || 0;
    const soldPackageName = soldPackage?.name || '';

    let directCommission = 0;
    let packageMismatch = false;
    let referrerPackageId: string | null = null;
    let referrerPackageName = '';

    if (soldPackageName.includes('Silicon')) {
        directCommission = 17;
    } else {
        const referrerOrdersSnapshot = await db.collection('orders')
            .where('userId', '==', userData.referrerId)
            .where('status', '==', 'SUCCESS')
            .get();

        let referrerPackagePrice = 0;
        if (!referrerOrdersSnapshot.empty) {
            const orders = referrerOrdersSnapshot.docs.map(doc => doc.data());
            orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const latestOrder = orders[0];
            if (latestOrder.packageId) {
                referrerPackageId = latestOrder.packageId;
                const rPkgDoc = await db.collection('packages').doc(latestOrder.packageId).get();
                referrerPackagePrice = rPkgDoc.data()?.price || 0;
                referrerPackageName = rPkgDoc.data()?.name || '';
            }
        }

        const baseAmount = Math.min(soldPackagePrice, referrerPackagePrice);
        if (referrerPackagePrice < soldPackagePrice) packageMismatch = true;
        if (baseAmount === 19) directCommission = 17;
        else directCommission = baseAmount * 0.70;
    }

    if (directCommission > 0) {
        const existingRef = await db.collection('referrals')
            .where('referredUserId', '==', orderData.userId)
            .where('type', '==', 'DIRECT')
            .limit(1)
            .get();

        if (existingRef.empty) {
            const newReferralRef = await db.collection('referrals').add({
                referrerId: userData.referrerId,
                referredUserId: orderData.userId,
                amount: directCommission,
                type: 'DIRECT',
                status: 'PENDING',
                packageMismatch,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            if (packageMismatch) {
                try {
                    const { createPendingForSale } = await import('@/lib/pendingCommission');
                    await createPendingForSale({
                        referrerId: userData.referrerId,
                        referralId: newReferralRef.id,
                        buyerUserId: orderData.userId,
                        soldPackageId: orderData.packageId,
                        soldPackageName,
                        soldPackagePrice,
                        ownedPackageIdAtSale: referrerPackageId,
                        ownedPackageNameAtSale: referrerPackageName,
                        directCommission,
                    });
                } catch (err) {
                    console.error('Pending creation failed (non-blocking):', err);
                }
            }

            if ((referrerData as any).email && (referrerData as any).name) {
                const { sendSaleNotificationEmail } = await import('@/lib/email');
                sendSaleNotificationEmail((referrerData as any).email, (referrerData as any).name, userData.name || 'New Student', soldPackageName)
                    .catch(err => console.error('Mentor notification failed:', err));
            }
        }
    }
}
