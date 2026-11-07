import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import ProgressTracker from "@/components/ProgressTracker";
import { hasFullCourseAccess, hasLessonAccess, getLegacyTopPackage } from "@/lib/access";
import { retitleCourses, userUnlocksCategory } from "@/lib/catalog-display";
import { Lock, ArrowLeft, PlayCircle, ListVideo, FlaskConical } from "lucide-react";
import Link from "next/link";
import crypto from "crypto";

// ─── Bunny.net Signed URL Generator (Server-side only) ───────────────────────
function generateBunnySignedUrl(videoId: string): string {
    const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY!;
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "627593";
    const expires = Math.floor(Date.now() / 1000) + 7200;
    const hashInput = tokenKey + videoId + expires;
    const token = crypto.createHash("sha256").update(hashInput).digest("hex");
    return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}&autoplay=false`;
}

function getEmbedUrl(url: string): string | null {
    if (!url) return null;

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
        const vimeoRegex = /(?:vimeo\.com\/(?:video\/|manage\/videos\/)?|player\.vimeo\.com\/video\/)([0-9]+)(?:\/([a-zA-Z0-9]+))?/;
        const match = url.match(vimeoRegex);
        if (match && match[1]) {
            const videoId = match[1];
            const hash = match[2];
            let embedSrc = `https://player.vimeo.com/video/${videoId}`;
            const queryParams = new URLSearchParams(url.split('?')[1] || '');
            if (hash) queryParams.set('h', hash);
            const queryString = queryParams.toString();
            if (queryString) embedSrc += `?${queryString}`;
            return embedSrc;
        }
    }

    // Gumlet — play.gumlet.io/embed/<id> URLs are iframe-ready; a bare
    // Gumlet video id is converted to the embed form.
    if (url.includes('gumlet')) {
        if (url.includes('play.gumlet.io') || url.includes('/embed/')) return url;
        const idMatch = url.match(/([a-zA-Z0-9]{16,})/);
        if (idMatch && !url.startsWith('http')) return `https://play.gumlet.io/embed/${idMatch[1]}`;
        return url;
    }

    // Bunny.net Stream — server-side signed URL
    if (url.includes('mediadelivery.net') || url.includes('b-cdn.net') || url.startsWith('bunny:')) {
        const uuidMatch = url.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        if (uuidMatch) return generateBunnySignedUrl(uuidMatch[1]);
        if (url.startsWith('bunny:')) {
            const parts = url.replace('bunny:', '').split('/');
            if (parts.length === 2) return generateBunnySignedUrl(parts[1]);
        }
    }

    return url;
}

interface Lesson {
    id: string;
    title: string;
    videoLink: string;
    durationSec: number;
    order: number;
}

