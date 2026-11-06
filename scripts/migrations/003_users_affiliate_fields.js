/**
 * Migration 003 — additive affiliate fields on `users` (ADDITIVE ONLY)
 *
 * Adds default values ONLY where the field is missing:
 *   partnerTier: 'none', kyc: { status: 'none' }, fraudFlags: [], proPool: false
 * Existing values are never overwritten; no user data is deleted.
 *
 * Default mode is --dry-run (counts only).
 * Usage:
 *   node scripts/migrations/003_users_affiliate_fields.js           (dry-run)
 *   node scripts/migrations/003_users_affiliate_fields.js --apply   (write)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const admin = require('firebase-admin');

const APPLY = process.argv.includes('--apply');

function init() {
    if (admin.apps.length) return admin.app();
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (sa) return admin.initializeApp({ credential: admin.credential.cert(JSON.parse(sa)) });
    return admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
}

const DEFAULTS = { partnerTier: 'none', kyc: { status: 'none' }, fraudFlags: [], proPool: false };

async function main() {
    const db = admin.firestore();
    const snap = await db.collection('users').get();
    let needsUpdate = 0, upToDate = 0, updated = 0;
    const fieldCounts = { partnerTier: 0, kyc: 0, fraudFlags: 0, proPool: 0 };
    const batch = db.batch();

    for (const doc of snap.docs) {
        const data = doc.data();
        const patch = {};
        for (const [key, value] of Object.entries(DEFAULTS)) {
            if (data[key] === undefined) { patch[key] = value; fieldCounts[key]++; }
        }
        if (Object.keys(patch).length) {
            needsUpdate++;
            if (APPLY) { batch.update(doc.ref, patch); updated++; }
        } else upToDate++;
    }

    if (APPLY && updated) await batch.commit();
    console.log(`[003] mode=${APPLY ? 'APPLY' : 'DRY-RUN'} users=${snap.size} upToDate=${upToDate} wouldUpdate=${needsUpdate} updated=${updated} missingFields=${JSON.stringify(fieldCounts)}`);
}

init();
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
