import { db } from '@/lib/firebaseAdmin';

// Average of per-lesson percents = the course watched % used by refunds.
export async function courseWatchedPercent(userId: string, courseSlug: string): Promise<number> {
    if (!courseSlug || !userId) return 0;
    try {
        const snap = await db.collection('progress')
            .where('userId', '==', userId).where('courseSlug', '==', courseSlug).get();
        if (snap.empty) return 0;
        const total = snap.docs.reduce((s, d) => s + (Number((d.data() as any).percent) || 0), 0);
        return Math.round((total / snap.size) * 10) / 10;
    } catch {
        return 0;
    }
}
