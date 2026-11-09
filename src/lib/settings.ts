import { db } from '@/lib/firebaseAdmin';

// Central, admin-editable configuration for the relaunched LearnPeak.
// Stored as a single Firestore doc: settings/main. Every value has a
// code default so the site keeps working before the doc is seeded,
// and so the build (mock DB) never crashes.

export interface LearnPeakSettings {
    rates: { course: number; partner: number; extension: number; demo: number };
    demoFixedCommissionInr: number; // demo (Silicon) sales pay a FIXED ₹ amount, not a % — the old Silicon default, kept per Naksh 2026-11-07
    couponDiscountPct: number; // buyer discount when an affiliate coupon is used (5-10)
    confirmAfterHours: number; // pending -> confirmed window (covers the 24h refund window + buffer)
    payout: { minAmount: number; cadence: 'weekly' | 'fortnightly' };
    tds: { pct: number | null; yearlyThreshold: number | null }; // null until Naksh's CA confirms
    test: { passMarkPct: number; retakeCooldownHours: number };
    activationLimit: number; // machines per extension licence
    cutoverAt: string | null; // ISO timestamp; new affiliate rules apply to sales after this. Set at go-live.
    business: {
        legalName: string;
        address: string;
        udyam: string;
        gst: string;
        supportEmail: string;
    };
}

export const DEFAULT_SETTINGS: LearnPeakSettings = {
    rates: { course: 0.30, partner: 0.40, extension: 0.18, demo: 0 },
    demoFixedCommissionInr: 17,
    couponDiscountPct: 5,
    confirmAfterHours: 48,
    payout: { minAmount: 500, cadence: 'weekly' },
    tds: { pct: null, yearlyThreshold: null },
    test: { passMarkPct: 70, retakeCooldownHours: 24 },
    activationLimit: 2,
    // Relaunch go-live moment (2026-11-07 ~16:30 IST). Defaulting to this —
    // instead of null — means the legacy 70% + Upgrade Bonus engine can
    // never silently re-arm if the settings doc is missing (audit #15).
    // Admin can still override by saving an explicit value.
    cutoverAt: '2026-11-07T11:00:00.000Z',
    business: {
        legalName: 'LearnPeak',
        address: '', // placeholder — Naksh provides the registered business address
        udyam: '', // placeholder
        gst: '', // placeholder
        supportEmail: '', // placeholder — domain email once set up (falls back to learnpeak.in@gmail.com in copy)
    },
};

// Fields an admin may clear back to null ("not set"). Everything else
// ignores a null patch — notably cutoverAt, which must never be unset
// (that would re-arm the legacy commission engine).
const NULLABLE_KEYS = new Set(['pct', 'yearlyThreshold']);

function deepMerge<T>(base: T, patch: any): T {
    if (patch === null || patch === undefined) return base;
    if (typeof base !== 'object' || base === null || Array.isArray(base)) return (patch as T) ?? base;
    const out: any = { ...(base as any) };
    for (const key of Object.keys(base as any)) {
        if (key in patch && patch[key] === null && NULLABLE_KEYS.has(key)) {
            out[key] = null;
            continue;
        }
        out[key] = key in patch ? deepMerge((base as any)[key], patch[key]) : (base as any)[key];
    }
    return out;
}

export async function getSettings(): Promise<LearnPeakSettings> {
    try {
        const doc = await db.collection('settings').doc('main').get();
        if (!doc.exists) return DEFAULT_SETTINGS;
        return deepMerge(DEFAULT_SETTINGS, doc.data() || {});
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function saveSettings(patch: Partial<LearnPeakSettings>): Promise<LearnPeakSettings> {
    const current = await getSettings();
    const next = deepMerge(current, patch);
    await db.collection('settings').doc('main').set(next, { merge: true });
    return next;
}
