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

async function createAdmin() {
    const email = 'Admin@gmail.com';
    const password = 'Admin@955';
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (!snapshot.empty) {
        console.log('Admin user already exists. Updating password and role...');
        const docId = snapshot.docs[0].id;
        await usersRef.doc(docId).update({
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            updatedAt: new Date().toISOString()
        });
    } else {
        console.log('Creating new Admin user...');
        await usersRef.add({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            referralCode: 'ADMIN001',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    console.log('Admin user ready: ' + email);
}

createAdmin().catch(console.error);
