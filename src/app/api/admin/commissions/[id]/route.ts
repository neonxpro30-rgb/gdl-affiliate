import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { setCommissionStatus, type CommissionStatus } from '@/lib/commission';

// Admin commission actions: approve / hold / reject (with reason).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const { status, note } = await req.json();
        const allowed: CommissionStatus[] = ['approved', 'held', 'rejected', 'confirmed'];
        if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        await setCommissionStatus(id, status, note);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Admin commission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
