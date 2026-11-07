import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getLegacyTopPackage } from "@/lib/access";
import { categoryDisplay, retitleCourses, userUnlocksCategory } from "@/lib/catalog-display";
import { PlayCircle, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const { categoryId } = await params;

    // 1. Fetch Category
    const categoryDoc = await db.collection('categories').doc(categoryId).get();
    if (!categoryDoc.exists) return <div>Category not found</div>;
    const category = { id: categoryDoc.id, ...categoryDoc.data() } as any;

    // 2. Fetch Courses
    const coursesSnapshot = await db.collection('courses').where('category', '==', category.title).get();
    const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    // 3. Display mapping (relaunch): stored titles stay in the DB; the new
    //    course name + lesson titles come from src/lib/catalog-display.ts.
    const display = categoryDisplay(category.title);
    const displayName = display?.displayName ?? category.title;
    const displayCourses = retitleCourses(category.title, courses);
    // Mapped lessons with no course doc yet (e.g. all of Pro Wedding Trailer)
    const pendingLessons = display ? display.lessons.slice(displayCourses.length) : [];

    // 4. Check Access — legacy price rule OR mapped product / bundle
    //    (highest owned legacy tier across ALL orders; never regresses)
    const { price: purchasedPackagePrice } = await getLegacyTopPackage(session.user.id);
    const isUnlocked = await userUnlocksCategory(session.user.id, category.title, purchasedPackagePrice);

    if (!isUnlocked) {
        return (
            <div className="min-h-screen lpd-shell">
                <DashboardNavbar user={session.user} />
                <div className="max-w-7xl mx-auto p-4 md:p-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8E2F0] border-2 border-[#CFC6E2]">
                        <Lock className="w-10 h-10 text-[#3B3150]" />
                    </div>
                    <h1 className="text-2xl lpd-display text-[#1E1530]">Access Locked</h1>
                    <p className="text-[#6B5F80] mt-2">You do not have access to {displayName}.</p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        {display && (
                            <Link href={`/signup?product=${display.productSlug}`} className="lpd-btn lpd-btn-pink">Buy Course</Link>
                        )}
                        <Link href="/dashboard/courses" className="lpd-btn lpd-btn-ghost">Back to Courses</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen lpd-shell">
            <DashboardNavbar user={session.user} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <Link href="/dashboard/courses" className="flex items-center text-[#6B5F80] hover:text-[#1E1530] mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl lpd-display text-[#1E1530]">{displayName}</h1>
                    <p className="text-[#6B5F80] mt-2">
                        {display ? `${display.lessons.length} Lessons` : `${courses.length} Courses Available`}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayCourses.map((course) => (
                        <div key={course.id} className="lpd-card lpd-card-hover overflow-hidden flex flex-col">
                            <div className="h-40 bg-[#FFE9F3] flex items-center justify-center">
                                <PlayCircle className="w-12 h-12 text-[#D93C78]" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="font-bold text-[#1E1530] mb-2 line-clamp-1">{course.displayTitle}</h3>
                                <p className="text-sm text-[#6B5F80] mb-4 line-clamp-2">{course.description}</p>
                                <Link
                                    href={`/dashboard/courses/player/${course.id}`}
                                    className="lpd-btn lpd-btn-pink lpd-btn-block mt-auto"
                                >
                                    Start Learning
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {pendingLessons.length > 0 && (
                    <div className="mt-8 lpd-card p-6">
                        <h2 className="text-lg font-bold text-[#1E1530] mb-1">Lessons being added</h2>
                        <p className="text-sm text-[#6B5F80] mb-4">
                            Videos for these lessons are still being added. They will appear here as soon as they are ready.
                        </p>
                        <div className="space-y-1.5">
                            {pendingLessons.map((lesson, i) => (
                                <div key={lesson} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold text-[#3B3150] bg-[#E8E2F0]/60">
                                    <PlayCircle className="w-4 h-4 shrink-0 text-[#6B5F80]" />
                                    <span className="flex-grow">{displayCourses.length + i + 1}. {lesson}</span>
                                    <span className="lpd-badge lpd-badge-lav">Being added</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
