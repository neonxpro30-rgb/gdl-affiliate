import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogComments from "@/components/BlogComments";
import BlogReview from "@/components/BlogReview";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

// High-traffic SEO keywords for India
const seoKeywords = [
    "how to earn money online",
    "earn money online in India",
    "online earning",
    "make money from home",
    "affiliate marketing India",
    "digital marketing course",
    "freelancing India",
    "side income ideas",
    "passive income",
    "work from home jobs",
    "LearnPeak"
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.post.findUnique({ where: { slug } });

    if (!post) return { title: 'Post Not Found' };

    const description = post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 155);

    // Combine post-specific keywords with high-traffic ones
    const keywords = [
        ...seoKeywords,
        post.title.split(' ').filter(w => w.length > 3).slice(0, 5),
        "LearnPeak blog"
    ].flat();

    return {
        title: `${post.title} | LearnPeak - Learn & Earn Online`,
        description: `${description} - Learn how to earn money online with LearnPeak.`,
        keywords: keywords,
        authors: [{ name: "LearnPeak Team", url: "https://learnpeak.in" }],
        openGraph: {
            title: post.title,
            description: description,
            url: `https://learnpeak.in/blog/${slug}`,
            siteName: "LearnPeak - Online Earning & Digital Skills",
            images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : [],
            type: 'article',
            publishedTime: post.createdAt.toISOString(),
            modifiedTime: post.updatedAt.toISOString(),
            authors: ["LearnPeak Team"]
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: description,
            images: post.image ? [post.image] : []
        },
        alternates: {
            canonical: `https://learnpeak.in/blog/${slug}`
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            }
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

    // Enhanced JSON-LD structured data for better SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://learnpeak.in/blog/${slug}`
        },
        "headline": post.title,
        "description": post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 150),
        "image": post.image || "https://learnpeak.in/og-blog.png",
        "datePublished": post.createdAt.toISOString(),
        "dateModified": post.updatedAt.toISOString(),
        "author": {
            "@type": "Organization",
            "name": "LearnPeak",
            "url": "https://learnpeak.in"
        },
        "publisher": {
            "@type": "Organization",
            "name": "LearnPeak",
            "logo": {
                "@type": "ImageObject",
                "url": "https://learnpeak.in/logo-icon.png"
            }
        },
        "keywords": seoKeywords.join(", ")
    };

    // FAQ Schema for common questions (helps in search snippets)
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How can I earn money online in India?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can earn money online through affiliate marketing, freelancing, content creation, and digital marketing. LearnPeak offers courses to help you get started."
                }
            },
            {
                "@type": "Question",
                "name": "What is affiliate marketing?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Affiliate marketing is earning commission by promoting other companies' products. It's a popular way to earn passive income online."
                }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

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
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                {/* LearnPeak Promotion CTA */}
                <div className="my-12 bg-gradient-to-r from-[#732C3F] to-[#9E4A5F] rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-3">🚀 Ready to Start Earning Online?</h3>
                    <p className="text-white/90 mb-6 max-w-xl mx-auto">
                        Join thousands of students learning affiliate marketing, digital skills, and building passive income with LearnPeak.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="bg-white text-[#732C3F] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
                        >
                            Join LearnPeak Free
                        </Link>
                        <Link
                            href="/packages"
                            className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition"
                        >
                            View Packages
                        </Link>
                    </div>
                </div>

                {/* Review Section */}
                <BlogReview slug={slug} />

                {/* Comments Section */}
                <BlogComments slug={slug} />

                {/* Related Topics for SEO */}
                <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-4">🔍 Related Topics</h4>
                    <div className="flex flex-wrap gap-2">
                        {['How to Earn Money Online', 'Affiliate Marketing', 'Freelancing', 'Digital Marketing',
                            'Passive Income', 'Work From Home', 'Side Hustle', 'LearnPeak Courses'].map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/blog?q=${encodeURIComponent(tag)}`}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#732C3F] hover:text-[#732C3F] transition"
                                >
                                    {tag}
                                </Link>
                            ))}
                    </div>
                </div>

                {/* Back to Blog Link */}
                <div className="mt-8 text-center">
                    <Link href="/blog" className="text-[#732C3F] font-semibold hover:underline">
                        ← Back to All Articles
                    </Link>
                </div>
            </main>
        </div>
    );
}
