import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch ALL Referrals for Stats (Pending + Confirmed + Paid)
        const allReferralsSnapshot = await db.collection('referrals')
            .where('referrerId', '==', userId)
            .get();

        const allReferrals = allReferralsSnapshot.docs.map(doc => ({ ...doc.data() })) as any[];

        // Calculate Specific Amounts
        const pendingAmount = allReferrals
            .filter(ref => ref.status === 'PENDING')
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const paidAmount = allReferrals
            .filter(ref => ref.status === 'PAID')
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        // Calculate Time-Based Stats (Using ALL referrals)
        const now = new Date();
        // Strict Today Start (00:00:00)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const allTimeIncome = allReferrals.reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const todayIncome = allReferrals
            .filter(ref => ref.createdAt >= todayStart)
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const sevenDaysIncome = allReferrals
            .filter(ref => ref.createdAt >= sevenDaysAgo)
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const thirtyDaysIncome = allReferrals
            .filter(ref => ref.createdAt >= thirtyDaysAgo)
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        return NextResponse.json({
            today: todayIncome,
            sevenDays: sevenDaysIncome,
            thirtyDays: thirtyDaysIncome,
            allTime: allTimeIncome,
            pending: pendingAmount,
            paid: paidAmount
        });

    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
