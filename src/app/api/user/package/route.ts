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

        // The user's package = the HIGHEST tier they own across all SUCCESS
        // orders (a later small purchase must not downgrade them)
        const { getLegacyTopPackage } = await import("@/lib/access");
        const { packageId, price } = await getLegacyTopPackage(userId);

        if (!packageId) {
            // Demo-only buyer: the ₹19 demo is the Silicon package
            if (price >= 19) return NextResponse.json({ name: "Silicon Package" });
            return NextResponse.json({ name: "No Package" });
        }

        // Fetch Package Name
        const packageDoc = await db.collection('packages').doc(packageId).get();
        let packageName = "Unknown Package";

        if (packageDoc.exists) {
            packageName = packageDoc.data()?.name || packageName;
        } else {
            // Fallback if package doc missing
            if (packageId.includes('silver')) packageName = "Silver Package";
            else if (packageId.includes('gold')) packageName = "Gold Package";
            else if (packageId.includes('diamond')) packageName = "Diamond Package";
        }

        return NextResponse.json({ name: packageName });

    } catch (error) {
        console.error("Error fetching user package:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
