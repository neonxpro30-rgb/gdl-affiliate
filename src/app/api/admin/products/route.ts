import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';
import { getProducts } from '@/lib/products';

// Products & prices (new catalog). Prices are edited here, never in code.
export async function GET() {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const products = await getProducts();
    return NextResponse.json({ products });
}

export async function POST(req: Request) {
    if (!(await requireAdmin()).ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await req.json();
        const { slug, ...fields } = body;
        if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
        await db.collection('products').doc(slug).set(
            { ...fields, updatedAt: new Date().toISOString() }, { merge: true });
        return NextResponse.json({ ok: true, slug });
    } catch (error) {
        console.error('Admin product save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
