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
        for (const doc of snap.docs) {
            const data = doc.data() as any;
            if (data.productSlug) owned.add(data.productSlug);
            if (data.refundStatus === 'REFUNDED') {
                if (data.productSlug) owned.delete(data.productSlug);
            }
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
