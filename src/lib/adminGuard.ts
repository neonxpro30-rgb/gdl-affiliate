import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireAdmin(): Promise<{ ok: boolean; userId?: string }> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') return { ok: false };
    return { ok: true, userId: (session.user as any).id };
}
