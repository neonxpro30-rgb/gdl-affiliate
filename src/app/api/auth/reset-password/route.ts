import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import * as bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, email, newPassword } = await req.json();

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.resetToken !== token || userData.resetTokenExpiry < Date.now()) {
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
