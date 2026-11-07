import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { getSettings, saveSettings } from '@/lib/settings';

export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ settings: await getSettings() });
}

export async function POST(req: Request) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const patch = await req.json();
        const settings = await saveSettings(patch);
        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Admin settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
