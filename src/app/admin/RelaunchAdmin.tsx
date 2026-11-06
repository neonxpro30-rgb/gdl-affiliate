'use client';

import { useCallback, useEffect, useState } from 'react';

// Relaunch admin sections (new model). All data flows through the
// /api/admin/* routes. Legacy tabs (commissions/users/courses/blog)
// remain in the main admin page; "Legacy Bonuses" there is read-only.
const SUBTABS = ['Products', 'Settings', 'Affiliates', 'Payouts', 'Refunds', 'Tests', 'Certificates', 'Paid Work', 'Extensions', 'Lessons', 'Reports'] as const;
type SubTab = typeof SUBTABS[number];

const COURSE_SLUGS = ['reel-trailer-starter', 'emotional-reels', 'pro-wedding-trailer', 'meta-ads-photographers'];

async function api(path: string, method = 'GET', body?: any) {
    const res = await fetch(path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">{title}</h3>
            {children}
        </div>
    );
}

const inputCls = "border rounded-lg px-2.5 py-1.5 text-sm w-full";
const btnCls = "rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50";
const ghostCls = "rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-gray-50";

export default function RelaunchAdmin() {
    const [tab, setTab] = useState<SubTab>('Products');
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-5">
                {SUBTABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${tab === t ? 'bg-[#732C3F] text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>
                        {t}
                    </button>
                ))}
            </div>
            {tab === 'Products' && <ProductsPanel />}
            {tab === 'Settings' && <SettingsPanel />}
            {tab === 'Affiliates' && <AffiliatesPanel />}
            {tab === 'Payouts' && <PayoutsPanel />}
            {tab === 'Refunds' && <RefundsPanel />}
            {tab === 'Tests' && <TestsPanel />}
            {tab === 'Certificates' && <CertificatesPanel />}
            {tab === 'Paid Work' && <PaidWorkPanel />}
            {tab === 'Extensions' && <ExtensionsPanel />}
            {tab === 'Lessons' && <LessonsPanel />}
            {tab === 'Reports' && <ReportsPanel />}
        </div>
    );
}

/* ---------------- Products ---------------- */
function ProductsPanel() {
    const [products, setProducts] = useState<any[]>([]);
    const [msg, setMsg] = useState('');
    const load = useCallback(() => { api('/api/admin/products').then(d => setProducts(d.products)).catch(e => setMsg(e.message)); }, []);
    useEffect(() => { load(); }, [load]);
    const save = async (p: any) => {
        setMsg('');
        try { await api('/api/admin/products', 'POST', p); setMsg(`Saved ${p.slug}`); load(); }
        catch (e: any) { setMsg(e.message); }
    };
    return (
        <Section title="Products & Prices (old packages stay hidden from the storefront; existing buyers keep access)">
            {msg && <p className="text-sm text-blue-700 mb-2">{msg}</p>}
            <div className="space-y-3">
                {products.map((p, i) => (
                    <div key={p.slug} className="grid grid-cols-[1fr_110px_90px_90px_auto] gap-2 items-center border rounded-lg p-3">
                        <div>
                            <p className="font-semibold text-sm">{p.title}</p>
                            <p className="text-xs text-gray-500">{p.slug} · {p.type}</p>
                        </div>
                        <input type="number" className={inputCls} value={p.price} onChange={e => { const n = [...products]; n[i] = { ...p, price: Number(e.target.value) }; setProducts(n); }} />
                        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!p.active} onChange={e => { const n = [...products]; n[i] = { ...p, active: e.target.checked }; setProducts(n); }} /> Active</label>
                        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!p.visible} onChange={e => { const n = [...products]; n[i] = { ...p, visible: e.target.checked }; setProducts(n); }} /> Visible</label>
                        <button className={btnCls} onClick={() => save(p)}>Save</button>
                    </div>
                ))}
            </div>
        </Section>
    );
}

