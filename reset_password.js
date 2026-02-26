const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
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

async function resetPassword(email, newPassword) {
    console.log(`Resetting password for: ${email}`);
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
        console.log('User not found!');
        return;
    }

    const docId = snapshot.docs[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usersRef.doc(docId).update({
        password: hashedPassword,
        updatedAt: new Date().toISOString()
    });

    console.log(`Password for ${email} has been reset to: ${newPassword}`);
}

resetPassword('neonxpro30@gmail.com', 'Priyanshu');
