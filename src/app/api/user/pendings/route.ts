import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/firebaseAdmin";

/**
 * GET /api/user/pendings — LEGACY, READ-ONLY.
 * The Upgrade Bonus program ended with the relaunch. This endpoint only
 * READS historical records (no expiry transitions, no writes) so users
 * can see what they had. Pre-cutover pendings are settled under the old
 * terms by a supervised settlement run — never silently cancelled.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const snap = await db.collection('pendings')
            .where('referrerId', '==', session.user.id)
            .get();

        const now = Date.now();
        const pendings = snap.docs.map(doc => {
            const d = doc.data() as any;
            let effectiveStatus = d.status || 'PENDING';
            if (effectiveStatus === 'PENDING' && d.expiresAt && new Date(d.expiresAt).getTime() <= now) {
                effectiveStatus = 'DONATED'; // display-only; the settlement run makes it official
            }
            return { id: doc.id, ...d, effectiveStatus, canClaim: false, legacy: true };
        });

        let charityTotal = 0;
        try {
            const charitySnap = await db.collection('charity_donations').get();
            charityTotal = charitySnap.docs.reduce((s, d) => s + (Number((d.data() as any).amount) || 0), 0);
        } catch { /* collection may not exist in mock */ }

        return NextResponse.json({ pendings, charityTotal, legacy: true });
    } catch (error) {
        console.error("Error fetching pendings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
