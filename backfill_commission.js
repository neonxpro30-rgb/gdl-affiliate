
const admin = require('firebase-admin');

// Hardcoded credentials 
const serviceAccount = {
    projectId: "gdl-database-b32f4",
    clientEmail: "firebase-adminsdk-fbsvc@gdl-database-b32f4.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3E5FOG61GzqL+\nCXA1fxn6Rzez40HJNNqkOCB67/sPjUPTMDtzWd8zTF/FC1RzDzctb/CyHg+LLvbQ\ngU0xycPGgUSbFtRIFkn93Vo8cr4uLaRKNTcqIMpJMlUytefwlU8e3adsF5/9klv0\ntIvnVLmMF+D7wsVxGK4ewEonyVjEKVU4oj7+vxJ3g50YG6ki8ekUZfMkYrORL/tO\n49PINHVresP1vKIjL0U9YcY99UV0bRsMk2DtX7Qtt0iPh0K326ZDhi7oxeGqXs3e\nnpFujN8eHTuLe75Op0EzA10//0cUxfZUPxIndw8hZHCdAQIv58bf+D6oparoxc9O\nwXKCA71vAgMBAAECggEASjDRVTxtE4FA1z7+7IcGAYFj5u/lJINZSWx/aSKgdPRz\n9H0a0ousoo7ETsdhIUGcxDqVabE57lcJaYTEwjT4NBUFtu3g+BekQ4809sMvI+qW\nJgZ7xQRFxbTyhtrl0/7F8gW0R98pFGr//eI+we/5Q3cX0x7iwYrVYRve0VHMua0w\nK+9wA9+1jKX17aq8f3f2Qcqeh9niqxfYpLkLuYceQ43PNwRX3jHEenZu8/DXhBPQ\nlVoRM6AKM1B4sPsGFL7Gu6DJQZI57x54+sQqa3Wx8ef+MJkzvVEfS0G9/7IStt4q\nhpxZltGZGHRutgpIZxfT6XFq9rZP3qSdffscDvJQ9QKBgQDtM0kGKUQUXYWAWaW8\n/QWAZAW9NUNnctm8etij3/vZM2UlefIXmX73cZT74uPHblwhnF+Sl+TlsiHLvsCU\na+RTTx938mwGu7QCPXRXkfhU48CjNY4iJBjTWmKESFJqFWE56UfVYFWc2OzJ9mcr\n3eLWJm2FNTFzYG6rCh7LE8hjowKBgQDFliBxgQU/Nc+bkvK6WIPBTHtymlPyJvV8\nYgaasDb0TegbAMu0KzM65/OpMs2Pp4XYzbM+drQPRzaK2bvK+uhQ8OgoxcPqBhdQ\n9wOhGF2aUwTkjlKf4In/tMov6aoECpcovoJQLz7do1W79VGVQzJsIHDfjZexXcxi\nsxpwUE27xQKBgQDgOogAlAfwfIwUTiq4IjQOL/+g4nYKl+6vFy4ulDFfHQ+zwriR\niKAWyD9/cffDclcTyuAqEv7mCGOcWIFyjR+1hWmJGRj3sH81UuTlV276yKY1Yw4u\nxhLV0W6qADgwYm+bsCQg2MV11TbaoNzdAg9KQ99qemN53yIe/B0p+lSHowKBgDwW\nLYOW8tuIJ7xt8bbNmDO+aIQvfnvTcTAEN3HvSKb+0ij0Ev6VbJzrUOQReQXIsiF+\nXJYQTy2eQG31TPCrYN7MhC1yBuQyOgD7PXVODZkSyhgfV+0awZyrhBkR/AwClHll\nhgeQdpO8SiRAtDCqILlVHD4/tvPPTIpvYQjqwtjpAoGASC4s0M6fE7eQCRqyLQJg\nXSvtRU5jv5ByvyGKSXomdmc/JXE/6uVGjWy4KEFije4hdZzruoI/MXd9cI+Z3SRV\nPtgvqiqejJpUOvSEht4y/DyPqIfHRRyl+/EJDsQiCylmkhPO8PzWY/MoFwHDshtW\n/stYoNLogU0fvlIshRyyHyA=\n-----END PRIVATE KEY-----\n"
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// THE RECENT ORDER ID WITH NO COMMISSION
const ORDER_ID = 'FLxKOA4ItDsfhhcIOOYC';

async function backfillCommission() {
    console.log(`Backfilling commission for order: ${ORDER_ID}`);

    const orderRef = db.collection('orders').doc(ORDER_ID);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        console.error('Order not found');
        return;
    }

    const orderData = orderDoc.data();
    console.log(`Processing Order for User: ${orderData.userId}, Amount: ${orderData.amount}`);

    const userRef = db.collection('users').doc(orderData.userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        console.error(`User ${orderData.userId} not found in DB!`);
        return;
    }
    const userData = userDoc.data();

    if (!userData || !userData.referrerId) {
        console.log('User has no referrer or data is empty. No commission needed.');
        return;
    }

    console.log(`Referrer Found: ${userData.referrerId}`);

    const referrerRef = db.collection('users').doc(userData.referrerId);
    const referrerDoc = await referrerRef.get();
    const referrerData = referrerDoc.data();

    if (!referrerData) {
        console.error('Referrer user not found in DB');
        return;
    }

    const packageRef = db.collection('packages').doc(orderData.packageId);
    const packageDoc = await packageRef.get();
    const soldPackage = packageDoc.data();
    const soldPackagePrice = soldPackage ? soldPackage.price : orderData.amount;
    const soldPackageName = soldPackage ? soldPackage.name : 'Unknown';

    console.log(`Sold Package: ${soldPackageName} | Price: ${soldPackagePrice}`);

    let totalCommission = 0;
    if (soldPackageName.includes('Silicon')) {
        totalCommission = 17;
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

            if (orders[0].packageId) {
                const rPkgDoc = await db.collection('packages').doc(orders[0].packageId).get();
                referrerPackagePrice = rPkgDoc.data() ? rPkgDoc.data().price : 0;
            }
        }
        console.log(`Referrer Package Price: ${referrerPackagePrice}`);

        const baseAmount = Math.min(soldPackagePrice, referrerPackagePrice);
        totalCommission = baseAmount * 0.80;
    }

    console.log(`Total Commission Calculated: ${totalCommission}`);

    let passiveCommission = 0;
    let directCommission = totalCommission;

    if (referrerData.referrerId && !soldPackageName.includes('Silicon')) {
        passiveCommission = totalCommission * 0.10;
        directCommission = totalCommission - passiveCommission;
    } else if (soldPackageName.includes('Silicon')) {
        passiveCommission = 0;
        directCommission = totalCommission;
    }

    console.log(`Direct: ${directCommission}, Passive: ${passiveCommission}`);

    // Save Direct
    if (directCommission > 0) {
        await db.collection('referrals').add({
            referrerId: userData.referrerId,
            referredUserId: orderData.userId,
            amount: directCommission,
            type: 'DIRECT',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orderId: ORDER_ID,
            packagePrice: soldPackagePrice
        });
        console.log('✅ Direct Commission Added');
    }

    // Save Passive
    if (passiveCommission > 0 && referrerData.referrerId) {
        await db.collection('referrals').add({
            referrerId: referrerData.referrerId,
            sourceUserId: userData.referrerId,
            referredUserId: orderData.userId,
            amount: passiveCommission,
            type: 'PASSIVE',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orderId: ORDER_ID,
            packagePrice: soldPackagePrice
        });
        console.log('✅ Passive Commission Added');
    }
}

backfillCommission();
