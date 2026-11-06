import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
    Briefcase,
    CalendarClock,
    CheckCircle2,
    Clock,
    ExternalLink,
    FolderOpen,
    IndianRupee,
    Lock,
    PlayCircle,
    Send,
    Video,
} from "lucide-react";
import { db } from "@/lib/firebaseAdmin";
import DashboardNavbar from "@/components/DashboardNavbar";
import { hasPassedCourse } from "@/lib/access";
import { COURSE_SLUGS } from "@/lib/products";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function toDate(value: unknown): Date | null {
    if (!value) return null;
    try {
        if (value instanceof Date) return value;
        if (typeof value === "string" || typeof value === "number") {
            const d = new Date(value);
            return Number.isNaN(d.getTime()) ? null : d;
        }
        if (typeof (value as any).toDate === "function") return (value as any).toDate();
        if (typeof (value as any)._seconds === "number") return new Date((value as any)._seconds * 1000);
        if (typeof (value as any).seconds === "number") return new Date((value as any).seconds * 1000);
        return null;
    } catch {
        return null;
    }
}

function formatDate(value: unknown): string {
    const d = toDate(value);
    if (!d) return typeof value === "string" && value ? value : "—";
    return d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatINR(amount: unknown): string {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    return `₹${n.toLocaleString("en-IN")}`;
}

const PROJECT_STATUS: Record<
    string,
    { label: string; chip: string }
> = {
    assigned: { label: "Assigned", chip: "border-sky-400/40 bg-sky-950/50 text-sky-200" },
    in_progress: { label: "In Progress", chip: "border-amber-400/40 bg-amber-950/50 text-amber-200" },
    submitted: { label: "Submitted", chip: "border-violet-400/40 bg-violet-950/50 text-violet-200" },
    revision: { label: "Revision Requested", chip: "border-orange-400/40 bg-orange-950/50 text-orange-200" },
    approved: { label: "Approved", chip: "border-emerald-400/40 bg-emerald-950/50 text-emerald-200" },
    paid: { label: "Paid", chip: "border-emerald-400/40 bg-emerald-950/50 text-emerald-200" },
};

/** Next student-driven transition for a project status, if any. */
const NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
    assigned: { status: "in_progress", label: "Start Work" },
    in_progress: { status: "submitted", label: "Submit Work" },
    revision: { status: "submitted", label: "Resubmit Work" },
};

const REVIEW_CHIP: Record<string, string> = {
    pending: "border-amber-400/40 bg-amber-950/50 text-amber-200",
    approved: "border-emerald-400/40 bg-emerald-950/50 text-emerald-200",
    rejected: "border-red-400/40 bg-red-950/50 text-red-200",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-rose-300/80">
            {children}
        </p>
    );
}

/* ------------------------------------------------------------------ */
/* Server actions — forward to the coordinator's API routes so the     */
/* API stays the single source of truth for writes.                    */
/* ------------------------------------------------------------------ */

