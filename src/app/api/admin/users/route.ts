import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminGuard';
import { toAdminSafeUser } from '@/lib/adminUsers';
import * as bcrypt from 'bcryptjs';

const REFERRAL_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export async function GET() {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const snapshot = await db.collection('users').get();
        // Never send password hashes or reset tokens to the browser.
        const users = snapshot.docs.map(doc => toAdminSafeUser(doc.id, doc.data()));

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Admin users list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const name = String(body.name || '').trim();
        // Login looks emails up lower-cased, so store them that way too —
        // a mixed-case email created here could never sign in.
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const phone = String(body.phone || '').trim();
        const role = body.role === 'ADMIN' ? 'ADMIN' : 'USER';

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const userRef = db.collection('users');
        const snapshot = await userRef.where('email', '==', email).limit(1).get();
        if (!snapshot.empty) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Crypto-random referral code with collision retry (same scheme
        // as signup).
        const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'USER').toUpperCase().padEnd(4, 'X');
        let referralCode = '';
        for (let attempt = 0; attempt < 5; attempt++) {
            const suffix = Array.from(crypto.randomBytes(8), (b) => REFERRAL_ALPHABET[b % REFERRAL_ALPHABET.length]).join('');
            referralCode = prefix + suffix;
            const clash = await userRef.where('referralCode', '==', referralCode).limit(1).get();
            if (clash.empty) break;
        }

        await userRef.add({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            referralCode,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin user create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
