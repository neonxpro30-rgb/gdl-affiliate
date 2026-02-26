import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('packages').get();
        const packages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(packages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }
}
