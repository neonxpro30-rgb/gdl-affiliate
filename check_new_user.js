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

async function checkNewUser() {
    console.log('--- Finding New User: com test ---\n');

    // Find user by email
    const usersSnapshot = await db.collection('users')
        .where('email', '==', 'singhdefvansh990@gmail.com')
        .get();

    if (usersSnapshot.empty) {
        console.log('❌ User not found by email');
        process.exit(0);
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    console.log('=== User Details ===');
    console.log('User ID:', userDoc.id);
    console.log('Name:', userData.name);
    console.log('Email:', userData.email);
    console.log('Phone:', userData.phone);
    console.log('Referral Code:', userData.referralCode);
    console.log('Referrer ID:', userData.referrerId || '❌ NO REFERRER');
    console.log('Is Active:', userData.isActive);
    console.log('Created At:', userData.createdAt);

    // Check referrer details
    if (userData.referrerId) {
        const referrerDoc = await db.collection('users').doc(userData.referrerId).get();
        if (referrerDoc.exists) {
            const referrerData = referrerDoc.data();
            console.log('\n=== Referrer Details ===');
            console.log('Referrer Name:', referrerData.name);
            console.log('Referrer Code:', referrerData.referralCode);
        }
    }

    // Check order for this user
    console.log('\n=== Orders for this User ===');
    const ordersSnapshot = await db.collection('orders')
        .where('userId', '==', userDoc.id)
        .get();

    if (ordersSnapshot.empty) {
        console.log('❌ NO ORDERS FOUND');
    } else {
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            console.log('Order ID:', doc.id);
            console.log('   Amount:', order.amount);
            console.log('   Status:', order.status);
            console.log('   Package ID:', order.packageId);
            console.log('   Created At:', order.createdAt);
            console.log('   Payment Data:', JSON.stringify(order.paymentData, null, 2));
        });
    }

    // Check referrals for this user
    console.log('\n=== Commission for this Sale ===');
    const referralsSnapshot = await db.collection('referrals')
        .where('referredUserId', '==', userDoc.id)
        .get();

    if (referralsSnapshot.empty) {
        console.log('❌ NO COMMISSION ENTRY FOUND');
    } else {
        referralsSnapshot.forEach(doc => {
            const ref = doc.data();
            console.log('Referral ID:', doc.id);
            console.log('   Amount:', ref.amount);
            console.log('   Type:', ref.type);
            console.log('   Status:', ref.status);
            console.log('   Referrer ID:', ref.referrerId);
        });
    }

    process.exit(0);
}

checkNewUser().catch(console.error);
