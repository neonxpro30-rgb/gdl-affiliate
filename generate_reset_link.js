require('dotenv').config();
const admin = require('firebase-admin');
const crypto = require('crypto');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        })
    });
}

const db = admin.firestore();

async function generateLink() {
    const email = 'neonxpro30@gmail.com';
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
        console.log('User not found');
        return;
    }

    const userDoc = snapshot.docs[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await usersRef.doc(userDoc.id).update({
        resetToken,
        resetTokenExpiry
    });

    console.log(`RESET_LINK: http://localhost:3012/reset-password?token=${resetToken}&email=${email}`);
}

generateLink();
