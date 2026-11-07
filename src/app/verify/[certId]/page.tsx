import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, XCircle, SearchX, Award } from "lucide-react";
import { db } from "@/lib/firebaseAdmin";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Verify Certificate | LearnPeak",
    description: "Verify the authenticity of a LearnPeak certificate of completion.",
};

/** Firestore timestamps arrive as strings, Dates, or Timestamp objects — normalise all of them. */
function formatDate(value: unknown): string {
    if (!value) return "—";
    try {
        let d: Date;
        if (typeof value === "string" || typeof value === "number") {
            d = new Date(value);
        } else if (value instanceof Date) {
            d = value;
        } else if (typeof (value as any).toDate === "function") {
            d = (value as any).toDate();
        } else if (typeof (value as any)._seconds === "number") {
            d = new Date((value as any)._seconds * 1000);
        } else if (typeof (value as any).seconds === "number") {
            d = new Date((value as any).seconds * 1000);
        } else {
            return "—";
        }
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

async function findCertificate(certId: string) {
    try {
        const snap = await db
            .collection("certificates")
            .where("certId", "==", certId)
            .limit(1)
            .get();
        if (!snap.empty) return snap.docs[0].data() as Record<string, any>;
    } catch {
        /* fall through to doc-id lookup */
    }
    try {
        const doc = await db.collection("certificates").doc(certId).get();
        if (doc.exists) return doc.data() as Record<string, any>;
    } catch {
        /* not found */
    }
    return null;
}

export default async function VerifyCertificatePage({
    params,
}: {
    params: Promise<{ certId: string }>;
}) {
    const { certId } = await params;
    const cert = await findCertificate(certId);

    let courseTitle: string | null = cert?.courseTitle || null;
    if (!courseTitle && cert?.courseSlug) {
        const product = await getProduct(cert.courseSlug);
        courseTitle = product?.title || cert.courseSlug;
    }

    return (
        <main className="lpd-shell min-h-screen px-4 py-12">
            <div className="mx-auto w-full max-w-xl">
                {/* Brand header */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Award className="h-8 w-8 text-[#D93C78]" />
                        <span className="lpd-display text-3xl uppercase tracking-wide text-[#1E1530]">
                            LearnPeak
                        </span>
                    </Link>
                    <p className="lpd-pixel mt-2 text-[16px] uppercase tracking-[0.18em] text-[#6B5F80]">
                        Certificate Verification
                    </p>
                </div>

                {!cert ? (
                    <div className="lpd-card p-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8E2F0]">
                            <SearchX className="h-7 w-7 text-[#3B3150]" />
                        </div>
                        <h1 className="lpd-display mt-4 text-2xl font-bold text-[#1E1530]">
                            Certificate not found
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-[#3B3150]">
                            We could not find any certificate with the ID{" "}
                            <span className="lpd-pixel text-[18px] font-semibold text-[#1E1530]">
                                {certId}
                            </span>
                            . Please check the ID and try again, or contact
                            LearnPeak support if you believe this is an error.
                        </p>
                        <Link
                            href="/"
                            className="lpd-btn lpd-btn-pink mt-6"
                        >
                            Back to LearnPeak
                        </Link>
                    </div>
                ) : (
                    <div className="lpd-card overflow-hidden">
                        {/* Status banner */}
                        {cert.status === "revoked" ? (
                            <div className="flex items-center gap-3 bg-[#FF4F5E]/10 border-b-2 border-[#FF4F5E]/25 px-6 py-5">
                                <XCircle className="h-8 w-8 shrink-0 text-[#FF4F5E]" />
                                <div>
                                    <p className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#FF4F5E]">
                                        Certificate Status
                                    </p>
                                    <p className="lpd-display text-xl font-extrabold uppercase tracking-wide text-[#1E1530]">
                                        Revoked
                                    </p>
                                    <span className="lpd-badge lpd-badge-coral mt-1">Revoked</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-[#E9FBF4] border-b-2 border-[#0F8E69]/25 px-6 py-5">
                                <BadgeCheck className="h-8 w-8 shrink-0 text-[#0F8E69]" />
                                <div>
                                    <p className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#0F8E69]">
                                        Certificate Status
                                    </p>
                                    <p className="lpd-display text-xl font-extrabold uppercase tracking-wide text-[#1E1530]">
                                        Valid
                                    </p>
                                    <span className="lpd-badge lpd-badge-mint mt-1">Verified</span>
                                </div>
                            </div>
                        )}

                        <div className="px-6 py-6 bg-white">
                            {cert.status === "revoked" && (
                                <p className="mb-5 rounded-[14px] border-2 border-[#FF4F5E]/30 bg-[#FF4F5E]/10 px-4 py-3 text-sm text-[#1E1530]">
                                    This certificate has been revoked by
                                    LearnPeak and is no longer valid.
                                </p>
                            )}

                            <dl className="space-y-4">
                                <div>
                                    <dt className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#6B5F80]">
                                        Student Name
                                    </dt>
                                    <dd className="lpd-display mt-1 text-lg font-bold text-[#1E1530]">
                                        {cert.userName || "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#6B5F80]">
                                        Course Completed
                                    </dt>
                                    <dd className="mt-1 text-base font-semibold text-[#1E1530]">
                                        {courseTitle || "—"}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-[14px] bg-[#FFF8FB] border-2 border-[rgba(59,49,80,.14)] px-3 py-2.5">
                                        <dt className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#6B5F80]">
                                            Certificate ID
                                        </dt>
                                        <dd className="lpd-pixel mt-1 text-[18px] leading-tight font-semibold text-[#1E1530] break-all">
                                            {cert.certId || certId}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#6B5F80]">
                                            Completion / Issue Date
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-[#1E1530]">
                                            {formatDate(cert.issuedAt)}
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                <p className="mt-6 text-center text-xs leading-relaxed text-[#6B5F80]">
                    This is a LearnPeak certificate of completion. It is not a
                    government or university qualification.
                </p>
            </div>
        </main>
    );
}
