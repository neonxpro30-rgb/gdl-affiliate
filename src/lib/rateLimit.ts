import { db } from '@/lib/firebaseAdmin';

// Firestore-backed fixed-window rate limiter (audit #25).
// One doc per key in the 'rateLimits' collection: { count, windowStart }.
// The counter is incremented inside a transaction so concurrent
// requests can't slip past the limit together.
//
// FAIL OPEN by design: any limiter error (Firestore hiccup, mock DB
// during build) returns "allowed" — rate limiting must never take the
// site down.

export function clientIp(req: Request): string {
    const xff = req.headers.get('x-forwarded-for') || '';
    return xff.split(',')[0].trim() || 'unknown';
}

function docIdFor(key: string): string {
    // Firestore doc ids can't contain '/'; keep keys human-readable.
    return key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 400);
}

/**
 * Returns true if the request is allowed, false if the limit for this
 * key within the current window has been reached.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    try {
        const ref = db.collection('rateLimits').doc(docIdFor(key));
        const now = Date.now();
        return await db.runTransaction(async (tx) => {
            const doc = await tx.get(ref);
            const data = doc.data() as any;
            if (!data || !data.windowStart || now - Number(data.windowStart) >= windowMs) {
                tx.set(ref, { count: 1, windowStart: now, updatedAt: new Date(now).toISOString() });
                return true;
            }
            if ((Number(data.count) || 0) >= limit) return false;
            tx.update(ref, { count: (Number(data.count) || 0) + 1, updatedAt: new Date(now).toISOString() });
            return true;
        });
    } catch (err) {
        console.error('Rate limiter error (failing open):', err);
        return true;
    }
}
