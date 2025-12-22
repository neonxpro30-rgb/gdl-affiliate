// Daily Blog Cron API
// Automatically generates and publishes a blog post daily at 12 PM IST
// Uses trending topics based on current news and events

import { NextResponse } from 'next/server';
import { generateBlogPost, getTrendingTopic } from '@/lib/ai-blog-generator';
import { prisma } from '@/lib/prisma';

// Helper to generate URL-friendly slug with unique timestamp
function generateSlug(title: string): string {
    const timestamp = Date.now().toString(36);
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50) + '-' + timestamp;
}

// Check if similar title was posted recently (last 30 days)
async function checkForDuplicateTitle(title: string): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get keywords from title (first 3 significant words)
    const keywords = title
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(' ')
        .filter(w => w.length > 3)
        .slice(0, 3);

    if (keywords.length === 0) return false;

    // Check if any post in last 30 days has similar title
    const similarPosts = await prisma.post.findMany({
        where: {
            createdAt: { gte: thirtyDaysAgo },
            OR: keywords.map(keyword => ({
                title: { contains: keyword, mode: 'insensitive' as const }
            }))
        },
        select: { title: true }
    });

    // If more than half the keywords match with an existing post, it's duplicate
    for (const post of similarPosts) {
        const existingKeywords = post.title.toLowerCase().split(' ').filter(w => w.length > 3);
        const matchCount = keywords.filter(k => existingKeywords.includes(k)).length;
        if (matchCount >= 2) {
            console.log('⚠️ Similar post found:', post.title);
            return true;
        }
    }

    return false;
}

export async function GET(request: Request) {
    try {
        console.log('🚀 Daily Blog Cron Job Started');
        console.log('📅 Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        const startTime = Date.now();

        // Step 1: Get trending topic based on current news/events
        console.log('📰 Finding trending topic...');
        let trendingTopic = await getTrendingTopic();
        console.log('✅ Topic:', trendingTopic);

        // Step 2: Generate blog using AI
        console.log('✍️ Generating blog content...');
        let result = await generateBlogPost(trendingTopic);

        if (!result.success || !result.blog) {
            console.error('❌ Failed to generate blog:', result.error);
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to generate blog'
            }, { status: 500 });
        }

        // Step 3: Check for duplicate title
        let isDuplicate = await checkForDuplicateTitle(result.blog.title);
        let retryCount = 0;

        while (isDuplicate && retryCount < 3) {
            console.log('🔄 Duplicate detected, generating new topic...');
            retryCount++;

            // Get a different topic
            trendingTopic = await getTrendingTopic();
            result = await generateBlogPost(trendingTopic);

            if (!result.success || !result.blog) {
                break;
            }

            isDuplicate = await checkForDuplicateTitle(result.blog.title);
        }

        if (!result.success || !result.blog) {
            return NextResponse.json({
                success: false,
                error: 'Failed to generate unique blog after retries'
            }, { status: 500 });
        }

        const blog = result.blog;
        const imageUrl = result.imageUrl;
        let slug = generateSlug(blog.title);

        // Step 4: Ensure slug is unique
        const existingSlug = await prisma.post.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = slug + '-' + Math.random().toString(36).substring(2, 7);
        }

        // Step 5: Save and AUTO-PUBLISH
        const savedPost = await prisma.post.create({
            data: {
                title: blog.title,
                slug: slug,
                content: blog.content,
                excerpt: blog.excerpt,
                image: imageUrl || '',
                published: true
            }
        });

        const duration = Date.now() - startTime;

        console.log('✅ Blog PUBLISHED successfully!');
        console.log('📝 Title:', savedPost.title);
        console.log('🔗 Slug:', savedPost.slug);
        console.log('🖼️ Image:', imageUrl?.substring(0, 50) + '...');
        console.log(`⏱️ Total time: ${duration}ms`);
        console.log(`🔄 Retries for uniqueness: ${retryCount}`);

        return NextResponse.json({
            success: true,
            message: 'Blog generated and PUBLISHED automatically!',
            blog: {
                id: savedPost.id,
                title: savedPost.title,
                slug: savedPost.slug,
                excerpt: blog.excerpt,
                imageUrl: imageUrl,
                url: `https://learnpeak.in/blog/${savedPost.slug}`
            },
            topic: trendingTopic,
            processingTimeMs: duration,
            retriesForUniqueness: retryCount,
            publishedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Cron job error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

// Support POST for manual triggers
export async function POST(request: Request) {
    return GET(request);
}
