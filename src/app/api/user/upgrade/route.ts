import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/firebaseAdmin";
import { getUserTierRank } from "@/lib/pendingCommission";
import { getTierRank } from "@/lib/pendingTiers";

/**
 * POST /api/user/upgrade
 * Body: { packageId }
 * Creates a PENDING upgrade order for the LOGGED-IN user (no new account).
 * The package must be a HIGHER tier than the user's current package.
 * Returns { orderId } -> redirect to /payment/[orderId].
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { packageId } = await req.json();
        if (!packageId) {
            return NextResponse.json({ error: "packageId required" }, { status: 400 });
        }

        const pkgDoc = await db.collection('packages').doc(packageId).get();
        if (!pkgDoc.exists) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }
        const pkg = pkgDoc.data() as any;

        const currentTier = await getUserTierRank(session.user.id);
        const newTier = getTierRank(pkg.name || '');
        if (newTier <= currentTier) {
            return NextResponse.json(
                { error: "You already own this package or a higher one." },
                { status: 400 }
            );
        }

        const timestamp = new Date().toISOString();
        const orderRef = await db.collection('orders').add({
            userId: session.user.id,
            packageId,
            amount: pkg.price || 0,
            status: 'PENDING',
            isUpgrade: true,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return NextResponse.json({ orderId: orderRef.id });
    } catch (error) {
        console.error("Error creating upgrade order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
