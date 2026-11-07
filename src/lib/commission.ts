import { db } from '@/lib/firebaseAdmin';
import { getSettings } from '@/lib/settings';
import type { Product } from '@/lib/products';

// NEW affiliate engine (relaunch). Rules, per MUSE_HANDOFF.md Step 4:
// - Flat 30% on courses for everyone, whatever they own. Partner tier 40%
//   (admin-approved: verified editors / photographers / creators).
// - Extensions 15-20% (configurable; default 18%). Demo (₹19): FIXED ₹17
//   per sale (settings.demoFixedCommissionInr) — the old Silicon default,
//   kept on Naksh's explicit instruction 2026-11-07 (overrides the
//   handoff's original 0%-on-demo rule).
// - Single-tier only. Free to join — no purchase required to earn.
// - Lifecycle: pending -> confirmed (after the 48h window) -> approved
//   (fraud checks passed) -> paid (in a payout batch). Refund/chargeback
//   -> reversed. Admin may hold/reject with a reason.
// - NO owned-package logic, NO Upgrade Bonus / pendings anywhere here.

export type CommissionStatus = 'pending' | 'confirmed' | 'approved' | 'batched' | 'paid' | 'reversed' | 'held' | 'rejected';

export interface BuyerFingerprint {
    ip?: string;
    device?: string;
    paymentInstrumentHash?: string;
}

export function rateForProduct(product: Product, referrer: any, settings: Awaited<ReturnType<typeof getSettings>>): number {
    if (product.type === 'demo') return 0;
    if (product.commissionRateOverride !== null && product.commissionRateOverride !== undefined) {
        return product.commissionRateOverride;
    }
    if (product.type === 'extension') return settings.rates.extension;
    // courses + bundle
    if (referrer?.partnerTier === 'approved') return settings.rates.partner;
    return settings.rates.course;
}

async function flagAffiliate(affiliateId: string, flag: string) {
    try {
        const ref = db.collection('users').doc(affiliateId);
        const doc = await ref.get();
        const flags: string[] = doc.data()?.fraudFlags || [];
        if (!flags.includes(flag)) {
            await ref.update({ fraudFlags: [...flags, flag], updatedAt: new Date().toISOString() });
        }
    } catch { /* non-blocking */ }
}

// Self-referral: same user, or buyer shares email / phone / payment
// instrument / device with the affiliate.
export async function selfReferralReason(affiliate: any, buyer: any, fingerprint: BuyerFingerprint): Promise<string | null> {
    if (!affiliate || !buyer) return null;
    if (affiliate.email && buyer.email && affiliate.email.toLowerCase() === buyer.email.toLowerCase()) return 'same-email';
    if (affiliate.phone && buyer.phone && String(affiliate.phone) === String(buyer.phone)) return 'same-phone';
    if (fingerprint.paymentInstrumentHash && affiliate.lastPaymentInstrumentHash &&
        fingerprint.paymentInstrumentHash === affiliate.lastPaymentInstrumentHash) return 'same-payment-instrument';
    if (fingerprint.device && affiliate.lastDeviceId && fingerprint.device === affiliate.lastDeviceId) return 'same-device';
    return null;
}

