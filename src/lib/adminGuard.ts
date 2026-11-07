import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebaseAdmin';

export async function requireAdmin(): Promise<{ ok: boolean; userId?: string }> {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) return { ok: false };

    // Re-read the user doc instead of trusting the JWT role claim
    // (audit #21): the claim is only as fresh as the last login, so a
    // demoted or deactivated admin's old token would otherwise keep
    // working until expiry. The isActive predicate mirrors the login
    // check exactly (only an explicit false denies) so this cannot
    // lock out an admin who can currently sign in.
    try {
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) return { ok: false };
        const data = doc.data() as any;
        if (data.role !== 'ADMIN' || data.isActive === false) return { ok: false };
    } catch {
        return { ok: false };
    }
    return { ok: true, userId };
}
