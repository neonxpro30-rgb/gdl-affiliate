'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
        <p className="lpd-pixel text-[13px] tracking-[0.14em] text-[#D93C78] mb-3 uppercase">
            {children}
        </p>
    );
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
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
        // redirect() only works during render; inside an effect it throws
        // and the logged-out visitor saw a blank page. Navigate instead.
        if (status === 'unauthenticated') {
            router.replace('/login?next=/dashboard');
            return;
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
    }, [session, status, router]);

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
            <div className="lpd-shell min-h-screen flex items-center justify-center">
                <p className="text-sm text-[#6B5F80]">Loading…</p>
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
        <div className="lpd-shell min-h-screen relative overflow-hidden">
            {/* soft ambient glow */}
            <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-[#FFE9F3] blur-[120px]" />

            <DashboardNavbar user={displayUser} />

            <div className="relative max-w-md md:max-w-4xl mx-auto px-4 pt-6 pb-24">

                {/* ============ 1. PROFILE CARD ============ */}
                <section className="lpd-card p-5 md:p-6 relative overflow-hidden">
                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* avatar in ring */}
                        <div className="relative shrink-0 self-start sm:self-auto">
                            <div className="rounded-full bg-gradient-to-br from-[#FF8AC4] via-[#FFE9F3] to-[#E8E2F0] p-[3px]">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[#FFF8FB] flex items-center justify-center">
                                    {displayUser.photoURL ? (
                                        <img src={displayUser.photoURL} alt={displayUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={36} className="text-[#D93C78]" />
                                    )}
                                </div>
                            </div>
                            {ownedTier && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 lpd-badge lpd-badge-butter whitespace-nowrap">
                                    {ownedTier.medal} {ownedTier.lvl}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="lpd-display text-2xl md:text-3xl uppercase tracking-wide truncate text-[#1E1530]">{displayUser.name}</h1>
                            <p className="text-[#6B5F80] text-sm font-medium mt-0.5">
                                {ownedTier ? `${ownedTier.name} Package` : packageName}
                            </p>
                            {/* level progress */}
                            <div className="mt-3">
                                <div className="mb-1.5 flex items-center justify-between text-[10px] tracking-[0.2em] text-[#6B5F80]">
                                    <span>{ownedTier && ownedTier.rank < 4 ? `NEXT: LVL ${ownedTier.rank + 1} ${TIERS[ownedTier.rank].name.toUpperCase()}` : ownedTier ? 'MAX LEVEL REACHED' : 'LEVEL'}</span>
                                </div>
                                <div className="lpd-progress h-2">
                                    <i
                                        className="transition-all duration-700"
                                        style={{ width: `${xpPct}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* referral code */}
                    <div className="relative mt-5 flex items-center justify-between gap-3 rounded-xl border border-[rgba(59,49,80,0.14)] bg-[#FFE9F3] px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-[10px] tracking-[0.25em] text-[#6B5F80]">REFERRAL CODE</p>
                            <p className="font-mono text-base md:text-lg font-bold text-[#3B3150] tracking-wider truncate">{displayUser.referralCode}</p>
                        </div>
                        <button
                            onClick={() => copyInvite(displayUser.referralCode || '')}
                            className="lpd-btn lpd-btn-sm shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4 text-[#0F8E69]" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </section>

                {/* ============ 2. MENTOR & MANAGER ============ */}
                <section className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={openMentorModal}
                        className="lpd-card lpd-card-hover px-4 py-3.5 text-left transition active:scale-[0.98] min-h-[44px]"
                    >
                        <p className="font-bold text-[#3B3150] text-sm md:text-base">Mentor</p>
                        <p className="text-xs text-[#6B5F80] mt-0.5">View details</p>
                    </button>
                    <button
                        onClick={openManagerModal}
                        className="lpd-card lpd-card-hover px-4 py-3.5 text-left transition active:scale-[0.98] min-h-[44px]"
                    >
                        <p className="font-bold text-[#3B3150] text-sm md:text-base">Manager</p>
                        <p className="text-xs text-[#6B5F80] mt-0.5">View details</p>
                    </button>
                </section>

                {/* ============ 3. EARNINGS ============ */}
                <section className="mt-8">
                    <SectionLabel>Total Earnings</SectionLabel>
                    <div className="lpd-banner p-6 text-center relative overflow-hidden">
                        <div className="relative">
                            <p className="text-[10px] tracking-[0.3em] text-[#6B5F80]">ALL-TIME</p>
                            <p className="lpd-display mt-2 text-4xl sm:text-5xl md:text-6xl text-[#D93C78] tabular-nums break-words">
                                <CountUp end={stats.allTime} prefix="₹" />
                            </p>
                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[
                                    { label: 'TODAY', value: stats.today },
                                    { label: 'LAST 7 DAYS', value: stats.sevenDays },
                                    { label: 'LAST 30 DAYS', value: stats.thirtyDays },
                                ].map(s => (
                                    <div key={s.label} className="rounded-xl bg-white border border-[rgba(59,49,80,0.14)] px-2 py-3">
                                        <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B5F80]">{s.label}</p>
                                        <p className="mt-1 text-lg md:text-xl font-extrabold text-[#3B3150] tabular-nums">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="lpd-card p-5 text-center" style={{ background: '#FFE9AE', borderColor: 'rgba(59,49,80,0.25)' }}>
                            <Wallet className="w-5 h-5 mx-auto text-[#3B3150]" />
                            <p className="mt-2 text-[10px] tracking-[0.2em] text-[#6B5F80]">PENDING</p>
                            <p className="mt-1 text-2xl md:text-3xl font-extrabold text-[#3B3150] tabular-nums">
                                <CountUp end={stats.pending} prefix="₹" />
                            </p>
                            <p className="mt-1 text-[11px] text-[#6B5F80]">Pending payout</p>
                        </div>
                        <div className="lpd-card p-5 text-center" style={{ background: '#E9FBF4', borderColor: 'rgba(15,142,105,0.35)' }}>
                            <Trophy className="w-5 h-5 mx-auto text-[#0F8E69]" />
                            <p className="mt-2 text-[10px] tracking-[0.2em] text-[#0F8E69]">RECEIVED</p>
                            <p className="mt-1 text-2xl md:text-3xl font-extrabold text-[#0F8E69] tabular-nums">
                                <CountUp end={stats.paid} prefix="₹" />
                            </p>
                            <p className="mt-1 text-[11px] text-[#6B5F80]">Transferred to you</p>
                        </div>
                    </div>
                </section>

                {/* ============ 5. INVITE & EARN ============ */}
                <section className="mt-8">
                    <SectionLabel>Invite & Earn</SectionLabel>
                    <div className="lpd-card p-5">
                        <p className="text-sm text-[#6B5F80] leading-relaxed">
                            Share your invite link. When a friend buys a course through it, you earn a flat 30% commission — no purchase needed to earn, ever.
                        </p>
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF8FB] border border-[rgba(59,49,80,0.14)] px-3 py-2.5">
                            <p className="flex-1 truncate font-mono text-xs text-[#3B3150]">{referralLink}</p>
                        </div>
                        <button
                            onClick={() => copyInvite(referralLink)}
                            className="lpd-btn lpd-btn-pink lpd-btn-block mt-3"
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
                        <div className="lpd-card p-5">
                            <p className="text-sm text-[#6B5F80] leading-relaxed">
                                The Upgrade Bonus program ended with the LearnPeak relaunch. Bonuses that were
                                pending before the change are being settled under the old terms — nothing is
                                cancelled silently. New sales earn the flat commission shown above.
                            </p>
                            <div className="mt-3 space-y-2">
                                {legacyPendings.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#FFF8FB] border border-[rgba(59,49,80,0.14)] px-3 py-2 text-xs">
                                        <span className="truncate text-[#3B3150]">{p.soldPackageName} sale</span>
                                        <span className="shrink-0 font-mono tabular-nums text-[#3B3150]">₹{Number(p.pendingAmount || 0).toFixed(2)} · {p.effectiveStatus || p.status}</span>
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