/* ---------------- Settings ---------------- */
function SettingsPanel() {
    const [s, setS] = useState<any>(null);
    const [msg, setMsg] = useState('');
    useEffect(() => { api('/api/admin/settings').then(d => setS(d.settings)).catch(e => setMsg(e.message)); }, []);
    if (!s) return <Section title="Settings"><p className="text-sm text-gray-500">{msg || 'Loading…'}</p></Section>;
    const num = (v: string) => (v === '' ? null : Number(v));
    const save = async () => {
        try { const d = await api('/api/admin/settings', 'POST', s); setS(d.settings); setMsg('Settings saved.'); }
        catch (e: any) { setMsg(e.message); }
    };
    const Row = ({ label, children }: any) => (
        <label className="grid grid-cols-[220px_1fr] items-center gap-3 text-sm">
            <span className="text-gray-600">{label}</span>{children}
        </label>
    );
    return (
        <Section title="Settings — rates, payouts, TDS, tests, business details">
            {msg && <p className="text-sm text-blue-700 mb-2">{msg}</p>}
            <div className="space-y-2.5 max-w-xl">
                <Row label="Course commission %"><input type="number" className={inputCls} value={Math.round(s.rates.course * 100)} onChange={e => setS({ ...s, rates: { ...s.rates, course: Number(e.target.value) / 100 } })} /></Row>
                <Row label="Partner tier %"><input type="number" className={inputCls} value={Math.round(s.rates.partner * 100)} onChange={e => setS({ ...s, rates: { ...s.rates, partner: Number(e.target.value) / 100 } })} /></Row>
                <Row label="Extension commission %"><input type="number" className={inputCls} value={Math.round(s.rates.extension * 100)} onChange={e => setS({ ...s, rates: { ...s.rates, extension: Number(e.target.value) / 100 } })} /></Row>
                <Row label="Coupon buyer discount %"><input type="number" className={inputCls} value={s.couponDiscountPct} onChange={e => setS({ ...s, couponDiscountPct: Number(e.target.value) })} /></Row>
                <Row label="Confirm commissions after (hours)"><input type="number" className={inputCls} value={s.confirmAfterHours} onChange={e => setS({ ...s, confirmAfterHours: Number(e.target.value) })} /></Row>
                <Row label="Payout minimum (₹)"><input type="number" className={inputCls} value={s.payout.minAmount} onChange={e => setS({ ...s, payout: { ...s.payout, minAmount: Number(e.target.value) } })} /></Row>
                <Row label="Payout cadence">
                    <select className={inputCls} value={s.payout.cadence} onChange={e => setS({ ...s, payout: { ...s.payout, cadence: e.target.value } })}>
                        <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option>
                    </select>
                </Row>
                <Row label="TDS % (blank = not set)"><input type="number" className={inputCls} value={s.tds.pct ?? ''} onChange={e => setS({ ...s, tds: { ...s.tds, pct: num(e.target.value) } })} /></Row>
                <Row label="TDS yearly threshold ₹ (blank = none)"><input type="number" className={inputCls} value={s.tds.yearlyThreshold ?? ''} onChange={e => setS({ ...s, tds: { ...s.tds, yearlyThreshold: num(e.target.value) } })} /></Row>
                <Row label="Test pass mark %"><input type="number" className={inputCls} value={s.test.passMarkPct} onChange={e => setS({ ...s, test: { ...s.test, passMarkPct: Number(e.target.value) } })} /></Row>
                <Row label="Retake cooldown (hours)"><input type="number" className={inputCls} value={s.test.retakeCooldownHours} onChange={e => setS({ ...s, test: { ...s.test, retakeCooldownHours: Number(e.target.value) } })} /></Row>
                <Row label="Licence machines per key"><input type="number" className={inputCls} value={s.activationLimit} onChange={e => setS({ ...s, activationLimit: Number(e.target.value) })} /></Row>
                <Row label="Cutover (ISO, set at go-live)"><input className={inputCls} value={s.cutoverAt ?? ''} placeholder="2026-11-07T00:00:00.000Z" onChange={e => setS({ ...s, cutoverAt: e.target.value || null })} /></Row>
                <Row label="Business legal name"><input className={inputCls} value={s.business.legalName} onChange={e => setS({ ...s, business: { ...s.business, legalName: e.target.value } })} /></Row>
                <Row label="Business address"><input className={inputCls} value={s.business.address} placeholder="To be added by Naksh" onChange={e => setS({ ...s, business: { ...s.business, address: e.target.value } })} /></Row>
                <Row label="Udyam number"><input className={inputCls} value={s.business.udyam} placeholder="To be added" onChange={e => setS({ ...s, business: { ...s.business, udyam: e.target.value } })} /></Row>
                <Row label="GST (if any)"><input className={inputCls} value={s.business.gst} placeholder="To be added" onChange={e => setS({ ...s, business: { ...s.business, gst: e.target.value } })} /></Row>
                <Row label="Support email"><input className={inputCls} value={s.business.supportEmail} placeholder="support@learnpeak.in" onChange={e => setS({ ...s, business: { ...s.business, supportEmail: e.target.value } })} /></Row>
                <button className={btnCls} onClick={save}>Save Settings</button>
            </div>
        </Section>
    );
}

