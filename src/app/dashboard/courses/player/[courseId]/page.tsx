import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Lock, ArrowLeft, PlayCircle } from "lucide-react";
import Link from "next/link";

export default async function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const { courseId } = await params;

    // 1. Fetch Course
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) return <div>Course not found</div>;
    const course = { id: courseDoc.id, ...courseDoc.data() } as any;

    // 2. Check Access
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
    if (course.category.includes('Silicon')) requiredPrice = 19;
    else if (course.category.includes('Silver')) requiredPrice = 799;
    else if (course.category.includes('Gold')) requiredPrice = 1299;
    else if (course.category.includes('Diamond')) requiredPrice = 3899;

    const isUnlocked = purchasedPackagePrice >= requiredPrice;

    if (!isUnlocked) {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavbar user={session.user} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <Link href="/dashboard/courses" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                </Link>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Video Player Container */}
                    <div className="aspect-video bg-black w-full relative">
                        {course.videoLink ? (
                            <iframe
                                src={course.videoLink.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                allowFullScreen
                                title={course.title}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                                <PlayCircle className="w-16 h-16 opacity-50" />
                                <span className="ml-4">Video not available</span>
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                ${course.category.includes('Diamond') ? 'bg-purple-100 text-purple-700' :
                                    course.category.includes('Gold') ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'}`}>
                                {course.category}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                        <div className="prose max-w-none text-gray-600">
                            <p>{course.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
