import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';

// KYC submission (PAN + bank account or UPI). Required before the first
// payout. Admin verifies/rejects from the Affiliates tab.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { pan, bankOrUpi, accountName } = await req.json();
        if (!pan || !bankOrUpi) return NextResponse.json({ error: 'PAN and bank/UPI are required' }, { status: 400 });

        await db.collection('users').doc(session.user.id).update({
            kyc: {
                pan: String(pan).toUpperCase(),
                bankOrUpi: String(bankOrUpi),
                accountName: accountName || '',
                status: 'pending',
                submittedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, status: 'pending' });
    } catch (error) {
        console.error('KYC error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