export async function createCommissionForOrder(args: {
    order: any;
    buyer: any;
    product: Product;
    affiliateId: string;
    couponCode?: string | null;
    fingerprint?: BuyerFingerprint;
}): Promise<{ created: boolean; reason?: string; id?: string }> {
    const { order, buyer, product, affiliateId } = args;
    const fingerprint = args.fingerprint || {};
    if (!affiliateId) return { created: false, reason: 'no-affiliate' };
    if (affiliateId === order.userId) {
        await flagAffiliate(affiliateId, 'self-referral-attempt');
        return { created: false, reason: 'self-referral' };
    }

    const settings = await getSettings();
    const affiliateDoc = await db.collection('users').doc(affiliateId).get();
    if (!affiliateDoc.exists) return { created: false, reason: 'affiliate-not-found' };
    const affiliate = affiliateDoc.data() as any;

    const selfReason = await selfReferralReason(affiliate, buyer, fingerprint);
    if (selfReason) {
        await flagAffiliate(affiliateId, `self-referral:${selfReason}`);
        return { created: false, reason: `self-referral:${selfReason}` };
    }

    const isDemo = product.type === 'demo';
    const rate = rateForProduct(product, affiliate, settings);
    const saleAmount = Number(order.amount) || product.price;
    let amount: number;
    if (isDemo) {
        // Fixed ₹17 per demo sale (old Silicon default), not a percentage
        amount = Number(settings.demoFixedCommissionInr) || 0;
        if (amount <= 0) return { created: false, reason: 'zero-rate' };
    } else {
        if (rate <= 0) return { created: false, reason: 'zero-rate' };
        amount = Math.round(saleAmount * rate * 100) / 100;
    }

    // Dedupe: one commission per order
    const existing = await db.collection('referrals').where('orderId', '==', order.id).limit(1).get();
    if (!existing.empty) return { created: false, reason: 'duplicate' };

    // Fraud velocity: many sales for one affiliate from one IP/device in 24h
    const fraudFlags: string[] = [];
    try {
        const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const recent = await db.collection('referrals')
            .where('referrerId', '==', affiliateId)
            .where('createdAt', '>', dayAgo)
            .get();
        const sameIp = recent.docs.filter(d => fingerprint.ip && d.data()?.buyerFingerprint?.ip === fingerprint.ip).length;
        const sameDevice = recent.docs.filter(d => fingerprint.device && d.data()?.buyerFingerprint?.device === fingerprint.device).length;
        if (sameIp >= 5) fraudFlags.push('velocity-ip');
        if (sameDevice >= 3) fraudFlags.push('velocity-device');
        const reversed = recent.docs.filter(d => d.data()?.status === 'reversed').length;
        if (recent.size >= 4 && reversed / recent.size > 0.4) fraudFlags.push('high-refund-rate');
    } catch { /* non-blocking */ }

    const now = new Date();
    const confirmAt = new Date(now.getTime() + settings.confirmAfterHours * 3600 * 1000);
    const ref = await db.collection('referrals').add({
        referrerId: affiliateId,
        referredUserId: order.userId,
        orderId: order.id,
        productSlug: product.slug,
        productTitle: product.title,
        type: 'DIRECT',
        saleAmount,
        rateApplied: isDemo ? 0 : rate,
        fixedInr: isDemo ? amount : null,
        amount,
        couponCode: args.couponCode || null,
        status: 'pending' as CommissionStatus,
        statusHistory: [{ status: 'pending', at: now.toISOString(), note: 'sale' }],
        confirmAt: confirmAt.toISOString(),
        buyerFingerprint: fingerprint,
        fraudFlags,
        payoutId: null,
        model: 'v2-flat', // distinguishes new-lifecycle rows from legacy PENDING/PAID rows
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
    });
    if (fraudFlags.length) await flagAffiliate(affiliateId, fraudFlags.join(','));
    return { created: true, id: ref.id };
}

// pending -> confirmed once confirmAt passes; clean rows auto-advance to
// approved, flagged rows wait at confirmed for admin review.
export async function runCommissionLifecycle(): Promise<{ confirmed: number; approved: number }> {
    const nowIso = new Date().toISOString();
    let confirmed = 0, approved = 0;
    const snap = await db.collection('referrals')
        .where('model', '==', 'v2-flat')
        .where('status', 'in', ['pending', 'confirmed'])
        .get();
    for (const doc of snap.docs) {
        const data = doc.data() as any;
        const history = data.statusHistory || [];
        if (data.status === 'pending' && data.confirmAt && data.confirmAt <= nowIso) {
            const next = (data.fraudFlags && data.fraudFlags.length) ? 'confirmed' : 'approved';
            await doc.ref.update({
                status: next,
                statusHistory: [...history,
                    { status: 'confirmed', at: nowIso, note: 'window elapsed' },
                    ...(next === 'approved' ? [{ status: 'approved', at: nowIso, note: 'fraud checks passed (auto)' }] : [])],
                updatedAt: nowIso,
            });
            confirmed++;
            if (next === 'approved') approved++;
        } else if (data.status === 'confirmed' && !(data.fraudFlags && data.fraudFlags.length)) {
            await doc.ref.update({
                status: 'approved',
                statusHistory: [...history, { status: 'approved', at: nowIso, note: 'fraud checks passed (auto)' }],
                updatedAt: nowIso,
            });
            approved++;
        }
    }
    return { confirmed, approved };
}

