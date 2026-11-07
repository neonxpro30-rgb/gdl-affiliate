import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
    try {
        // Rate limit (audit #25): 10/hour per IP — token guessing must
        // stay impractical even with a leaked email address.
        if (!(await rateLimit(`reset_ip_${clientIp(req)}`, 10, 3600_000))) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }
        const { token, email, newPassword } = await req.json();

        if (!token || !email) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }
        if (!newPassword || String(newPassword).length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Tokens are stored as SHA-256 hashes (audit #12) — hash the
        // presented token and compare hashes in constant time.
        const presentedHash = crypto.createHash('sha256').update(String(token)).digest('hex');
        const storedHash = String(userData.resetToken || '');
        const hashesMatch = storedHash.length === presentedHash.length &&
            crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(presentedHash));

        if (!hashesMatch || !userData.resetTokenExpiry || userData.resetTokenExpiry < Date.now()) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await usersRef.doc(userDoc.id).update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