/* ---------------- Affiliates ---------------- */
function AffiliatesPanel() {
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [msg, setMsg] = useState('');
    const load = useCallback(() => {
        api('/api/admin/affiliates').then(d => setAffiliates(d.affiliates)).catch(e => setMsg(e.message));
        api('/api/admin/commissions').then(d => setCommissions(d.commissions)).catch(() => { });
    }, []);
    useEffect(() => { load(); }, [load]);
    const act = async (path: string, body: any) => { try { await api(path, 'POST', body); load(); } catch (e: any) { setMsg(e.message); } };
    return (
        <>
            <Section title="Affiliates — partner tier (40%) approval & KYC review">
                {msg && <p className="text-sm text-red-600 mb-2">{msg}</p>}
                <div className="space-y-2">
                    {affiliates.map(a => (
                        <div key={a.id} className="border rounded-lg p-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <span className="font-semibold">{a.name}</span> <span className="text-gray-500">{a.email}</span>
                                    {a.proPool && <span className="ml-2 rounded bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[11px] font-bold">PRO POOL</span>}
                                    {a.fraudFlags?.length > 0 && <span className="ml-2 rounded bg-red-100 text-red-700 px-1.5 py-0.5 text-[11px] font-bold">⚠ {a.fraudFlags.join(', ')}</span>}
                                </div>
                                <span className="text-xs text-gray-500">Sales {a.sales} · Earned ₹{Number(a.earned).toFixed(0)} · Pending ₹{Number(a.pending).toFixed(0)}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 items-center text-xs">
                                <span>Partner: <strong>{a.partnerTier}</strong></span>
                                {a.partnerTier !== 'approved'
                                    ? <button className={ghostCls} onClick={() => act(`/api/admin/affiliates/${a.id}`, { partnerTier: 'approved' })}>Approve 40% partner</button>
                                    : <button className={ghostCls} onClick={() => act(`/api/admin/affiliates/${a.id}`, { partnerTier: 'none' })}>Remove partner tier</button>}
                                <span className="ml-3">KYC: <strong>{a.kyc?.status || 'none'}</strong>{a.kyc?.pan ? ` · PAN ${a.kyc.pan}` : ''}{a.kyc?.bankOrUpi ? ` · ${a.kyc.bankOrUpi}` : ''}</span>
                                {a.kyc?.status === 'pending' && <>
                                    <button className={ghostCls} onClick={() => act(`/api/admin/affiliates/${a.id}`, { kycStatus: 'verified' })}>Verify KYC</button>
                                    <button className={ghostCls} onClick={() => act(`/api/admin/affiliates/${a.id}`, { kycStatus: 'rejected' })}>Reject KYC</button>
                                </>}
                            </div>
                        </div>
                    ))}
                    {affiliates.length === 0 && <p className="text-sm text-gray-500">No affiliates with activity yet. Everyone becomes an affiliate free — this list fills as they sell.</p>}
                </div>
            </Section>
            <Section title="Commission ledger (new model)">
                <div className="space-y-1.5">
                    {commissions.map(c => (
                        <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg px-3 py-2 text-xs">
                            <span>{c.productTitle || c.productSlug} · ₹{Number(c.amount).toFixed(0)} @ {Math.round((c.rateApplied || 0) * 100)}% · <strong className="capitalize">{c.status}</strong>
                                {c.fraudFlags?.length > 0 && <span className="text-red-600"> · ⚠ {c.fraudFlags.join(', ')}</span>}
                                {c.holdReason && <span className="text-gray-500"> · {c.holdReason}</span>}
                            </span>
                            <span className="flex gap-1.5">
                                {c.status !== 'approved' && c.status !== 'paid' && <button className={ghostCls} onClick={() => act(`/api/admin/commissions/${c.id}`, { status: 'approved' })}>Approve</button>}
                                {c.status !== 'held' && c.status !== 'paid' && <button className={ghostCls} onClick={() => act(`/api/admin/commissions/${c.id}`, { status: 'held', note: prompt('Hold reason?') || '' })}>Hold</button>}
                                {c.status !== 'rejected' && c.status !== 'paid' && <button className={ghostCls} onClick={() => act(`/api/admin/commissions/${c.id}`, { status: 'rejected', note: prompt('Reject reason?') || '' })}>Reject</button>}
                            </span>
                        </div>
                    ))}
                    {commissions.length === 0 && <p className="text-sm text-gray-500">No new-model commissions yet.</p>}
                </div>
            </Section>
        </>
    );
}

