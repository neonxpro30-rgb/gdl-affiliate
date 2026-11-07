import { db } from '@/lib/firebaseAdmin';
import { getSettings } from '@/lib/settings';

// Payout batches — shared by affiliate commissions and paid-work projects.
// A batch pays every user whose payable total (approved commissions +
// approved projects) reaches the configured minimum AND whose KYC is
// verified. TDS uses settings.tds (pct null until the CA confirms — then
// it is deducted per line and shown on the payout).
//
// State machine (audit #13): building a batch moves its rows to
// 'batched' — money has NOT moved yet. Only the admin PATCH that marks
// the batch paid (with a disbursement reference) flips rows to 'paid'.
// Rows already carrying a payoutId are never built into a second batch.
//
// TDS yearly threshold: when settings.tds.yearlyThreshold is set, tax
// applies only to the portion of a user's financial-year (Apr–Mar)
// gross above the threshold — counting payouts already paid this FY
// plus the lines in the batch being built.

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

interface RawLine {
    userId: string;
    source: 'affiliate' | 'project';
    refId: string;
    label: string;
    gross: number;
}

// Gross already PAID to each user in the current financial year
// (Apr 1 – Mar 31), from the lines of paid batches.
async function priorFinancialYearGrossByUser(): Promise<Map<string, number>> {
    const now = new Date();
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fyStart = new Date(fyStartYear, 3, 1).toISOString();
    const fyEnd = new Date(fyStartYear + 1, 3, 1).toISOString();
    const totals = new Map<string, number>();
    const snap = await db.collection('payouts').where('status', '==', 'paid').get();
    for (const doc of snap.docs) {
        const d = doc.data() as any;
        if (!d.paidAt || d.paidAt < fyStart || d.paidAt >= fyEnd) continue;
        for (const line of d.lines || []) {
            totals.set(line.userId, (totals.get(line.userId) || 0) + (Number(line.gross) || 0));
        }
    }
    return totals;
}

