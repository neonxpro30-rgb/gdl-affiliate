import { getOwnedProductSlugs } from '@/lib/access';

// ─── Catalog display mapping (relaunch) ─────────────────────────────────────
// The four legacy Firestore categories (Silicon/Silver/Gold/Diamond Package)
// are the shells for the new wedding-editing courses. Their stored titles
// and the stored titles of the course docs inside them are OLD
// affiliate-marketing data that we cannot rewrite (no production DB write
// access from here, and stored data semantics must not change). This module
// is a DISPLAY + ACCESS layer on top of that data:
//
//   * category cards / pages render the NEW course names,
//   * course docs are retitled by curriculum position (see retitleCourses),
//   * a category also unlocks when the user owns the mapped NEW product
//     (or the bundle), in addition to the existing legacy price rule.
//
// Lesson titles are copied EXACTLY from the relaunch landing page
// (learnpeak-landing.html, TAPE 01–04 sections + the ₹19 demo line).
// A fifth course, Meta Ads for Photographers, has no DB category at all —
// it is rendered synthetically (see META_ADS_ENTRY).

export interface CatalogDisplayEntry {
    /** Stored Firestore category title this entry maps from ('' = synthetic). */
    dbTitle: string;
    displayName: string;
    productSlug: string;
    tapeLabel: string;
    lessons: string[];
}

const TAPE_01_LESSONS: string[] = [
    'Premiere setup, workflow and shortcuts',
    'Picking selects and cutting on the beat',
    'Basic color and audio cleanup',
    'Reel structure and your first trailer',
];

const TAPE_01_TASK = 'Task: 1 reel + 1 trailer from the provided footage';
const DEMO_LESSON = 'The first 10 seconds of your first reel';

export const CATEGORY_MAP: Record<string, CatalogDisplayEntry> = {
    'Silicon Package': {
        dbTitle: 'Silicon Package',
        displayName: 'Silicon Demo',
        productSlug: 'demo',
        tapeLabel: 'DEMO',
        // Demo lesson first, then Tape 01's lessons, then its task line —
        // 6 entries for the 6 existing course docs in this category.
        lessons: [DEMO_LESSON, ...TAPE_01_LESSONS, TAPE_01_TASK],
    },
    'Silver Package': {
        dbTitle: 'Silver Package',
        displayName: 'Reel & Trailer Starter',
        productSlug: 'reel-trailer-starter',
        tapeLabel: 'TAPE 01',
        lessons: [...TAPE_01_LESSONS],
    },
    'Gold Package': {
        dbTitle: 'Gold Package',
        displayName: 'Emotional Reels',
        productSlug: 'emotional-reels',
        tapeLabel: 'TAPE 02',
        lessons: [
            'The hook in the first 2 seconds',
            'The emotion graph: build-up, peak, ending',
            'Picking moments: laughter, tears, reactions',
            'Telling the story with music and voiceover',
        ],
    },
    'Diamond Package': {
        dbTitle: 'Diamond Package',
        displayName: 'Pro Wedding Trailer',
        productSlug: 'pro-wedding-trailer',
        tapeLabel: 'TAPE 03',
        lessons: [
            'Slow-build, atmospheric openings',
            'SFX layering: whooshes, ambience, risers',
            'Speed ramps, transitions and pacing',
            "What's overdone and what to avoid",
            'Cinematic grading and client delivery',
        ],
    },
};

/** Fifth course — no DB category exists; rendered synthetically. */
export const META_ADS_ENTRY: CatalogDisplayEntry = {
    dbTitle: '',
    displayName: 'Meta Ads for Photographers',
    productSlug: 'meta-ads-photographers',
    tapeLabel: 'TAPE 04',
    lessons: [
        "Reading competitors' live ads in the Ad Library",
        'Audience: city, radius, age and past clients',
        '3 hook-first ad reels cut from wedding footage',
        'The offer, plus WhatsApp or a lead form with the right questions',
        'A ₹300–500/day test budget: what to kill, what to scale',
        'Tracking from lead to call to booking',
    ],
};

/** Synthetic category route id used for the Meta Ads course. */
export const META_ADS_ROUTE_ID = 'meta-ads';

