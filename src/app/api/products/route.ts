import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/products';

// Public catalog (new products). Legacy /api/packages stays for old buyers.
export async function GET() {
    try {
        const products = await getProducts({ visibleOnly: true });
        const pub = products.map(p => ({
            slug: p.slug, title: p.title, type: p.type, price: p.price,
            active: p.active, tagline: p.tagline || '', version: p.version || '',
            premiereVersions: p.premiereVersions || [], includes: p.includes || [],
        }));
        return NextResponse.json(pub);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
