import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminGuard';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Fields allowed to update
        const { name, email, phone, bankName, accountNumber, ifscCode, upiId, role, password, packageId, isActive } = body;

        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (role !== undefined && role !== 'USER' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Role must be USER or ADMIN' }, { status: 400 });
        }
        // An admin must not lock themselves out by mistake.
        if (id === guard.userId && (role === 'USER' || isActive === false)) {
            return NextResponse.json({ error: 'You cannot remove your own admin access or deactivate yourself' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            name, phone,
            bankName, accountNumber, ifscCode, upiId,
            role,
            updatedAt: new Date().toISOString()
        };

        if (email !== undefined) {
            // Login looks emails up lower-cased.
            const normalizedEmail = String(email).trim().toLowerCase();
            if (!normalizedEmail) return NextResponse.json({ error: 'Email cannot be empty' }, { status: 400 });
            if (normalizedEmail !== (userDoc.data() as any)?.email) {
                const clash = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();
                if (!clash.empty && clash.docs[0].id !== id) {
                    return NextResponse.json({ error: 'Another account already uses this email' }, { status: 400 });
                }
            }
            updateData.email = normalizedEmail;
        }

        // Handle isActive field (for activate/deactivate)
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
        }

        // Remove undefined keys (Firestore rejects undefined values)
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        // Only a non-empty, plain new password is hashed. A bcrypt hash
        // must never be re-hashed (that silently changes the password).
        if (typeof password === 'string' && password.length > 0 && !/^\$2[aby]\$\d{2}\$/.test(password)) {
            if (password.length < 8) {
                return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (packageId) {
            // Store packageId on user document for easier access control
            updateData.packageId = packageId;

            // Also update the user's latest legacy SUCCESS order to reflect
            // this package. New-catalog orders (productSlug) are left alone.
            const ordersSnapshot = await db.collection('orders')
                .where('userId', '==', id)
                .where('status', '==', 'SUCCESS')
                .get();

            const legacyOrders = ordersSnapshot.docs
                .map(doc => ({ ref: doc.ref, data: doc.data() as any }))
                .filter(o => !o.data.productSlug);
            if (legacyOrders.length) {
                legacyOrders.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
                await legacyOrders[0].ref.update({
                    packageId: packageId,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        await userRef.update(updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin user update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (id === guard.userId) {
            return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
        }

        await db.collection('users').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin user delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
