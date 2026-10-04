import { db } from '@/lib/firebaseAdmin';

export async function processSuccessfulPayment(orderId: string, paymentId: string, paymentData: any = {}) {
    console.log(`Processing payment for Order: ${orderId}`);

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        throw new Error('Order not found');
    }

    const orderData = orderDoc.data();
    if (!orderData) throw new Error('Order data empty');

    // 1. Update Order Status
    await orderRef.update({
        status: 'SUCCESS',
        transactionId: paymentId,
        updatedAt: new Date().toISOString(),
        paymentData: paymentData
    });

    // 2. Activate User
    if (orderData.userId) {
        await db.collection('users').doc(orderData.userId).update({
            isActive: true,
            updatedAt: new Date().toISOString()
        });
    }

    // 3. Handle Commissions & Emails
    const userRef = db.collection('users').doc(orderData.userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (userData?.referrerId) {
        // Fetch Referrer (User B)
        const referrerRef = db.collection('users').doc(userData.referrerId);
        const referrerDoc = await referrerRef.get();
        const referrerData = referrerDoc.data();

        if (referrerData) {
            // Fetch Sold Package Details
            const packageRef = db.collection('packages').doc(orderData.packageId);
            const packageDoc = await packageRef.get();
            const soldPackage = packageDoc.data();
            const soldPackagePrice = soldPackage?.price || 0;
            const soldPackageName = soldPackage?.name || '';

            // Determine Commission Amount (single-tier only: direct commission, no passive/upline payouts)
            let directCommission = 0;
            let packageMismatch = false; // Flag for when referrer package < sold package
            let referrerPackageId: string | null = null; // Referrer's owned package (for pending tier tracking)
            let referrerPackageName = '';

            if (soldPackageName.includes('Silicon')) {
                // Fixed commission for Silicon (Exception)
                directCommission = 17;
            } else {
                // Fetch Referrer's Active Package Price
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

                // Base Amount logic - min of sold price and referrer's package price
                const baseAmount = Math.min(soldPackagePrice, referrerPackagePrice);

                // Check if there's a package mismatch (referrer package < sold package)
                if (referrerPackagePrice < soldPackagePrice) {
                    packageMismatch = true;
                }

                // Commission calculation (single-tier: direct only, no passive/upline)
                // If base amount is Silicon price (₹19), use fixed ₹17 commission
                if (baseAmount === 19) {
                    directCommission = 17;
                } else {
                    // 70% Direct commission of the commission-locked base amount
                    directCommission = baseAmount * 0.70;
                }
            }

            // Save Direct Referral (User B)
            if (directCommission > 0) {
                // Check if already exists to prevent duplicate commissions
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
                        packageMismatch: packageMismatch, // Flag: referrer package < sold package
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });

                    // --- Pending Commission (Upgrade Bonus) ---
                    // ADDITIVE ONLY: existing payout logic above is untouched.
                    // When the referrer sold a HIGHER package than they own,
                    // the commission difference is held in a pending bucket:
                    // claimable within 7 days via tier-matched upgrade.
                    // Unclaimed after 7 days: donated to children's education charity.
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

                    // Send Email to Mentor (User B)
                    if (referrerData.email && referrerData.name) {
                        const { sendSaleNotificationEmail } = await import('@/lib/email');
                        sendSaleNotificationEmail(referrerData.email, referrerData.name, userData.name || 'New Student', soldPackageName)
                            .catch(err => console.error("Mentor notification failed:", err));
                    }
                }
            }

            // NOTE: No passive/upline referral is created — single-tier referral policy.
            // (Removed 2026-10-04: 10% passive commission to upline discontinued.)
        }
    }

    // Send Welcome Email
    if (userData?.email && userData?.name) {
        const { sendWelcomeEmail } = await import('@/lib/email');
        sendWelcomeEmail(userData.email, userData.name).catch(err => console.error("Email send failed:", err));
    }

    // --- Upgrade Bonus check (non-blocking, observability only) ---
    // After any successful purchase, surface claimable pendings for the buyer.
    // Claimability itself is evaluated live by /api/user/pendings.
    if (orderData.userId) {
        import('@/lib/pendingCommission').then(async ({ getUserPendings }) => {
            try {
                const { pendings, currentTier } = await getUserPendings(orderData.userId);
                const claimable = pendings.filter(p => p.canClaim);
                if (claimable.length > 0) {
                    console.log(
                        `Upgrade Bonus: user ${orderData.userId} (tier ${currentTier}) can now claim ${claimable.length} pending(s) totaling ₹${claimable.reduce((s, p) => s + p.pendingAmount, 0)}`
                    );
                }
            } catch (err) {
                console.error('Pending check failed (non-blocking):', err);
            }
        }).catch(() => { /* ignore */ });
    }

    return { success: true };
}
