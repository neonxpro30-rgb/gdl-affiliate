import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import * as bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate Income for each user (Optional: can be expensive if many users)
        // For now, let's just return basic details. Income calculation might need a separate aggregation.

        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, password, role, phone } = body;

        // Check if user exists
        const userRef = db.collection('users');
        const snapshot = await userRef.where('email', '==', email).get();
        if (!snapshot.empty) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Crypto-random referral code with collision retry (audit #21 —
        // matches the signup generator; the old 4-digit Math.random scheme
        // was enumerable and collision-prone)
        const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let referralCode = '';
        for (let attempt = 0; attempt < 5; attempt++) {
            const bytes = require('crypto').randomBytes(8);
            const suffix = Array.from(bytes, (b: any) => ALPHABET[(b as number) % ALPHABET.length]).join('');
            referralCode = name.substring(0, 4).toUpperCase() + suffix;
            const clash = await userRef.where('referralCode', '==', referralCode).limit(1).get();
            if (clash.empty) break;
        }

        await userRef.add({
            name,
            email,
            password: hashedPassword,
            role: role || 'USER',
            phone: phone || '',
            referralCode,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
