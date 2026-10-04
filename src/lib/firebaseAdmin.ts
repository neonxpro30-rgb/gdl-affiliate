import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    // Firebase credentials come from environment variables.
    // Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
    // in Vercel (production) and .env.local (local dev). Never hardcode keys.
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Credentials from env vars. Never hardcode keys.
    };

    const { projectId, clientEmail, privateKey } = serviceAccount;
    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
            storageBucket: `${projectId}.appspot.com`
        });
    } else {
        console.warn("Firebase env vars missing - skipping admin init (mock DB will be used, e.g. during build).");
    }
}

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

try {
    db = admin.firestore();
    storage = admin.storage();
} catch (error) {
    console.warn("Firebase not initialized. Using mock for build.");
    db = {
        collection: () => ({
            doc: () => ({
                get: async () => ({ exists: false, data: () => ({}) }),
                set: async () => { },
                update: async () => { },
                delete: async () => { },
            }),
            where: () => ({ get: async () => ({ empty: true, docs: [] }) }),
            get: async () => ({ empty: true, docs: [] }),
            add: async () => ({ id: 'mock-id' }),
        })
    } as any;
    storage = {
        bucket: () => ({
            file: () => ({
                save: async () => { },
                makePublic: async () => { },
                publicUrl: () => ''
            })
        })
    } as any;
}

export { db, storage };
