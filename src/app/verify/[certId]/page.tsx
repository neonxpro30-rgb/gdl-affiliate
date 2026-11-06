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
        <main className="min-h-screen bg-[#F7E8EC] font-sans px-4 py-12">
            <div className="mx-auto w-full max-w-xl">
                {/* Brand header */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Award className="h-8 w-8 text-[#732C3F]" />
                        <span className="font-display text-3xl uppercase tracking-wide text-[#1A0B12]">
                            LearnPeak
                        </span>
                    </Link>
                    <p className="mt-2 text-sm text-[#732C3F]/80">
                        Certificate Verification
                    </p>
                </div>

                {!cert ? (
                    <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
                        <SearchX className="mx-auto h-12 w-12 text-rose-300" />
                        <h1 className="mt-4 text-2xl font-bold text-gray-900">
                            Certificate not found
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            We could not find any certificate with the ID{" "}
                            <span className="font-mono font-semibold text-gray-800">
                                {certId}
                            </span>
                            . Please check the ID and try again, or contact
                            LearnPeak support if you believe this is an error.
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-block rounded-xl bg-[#732C3F] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                        >
                            Back to LearnPeak
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm">
                        {/* Status banner */}
                        {cert.status === "revoked" ? (
                            <div className="flex items-center gap-3 bg-red-50 px-6 py-5">
                                <XCircle className="h-8 w-8 shrink-0 text-red-500" />
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-red-400">
                                        Certificate Status
                                    </p>
                                    <p className="text-xl font-extrabold uppercase tracking-wide text-red-600">
                                        Revoked
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-emerald-50 px-6 py-5">
                                <BadgeCheck className="h-8 w-8 shrink-0 text-emerald-500" />
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-500">
                                        Certificate Status
                                    </p>
                                    <p className="text-xl font-extrabold uppercase tracking-wide text-emerald-600">
                                        Valid
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="px-6 py-6">
                            {cert.status === "revoked" && (
                                <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    This certificate has been revoked by
                                    LearnPeak and is no longer valid.
                                </p>
                            )}

                            <dl className="space-y-4">
                                <div>
                                    <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                        Student Name
                                    </dt>
                                    <dd className="mt-1 text-lg font-bold text-gray-900">
                                        {cert.userName || "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                        Course Completed
                                    </dt>
                                    <dd className="mt-1 text-base font-semibold text-gray-800">
                                        {courseTitle || "—"}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                            Certificate ID
                                        </dt>
                                        <dd className="mt-1 font-mono text-sm font-semibold text-gray-800">
                                            {cert.certId || certId}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                            Completion / Issue Date
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-gray-800">
                                            {formatDate(cert.issuedAt)}
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
                    This is a LearnPeak certificate of completion. It is not a
                    government or university qualification.
                </p>
            </div>
        </main>
    );
}