/* ---------------- Payouts ---------------- */
function PayoutsPanel() {
    const [batches, setBatches] = useState<any[]>([]);
    const [msg, setMsg] = useState('');
    const load = useCallback(() => { api('/api/admin/payouts').then(d => setBatches(d.batches)).catch(e => setMsg(e.message)); }, []);
    useEffect(() => { load(); }, [load]);
    const build = async () => {
        setMsg('');
        try {
            const r = await api('/api/admin/payouts', 'POST');
            setMsg(r.batchId ? `Batch ${r.batchId} built: ${r.lines.length} lines.` : `No payable batch (skipped: ${r.skipped.map((x: any) => x.reason).join('; ') || 'nothing approved'})`);
            load();
        } catch (e: any) { setMsg(e.message); }
    };
    return (
        <Section title="Payouts — batches (affiliate commissions + paid projects, KYC + minimum enforced)">
            {msg && <p className="text-sm text-blue-700 mb-2">{msg}</p>}
            <button className={btnCls} onClick={build}>Build Payout Batch</button>
            <div className="mt-4 space-y-2">
                {batches.map(b => (
                    <div key={b.id} className="border rounded-lg p-3 text-sm">
                        <div className="flex justify-between">
                            <span><strong>{b.status}</strong> · {new Date(b.createdAt).toLocaleString('en-IN')} · {b.lines?.length || 0} lines</span>
                            <span className="font-mono">Gross ₹{Number(b.totalGross).toFixed(0)} · TDS ₹{Number(b.totalTds).toFixed(0)} · Net ₹{Number(b.totalNet).toFixed(0)}</span>
                        </div>
                        {b.status !== 'paid' && <button className={`${ghostCls} mt-2`} onClick={async () => { await api('/api/admin/payouts', 'PATCH', { batchId: b.id, note: prompt('Payment reference / note?') || '' }); load(); }}>Mark Paid</button>}
                        {b.paidAt && <p className="text-xs text-gray-500 mt-1">Paid {new Date(b.paidAt).toLocaleString('en-IN')} {b.paidNote ? `· ${b.paidNote}` : ''}</p>}
                    </div>
                ))}
                {batches.length === 0 && <p className="text-sm text-gray-500">No batches yet.</p>}
            </div>
        </Section>
    );
}

/* ---------------- Refunds ---------------- */
function RefundsPanel() {
    const [requests, setRequests] = useState<any[]>([]);
    const [msg, setMsg] = useState('');
    const load = useCallback(() => { api('/api/admin/refunds').then(d => setRequests(d.requests)).catch(e => setMsg(e.message)); }, []);
    useEffect(() => { load(); }, [load]);
    const act = async (id: string, action: string) => {
        try { const r = await api(`/api/admin/refunds/${id}`, 'POST', { action, note: prompt('Note (optional)?') || '' }); setMsg(action === 'approve' ? `Approved — ${r.commissionsReversed} commission(s) reversed. Complete the refund in PayU.` : 'Rejected.'); load(); }
        catch (e: any) { setMsg(e.message); }
    };
    return (
        <Section title="Refunds — rule: within 24h AND under 20% watched (auto-checked)">
            {msg && <p className="text-sm text-blue-700 mb-2">{msg}</p>}
            <div className="space-y-2">
                {requests.map(r => (
                    <div key={r.id} className="border rounded-lg p-3 text-sm flex flex-wrap justify-between gap-2">
                        <div>
                            <p><strong>{r.courseSlug || r.orderId}</strong> · <span className="capitalize">{r.status}</span></p>
                            <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString('en-IN')} · {r.reason || 'No reason given'}</p>
                            <p className="text-xs">Eligibility: <strong className={r.autoEligibility?.eligible ? 'text-emerald-600' : 'text-red-600'}>{r.autoEligibility?.eligible ? 'ELIGIBLE' : 'Not eligible'}</strong>
                                {` · within 24h: ${r.autoEligibility?.within24h ? 'yes' : 'no'} · watched ${r.autoEligibility?.watchedPct}%`}
                                {r.autoEligibility?.reasons?.length > 0 && ` · ${r.autoEligibility.reasons.join('; ')}`}
                            </p>
                        </div>
                        {r.status === 'pending' && (
                            <span className="flex gap-1.5">
                                <button className={ghostCls} onClick={() => act(r.id, 'approve')}>Approve</button>
                                <button className={ghostCls} onClick={() => act(r.id, 'reject')}>Reject</button>
                            </span>
                        )}
                    </div>
                ))}
                {requests.length === 0 && <p className="text-sm text-gray-500">No refund requests.</p>}
            </div>
        </Section>
    );
}