async function apiPost(path: string, body: Record<string, unknown>) {
    const hdrs = await headers();
    const host = hdrs.get("host") || "learnpeak.in";
    const proto =
        hdrs.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const res = await fetch(`${proto}://${host}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            cookie: hdrs.get("cookie") || "",
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
    }
    return data;
}

async function submitPortfolio(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const showreelLink = String(formData.get("showreelLink") || "").trim();
    const edits = ["edit1", "edit2", "edit3"]
        .map((name) => String(formData.get(name) || "").trim())
        .filter(Boolean);

    try {
        await apiPost("/api/portfolio", { showreelLink, edits });
    } catch (err: any) {
        redirect(
            `/dashboard/paid-work?portfolio=error&msg=${encodeURIComponent(err?.message || "Submission failed")}`,
        );
    }
    revalidatePath("/dashboard/paid-work");
    redirect("/dashboard/paid-work?portfolio=ok");
}

async function advanceProject(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const projectId = String(formData.get("projectId") || "");
    const status = String(formData.get("status") || "");
    if (!projectId || !status) {
        redirect("/dashboard/paid-work?project=error&msg=Missing+project+or+status");
    }
    try {
        await apiPost(`/api/projects/${encodeURIComponent(projectId)}/status`, { status });
    } catch (err: any) {
        redirect(
            `/dashboard/paid-work?project=error&msg=${encodeURIComponent(err?.message || "Update failed")}`,
        );
    }
    revalidatePath("/dashboard/paid-work");
    redirect("/dashboard/paid-work?project=ok");
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function PaidWorkPage({
    searchParams,
}: {
    searchParams: Promise<{ portfolio?: string; project?: string; msg?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    const userId = session.user.id;
    const notice = await searchParams;

    const passedProTrailer = await hasPassedCourse(userId, COURSE_SLUGS.proTrailer);

    // Portfolio (latest doc for this user)
    let portfolio: Record<string, any> | null = null;
    try {
        const snap = await db
            .collection("portfolios")
            .where("userId", "==", userId)
            .get();
        if (!snap.empty) {
            const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Record<string, any>);
            docs.sort(
                (a, b) =>
                    (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0),
            );
            portfolio = docs[0];
        }
    } catch {
        portfolio = null;
    }

    // Assigned projects
    let projects: Record<string, any>[] = [];
    try {
        const snap = await db
            .collection("projects")
            .where("assigneeId", "==", userId)
            .get();
        projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Record<string, any>);
        projects.sort(
            (a, b) =>
                (toDate(a.deadline)?.getTime() || Number.MAX_SAFE_INTEGER) -
                (toDate(b.deadline)?.getTime() || Number.MAX_SAFE_INTEGER),
        );
    } catch {
        projects = [];
    }

    const portfolioEdits: string[] = Array.isArray(portfolio?.edits) ? portfolio.edits : [];

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#1A0B12] text-white">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[#732C3F]/30 blur-[120px]" />
            <DashboardNavbar user={session.user} />

            <div className="relative mx-auto max-w-md px-4 pb-24 pt-6 md:max-w-4xl">
                <div className="flex items-center gap-3">
                    <Briefcase className="h-7 w-7 text-rose-300" />
                    <h1 className="font-display text-3xl uppercase tracking-wide md:text-4xl">
                        Paid Work
                    </h1>
                </div>
                <p className="mt-1 text-sm text-rose-200/70">
                    Real client projects for students who have proven their editing
                    skills.
                </p>

                {/* Disclaimer — always visible */}
                <div className="mt-5 rounded-2xl border border-amber-400/40 bg-amber-950/40 px-4 py-3 text-sm leading-relaxed text-amber-100/90">
                    Paid work depends on the quality of your work and project
                    availability. It is not guaranteed.
                </div>

                {/* Action feedback */}
                {notice.portfolio === "ok" && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-100">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Portfolio submitted —
                        it is now awaiting review.
                    </div>
                )}
                {notice.portfolio === "error" && (
                    <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
                        Portfolio submission failed{notice.msg ? `: ${notice.msg}` : ""}.
                        Please try again.
                    </div>
                )}
                {notice.project === "ok" && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-100">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Project status updated.
                    </div>
                )}
                {notice.project === "error" && (
                    <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-sm text-red-100">
                        Project update failed{notice.msg ? `: ${notice.msg}` : ""}. Please
                        try again.
                    </div>
                )}

                {/* ============ (a) Portfolio ============ */}
                <section className="mt-8">
                    <SectionLabel>Your Portfolio</SectionLabel>

                    {!passedProTrailer ? (
                        <div className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 md:p-6">
                            <div className="flex items-start gap-4">
                                <Lock className="mt-1 h-8 w-8 shrink-0 text-rose-300" />
                                <div>
                                    <h2 className="text-lg font-bold">
                                        Pass Course 03 to unlock Paid Work
                                    </h2>
                                    <p className="mt-2 text-sm leading-relaxed text-rose-100/75">
                                        Paid client projects are offered to students who
                                        have passed{" "}
                                        <strong className="text-white">
                                            Course 03 · Pro Wedding Trailer
                                        </strong>{" "}
                                        — including its final test (MCQ + practical
                                        review). Once you pass, you can submit your
                                        portfolio here and start receiving projects.
                                    </p>
                                    <Link
                                        href="/dashboard/courses"
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                                    >
                                        <PlayCircle className="h-4 w-4" /> Go to My Courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5 md:p-6">
                            {portfolio && (
                                <div className="mb-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-white">
                                            Portfolio review:
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${REVIEW_CHIP[portfolio.reviewStatus] || REVIEW_CHIP.pending}`}
                                        >
                                            <Clock className="h-3.5 w-3.5" />
                                            {portfolio.reviewStatus || "pending"}
                                        </span>
                                    </div>
                                    {portfolio.feedback && (
                                        <p className="mt-2 text-sm leading-relaxed text-rose-100/75">
                                            <span className="font-semibold text-white">
                                                Feedback:
                                            </span>{" "}
                                            {portfolio.feedback}
                                        </p>
                                    )}
                                    {portfolio.reviewStatus === "rejected" && (
                                        <p className="mt-1 text-sm text-rose-100/60">
                                            Update your links below and resubmit.
                                        </p>
                                    )}
                                </div>
                            )}

                            <form action={submitPortfolio} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="showreelLink"
                                        className="flex items-center gap-2 text-sm font-semibold text-white"
                                    >
                                        <Video className="h-4 w-4 text-rose-300" /> Showreel
                                        link
                                    </label>
                                    <input
                                        id="showreelLink"
                                        name="showreelLink"
                                        type="url"
                                        required
                                        placeholder="https://… (your best showreel)"
                                        defaultValue={portfolio?.showreelLink || ""}
                                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-rose-100/30 focus:border-rose-400 focus:outline-none"
                                    />
                                </div>
                                {[0, 1, 2].map((i) => (
                                    <div key={i}>
                                        <label
                                            htmlFor={`edit${i + 1}`}
                                            className="text-sm font-semibold text-white"
                                        >
                                            Edit {i + 1} link{" "}
                                            <span className="font-normal text-rose-100/50">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            id={`edit${i + 1}`}
                                            name={`edit${i + 1}`}
                                            type="url"
                                            placeholder="https://…"
                                            defaultValue={portfolioEdits[i] || ""}
                                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-rose-100/30 focus:border-rose-400 focus:outline-none"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 py-3 font-bold text-white transition hover:brightness-110"
                                >
                                    <Send className="h-4 w-4" />
                                    {portfolio ? "Update & Resubmit Portfolio" : "Submit Portfolio"}
                                </button>
                            </form>
                        </div>
                    )}
                </section>

                {/* ============ (b) Assigned projects ============ */}
                <section className="mt-8">
                    <SectionLabel>Your Projects</SectionLabel>

                    {projects.length === 0 ? (
                        <div className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-6 text-center">
                            <FolderOpen className="mx-auto h-8 w-8 text-rose-300/70" />
                            <p className="mt-3 text-sm leading-relaxed text-rose-100/70">
                                No projects assigned yet. Projects appear here when
                                LearnPeak assigns client work to you.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {projects.map((project) => {
                                const meta =
                                    PROJECT_STATUS[project.status] || PROJECT_STATUS.assigned;
                                const next = NEXT_STEP[project.status];
                                return (
                                    <div
                                        key={project.id}
                                        className="rounded-3xl border border-rose-900/60 bg-[#241019]/90 p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white">
                                                    {project.title || "Untitled project"}
                                                </h3>
                                                {project.client && (
                                                    <p className="mt-0.5 text-xs text-rose-100/60">
                                                        Client: {project.client}
                                                    </p>
                                                )}
                                            </div>
                                            <span
                                                className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.chip}`}
                                            >
                                                {meta.label}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-rose-100/75">
                                            <span className="inline-flex items-center gap-1.5">
                                                <IndianRupee className="h-4 w-4 text-amber-300" />
                                                {formatINR(project.payAmount)}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarClock className="h-4 w-4 text-rose-300" />
                                                Deadline: {formatDate(project.deadline)}
                                            </span>
                                            {project.footageLink && (
                                                <a
                                                    href={project.footageLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 font-medium text-rose-200 underline decoration-rose-400/50 underline-offset-2 transition hover:text-white"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Footage
                                                </a>
                                            )}
                                        </div>

                                        {next ? (
                                            <form action={advanceProject} className="mt-4">
                                                <input
                                                    type="hidden"
                                                    name="projectId"
                                                    value={project.id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="status"
                                                    value={next.status}
                                                />
                                                <button
                                                    type="submit"
                                                    className="w-full rounded-xl bg-gradient-to-r from-[#732C3F] to-rose-500 py-2.5 text-sm font-bold text-white transition hover:brightness-110 md:w-auto md:px-6"
                                                >
                                                    {next.label}
                                                </button>
                                            </form>
                                        ) : (
                                            <p className="mt-4 text-xs text-rose-100/50">
                                                {project.status === "submitted" &&
                                                    "Submitted — waiting for review."}
                                                {project.status === "approved" &&
                                                    "Approved — payment is being processed."}
                                                {project.status === "paid" &&
                                                    "Payment completed for this project."}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
