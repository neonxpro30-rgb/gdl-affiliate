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

async function activateUser(email) {
    console.log(`Checking user: ${email}`);
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
        console.log('User not found!');
        return;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    console.log('Current Status:', userData.isActive);

    await usersRef.doc(userDoc.id).update({
        isActive: true
    });

    console.log(`User ${email} activated successfully!`);
}

activateUser('neonxpro30@gmail.com');
