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

        // Status semantics (audit #28): legacy rows use uppercase
        // PENDING/PAID; v2 rows (model 'v2-flat') use the lowercase
        // lifecycle. Reversed/rejected/held v2 rows are NOT income and
        // must never be summed into the time-based totals.
        const isV2 = (ref: any) => ref.model === 'v2-flat';
        const countsAsIncome = (ref: any) =>
            !(isV2(ref) && ['reversed', 'rejected', 'held'].includes(ref.status));

        // Calculate Specific Amounts
        const pendingAmount = allReferrals
            .filter(ref => ref.status === 'PENDING' || (isV2(ref) && ['pending', 'confirmed'].includes(ref.status)))
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const paidAmount = allReferrals
            .filter(ref => ref.status === 'PAID' || (isV2(ref) && ref.status === 'paid'))
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        // Calculate Time-Based Stats (income rows only)
        const now = new Date();
        // Strict Today Start (00:00:00)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const incomeReferrals = allReferrals.filter(countsAsIncome);

        const allTimeIncome = incomeReferrals.reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const todayIncome = incomeReferrals
            .filter(ref => ref.createdAt >= todayStart)
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const sevenDaysIncome = incomeReferrals
            .filter(ref => ref.createdAt >= sevenDaysAgo)
            .reduce((sum, ref) => sum + (ref.amount || 0), 0);

        const thirtyDaysIncome = incomeReferrals
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
