import { db } from '@/lib/firebaseAdmin';

// Course watched % used by refund eligibility (audit #10): computed
// against ALL lessons of the course — a lesson the student never opened
// counts as 0 watched, so starting many lessons and finishing one can
// no longer dilute the percentage. Per-lesson percent uses the lesson
// durations from the course's lessons subcollection and the
// watchedSeconds recorded in the progress docs, averaged over the full
// lesson set.
export async function courseWatchedPercent(userId: string, courseSlug: string): Promise<number> {
    if (!courseSlug || !userId) return 0;
    try {
        const progressSnap = await db.collection('progress')
            .where('userId', '==', userId).where('courseSlug', '==', courseSlug).get();
        const progressByLesson = new Map<string, any>();
        for (const d of progressSnap.docs) {
            const data = d.data() as any;
            if (data.lessonId) progressByLesson.set(data.lessonId, data);
        }

        const lessons = await resolveCourseLessons(courseSlug);
        if (lessons && lessons.length) {
            let total = 0;
            for (const lesson of lessons) {
                const prog = progressByLesson.get(lesson.id);
                const watched = Number(prog?.watchedSeconds) || 0;
                if (lesson.durationSec > 0) {
                    total += Math.min(100, (watched / lesson.durationSec) * 100);
                } else {
                    // No authoritative duration — trust the stored percent.
                    total += Number(prog?.percent) || 0;
                }
            }
            return Math.round((total / lessons.length) * 10) / 10;
        }

        // Fallback: course/lessons can't be resolved — average the
        // progress docs that exist (previous behaviour).
        if (progressSnap.empty) return 0;
        const total = progressSnap.docs.reduce((s, d) => s + (Number((d.data() as any).percent) || 0), 0);
        return Math.round((total / progressSnap.size) * 10) / 10;
    } catch {
        return 0;
    }
}

// The course doc for a product slug + its lessons (id + durationSec).
// Returns null when the course or its lessons can't be resolved.
async function resolveCourseLessons(courseSlug: string): Promise<{ id: string; durationSec: number }[] | null> {
    try {
        const courseSnap = await db.collection('courses').where('productSlug', '==', courseSlug).limit(1).get();
        if (courseSnap.empty) return null;
        const courseDoc = courseSnap.docs[0];
        const lessonsSnap = await db.collection('courses').doc(courseDoc.id).collection('lessons').get();
        if (lessonsSnap.empty) return null;
        return lessonsSnap.docs.map(d => ({
            id: d.id,
            durationSec: Number((d.data() as any).durationSec) || 0,
        }));
    } catch {
        return null;
    }
}
