import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import CategoryThumb from "@/components/CategoryThumb";
import { Lock, PlayCircle, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) redirect('/login');

        // 1. User's highest owned legacy package tier (across ALL orders —
        //    never just the latest one; see getLegacyTopPackage)
        const { getLegacyTopPackage } = await import('@/lib/access');
        const { price: purchasedPackagePrice } = await getLegacyTopPackage(session.user.id);

        // 2. Fetch Categories
        const categoriesSnapshot = await db.collection('categories').orderBy('order', 'asc').get();
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        // 3. Fetch All Courses
        const coursesSnapshot = await db.collection('courses').get();
        const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        // 4. Map Courses to Categories & Determine Access
        // Access Logic:
        // Silicon (19) -> Access Silicon
        // Silver (799) -> Access Silicon + Silver
        // Gold (1299) -> Access Silicon + Silver + Gold
        // Diamond (3899) -> Access All

        const groupedCategories = categories.map(category => {
            const categoryCourses = courses.filter(c => c.category === category.title);

            // Determine if unlocked
            // This logic assumes category titles match package names or we need a mapping.
            // For now, we'll use a simple price-based mapping or name matching if prices are standard.
            // Better approach: Assign a "minPackagePrice" to each category in Admin, but for now hardcode based on title.

            let requiredPrice = 0;
            if (category.title.includes('Silicon')) requiredPrice = 19;
            else if (category.title.includes('Silver')) requiredPrice = 799;
            else if (category.title.includes('Gold')) requiredPrice = 1299;
            else if (category.title.includes('Diamond')) requiredPrice = 3899;

            const isUnlocked = purchasedPackagePrice >= requiredPrice;

            return {
                ...category,
                courses: categoryCourses,
                isUnlocked
            };
        });

        // NEW catalog courses (productSlug-based, post-relaunch)
        const { hasFullCourseAccess, hasLessonAccess } = await import('@/lib/access');
        const newCourses: any[] = [];
        for (const c of courses.filter((c: any) => c.productSlug)) {
            const full = await hasFullCourseAccess(session.user.id, c.productSlug);
            const demo = !full && await hasLessonAccess(session.user.id, c.productSlug, 0);
            newCourses.push({ ...c, accessState: full ? 'full' : demo ? 'demo' : 'locked' });
        }

        return (
            <div className="min-h-screen lpd-shell">
                <DashboardNavbar user={session.user} />

                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl lpd-display text-[#1E1530]">My Learning</h1>
                        <p className="text-[#6B5F80] mt-2">Select a category to start learning.</p>
                    </div>

                    {newCourses.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-xl lpd-display text-[#1E1530] mb-4">Wedding Editing Courses</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {newCourses.map((c: any) => (
                                    <div key={c.id} className="lpd-card lpd-card-hover p-5 flex flex-col">
                                        <h3 className="font-bold text-[#1E1530]">{c.title}</h3>
                                        <p className="text-sm text-[#6B5F80] mt-1 line-clamp-2">{c.description || ''}</p>
                                        {c.accessState === 'locked' ? (
                                            <a href={`/signup?product=${c.productSlug}`} className="lpd-btn lpd-btn-pink lpd-btn-sm mt-4 self-start">
                                                <Lock className="w-4 h-4" /> Buy Course
                                            </a>
                                        ) : (
                                            <a href={`/dashboard/courses/player/${c.id}`} className="lpd-btn lpd-btn-sm mt-4 self-start">
                                                <PlayCircle className="w-4 h-4" /> {c.accessState === 'demo' ? 'Watch Demo Lesson' : 'Continue Learning'}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Learning Dashboard Welcome */}
                    <div className="mb-8 lpd-banner p-6">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">🎓</div>
                            <div>
                                <h3 className="text-xl font-bold text-[#1E1530] mb-2">Welcome to Your Learning Dashboard</h3>
                                <p className="text-[#6B5F80] mb-3">
                                    Browse your courses below. Unlocked categories are ready for you to start learning.
                                    New content is added regularly — enjoy lifetime access to all your purchased courses!
                                </p>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <span className="lpd-chip">✅ Lifetime Access</span>
                                    <span className="lpd-chip">📚 Learn at Your Pace</span>
                                    <span className="lpd-chip">🔄 Regular Updates</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedCategories.map((category) => (
                            <div key={category.id} className="lpd-card lpd-card-hover overflow-hidden flex flex-col">
                                {/* Category Image */}
                                <div className="h-48 bg-[#FFE9F3] relative overflow-hidden">
                                    <CategoryThumb image={category.image} title={category.title} />
                                    <div className="absolute top-4 right-4">
                                        {category.isUnlocked ? (
                                            <span className="lpd-badge lpd-badge-mint shadow-sm">
                                                <CheckCircle className="w-3 h-3" /> Unlocked
                                            </span>
                                        ) : (
                                            <span className="lpd-badge lpd-badge-lock shadow-sm">
                                                <Lock className="w-3 h-3" /> Locked
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow">
                                    <h2 className="text-xl font-bold text-[#1E1530] mb-2">{category.title}</h2>
                                    <p className="text-sm text-[#6B5F80] mb-4">{category.courses.length} Courses</p>

                                    <div className="space-y-3">
                                        {category.courses.slice(0, 3).map((course: any) => (
                                            <div key={course.id} className="flex items-center text-sm text-[#3B3150]">
                                                <PlayCircle className="w-4 h-4 mr-2 shrink-0 text-[#D93C78]" />
                                                <span className="truncate">{course.title}</span>
                                            </div>
                                        ))}
                                        {category.courses.length > 3 && (
                                            <p className="text-xs text-[#6B5F80] italic">+ {category.courses.length - 3} more</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-[rgba(59,49,80,.14)] bg-[#FFF8FB] mt-auto">
                                    {category.isUnlocked ? (
                                        <a href={`/dashboard/courses/category/${category.id}`} className="lpd-btn lpd-btn-pink lpd-btn-block">
                                            View Courses
                                        </a>
                                    ) : (
                                        <button disabled className="lpd-btn lpd-btn-block bg-[#E8E2F0] text-[#3B3150] border-[#CFC6E2]">
                                            Locked
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error loading courses:", error);
        return <div>Error loading courses.</div>;
    }
}
