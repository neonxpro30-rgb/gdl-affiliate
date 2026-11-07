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
        <p className="lpd-pixel mb-3 text-[15px] uppercase tracking-[0.18em] text-[#D93C78]">
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
        ? "lpd-badge lpd-badge-mint"
        : warn
          ? "lpd-badge lpd-badge-butter"
          : "lpd-badge lpd-badge-lav";
    return (
        <span className={`${cls} normal-case tracking-normal text-[13px]`}>
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
            <div className="lpd-shell flex min-h-screen items-center justify-center">
                <p className="flex items-center gap-2 text-sm text-[#6B5F80]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your test…
                </p>
            </div>
        );
    }

    if (loadError && !data) {
        return (
            <div className="lpd-shell min-h-screen">
                {session?.user && <DashboardNavbar user={session.user} />}
                <div className="mx-auto max-w-2xl px-4 py-16">
                    <div className="lpd-card p-8 text-center">
                        <XCircle className="mx-auto h-10 w-10 text-[#FF4F5E]" />
                        <h1 className="lpd-display mt-4 text-xl font-bold text-[#1E1530]">Could not load the test</h1>
                        <p className="mt-2 text-sm text-[#6B5F80]">{loadError}</p>
                        <button
                            onClick={load}
                            className="lpd-btn lpd-btn-pink lpd-btn-sm mt-6"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="lpd-shell relative min-h-screen overflow-hidden">
            {session?.user && <DashboardNavbar user={session.user} />}

            <div className="relative mx-auto max-w-2xl px-4 pb-24 pt-6 md:max-w-3xl">
                <Link
                    href="/dashboard/courses"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B5F80] transition hover:text-[#1E1530]"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to My Courses
                </Link>

                <div className="lpd-banner mt-4 px-5 py-5 md:px-6">
                    <h1 className="lpd-display text-3xl uppercase tracking-wide text-[#1E1530] md:text-4xl">
                        Final Test
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-[#6B5F80]">
                        {data.courseTitle || courseSlug}
                    </p>
                </div>

                {/* ------------------------- Intro ------------------------- */}
                <section className="lpd-card mt-6 p-5 md:p-6">
                    <SectionLabel>How passing works</SectionLabel>
                    <ul className="space-y-2.5 text-sm leading-relaxed text-[#3B3150]">
                        <li className="flex gap-2">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#D93C78]" />
                            <span>
                                <strong className="text-[#1E1530]">Part 1 — MCQ:</strong>{" "}
                                score at least{" "}
                                <strong className="text-[#1E1530]">{passMark}%</strong> to
                                clear this part.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <Video className="mt-0.5 h-4 w-4 shrink-0 text-[#D93C78]" />
                            <span>
                                <strong className="text-[#1E1530]">Part 2 — Practical:</strong>{" "}
                                submit a link to your edited video. Our team reviews
                                it manually.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#D93C78]" />
                            <span>
                                You pass only when <strong className="text-[#1E1530]">both
                                parts</strong> are cleared — MCQ at or above the pass
                                mark <em>and</em> your practical is approved.
                            </span>
                        </li>
                        {data.cooldownHours > 0 && (
                            <li className="flex gap-2">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#D93C78]" />
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
                    <section className="lpd-card mt-5 p-5 md:p-6">
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
                            <p className="mt-4 text-sm leading-relaxed text-[#3B3150] bg-[#FFE9AE]/50 border border-[rgba(59,49,80,.14)] rounded-[14px] px-3 py-2.5">
                                Your MCQ is scored. Your practical video is with our
                                review team — your result will update here once the
                                review is done.
                            </p>
                        )}
                        {status === "FAILED" && (
                            <p className="mt-4 text-sm leading-relaxed text-[#3B3150] bg-[#FF4F5E]/10 border border-[#FF4F5E]/30 rounded-[14px] px-3 py-2.5">
                                This attempt did not pass.
                                {attempt.practical?.reviewerNote && (
                                    <>
                                        {" "}
                                        Reviewer note:{" "}
                                        <span className="text-[#1E1530] font-semibold">
                                            {attempt.practical.reviewerNote}
                                        </span>
                                    </>
                                )}
                                {inCooldown && cooldownUntil && (
                                    <>
                                        {" "}
                                        You can retake the test after{" "}
                                        <strong className="text-[#1E1530]">
                                            {formatDateTime(attempt.cooldownUntil)} IST
                                        </strong>
                                        .
                                    </>
                                )}
                            </p>
                        )}
                        {attempt.practical?.reviewerNote &&
                            status === "AWAITING_REVIEW" && (
                                <p className="mt-2 text-sm text-[#6B5F80]">
                                    Reviewer note: {attempt.practical.reviewerNote}
                                </p>
                            )}
                    </section>
                )}

                {/* --------------------- Certificate --------------------- */}
                {isPassed && (
                    <section className="lpd-card mt-5 p-5 md:p-6 border-[#0F8E69]/40 bg-[#E9FBF4]">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white border-2 border-[#0F8E69]/30">
                                <Award className="h-6 w-6 text-[#0F8E69]" />
                            </div>
                            <div className="min-w-0">
                                <p className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#0F8E69]">Certificate</p>
                                <h2 className="lpd-display text-xl font-extrabold text-[#1E1530]">
                                    You passed — certificate issued!
                                </h2>
                                {certId ? (
                                    <>
                                        <p className="mt-1 text-sm text-[#3B3150]">
                                            Certificate ID:{" "}
                                            <span className="lpd-pixel text-[18px] font-bold text-[#1E1530]">
                                                {certId}
                                            </span>
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <a
                                                href={`/api/certificates/${encodeURIComponent(certId)}/pdf`}
                                                className="lpd-btn lpd-btn-sm"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download Certificate (PDF)
                                            </a>
                                            <Link
                                                href={`/verify/${encodeURIComponent(certId)}`}
                                                className="lpd-btn lpd-btn-ghost lpd-btn-sm"
                                            >
                                                <BadgeCheck className="h-4 w-4" />
                                                View Public Verification
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mt-1 text-sm text-[#3B3150]">
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
                        <section className="lpd-card mt-5 p-5 text-center md:p-6 bg-[#FFE9AE]/40 border-[rgba(59,49,80,.2)]">
                            <Clock className="mx-auto h-8 w-8 text-[#3B3150]" />
                            <h2 className="lpd-display mt-3 font-bold text-[#1E1530]">
                                Retake cooldown active
                            </h2>
                            <p className="mt-1 text-sm text-[#3B3150]">
                                You can attempt this test again after{" "}
                                <strong className="text-[#1E1530]">
                                    {formatDateTime(attempt?.cooldownUntil)} IST
                                </strong>
                                .
                            </p>
                        </section>
                    ) : status === "AWAITING_REVIEW" ? (
                        <section className="lpd-card mt-5 p-5 text-center md:p-6">
                            <Clock className="mx-auto h-8 w-8 text-[#6B5F80]" />
                            <h2 className="lpd-display mt-3 font-bold text-[#1E1530]">Practical under review</h2>
                            <p className="mt-1 text-sm text-[#6B5F80]">
                                Nothing more to do right now — check back here for
                                your final result.
                            </p>
                        </section>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                            <section className="lpd-card p-5 md:p-6">
                                <SectionLabel>Part 1 · MCQ</SectionLabel>
                                <div className="space-y-6">
                                    {data.questions.map((q, qi) => (
                                        <fieldset key={q.id}>
                                            <legend className="text-sm font-semibold leading-relaxed text-[#1E1530]">
                                                {qi + 1}. {q.text}
                                            </legend>
                                            <div className="mt-3 space-y-2">
                                                {q.options.map((opt, oi) => {
                                                    const selected =
                                                        answers[q.id] === oi;
                                                    return (
                                                        <label
                                                            key={oi}
                                                            className={`flex cursor-pointer items-center gap-3 rounded-[14px] border-2 px-4 py-3 text-sm transition ${
                                                                selected
                                                                    ? "border-[#FF8AC4] bg-[#FFE9F3] text-[#1E1530] font-semibold"
                                                                    : "border-[rgba(59,49,80,.14)] bg-white text-[#3B3150] hover:border-[#CFC6E2]"
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
                                                                className="h-4 w-4 shrink-0 accent-[#D93C78]"
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

                            <section className="lpd-card p-5 md:p-6">
                                <SectionLabel>Part 2 · Practical</SectionLabel>
                                <label
                                    htmlFor="practicalLink"
                                    className="lpd-label"
                                >
                                    Link to your edited video
                                </label>
                                <p className="mt-1 text-xs leading-relaxed text-[#6B5F80]">
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
                                    className="lpd-input mt-3"
                                />
                            </section>

                            {result && (
                                <div
                                    className={`rounded-[16px] border-2 px-4 py-3 text-sm ${
                                        result.status === "PASSED"
                                            ? "border-[#0F8E69]/35 bg-[#E9FBF4] text-[#1E1530]"
                                            : result.status === "FAILED"
                                              ? "border-[#FF4F5E]/35 bg-[#FF4F5E]/10 text-[#1E1530]"
                                              : "border-[rgba(59,49,80,.2)] bg-[#FFE9AE]/50 text-[#1E1530]"
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
                                <div className="rounded-[16px] border-2 border-[#FF4F5E]/35 bg-[#FF4F5E]/10 px-4 py-3 text-sm text-[#1E1530]">
                                    {submitError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="lpd-btn lpd-btn-pink lpd-btn-block"
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
