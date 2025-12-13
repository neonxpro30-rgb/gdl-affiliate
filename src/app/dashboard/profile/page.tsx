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
        <div className="min-h-screen bg-gray-50">
            <DashboardNavbar user={session.user} />

            <div className="max-w-3xl mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

                <ProfileUpload currentPhotoUrl={user.photoURL} userName={user.name} />

                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold mb-6 border-b pb-2">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500">Full Name</label>
                            <p className="font-medium text-lg">{user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500">Email</label>
                            <p className="font-medium text-lg">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500">Phone</label>
                            <p className="font-medium text-lg">{user.phone}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500">Referral Code</label>
                            <p className="font-medium text-lg">{user.referralCode}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-6 border-b pb-2">Bank Details (For Payouts)</h2>
                    <BankDetailsForm user={user} />
                </div>
            </div>
        </div>
    );
}
