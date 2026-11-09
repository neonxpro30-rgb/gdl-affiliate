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
        const userSnapshot = await usersRef.where('email', '==', normalizedEmail).limit(1).get();

        // An account that signed up but never paid is inactive, and login
        // refuses inactive accounts — so without this the person could
        // never finish buying. If they prove it's theirs (same password),
        // reuse the account and create a fresh order.
        let existingUser: { id: string; data: any } | null = null;
        if (!userSnapshot.empty) {
            const doc = userSnapshot.docs[0];
            const data = doc.data() as any;
            if (data.isActive !== false) {
                return NextResponse.json({ error: 'An account with this email already exists. Please log in and buy the course from your dashboard.' }, { status: 400 });
            }
            const samePassword = data.password ? await bcrypt.compare(String(password), data.password) : false;
            if (!samePassword) {
                return NextResponse.json({ error: 'This email already started a signup but payment was not completed. Use the same password as before, or reset it with "Forgot password".' }, { status: 400 });
            }
            existingUser = { id: doc.id, data };
        }

        // Find referrer (codes are stored upper-case; the verify endpoint
        // already upper-cases, so match that here too)
        let referrerId: string | null = existingUser?.data?.referrerId || null;
        const normalizedReferral = String(referralCode || '').trim().toUpperCase();
        if (normalizedReferral && !referrerId) {
            const referrerSnapshot = await usersRef.where('referralCode', '==', normalizedReferral).limit(1).get();
            if (!referrerSnapshot.empty && referrerSnapshot.docs[0].id !== existingUser?.id) {
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
            if (!/^[A-Za-z0-9_-]{1,100}$/.test(String(packageId))) {
                return NextResponse.json({ error: 'Package not available' }, { status: 400 });
            }
            const packageDoc = await db.collection('packages').doc(String(packageId)).get();
            const packageData = packageDoc.exists ? packageDoc.data() : null;
            amount = Number(packageData?.price) || 0;
        }

        // A ₹0 (or unknown) item can't be paid through PayU.
        if (!(amount >= 1)) {
            return NextResponse.json({ error: 'This course is not available for purchase right now' }, { status: 400 });
        }

        let userId: string;
        if (existingUser) {
            userId = existingUser.id;
            await usersRef.doc(userId).update({
                name,
                phone: String(phone || ''),
                ...(referrerId && !existingUser.data.referrerId ? { referrerId } : {}),
                updatedAt: new Date().toISOString(),
            });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newReferralCode = await generateUniqueReferralCode(usersRef as any, String(name));

            // Create User
            const newUserRef = usersRef.doc();
            userId = newUserRef.id;

            await newUserRef.set({
                name,
                email: normalizedEmail,
                // Firestore rejects undefined values
                phone: String(phone || ''),
                password: hashedPassword,
                referralCode: newReferralCode,
                role: 'USER',
                isActive: false,
                referrerId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        // Create Order
        const ordersRef = db.collection('orders');
        const newOrderRef = ordersRef.doc();

        const timestamp = new Date().toISOString();
        await newOrderRef.set({
            userId,
            packageId: resolvedProductSlug ? null : String(packageId),
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
