'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { User, Copy, Check, Trophy, Wallet } from 'lucide-react';
import DashboardNavbar from "@/components/DashboardNavbar";
import ManagerModal from "./ManagerModal";
import CountUp from "@/components/CountUp";
import AffiliatePanel from "@/components/AffiliatePanel";

/* ------------------------------------------------------------------ */
/* Tier helpers — LVL 1..4 mapped from owned / sold package names       */
/* ------------------------------------------------------------------ */
const TIERS = [
    { rank: 1, key: 'SILICON', name: 'Silicon', medal: '🥉', lvl: 'LVL 1' },
    { rank: 2, key: 'SILVER', name: 'Silver', medal: '🥈', lvl: 'LVL 2' },
    { rank: 3, key: 'GOLD', name: 'Gold', medal: '🥇', lvl: 'LVL 3' },
    { rank: 4, key: 'DIAMOND', name: 'Diamond', medal: '💎', lvl: 'LVL 4' },
];

function tierOfName(name: string | undefined | null) {
    const n = String(name || '').toUpperCase();
    return TIERS.find(t => n.includes(t.key)) || null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-mono text-[11px] tracking-[0.3em] text-rose-300/80 mb-3 uppercase">
            {children}
        </p>
    );
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState({
        today: 0,
        sevenDays: 0,
        thirtyDays: 0,
        allTime: 0,
        pending: 0,
        paid: 0
    });
    const [packageName, setPackageName] = useState('Loading...');
    const [mentor, setMentor] = useState({ name: 'Loading...', phone: '', email: '', referralCode: '' });

    const [userProfile, setUserProfile] = useState<any>(null);
    // Legacy Upgrade Bonus records (pre-relaunch) — read-only history only.
    const [pendings, setPendings] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }

        async function fetchUserProfile() {
            try {
                const res = await fetch('/api/user/me');
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        }

        async function fetchStats() {
            try {
                const res = await fetch('/api/user/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        }

        async function fetchPackage() {
            try {
                const res = await fetch('/api/user/package');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.name) setPackageName(data.name);
                }
            } catch (error) {
                console.error("Error fetching package:", error);
                setPackageName('Standard Package');
            }
        }

        async function fetchMentor() {
            try {
                const res = await fetch('/api/user/mentor');
                if (res.ok) {
                    const data = await res.json();
                    setMentor(data);
                }
            } catch (error) {
                console.error("Error fetching mentor:", error);
                setMentor({ name: 'Prakhar Mishra', phone: '+91 9554819859', email: 'learnpeak.in@gmail.com', referralCode: 'ADMIN' });
            }
        }

        async function fetchPendings() {
            try {
                const res = await fetch('/api/user/pendings');
                if (res.ok) {
                    const data = await res.json();
                    setPendings(data.pendings || []);
                }
            } catch (error) {
                console.error("Error fetching pendings:", error);
            }
        }

        if (session) {
            fetchUserProfile();
            fetchStats();
            fetchPackage();
            fetchMentor();
            fetchPendings();
        }
    }, [session, status]);

    useEffect(() => {
        // Check for payment success param and orderId
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const orderId = params.get('orderId');

        if (paymentStatus === 'success' && orderId) {
            // Call verify API
            fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    paymentId: 'VERIFY_' + Date.now() // Optional
                })
            }).then(res => {
                if (res.ok) {
                    // Refresh stats
                    // Clean URL
                    window.history.replaceState({}, '', '/dashboard');
                    window.location.reload();
                }
            });
        }
    }, []);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        data: { name: '', phone: '', email: '', referralCode: '', whatsappLink: '' }
    });

    const openManagerModal = () => {
        setModalConfig({
            isOpen: true,
            title: 'Manager Details',
            data: {
                name: 'Prakhar Mishra',
                phone: '+91 93692 10597',
                email: 'learnpeak.in@gmail.com',
                referralCode: 'MANAGER',
                whatsappLink: 'https://chat.whatsapp.com/KEDtQP9L7hLJqmnHsBmqvg'
            }
        });
    };

    const openMentorModal = () => {
        setModalConfig({
            isOpen: true,
            title: 'Mentor Details',
            data: { ...mentor, whatsappLink: '' }
        });
    };

    const copyInvite = async (link: string) => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard unavailable */
        }
    };

    const legacyPendings = pendings;

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#1A0B12] flex items-center justify-center">
                <p className="text-sm text-rose-200/70">Loading…</p>
            </div>
        );
    }

    if (!session) return null;

    // Use userProfile if available, otherwise fallback to session.user
    const displayUser = userProfile || session.user;
    const ownedTier = tierOfName(packageName);
    const xpPct = ownedTier ? ownedTier.rank * 25 : 0;
    const referralLink = `https://learnpeak.in/signup?ref=${displayUser.referralCode || ''}`;

    return (
        <div className="min-h-screen bg-[#1A0B12] text-white relative overflow-hidden">
            {/* soft ambient glow */}
            <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[#732C3F]/30 blur-[120px]" />

            <DashboardNavbar user={displayUser} />

            <div className="relative max-w-md md:max-w-4xl mx-auto px-4 pt-6 pb-24">

                {/* ============ 1. PROFILE CARD ============ */}
                <section className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 md:p-6 relative overflow-hidden">
                    <div className="relative flex items-center gap-4">
                        {/* avatar in ring */}
                        <div className="relative shrink-0">
                            <div className="rounded-full bg-gradient-to-br from-rose-400 via-[#732C3F] to-pink-300 p-[3px]">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[#1A0B12] flex items-center justify-center">
                                    {displayUser.photoURL ? (
                                        <img src={displayUser.photoURL} alt={displayUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={36} className="text-rose-300" />
                                    )}
                                </div>
                            </div>
                            {ownedTier && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#1A0B12] border border-rose-400/50 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-rose-300 whitespace-nowrap">
                                    {ownedTier.medal} {ownedTier.lvl}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="font-display text-2xl md:text-3xl uppercase tracking-wide truncate">{displayUser.name}</h1>
                            <p className="text-rose-200/80 text-sm font-medium mt-0.5">
                                {ownedTier ? `${ownedTier.name} Package` : packageName}
                            </p>
                            {/* level progress */}
                            <div className="mt-3">
                                <div className="mb-1.5 flex items-center justify-between text-[10px] tracking-[0.2em] text-rose-200/70">
                                    <span>{ownedTier && ownedTier.rank < 4 ? `NEXT: LVL ${ownedTier.rank + 1} ${TIERS[ownedTier.rank].name.toUpperCase()}` : ownedTier ? 'MAX LEVEL REACHED' : 'LEVEL'}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#732C3F] via-rose-400 to-pink-300 transition-all duration-700"
                                        style={{ width: `${xpPct}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* referral code */}
                    <div className="relative mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-[10px] tracking-[0.25em] text-rose-200/60">REFERRAL CODE</p>
                            <p className="font-mono text-base md:text-lg font-bold text-white tracking-wider truncate">{displayUser.referralCode}</p>
                        </div>
                        <button
                            onClick={() => copyInvite(displayUser.referralCode || '')}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-950/60 px-3 py-2 text-xs font-bold text-rose-200 transition hover:border-rose-300 hover:text-white"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </section>

                {/* ============ 2. MENTOR & MANAGER ============ */}
                <section className="mt-5 grid grid-cols-2 gap-3">
                    <button
                        onClick={openMentorModal}
                        className="rounded-2xl border border-rose-900/50 bg-[#241019]/80 px-4 py-3.5 text-left transition hover:border-rose-400/60 hover:bg-rose-950/50 active:scale-[0.98]"
                    >
                        <p className="font-bold text-white text-sm md:text-base">Mentor</p>
                        <p className="text-xs text-rose-200/60 mt-0.5">View details</p>
                    </button>
                    <button
                        onClick={openManagerModal}
                        className="rounded-2xl border border-rose-900/50 bg-[#241019]/80 px-4 py-3.5 text-left transition hover:border-rose-400/60 hover:bg-rose-950/50 active:scale-[0.98]"
                    >
                        <p className="font-bold text-white text-sm md:text-base">Manager</p>
                        <p className="text-xs text-rose-200/60 mt-0.5">View details</p>
                    </button>
                </section>

                {/* ============ 3. EARNINGS ============ */}
                <section className="mt-8">
                    <SectionLabel>Total Earnings</SectionLabel>
                    <div className="rounded-3xl border border-rose-900/60 bg-gradient-to-br from-[#2b1220] to-[#732C3F] p-6 text-center relative overflow-hidden">
                        <div className="relative">
                            <p className="text-[10px] tracking-[0.3em] text-rose-200/70">ALL-TIME</p>
                            <p className="font-display mt-2 text-5xl md:text-6xl bg-gradient-to-r from-rose-200 via-rose-400 to-pink-300 bg-clip-text text-transparent tabular-nums">
                                <CountUp end={stats.allTime} prefix="₹" />
                            </p>
                            <div className="mt-5 grid grid-cols-3 gap-2">
                                {[
                                    { label: 'TODAY', value: stats.today },
                                    { label: 'LAST 7 DAYS', value: stats.sevenDays },
                                    { label: 'LAST 30 DAYS', value: stats.thirtyDays },
                                ].map(s => (
                                    <div key={s.label} className="rounded-xl bg-black/30 border border-white/10 px-2 py-3">
                                        <p className="font-mono text-[9px] tracking-[0.2em] text-rose-200/60">{s.label}</p>
                                        <p className="mt-1 text-lg md:text-xl font-extrabold text-white tabular-nums">
                                            <CountUp end={s.value} prefix="₹" />
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ 4. PAYOUTS ============ */}
                <section className="mt-8">
                    <SectionLabel>Payouts</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-amber-400/30 bg-amber-950/40 p-5 text-center">
                            <Wallet className="w-5 h-5 mx-auto text-amber-300/80" />
                            <p className="mt-2 text-[10px] tracking-[0.2em] text-amber-200/70">PENDING</p>
                            <p className="mt-1 text-2xl md:text-3xl font-extrabold text-amber-200 tabular-nums">
                                <CountUp end={stats.pending} prefix="₹" />
                            </p>
                            <p className="mt-1 text-[11px] text-amber-200/60">Pending payout</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-5 text-center">
                            <Trophy className="w-5 h-5 mx-auto text-emerald-300/80" />
                            <p className="mt-2 text-[10px] tracking-[0.2em] text-emerald-200/70">RECEIVED</p>
                            <p className="mt-1 text-2xl md:text-3xl font-extrabold text-emerald-200 tabular-nums">
                                <CountUp end={stats.paid} prefix="₹" />
                            </p>
                            <p className="mt-1 text-[11px] text-emerald-200/60">Transferred to you</p>
                        </div>
                    </div>
                </section>

                {/* ============ 5. INVITE & EARN ============ */}
                <section className="mt-8">
                    <SectionLabel>Invite & Earn</SectionLabel>
                    <div className="rounded-2xl border border-rose-900/60 bg-[#241019]/90 p-5">
                        <p className="text-sm text-rose-100/80 leading-relaxed">
                            Share your invite link. When a friend buys a course through it, you earn a flat 30% commission — no purchase needed to earn, ever.
                        </p>
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3 py-2.5">
                            <p className="flex-1 truncate font-mono text-xs text-rose-100/90">{referralLink}</p>
                        </div>
                        <button
                            onClick={() => copyInvite(referralLink)}
                            className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 py-3 font-bold text-white transition hover:brightness-110 active:scale-[0.99] inline-flex items-center justify-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Invite Link Copied!' : 'Copy Invite Link'}
                        </button>
                    </div>
                </section>

                {/* ============ 6. AFFILIATE (NEW FLAT MODEL) ============ */}
                <AffiliatePanel />

                {/* ============ 7. LEGACY UPGRADE BONUS (READ-ONLY HISTORY) ============ */}
                {legacyPendings.length > 0 && (
                    <section className="mt-8">
                        <SectionLabel>Upgrade Bonus — Ended</SectionLabel>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                            <p className="text-sm text-rose-100/70 leading-relaxed">
                                The Upgrade Bonus program ended with the LearnPeak relaunch. Bonuses that were
                                pending before the change are being settled under the old terms — nothing is
                                cancelled silently. New sales earn the flat commission shown above.
                            </p>
                            <div className="mt-3 space-y-2">
                                {legacyPendings.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-black/25 border border-white/5 px-3 py-2 text-xs">
                                        <span className="truncate text-rose-100/80">{p.soldPackageName} sale</span>
                                        <span className="shrink-0 font-mono tabular-nums">₹{Number(p.pendingAmount || 0).toFixed(2)} · {p.effectiveStatus || p.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </div>

            

            <ManagerModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                data={modalConfig.data}
            />
        </div>
    );
}
