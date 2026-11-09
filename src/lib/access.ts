import { db } from '@/lib/firebaseAdmin';
import { unlockingSlugsForCourse } from '@/lib/products';

// Entitlements: which NEW products a user owns (SUCCESS orders carrying a
// productSlug). Legacy package orders keep working through the existing
// package/course screens untouched — this helper only covers the new
// catalog. A legacy packageId sitting in the productSlug slot is ignored.

export async function getOwnedProductSlugs(userId: string): Promise<Set<string>> {
    const owned = new Set<string>();
    if (!userId) return owned;
    try {
        const snap = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'SUCCESS')
            .get();
        // Skip refunded orders instead of deleting their slug afterwards:
        // with delete-after-add, a refunded order processed AFTER a paid
        // order for the same product removed access the student paid for.
        for (const doc of snap.docs) {
            const data = doc.data() as any;
            if (data.refundStatus === 'REFUNDED') continue;
            if (data.productSlug) owned.add(data.productSlug);
        }
        // The ₹19 demo IS the old Silicon package (same product, new name):
        // legacy Silicon-tier buyers own the demo too.
        if (!owned.has('demo')) {
            const { price } = await getLegacyTopPackage(userId);
            if (price >= 19) owned.add('demo');
        }
    } catch { /* mock DB etc. */ }
    return owned;
}

export async function userOwnsProduct(userId: string, slug: string): Promise<boolean> {
    const owned = await getOwnedProductSlugs(userId);
    if (owned.has(slug)) return true;
    if (owned.has('bundle-all')) {
        // bundle includes all courses + extensions
        return slug !== 'demo';
    }
    return false;
}

// Legacy package tier: the HIGHEST package the user has EVER bought
// (any SUCCESS order), never just the latest order — a later small order
// (e.g. the new ₹19 demo, which carries no packageId) must not re-lock
// packages bought earlier. Refunded orders don't count.
export async function getLegacyTopPackage(userId: string): Promise<{ price: number; packageId: string | null }> {
    let top = { price: 0, packageId: null as string | null };
    if (!userId) return top;
    try {
        const snap = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'SUCCESS')
            .get();
        for (const doc of snap.docs) {
            const order = doc.data() as any;
            if (order.refundStatus === 'REFUNDED') continue;
            if (order.packageId) {
                const pkgDoc = await db.collection('packages').doc(order.packageId).get();
                const price = Number(pkgDoc.data()?.price) || 0;
                if (price > top.price) top = { price, packageId: order.packageId };
            } else if (order.productSlug === 'demo') {
                // The ₹19 demo IS the old Silicon package (same product, new
                // name) — a demo purchase unlocks the legacy Silicon tier.
                if (19 > top.price) top = { price: 19, packageId: top.packageId };
            }
        }
    } catch { /* mock DB etc. */ }
    return top;
}

// Full course access (all lessons). Demo ownership gives lesson-1-only
// access to Course 01 — use hasLessonAccess for that distinction.
export async function hasFullCourseAccess(userId: string, courseSlug: string): Promise<boolean> {
    const owned = await getOwnedProductSlugs(userId);
    if (owned.has('bundle-all')) return true;
    return owned.has(courseSlug);
}

export async function hasLessonAccess(userId: string, courseSlug: string, lessonIndex: number): Promise<boolean> {
    if (await hasFullCourseAccess(userId, courseSlug)) return true;
    const owned = await getOwnedProductSlugs(userId);
    // Demo = first lesson of Course 01
    if (lessonIndex === 0 && unlockingSlugsForCourse(courseSlug).includes('demo') && owned.has('demo')) return true;
    return false;
}

// Passed a course's final test (certificate issued / attempt passed)
export async function hasPassedCourse(userId: string, courseSlug: string): Promise<boolean> {
    try {
        const snap = await db.collection('testAttempts')
            .where('userId', '==', userId)
            .where('courseSlug', '==', courseSlug)
            .where('status', '==', 'PASSED')
            .limit(1)
            .get();
        return !snap.empty;
    } catch {
        return false;
    }
}