export async function buildPayoutBatch(createdBy: string): Promise<{ batchId: string | null; lines: PayoutLine[]; skipped: { userId: string; reason: string }[] }> {
    const settings = await getSettings();
    const tdsPct = settings.tds.pct ?? 0;
    const tdsThreshold = settings.tds.yearlyThreshold;
    const byUser = new Map<string, RawLine[]>();
    const add = (line: RawLine) => {
        const arr = byUser.get(line.userId) || [];
        arr.push(line);
        byUser.set(line.userId, arr);
    };

    const commSnap = await db.collection('referrals').where('model', '==', 'v2-flat').where('status', '==', 'approved').get();
    for (const doc of commSnap.docs) {
        const d = doc.data() as any;
        if (d.payoutId) continue; // already in a batch — never double-build
        add({
            userId: d.referrerId, source: 'affiliate', refId: doc.id,
            label: d.productTitle || d.productSlug || 'Commission',
            gross: Number(d.amount) || 0,
        });
    }

    const projSnap = await db.collection('projects').where('status', '==', 'approved').get();
    for (const doc of projSnap.docs) {
        const d = doc.data() as any;
        if (!d.assigneeId) continue;
        if (d.payoutId) continue; // already in a batch — never double-build
        add({
            userId: d.assigneeId, source: 'project', refId: doc.id,
            label: `Project: ${d.title || doc.id}`,
            gross: Number(d.payAmount) || 0,
        });
    }

    const rawLines: RawLine[] = [];
    const skipped: { userId: string; reason: string }[] = [];
    for (const [userId, userLines] of byUser.entries()) {
        const total = userLines.reduce((s, l) => s + l.gross, 0);
        if (total < settings.payout.minAmount) { skipped.push({ userId, reason: `below minimum ₹${settings.payout.minAmount} (₹${total})` }); continue; }
        const userDoc = await db.collection('users').doc(userId).get();
        const kycStatus = userDoc.data()?.kyc?.status;
        if (kycStatus !== 'verified') { skipped.push({ userId, reason: `KYC not verified (${kycStatus || 'none'})` }); continue; }
        rawLines.push(...userLines);
    }

    if (!rawLines.length) return { batchId: null, lines: [], skipped };

    // TDS per line. With a yearly threshold, only the slice of the
    // user's FY gross above the threshold is taxed — prior paid payouts
    // this FY count first, then this batch's lines in order.
    const priorGross = (settings.tds.pct != null && tdsThreshold != null)
        ? await priorFinancialYearGrossByUser()
        : new Map<string, number>();
    const runningByUser = new Map<string, number>();
    const lines: PayoutLine[] = rawLines.map(raw => {
        let taxable = raw.gross;
        if (settings.tds.pct != null && tdsThreshold != null) {
            const before = (priorGross.get(raw.userId) || 0) + (runningByUser.get(raw.userId) || 0);
            const after = before + raw.gross;
            taxable = Math.max(0, after - tdsThreshold) - Math.max(0, before - tdsThreshold);
            runningByUser.set(raw.userId, (runningByUser.get(raw.userId) || 0) + raw.gross);
        }
        const tdsAmount = Math.round(taxable * tdsPct) / 100;
        return { ...raw, tdsPct, tdsAmount, net: raw.gross - tdsAmount };
    });

    const now = new Date().toISOString();
    const batchRef = await db.collection('payouts').add({
        status: 'open', cadence: settings.payout.cadence, createdBy, createdAt: now,
        // Denormalised member list so a user's payout history can be
        // fetched with an array-contains query instead of scanning
        // every batch in the collection (audit #26).
        userIds: [...new Set(lines.map(l => l.userId))],
        lines, totalGross: lines.reduce((s, l) => s + l.gross, 0),
        totalTds: lines.reduce((s, l) => s + l.tdsAmount, 0),
        totalNet: lines.reduce((s, l) => s + l.net, 0),
    });

    // Mark sources as batched (NOT paid — money moves only when the
    // admin marks the batch paid with a disbursement reference).
    for (const line of lines) {
        if (line.source === 'affiliate') {
            const ref = db.collection('referrals').doc(line.refId);
            const doc = await ref.get();
            await ref.update({
                status: 'batched', payoutId: batchRef.id,
                statusHistory: [...((doc.data() as any)?.statusHistory || []), { status: 'batched', at: now, note: `payout batch ${batchRef.id}` }],
                updatedAt: now,
            });
        } else {
            await db.collection('projects').doc(line.refId).update({ status: 'batched', payoutId: batchRef.id, updatedAt: now });
        }
    }
    return { batchId: batchRef.id, lines, skipped };
}

// Flip a batch's rows from 'batched' to 'paid'. Called by the admin
// PATCH after the batch's open state and disbursement reference have
// been validated.
export async function markBatchRowsPaid(batchId: string): Promise<number> {
    const batchDoc = await db.collection('payouts').doc(batchId).get();
    if (!batchDoc.exists) return 0;
    const batch = batchDoc.data() as any;
    const now = new Date().toISOString();
    let flipped = 0;
    for (const line of batch.lines || []) {
        if (line.source === 'affiliate') {
            const ref = db.collection('referrals').doc(line.refId);
            const doc = await ref.get();
            const data = doc.data() as any;
            if (data?.status === 'batched' && data?.payoutId === batchId) {
                await ref.update({
                    status: 'paid',
                    statusHistory: [...(data.statusHistory || []), { status: 'paid', at: now, note: `payout ${batchId} disbursed` }],
                    updatedAt: now,
                });
                flipped++;
            }
        } else {
            const ref = db.collection('projects').doc(line.refId);
            const doc = await ref.get();
            const data = doc.data() as any;
            if (data?.status === 'batched' && data?.payoutId === batchId) {
                await ref.update({ status: 'paid', updatedAt: now });
                flipped++;
            }
        }
    }
    return flipped;
}

export async function getUserPayouts(userId: string): Promise<any[]> {
    // Scoped query (audit #26): only batches that include this user.
    // Batches built before the userIds field existed don't match an
    // array-contains query — see the batch-3 report note.
    const snap = await db.collection('payouts').where('userIds', 'array-contains', userId).get();
    const out: any[] = [];
    for (const doc of snap.docs) {
        const d = doc.data() as any;
        const mine = (d.lines || []).filter((l: any) => l.userId === userId);
        if (mine.length) out.push({ id: doc.id, status: d.status, createdAt: d.createdAt, lines: mine, paidAt: d.paidAt || null });
    }
    return out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
