const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function createReferral() {
    try {
        console.log("Creating pending referral for neonxpro30@gmail.com...");

        // Get Referrer ID
        const usersSnapshot = await db.collection('users').where('email', '==', 'neonxpro30@gmail.com').get();
        if (usersSnapshot.empty) {
            console.log("Referrer not found!");
            return;
        }
        const referrerId = usersSnapshot.docs[0].id;

        // Create Dummy Referred User
        const refereeRef = await db.collection('users').add({
            name: 'Test Referee',
            email: `test_referee_${Date.now()}@example.com`,
            role: 'USER',
            createdAt: new Date().toISOString()
        });

        // Create Referral
        const referralRef = await db.collection('referrals').add({
            referrerId: referrerId,
            referredUserId: refereeRef.id,
            amount: 500,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        });

        console.log("Created Referral ID:", referralRef.id);

    } catch (error) {
        console.error("Error:", error);
    }
}

createReferral();
