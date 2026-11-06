import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';

// Admin affiliate management: partner-tier approval + KYC review.
export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { userId } = await params;
        const { partnerTier, kycStatus } = await req.json();
        const ref = db.collection('users').doc(userId);
        const doc = await ref.get();
        if (!doc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const updates: any = { updatedAt: new Date().toISOString() };
        if (partnerTier !== undefined) {
            if (!['none', 'pending', 'approved'].includes(partnerTier)) return NextResponse.json({ error: 'Invalid partnerTier' }, { status: 400 });
            updates.partnerTier = partnerTier;
        }
        if (kycStatus !== undefined) {
            if (!['verified', 'rejected', 'pending'].includes(kycStatus)) return NextResponse.json({ error: 'Invalid kycStatus' }, { status: 400 });
            updates.kyc = { ...(doc.data() as any).kyc, status: kycStatus, reviewedAt: new Date().toISOString() };
        }
        await ref.update(updates);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Admin affiliate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
