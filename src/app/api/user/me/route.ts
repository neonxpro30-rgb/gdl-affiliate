import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userDoc = await db.collection('users').doc(session.user.id).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data() as any;
        // Whitelist (audit #18): never return the full user doc — it holds
        // the password hash, reset token, KYC documents and bank/UPI
        // details. Only the safe profile fields below leave the server.
        const profile: Record<string, any> = { id: userDoc.id };
        const safeFields = ['name', 'email', 'phone', 'role', 'isActive', 'referralCode', 'partnerTier', 'createdAt', 'image', 'avatar'] as const;
        for (const field of safeFields) {
            if (userData[field] !== undefined) profile[field] = userData[field];
        }
        profile.kycStatus = userData.kycStatus ?? userData.kyc?.status ?? 'none';
        return NextResponse.json(profile);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
