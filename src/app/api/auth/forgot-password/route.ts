import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            // Return success even if email not found to prevent enumeration
            return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        const userDoc = snapshot.docs[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        await usersRef.doc(userDoc.id).update({
            resetToken,
            resetTokenExpiry
        });

        // In a real app, send email here.
        // For this demo/local setup, we will log it to the console.
        console.log(`[RESET PASSWORD] Token for ${email}: ${resetToken}`);
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        console.log(`[RESET LINK] ${baseUrl}/reset-password?token=${resetToken}&email=${email}`);

        return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
