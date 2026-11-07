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
        <div className="lpd-shell min-h-screen">
            <DashboardNavbar user={session.user as any} />
            <div className="max-w-md md:max-w-2xl mx-auto px-4 pt-10 pb-24">
                <div className="lpd-banner px-5 py-5">
                    <h1 className="lpd-display text-3xl uppercase tracking-wide text-[#1E1530]">Upgrades have changed</h1>
                </div>
                <div className="lpd-card mt-5 p-6 text-sm leading-relaxed text-[#3B3150] space-y-3">
                    <span className="lpd-badge lpd-badge-lav">Legacy program ended</span>
                    <p>
                        LearnPeak has relaunched as a wedding video editing school. The old
                        Silicon / Silver / Gold / Diamond packages are no longer sold, and the
                        Upgrade Bonus program has ended.
                    </p>
                    <p>
                        <strong className="text-[#1E1530]">Your existing access is safe</strong> — everything you
                        already bought stays in your account. Any Upgrade Bonus that was pending
                        before the relaunch is being settled under the old terms; it has not been
                        cancelled.
                    </p>
                    <p>
                        New courses are sold individually now — no tiers, no upgrades needed.
                        And anyone can earn a flat 30% affiliate commission without buying anything.
                    </p>
                    <a href="/dashboard/courses" className="lpd-btn lpd-btn-pink mt-2">
                        Go to My Courses
                    </a>
                </div>
            </div>
        </div>
    );
}
