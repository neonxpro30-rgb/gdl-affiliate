import { db } from '@/lib/firebaseAdmin';
import { getSettings } from '@/lib/settings';
import { getProducts, type Product } from '@/lib/products';

// Extension licences: generated on purchase, tied to the buyer, with an
// activation limit (settings.activationLimit machines). The bundle
// auto-issues a licence for every extension product.

function makeKey(): string {
    // Cryptographically secure keys (audit 2026-11-07, medium #20):
    // Math.random() keys are predictable/enumerable.
    const seg = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const bytes = require('crypto').randomBytes(4);
        return Array.from(bytes, (b: number) => chars[b % chars.length]).join('');
    };
    return `LPX-${seg()}-${seg()}-${seg()}`;
}

// Deterministic licence doc id (audit #20): one licence per
// (user, product) pair, so issuance can use create-if-absent semantics
// instead of query-then-add — a replayed payment callback can never
// mint a second key for the same purchase.
function licenceDocId(userId: string, productSlug: string): string {
    return `${userId}_${productSlug}`;
}

export async function issueLicence(userId: string, product: Product, orderId: string): Promise<string | null> {
    if (product.type !== 'extension') return null;
    const settings = await getSettings();
    const ref = db.collection('licenses').doc(licenceDocId(userId, product.slug));

    const existing = await ref.get();
    if (existing.exists) return (existing.data() as any).key;

    // Back-compat: licences issued before the deterministic-id change
    // live under random Firestore ids. If one exists for this pair,
    // adopt it — backfill the deterministic doc with the same key so
    // the user never ends up with two valid keys for one purchase.
    const legacy = await db.collection('licenses')
        .where('userId', '==', userId).where('productSlug', '==', product.slug).limit(1).get();
    if (!legacy.empty) {
        const legacyData = legacy.docs[0].data() as any;
        try { await ref.create(legacyData); } catch { /* raced backfill — harmless */ }
        return legacyData.key;
    }

    const key = makeKey();
    try {
        await ref.create({
            key, userId, productSlug: product.slug, orderId,
            activations: [], limit: settings.activationLimit,
            status: 'active', createdAt: new Date().toISOString(),
        });
        return key;
    } catch (err: any) {
        // ALREADY_EXISTS: a concurrent issuance won the race — return
        // the key it created rather than minting another.
        const raced = await ref.get();
        if (raced.exists) return (raced.data() as any).key;
        throw err;
    }
}

export async function issueLicencesForOrder(userId: string, product: Product, orderId: string): Promise<string[]> {
    const keys: string[] = [];
    if (product.type === 'extension') {
        const k = await issueLicence(userId, product, orderId);
        if (k) keys.push(k);
    } else if (product.type === 'bundle') {
        const all = await getProducts();
        for (const ext of all.filter(p => p.type === 'extension')) {
            const k = await issueLicence(userId, ext, orderId);
            if (k) keys.push(k);
        }
    }
    return keys;
}

export async function activateLicence(key: string, machineId: string): Promise<{ ok: boolean; error?: string; activations?: number; limit?: number }> {
    if (!key || !machineId) return { ok: false, error: 'key and machineId are required' };
    const snap = await db.collection('licenses').where('key', '==', key.toUpperCase()).limit(1).get();
    if (snap.empty) return { ok: false, error: 'Licence key not found' };
    const ref = snap.docs[0].ref;

    // Limit check + append inside a transaction on the licence doc
    // (audit #20): two machines activating at the same moment can no
    // longer both pass the limit check and exceed it — Firestore
    // retries the transaction on contention and the loser re-reads the
    // updated activations list.
    return db.runTransaction(async (tx) => {
        const doc = await tx.get(ref);
        if (!doc.exists) return { ok: false, error: 'Licence key not found' };
        const data = doc.data() as any;
        if (data.status !== 'active') return { ok: false, error: 'Licence is not active' };
        const activations: any[] = data.activations || [];
        if (activations.some(a => a.machineId === machineId)) {
            return { ok: true, activations: activations.length, limit: data.limit };
        }
        if (activations.length >= (data.limit || 2)) {
            return { ok: false, error: `Activation limit reached (${data.limit} machines)` };
        }
        const next = [...activations, { machineId, at: new Date().toISOString() }];
        tx.update(ref, { activations: next, updatedAt: new Date().toISOString() });
        return { ok: true, activations: next.length, limit: data.limit };
    });
}

export async function getUserLicences(userId: string): Promise<any[]> {
    const snap = await db.collection('licenses').where('userId', '==', userId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
