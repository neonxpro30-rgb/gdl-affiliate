import { db } from '@/lib/firebaseAdmin';
import { getSettings } from '@/lib/settings';

// Payout batches — shared by affiliate commissions and paid-work projects.
// A batch pays every user whose payable total (approved commissions +
// approved projects) reaches the configured minimum AND whose KYC is
// verified. TDS uses settings.tds (pct null until the CA confirms — then
// it is deducted per line and shown on the payout).

export interface PayoutLine {
    userId: string;
    source: 'affiliate' | 'project';
    refId: string; // referral doc id or project doc id
    label: string;
    gross: number;
    tdsPct: number;
    tdsAmount: number;
    net: number;
}

export async function buildPayoutBatch(createdBy: string): Promise<{ batchId: string | null; lines: PayoutLine[]; skipped: { userId: string; reason: string }[] }> {
    const settings = await getSettings();
    const tdsPct = settings.tds.pct ?? 0;
    const byUser = new Map<string, PayoutLine[]>();
    const add = (line: PayoutLine) => {
        const arr = byUser.get(line.userId) || [];
        arr.push(line);
        byUser.set(line.userId, arr);
    };

    const commSnap = await db.collection('referrals').where('model', '==', 'v2-flat').where('status', '==', 'approved').get();
    for (const doc of commSnap.docs) {
        const d = doc.data() as any;
        const gross = Number(d.amount) || 0;
        add({
            userId: d.referrerId, source: 'affiliate', refId: doc.id,
            label: d.productTitle || d.productSlug || 'Commission',
            gross, tdsPct, tdsAmount: Math.round(gross * tdsPct) / 100, net: gross - Math.round(gross * tdsPct) / 100,
        });
    }

    const projSnap = await db.collection('projects').where('status', '==', 'approved').get();
    for (const doc of projSnap.docs) {
        const d = doc.data() as any;
        if (!d.assigneeId) continue;
        const gross = Number(d.payAmount) || 0;
        add({
            userId: d.assigneeId, source: 'project', refId: doc.id,
            label: `Project: ${d.title || doc.id}`,
            gross, tdsPct, tdsAmount: Math.round(gross * tdsPct) / 100, net: gross - Math.round(gross * tdsPct) / 100,
        });
    }

    const lines: PayoutLine[] = [];
    const skipped: { userId: string; reason: string }[] = [];
    for (const [userId, userLines] of byUser.entries()) {
        const total = userLines.reduce((s, l) => s + l.gross, 0);
        if (total < settings.payout.minAmount) { skipped.push({ userId, reason: `below minimum ₹${settings.payout.minAmount} (₹${total})` }); continue; }
        const userDoc = await db.collection('users').doc(userId).get();
        const kycStatus = userDoc.data()?.kyc?.status;
        if (kycStatus !== 'verified') { skipped.push({ userId, reason: `KYC not verified (${kycStatus || 'none'})` }); continue; }
        lines.push(...userLines);
    }

    if (!lines.length) return { batchId: null, lines: [], skipped };

    const now = new Date().toISOString();
    const batchRef = await db.collection('payouts').add({
        status: 'open', cadence: settings.payout.cadence, createdBy, createdAt: now,
        lines, totalGross: lines.reduce((s, l) => s + l.gross, 0),
        totalTds: lines.reduce((s, l) => s + l.tdsAmount, 0),
        totalNet: lines.reduce((s, l) => s + l.net, 0),
    });

    // Mark sources as paid
    for (const line of lines) {
        if (line.source === 'affiliate') {
            const ref = db.collection('referrals').doc(line.refId);
            const doc = await ref.get();
            await ref.update({
                status: 'paid', payoutId: batchRef.id,
                statusHistory: [...((doc.data() as any)?.statusHistory || []), { status: 'paid', at: now, note: `payout ${batchRef.id}` }],
                updatedAt: now,
            });
        } else {
            await db.collection('projects').doc(line.refId).update({ status: 'paid', payoutId: batchRef.id, updatedAt: now });
        }
    }
    return { batchId: batchRef.id, lines, skipped };
}

export async function getUserPayouts(userId: string): Promise<any[]> {
    const snap = await db.collection('payouts').get();
    const out: any[] = [];
    for (const doc of snap.docs) {
        const d = doc.data() as any;
        const mine = (d.lines || []).filter((l: any) => l.userId === userId);
        if (mine.length) out.push({ id: doc.id, status: d.status, createdAt: d.createdAt, lines: mine, paidAt: d.paidAt || null });
    }
    return out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