export default async function CoursePlayerPage({ params, searchParams }: {
    params: Promise<{ courseId: string }>;
    searchParams: Promise<{ lesson?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');
    const userId = (session.user as any).id;

    const { courseId } = await params;
    const { lesson: lessonParam } = await searchParams;

    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) return <div>Course not found</div>;
    const course = { id: courseDoc.id, ...courseDoc.data() } as any;

    // Display title: legacy course docs keep their stored (old) titles in
    // the DB; the catalog-display mapping retitles them by curriculum
    // position within their category. Stored data is never changed.
    let displayCourseTitle: string = course.title;
    if (!course.productSlug && course.category) {
        try {
            const sibSnap = await db.collection('courses').where('category', '==', course.category).get();
            const siblings = sibSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
            const retitled = retitleCourses(String(course.category), siblings);
            displayCourseTitle = retitled.find(c => c.id === course.id)?.displayTitle ?? course.title;
        } catch { /* keep stored title */ }
    }

    // Lessons: subcollection first; a legacy course's single videoLink
    // becomes its Lesson 1 without any data migration.
    let lessons: Lesson[] = [];
    try {
        const lessonsSnap = await db.collection('courses').doc(courseId).collection('lessons').get();
        lessons = lessonsSnap.docs.map(d => {
            const data = d.data() as any;
            return {
                id: d.id,
                title: data.title || 'Lesson',
                videoLink: data.videoLink || '',
                durationSec: Number(data.durationSec) || 0,
                order: Number(data.order) || 0,
            };
        }).sort((a, b) => a.order - b.order);
    } catch { /* subcollection unsupported in mock */ }
    if (!lessons.length && course.videoLink) {
        lessons = [{ id: 'lesson-1', title: displayCourseTitle || 'Lesson 1', videoLink: course.videoLink, durationSec: 0, order: 0 }];
    }

    const isNewCourse = !!course.productSlug;

    // Legacy access for old package courses: the legacy price-tier rule,
    // OR ownership of the category's mapped new product / the bundle
    // (catalog-display mapping). Legacy buyers never lose access.
    let legacyUnlocked = false;
    if (!isNewCourse) {
        const { price: purchasedPackagePrice } = await getLegacyTopPackage(userId);
        legacyUnlocked = await userUnlocksCategory(userId, String(course.category || ''), purchasedPackagePrice);
    }

    const fullAccess = isNewCourse ? await hasFullCourseAccess(userId, course.productSlug) : legacyUnlocked;

    // Pick the requested lesson (first accessible one by default)
    let currentIdx = lessons.findIndex(l => l.id === lessonParam);
    if (currentIdx < 0) currentIdx = 0;
    const lessonAccess: boolean[] = [];
    for (let i = 0; i < lessons.length; i++) {
        lessonAccess.push(isNewCourse ? await hasLessonAccess(userId, course.productSlug, i) : legacyUnlocked);
    }
    if (!lessonAccess[currentIdx]) {
        const firstOpen = lessonAccess.findIndex(Boolean);
        if (firstOpen >= 0) currentIdx = firstOpen;
    }
    const currentLesson = lessons[currentIdx];
    const currentUnlocked = !!currentLesson && lessonAccess[currentIdx];

    if (!currentLesson || !currentUnlocked) {
        return (
            <div className="lpd-shell min-h-screen">
                <DashboardNavbar user={session.user} />
                <div className="max-w-7xl mx-auto p-8">
                    <div className="lpd-card max-w-lg mx-auto p-8 text-center">
                        <Lock className="w-16 h-16 mx-auto text-[#6B5F80] mb-4" />
                        <h1 className="lpd-display text-2xl font-bold text-[#1E1530]">Access Locked</h1>
                        <p className="text-[#6B5F80] mt-2">You do not have access to this course.</p>
                        <Link href="/dashboard/courses" className="lpd-btn lpd-btn-pink mt-5">Back to Courses</Link>
                    </div>
                </div>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(currentLesson.videoLink);

    return (
        <div className="lpd-shell min-h-screen">
            <DashboardNavbar user={session.user} />
            <ProgressTracker
                courseSlug={course.productSlug || course.id}
                lessonId={currentLesson.id}
                durationSec={currentLesson.durationSec}
            />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <Link href="/dashboard/courses" className="flex items-center text-[#6B5F80] hover:text-[#1E1530] mb-6 font-semibold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                </Link>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="lpd-card overflow-hidden">
                        <div className="aspect-video bg-[#1E1530] w-full relative">
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="autoplay; fullscreen; picture-in-picture; accelerometer; gyroscope"
                                    title={currentLesson.title}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <PlayCircle className="w-16 h-16 opacity-50" />
                                    <span className="ml-4">Video not available</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6 md:p-8">
                            <h1 className="lpd-display text-2xl md:text-3xl font-bold text-[#1E1530] mb-2">{displayCourseTitle}</h1>
                            <p className="text-sm font-semibold text-[#6B5F80] mb-4">
                                Lesson {currentIdx + 1}: {currentLesson.title}
                            </p>
                            <div className="prose max-w-none text-[#3B3150]">
                                <p>{course.description}</p>
                            </div>
                            {isNewCourse && fullAccess && (
                                <Link
                                    href={`/dashboard/courses/test/${course.productSlug}`}
                                    className="lpd-btn lpd-btn-pink mt-6"
                                >
                                    <FlaskConical className="w-4 h-4" /> Take the Final Test
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Lesson list */}
                    <div className="lpd-card p-4 h-fit">
                        <p className="flex items-center gap-2 font-bold text-[#1E1530] mb-3">
                            <ListVideo className="w-5 h-5 text-[#D93C78]" /> Lessons ({lessons.length})
                        </p>
                        <div className="space-y-1.5">
                            {lessons.map((l, i) => {
                                const open = lessonAccess[i];
                                const active = i === currentIdx;
                                return open ? (
                                    <Link
                                        key={l.id}
                                        href={`/dashboard/courses/player/${course.id}?lesson=${l.id}`}
                                        className={`block rounded-[14px] px-3 py-2.5 text-sm font-semibold border-2 ${active ? 'bg-[#FFE9F3] text-[#1E1530] border-[#FF8AC4]' : 'text-[#3B3150] border-transparent hover:bg-[#FFF8FB] hover:border-[rgba(59,49,80,.14)]'}`}
                                    >
                                        {i + 1}. {l.title}
                                    </Link>
                                ) : (
                                    <div key={l.id} className="flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-sm text-[#6B5F80] bg-[#E8E2F0]/60">
                                        <Lock className="w-3.5 h-3.5 shrink-0" /> {i + 1}. {l.title}
                                    </div>
                                );
                            })}
                        </div>
                        {isNewCourse && !fullAccess && (
                            <div className="mt-4 rounded-[14px] bg-[#FFE9AE]/60 border border-[rgba(59,49,80,.14)] px-3 py-2.5">
                                <p className="text-xs text-[#3B3150] leading-relaxed">
                                    You are watching the free demo lesson. Buy the full course to unlock every lesson.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
