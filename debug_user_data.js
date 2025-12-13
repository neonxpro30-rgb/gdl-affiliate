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

async function debugUser(email) {
    console.log(`Debugging user: ${email}`);
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
        console.log('User not found!');
        return;
    }

    snapshot.forEach(doc => {
        console.log('User ID:', doc.id);
        console.log('Data:', JSON.stringify(doc.data(), null, 2));
    });
}

debugUser('neonxpro30@gmail.com');
