import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
    try {
        const { orderId, paymentId } = await req.json();

        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const orderData = orderDoc.data();

        // Update Order
        await orderRef.update({
            status: 'SUCCESS',
            transactionId: paymentId || 'TEST_TXN_' + Date.now(),
            updatedAt: new Date().toISOString(),
        });

        // Handle Commission
        const userRef = db.collection('users').doc(orderData?.userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (userData?.referrerId) {
            // 1. Fetch Referrer (User B)
            const referrerRef = db.collection('users').doc(userData.referrerId);
            const referrerDoc = await referrerRef.get();
            const referrerData = referrerDoc.data();

            if (referrerData) {
                // 2. Fetch Sold Package Details
                const packageRef = db.collection('packages').doc(orderData?.packageId);
                const packageDoc = await packageRef.get();
                const soldPackage = packageDoc.data();
                const soldPackagePrice = soldPackage?.price || 0;
                const soldPackageName = soldPackage?.name || '';

                // 3. Determine Commission Amount
                let totalCommission = 0;

                if (soldPackageName.includes('Silicon')) {
                    // Fixed commission for Silicon (Exception)
                    totalCommission = 17; // Direct: 17, Company: 2, Passive: 0
                } else {
                    // 4. Fetch Referrer's (User B) Active Package Price
                    const referrerOrdersSnapshot = await db.collection('orders')
                        .where('userId', '==', userData.referrerId)
                        .where('status', '==', 'SUCCESS')
                        .get();

                    let referrerPackagePrice = 0;
                    if (!referrerOrdersSnapshot.empty) {
                        const orders = referrerOrdersSnapshot.docs.map(doc => doc.data());
                        // Sort by date desc
                        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        const latestOrder = orders[0];

                        // Fetch that package's price
                        if (latestOrder.packageId) {
                            const rPkgDoc = await db.collection('packages').doc(latestOrder.packageId).get();
                            referrerPackagePrice = rPkgDoc.data()?.price || 0;
                        }
                    }

                    // 5. Calculate Base Amount: min(SoldPrice, OwnerPrice)
                    const baseAmount = Math.min(soldPackagePrice, referrerPackagePrice);

                    // 80% of Base Amount
                    totalCommission = baseAmount * 0.80;
                }

                // 6. Distribute Commission
                // Passive Share (User A) = 10% of Total Commission
                // Direct Share (User B) = Total Commission - Passive Share (effectively 90% of Total)

                let passiveCommission = 0;
                let directCommission = totalCommission;

                // Check if Referrer (User B) has a Referrer (User A)
                if (referrerData.referrerId && !soldPackageName.includes('Silicon')) {
                    passiveCommission = totalCommission * 0.10;
                    directCommission = totalCommission - passiveCommission;
                } else if (soldPackageName.includes('Silicon')) {
                    // Silicon: No Passive, All goes to Direct
                    passiveCommission = 0;
                    directCommission = totalCommission;
                }

                // 7. Save Direct Referral (User B)
                if (directCommission > 0) {
                    await db.collection('referrals').add({
                        referrerId: userData.referrerId, // User B
                        referredUserId: orderData?.userId, // User C (Buyer)
                        amount: directCommission,
                        type: 'DIRECT',
                        status: 'PENDING',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                }

                // 8. Save Passive Referral (User A)
                if (passiveCommission > 0 && referrerData.referrerId) {
                    await db.collection('referrals').add({
                        referrerId: referrerData.referrerId, // User A
                        sourceUserId: userData.referrerId, // User B (who made the sale)
                        referredUserId: orderData?.userId, // User C (Buyer)
                        amount: passiveCommission,
                        type: 'PASSIVE',
                        status: 'PENDING',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
