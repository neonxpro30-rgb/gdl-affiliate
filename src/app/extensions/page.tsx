import type { Metadata } from "next";
import Link from "next/link";
import { Puzzle } from "lucide-react";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Premiere Pro Extensions | LearnPeak",
    description:
        "LearnPeak extensions for Adobe Premiere Pro — small tools that speed up real wedding-editing work.",
};

function formatINR(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

export default async function ExtensionsPage() {
    const products = await getProducts({ visibleOnly: true });
    const extensions = products.filter((p) => p.type === "extension");

    return (
        <main className="lpd-shell min-h-screen px-4 py-12">
            <div className="mx-auto w-full max-w-5xl">
                <div className="lpd-banner px-6 py-8 text-center">
                    <Puzzle className="mx-auto h-10 w-10 text-[#D93C78]" />
                    <h1 className="lpd-display mt-3 text-4xl uppercase tracking-wide text-[#1E1530] md:text-5xl">
                        Premiere Pro Extensions
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed font-semibold text-[#6B5F80]">
                        Small tools, built for real editing work. Buy once, activate
                        with your licence key inside Premiere Pro.
                    </p>
                </div>

                {extensions.length === 0 ? (
                    <div className="lpd-card mt-10 p-10 text-center">
                        <p className="font-semibold text-[#1E1530]">
                            No extensions available yet
                        </p>
                        <p className="mt-1 text-sm text-[#6B5F80]">
                            New tools are on the way — please check back soon.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {extensions.map((ext) => (
                            <div
                                key={ext.slug}
                                className="lpd-card lpd-card-hover flex flex-col overflow-hidden"
                            >
                                <div className="flex-1 p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-lg font-bold text-[#1E1530]">
                                            {ext.title}
                                        </h2>
                                        {ext.version && (
                                            <span className="lpd-badge lpd-badge-pink lpd-pixel shrink-0 normal-case tracking-normal text-[14px]">
                                                v{ext.version}
                                            </span>
                                        )}
                                    </div>
                                    {ext.tagline && (
                                        <p className="mt-1.5 text-sm leading-relaxed text-[#6B5F80]">
                                            {ext.tagline}
                                        </p>
                                    )}
                                    {ext.premiereVersions &&
                                        ext.premiereVersions.length > 0 && (
                                            <div className="mt-4">
                                                <p className="lpd-pixel text-[14px] uppercase tracking-[0.18em] text-[#6B5F80]">
                                                    Premiere Pro
                                                </p>
                                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                    {ext.premiereVersions.map((v) => (
                                                        <span
                                                            key={v}
                                                            className="lpd-chip text-xs"
                                                        >
                                                            {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    {!ext.active && (
                                        <span className="lpd-badge lpd-badge-butter mt-4">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t-2 border-[rgba(59,49,80,.14)] bg-[#FFF8FB] px-6 py-4">
                                    <p className="lpd-display font-extrabold text-[#1E1530]">
                                        {ext.price > 0 ? (
                                            formatINR(ext.price)
                                        ) : (
                                            <span className="text-sm font-semibold text-[#6B5F80]">
                                                Price coming soon
                                            </span>
                                        )}
                                    </p>
                                    <Link
                                        href={`/extensions/${ext.slug}`}
                                        className="lpd-btn lpd-btn-pink lpd-btn-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
