/**
 * Pending Commission (Upgrade Bonus) — pure business logic.
 *
 * No imports: every function here is a pure function so it can be
 * unit-tested in isolation. Firestore I/O lives in pendingCommission.ts.
 *
 * Tier order (ascending): Silicon Demo (0) < Silver (1) < Gold (2) < Diamond (3)
 */

export type PendingStatus = 'PENDING' | 'DONATED' | 'CLAIMED';

/** Claim window: 7 days from the sale. */
export const PENDING_CLAIM_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Round rupees to 2 decimals. */
export function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Tier rank from a package name. Unknown names default to Silicon (0). */
export function getTierRank(packageName: string): number {
    const n = (packageName || '').toLowerCase();
    if (n.includes('diamond')) return 3;
    if (n.includes('gold')) return 2;
    if (n.includes('silver')) return 1;
    return 0; // silicon
}

/** Display name for a tier rank. */
export function getTierName(rank: number): string {
    const names = ['Silicon Demo', 'Silver Package', 'Gold Package', 'Diamond Package'];
    return names[rank] ?? 'Unknown Package';
}

/**
 * Pending amount for a mismatched sale.
 * pending = (soldPackagePrice x 70%) - immediateCommission
 *
 * Examples:
 *  Silicon (19) sells Silver (799): 799*0.70 - 17    = 542.30
 *  Silver (799) sells Gold (1299):  1299*0.70 - 559.30 = 350.00
 *  Silver (799) sells Diamond (3899): 3899*0.70 - 559.30 = 2170.00
 *  Gold (1299) sells Diamond (3899): 3899*0.70 - 909.30 = 1820.00
 *  Silicon (19) sells Diamond (3899): 3899*0.70 - 17  = 2712.30
 */
export function calcPendingAmount(soldPackagePrice: number, directCommission: number): number {
    return round2(soldPackagePrice * 0.70 - directCommission);
}

/**
 * Tier-matched claim rule: a pending is tied to the SOLD tier.
 * Claim requires the referrer's CURRENT owned tier >= sold tier.
 */
export function canClaimByTier(currentTierRank: number, soldTierRank: number): boolean {
    return currentTierRank >= soldTierRank;
}

/**
 * Resolve the effective status of a pending.
 *  PENDING  -> within 7-day window, needs tier-matched upgrade to claim
 *  DONATED  -> window lapsed without claim: amount donated to children's
 *              education & food charity (transparent ledger, never company income)
 *  CLAIMED  -> terminal
 */
export function resolvePendingStatus(
    storedStatus: string,
    expiresAtIso: string,
    now: Date = new Date()
): PendingStatus {
    if (storedStatus === 'CLAIMED') return 'CLAIMED';
    if (storedStatus === 'DONATED') return 'DONATED';
    const expired = new Date(expiresAtIso).getTime() <= now.getTime();
    return expired ? 'DONATED' : 'PENDING';
}

/** Whether a pending can be claimed right now. Donated amounts cannot be reclaimed. */
export function canClaimNow(
    effectiveStatus: PendingStatus,
    currentTierRank: number,
    soldTierRank: number
): boolean {
    if (effectiveStatus !== 'PENDING') return false;
    return canClaimByTier(currentTierRank, soldTierRank);
}

/** Charity cause for unclaimed upgrade bonuses. */
export const CHARITY_CAUSE = "children's education and food";

/** ISO timestamp for expiry = createdAt + 7 days. */
export function pendingExpiryIso(createdAtIso: string): string {
    return new Date(new Date(createdAtIso).getTime() + PENDING_CLAIM_WINDOW_MS).toISOString();
}
