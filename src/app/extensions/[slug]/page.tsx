import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
    ArrowLeft,
    CheckCircle2,
    History,
    KeyRound,
    Puzzle,
    ShoppingCart,
} from "lucide-react";
import { getProduct } from "@/lib/products";
import { userOwnsProduct } from "@/lib/access";
import { getUserLicences } from "@/lib/licenses";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product || product.type !== "extension") {
        return { title: "Extension Not Found | LearnPeak" };
    }
    return {
        title: `${product.title} — Premiere Pro Extension | LearnPeak`,
        description:
            product.tagline ||
            `${product.title} is a LearnPeak extension for Adobe Premiere Pro.`,
    };
}

function formatINR(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

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

export default async function ExtensionDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product || product.type !== "extension") notFound();

    // Optional session — this page is public, but owners see their licence.
    const session = await getServerSession(authOptions).catch(() => null);
    let owns = false;
    let licences: Record<string, any>[] = [];
    if (session?.user?.id) {
        owns = await userOwnsProduct(session.user.id, slug);
        if (owns) {
            const all = await getUserLicences(session.user.id);
            licences = all.filter((l: any) => l.productSlug === slug);
        }
    }

    const purchasable = product.active && product.price > 0;
    const changelog = product.changelog || [];

    return (
        <main className="min-h-screen bg-[#F7E8EC] font-sans px-4 py-10">
            <div className="mx-auto w-full max-w-3xl">
                <Link
                    href="/extensions"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#732C3F] transition hover:text-[#1A0B12]"
                >
                    <ArrowLeft className="h-4 w-4" /> All Extensions
                </Link>

                <div className="mt-5 overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50">
                                    <Puzzle className="h-7 w-7 text-[#732C3F]" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                                        {product.title}
                                    </h1>
                                    {product.tagline && (
                                        <p className="mt-1 text-sm leading-relaxed text-gray-500">
                                            {product.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {product.version && (
                                <span className="shrink-0 rounded-full bg-rose-50 px-3 py-1 font-mono text-xs font-semibold text-[#732C3F]">
                                    Version {product.version}
                                </span>
                            )}
                        </div>

                        {product.premiereVersions &&
                            product.premiereVersions.length > 0 && (
                                <div className="mt-6">
                                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                        Supported Premiere Pro Versions
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {product.premiereVersions.map((v) => (
                                            <span
                                                key={v}
                                                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700"
                                            >
                                                Premiere Pro {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Price / Buy / Owned */}
                        <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                            {owns ? (
                                <div>
                                    <p className="flex items-center gap-2 font-bold text-emerald-700">
                                        <CheckCircle2 className="h-5 w-5" /> You own
                                        this extension
                                    </p>

                                    {licences.length > 0 ? (
                                        <div className="mt-4 space-y-3">
                                            {licences.map((lic) => (
                                                <div
                                                    key={lic.id || lic.key}
                                                    className="rounded-xl border border-emerald-200 bg-white px-4 py-3"
                                                >
                                                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                        <KeyRound className="h-3.5 w-3.5" />
                                                        Licence Key
                                                    </p>
                                                    <p className="mt-1 break-all font-mono text-base font-bold text-gray-900">
                                                        {lic.key}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Activations:{" "}
                                                        <strong className="text-gray-800">
                                                            {(lic.activations || []).length}
                                                        </strong>{" "}
                                                        / {lic.limit ?? 2} machines
                                                        {lic.status &&
                                                            lic.status !== "active" && (
                                                                <>
                                                                    {" "}
                                                                    · Status: {lic.status}
                                                                </>
                                                            )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Your licence key will appear here as soon
                                            as it is issued for your purchase.
                                        </p>
                                    )}

                                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                                        The extension file itself is private and is
                                        delivered through the licence/activation
                                        flow: install the extension in Premiere Pro
                                        and activate it with the licence key above —
                                        there is no public download link.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                            Price
                                        </p>
                                        <p className="mt-1 text-3xl font-extrabold text-gray-900">
                                            {product.price > 0 ? (
                                                formatINR(product.price)
                                            ) : (
                                                <span className="text-lg font-semibold text-gray-500">
                                                    Price coming soon
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    {purchasable ? (
                                        <Link
                                            href={`/signup?product=${encodeURIComponent(product.slug)}`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#732C3F] px-6 py-3 font-bold text-white transition hover:brightness-110"
                                        >
                                            <ShoppingCart className="h-4 w-4" /> Buy
                                            Now
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center rounded-xl bg-amber-100 px-5 py-3 text-sm font-bold text-amber-700">
                                            {product.price > 0
                                                ? "Coming Soon"
                                                : "Price coming soon"}
                                        </span>
                                    )}
                                </div>
                            )}
                            {!owns && (
                                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                                    After purchase, your licence key appears here and
                                    the extension is delivered through the
                                    licence/activation flow inside Premiere Pro — the
                                    file itself stays private.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Changelog */}
                    <div className="border-t border-gray-100 px-6 py-6 md:px-8">
                        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                            <History className="h-4 w-4 text-[#732C3F]" /> Changelog
                        </h2>
                        {changelog.length > 0 ? (
                            <ul className="mt-4 space-y-4">
                                {[...changelog].reverse().map((entry, i) => (
                                    <li key={`${entry.version}-${i}`} className="flex gap-4">
                                        <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#732C3F] h-fit">
                                            v{entry.version}
                                        </span>
                                        <div>
                                            <p className="text-sm leading-relaxed text-gray-700">
                                                {entry.notes}
                                            </p>
                                            {entry.at && (
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {formatDate(entry.at)}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">
                                No changelog entries yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
