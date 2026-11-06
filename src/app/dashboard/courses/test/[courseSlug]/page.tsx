"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
    ArrowLeft,
    Award,
    BadgeCheck,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Loader2,
    Send,
    Video,
    XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types — mirrors the coordinator's /api/tests/[courseSlug] contract  */
/* NOTE: questions never carry correctIndex; it stays admin-only.     */
/* ------------------------------------------------------------------ */

interface TestQuestion {
    id: string;
    text: string;
    options: string[];
}

interface PracticalState {
    link?: string;
    reviewStatus?: "pending" | "approved" | "rejected";
    reviewerNote?: string;
}

interface AttemptState {
    status?: "IN_PROGRESS" | "AWAITING_REVIEW" | "PASSED" | "FAILED";
    mcqScorePct?: number | null;
    practical?: PracticalState;
    cooldownUntil?: string | null;
    certId?: string;
    updatedAt?: string;
}

interface CertificateInfo {
    certId: string;
    courseTitle?: string;
    issuedAt?: string;
}

interface TestPayload {
    questions: TestQuestion[];
    passMarkPct: number;
    cooldownHours: number;
    lastAttempt: AttemptState | null;
    certificate?: CertificateInfo | string | null;
    certId?: string;
    courseTitle?: string;
}

interface SubmitResult {
    mcqScorePct: number;
    status: string;
    certId?: string;
}

function formatDateTime(value?: string | null): string {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-rose-300/80">
            {children}
        </p>
    );
}

function PartChip({
    ok,
    warn,
    children,
}: {
    ok?: boolean;
    warn?: boolean;
    children: React.ReactNode;
}) {
    const cls = ok
        ? "border-emerald-400/40 bg-emerald-950/50 text-emerald-200"
        : warn
          ? "border-amber-400/40 bg-amber-950/50 text-amber-200"
          : "border-white/15 bg-black/30 text-rose-100/70";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
        >
            {children}
        </span>
    );
}

