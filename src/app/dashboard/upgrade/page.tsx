'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";

// The old package-upgrade page existed to unlock Upgrade Bonus claims.
// That program ended with the LearnPeak relaunch — this page now simply
// explains the change and points to the new course catalog.
export default function UpgradePage() {
    const { data: session, status } = useSession();
    if (status === 'unauthenticated') redirect('/login');
    if (!session) return null;

    return (
        <div className="min-h-screen bg-[#1A0B12] text-white">
            <DashboardNavbar user={session.user as any} />
            <div className="max-w-md md:max-w-2xl mx-auto px-4 pt-10 pb-24">
                <h1 className="font-display text-3xl uppercase tracking-wide">Upgrades have changed</h1>
                <div className="mt-5 rounded-2xl border border-rose-900/60 bg-[#241019]/90 p-6 text-sm leading-relaxed text-rose-100/85 space-y-3">
                    <p>
                        LearnPeak has relaunched as a wedding video editing school. The old
                        Silicon / Silver / Gold / Diamond packages are no longer sold, and the
                        Upgrade Bonus program has ended.
                    </p>
                    <p>
                        <strong className="text-white">Your existing access is safe</strong> — everything you
                        already bought stays in your account. Any Upgrade Bonus that was pending
                        before the relaunch is being settled under the old terms; it has not been
                        cancelled.
                    </p>
                    <p>
                        New courses are sold individually now — no tiers, no upgrades needed.
                        And anyone can earn a flat 30% affiliate commission without buying anything.
                    </p>
                    <a href="/dashboard/courses" className="inline-block mt-2 rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 px-5 py-3 font-bold text-white">
                        Go to My Courses
                    </a>
                </div>
            </div>
        </div>
    );
}