/* ---------------- Tests ---------------- */
function TestsPanel() {
    const [slug, setSlug] = useState(COURSE_SLUGS[0]);
    const [json, setJson] = useState('');
    const [passMark, setPassMark] = useState(70);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [msg, setMsg] = useState('');
    const loadTest = useCallback(() => {
        api(`/api/admin/tests/${slug}`).then(d => {
            const t = d.test;
            setJson(JSON.stringify(t?.questions || [], null, 1));
            if (t?.passMarkPct) setPassMark(t.passMarkPct);
        }).catch(e => setMsg(e.message));
        api('/api/admin/tests/attempts').then(d => setAttempts(d.attempts)).catch(() => { });
    }, [slug]);
    useEffect(() => { loadTest(); }, [loadTest]);
    const save = async () => {
        try {
            const questions = JSON.parse(json);
            await api(`/api/admin/tests/${slug}`, 'POST', { questions, passMarkPct: passMark });
            setMsg('Question bank saved.');
        } catch (e: any) { setMsg(e.message); }
    };
    const review = async (id: string, decision: string) => {
        try { await api(`/api/admin/tests/attempts/${id}`, 'POST', { decision, feedback: prompt('Feedback for the student (optional)?') || '' }); setMsg('Review saved.'); loadTest(); }
        catch (e: any) { setMsg(e.message); }
    };
    const awaiting = attempts.filter(a => a.status === 'AWAITING_REVIEW');
    return (
        <>
            <Section title="Question bank (per course) — format: [{question, options[4], correctIndex}]">
                {msg && <p className="text-sm text-blue-700 mb-2">{msg}</p>}
                <div className="flex gap-2 mb-3">
                    <select className={inputCls} value={slug} onChange={e => setSlug(e.target.value)}>
                        {COURSE_SLUGS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <label className="text-sm flex items-center gap-2 shrink-0">Pass % <input type="number" className="border rounded-lg px-2 py-1.5 w-20" value={passMark} onChange={e => setPassMark(Number(e.target.value))} /></label>
                </div>
                <textarea className="w-full border rounded-lg p-3 font-mono text-xs" rows={14} value={json} onChange={e => setJson(e.target.value)} />
                <button className={`${btnCls} mt-3`} onClick={save}>Save Question Bank</button>
            </Section>
            <Section title={`Practical review queue (${awaiting.length} waiting)`}>
                <div className="space-y-2">
                    {awaiting.map(a => (
                        <div key={a.id} className="border rounded-lg p-3 text-sm flex flex-wrap justify-between gap-2">
                            <div>
                                <p><strong>{a.courseSlug}</strong> · MCQ {a.mcqPct}% {a.mcqPassed ? '(passed)' : '(failed)'}</p>
                                <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString('en-IN')} · <a className="text-blue-600 underline" href={a.practicalUrl} target="_blank" rel="noreferrer">View practical edit</a></p>
                            </div>
                            <span className="flex gap-1.5">
                                <button className={ghostCls} onClick={() => review(a.id, 'approve')}>Approve Practical</button>
                                <button className={ghostCls} onClick={() => review(a.id, 'reject')}>Reject</button>
                            </span>
                        </div>
                    ))}
                    {awaiting.length === 0 && <p className="text-sm text-gray-500">Nothing waiting for review.</p>}
                </div>
            </Section>
        </>
    );
}

/* ---------------- Certificates ---------------- */
function CertificatesPanel() {
    const [certs, setCerts] = useState<any[]>([]);
    const [msg, setMsg] = useState('');
    const load = useCallback(() => { api('/api/admin/certificates').then(d => setCerts(d.certificates)).catch(e => setMsg(e.message)); }, []);
    useEffect(() => { load(); }, [load]);
    const toggle = async (id: string, status: string) => {
        try { await api(`/api/admin/certificates/${id}`, 'POST', { status }); load(); }
        catch (e: any) { setMsg(e.message); }
    };
    return (
        <Section title="Certificates — issue is automatic on test pass; revoke/reinstate here">
            {msg && <p className="text-sm text-red-600 mb-2">{msg}</p>}
            <div className="space-y-1.5">
                {certs.map(c => (
                    <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm">
                        <span><strong className="font-mono">{c.certId}</strong> · {c.studentName} · {c.courseTitle || c.courseSlug} · {c.issuedAt?.slice(0, 10)} · <strong className="capitalize">{c.status}</strong></span>
                        <span className="flex gap-1.5">
                            <a className={ghostCls} href={`/verify/${c.certId}`} target="_blank" rel="noreferrer">Verify page</a>
                            <a className={ghostCls} href={`/api/certificates/${c.certId}/pdf`} target="_blank" rel="noreferrer">PDF</a>
                            {c.status === 'valid'
                                ? <button className={ghostCls} onClick={() => toggle(c.id, 'revoked')}>Revoke</button>
                                : <button className={ghostCls} onClick={() => toggle(c.id, 'valid')}>Reinstate</button>}
                        </span>
                    </div>
                ))}
                {certs.length === 0 && <p className="text-sm text-gray-500">No certificates issued yet.</p>}
            </div>
        </Section>
    );
}

