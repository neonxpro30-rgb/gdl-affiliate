/**
 * Migration 001 — settings/main defaults + products seed (ADDITIVE ONLY)
 *
 * Creates `settings/main` and the `products` catalog docs ONLY where they
 * do not already exist. Never overwrites an existing doc, so prices or
 * settings Naksh later edits in the admin panel are safe.
 *
 * Default mode is --dry-run (reports counts only).
 * Usage:
 *   node scripts/migrations/001_settings_and_products.js            (dry-run)
 *   node scripts/migrations/001_settings_and_products.js --apply    (write)
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

const SETTINGS_DEFAULTS = {
    rates: { course: 0.30, partner: 0.40, extension: 0.18, demo: 0 },
    couponDiscountPct: 5,
    confirmAfterHours: 48,
    payout: { minAmount: 500, cadence: 'weekly' },
    tds: { pct: null, yearlyThreshold: null },
    test: { passMarkPct: 70, retakeCooldownHours: 24 },
    activationLimit: 2,
    cutoverAt: null,
    business: { legalName: 'LearnPeak', address: '', udyam: '', gst: '', supportEmail: '' },
    version: 1,
};

const PRODUCTS = [
    { slug: 'demo', title: 'Demo Lesson — Tape 01, Lesson 1', type: 'course', price: 19, active: true, visible: true, commissionRateOverride: 0, courseSlug: 'reel-trailer-starter', order: 0 },
    { slug: 'reel-trailer-starter', title: '01 · Reel & Trailer Starter', type: 'course', price: 1299, active: true, visible: true, order: 1 },
    { slug: 'emotional-reels', title: '02 · Emotional Reels', type: 'course', price: 1799, active: true, visible: true, order: 2 },
    { slug: 'pro-wedding-trailer', title: '03 · Pro Wedding Trailer', type: 'course', price: 3999, active: true, visible: true, order: 3 },
    { slug: 'meta-ads-photographers', title: '04 · Meta Ads for Photographers', type: 'course', price: 2499, active: true, visible: true, order: 4 },
    { slug: 'bundle-all', title: 'The Bundle — All 4 Courses + Extensions', type: 'bundle', price: 6999, active: true, visible: true, includes: ['reel-trailer-starter', 'emotional-reels', 'pro-wedding-trailer', 'meta-ads-photographers'], order: 5 },
    { slug: 'ext-beat-marker', title: 'Beat Marker', type: 'extension', price: 0, active: false, visible: false, version: '1.0.0', premiereVersions: ['2024', '2025'], fileRef: '', order: 11 },
    { slug: 'ext-sfx-drawer', title: 'SFX Drawer', type: 'extension', price: 0, active: false, visible: false, version: '1.0.0', premiereVersions: ['2024', '2025'], fileRef: '', order: 12 },
    { slug: 'ext-reel-safe-zones', title: 'Reel Safe Zones', type: 'extension', price: 0, active: false, visible: false, version: '1.0.0', premiereVersions: ['2024', '2025'], fileRef: '', order: 13 },
];

async function main() {
    const db = admin.firestore();
    let wouldCreate = 0, exists = 0, created = 0;

    const settingsRef = db.collection('settings').doc('main');
    const settingsSnap = await settingsRef.get();
    if (settingsSnap.exists) { exists++; console.log('settings/main — exists, untouched'); }
    else {
        wouldCreate++;
        if (APPLY) { await settingsRef.set(SETTINGS_DEFAULTS); created++; console.log('settings/main — CREATED'); }
        else console.log('settings/main — would create');
    }

    for (const product of PRODUCTS) {
        const ref = db.collection('products').doc(product.slug);
        const snap = await ref.get();
        if (snap.exists) { exists++; console.log(`products/${product.slug} — exists, untouched`); }
        else {
            wouldCreate++;
            if (APPLY) { await ref.set(product); created++; console.log(`products/${product.slug} — CREATED`); }
            else console.log(`products/${product.slug} — would create`);
        }
    }

    console.log(`\n[001] mode=${APPLY ? 'APPLY' : 'DRY-RUN'} existing=${exists} wouldCreate=${wouldCreate} created=${created}`);
}

init();
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
