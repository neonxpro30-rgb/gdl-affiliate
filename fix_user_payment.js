const admin = require('firebase-admin');

if (!admin.apps.length) {
    const serviceAccount = {
        projectId: "gdl-database-b32f4",
        clientEmail: "firebase-adminsdk-fbsvc@gdl-database-b32f4.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3E5FOG61GzqL+\nCXA1fxn6Rzez40HJNNqkOCB67/sPjUPTMDtzWd8zTF/FC1RzDzctb/CyHg+LLvbQ\ngU0xycPGgUSbFtRIFkn93Vo8cr4uLaRKNTcqIMpJMlUytefwlU8e3adsF5/9klv0\ntIvnVLmMF+D7wsVxGK4ewEonyVjEKVU4oj7+vxJ3g50YG6ki8ekUZfMkYrORL/tO\n49PINHVresP1vKIjL0U9YcY99UV0bRsMk2DtX7Qtt0iPh0K326ZDhi7oxeGqXs3e\nnpFujN8eHTuLe75Op0EzA10//0cUxfZUPxIndw8hZHCdAQIv58bf+D6oparoxc9O\nwXKCA71vAgMBAAECggEASjDRVTxtE4FA1z7+7IcGAYFj5u/lJINZSWx/aSKgdPRz\n9H0a0ousoo7ETsdhIUGcxDqVabE57lcJaYTEwjT4NBUFtu3g+BekQ4809sMvI+qW\nJgZ7xQRFxbTyhtrl0/7F8gW0R98pFGr//eI+we/5Q3cX0x7iwYrVYRve0VHMua0w\nK+9wA9+1jKX17aq8f3f2Qcqeh9niqxfYpLkLuYceQ43PNwRX3jHEenZu8/DXhBPQ\nlVoRM6AKM1B4sPsGFL7Gu6DJQZI57x54+sQqa3Wx8ef+MJkzvVEfS0G9/7IStt4q\nhpxZltGZGHRutgpIZxfT6XFq9rZP3qSdffscDvJQ9QKBgQDtM0kGKUQUXYWAWaW8\n/QWAZAW9NUNnctm8etij3/vZM2UlefIXmX73cZT74uPHblwhnF+Sl+TlsiHLvsCU\na+RTTx938mwGu7QCPXRXkfhU48CjNY4iJBjTWmKESFJqFWE56UfVYFWc2OzJ9mcr\n3eLWJm2FNTFzYG6rCh7LE8hjowKBgQDFliBxgQU/Nc+bkvK6WIPBTHtymlPyJvV8\nYgaasDb0TegbAMu0KzM65/OpMs2Pp4XYzbM+drQPRzaK2bvK+uhQ8OgoxcPqBhdQ\n9wOhGF2aUwTkjlKf4In/tMov6aoECpcovoJQLz7do1W79VGVQzJsIHDfjZexXcxi\nsxpwUE27xQKBgQDgOogAlAfwfIwUTiq4IjQOL/+g4nYKl+6vFy4ulDFfHQ+zwriR\niKAWyD9/cffDclcTyuAqEv7mCGOcWIFyjR+1hWmJGRj3sH81UuTlV276yKY1Yw4u\nxhLV0W6qADgwYm+bsCQg2MV11TbaoNzdAg9KQ99qemN53yIe/B0p+lSHowKBgDwW\nLYOW8tuIJ7xt8bbNmDO+aIQvfnvTcTAEN3HvSKb+0ij0Ev6VbJzrUOQReQXIsiF+\nXJYQTy2eQG31TPCrYN7MhC1yBuQyOgD7PXVODZkSyhgfV+0awZyrhBkR/AwClHll\nhgeQdpO8SiRAtDCqILlVHD4/tvPPTIpvYQjqwtjpAoGASC4s0M6fE7eQCRqyLQJg\nXSvtRU5jv5ByvyGKSXomdmc/JXE/6uVGjWy4KEFije4hdZzruoI/MXd9cI+Z3SRV\nPtgvqiqejJpUOvSEht4y/DyPqIfHRRyl+/EJDsQiCylmkhPO8PzWY/MoFwHDshtW\n/stYoNLogU0fvlIshRyyHyA=\n-----END PRIVATE KEY-----\n"
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

// Usage: node fix_user_payment.js <user_email>
const email = process.argv[2];

if (!email) {
    console.log('Usage: node fix_user_payment.js <user_email>');
    console.log('Example: node fix_user_payment.js test@gmail.com');
    process.exit(1);
}

async function fixUserPayment(email) {
    console.log(`\n--- Fixing Payment for: ${email} ---\n`);

    // 1. Find User
    const usersSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

    if (usersSnapshot.empty) {
        console.log('❌ User not found with email:', email);
        process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log('User:', userData.name);
    console.log('ID:', userId);
    console.log('Current Status:', userData.isActive ? 'Active' : 'Inactive');

    // 2. Find their PENDING order
    const ordersSnapshot = await db.collection('orders')
        .where('userId', '==', userId)
        .where('status', '==', 'PENDING')
        .limit(1)
        .get();

    if (ordersSnapshot.empty) {
        console.log('\n⚠️ No PENDING orders found. Checking if already fixed...');

        const successOrders = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'SUCCESS')
            .get();

        if (!successOrders.empty) {
            console.log('✅ User already has SUCCESS order');

            if (!userData.isActive) {
                console.log('Activating user...');
                await db.collection('users').doc(userId).update({ isActive: true });
                console.log('✅ User activated!');
            }
        } else {
            console.log('❌ No orders found for this user');
        }
        process.exit(0);
    }

    const orderDoc = ordersSnapshot.docs[0];
    const orderId = orderDoc.id;
    const orderData = orderDoc.data();

    console.log('\nOrder ID:', orderId);
    console.log('Amount:', orderData.amount);
    console.log('Package ID:', orderData.packageId);

    // 3. Update Order to SUCCESS
    console.log('\n1. Updating order to SUCCESS...');
    await db.collection('orders').doc(orderId).update({
        status: 'SUCCESS',
        transactionId: 'manual_fix_' + Date.now(),
        updatedAt: new Date().toISOString(),
        paymentData: {
            method: 'payu',
            fixedManually: true,
            reason: 'HTTP 405 error during PayU callback',
            date: new Date().toISOString()
        }
    });
    console.log('   ✅ Done');

    // 4. Activate User
    console.log('2. Activating user...');
    await db.collection('users').doc(userId).update({
        isActive: true,
        packageId: orderData.packageId,
        updatedAt: new Date().toISOString()
    });
    console.log('   ✅ Done');

    // 5. Create Commission if referrer exists
    console.log('3. Checking referrer...');
    if (userData.referrerId) {
        console.log('   Referrer found:', userData.referrerId);

        // Check if commission already exists
        const existingRef = await db.collection('referrals')
            .where('referredUserId', '==', userId)
            .where('type', '==', 'DIRECT')
            .limit(1)
            .get();

        if (existingRef.empty) {
            // Get package price for commission calculation
            let commission = 17; // Default Silicon

            if (orderData.amount === 799) commission = 559; // Silver 70%
            else if (orderData.amount === 1299) commission = 909; // Gold 70%
            else if (orderData.amount === 3899) commission = 2729; // Diamond 70%

            console.log(`   Creating ₹${commission} commission...`);
            await db.collection('referrals').add({
                referrerId: userData.referrerId,
                referredUserId: userId,
                amount: commission,
                type: 'DIRECT',
                status: 'PENDING',
                packageMismatch: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                notes: 'Backfilled - Payment fixed after HTTP 405 error'
            });
            console.log('   ✅ Commission created');
        } else {
            console.log('   ⚠️ Commission already exists');
        }
    } else {
        console.log('   No referrer');
    }

    console.log('\n✅ Done! User can now login.\n');
    process.exit(0);
}

fixUserPayment(email).catch(console.error);
