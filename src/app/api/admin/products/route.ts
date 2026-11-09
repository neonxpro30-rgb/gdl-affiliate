import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { db } from '@/lib/firebaseAdmin';
import { getProduct, getProducts } from '@/lib/products';

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
        // Range validation (audit #23): a negative price would corrupt
        // checkout amounts; an override above 1 pays out more than the sale.
        if (fields.price !== undefined &&
            !(typeof fields.price === 'number' && Number.isFinite(fields.price) && fields.price >= 0)) {
            return NextResponse.json({ error: 'price must be a number >= 0' }, { status: 400 });
        }
        if (fields.commissionRateOverride !== undefined && fields.commissionRateOverride !== null &&
            !(typeof fields.commissionRateOverride === 'number' && fields.commissionRateOverride >= 0 && fields.commissionRateOverride <= 1)) {
            return NextResponse.json({ error: 'commissionRateOverride must be null or a number between 0 and 1' }, { status: 400 });
        }
        // An active product must cost at least ₹1 — a ₹0 order can't be
        // paid through PayU and would leave the buyer stuck at checkout.
        const existing = await getProduct(slug);
        const willBeActive = fields.active !== undefined ? !!fields.active : !!existing?.active;
        const finalPrice = fields.price !== undefined ? fields.price : Number(existing?.price) || 0;
        if (willBeActive && finalPrice < 1) {
            return NextResponse.json({ error: 'Set a price of at least ₹1 before making this product active' }, { status: 400 });
        }
        await db.collection('products').doc(slug).set(
            { ...fields, updatedAt: new Date().toISOString() }, { merge: true });
        return NextResponse.json({ ok: true, slug });
    } catch (error) {
        console.error('Admin product save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
