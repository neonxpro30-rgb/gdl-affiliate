import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUserPendings } from "@/lib/pendingCommission";

/**
 * GET /api/user/pendings
 * Lists the logged-in user's Upgrade Bonus pendings with live status
 * (PENDING / DONATED / CLAIMED), tier-matched claimability and countdown,
 * plus the running charity total.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { pendings, currentTier, charityTotal } = await getUserPendings(session.user.id);

        return NextResponse.json({ pendings, currentTier, charityTotal });
    } catch (error) {
        console.error("Error fetching pendings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
