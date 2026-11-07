import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import ProgressTracker from "@/components/ProgressTracker";
import { hasFullCourseAccess, hasLessonAccess } from "@/lib/access";
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
        lessons = [{ id: 'lesson-1', title: course.title || 'Lesson 1', videoLink: course.videoLink, durationSec: 0, order: 0 }];
    }

    const isNewCourse = !!course.productSlug;

    // Legacy price-tier access for old package courses (unchanged rules)
    let legacyUnlocked = false;
    if (!isNewCourse) {
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'SUCCESS')
            .get();
        let purchasedPackagePrice = 0;
        if (!ordersSnapshot.empty) {
            const orders = ordersSnapshot.docs.map(doc => doc.data());
            orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const latestOrder = orders[0];
            if (latestOrder.packageId) {
                const pkgDoc = await db.collection('packages').doc(latestOrder.packageId).get();
                purchasedPackagePrice = pkgDoc.data()?.price || 0;
            }
        }
        let requiredPrice = 0;
        const cat = String(course.category || '');
        if (cat.includes('Silicon')) requiredPrice = 19;
        else if (cat.includes('Silver')) requiredPrice = 799;
        else if (cat.includes('Gold')) requiredPrice = 1299;
        else if (cat.includes('Diamond')) requiredPrice = 3899;
        legacyUnlocked = purchasedPackagePrice >= requiredPrice;
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
            <div className="min-h-screen bg-gray-50">
                <DashboardNavbar user={session.user} />
                <div className="max-w-7xl mx-auto p-8 text-center">
                    <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Access Locked</h1>
                    <p className="text-gray-600 mt-2">You do not have access to this course.</p>
                    <Link href="/dashboard/courses" className="mt-4 inline-block text-blue-600 hover:underline">Back to Courses</Link>
                </div>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(currentLesson.videoLink);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavbar user={session.user} />
            <ProgressTracker
                courseSlug={course.productSlug || course.id}
                lessonId={currentLesson.id}
                durationSec={currentLesson.durationSec}
            />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <Link href="/dashboard/courses" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                </Link>

                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="aspect-video bg-black w-full relative">
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                            <p className="text-sm font-semibold text-gray-500 mb-4">
                                Lesson {currentIdx + 1}: {currentLesson.title}
                            </p>
                            <div className="prose max-w-none text-gray-600">
                                <p>{course.description}</p>
                            </div>
                            {isNewCourse && fullAccess && (
                                <Link
                                    href={`/dashboard/courses/test/${course.productSlug}`}
                                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#732C3F] px-5 py-3 font-bold text-white hover:bg-[#5a2231]"
                                >
                                    <FlaskConical className="w-4 h-4" /> Take the Final Test
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Lesson list */}
                    <div className="bg-white rounded-xl shadow-lg p-4 h-fit">
                        <p className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                            <ListVideo className="w-5 h-5" /> Lessons ({lessons.length})
                        </p>
                        <div className="space-y-1.5">
                            {lessons.map((l, i) => {
                                const open = lessonAccess[i];
                                const active = i === currentIdx;
                                return open ? (
                                    <Link
                                        key={l.id}
                                        href={`/dashboard/courses/player/${course.id}?lesson=${l.id}`}
                                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${active ? 'bg-rose-50 text-[#732C3F] border border-rose-200' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {i + 1}. {l.title}
                                    </Link>
                                ) : (
                                    <div key={l.id} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                                        <Lock className="w-3.5 h-3.5" /> {i + 1}. {l.title}
                                    </div>
                                );
                            })}
                        </div>
                        {isNewCourse && !fullAccess && (
                            <p className="mt-3 text-xs text-gray-500">
                                You are watching the free demo lesson. Buy the full course to unlock every lesson.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
