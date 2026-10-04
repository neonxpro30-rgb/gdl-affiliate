const admin = require('firebase-admin');
require('dotenv').config();

const courses = [
    { title: "Organic Affiliate Marketing Mastery", description: "Master the art of organic affiliate marketing.", videoLink: "https://youtu.be/placeholder" },
    { title: "Content Creation Mastery", description: "Learn how to create compelling content.", videoLink: "https://youtu.be/placeholder" },
    { title: "Video Creation Mastery Course", description: "Comprehensive guide to video creation.", videoLink: "https://youtu.be/placeholder" },
    { title: "Social Media Marketing", description: "Dominate social media marketing strategies.", videoLink: "https://youtu.be/placeholder" },
    { title: "Facebook Ads Mastery Course", description: "Expert level Facebook Ads training.", videoLink: "https://youtu.be/placeholder" },
    { title: "VN Mobile Editing", description: "Edit videos like a pro on your mobile with VN.", videoLink: "https://youtu.be/placeholder" },
    { title: "Instagram Domination", description: "Grow your Instagram brand and influence.", videoLink: "https://youtu.be/placeholder" }
];

async function seed() {
    if (!admin.apps.length) {
        // Credentials from environment variables (.env) - never hardcode keys.
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Credentials from env vars. Never hardcode keys.
        };

        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
            throw new Error("Missing Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (put them in .env)");
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();

    // 1. Delete Existing Silver Package Courses
    console.log("Deleting old Silver Package courses...");
    const existingSnapshot = await db.collection('courses').where('category', '==', 'Silver Package').get();

    if (!existingSnapshot.empty) {
        const deleteBatch = db.batch();
        existingSnapshot.docs.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
        console.log(`Deleted ${existingSnapshot.size} old courses.`);
    } else {
        console.log("No old courses found to delete.");
    }

    // 2. Add New Courses
    const batch = db.batch();
    const coursesRef = db.collection('courses');

    for (const course of courses) {
        const docRef = coursesRef.doc();
        batch.set(docRef, {
            ...course,
            category: "Silver Package",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    await batch.commit();
    console.log(`Successfully added ${courses.length} new courses to Silver Package.`);
}

seed().catch(console.error);