export async function reverseCommissionsForOrder(orderId: string, reason: string): Promise<number> {
    const snap = await db.collection('referrals').where('orderId', '==', orderId).get();
    let n = 0;
    for (const doc of snap.docs) {
        const data = doc.data() as any;
        if (['paid'].includes(data.status)) continue; // paid rows need manual clawback — surfaced to admin instead
        if (data.status === 'reversed') continue;
        await doc.ref.update({
            status: 'reversed',
            statusHistory: [...(data.statusHistory || []), { status: 'reversed', at: new Date().toISOString(), note: reason }],
            updatedAt: new Date().toISOString(),
        });
        n++;
    }
    return n;
}

// Thrown when a status change is attempted out of a terminal state;
// admin routes map it to HTTP 409.
export class TerminalStatusError extends Error {
    constructor(current: string) {
        super(`Commission is '${current}' (terminal) and cannot change status`);
        this.name = 'TerminalStatusError';
    }
}

export async function setCommissionStatus(id: string, status: CommissionStatus, note?: string): Promise<void> {
    const ref = db.collection('referrals').doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new Error('Commission not found');
    const data = doc.data() as any;
    // 'paid' and 'reversed' are terminal (audit #23): money has moved
    // (or been clawed back) — no admin action may resurrect the row
    // into a payable state, or a batch could pay it twice.
    const TERMINAL: CommissionStatus[] = ['paid', 'reversed'];
    if (TERMINAL.includes(data.status) && data.status !== status) {
        throw new TerminalStatusError(data.status);
    }
    await ref.update({
        status,
        holdReason: status === 'held' || status === 'rejected' ? (note || '') : (data.holdReason || ''),
        statusHistory: [...(data.statusHistory || []), { status, at: new Date().toISOString(), note: note || 'admin' }],
        updatedAt: new Date().toISOString(),
    });
}

// --- Coupons: one code per affiliate (their referral code), buyer gets
// settings.couponDiscountPct off, the affiliate is credited. ---
export async function getOrCreateCoupon(affiliateId: string): Promise<any> {
    const existing = await db.collection('coupons').where('affiliateId', '==', affiliateId).limit(1).get();
    if (!existing.empty) return { id: existing.docs[0].id, ...existing.docs[0].data() };
    const userDoc = await db.collection('users').doc(affiliateId).get();
    const settings = await getSettings();
    const code = (userDoc.data()?.referralCode || `LP${affiliateId.slice(0, 6).toUpperCase()}`).toUpperCase();
    const ref = await db.collection('coupons').add({
        code, affiliateId, discountPct: settings.couponDiscountPct,
        active: true, uses: 0, createdAt: new Date().toISOString(),
    });
    return { id: ref.id, code, affiliateId, discountPct: settings.couponDiscountPct, active: true, uses: 0 };
}

export async function resolveCoupon(code: string): Promise<{ affiliateId: string; discountPct: number; couponId: string } | null> {
    if (!code) return null;
    const snap = await db.collection('coupons').where('code', '==', code.toUpperCase()).where('active', '==', true).limit(1).get();
    if (snap.empty) {
        // Fallback: a user's referral code also works as their coupon code
        const userSnap = await db.collection('users').where('referralCode', '==', code.toUpperCase()).limit(1).get();
        if (userSnap.empty) return null;
        const coupon = await getOrCreateCoupon(userSnap.docs[0].id);
        return { affiliateId: userSnap.docs[0].id, discountPct: coupon.discountPct, couponId: coupon.id };
    }
    const d = snap.docs[0];
    return { affiliateId: d.data().affiliateId, discountPct: d.data().discountPct, couponId: d.id };
}