// The order the legacy course docs were created in (courses v2 migration,
// 2026-10-05). Firestore returns docs in document-id order, which is NOT
// curriculum order, so retitling by raw snapshot index would pair new
// titles with the wrong stored courses. Docs are first sorted by their
// stored title's position in this list; unknown titles (e.g. the preserved
// pre-v2 course) keep their snapshot order after the known ones.
const LEGACY_CURRICULUM_ORDER: Record<string, string[]> = {
    'Silicon Package': [
        'Affiliate Marketing ABCs',
        'Profile Makeover in 30 Minutes',
        'First Affiliate Link Launchpad',
        'First 10 Leads \u2014 Taste',
        'Roadmap Reveal & Referral Kickstart',
    ],
    'Silver Package': [
        'Organic Affiliate Marketing Mastery',
        'First Money Sales Script',
        'Content Creation Mastery',
        'Video Creation Mastery',
    ],
    'Gold Package': [
        'Advanced Affiliate Marketing',
        'Personal Branding & Authority Mastery',
        'Advanced Video Editing & Reels Mastery',
    ],
    'Diamond Package': [],
};

/** Display entry for a stored category title, or null when unmapped. */
export function categoryDisplay(dbTitle: string): CatalogDisplayEntry | null {
    if (!dbTitle) return null;
    if (CATEGORY_MAP[dbTitle]) return CATEGORY_MAP[dbTitle];
    // Tolerant fallback: match on the tier keyword, like the legacy code did.
    for (const key of Object.keys(CATEGORY_MAP)) {
        const tier = key.replace(' Package', '');
        if (dbTitle.includes(tier)) return CATEGORY_MAP[key];
    }
    return null;
}

export function displayNameFor(dbTitle: string): string {
    return categoryDisplay(dbTitle)?.displayName ?? dbTitle;
}

export function slugForCategory(dbTitle: string): string | null {
    return categoryDisplay(dbTitle)?.productSlug ?? null;
}

/** Legacy price gate for a category title (same table the old code used). */
export function requiredLegacyPriceFor(dbTitle: string): number {
    if (!dbTitle) return 0;
    if (dbTitle.includes('Silicon')) return 19;
    if (dbTitle.includes('Silver')) return 799;
    if (dbTitle.includes('Gold')) return 1299;
    if (dbTitle.includes('Diamond')) return 3899;
    return 0;
}

/**
 * Retitle a category's course docs for display. Docs are ordered by the
 * legacy curriculum (see LEGACY_CURRICULUM_ORDER), then the doc at each
 * position takes the mapped lesson title at that position. Docs beyond the
 * mapped lesson list keep their stored title; when fewer docs exist than
 * lessons, only the existing docs are retitled (callers render the
 * remaining mapped lessons as "being added"). Stored data is never
 * modified — the stored title stays on `title`, the display title is
 * added as `displayTitle`. Unmapped categories pass through untouched.
 */
export function retitleCourses<T extends { title: string }>(
    dbTitle: string,
    courses: T[],
): (T & { displayTitle: string })[] {
    const entry = categoryDisplay(dbTitle);
    if (!entry) return courses.map((c) => ({ ...c, displayTitle: c.title }));

    const order = LEGACY_CURRICULUM_ORDER[entry.dbTitle] ?? [];
    const rank = (title: string) => {
        const i = order.indexOf(title);
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    const sorted = courses
        .map((course, index) => ({ course, index }))
        .sort((a, b) => rank(a.course.title) - rank(b.course.title) || a.index - b.index)
        .map(({ course }) => course);

    return sorted.map((course, i) => ({
        ...course,
        displayTitle: entry.lessons[i] ?? course.title,
    }));
}

/**
 * Category unlock = existing legacy price rule OR ownership of the mapped
 * new product OR ownership of the bundle. Legacy buyers can only gain
 * access through this, never lose it.
 *
 * @param purchasedLegacyPrice the user's highest legacy package price
 *        (from getLegacyTopPackage in src/lib/access.ts)
 */
export async function userUnlocksCategory(
    userId: string,
    dbTitle: string,
    purchasedLegacyPrice: number,
): Promise<boolean> {
    if (purchasedLegacyPrice >= requiredLegacyPriceFor(dbTitle)) return true;
    const slug = slugForCategory(dbTitle);
    if (!slug || !userId) return false;
    const owned = await getOwnedProductSlugs(userId);
    return owned.has('bundle-all') || owned.has(slug);
}
