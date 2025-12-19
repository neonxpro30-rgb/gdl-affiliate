import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Fields allowed to update
        const { name, email, phone, bankName, accountNumber, ifscCode, upiId, role, password, packageId, isActive } = body;

        const updateData: any = {
            name, email, phone,
            bankName, accountNumber, ifscCode, upiId,
            role,
            updatedAt: new Date().toISOString()
        };

        // Handle isActive field (for activate/deactivate)
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
        }

        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (password) {
            const bcrypt = require('bcryptjs');
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (packageId) {
            // Store packageId on user document for easier access control
            updateData.packageId = packageId;

            // Also update the user's latest SUCCESS order to reflect this package
            const ordersSnapshot = await db.collection('orders')
                .where('userId', '==', id)
                .where('status', '==', 'SUCCESS')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!ordersSnapshot.empty) {
                const latestOrderRef = ordersSnapshot.docs[0].ref;
                await latestOrderRef.update({
                    packageId: packageId,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        await db.collection('users').doc(id).update(updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await db.collection('users').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
