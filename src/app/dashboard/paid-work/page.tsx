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
    assigned: { label: "Assigned", chip: "lpd-badge lpd-badge-lav" },
    in_progress: { label: "In Progress", chip: "lpd-badge lpd-badge-butter" },
    submitted: { label: "Submitted", chip: "lpd-badge lpd-badge-butter" },
    revision: { label: "Revision Requested", chip: "lpd-badge lpd-badge-coral" },
    approved: { label: "Approved", chip: "lpd-badge lpd-badge-mint" },
    paid: { label: "Paid", chip: "lpd-badge lpd-badge-mint" },
};

/** Next student-driven transition for a project status, if any. */
const NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
    assigned: { status: "in_progress", label: "Start Work" },
    in_progress: { status: "submitted", label: "Submit Work" },
    revision: { status: "submitted", label: "Resubmit Work" },
};

const REVIEW_CHIP: Record<string, string> = {
    pending: "lpd-badge lpd-badge-butter",
    approved: "lpd-badge lpd-badge-mint",
    rejected: "lpd-badge lpd-badge-coral",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="lpd-pixel mb-3 text-[15px] uppercase tracking-[0.18em] text-[#D93C78]">
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
    const submissionLink = String(formData.get("submissionLink") || "").trim();
    if (!projectId || !status) {
        redirect("/dashboard/paid-work?project=error&msg=Missing+project+or+status");
    }
    try {
        await apiPost(`/api/projects/${encodeURIComponent(projectId)}/status`, {
            status,
            ...(submissionLink ? { submissionLink } : {}),
        });
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
        <div className="lpd-shell relative min-h-screen overflow-hidden">
            <DashboardNavbar user={session.user} />

            <div className="relative mx-auto max-w-md px-4 pb-24 pt-6 md:max-w-4xl">
                <div className="lpd-banner px-5 py-5">
                    <div className="flex items-center gap-3">
                        <Briefcase className="h-7 w-7 text-[#D93C78]" />
                        <h1 className="lpd-display text-3xl uppercase tracking-wide text-[#1E1530] md:text-4xl">
                            Paid Work
                        </h1>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#6B5F80]">
                        Real client projects for students who have proven their editing
                        skills.
                    </p>
                </div>

                {/* Disclaimer — always visible */}
                <div className="mt-5 rounded-[16px] border-2 border-[rgba(59,49,80,.2)] bg-[#FFE9AE]/50 px-4 py-3 text-sm leading-relaxed text-[#3B3150]">
                    Paid work depends on the quality of your work and project
                    availability. It is not guaranteed.
                </div>

                {/* Action feedback */}
                {notice.portfolio === "ok" && (
                    <div className="mt-4 flex items-center gap-2 rounded-[16px] border-2 border-[#0F8E69]/35 bg-[#E9FBF4] px-4 py-3 text-sm text-[#1E1530]">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F8E69]" /> Portfolio submitted —
                        it is now awaiting review.
                    </div>
                )}
                {notice.portfolio === "error" && (
                    <div className="mt-4 rounded-[16px] border-2 border-[#FF4F5E]/35 bg-[#FF4F5E]/10 px-4 py-3 text-sm text-[#1E1530]">
                        Portfolio submission failed{notice.msg ? `: ${notice.msg}` : ""}.
                        Please try again.
                    </div>
                )}
                {notice.project === "ok" && (
                    <div className="mt-4 flex items-center gap-2 rounded-[16px] border-2 border-[#0F8E69]/35 bg-[#E9FBF4] px-4 py-3 text-sm text-[#1E1530]">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F8E69]" /> Project status updated.
                    </div>
                )}
                {notice.project === "error" && (
                    <div className="mt-4 rounded-[16px] border-2 border-[#FF4F5E]/35 bg-[#FF4F5E]/10 px-4 py-3 text-sm text-[#1E1530]">
                        Project update failed{notice.msg ? `: ${notice.msg}` : ""}. Please
                        try again.
                    </div>
                )}

                {/* ============ (a) Portfolio ============ */}
                <section className="mt-8">
                    <SectionLabel>Your Portfolio</SectionLabel>

                    {!passedProTrailer ? (
                        <div className="lpd-card p-5 md:p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8E2F0]">
                                    <Lock className="h-5 w-5 text-[#3B3150]" />
                                </div>
                                <div>
                                    <h2 className="lpd-display text-lg font-bold text-[#1E1530]">
                                        Pass Course 03 to unlock Paid Work
                                    </h2>
                                    <p className="mt-2 text-sm leading-relaxed text-[#3B3150]">
                                        Paid client projects are offered to students who
                                        have passed{" "}
                                        <strong className="text-[#1E1530]">
                                            Course 03 · Pro Wedding Trailer
                                        </strong>{" "}
                                        — including its final test (MCQ + practical
                                        review). Once you pass, you can submit your
                                        portfolio here and start receiving projects.
                                    </p>
                                    <Link
                                        href="/dashboard/courses"
                                        className="lpd-btn lpd-btn-pink lpd-btn-sm mt-4"
                                    >
                                        <PlayCircle className="h-4 w-4" /> Go to My Courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="lpd-card p-5 md:p-6">
                            {portfolio && (
                                <div className="mb-5 rounded-[16px] border-2 border-[rgba(59,49,80,.14)] bg-[#FFF8FB] px-4 py-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-[#1E1530]">
                                            Portfolio review:
                                        </span>
                                        <span
                                            className={`capitalize ${REVIEW_CHIP[portfolio.reviewStatus] || REVIEW_CHIP.pending}`}
                                        >
                                            <Clock className="h-3.5 w-3.5" />
                                            {portfolio.reviewStatus || "pending"}
                                        </span>
                                    </div>
                                    {portfolio.feedback && (
                                        <p className="mt-2 text-sm leading-relaxed text-[#3B3150]">
                                            <span className="font-semibold text-[#1E1530]">
                                                Feedback:
                                            </span>{" "}
                                            {portfolio.feedback}
                                        </p>
                                    )}
                                    {portfolio.reviewStatus === "rejected" && (
                                        <p className="mt-1 text-sm text-[#6B5F80]">
                                            Update your links below and resubmit.
                                        </p>
                                    )}
                                </div>
                            )}

                            <form action={submitPortfolio} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="showreelLink"
                                        className="lpd-label flex items-center gap-2"
                                    >
                                        <Video className="h-4 w-4 text-[#D93C78]" /> Showreel
                                        link
                                    </label>
                                    <input
                                        id="showreelLink"
                                        name="showreelLink"
                                        type="url"
                                        required
                                        placeholder="https://… (your best showreel)"
                                        defaultValue={portfolio?.showreelLink || ""}
                                        className="lpd-input"
                                    />
                                </div>
                                {[0, 1, 2].map((i) => (
                                    <div key={i}>
                                        <label
                                            htmlFor={`edit${i + 1}`}
                                            className="lpd-label"
                                        >
                                            Edit {i + 1} link{" "}
                                            <span className="font-normal text-[#6B5F80]">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            id={`edit${i + 1}`}
                                            name={`edit${i + 1}`}
                                            type="url"
                                            placeholder="https://…"
                                            defaultValue={portfolioEdits[i] || ""}
                                            className="lpd-input"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="submit"
                                    className="lpd-btn lpd-btn-pink lpd-btn-block"
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
                        <div className="lpd-card p-6 text-center">
                            <FolderOpen className="mx-auto h-8 w-8 text-[#6B5F80]" />
                            <p className="mt-3 text-sm leading-relaxed text-[#6B5F80]">
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
                                        className="lpd-card lpd-card-hover p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-[#1E1530]">
                                                    {project.title || "Untitled project"}
                                                </h3>
                                                {project.client && (
                                                    <p className="mt-0.5 text-xs text-[#6B5F80]">
                                                        Client: {project.client}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`shrink-0 ${meta.chip}`}>
                                                {meta.label}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="lpd-chip">
                                                <IndianRupee className="h-4 w-4 text-[#0F8E69]" />
                                                {formatINR(project.payAmount)}
                                            </span>
                                            <span className="lpd-chip">
                                                <CalendarClock className="h-4 w-4 text-[#D93C78]" />
                                                Deadline: {formatDate(project.deadline)}
                                            </span>
                                            {project.footageLink && (
                                                <a
                                                    href={project.footageLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="lpd-chip font-semibold text-[#D93C78] underline decoration-[#FF8AC4] underline-offset-2 transition hover:text-[#1E1530]"
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
                                                {next.status === "submitted" && (
                                                    <>
                                                        <label
                                                            className="lpd-label"
                                                            htmlFor={`submission-${project.id}`}
                                                        >
                                                            Link to your finished edit
                                                        </label>
                                                        <input
                                                            id={`submission-${project.id}`}
                                                            name="submissionLink"
                                                            type="url"
                                                            required
                                                            placeholder="https://drive.google.com/…"
                                                            defaultValue={project.submissionLink || ""}
                                                            className="lpd-input mb-3"
                                                        />
                                                    </>
                                                )}
                                                <button
                                                    type="submit"
                                                    className="lpd-btn lpd-btn-pink lpd-btn-sm w-full md:w-auto"
                                                >
                                                    {next.label}
                                                </button>
                                            </form>
                                        ) : (
                                            <p className="mt-4 text-xs text-[#6B5F80]">
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
