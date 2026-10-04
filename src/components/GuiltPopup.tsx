'use client';

import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

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

const TIER_FOR_PACKAGE: Record<string, string> = {
    'silicon demo': 'Silver Package',
    'silver package': 'Gold Package',
    'gold package': 'Diamond Package',
};

function upgradeTarget(soldPackageName: string): string {
    return TIER_FOR_PACKAGE[(soldPackageName || '').toLowerCase()] || 'a higher package';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-t-4 border-amber-500">
                <button
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Upgrade Bonus
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    We&apos;re sorry you didn&apos;t get the full amount.
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    You worked hard to make this sale, and we&apos;re embarrassed that only part of
                    your commission reached you. <span className="font-bold text-gray-900">₹{total.toFixed(2)}</span> is
                    waiting in your Upgrade Bonus.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Expires in</p>
                        <p className="text-2xl font-extrabold text-amber-800 tabular-nums">
                            <Clock className="inline w-5 h-5 mr-1 -mt-1" />
                            {formatCountdown(liveMsLeft)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">To claim</p>
                        <p className="text-sm font-bold text-gray-900">Upgrade to {target}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <a
                        href="/dashboard/upgrade"
                        className="flex-1 bg-[#732C3F] text-white text-center py-3 rounded-xl font-bold hover:bg-[#5a2231] transition"
                    >
                        Upgrade Now
                    </a>
                    <button
                        onClick={dismiss}
                        className="px-5 py-3 rounded-xl font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                    >
                        Later
                    </button>
                </div>

                <p className="text-[11px] text-gray-400 mt-3 text-center">
                    Upgrade within 7 days of the sale to claim the full bonus.
                    Unclaimed amounts support children&apos;s education.
                </p>
            </div>
        </div>
    );
}
