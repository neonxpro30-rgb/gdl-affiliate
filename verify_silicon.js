
const admin = require('firebase-admin');

// Hardcoded credentials for local script execution
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

async function verifySiliconLogic() {
    console.log('--- STARTING SILICON PACKAGE VERIFICATION ---');

    // 1. Setup Test Data (In Memory, similar to what DB has)
    // Scenario: User B buys Silicon Package (19 Rs). Referred by User A.

    const soldPackage = { name: 'Silicon Package', price: 19 };
    const referrerData = { name: 'User A', referrerId: 'USER_ZERO' }; // User A has a referrer too

    console.log(`\nScenario:`);
    console.log(`- Sold Package: ${soldPackage.name}`);
    console.log(`- Price: ₹${soldPackage.price}`);
    console.log(`- Buyer: User B`);
    console.log(`- Referrer: User A`);

    // 2. Logic from src/app/api/payment/verify/route.ts
    let totalCommission = 0;

    if (soldPackage.name.includes('Silicon')) {
        // Fixed commission for Silicon (Exception)
        totalCommission = 17; // Direct: 17, Company: 2, Passive: 0
    } else {
        totalCommission = soldPackage.price * 0.80; // Standard logic
    }

    let passiveCommission = 0;
    let directCommission = totalCommission;

    if (referrerData.referrerId && !soldPackage.name.includes('Silicon')) {
        passiveCommission = totalCommission * 0.10;
        directCommission = totalCommission - passiveCommission;
    } else if (soldPackage.name.includes('Silicon')) {
        // Silicon: No Passive, All goes to Direct
        passiveCommission = 0;
        directCommission = totalCommission;
    }

    // 3. Admin Panel Logic (src/app/admin/page.tsx)
    const revenue = soldPackage.price;
    const commissionsPaid = directCommission + passiveCommission;
    const netProfit = revenue - commissionsPaid;

    // 4. Verification Check
    console.log(`\nResults:`);
    console.log(`- Total Commission: ₹${totalCommission}`);
    console.log(`- Direct Commission (to User A): ₹${directCommission}`);
    console.log(`- Passive Commission (to User Zero): ₹${passiveCommission}`);
    console.log(`- Company Net Profit: ₹${netProfit}`);

    console.log(`\nVerification:`);
    const isDirectCorrect = directCommission === 17;
    const isPassiveCorrect = passiveCommission === 0;
    const isProfitCorrect = netProfit === 2;

    console.log(`- [${isDirectCorrect ? 'PASS' : 'FAIL'}] Direct Commission should be 17: Got ${directCommission}`);
    console.log(`- [${isPassiveCorrect ? 'PASS' : 'FAIL'}] Passive Commission should be 0: Got ${passiveCommission}`);
    console.log(`- [${isProfitCorrect ? 'PASS' : 'FAIL'}] Company Profit should be 2: Got ${netProfit}`);

    if (isDirectCorrect && isPassiveCorrect && isProfitCorrect) {
        console.log('\n✅ ALL CHECKS PASSED!');
    } else {
        console.error('\n❌ SOME CHECKS FAILED!');
    }
}

verifySiliconLogic();
