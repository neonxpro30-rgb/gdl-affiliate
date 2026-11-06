import { NextResponse } from 'next/server';
import { activateLicence } from '@/lib/licenses';

// Extension licence activation — called by the Premiere Pro extensions.
// Enforces the per-licence machine limit from settings.
export async function POST(req: Request) {
    try {
        const { key, machineId } = await req.json();
        const result = await activateLicence(key, machineId);
        return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    } catch (error) {
        console.error('Licence activation error:', error);
        return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
}
