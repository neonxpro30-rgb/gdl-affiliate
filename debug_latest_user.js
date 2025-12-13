
const admin = require('firebase-admin');

const serviceAccount = {
    projectId: "gdl-database-b32f4",
    clientEmail: "firebase-adminsdk-fbsvc@gdl-database-b32f4.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3E5FOG61GzqL+\nCXA1fxn6Rzez40HJNNqkOCB67/sPjUPTMDtzWd8zTF/FC1RzDzctb/CyHg+LLvbQ\ngU0xycPGgUSbFtRIFkn93Vo8cr4uLaRKNTcqIMpJMlUytefwlU8e3adsF5/9klv0\ntIvnVLmMF+D7wsVxGK4ewEonyVjEKVU4oj7+vxJ3g50YG6ki8ekUZfMkYrORL/tO\n49PINHVresP1vKIjL0U9YcY99UV0bRsMk2DtX7Qtt0iPh0K326ZDhi7oxeGqXs3e\nnpFujN8eHTuLe75Op0EzA10//0cUxfZUPxIndw8hZHCdAQIv58bf+D6oparoxc9O\nwXKCA71vAgMBAAECggEASjDRVTxtE4FA1z7+7IcGAYFj5u/lJINZSWx/aSKgdPRz\n9H0a0ousoo7ETsdhIUGcxDqVabE57lcJaYTEwjT4NBUFtu3g+BekQ4809sMvI+qW\nJgZ7xQRFxbTyhtrl0/7F8gW0R98pFGr//eI+we/5Q3cX0x7iwYrVYRve0VHMua0w\nK+9wA9+1jKX17aq8f3f2Qcqeh9niqxfYpLkLuYceQ43PNwRX3jHEenZu8/DXhBPQ\nlVoRM6AKM1B4sPsGFL7Gu6DJQZI57x54+sQqa3Wx8ef+MJkzvVEfS0G9/7IStt4q\nhpxZltGZGHRutgpIZxfT6XFq9rZP3qSdffscDvJQ9QKBgQDtM0kGKUQUXYWAWaW8\n/QWAZAW9NUNnctm8etij3/vZM2UlefIXmX73cZT74uPHblwhnF+Sl+TlsiHLvsCU\na+RTTx938mwGu7QCPXRXkfhU48CjNY4iJBjTWmKESFJqFWE56UfVYFWc2OzJ9mcr\n3eLWJm2FNTFzYG6rCh7LE8hjowKBgQDFliBxgQU/Nc+bkvK6WIPBTHtymlPyJvV8\nYgaasDb0TegbAMu0KzM65/OpMs2Pp4XYzbM+drQPRzaK2bvK+uhQ8OgoxcPqBhdQ\n9wOhGF2aUwTkjlKf4In/tMov6aoECpcovoJQLz7do1W79VGVQzJsIHDfjZexXcxi\nsxpwUE27xQKBgQDgOogAlAfwfIwUTiq4IjQOL/+g4nYKl+6vFy4ulDFfHQ+zwriR\niKAWyD9/cffDclcTyuAqEv7mCGOcWIFyjR+1hWmJGRj3sH81UuTlV276yKY1Yw4u\nxhLV0W6qADgwYm+bsCQg2MV11TbaoNzdAg9KQ99qemN53yIe/B0p+lSHowKBgDwW\nLYOW8tuIJ7xt8bbNmDO+aIQvfnvTcTAEN3HvSKb+0ij0Ev6VbJzrUOQReQXIsiF+\nXJYQTy2eQG31TPCrYN7MhC1yBuQyOgD7PXVODZkSyhgfV+0awZyrhBkR/AwClHll\nhgeQdpO8SiRAtDCqILlVHD4/tvPPTIpvYQjqwtjpAoGASC4s0M6fE7eQCRqyLQJg\nXSvtRU5jv5ByvyGKSXomdmc/JXE/6uVGjWy4KEFije4hdZzruoI/MXd9cI+Z3SRV\nPtgvqiqejJpUOvSEht4y/DyPqIfHRRyl+/EJDsQiCylmkhPO8PzWY/MoFwHDshtW\n/stYoNLogU0fvlIshRyyHyA=\n-----END PRIVATE KEY-----\n"
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function debugLatest() {
    console.log('Debugging Latest User/Order...');

    // 1. Fetch Latest User
    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestUser = users[0];
    if (!latestUser) {
        console.log('No users found.');
        return;
    }

    console.log(`\nLatest User:`);
    console.log(`- ID: ${latestUser.id}`);
    console.log(`- Name: ${latestUser.name}`);
    console.log(`- Email: ${latestUser.email}`);
    console.log(`- Referrer ID: ${latestUser.referrerId || 'NONE (⚠️ No Referrer Linked!)'}`);
    console.log(`- Created At: ${latestUser.createdAt}`);

    // If referrer exists, fetch details
    if (latestUser.referrerId) {
        const refDoc = await db.collection('users').doc(latestUser.referrerId).get();
        if (refDoc.exists) {
            console.log(`- Referrer Found: ${refDoc.data().name} (${refDoc.data().referralCode})`);
        } else {
            console.log(`- Referrer ID exists but Document NOT FOUND!`);
        }
    }

    // 2. Fetch Latest Order for this user
    const ordersSnap = await db.collection('orders')
        .where('userId', '==', latestUser.id)
        .get();

    if (ordersSnap.empty) {
        console.log(`\n⚠️ No orders found for this user.`);
    } else {
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latestOrder = orders[0];

        console.log(`\nLatest Order:`);
        console.log(`- ID: ${latestOrder.id}`);
        console.log(`- Status: ${latestOrder.status}`);
        console.log(`- Amount: ${latestOrder.amount}`);
        console.log(`- Package ID: ${latestOrder.packageId}`);
    }

    // 3. Fetch Referrals (Commissions) involving this user
    const referralsSnap = await db.collection('referrals')
        .where('referredUserId', '==', latestUser.id)
        .get();

    if (referralsSnap.empty) {
        console.log(`\n⚠️ No commissions (referrals) found for this user's purchase.`);
    } else {
        console.log(`\nCommissions Generated:`);
        referralsSnap.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- Type: ${data.type} | Amount: ${data.amount} | To: ${data.referrerId}`);
        });
    }
}

debugLatest();
