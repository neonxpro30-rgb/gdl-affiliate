'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';

// NEW affiliate dashboard (flat model): referral link, coupon, sales,
// commission by status, payouts + TDS, KYC. Free to join for everyone.
export default function AffiliatePanel() {
    const [data, setData] = useState<any>(null);
    const [copied, setCopied] = useState('');
    const [kyc, setKyc] = useState({ pan: '', bankOrUpi: '', accountName: '' });
    const [kycMsg, setKycMsg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/user/affiliate')
            .then(r => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
            .then(setData)
            .catch(() => setError('Could not load affiliate details.'));
    }, []);

    const copy = async (text: string, which: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(which); setTimeout(() => setCopied(''), 2000); } catch { /* noop */ }
    };

    const submitKyc = async () => {
        setKycMsg('');
        const res = await fetch('/api/user/kyc', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(kyc),
        });
        setKycMsg(res.ok ? 'KYC submitted. It will be verified before your first payout.' : 'KYC submit failed — check the details and try again.');
        if (res.ok) setData((d: any) => ({ ...d, kyc: { ...kyc, status: 'pending' } }));
    };

    if (error) return <p className="mt-8 text-sm text-rose-300">{error}</p>;
    if (!data) return <p className="mt-8 text-sm text-rose-200/60">Loading affiliate details…</p>;

    const statusOrder = ['pending', 'confirmed', 'approved', 'paid', 'reversed', 'held', 'rejected'];
    const ratePct = data.partnerTier === 'approved' ? Math.round(data.rates.partner * 100) : Math.round(data.rates.course * 100);

    return (
        <section className="mt-8">
            <p className="font-mono text-[11px] tracking-[0.3em] text-rose-300/80 mb-3 uppercase">Affiliate Program — Flat {ratePct}%</p>
            <div className="rounded-2xl border border-rose-900/60 bg-[#241019]/90 p-5 space-y-4">
                <p className="text-sm text-rose-100/80 leading-relaxed">
                    Anyone can earn — <strong className="text-white">no purchase needed</strong>. You earn a flat
                    <strong className="text-white"> {ratePct}% commission</strong> on course sales through your link or coupon
                    ({Math.round(data.rates.extension * 100)}% on extensions, 0% on the ₹19 demo). Single-tier, no levels.
                    {data.partnerTier === 'approved'
                        ? ' Your account is on the 40% partner tier.'
                        : ' Verified editors, photographers and creators can be approved for the 40% partner tier.'}
                </p>

                <div className="grid gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3 py-2.5">
                        <p className="flex-1 truncate font-mono text-xs text-rose-100/90">{data.referralLink}</p>
                        <button onClick={() => copy(data.referralLink, 'link')} className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-rose-200">
                            {copied === 'link' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />} Copy
                        </button>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3 py-2.5">
                        <p className="flex-1 font-mono text-xs text-rose-100/90">
                            Coupon: <span className="font-bold text-white">{data.coupon.code}</span>
                            <span className="text-rose-200/60"> — buyers get {data.coupon.discountPct}% off</span>
                        </p>
                        <button onClick={() => copy(data.coupon.code, 'coupon')} className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-rose-200">
                            {copied === 'coupon' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />} Copy
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-black/30 border border-white/10 px-2 py-3">
                        <p className="font-mono text-[9px] tracking-[0.2em] text-rose-200/60">SALES</p>
                        <p className="mt-1 text-xl font-extrabold">{data.sales}</p>
                    </div>
                    <div className="rounded-xl bg-black/30 border border-white/10 px-2 py-3">
                        <p className="font-mono text-[9px] tracking-[0.2em] text-rose-200/60">APPROVED + PAID</p>
                        <p className="mt-1 text-xl font-extrabold tabular-nums">₹{(((data.byStatus.approved?.amount || 0) + (data.byStatus.paid?.amount || 0))).toFixed(0)}</p>
                    </div>
                    <div className="rounded-xl bg-black/30 border border-white/10 px-2 py-3">
                        <p className="font-mono text-[9px] tracking-[0.2em] text-rose-200/60">TDS DEDUCTED</p>
                        <p className="mt-1 text-xl font-extrabold tabular-nums">₹{Number(data.totalTds || 0).toFixed(0)}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {statusOrder.filter(s => data.byStatus[s]).map(s => (
                        <span key={s} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold capitalize text-rose-100/90">
                            {s}: ₹{Number(data.byStatus[s].amount).toFixed(0)} ({data.byStatus[s].count})
                        </span>
                    ))}
                </div>
                <p className="text-[11px] text-rose-200/50">Commission moves pending → confirmed (48h after sale) → approved → paid in {data.payoutMinimum ? `batches (minimum ₹${data.payoutMinimum})` : 'batches'}. A refund reverses the commission.</p>

                {data.commissions?.length > 0 && (
                    <div className="space-y-1.5">
                        {data.commissions.slice(0, 8).map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between rounded-lg bg-black/25 border border-white/5 px-3 py-2 text-xs">
                                <span className="truncate text-rose-100/85">{c.productTitle || c.productSlug}</span>
                                <span className="shrink-0 font-mono tabular-nums">₹{Number(c.amount).toFixed(0)} · <span className="capitalize">{c.status}</span></span>
                            </div>
                        ))}
                    </div>
                )}

                {data.payouts?.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="text-xs font-bold tracking-wide text-rose-100/80">YOUR PAYOUTS</p>
                        {data.payouts.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between rounded-lg bg-black/25 border border-white/5 px-3 py-2 text-xs">
                                <span>{new Date(p.createdAt).toLocaleDateString('en-IN')} · {p.lines.map((l: any) => l.label).join(', ')}</span>
                                <span className="font-mono tabular-nums">₹{p.lines.reduce((s: number, l: any) => s + l.net, 0).toFixed(0)} net</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* KYC */}
                <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="w-4 h-4 text-emerald-300" /> KYC for payouts</p>
                    {data.kyc?.status === 'verified' ? (
                        <p className="mt-1 text-xs text-emerald-300">Verified ✓ — you are payout-ready.</p>
                    ) : data.kyc?.status === 'pending' ? (
                        <p className="mt-1 text-xs text-amber-300">Submitted — under review.</p>
                    ) : (
                        <>
                            <p className="mt-1 text-xs text-rose-200/60">PAN + bank/UPI are required before your first payout.</p>
                            <div className="mt-3 grid gap-2">
                                <input value={kyc.pan} onChange={e => setKyc({ ...kyc, pan: e.target.value })} placeholder="PAN (e.g. ABCDE1234F)" className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-rose-400/60" />
                                <input value={kyc.bankOrUpi} onChange={e => setKyc({ ...kyc, bankOrUpi: e.target.value })} placeholder="UPI ID or bank account + IFSC" className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-rose-400/60" />
                                <input value={kyc.accountName} onChange={e => setKyc({ ...kyc, accountName: e.target.value })} placeholder="Account holder name" className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-rose-400/60" />
                                <button onClick={submitKyc} className="rounded-lg bg-gradient-to-r from-[#732C3F] to-rose-500 py-2.5 text-sm font-bold">Submit KYC</button>
                                {kycMsg && <p className="text-xs text-rose-100/80">{kycMsg}</p>}
                            </div>
                        </>
                    )}
                </div>

                {/* Honest promotion rules */}
                <div className="rounded-xl border border-amber-400/20 bg-amber-950/30 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-amber-200"><AlertTriangle className="w-4 h-4" /> Promote honestly — always</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-amber-100/80">
                        <li>No income claims or earning screenshots — LearnPeak teaches skills, results are never guaranteed.</li>
                        <li>Always disclose that your link/coupon is a referral link.</li>
                        <li>No spam: no bulk unsolicited messages, no posting in groups against their rules.</li>
                        <li>Self-referral is blocked and flagged. Fraud leads to held/rejected commissions.</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
