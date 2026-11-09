import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminGuard';

export async function GET() {
    try {
        const snapshot = await db.collection('categories').orderBy('order', 'asc').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation
        if (!data.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const newCategory = {
            title: data.title,
            image: data.image || '', // URL or path
            // Stored as a number so orderBy('order') sorts correctly.
            order: Number(data.order) || 0,
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('categories').add(newCategory);
        return NextResponse.json({ id: docRef.id, ...newCategory });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
