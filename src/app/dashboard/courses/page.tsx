import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Lock, PlayCircle, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) redirect('/login');

        // 1. Fetch User's Purchased Package
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', session.user.id)
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

        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardNavbar user={session.user} />

                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">My Learning</h1>
                        <p className="text-gray-600 mt-2">Select a category to start learning.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedCategories.map((category) => (
                            <div key={category.id} className={`bg-white rounded-xl shadow-sm border ${category.isUnlocked ? 'border-green-200' : 'border-gray-200'} overflow-hidden flex flex-col`}>
                                {/* Category Image */}
                                <div className="h-48 bg-gray-100 relative">
                                    {category.image ? (
                                        <img src={category.image} alt={category.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <PlayCircle className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        {category.isUnlocked ? (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Unlocked
                                            </span>
                                        ) : (
                                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                                                <Lock className="w-3 h-3 mr-1" /> Locked
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h2>
                                    <p className="text-sm text-gray-500 mb-4">{category.courses.length} Courses</p>

                                    <div className="space-y-3">
                                        {category.courses.slice(0, 3).map((course: any) => (
                                            <div key={course.id} className="flex items-center text-sm text-gray-600">
                                                <PlayCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                <span className="truncate">{course.title}</span>
                                            </div>
                                        ))}
                                        {category.courses.length > 3 && (
                                            <p className="text-xs text-gray-400 italic">+ {category.courses.length - 3} more</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t mt-auto">
                                    {category.isUnlocked ? (
                                        <a href={`/dashboard/courses/category/${category.id}`} className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                                            View Courses
                                        </a>
                                    ) : (
                                        <button disabled className="block w-full bg-gray-300 text-gray-500 text-center py-2 rounded-lg font-medium cursor-not-allowed">
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
