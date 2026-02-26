import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
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

    // 3. Check Access
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

    let requiredPrice = 0;
    if (category.title.includes('Silicon')) requiredPrice = 19;
    else if (category.title.includes('Silver')) requiredPrice = 799;
    else if (category.title.includes('Gold')) requiredPrice = 1299;
    else if (category.title.includes('Diamond')) requiredPrice = 3899;

    const isUnlocked = purchasedPackagePrice >= requiredPrice;

    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardNavbar user={session.user} />
                <div className="max-w-7xl mx-auto p-8 text-center">
                    <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Access Locked</h1>
                    <p className="text-gray-600 mt-2">You do not have access to this category.</p>
                    <Link href="/dashboard/courses" className="mt-4 inline-block text-blue-600 hover:underline">Back to Courses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavbar user={session.user} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <Link href="/dashboard/courses" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{category.title}</h1>
                    <p className="text-gray-600 mt-2">{courses.length} Courses Available</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                <PlayCircle className="w-12 h-12 text-blue-600" />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                                <Link
                                    href={`/dashboard/courses/player/${course.id}`}
                                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Start Learning
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
