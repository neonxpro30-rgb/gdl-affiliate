/**
 * Migration 002 — Upgrade Bonus settlement REPORT (REPORT ONLY, ALWAYS)
 *
 * Lists every pre-cutover pending in `pendings` and what would happen to
 * it under the old terms at settlement. This script NEVER writes — the
 * actual settlement runs later, supervised, per the relaunch plan:
 * pre-cutover bonuses are settled under the old terms or paid as normal
 * commission; they are never silently cancelled.
 *
 * Usage: node scripts/migrations/002_pendings_settlement_report.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const admin = require('firebase-admin');

function init() {
    if (admin.apps.length) return admin.app();
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (sa) return admin.initializeApp({ credential: admin.credential.cert(JSON.parse(sa)) });
    return admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
}

async function main() {
    const db = admin.firestore();
    const snap = await db.collection('pendings').get();
    const now = Date.now();
    const rows = [];
    let totalPending = 0, totalClaimableValue = 0, totalDonatedValue = 0, totalClaimed = 0;

    for (const doc of snap.docs) {
        const d = doc.data();
        const expired = d.expiresAt && new Date(d.expiresAt).getTime() <= now;
        const effective = d.status === 'PENDING' && expired ? 'DONATED' : d.status;
        const amount = Number(d.pendingAmount) || 0;
        rows.push({
            id: doc.id, referrerId: d.referrerId, soldPackage: d.soldPackageName,
            ownedPackage: d.ownedPackageName, amount,
            status: d.status, effectiveStatus: effective,
            claimTier: d.claimTierName || null, expiresAt: d.expiresAt || null,
            settlementNote: effective === 'PENDING'
                ? 'Pay as commission OR settle on tier-matched upgrade — decide supervised'
                : effective === 'DONATED' ? 'Already earmarked for charity under old terms'
                : effective === 'CLAIMED' ? 'Already settled' : 'Review manually',
        });
        if (effective === 'PENDING') { totalPending++; totalClaimableValue += amount; }
        if (effective === 'DONATED') totalDonatedValue += amount;
        if (effective === 'CLAIMED') totalClaimed += amount;
    }

    let charityTotal = 0;
    try {
        const charitySnap = await db.collection('charity_donations').get();
        charityTotal = charitySnap.docs.reduce((s, d) => s + (Number(d.data().amount) || 0), 0);
    } catch { /* collection may not exist */ }

    console.log(JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalPendingsDocs: snap.size,
        stillPendingCount: totalPending,
        stillPendingValue: Math.round(totalClaimableValue * 100) / 100,
        donatedValue: Math.round(totalDonatedValue * 100) / 100,
        claimedValue: Math.round(totalClaimed * 100) / 100,
        charityDonationsTotal: Math.round(charityTotal * 100) / 100,
        rows,
    }, null, 2));
    console.log('\n[002] REPORT ONLY — no writes were made.');
}

init();
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
