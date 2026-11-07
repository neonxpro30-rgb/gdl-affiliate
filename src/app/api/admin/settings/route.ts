import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { getSettings, saveSettings } from '@/lib/settings';

export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ settings: await getSettings() });
}

// Server-side range validation (audit #23): an admin typo must not be
// able to persist a 150% pass mark, a negative price-like value, or a
// commission rate above 100%. Out-of-range → 400, nothing is clamped
// silently. Field semantics follow src/lib/settings.ts: rates are
// fractions [0,1]; couponDiscountPct and tds.pct are percents [0,100].
function validateSettingsPatch(patch: any): string | null {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return 'Settings patch must be an object';
    const isNum = (v: any) => typeof v === 'number' && Number.isFinite(v);
    const inRange = (v: any, min: number, max: number) => isNum(v) && v >= min && v <= max;

    if (patch.rates !== undefined && patch.rates !== null) {
        if (typeof patch.rates !== 'object') return 'rates must be an object';
        for (const k of ['course', 'partner', 'extension', 'demo'] as const) {
            if (patch.rates[k] !== undefined && !inRange(patch.rates[k], 0, 1)) {
                return `rates.${k} must be a number between 0 and 1`;
            }
        }
    }
    if (patch.demoFixedCommissionInr !== undefined && !(isNum(patch.demoFixedCommissionInr) && patch.demoFixedCommissionInr >= 0)) {
        return 'demoFixedCommissionInr must be a number >= 0';
    }
    if (patch.couponDiscountPct !== undefined && !inRange(patch.couponDiscountPct, 0, 100)) {
        return 'couponDiscountPct must be a number between 0 and 100';
    }
    if (patch.confirmAfterHours !== undefined && !(isNum(patch.confirmAfterHours) && patch.confirmAfterHours >= 0)) {
        return 'confirmAfterHours must be a number >= 0';
    }
    if (patch.payout !== undefined && patch.payout !== null) {
        if (typeof patch.payout !== 'object') return 'payout must be an object';
        if (patch.payout.minAmount !== undefined && !(isNum(patch.payout.minAmount) && patch.payout.minAmount >= 0)) {
            return 'payout.minAmount must be a number >= 0';
        }
    }
    if (patch.tds !== undefined && patch.tds !== null) {
        if (typeof patch.tds !== 'object') return 'tds must be an object';
        if (patch.tds.pct !== undefined && patch.tds.pct !== null && !inRange(patch.tds.pct, 0, 100)) {
            return 'tds.pct must be null or a number between 0 and 100';
        }
        if (patch.tds.yearlyThreshold !== undefined && patch.tds.yearlyThreshold !== null &&
            !(isNum(patch.tds.yearlyThreshold) && patch.tds.yearlyThreshold >= 0)) {
            return 'tds.yearlyThreshold must be null or a number >= 0';
        }
    }
    if (patch.test !== undefined && patch.test !== null) {
        if (typeof patch.test !== 'object') return 'test must be an object';
        if (patch.test.passMarkPct !== undefined && !inRange(patch.test.passMarkPct, 0, 100)) {
            return 'test.passMarkPct must be a number between 0 and 100';
        }
        if (patch.test.retakeCooldownHours !== undefined && !inRange(patch.test.retakeCooldownHours, 0, 720)) {
            return 'test.retakeCooldownHours must be a number between 0 and 720';
        }
    }
    if (patch.activationLimit !== undefined &&
        !(Number.isInteger(patch.activationLimit) && patch.activationLimit >= 1 && patch.activationLimit <= 20)) {
        return 'activationLimit must be an integer between 1 and 20';
    }
    return null;
}

export async function POST(req: Request) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const patch = await req.json();
        const invalid = validateSettingsPatch(patch);
        if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
        const settings = await saveSettings(patch);
        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Admin settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
