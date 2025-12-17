import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
    try {
        const { name, email, phone, password, referralCode, packageId } = await req.json();

        if (!name || !email || !password || !packageId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('email', '==', email).get();

        if (!userSnapshot.empty) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newReferralCode = name.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

        // Find referrer
        let referrerId = null;
        if (referralCode) {
            const referrerSnapshot = await usersRef.where('referralCode', '==', referralCode).limit(1).get();
            if (!referrerSnapshot.empty) {
                referrerId = referrerSnapshot.docs[0].id;
            }
        }

        // Get Package Details
        const packageRef = db.collection('packages').doc(packageId);
        const packageDoc = await packageRef.get();

        // Fallback if package not found (should be seeded)
        let packageData = packageDoc.exists ? packageDoc.data() : null;
        let amount = packageData ? packageData.price : 0;

        // If package not found in DB, use hardcoded values (temporary safety)
        if (!packageData) {
            if (packageId.includes('silver')) amount = 799;
            else if (packageId.includes('gold')) amount = 1299;
            else if (packageId.includes('diamond')) amount = 3899;
        }

        // Create User
        const newUserRef = usersRef.doc();
        const userId = newUserRef.id;

        await newUserRef.set({
            name,
            email,
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
            packageId,
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
