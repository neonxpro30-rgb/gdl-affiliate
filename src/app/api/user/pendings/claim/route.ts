import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { claimPending } from "@/lib/pendingCommission";

/**
 * POST /api/user/pendings/claim
 * Body: { pendingId }
 * Claims an Upgrade Bonus pending. Tier-matched rule: only PENDING within the
 * 7-day window can be claimed, and only after upgrading to the sold tier.
 * Donated amounts cannot be reclaimed.
 * On success the amount is credited as a normal DIRECT referral so it
 * flows through the existing payout pipeline.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { pendingId } = await req.json();
        if (!pendingId) {
            return NextResponse.json({ error: "pendingId required" }, { status: 400 });
        }

        try {
            const { amount } = await claimPending(pendingId, session.user.id);
            return NextResponse.json({ success: true, amount });
        } catch (err: any) {
            if (err.message === 'UPGRADE_REQUIRED') {
                return NextResponse.json(
                    { error: "UPGRADE_REQUIRED", message: "Upgrade to the sold package tier to claim this bonus." },
                    { status: 400 }
                );
            }
            if (err.message === 'ALREADY_DONATED') {
                return NextResponse.json(
                    { error: "ALREADY_DONATED", message: "This bonus was donated to children's education after the 7-day window." },
                    { status: 400 }
                );
            }
            if (err.message === 'Already claimed') {
                return NextResponse.json({ error: "Already claimed" }, { status: 400 });
            }
            if (err.message === 'Not your pending' || err.message === 'Pending not found') {
                return NextResponse.json({ error: err.message }, { status: 403 });
            }
            throw err;
        }
    } catch (error) {
        console.error("Error claiming pending:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
