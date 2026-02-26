import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('referralCode', '==', code.toUpperCase()).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ valid: false, message: 'Invalid referral code' });
        }

        const user = snapshot.docs[0].data();

        return NextResponse.json({
            valid: true,
            name: user.name
        });

    } catch (error) {
        console.error('Referral verification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