export default function CourseTestPage() {
    const params = useParams();
    const rawSlug = params?.courseSlug;
    const courseSlug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug as string);
    const { data: session } = useSession();

    const [data, setData] = useState<TestPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [practicalLink, setPracticalLink] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [result, setResult] = useState<SubmitResult | null>(null);

    const load = useCallback(async () => {
        if (!courseSlug) return;
        setLoading(true);
        setLoadError("");
        try {
            const res = await fetch(`/api/tests/${encodeURIComponent(courseSlug)}`);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    body.error || body.message || "Could not load the test.",
                );
            }
            const json = (await res.json()) as TestPayload;
            setData(json);
            if (json.lastAttempt?.practical?.link) {
                setPracticalLink(json.lastAttempt.practical.link);
            }
        } catch (err: any) {
            setLoadError(err?.message || "Could not load the test.");
        } finally {
            setLoading(false);
        }
    }, [courseSlug]);

    useEffect(() => {
        load();
    }, [load]);

    /* Effective attempt: a fresh submit result wins over the loaded one. */
    const attempt: AttemptState | null = useMemo(() => {
        if (!data) return null;
        if (!result) return data.lastAttempt;
        return {
            ...(data.lastAttempt || {}),
            status: result.status as AttemptState["status"],
            mcqScorePct: result.mcqScorePct,
            certId: result.certId || data.lastAttempt?.certId,
            practical: {
                ...(data.lastAttempt?.practical || {}),
                link: practicalLink || data.lastAttempt?.practical?.link,
                reviewStatus:
                    result.status === "PASSED"
                        ? "approved"
                        : data.lastAttempt?.practical?.reviewStatus || "pending",
            },
        };
    }, [data, result, practicalLink]);

    const certId: string | null = useMemo(() => {
        if (!data) return null;
        if (typeof data.certificate === "string") return data.certificate;
        return (
            data.certificate?.certId ||
            result?.certId ||
            attempt?.certId ||
            data.certId ||
            null
        );
    }, [data, result, attempt]);

    const passMark = data?.passMarkPct ?? 70;
    const status = attempt?.status;
    const isPassed = status === "PASSED";
    const mcqScore = attempt?.mcqScorePct ?? null;
    const mcqPassed = mcqScore !== null && mcqScore >= passMark;
    const practicalStatus = attempt?.practical?.reviewStatus;

    const cooldownUntil = attempt?.cooldownUntil
        ? new Date(attempt.cooldownUntil)
        : null;
    const inCooldown =
        status === "FAILED" &&
        cooldownUntil !== null &&
        !Number.isNaN(cooldownUntil.getTime()) &&
        cooldownUntil.getTime() > Date.now();

    const allAnswered =
        !!data &&
        data.questions.length > 0 &&
        data.questions.every((q) => answers[q.id] !== undefined);
    const canSubmit =
        allAnswered && practicalLink.trim().length > 0 && !submitting;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!data || !canSubmit) return;
        setSubmitting(true);
        setSubmitError("");
        try {
            const res = await fetch(
                `/api/tests/${encodeURIComponent(courseSlug)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        answers,
                        practicalLink: practicalLink.trim(),
                    }),
                },
            );
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    body.error || body.message || "Submission failed. Please try again.",
                );
            }
            setResult({
                mcqScorePct: body.mcqScorePct,
                status: body.status,
                certId: body.certId || body.certificate?.certId,
            });
            // Refresh server state (certificate, cooldown, review status).
            load();
        } catch (err: any) {
            setSubmitError(err?.message || "Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    /* ------------------------------ states ------------------------------ */

    if (loading && !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#1A0B12]">
                <p className="flex items-center gap-2 text-sm text-rose-200/70">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your test…
                </p>
            </div>
        );
    }

    if (loadError && !data) {
        return (
            <div className="min-h-screen bg-[#1A0B12] text-white">
                {session?.user && <DashboardNavbar user={session.user} />}
                <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                    <XCircle className="mx-auto h-10 w-10 text-rose-400" />
                    <h1 className="mt-4 text-xl font-bold">Could not load the test</h1>
                    <p className="mt-2 text-sm text-rose-100/70">{loadError}</p>
                    <button
                        onClick={load}
                        className="mt-6 rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#1A0B12] text-white">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[#732C3F]/30 blur-[120px]" />
            {session?.user && <DashboardNavbar user={session.user} />}

            <div className="relative mx-auto max-w-2xl px-4 pb-24 pt-6 md:max-w-3xl">
                <Link
                    href="/dashboard/courses"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-200/70 transition hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to My Courses
                </Link>

                <h1 className="font-display mt-4 text-3xl uppercase tracking-wide md:text-4xl">
                    Final Test
                </h1>
                <p className="mt-1 text-sm text-rose-200/70">
                    {data.courseTitle || courseSlug}
                </p>

                {/* ------------------------- Intro ------------------------- */}
                <section className="mt-6 rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 md:p-6">
                    <SectionLabel>How passing works</SectionLabel>
                    <ul className="space-y-2.5 text-sm leading-relaxed text-rose-100/85">
                        <li className="flex gap-2">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                            <span>
                                <strong className="text-white">Part 1 — MCQ:</strong>{" "}
                                score at least{" "}
                                <strong className="text-white">{passMark}%</strong> to
                                clear this part.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <Video className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                            <span>
                                <strong className="text-white">Part 2 — Practical:</strong>{" "}
                                submit a link to your edited video. Our team reviews
                                it manually.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                            <span>
                                You pass only when <strong className="text-white">both
                                parts</strong> are cleared — MCQ at or above the pass
                                mark <em>and</em> your practical is approved.
                            </span>
                        </li>
                        {data.cooldownHours > 0 && (
                            <li className="flex gap-2">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                                <span>
                                    If an attempt fails, you can retake it after a{" "}
                                    {data.cooldownHours}-hour cooldown.
                                </span>
                            </li>
                        )}
                    </ul>
                </section>

                {/* --------------------- Attempt status --------------------- */}
                {attempt && status && status !== "IN_PROGRESS" && (
                    <section className="mt-5 rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 md:p-6">
                        <SectionLabel>Your attempt</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            <PartChip ok={mcqPassed} warn={mcqScore !== null && !mcqPassed}>
                                {mcqPassed ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                )}
                                Part 1 · MCQ:{" "}
                                {mcqScore !== null ? `${mcqScore}%` : "—"} (pass mark{" "}
                                {passMark}%)
                            </PartChip>
                            <PartChip
                                ok={practicalStatus === "approved"}
                                warn={practicalStatus === "pending" || practicalStatus === "rejected"}
                            >
                                {practicalStatus === "approved" ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                    <Clock className="h-3.5 w-3.5" />
                                )}
                                Part 2 · Practical:{" "}
                                {practicalStatus === "approved"
                                    ? "Approved"
                                    : practicalStatus === "rejected"
                                      ? "Rejected"
                                      : "Awaiting review"}
                            </PartChip>
                        </div>

                        {status === "AWAITING_REVIEW" && (
                            <p className="mt-4 text-sm leading-relaxed text-amber-100/85">
                                Your MCQ is scored. Your practical video is with our
                                review team — your result will update here once the
                                review is done.
                            </p>
                        )}
                        {status === "FAILED" && (
                            <p className="mt-4 text-sm leading-relaxed text-rose-100/85">
                                This attempt did not pass.
                                {attempt.practical?.reviewerNote && (
                                    <>
                                        {" "}
                                        Reviewer note:{" "}
                                        <span className="text-white">
                                            {attempt.practical.reviewerNote}
                                        </span>
                                    </>
                                )}
                                {inCooldown && cooldownUntil && (
                                    <>
                                        {" "}
                                        You can retake the test after{" "}
                                        <strong className="text-white">
                                            {formatDateTime(attempt.cooldownUntil)} IST
                                        </strong>
                                        .
                                    </>
                                )}
                            </p>
                        )}
                        {attempt.practical?.reviewerNote &&
                            status === "AWAITING_REVIEW" && (
                                <p className="mt-2 text-sm text-rose-100/70">
                                    Reviewer note: {attempt.practical.reviewerNote}
                                </p>
                            )}
                    </section>
                )}

                {/* --------------------- Certificate --------------------- */}
                {isPassed && (
                    <section className="mt-5 rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-950/60 to-[#241019] p-5 md:p-6">
                        <div className="flex items-start gap-4">
                            <Award className="h-10 w-10 shrink-0 text-emerald-300" />
                            <div className="min-w-0">
                                <h2 className="text-xl font-extrabold text-emerald-200">
                                    You passed — certificate issued!
                                </h2>
                                {certId ? (
                                    <>
                                        <p className="mt-1 text-sm text-emerald-100/80">
                                            Certificate ID:{" "}
                                            <span className="font-mono font-bold text-white">
                                                {certId}
                                            </span>
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <a
                                                href={`/api/certificates/${encodeURIComponent(certId)}/pdf`}
                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:brightness-110"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download Certificate (PDF)
                                            </a>
                                            <Link
                                                href={`/verify/${encodeURIComponent(certId)}`}
                                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/50 px-4 py-2.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-950/60"
                                            >
                                                <BadgeCheck className="h-4 w-4" />
                                                View Public Verification
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mt-1 text-sm text-emerald-100/80">
                                        Your certificate is being prepared and will
                                        appear here shortly.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ------------------------- Form ------------------------- */}
                {!isPassed &&
                    (inCooldown ? (
                        <section className="mt-5 rounded-3xl border border-amber-400/40 bg-amber-950/30 p-5 text-center md:p-6">
                            <Clock className="mx-auto h-8 w-8 text-amber-300" />
                            <h2 className="mt-3 font-bold text-amber-100">
                                Retake cooldown active
                            </h2>
                            <p className="mt-1 text-sm text-amber-100/75">
                                You can attempt this test again after{" "}
                                <strong className="text-white">
                                    {formatDateTime(attempt?.cooldownUntil)} IST
                                </strong>
                                .
                            </p>
                        </section>
                    ) : status === "AWAITING_REVIEW" ? (
                        <section className="mt-5 rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 text-center md:p-6">
                            <Clock className="mx-auto h-8 w-8 text-amber-300" />
                            <h2 className="mt-3 font-bold">Practical under review</h2>
                            <p className="mt-1 text-sm text-rose-100/70">
                                Nothing more to do right now — check back here for
                                your final result.
                            </p>
                        </section>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                            <section className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 md:p-6">
                                <SectionLabel>Part 1 · MCQ</SectionLabel>
                                <div className="space-y-6">
                                    {data.questions.map((q, qi) => (
                                        <fieldset key={q.id}>
                                            <legend className="text-sm font-semibold leading-relaxed text-white">
                                                {qi + 1}. {q.text}
                                            </legend>
                                            <div className="mt-3 space-y-2">
                                                {q.options.map((opt, oi) => {
                                                    const selected =
                                                        answers[q.id] === oi;
                                                    return (
                                                        <label
                                                            key={oi}
                                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                                                                selected
                                                                    ? "border-rose-400 bg-rose-950/60 text-white"
                                                                    : "border-white/10 bg-black/30 text-rose-100/80 hover:border-rose-400/50"
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q-${q.id}`}
                                                                value={oi}
                                                                checked={selected}
                                                                onChange={() =>
                                                                    setAnswers(
                                                                        (prev) => ({
                                                                            ...prev,
                                                                            [q.id]: oi,
                                                                        }),
                                                                    )
                                                                }
                                                                className="h-4 w-4 shrink-0 accent-rose-500"
                                                            />
                                                            <span>{opt}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </fieldset>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 md:p-6">
                                <SectionLabel>Part 2 · Practical</SectionLabel>
                                <label
                                    htmlFor="practicalLink"
                                    className="text-sm font-semibold text-white"
                                >
                                    Link to your edited video
                                </label>
                                <p className="mt-1 text-xs leading-relaxed text-rose-100/60">
                                    Paste a viewable link (Google Drive, YouTube
                                    unlisted, etc.) to the trailer/edit you made for
                                    this test. Make sure anyone with the link can
                                    watch it.
                                </p>
                                <input
                                    id="practicalLink"
                                    type="url"
                                    required
                                    placeholder="https://…"
                                    value={practicalLink}
                                    onChange={(e) =>
                                        setPracticalLink(e.target.value)
                                    }
                                    className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-rose-100/30 focus:border-rose-400 focus:outline-none"
                                />
                            </section>

                            {result && (
                                <div
                                    className={`rounded-2xl border px-4 py-3 text-sm ${
                                        result.status === "PASSED"
                                            ? "border-emerald-400/40 bg-emerald-950/50 text-emerald-100"
                                            : result.status === "FAILED"
                                              ? "border-red-400/40 bg-red-950/50 text-red-100"
                                              : "border-amber-400/40 bg-amber-950/50 text-amber-100"
                                    }`}
                                >
                                    <strong>Result:</strong> MCQ score{" "}
                                    {result.mcqScorePct}% ·{" "}
                                    {result.status === "PASSED"
                                        ? "Passed!"
                                        : result.status === "FAILED"
                                          ? "Not passed this time — see the cooldown note above."
                                          : "Your practical is now awaiting review."}
                                </div>
                            )}

                            {submitError && (
                                <div className="rounded-2xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
                                    {submitError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 py-3.5 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {submitting
                                    ? "Submitting…"
                                    : !allAnswered
                                      ? "Answer all questions to submit"
                                      : "Submit Test"}
                            </button>
                        </form>
                    ))}
            </div>
        </div>
    );
}