/* ---------------- Paid Work ---------------- */
function PaidWorkPanel() {
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [form, setForm] = useState({ title: '', clientName: '', footageLink: '', deadline: '', payAmount: '', assigneeId: '' });
    const [msg, setMsg] = useState('');
    const load = useCallback(() => {
        api('/api/admin/portfolios').then(d => setPortfolios(d.portfolios)).catch(() => { });
        api('/api/admin/projects').then(d => setProjects(d.projects)).catch(() => { });
        api('/api/admin/affiliates').then(d => setAffiliates(d.affiliates)).catch(() => { });
    }, []);
    useEffect(() => { load(); }, [load]);
    const pool = affiliates.filter(a => a.proPool);
    const create = async () => {
        try {
            await api('/api/admin/projects', 'POST', {
                title: form.title, clientName: form.clientName, footageLink: form.footageLink,
                deadline: form.deadline || null, payAmount: Number(form.payAmount) || 0,
                assigneeId: form.assigneeId || null,
            });
            setForm({ title: '', clientName: '', footageLink: '', deadline: '', payAmount: '', assigneeId: '' });
            setMsg('Project created.'); load();
        } catch (e: any) { setMsg(e.message); }
    };
    return (
        <>
            <Section title="Portfolio reviews → Pro Pool (paid work depends on quality; never guaranteed)">
                {msg && <p className="text-sm text-blue-700 mb-2">{msg}</p>}
                <div className="space-y-2">
                    {portfolios.map(p => (
                        <div key={p.id} className="border rounded-lg p-3 text-sm flex flex-wrap justify-between gap-2">
                            <div>
                                <p><strong>{p.userId}</strong> · <span className="capitalize">{p.status}</span></p>
                                <p className="text-xs text-gray-500">
                                    <a className="text-blue-600 underline" href={p.showreelLink} target="_blank" rel="noreferrer">Showreel</a>
                                    {(p.editLinks || []).map((l: string, i: number) => <span key={i}> · <a className="text-blue-600 underline" href={l} target="_blank" rel="noreferrer">Edit {i + 1}</a></span>)}
                                </p>
                                {p.feedback && <p className="text-xs text-gray-500">Feedback: {p.feedback}</p>}
                            </div>
                            {p.status === 'pending' && (
                                <span className="flex gap-1.5">
                                    <button className={ghostCls} onClick={async () => { await api(`/api/admin/portfolios/${p.id}`, 'POST', { decision: 'approve' }); load(); }}>Approve → Pro Pool</button>
                                    <button className={ghostCls} onClick={async () => { await api(`/api/admin/portfolios/${p.id}`, 'POST', { decision: 'reject', feedback: prompt('Feedback for the student?') || '' }); load(); }}>Reject</button>
                                </span>
                            )}
                        </div>
                    ))}
                    {portfolios.length === 0 && <p className="text-sm text-gray-500">No portfolios submitted yet.</p>}
                </div>
            </Section>
            <Section title="Projects — create & assign">
                <div className="grid gap-2 md:grid-cols-3 mb-3">
                    <input className={inputCls} placeholder="Project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <input className={inputCls} placeholder="Client (optional)" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} />
                    <input className={inputCls} placeholder="Footage link (Drive etc.)" value={form.footageLink} onChange={e => setForm({ ...form, footageLink: e.target.value })} />
                    <input className={inputCls} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                    <input className={inputCls} type="number" placeholder="Pay amount ₹" value={form.payAmount} onChange={e => setForm({ ...form, payAmount: e.target.value })} />
                    <select className={inputCls} value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                        <option value="">Assign later</option>
                        {pool.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
                    </select>
                </div>
                <button className={btnCls} onClick={create} disabled={!form.title}>Create Project</button>
                <div className="mt-4 space-y-2">
                    {projects.map(pr => (
                        <div key={pr.id} className="border rounded-lg p-3 text-sm flex flex-wrap justify-between gap-2">
                            <div>
                                <p><strong>{pr.title}</strong> · ₹{Number(pr.payAmount).toLocaleString('en-IN')} · <span className="capitalize">{String(pr.status).replace('_', ' ')}</span></p>
                                <p className="text-xs text-gray-500">{pr.clientName || 'No client'} {pr.deadline ? `· due ${String(pr.deadline).slice(0, 10)}` : ''} {pr.assigneeId ? `· assigned` : '· unassigned'} {pr.submissionLink ? '· submission received' : ''}</p>
                            </div>
                            <span className="flex gap-1.5">
                                {!pr.assigneeId && pool.length > 0 && (
                                    <select className="border rounded-lg px-2 py-1 text-xs" defaultValue="" onChange={async e => { if (e.target.value) { await api(`/api/admin/projects/${pr.id}`, 'PATCH', { assigneeId: e.target.value }); load(); } }}>
                                        <option value="">Assign to…</option>
                                        {pool.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                )}
                                {pr.status === 'submitted' && <>
                                    <button className={ghostCls} onClick={async () => { await api(`/api/admin/projects/${pr.id}`, 'PATCH', { status: 'revision' }); load(); }}>Request revision</button>
                                    <button className={ghostCls} onClick={async () => { await api(`/api/admin/projects/${pr.id}`, 'PATCH', { status: 'approved' }); load(); }}>Approve → payout queue</button>
                                </>}
                            </span>
                        </div>
                    ))}
                    {projects.length === 0 && <p className="text-sm text-gray-500">No projects yet.</p>}
                </div>
            </Section>
        </>
    );
}

/* ---------------- Extensions ---------------- */
function ExtensionsPanel() {
    const [exts, setExts] = useState<any[]>([]);
    const [licenses, setLicenses] = useState<any[]>([]);
    const [msg, setMsg] = useState('');
    const load = useCallback(() => {
        api('/api/admin/products').then(d => setExts(d.products.filter((p: any) => p.type === 'extension'))).catch(e => setMsg(e.message));
        api('/api/admin/licenses').then(d => setLicenses(d.licenses)).catch(() => { });
    }, []);
    useEffect(() => { load(); }, [load]);
    const save = async (p: any) => { try { await api('/api/admin/products', 'POST', p); setMsg(`Saved ${p.slug}`); load(); } catch (e: any) { setMsg(e.message); } };
    return (
        <Section title="Extensions — names & files are placeholders until Naksh supplies the real ones">
            {msg && <p className="text-sm text-blue-700 mb-2">{msg}</p>}
            <div className="space-y-3">
                {exts.map((p, i) => (
                    <div key={p.slug} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{p.title} <span className="text-gray-500 font-normal">({p.slug})</span></p>
                            <span className="flex gap-3 text-xs">
                                <label className="flex items-center gap-1">Price ₹<input type="number" className="border rounded px-1.5 py-0.5 w-20" value={p.price} onChange={e => { const n = [...exts]; n[i] = { ...p, price: Number(e.target.value) }; setExts(n); }} /></label>
                                <label className="flex items-center gap-1"><input type="checkbox" checked={!!p.active} onChange={e => { const n = [...exts]; n[i] = { ...p, active: e.target.checked }; setExts(n); }} /> Active</label>
                            </span>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4">
                            <input className={inputCls} placeholder="Version" value={p.version || ''} onChange={e => { const n = [...exts]; n[i] = { ...p, version: e.target.value }; setExts(n); }} />
                            <input className={inputCls} placeholder="Premiere versions (comma)" value={(p.premiereVersions || []).join(', ')} onChange={e => { const n = [...exts]; n[i] = { ...p, premiereVersions: e.target.value.split(',').map(x => x.trim()).filter(Boolean) }; setExts(n); }} />
                            <input className={inputCls} placeholder="Private file reference (NOT a public link)" value={p.fileRef || ''} onChange={e => { const n = [...exts]; n[i] = { ...p, fileRef: e.target.value }; setExts(n); }} />
                            <input className={inputCls} placeholder="Changelog (latest)" value={p.changelog || ''} onChange={e => { const n = [...exts]; n[i] = { ...p, changelog: e.target.value }; setExts(n); }} />
                        </div>
                        <button className={btnCls} onClick={() => save(p)}>Save</button>
                    </div>
                ))}
            </div>
            <h4 className="font-bold text-gray-800 mt-6 mb-2">Licences issued ({licenses.length})</h4>
            <div className="space-y-1">
                {licenses.map(l => (
                    <p key={l.id} className="text-xs border rounded-lg px-3 py-1.5 flex justify-between">
                        <span className="font-mono">{l.key}</span>
                        <span>{l.productSlug} · {l.activations?.length || 0}/{l.activationLimit} machines</span>
                    </p>
                ))}
                {licenses.length === 0 && <p className="text-sm text-gray-500">No licences yet.</p>}
            </div>
        </Section>
    );
}

/* ---------------- Lessons ---------------- */
function LessonsPanel() {
    const [courseId, setCourseId] = useState('');
    const [lessons, setLessons] = useState<any[]>([]);
    const [form, setForm] = useState({ title: '', videoLink: '', durationSec: '', order: '' });
    const [msg, setMsg] = useState('');
    const load = useCallback(() => {
        if (!courseId) return;
        api(`/api/admin/courses/${courseId}/lessons`).then(d => setLessons(d.lessons)).catch(e => setMsg(e.message));
    }, [courseId]);
    useEffect(() => { load(); }, [load]);
    const add = async () => {
        try {
            await api(`/api/admin/courses/${courseId}/lessons`, 'POST', {
                title: form.title, videoLink: form.videoLink,
                durationSec: Number(form.durationSec) || 0, order: Number(form.order) || lessons.length,
            });
            setForm({ title: '', videoLink: '', durationSec: '', order: '' }); load();
        } catch (e: any) { setMsg(e.message); }
    };
    const del = async (lessonId: string) => {
        await fetch(`/api/admin/courses/${courseId}/lessons?lessonId=${lessonId}`, { method: 'DELETE' });
        load();
    };
    return (
        <Section title="Lessons — pick a course doc ID (from the Courses tab). No lessons = the course's own videoLink plays as Lesson 1. Course 01's first lesson is the ₹19 demo.">
            {msg && <p className="text-sm text-red-600 mb-2">{msg}</p>}
            <div className="flex gap-2 mb-3">
                <input className={inputCls} placeholder="Course document ID" value={courseId} onChange={e => setCourseId(e.target.value)} />
                <button className={btnCls} onClick={load}>Load</button>
            </div>
            {courseId && (
                <>
                    <div className="space-y-1.5 mb-4">
                        {lessons.map(l => (
                            <div key={l.id} className="flex justify-between border rounded-lg px-3 py-2 text-sm">
                                <span>{l.order}. {l.title} <span className="text-gray-400 text-xs">{l.videoLink?.slice(0, 50)}</span></span>
                                <button className={ghostCls} onClick={() => del(l.id)}>Delete</button>
                            </div>
                        ))}
                        {lessons.length === 0 && <p className="text-sm text-gray-500">No lessons yet — the course videoLink is used as Lesson 1.</p>}
                    </div>
                    <div className="grid gap-2 md:grid-cols-4">
                        <input className={inputCls} placeholder="Lesson title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        <input className={inputCls} placeholder="Video link (Bunny / Gumlet / YouTube / Vimeo)" value={form.videoLink} onChange={e => setForm({ ...form, videoLink: e.target.value })} />
                        <input className={inputCls} type="number" placeholder="Duration (seconds)" value={form.durationSec} onChange={e => setForm({ ...form, durationSec: e.target.value })} />
                        <input className={inputCls} type="number" placeholder="Order" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
                    </div>
                    <button className={`${btnCls} mt-3`} onClick={add} disabled={!form.title}>Add Lesson</button>
                </>
            )}
        </Section>
    );
}

/* ---------------- Reports ---------------- */
function ReportsPanel() {
    const [r, setR] = useState<any>(null);
    const [msg, setMsg] = useState('');
    useEffect(() => { api('/api/admin/reports').then(setR).catch(e => setMsg(e.message)); }, []);
    if (!r) return <Section title="Reports"><p className="text-sm text-gray-500">{msg || 'Loading…'}</p></Section>;
    return (
        <Section title="Reports (new catalog)">
            <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="border rounded-lg p-3"><p className="text-gray-500">Total successful orders</p><p className="text-xl font-bold">{r.totalOrders}</p></div>
                <div className="border rounded-lg p-3"><p className="text-gray-500">Refund rate</p><p className="text-xl font-bold">{r.refundRate}%</p></div>
                <div className="border rounded-lg p-3"><p className="text-gray-500">Certificates issued</p><p className="text-xl font-bold">{r.certificatesIssued}</p></div>
                <div className="border rounded-lg p-3"><p className="text-gray-500">Demo buyers</p><p className="text-xl font-bold">{r.demoBuyers}</p></div>
                <div className="border rounded-lg p-3"><p className="text-gray-500">Demo → course conversion</p><p className="text-xl font-bold">{r.demoConversionPct}% ({r.demoConverted})</p></div>
                <div className="border rounded-lg p-3"><p className="text-gray-500">Paid projects</p><p className="text-xl font-bold">{r.paidProjects} / {r.totalProjects}</p></div>
            </div>
            <h4 className="font-bold mt-5 mb-2">Sales by product</h4>
            <div className="space-y-1 text-sm">
                {Object.entries(r.salesByProduct).map(([k, v]: any) => (
                    <p key={k} className="flex justify-between border rounded-lg px-3 py-1.5"><span>{k}</span><span>{v.count} sales · ₹{Number(v.revenue).toLocaleString('en-IN')}</span></p>
                ))}
                {Object.keys(r.salesByProduct).length === 0 && <p className="text-gray-500">No sales yet.</p>}
            </div>
            <h4 className="font-bold mt-5 mb-2">Top affiliates (new model)</h4>
            <div className="space-y-1 text-sm">
                {r.affiliatePerformance.map((a: any) => (
                    <p key={a.userId} className="flex justify-between border rounded-lg px-3 py-1.5"><span className="font-mono text-xs">{a.userId}</span><span>{a.sales} sales · ₹{Number(a.earned).toFixed(0)} earned</span></p>
                ))}
                {r.affiliatePerformance.length === 0 && <p className="text-gray-500">No affiliate sales yet.</p>}
            </div>
        </Section>
    );
}
