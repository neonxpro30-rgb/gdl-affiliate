/**
 * Pending Commission (Upgrade Bonus) — Firestore operations.
 * Pure business logic lives in pendingTiers.ts (unit-tested).
 */
import { db } from '@/lib/firebaseAdmin';
import {
    CHARITY_CAUSE,
    calcPendingAmount,
    canClaimByTier,
    getTierRank,
    pendingExpiryIso,
    resolvePendingStatus,
    round2,
    type PendingStatus,
} from '@/lib/pendingTiers';

export interface PendingDoc {
    id?: string;
    referrerId: string;
    referralId: string;      // the DIRECT referral doc created for this sale
    buyerUserId: string;     // user who bought (the sale)
    soldPackageId: string;
    soldPackageName: string;
    soldTier: number;
    ownedPackageIdAtSale: string | null;
    ownedTierAtSale: number;
    pendingAmount: number;   // (soldPrice x 70%) - immediateCommission
    immediateAmount: number; // what commission-lock paid immediately
    createdAt: string;
    expiresAt: string;       // createdAt + 7 days
    status: PendingStatus;   // PENDING | PAYABLE | CLAIMED
    claimedAt?: string;
    upgradeOrderId?: string;
}

export interface PendingView extends PendingDoc {
    effectiveStatus: PendingStatus;
    canClaim: boolean;
    needsUpgrade: boolean;
    msLeft: number; // ms until expiry (0 if lapsed/claimed)
}

/** Current owned tier rank of a user (from latest SUCCESS order). */
export async function getUserTierRank(userId: string): Promise<number> {
    const snap = await db.collection('orders')
        .where('userId', '==', userId)
        .where('status', '==', 'SUCCESS')
        .get();
    if (snap.empty) return 0;
    const orders = snap.docs.map(d => d.data());
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = orders[0];
    if (!latest?.packageId) return 0;
    const pkgDoc = await db.collection('packages').doc(latest.packageId).get();
    const name = pkgDoc.exists ? (pkgDoc.data()?.name || '') : '';
    return getTierRank(name);
}

/**
 * Create a pending doc for a mismatched sale. Called from payment-processor
 * alongside (never instead of) the normal direct commission.
 * Returns the new doc id, or null when there is nothing to pend.
 */
export async function createPendingForSale(args: {
    referrerId: string;
    referralId: string;
    buyerUserId: string;
    soldPackageId: string;
    soldPackageName: string;
    soldPackagePrice: number;
    ownedPackageIdAtSale: string | null;
    ownedPackageNameAtSale: string;
    directCommission: number;
}): Promise<string | null> {
    const pendingAmount = calcPendingAmount(args.soldPackagePrice, args.directCommission);
    if (!(pendingAmount > 0)) return null; // nothing held back

    const createdAt = new Date().toISOString();
    const doc: Omit<PendingDoc, 'id'> = {
        referrerId: args.referrerId,
        referralId: args.referralId,
        buyerUserId: args.buyerUserId,
        soldPackageId: args.soldPackageId,
        soldPackageName: args.soldPackageName,
        soldTier: getTierRank(args.soldPackageName),
        ownedPackageIdAtSale: args.ownedPackageIdAtSale,
        ownedTierAtSale: getTierRank(args.ownedPackageNameAtSale),
        pendingAmount,
        immediateAmount: round2(args.directCommission),
        createdAt,
        expiresAt: pendingExpiryIso(createdAt),
        status: 'PENDING',
    };
    const ref = await db.collection('pendings').add(doc);
    return ref.id;
}

/** Lazy transition: PENDING past expiresAt -> DONATED to charity.
 *  Each donation is recorded in the transparent charity_donations ledger.
 *  The money is earmarked for charity — never company income. */
export async function transitionExpiredPendings(referrerId: string): Promise<number> {
    const now = new Date();
    const nowIso = now.toISOString();
    const snap = await db.collection('pendings')
        .where('referrerId', '==', referrerId)
        .where('status', '==', 'PENDING')
        .get();
    let moved = 0;
    for (const doc of snap.docs) {
        const data = doc.data();
        if (data.expiresAt && data.expiresAt <= nowIso) {
            await doc.ref.update({
                status: 'DONATED',
                donatedAt: nowIso,
                updatedAt: nowIso,
            });
            // Transparent, auditable charity record
            await db.collection('charity_donations').add({
                pendingId: doc.id,
                referrerId,
                amount: data.pendingAmount || 0,
                cause: CHARITY_CAUSE,
                donatedAt: nowIso,
                createdAt: nowIso,
            });
            moved++;
        }
    }
    return moved;
}

