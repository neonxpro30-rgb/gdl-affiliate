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
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userDoc.data();
        const referrerId = userData?.referrerId;

        let mentor = {
            name: "Prakhar Mishra",
            phone: "+91 9554819859",
            email: "neonxpro30@gmail.com",
            referralCode: "ADMIN",
            isDefault: true
        };

        if (referrerId) {
            const referrerDoc = await db.collection('users').doc(referrerId).get();
            if (referrerDoc.exists) {
                const referrerData = referrerDoc.data();
                mentor = {
                    name: referrerData?.name || "Unknown Mentor",
                    phone: referrerData?.phone || "No Number",
                    email: referrerData?.email || "No Email",
                    referralCode: referrerData?.referralCode || "No Code",
                    isDefault: false
                };
            }
        }

        return NextResponse.json(mentor);

    } catch (error) {
        console.error("Error fetching mentor:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
