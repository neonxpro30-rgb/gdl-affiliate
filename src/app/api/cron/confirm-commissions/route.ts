import { NextResponse } from 'next/server';
import { runCommissionLifecycle } from '@/lib/commission';

// Cron-able endpoint: advances v2 commissions pending -> confirmed ->
// approved once the 48h window passes. Protect with CRON_SECRET in
// production (Vercel Cron sends it as a Bearer token).
export async function GET(req: Request) {
    // Fail closed in production (audit 2026-11-07, high #14): previously a
    // missing CRON_SECRET left this endpoint open to anyone.
    const secret = process.env.CRON_SECRET;
    if (process.env.NODE_ENV === 'production' && !secret) {
        return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
    }
    if (secret) {
        const auth = req.headers.get('authorization');
        if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const result = await runCommissionLifecycle();
        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        console.error('Commission lifecycle error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
