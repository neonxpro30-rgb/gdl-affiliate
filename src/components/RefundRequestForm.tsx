"use client";

import { useMemo, useState } from "react";
import {
    CheckCircle2,
    Clock,
    Loader2,
    RotateCcw,
    Send,
    XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Props — the coordinator drops this into the dashboard with the      */
/* user's orders (and optionally their previous refund requests).      */
/* ------------------------------------------------------------------ */

export interface RefundOrderOption {
    id: string;
    courseTitle: string;
    productSlug: string;
    createdAt: string;
}

export interface PreviousRefundRequest {
    id: string;
    orderId?: string;
    courseSlug?: string;
    courseTitle?: string;
    reason?: string;
    status: string;
    eligible?: boolean;
    reasons?: string[];
    createdAt?: string;
}

interface RefundRequestFormProps {
    orders: RefundOrderOption[];
    previousRequests?: PreviousRefundRequest[];
    /** Alias accepted for convenience if the parent passes `requests`. */
    requests?: PreviousRefundRequest[];
}

interface EligibilityResult {
    eligible: boolean;
    reasons: string[];
}

const STATUS_CHIP: Record<string, string> = {
    pending: "border-amber-400/40 bg-amber-950/50 text-amber-200",
    under_review: "border-amber-400/40 bg-amber-950/50 text-amber-200",
    approved: "border-emerald-400/40 bg-emerald-950/50 text-emerald-200",
    refunded: "border-emerald-400/40 bg-emerald-950/50 text-emerald-200",
    rejected: "border-red-400/40 bg-red-950/50 text-red-200",
    denied: "border-red-400/40 bg-red-950/50 text-red-200",
};

function formatDate(value?: string): string {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function RefundRequestForm({
    orders,
    previousRequests,
    requests,
}: RefundRequestFormProps) {
    const history = previousRequests || requests || [];

    const [orderId, setOrderId] = useState(orders[0]?.id || "");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<EligibilityResult | null>(null);

    const selectedOrder = useMemo(
        () => orders.find((o) => o.id === orderId) || null,
        [orders, orderId],
    );

    const titleForOrder = (orderIdToFind?: string, fallback?: string) => {
        if (fallback) return fallback;
        const match = orders.find((o) => o.id === orderIdToFind);
        return match?.courseTitle || orderIdToFind || "Order";
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedOrder || submitting) return;
        setSubmitting(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch("/api/refunds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: selectedOrder.id,
                    courseSlug: selectedOrder.productSlug,
                    productSlug: selectedOrder.productSlug,
                    reason: reason.trim(),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    data.error || data.message || "Could not submit your refund request.",
                );
            }
            if (typeof data.eligible === "boolean") {
                setResult({
                    eligible: data.eligible,
                    reasons: Array.isArray(data.reasons) ? data.reasons : [],
                });
            } else if (data.message || data.status) {
                setResult({
                    eligible: data.eligible ?? false,
                    reasons: data.message ? [data.message] : [],
                });
            } else {
                setResult({
                    eligible: false,
                    reasons: [
                        "Your request has been received. LearnPeak reviews every request.",
                    ],
                });
            }
            setReason("");
        } catch (err: any) {
            setError(err?.message || "Could not submit your refund request.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 text-white md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
                <RotateCcw className="h-5 w-5 text-rose-300" /> Request a Refund
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-rose-100/70">
                Tell us which order and why. Every request is reviewed by the
                LearnPeak team — submitting a request does not guarantee a refund.
            </p>

            {orders.length === 0 ? (
                <p className="mt-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-rose-100/70">
                    You have no orders that a refund can be requested for.
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label
                            htmlFor="refund-order"
                            className="text-sm font-semibold text-white"
                        >
                            Order
                        </label>
                        <select
                            id="refund-order"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-rose-400 focus:outline-none"
                        >
                            {orders.map((order) => (
                                <option key={order.id} value={order.id}>
                                    {order.courseTitle}
                                    {order.createdAt
                                        ? ` — ${formatDate(order.createdAt)}`
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="refund-reason"
                            className="text-sm font-semibold text-white"
                        >
                            Reason
                        </label>
                        <textarea
                            id="refund-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows={4}
                            placeholder="Please explain why you are requesting a refund…"
                            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-rose-100/30 focus:border-rose-400 focus:outline-none"
                        />
                    </div>

                    {result && (
                        <div
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                                result.eligible
                                    ? "border-emerald-400/40 bg-emerald-950/50 text-emerald-100"
                                    : "border-amber-400/40 bg-amber-950/50 text-amber-100"
                            }`}
                        >
                            <p className="flex items-start gap-2 font-semibold">
                                {result.eligible ? (
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                ) : (
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                                )}
                                {result.eligible
                                    ? "Your request looks eligible based on our automatic checks."
                                    : "Your request has been submitted for review."}
                            </p>
                            {result.reasons.length > 0 && (
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-rose-100/85">
                                    {result.reasons.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            )}
                            <p className="mt-2 text-xs opacity-80">
                                Note: LearnPeak reviews every request before any
                                refund is processed.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !selectedOrder || !reason.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 py-3 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        {submitting ? "Submitting…" : "Submit Refund Request"}
                    </button>
                </form>
            )}

            {history.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-rose-300/80">
                        Your Previous Requests
                    </p>
                    <div className="mt-3 space-y-3">
                        {history.map((req) => (
                            <div
                                key={req.id}
                                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-white">
                                        {titleForOrder(req.orderId, req.courseTitle)}
                                    </p>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${STATUS_CHIP[req.status] || "border-white/15 bg-black/30 text-rose-100/70"}`}
                                    >
                                        {req.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                                {req.createdAt && (
                                    <p className="mt-1 text-xs text-rose-100/50">
                                        Requested on {formatDate(req.createdAt)}
                                    </p>
                                )}
                                {req.reason && (
                                    <p className="mt-1.5 text-sm text-rose-100/70">
                                        {req.reason}
                                    </p>
                                )}
                                {Array.isArray(req.reasons) && req.reasons.length > 0 && (
                                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-rose-100/60">
                                        {req.reasons.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
