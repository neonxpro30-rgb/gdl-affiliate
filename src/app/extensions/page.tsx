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
        <main className="min-h-screen bg-[#F7E8EC] font-sans px-4 py-12">
            <div className="mx-auto w-full max-w-5xl">
                <div className="text-center">
                    <Puzzle className="mx-auto h-10 w-10 text-[#732C3F]" />
                    <h1 className="font-display mt-3 text-4xl uppercase tracking-wide text-[#1A0B12] md:text-5xl">
                        Premiere Pro Extensions
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
                        Small tools, built for real editing work. Buy once, activate
                        with your licence key inside Premiere Pro.
                    </p>
                </div>

                {extensions.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-sm">
                        <p className="font-semibold text-gray-800">
                            No extensions available yet
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            New tools are on the way — please check back soon.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {extensions.map((ext) => (
                            <div
                                key={ext.slug}
                                className="flex flex-col overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm"
                            >
                                <div className="flex-1 p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {ext.title}
                                        </h2>
                                        {ext.version && (
                                            <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#732C3F]">
                                                v{ext.version}
                                            </span>
                                        )}
                                    </div>
                                    {ext.tagline && (
                                        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                                            {ext.tagline}
                                        </p>
                                    )}
                                    {ext.premiereVersions &&
                                        ext.premiereVersions.length > 0 && (
                                            <div className="mt-4">
                                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                                                    Premiere Pro
                                                </p>
                                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                    {ext.premiereVersions.map((v) => (
                                                        <span
                                                            key={v}
                                                            className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                                                        >
                                                            {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    {!ext.active && (
                                        <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                                    <p className="font-extrabold text-gray-900">
                                        {ext.price > 0 ? (
                                            formatINR(ext.price)
                                        ) : (
                                            <span className="text-sm font-semibold text-gray-500">
                                                Price coming soon
                                            </span>
                                        )}
                                    </p>
                                    <Link
                                        href={`/extensions/${ext.slug}`}
                                        className="rounded-lg bg-[#732C3F] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
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
