import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { userOwnsProduct } from "@/lib/access";
import { META_ADS_ENTRY } from "@/lib/catalog-display";
import { PlayCircle, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Meta Ads for Photographers has no DB category — this synthetic route
// renders its category view from the catalog-display mapping. There are no
// course docs (and no videos) for it yet, so owned students see the full
// lesson list with an honest "being added" state — no fake player links.
export const dynamic = 'force-dynamic';

export default async function MetaAdsCategoryPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const owned = await userOwnsProduct((session.user as any).id, META_ADS_ENTRY.productSlug);

    if (!owned) {
        return (
            <div className="min-h-screen lpd-shell">
                <DashboardNavbar user={session.user} />
                <div className="max-w-7xl mx-auto p-4 md:p-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8E2F0] border-2 border-[#CFC6E2]">
                        <Lock className="w-10 h-10 text-[#3B3150]" />
                    </div>
                    <h1 className="text-2xl lpd-display text-[#1E1530]">Access Locked</h1>
                    <p className="text-[#6B5F80] mt-2">You do not have access to {META_ADS_ENTRY.displayName}.</p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link href={`/signup?product=${META_ADS_ENTRY.productSlug}`} className="lpd-btn lpd-btn-pink">Buy Course</Link>
                        <Link href="/dashboard/courses" className="lpd-btn lpd-btn-ghost">Back to Courses</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen lpd-shell">
            <DashboardNavbar user={session.user} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <Link href="/dashboard/courses" className="flex items-center text-[#6B5F80] hover:text-[#1E1530] mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl lpd-display text-[#1E1530]">{META_ADS_ENTRY.displayName}</h1>
                    <p className="text-[#6B5F80] mt-2">{META_ADS_ENTRY.lessons.length} Lessons</p>
                </div>

                <div className="lpd-card p-6">
                    <h2 className="text-lg font-bold text-[#1E1530] mb-1">Lessons being added</h2>
                    <p className="text-sm text-[#6B5F80] mb-4">
                        This course is being prepared — lesson videos are being added and will appear here as soon as they are ready.
                    </p>
                    <div className="space-y-1.5">
                        {META_ADS_ENTRY.lessons.map((lesson, i) => (
                            <div key={lesson} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold text-[#3B3150] bg-[#E8E2F0]/60">
                                <PlayCircle className="w-4 h-4 shrink-0 text-[#6B5F80]" />
                                <span className="flex-grow">{i + 1}. {lesson}</span>
                                <span className="lpd-badge lpd-badge-lav">Being added</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
