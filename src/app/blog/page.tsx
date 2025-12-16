import Link from "next/link";

import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Blog | LearnPeak",
    description: "Read the latest stories, tips, and insights on digital skills and affiliate marketing from LearnPeak.",
};

export default async function BlogPage() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-[#F7E8EC] font-sans">


            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1A0B12] mb-4">Latest Stories</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Insights, tutorials, and success stories to fuel your digital journey.
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No stories published yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="group">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
                                    <div className="relative h-56 w-full bg-gray-200">
                                        {post.image?.startsWith('http') || post.image?.startsWith('/') ? (
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="text-4xl">📝</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#732C3F] transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-600 line-clamp-3 text-sm mb-4 flex-1">
                                            {post.excerpt || (post.content || '').replace(/<[^>]+>/g, '').slice(0, 100) + '...'}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                            <span className="text-xs text-gray-500">
                                                {new Date(post.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="text-[#732C3F] font-bold text-sm group-hover:underline">Read Story &rarr;</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