/** Running total donated to charity across all users. */
export async function getCharityTotal(): Promise<number> {
    const snap = await db.collection('charity_donations').get();
    return round2(snap.docs.reduce((s, d) => s + (d.data().amount || 0), 0));
}

/** All charity donation records (admin ledger), newest first. */
export async function getCharityDonations(): Promise<any[]> {
    const snap = await db.collection('charity_donations').get();
    const rows: any[] = await Promise.all(snap.docs.map(async (d) => {
        const data = d.data();
        let referrerName = 'Unknown';
        if (data.referrerId) {
            const u = await db.collection('users').doc(data.referrerId).get();
            if (u.exists) referrerName = (u.data() as any)?.name || 'Unknown';
        }
        return { id: d.id, ...data, referrerName };
    }));
    rows.sort((a, b) => new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime());
    return rows;
}

/** List a user's pendings with live status, claimability and countdown. */
export async function getUserPendings(referrerId: string): Promise<{ pendings: PendingView[]; currentTier: number; charityTotal: number }> {
    await transitionExpiredPendings(referrerId);
    const currentTier = await getUserTierRank(referrerId);

    const snap = await db.collection('pendings')
        .where('referrerId', '==', referrerId)
        .get();
    const now = new Date().getTime();
    const pendings: PendingView[] = snap.docs.map(d => {
        const data = d.data() as PendingDoc;
        const effectiveStatus = resolvePendingStatus(data.status, data.expiresAt);
        const canClaim =
            effectiveStatus === 'PENDING' && canClaimByTier(currentTier, data.soldTier);
        return {
            ...data,
            id: d.id,
            effectiveStatus,
            canClaim,
            needsUpgrade: effectiveStatus === 'PENDING' && currentTier < data.soldTier,
            msLeft: effectiveStatus === 'PENDING'
                ? Math.max(0, new Date(data.expiresAt).getTime() - now)
                : 0,
        };
    });

    // Active pendings first (soonest expiry), then donated, then claimed
    pendings.sort((a, b) => {
        const rank = (s: PendingStatus) => (s === 'PENDING' ? 0 : s === 'DONATED' ? 1 : 2);
        const r = rank(a.effectiveStatus) - rank(b.effectiveStatus);
        if (r !== 0) return r;
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    });

    const charityTotal = await getCharityTotal();

    return { pendings, currentTier, charityTotal };
}

/**
 * Claim a pending. Tier-matched rule: only PENDING within the 7-day window
 * can be claimed, and only after upgrading to the sold tier (or higher).
 * DONATED amounts cannot be reclaimed.
 * On success the amount is credited as a normal DIRECT referral so it
 * flows through the existing payout pipeline.
 */
export async function claimPending(pendingId: string, referrerId: string): Promise<{ amount: number }> {
    const ref = db.collection('pendings').doc(pendingId);
    const doc = await ref.get();
    if (!doc.exists) throw new Error('Pending not found');
    const p = doc.data() as PendingDoc;

    if (p.referrerId !== referrerId) throw new Error('Not your pending');
    if (p.status === 'CLAIMED') throw new Error('Already claimed');

    const effective = resolvePendingStatus(p.status, p.expiresAt);
    if (effective === 'DONATED') throw new Error('ALREADY_DONATED');
    if (effective === 'PENDING') {
        const currentTier = await getUserTierRank(referrerId);
        if (!canClaimByTier(currentTier, p.soldTier)) {
            throw new Error('UPGRADE_REQUIRED');
        }
    }

    const nowIso = new Date().toISOString();
    await ref.update({ status: 'CLAIMED', claimedAt: nowIso, updatedAt: nowIso });

    // Credit via the existing payout pipeline (admin approves -> PAID)
    await db.collection('referrals').add({
        referrerId,
        referredUserId: p.buyerUserId,
        amount: p.pendingAmount,
        type: 'DIRECT',
        status: 'PENDING',
        fromPending: true,
        pendingId,
        createdAt: nowIso,
        updatedAt: nowIso,
    });

    return { amount: p.pendingAmount };
}
