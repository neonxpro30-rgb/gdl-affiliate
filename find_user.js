require('dotenv').config();
const admin = require('firebase-admin');

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

async function findUser() {
    const snapshot = await db.collection('users').get();
    let found = false;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.email === 'final@check.com') {
            console.log(`Found User: `);
            console.log(`- Name: ${data.name} `);
            console.log(`- Email: ${data.email} `);
            console.log(`- Role: ${data.role} `);
            console.log(`- IsActive: ${data.isActive} `);
            console.log(`- ID: ${doc.id} `);
            found = true;
        }
    });

    if (!found) {
        console.log('No user found with name "priyanshu".');
    }
}

findUser();
