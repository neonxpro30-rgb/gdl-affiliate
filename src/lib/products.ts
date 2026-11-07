import { db } from '@/lib/firebaseAdmin';

// New product catalog for the relaunch (Firestore collection: products,
// keyed by slug). Prices are editable in admin — never hard-code them in
// pages; use getProducts()/getProduct(). SEED_PRODUCTS is the initial
// catalog + the build-time/mock fallback so the homepage always renders.

export type ProductType = 'demo' | 'course' | 'bundle' | 'extension';

export interface Product {
    slug: string;
    title: string;
    type: ProductType;
    price: number; // GST-inclusive, INR
    active: boolean;
    visible: boolean;
    commissionRateOverride: number | null; // null = rate from settings by type
    courseSlug?: string; // for course/demo products: which course this unlocks
    includes?: string[]; // bundle: product slugs included
    // extension meta
    version?: string;
    changelog?: { version: string; notes: string; at: string }[];
    premiereVersions?: string[];
    fileRef?: string; // private storage path — never a public URL
    tagline?: string;
}

export const COURSE_SLUGS = {
    starter: 'reel-trailer-starter',
    emotional: 'emotional-reels',
    proTrailer: 'pro-wedding-trailer',
    metaAds: 'meta-ads-photographers',
} as const;

export const SEED_PRODUCTS: Product[] = [
    {
        slug: 'demo', title: 'Demo Lesson', type: 'demo', price: 19,
        active: true, visible: true, commissionRateOverride: 0,
        courseSlug: COURSE_SLUGS.starter, tagline: 'The first lesson of Course 01',
    },
    {
        slug: COURSE_SLUGS.starter, title: '01 · Reel & Trailer Starter', type: 'course', price: 1299,
        active: true, visible: true, commissionRateOverride: null, courseSlug: COURSE_SLUGS.starter,
    },
    {
        slug: COURSE_SLUGS.emotional, title: '02 · Emotional Reels', type: 'course', price: 1799,
        active: true, visible: true, commissionRateOverride: null, courseSlug: COURSE_SLUGS.emotional,
    },
    {
        slug: COURSE_SLUGS.proTrailer, title: '03 · Pro Wedding Trailer', type: 'course', price: 3999,
        active: true, visible: true, commissionRateOverride: null, courseSlug: COURSE_SLUGS.proTrailer,
    },
    {
        slug: COURSE_SLUGS.metaAds, title: '04 · Meta Ads for Photographers', type: 'course', price: 2499,
        active: true, visible: true, commissionRateOverride: null, courseSlug: COURSE_SLUGS.metaAds,
    },
    {
        slug: 'bundle-all', title: 'Bundle — All 4 Courses + Extensions', type: 'bundle', price: 6999,
        active: true, visible: true, commissionRateOverride: null,
        includes: [COURSE_SLUGS.starter, COURSE_SLUGS.emotional, COURSE_SLUGS.proTrailer, COURSE_SLUGS.metaAds],
    },
    // Extension placeholders — real names/prices/files come from Naksh.
    {
        slug: 'ext-beat-marker', title: 'Beat Marker', type: 'extension', price: 0,
        active: false, visible: true, commissionRateOverride: null,
        version: '1.0.0', changelog: [], premiereVersions: ['2024', '2025'], fileRef: '',
    },
    {
        slug: 'ext-sfx-drawer', title: 'SFX Drawer', type: 'extension', price: 0,
        active: false, visible: true, commissionRateOverride: null,
        version: '1.0.0', changelog: [], premiereVersions: ['2024', '2025'], fileRef: '',
    },
    {
        slug: 'ext-reel-safe-zones', title: 'Reel Safe Zones', type: 'extension', price: 0,
        active: false, visible: true, commissionRateOverride: null,
        version: '1.0.0', changelog: [], premiereVersions: ['2024', '2025'], fileRef: '',
    },
];

export async function getProducts(opts: { visibleOnly?: boolean } = {}): Promise<Product[]> {
    try {
        const snap = await db.collection('products').get();
        if (snap.empty) return SEED_PRODUCTS.filter(p => !opts.visibleOnly || p.visible);
        const products = snap.docs.map(d => ({ slug: d.id, ...(d.data() as any) })) as Product[];
        return opts.visibleOnly ? products.filter(p => p.visible) : products;
    } catch {
        return SEED_PRODUCTS.filter(p => !opts.visibleOnly || p.visible);
    }
}

export async function getProduct(slug: string): Promise<Product | null> {
    if (!slug) return null;
    try {
        const doc = await db.collection('products').doc(slug).get();
        if (doc.exists) return { slug: doc.id, ...(doc.data() as any) } as Product;
    } catch { /* fall through to seed */ }
    return SEED_PRODUCTS.find(p => p.slug === slug) || null;
}

// The course slugs an order for this product covers — the ONLY source a
// refund may be calculated against (audit #9: never trust a
// client-supplied course slug). Course/demo product -> its courseSlug;
// bundle -> every included course product's courseSlug.
export async function courseSlugsForProductSlug(productSlug: string | null | undefined): Promise<string[]> {
    if (!productSlug) return [];
    const product = await getProduct(productSlug);
    if (!product) return [];
    if (product.type === 'bundle') {
        const slugs: string[] = [];
        for (const included of product.includes || []) {
            const p = await getProduct(included);
            if (p?.courseSlug) slugs.push(p.courseSlug);
        }
        return [...new Set(slugs)];
    }
    return product.courseSlug ? [product.courseSlug] : [];
}

// Which product slugs unlock a given course (direct course product, bundle, demo for course 01 lesson 1)
export function unlockingSlugsForCourse(courseSlug: string): string[] {
    const slugs = [courseSlug, 'bundle-all'];
    if (courseSlug === COURSE_SLUGS.starter) slugs.push('demo');
    return slugs;
}
