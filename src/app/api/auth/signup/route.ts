import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/firebaseAdmin';
import { rateLimit, clientIp } from '@/lib/rateLimit';

// Referral codes (audit #21): name prefix + 8 crypto-random chars from
// an unambiguous alphabet (no 0/O/1/I/L). The old generator used
// Math.random with only 4 digits (~10k space per prefix) and never
// checked for collisions, so two users could share a code and
// commissions could attach to the wrong referrer.
const REFERRAL_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomSuffix(length: number): string {
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes, (b) => REFERRAL_ALPHABET[b % REFERRAL_ALPHABET.length]).join('');
}

async function generateUniqueReferralCode(usersRef: FirebaseFirestore.CollectionReference, name: string): Promise<string> {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'USER').toUpperCase().padEnd(4, 'X');
    for (let attempt = 0; attempt < 5; attempt++) {
        const code = prefix + randomSuffix(8);
        const clash = await usersRef.where('referralCode', '==', code).limit(1).get();
        if (clash.empty) return code;
    }
    // Statistically unreachable — fall back to a longer suffix.
    return prefix + randomSuffix(12);
}

export async function POST(req: Request) {
    try {
        // Rate limit (audit #25): 20 signups/hour per IP.
        if (!(await rateLimit(`signup_ip_${clientIp(req)}`, 20, 3600_000))) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const { name, email, phone, password, referralCode, packageId, productSlug } = await req.json();

        if (!name || !email || !password || (!packageId && !productSlug)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Normalise email (audit #21): case/whitespace variants of the
        // same address must not create duplicate accounts.
        const normalizedEmail = String(email).trim().toLowerCase();

        if (String(password).length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('email', '==', normalizedEmail).get();

        if (!userSnapshot.empty) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newReferralCode = await generateUniqueReferralCode(usersRef as any, String(name));

        // Find referrer
        let referrerId = null;
        if (referralCode) {
            const referrerSnapshot = await usersRef.where('referralCode', '==', referralCode).limit(1).get();
            if (!referrerSnapshot.empty) {
                referrerId = referrerSnapshot.docs[0].id;
            }
        }

        // Price resolution: NEW catalog products win over legacy packages
        let amount = 0;
        let resolvedProductSlug: string | null = null;
        if (productSlug) {
            const { getProduct } = await import('@/lib/products');
            const product = await getProduct(productSlug);
            if (!product || !product.active) {
                return NextResponse.json({ error: 'Product not available' }, { status: 400 });
            }
            amount = product.price;
            resolvedProductSlug = product.slug;
        } else {
            // Get Package Details (legacy)
            const packageRef = db.collection('packages').doc(packageId);
            const packageDoc = await packageRef.get();

            // Fallback if package not found (should be seeded)
            let packageData = packageDoc.exists ? packageDoc.data() : null;
            amount = packageData ? packageData.price : 0;

            // If package not found in DB, use hardcoded values (temporary safety)
            if (!packageData) {
                if (packageId.includes('silver')) amount = 799;
                else if (packageId.includes('gold')) amount = 1299;
                else if (packageId.includes('diamond')) amount = 3899;
            }
        }

        // Create User
        const newUserRef = usersRef.doc();
        const userId = newUserRef.id;

        await newUserRef.set({
            name,
            email: normalizedEmail,
            phone,
            password: hashedPassword,
            referralCode: newReferralCode,
            role: 'USER',
            isActive: false,
            referrerId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Create Order
        const ordersRef = db.collection('orders');
        const newOrderRef = ordersRef.doc();

        const timestamp = new Date().toISOString();
        await newOrderRef.set({
            userId,
            packageId: resolvedProductSlug ? null : packageId,
            productSlug: resolvedProductSlug,
            affiliateId: referrerId,
            amount,
            status: 'PENDING',
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        // Success
        return NextResponse.json({ message: 'User created', userId, orderId: newOrderRef.id });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
