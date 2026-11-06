import { db } from '@/lib/firebaseAdmin';
import { getSettings } from '@/lib/settings';
import { getProducts, type Product } from '@/lib/products';

// Extension licences: generated on purchase, tied to the buyer, with an
// activation limit (settings.activationLimit machines). The bundle
// auto-issues a licence for every extension product.

function makeKey(): string {
    const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X');
    return `LPX-${seg()}-${seg()}-${seg()}`;
}

export async function issueLicence(userId: string, product: Product, orderId: string): Promise<string | null> {
    if (product.type !== 'extension') return null;
    const settings = await getSettings();
    const existing = await db.collection('licenses')
        .where('userId', '==', userId).where('productSlug', '==', product.slug).limit(1).get();
    if (!existing.empty) return existing.docs[0].data().key;
    const key = makeKey();
    await db.collection('licenses').add({
        key, userId, productSlug: product.slug, orderId,
        activations: [], limit: settings.activationLimit,
        status: 'active', createdAt: new Date().toISOString(),
    });
    return key;
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
    const doc = snap.docs[0];
    const data = doc.data() as any;
    if (data.status !== 'active') return { ok: false, error: 'Licence is not active' };
    const activations: any[] = data.activations || [];
    if (activations.some(a => a.machineId === machineId)) {
        return { ok: true, activations: activations.length, limit: data.limit };
    }
    if (activations.length >= (data.limit || 2)) {
        return { ok: false, error: `Activation limit reached (${data.limit} machines)` };
    }
    activations.push({ machineId, at: new Date().toISOString() });
    await doc.ref.update({ activations, updatedAt: new Date().toISOString() });
    return { ok: true, activations: activations.length, limit: data.limit };
}

export async function getUserLicences(userId: string): Promise<any[]> {
    const snap = await db.collection('licenses').where('userId', '==', userId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
