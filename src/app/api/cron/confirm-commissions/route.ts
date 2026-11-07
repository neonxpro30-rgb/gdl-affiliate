import { NextResponse } from 'next/server';
import { runCommissionLifecycle } from '@/lib/commission';

// Cron-able endpoint: advances v2 commissions pending -> confirmed ->
// approved once the 48h window passes. Protect with CRON_SECRET in
// production (Vercel Cron sends it as a Bearer token).
export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET;
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
