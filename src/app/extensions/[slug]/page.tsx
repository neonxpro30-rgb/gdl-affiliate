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
        <main className="lpd-shell min-h-screen px-4 py-10">
            <div className="mx-auto w-full max-w-3xl">
                <Link
                    href="/extensions"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B5F80] transition hover:text-[#1E1530]"
                >
                    <ArrowLeft className="h-4 w-4" /> All Extensions
                </Link>

                <div className="lpd-card mt-5 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#FFE9F3] border-2 border-[rgba(59,49,80,.14)]">
                                    <Puzzle className="h-7 w-7 text-[#D93C78]" />
                                </div>
                                <div>
                                    <h1 className="lpd-display text-2xl font-extrabold text-[#1E1530] md:text-3xl">
                                        {product.title}
                                    </h1>
                                    {product.tagline && (
                                        <p className="mt-1 text-sm leading-relaxed text-[#6B5F80]">
                                            {product.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {product.version && (
                                <span className="lpd-badge lpd-badge-pink lpd-pixel shrink-0 normal-case tracking-normal text-[15px]">
                                    Version {product.version}
                                </span>
                            )}
                        </div>

                        {product.premiereVersions &&
                            product.premiereVersions.length > 0 && (
                                <div className="mt-6">
                                    <p className="lpd-pixel text-[15px] uppercase tracking-[0.18em] text-[#6B5F80]">
                                        Supported Premiere Pro Versions
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {product.premiereVersions.map((v) => (
                                            <span
                                                key={v}
                                                className="lpd-chip"
                                            >
                                                Premiere Pro {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Price / Buy / Owned */}
                        <div className="mt-8 rounded-[18px] border-2 border-[rgba(59,49,80,.14)] bg-[#FFF8FB] p-5">
                            {owns ? (
                                <div>
                                    <p className="flex items-center gap-2 font-bold text-[#0F8E69]">
                                        <CheckCircle2 className="h-5 w-5" /> You own
                                        this extension
                                    </p>
                                    <span className="lpd-badge lpd-badge-mint mt-2">Active licence</span>

                                    {licences.length > 0 ? (
                                        <div className="mt-4 space-y-3">
                                            {licences.map((lic) => (
                                                <div
                                                    key={lic.id || lic.key}
                                                    className="rounded-[14px] border-2 border-[#0F8E69]/30 bg-white px-4 py-3"
                                                >
                                                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#6B5F80]">
                                                        <KeyRound className="h-3.5 w-3.5" />
                                                        Licence Key
                                                    </p>
                                                    <p className="lpd-pixel mt-1 break-all text-[20px] leading-tight font-bold text-[#1E1530]">
                                                        {lic.key}
                                                    </p>
                                                    <p className="mt-1 text-sm text-[#6B5F80]">
                                                        Activations:{" "}
                                                        <strong className="text-[#1E1530]">
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
                                                    {lic.status && (
                                                        <span className={`mt-2 ${lic.status === "active" ? "lpd-badge lpd-badge-mint" : lic.status === "revoked" || lic.status === "suspended" ? "lpd-badge lpd-badge-coral" : "lpd-badge lpd-badge-butter"}`}>
                                                            {lic.status}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-[#3B3150]">
                                            Your licence key will appear here as soon
                                            as it is issued for your purchase.
                                        </p>
                                    )}

                                    <p className="mt-4 text-sm leading-relaxed text-[#3B3150]">
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
                                        <p className="lpd-pixel text-[15px] uppercase tracking-[0.18em] text-[#6B5F80]">
                                            Price
                                        </p>
                                        <p className="lpd-display mt-1 text-3xl font-extrabold text-[#1E1530]">
                                            {product.price > 0 ? (
                                                formatINR(product.price)
                                            ) : (
                                                <span className="text-lg font-semibold text-[#6B5F80]">
                                                    Price coming soon
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    {purchasable ? (
                                        <Link
                                            href={`/signup?product=${encodeURIComponent(product.slug)}`}
                                            className="lpd-btn lpd-btn-pink"
                                        >
                                            <ShoppingCart className="h-4 w-4" /> Buy
                                            Now
                                        </Link>
                                    ) : (
                                        <span className="lpd-badge lpd-badge-butter px-4 py-2 text-sm">
                                            {product.price > 0
                                                ? "Coming Soon"
                                                : "Price coming soon"}
                                        </span>
                                    )}
                                </div>
                            )}
                            {!owns && (
                                <p className="mt-3 text-xs leading-relaxed text-[#6B5F80]">
                                    After purchase, your licence key appears here and
                                    the extension is delivered through the
                                    licence/activation flow inside Premiere Pro — the
                                    file itself stays private.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Changelog */}
                    <div className="border-t-2 border-[rgba(59,49,80,.14)] px-6 py-6 md:px-8">
                        <h2 className="flex items-center gap-2 text-base font-bold text-[#1E1530]">
                            <History className="h-4 w-4 text-[#D93C78]" /> Changelog
                        </h2>
                        {changelog.length > 0 ? (
                            <ul className="mt-4 space-y-4">
                                {[...changelog].reverse().map((entry, i) => (
                                    <li key={`${entry.version}-${i}`} className="flex gap-4">
                                        <span className="lpd-badge lpd-badge-pink lpd-pixel shrink-0 normal-case tracking-normal text-[14px] h-fit">
                                            v{entry.version}
                                        </span>
                                        <div>
                                            <p className="text-sm leading-relaxed text-[#3B3150]">
                                                {entry.notes}
                                            </p>
                                            {entry.at && (
                                                <p className="mt-0.5 text-xs text-[#6B5F80]">
                                                    {formatDate(entry.at)}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-[#6B5F80]">
                                No changelog entries yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
