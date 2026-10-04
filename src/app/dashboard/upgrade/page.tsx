'use client';

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { ArrowUpCircle } from "lucide-react";

const TIER_RANK: Record<string, number> = { silicon: 0, silver: 1, gold: 2, diamond: 3 };

function tierOf(name: string): number {
    const n = (name || '').toLowerCase();
    if (n.includes('diamond')) return 3;
    if (n.includes('gold')) return 2;
    if (n.includes('silver')) return 1;
    return 0;
}

export default function UpgradePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [packages, setPackages] = useState<any[]>([]);
    const [currentTier, setCurrentTier] = useState<number | null>(null);
    const [currentName, setCurrentName] = useState('Loading...');
    const [buying, setBuying] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') redirect('/login');
        if (!session) return;

        fetch('/api/packages').then(r => r.json()).then(setPackages).catch(console.error);
        fetch('/api/user/pendings')
            .then(r => r.json())
            .then(d => {
                setCurrentTier(d.currentTier ?? 0);
                const names = ['Silicon Demo', 'Silver Package', 'Gold Package', 'Diamond Package'];
                setCurrentName(names[d.currentTier ?? 0] || 'Unknown');
            })
            .catch(() => { setCurrentTier(0); setCurrentName('Unknown'); });
    }, [session, status]);

    const handleUpgrade = async (packageId: string) => {
        setBuying(packageId);
        setError('');
        try {
            const res = await fetch('/api/user/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upgrade failed');
            router.push(`/payment/${data.orderId}`);
        } catch (err: any) {
            setError(err.message);
            setBuying(null);
        }
    };

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    if (!session) return null;

    const higher = packages.filter(p => currentTier !== null && tierOf(p.name) > currentTier);

    return (
        <div className="min-h-screen bg-[#FFFBF0]">
            <DashboardNavbar user={session.user} />
            <div className="max-w-3xl mx-auto p-4 pb-24">
                <div className="flex items-center gap-3 mb-2 mt-4">
                    <ArrowUpCircle className="w-8 h-8 text-[#732C3F]" />
                    <h1 className="text-3xl font-bold text-[#1A0B12]">Upgrade Package</h1>
                </div>
                <p className="text-gray-600 mb-8">
                    Your current package: <span className="font-bold text-[#732C3F]">{currentName}</span>.
                    Upgrade to unlock higher commissions and claim your Upgrade Bonus.
                </p>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>
                )}

                {currentTier === null ? (
                    <p className="text-gray-500">Loading packages...</p>
                ) : higher.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
                        <p className="text-lg font-semibold text-gray-800">You own the highest package. 🎉</p>
                        <p className="text-gray-500 mt-2">There is nothing above {currentName} to upgrade to.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {higher.map(pkg => (
                            <div key={pkg.id} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#732C3F]/10 hover:border-[#732C3F]/40 transition">
                                <h3 className="text-xl font-bold text-[#1A0B12]">{pkg.name}</h3>
                                <p className="text-3xl font-extrabold text-[#732C3F] mt-2">₹{pkg.price}</p>
                                <button
                                    onClick={() => handleUpgrade(pkg.id)}
                                    disabled={buying !== null}
                                    className="mt-4 w-full bg-[#732C3F] text-white py-3 rounded-xl font-bold hover:bg-[#5a2231] transition disabled:opacity-50"
                                >
                                    {buying === pkg.id ? 'Creating order...' : `Upgrade to ${pkg.name}`}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
