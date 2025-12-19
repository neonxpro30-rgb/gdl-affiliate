import Link from "next/link";

import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.post.findUnique({ where: { slug } });

    if (!post) return { title: 'Post Not Found' };

    const description = post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 150);

    return {
        title: `${post.title} | LearnPeak Blog`,
        description: description,
        keywords: ["LearnPeak", "affiliate marketing", "digital skills", "success story", post.title],
        authors: [{ name: "Naksh Gupta", url: "https://learnpeak.in/company/about" }],
        openGraph: {
            title: post.title,
            description: description,
            url: `https://learnpeak.in/blog/${slug}`,
            siteName: "LearnPeak",
            images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : [],
            type: 'article',
            publishedTime: post.createdAt.toISOString(),
            modifiedTime: post.updatedAt.toISOString(),
            authors: ["Naksh Gupta"]
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: description,
            images: post.image ? [post.image] : []
        },
        alternates: {
            canonical: `https://learnpeak.in/blog/${slug}`
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
        where: { slug },
    });

    if (!post || !post.published) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans">


            <main className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-12 text-center">
                    {(post.image?.startsWith('http') || post.image?.startsWith('/')) && (
                        <div className="relative w-full mb-8 shadow-lg rounded-2xl overflow-hidden">
                            <Image
                                src={post.image}
                                alt={post.title}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    )}

                    {/* JSON-LD for Google Knowledge Graph */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "BlogPosting",
                                "headline": post.title,
                                "image": post.image,
                                "datePublished": post.createdAt,
                                "dateModified": post.updatedAt,
                                "author": {
                                    "@type": "Person",
                                    "name": "Naksh Gupta",
                                    "alternateName": "Priyanshu",
                                    "jobTitle": "Founder",
                                    "worksFor": {
                                        "@type": "Organization",
                                        "name": "LearnPeak",
                                        "url": "https://learnpeak.in"
                                    },
                                    "url": "https://learnpeak.in/about", // Suggesting linking to About page
                                },
                                "publisher": {
                                    "@type": "Organization",
                                    "name": "LearnPeak",
                                    "logo": {
                                        "@type": "ImageObject",
                                        "url": "https://learnpeak.in/logo.png" // Using domain for logo if available, or fallback
                                    }
                                },
                                "description": post.excerpt || "Read the inspiring journey of Naksh Gupta, Founder of LearnPeak."
                            })
                        }}
                    />

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
                        <span>
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span>&bull;</span>
                        <span>LearnPeak Team</span>
                    </div>
                </header>

                <article className="prose prose-lg md:prose-xl mx-auto text-gray-800 leading-relaxed">
                    {/* 
              In production, you should use a library like 'dompurify' or 'htmr' to safer render HTML.
              However, since this is Admin-generated content, we assume some trust.
              We are verifying simply displaying standard HTML.
            */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                <hr className="my-12 border-gray-100" />

                <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">Ready to start your journey?</h3>
                    <Link href="/signup" className="inline-block bg-[#732C3F] text-white px-8 py-3 rounded-full font-bold hover:bg-[#5a2231] transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Join LearnPeak Today
                    </Link>
                </div>
            </main>
        </div>
    );
}
