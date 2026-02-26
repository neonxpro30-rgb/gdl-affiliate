const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function createTestOrder() {
    console.log('Creating Test Order...');

    // 1. Get or Create a Test User
    const userRef = await db.collection('users').add({
        name: 'Razorpay Test User',
        email: `razorpay_test_${Date.now()}@test.com`,
        role: 'USER',
        isActive: false,
        createdAt: new Date().toISOString()
    });
    console.log('Created Test User:', userRef.id);

    // 2. Create a Pending Order
    const orderRef = await db.collection('orders').add({
        userId: userRef.id,
        packageId: 'iNTdTLQDg9SEiiQgEBys', // Silver Package ID
        amount: 799,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        paymentData: {}
    });

    console.log('Created Pending Order:', orderRef.id);
    console.log(`Visit: http://localhost:3000/payment/${orderRef.id}`);
}

createTestOrder();
