// Daily Blog Cron API
// Automatically generates and publishes a blog post daily at 12 PM IST
// Uses trending topics based on current news and events

import { NextResponse } from 'next/server';
import { generateBlogPost, getTrendingTopic, generateBlogImageUrl } from '@/lib/ai-blog-generator';
import { prisma } from '@/lib/prisma';

// Helper to generate URL-friendly slug
function generateSlug(title: string): string {
    const timestamp = Date.now().toString(36); // Add unique suffix
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50) + '-' + timestamp;
}

export async function GET(request: Request) {
    try {
        console.log('🚀 Daily Blog Cron Job Started');
        console.log('📅 Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        const startTime = Date.now();

        // Step 1: Get trending topic based on current news/events
        console.log('📰 Finding trending topic...');
        const trendingTopic = await getTrendingTopic();
        console.log('✅ Topic:', trendingTopic);

        // Step 2: Generate blog using AI
        console.log('✍️ Generating blog content...');
        const result = await generateBlogPost(trendingTopic);

        if (!result.success || !result.blog) {
            console.error('❌ Failed to generate blog:', result.error);
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to generate blog'
            }, { status: 500 });
        }

        const blog = result.blog;
        const imageUrl = result.imageUrl;
        const slug = generateSlug(blog.title);

        // Step 3: Check for duplicate (unlikely with timestamp slug but safe)
        const existingPost = await prisma.post.findUnique({
            where: { slug }
        });

        if (existingPost) {
            console.log('⚠️ Slug collision, adding random suffix');
            const newSlug = slug + '-' + Math.random().toString(36).substring(7);
        }

        // Step 4: Save and AUTO-PUBLISH
        const savedPost = await prisma.post.create({
            data: {
                title: blog.title,
                slug: slug,
                content: blog.content,
                excerpt: blog.excerpt,
                image: imageUrl || '',
                published: true // AUTO-PUBLISH!
            }
        });

        const duration = Date.now() - startTime;

        console.log('✅ Blog PUBLISHED successfully!');
        console.log('📝 Title:', savedPost.title);
        console.log('🔗 Slug:', savedPost.slug);
        console.log('🖼️ Image:', imageUrl?.substring(0, 50) + '...');
        console.log(`⏱️ Total time: ${duration}ms`);

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
