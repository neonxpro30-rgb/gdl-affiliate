import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import BankDetailsForm from "./BankDetailsForm";

import ProfileUpload from "@/components/ProfileUpload";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const userDoc = await db.collection('users').doc(session.user.id).get();

    if (!userDoc.exists) redirect('/login');

    const user = { id: userDoc.id, ...userDoc.data() } as any;

    return (
        <div className="lpd-shell min-h-screen">
            <DashboardNavbar user={session.user} />

            <div className="max-w-3xl mx-auto p-4 md:p-8">
                <div className="lpd-banner px-5 py-5 mb-8">
                    <h1 className="lpd-display text-3xl font-bold text-[#1E1530]">My Profile</h1>
                </div>

                <ProfileUpload currentPhotoUrl={user.photoURL} userName={user.name} />

                <div className="lpd-card p-6 mb-8">
                    <h2 className="lpd-display text-xl font-bold text-[#1E1530] mb-6 border-b-2 border-[rgba(59,49,80,.14)] pb-2">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="lpd-label">Full Name</label>
                            <p className="font-semibold text-lg text-[#1E1530]">{user.name}</p>
                        </div>
                        <div>
                            <label className="lpd-label">Email</label>
                            <p className="font-semibold text-lg text-[#1E1530] break-all">{user.email}</p>
                        </div>
                        <div>
                            <label className="lpd-label">Phone</label>
                            <p className="font-semibold text-lg text-[#1E1530]">{user.phone}</p>
                        </div>
                        <div>
                            <label className="lpd-label">Referral Code</label>
                            <p className="lpd-pixel font-semibold text-[22px] leading-tight text-[#1E1530]">{user.referralCode}</p>
                        </div>
                    </div>
                </div>

                <div className="lpd-card p-6">
                    <h2 className="lpd-display text-xl font-bold text-[#1E1530] mb-6 border-b-2 border-[rgba(59,49,80,.14)] pb-2">Bank Details (For Payouts)</h2>
                    <BankDetailsForm user={user} />
                </div>
            </div>
        </div>
    );
}
