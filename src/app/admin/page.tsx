import * as admin from 'firebase-admin';
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import AdminDashboardClient from "./AdminDashboardClient";
import UsersTable from "./UsersTable";
import CategoriesTable from "./CategoriesTable";
import CoursesTable from "./CoursesTable";

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const session = await getServerSession(authOptions);
    const { tab } = await searchParams;
    const activeTab = tab || 'commissions';

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // Fetch Pending & Paid Referrals
    let commissions: any[] = [];
    try {
        const referralsSnapshot = await db.collection('referrals')
            .where('status', 'in', ['PENDING', 'PAID'])
            .get();

        commissions = await Promise.all(referralsSnapshot.docs.map(async (doc) => {
            const data = doc.data();

            let referrer = { name: 'Unknown' };
            if (data.referrerId) {
                const referrerDoc = await db.collection('users').doc(data.referrerId).get();
                if (referrerDoc.exists) referrer = referrerDoc.data() as any;
            }

            let referredUser = { name: 'Unknown' };
            if (data.referredUserId) {
                const referredUserDoc = await db.collection('users').doc(data.referredUserId).get();
                if (referredUserDoc.exists) referredUser = referredUserDoc.data() as any;
            }

            let sourceUser = { name: '-' };
            if (data.sourceUserId) {
                const sourceUserDoc = await db.collection('users').doc(data.sourceUserId).get();
                if (sourceUserDoc.exists) sourceUser = sourceUserDoc.data() as any;
            }

            return {
                id: doc.id,
                ...data,
                referrer: referrer,
                referredUser: referredUser,
                sourceUser: sourceUser
            };
        }));
    } catch (error) {
        console.error("Error fetching commissions:", error);
    }

    // Fetch All Orders for Revenue Calculation
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let thisMonthProfit = 0;
    let orders: any[] = [];

    try {
        const ordersSnapshot = await db.collection('orders')
            .where('status', '==', 'SUCCESS')
            .get();

        orders = ordersSnapshot.docs.map(doc => ({ ...doc.data() }));

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

        const thisMonthOrders = orders.filter(order => order.createdAt >= startOfMonth);
        thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

        // Calculate Commissions for this month
        const thisMonthCommissions = commissions
            .filter(comm => comm.createdAt >= startOfMonth)
            .reduce((sum, comm) => sum + (comm.amount || 0), 0);

        thisMonthProfit = thisMonthRevenue - thisMonthCommissions;

    } catch (error) {
        console.error("Error fetching orders:", error);
    }

    // Leaderboard Logic
    let leaderboardData: any[] = [];
    if (activeTab === 'leaderboard') {
        const paidReferrals = commissions.filter(c => c.status === 'PAID');
        const earningsMap: Record<string, { total: number, today: number, week: number, month: number }> = {};

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        paidReferrals.forEach(ref => {
            const referrerId = ref.referrerId;
            if (!referrerId) return;

            if (!earningsMap[referrerId]) {
                earningsMap[referrerId] = { total: 0, today: 0, week: 0, month: 0 };
            }

            const amount = ref.amount || 0;
            const date = new Date(ref.createdAt);

            earningsMap[referrerId].total += amount;
            if (date >= startOfDay) earningsMap[referrerId].today += amount;
            if (date >= startOfWeek) earningsMap[referrerId].week += amount;
            if (date >= startOfMonth) earningsMap[referrerId].month += amount;
        });

        // Fetch User Details for Leaderboard
        const referrerIds = Object.keys(earningsMap);
        if (referrerIds.length > 0) {
            const usersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', referrerIds.slice(0, 10)).get(); // Limit to 10 for now to avoid query limits
            const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));

            leaderboardData = referrerIds.map(id => ({
                id,
                name: usersMap.get(id)?.name || 'Unknown',
                email: usersMap.get(id)?.email || 'Unknown',
                ...earningsMap[id]
            })).sort((a, b) => b.total - a.total);
        }
    }

    // Fetch All Users (only if tab is users)
    let users: any[] = [];
    if (activeTab === 'users') {
        const usersSnapshot = await db.collection('users').get();
        users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Fetch All Courses (only if tab is courses)
    let courses: any[] = [];
    let categoriesForCourses: any[] = [];
    if (activeTab === 'courses') {
        const coursesSnapshot = await db.collection('courses').get();
        courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Also fetch categories to populate dropdown
        const catSnapshot = await db.collection('categories').orderBy('order', 'asc').get();
        categoriesForCourses = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Fetch All Categories (only if tab is categories)
    let categories: any[] = [];
    if (activeTab === 'categories') {
        const categoriesSnapshot = await db.collection('categories').orderBy('order', 'asc').get();
        categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4" suppressHydrationWarning>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm md:text-base">
                        Admin: {session.user.name}
                    </div>
                </div>

                {/* Admin Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-700 text-sm font-bold uppercase tracking-wider">This Month's Profit</h3>
                        <p className="text-3xl font-extrabold mt-2 text-green-700">₹{thisMonthProfit}</p>
                        <p className="text-xs text-gray-500 mt-1">Revenue - Commissions</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-700 text-sm font-bold uppercase tracking-wider">This Month's Revenue</h3>
                        <p className="text-3xl font-extrabold mt-2 text-blue-700">₹{thisMonthRevenue}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-700 text-sm font-bold uppercase tracking-wider">Total Revenue (All Time)</h3>
                        <p className="text-3xl font-extrabold mt-2 text-purple-700">₹{totalRevenue}</p>
                    </div>
                </div>

                {/* Monthly History Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-gray-900 text-lg font-bold">Monthly Financial Overview</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Month</th>
                                    <th className="p-4">Total Revenue</th>
                                    <th className="p-4">Commissions Paid</th>
                                    <th className="p-4">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(() => {
                                    const monthlyStats: Record<string, { revenue: number, commissions: number }> = {};

                                    // Process Orders
                                    orders.forEach(order => {
                                        const date = new Date(order.createdAt);
                                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                        if (!monthlyStats[key]) monthlyStats[key] = { revenue: 0, commissions: 0 };
                                        monthlyStats[key].revenue += (order.amount || 0);
                                    });

                                    // Process Commissions
                                    commissions.forEach(comm => {
                                        const date = new Date(comm.createdAt);
                                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                        if (!monthlyStats[key]) monthlyStats[key] = { revenue: 0, commissions: 0 };
                                        monthlyStats[key].commissions += (comm.amount || 0);
                                    });

                                    const sortedMonths = Object.keys(monthlyStats).sort().reverse();

                                    if (sortedMonths.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={4} className="p-6 text-center text-gray-500">No data available yet.</td>
                                            </tr>
                                        );
                                    }

                                    return sortedMonths.map(month => {
                                        const stats = monthlyStats[month];
                                        const profit = stats.revenue - stats.commissions;
                                        const [year, monthNum] = month.split('-');
                                        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

                                        return (
                                            <tr key={month} className="hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{monthName}</td>
                                                <td className="p-4 text-blue-700 font-bold">₹{stats.revenue}</td>
                                                <td className="p-4 text-red-600 font-medium">- ₹{stats.commissions}</td>
                                                <td className="p-4 text-green-700 font-extrabold" suppressHydrationWarning>₹{profit}</td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <a
                        href="/admin?tab=commissions"
                        className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base ${activeTab === 'commissions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    >
                        Commissions
                    </a>
                    <a
                        href="/admin?tab=sales"
                        className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base ${activeTab === 'sales' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    >
                        Sales (Breakdown)
                    </a>
                    <a
                        href="/admin?tab=users"
                        className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    >
                        Users
                    </a>
                    <a
                        href="/admin?tab=courses"
                        className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    >
                        Courses
                    </a>
                    <a
                        href="/admin?tab=categories"
                        className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    >
                        Categories
                    </a>
                    <a
                        href="/admin?tab=leaderboard"
                        className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base ${activeTab === 'leaderboard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    >
                        Leaderboard
                    </a>
                </div>

                {activeTab === 'commissions' ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Pending & Confirmed Commissions</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Referrer (Payee)</th>
                                        <th className="p-4">Unique ID</th>
                                        <th className="p-4">Bank Details</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Source (From)</th>
                                        <th className="p-4">Referred User</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {commissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="p-8 text-center text-gray-500">
                                                No pending or confirmed commissions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        commissions.map((comm: any) => (
                                            <tr key={comm.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{comm.referrer.name}</td>
                                                <td className="p-4 text-gray-600 text-sm font-mono">{comm.referrer.referralCode || '-'}</td>
                                                <td className="p-4 text-xs text-gray-600">
                                                    {comm.referrer.bankName ? (
                                                        <div>
                                                            <p><span className="font-bold">Bank:</span> {comm.referrer.bankName}</p>
                                                            <p><span className="font-bold">A/C:</span> {comm.referrer.accountNumber}</p>
                                                            <p><span className="font-bold">IFSC:</span> {comm.referrer.ifscCode}</p>
                                                            <p><span className="font-bold">UPI:</span> {comm.referrer.upiId || '-'}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-red-500">Not Added</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${comm.type === 'PASSIVE' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                                                        }`}>
                                                        {comm.type || 'DIRECT'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600 text-sm">
                                                    {comm.type === 'PASSIVE' ? comm.sourceUser.name : '-'}
                                                </td>
                                                <td className="p-4 text-gray-900">{comm.referredUser.name}</td>
                                                <td className="p-4 text-green-700 font-bold">₹{comm.amount}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${comm.status === 'PENDING' ? 'bg-yellow-100 text-yellow-900' :
                                                        comm.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-900' :
                                                            'bg-green-100 text-green-900'
                                                        }`}>
                                                        {comm.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-700">{new Date(comm.createdAt).toISOString().split('T')[0]}</td>
                                                <td className="p-4">
                                                    <AdminDashboardClient referralId={comm.id} status={comm.status} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'sales' ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Sales & Commission Breakdown</h2>
                            <p className="text-sm text-gray-500">Breakdown: 70% Direct / 10% Passive / 20% Company</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[900px]">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Buyer</th>
                                        <th className="p-4">Package</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4 text-blue-700">Direct (70%)</th>
                                        <th className="p-4 text-purple-700">Passive (10%)</th>
                                        <th className="p-4 text-green-700">Company (20%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">
                                                No successful sales found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order: any, index: number) => {
                                            const price = order.amount || 0;
                                            const productName = order.paymentData?.productinfo || '';

                                            let direct, passive, company;

                                            if (productName.includes('Silicon')) {
                                                direct = 17;
                                                passive = 0;
                                                company = 2;
                                            } else {
                                                direct = Math.round(price * 0.70);
                                                passive = Math.round(price * 0.10);
                                                company = Math.round(price * 0.20);
                                            }

                                            return (
                                                <tr key={order.transactionId || index} className="hover:bg-gray-50">
                                                    <td className="p-4 text-gray-700">{new Date(order.createdAt).toISOString().split('T')[0]}</td>
                                                    <td className="p-4 font-medium text-gray-900">{order.paymentData?.firstname || 'Unknown'}</td>
                                                    <td className="p-4 text-gray-900">{order.paymentData?.productinfo || 'Package'}</td>
                                                    <td className="p-4 font-bold text-gray-900">₹{price}</td>
                                                    <td className="p-4 text-blue-700 font-medium">₹{direct}</td>
                                                    <td className="p-4 text-purple-700 font-medium">₹{passive}</td>
                                                    <td className="p-4 text-green-700 font-bold">₹{company}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'users' ? (
                    <UsersTable users={users} />
                ) : activeTab === 'leaderboard' ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Top Earners Leaderboard</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Rank</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Today</th>
                                        <th className="p-4">Last 7 Days</th>
                                        <th className="p-4">This Month</th>
                                        <th className="p-4">All Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {leaderboardData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">
                                                No data available for leaderboard.
                                            </td>
                                        </tr>
                                    ) : (
                                        leaderboardData.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-bold text-gray-900">#{index + 1}</td>
                                                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                                <td className="p-4 text-gray-900">{user.email}</td>
                                                <td className="p-4 text-green-700 font-bold">₹{user.today}</td>
                                                <td className="p-4 text-blue-700 font-bold">₹{user.week}</td>
                                                <td className="p-4 text-purple-700 font-bold">₹{user.month}</td>
                                                <td className="p-4 text-gray-900 font-extrabold">₹{user.total}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'categories' ? (
                    <CategoriesTable categories={categories} />
                ) : (
                    <CoursesTable courses={courses} categories={categoriesForCourses} />
                )}
            </div>
        </div>
    );
}
