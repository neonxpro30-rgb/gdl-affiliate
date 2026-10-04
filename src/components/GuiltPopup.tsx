'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Gift } from 'lucide-react';

interface PendingItem {
    id: string;
    soldPackageName: string;
    pendingAmount: number;
    msLeft: number;
    effectiveStatus: string;
}

function formatCountdown(ms: number): string {
    if (ms <= 0) return 'Expired';
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Claim rule is ownedTier >= soldTier, so the upgrade target IS the sold
 * package's own tier — never one above it. (Telling the user to buy a
 * costlier tier than needed would be dishonest.)
 */
function upgradeTarget(soldPackageName: string): string {
    const name = (soldPackageName || '').trim();
    return name || 'a higher package';
}

/**
 * Guilt popup — shows once per session while the user has active
 * (within-window) Upgrade Bonus pendings. Dismissible, never harassing.
 * Company voice, professional English.
 */
export default function GuiltPopup({ pendings }: { pendings: PendingItem[] }) {
    const [visible, setVisible] = useState(false);

    const active = pendings.filter(p => p.effectiveStatus === 'PENDING' && p.msLeft > 0);
    const [mountedAt] = useState(() => Date.now());

    useEffect(() => {
        // Show once per browser session
        try {
            if (sessionStorage.getItem('lp_bonus_popup_dismissed') === '1') return;
        } catch { /* ignore */ }
        if (active.length > 0) setVisible(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendings.length]);

    const [, setTick] = useState(0);
    useEffect(() => {
        if (!visible) return;
        const t = setInterval(() => setTick(x => x + 1), 1000);
        return () => clearInterval(t);
    }, [visible]);

    if (!visible || active.length === 0) return null;

    const total = active.reduce((s, p) => s + p.pendingAmount, 0);
    // Earliest expiring pending drives the headline
    const first = [...active].sort((a, b) => a.msLeft - b.msLeft)[0];
    const target = upgradeTarget(first.soldPackageName);
    const liveMsLeft = Math.max(0, first.msLeft - (Date.now() - mountedAt));

    const dismiss = () => {
        try { sessionStorage.setItem('lp_bonus_popup_dismissed', '1'); } catch { /* ignore */ }
        setVisible(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
            <div className="scanlines relative bg-[#241019] rounded-2xl shadow-[0_0_60px_rgba(251,191,36,0.25)] max-w-md w-full p-6 border-2 border-amber-400/50 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_70%)]" />
                <button
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="absolute top-3 right-3 text-rose-200/50 hover:text-white transition z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            <Gift className="w-3.5 h-3.5" />
                            Upgrade Bonus
                        </span>
                    </div>

                    <h3 className="font-display text-2xl uppercase tracking-wide text-white mb-3">
                        We&apos;re sorry you didn&apos;t get the full amount.
                    </h3>

                    <p className="text-rose-100/70 text-sm leading-relaxed mb-4">
                        You worked hard to make this sale, and we&apos;re embarrassed that only part of
                        your commission reached you. <span className="font-extrabold text-amber-300">₹{total.toFixed(2)}</span> is
                        waiting in your Upgrade Bonus.
                    </p>

                    <div className="bg-black/40 border border-amber-400/30 rounded-xl p-4 mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-amber-200/70 tracking-[0.2em] uppercase">Expires in</p>
                            <p className="text-2xl font-extrabold text-amber-300 tabular-nums mt-1">
                                <Clock className="inline w-5 h-5 mr-1 -mt-1" />
                                {formatCountdown(liveMsLeft)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-amber-200/70 tracking-[0.2em] uppercase">To claim</p>
                            <p className="text-sm font-bold text-white mt-1">Upgrade to {target}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href="/dashboard/upgrade"
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-center py-3 rounded-xl font-bold text-[#1A0B12] hover:brightness-110 transition"
                        >
                            Claim My Bonus
                        </a>
                        <button
                            onClick={dismiss}
                            className="px-5 py-3 rounded-xl font-medium text-rose-200/60 hover:text-white hover:bg-white/5 transition"
                        >
                            Later
                        </button>
                    </div>

                    <p className="text-[11px] text-rose-100/40 mt-3 text-center">
                        Upgrade within 7 days of the sale to claim the full bonus.
                        Unclaimed amounts support children&apos;s education.
                    </p>
                </div>
            </div>
        </div>
    );
}
