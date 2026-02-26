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

        // Fetch latest successful order
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'SUCCESS')
            .get();

        if (ordersSnapshot.empty) {
            return NextResponse.json({ name: "No Package" });
        }

        // Sort in memory to find latest
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const latestOrder = orders[0];
        const packageId = latestOrder.packageId;

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
