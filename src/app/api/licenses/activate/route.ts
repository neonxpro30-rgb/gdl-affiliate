import { NextResponse } from 'next/server';
import { activateLicence } from '@/lib/licenses';
import { rateLimit, clientIp } from '@/lib/rateLimit';

// Extension licence activation — called by the Premiere Pro extensions.
// Enforces the per-licence machine limit from settings.
export async function POST(req: Request) {
    try {
        // Rate limit (audit #25): 30/minute per IP — blunts key guessing
        // against this unauthenticated endpoint.
        if (!(await rateLimit(`activate_ip_${clientIp(req)}`, 30, 60_000))) {
            return NextResponse.json({ ok: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
        }
        const { key, machineId } = await req.json();
        const result = await activateLicence(key, machineId);
        return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    } catch (error) {
        console.error('Licence activation error:', error);
        return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
}
