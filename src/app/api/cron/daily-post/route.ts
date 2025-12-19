// Daily Blog Cron API
// Automatically generates and publishes a blog post daily
// Triggered by Vercel Cron

import { NextResponse } from 'next/server';
import { generateBlogPost, generateBlogImageUrl } from '@/lib/ai-blog-generator';
import { prisma } from '@/lib/prisma';

// Helper to generate URL-friendly slug
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60);
}

export async function GET(request: Request) {
    try {
        console.log('🚀 Daily Blog Cron Job Started');
        const startTime = Date.now();

        // Generate blog using AI
        const result = await generateBlogPost();

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

        // Check if slug already exists
        const existingPost = await prisma.post.findUnique({
            where: { slug }
        });

        if (existingPost) {
            console.log('⚠️ Post with similar slug already exists, skipping');
            return NextResponse.json({
                success: false,
                error: 'Post with similar title already exists',
                existingSlug: slug
            }, { status: 409 });
        }

        // Save to database as draft (admin can review and publish)
        const savedPost = await prisma.post.create({
            data: {
                title: blog.title,
                slug: slug,
                content: blog.content,
                excerpt: blog.excerpt,
                image: imageUrl || '',
                published: false // Save as draft for review
            }
        });

        const duration = Date.now() - startTime;

        console.log('✅ Blog generated and saved:', savedPost.id);
        console.log(`⏱️ Processing time: ${duration}ms`);

        return NextResponse.json({
            success: true,
            message: 'Blog generated and saved as draft',
            blog: {
                id: savedPost.id,
                title: savedPost.title,
                slug: savedPost.slug,
                excerpt: blog.excerpt,
                imageUrl: imageUrl
            },
            processingTimeMs: duration
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
