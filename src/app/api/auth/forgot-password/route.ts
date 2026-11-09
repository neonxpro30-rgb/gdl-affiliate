import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
    try {
        // Rate limit (audit #25): 5/hour per IP, 3/hour per email.
        const ip = clientIp(req);
        if (!(await rateLimit(`forgot_ip_${ip}`, 5, 3600_000))) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }
        const body = await req.json();
        // Accounts store emails lower-cased; normalise so "Name@Gmail.com"
        // still finds the account.
        const email = String(body.email || '').trim().toLowerCase();
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        if (!(await rateLimit(`forgot_email_${email}`, 3, 3600_000))) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            // Return success even if email not found to prevent enumeration
            return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        const userDoc = snapshot.docs[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Store only the SHA-256 hash of the token — a database leak must
        // not hand out usable reset tokens (audit #12). The raw token
        // exists only in the emailed link.
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        await usersRef.doc(userDoc.id).update({
            resetToken: resetTokenHash,
            resetTokenExpiry
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        await sendPasswordResetEmail(email, resetLink);

        return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
