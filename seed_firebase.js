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

async function seed() {
    const packages = [
        { name: 'Silver Package', price: 799, courses: ['Social Media Marketing', 'Affiliate Marketing Basics'] },
        { name: 'Gold Package', price: 1299, courses: ['Advanced Affiliate Marketing', 'Content Creation Mastery', 'Video Editing'] },
        { name: 'Diamond Package', price: 3899, courses: ['Facebook Ads', 'Google Ads', 'Public Speaking', 'Freelancing Mastery'] },
    ];

    for (const pkg of packages) {
        await db.collection('packages').add(pkg);
        console.log(`Added ${pkg.name}`);
    }

    console.log('Seeding complete.');
}

seed().catch(console.error);
