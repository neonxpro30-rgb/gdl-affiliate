// AI Blog Generation API
// Generates blog posts using Gemini AI

import { NextResponse } from 'next/server';
import { generateBlogPost, getTopicSuggestions, generateBlogImageUrl } from '@/lib/ai-blog-generator';
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

// GET: Get topic suggestions
export async function GET(request: Request) {
    try {
        const topics = await getTopicSuggestions();
        return NextResponse.json({
            success: true,
            topics
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

// POST: Generate a new blog post
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { topic, autoPublish = false, autoSave = true } = body;

        console.log('🚀 AI Blog Generation Started');
        console.log('📝 Topic:', topic || 'Random');

        // Generate blog using AI
        const result = await generateBlogPost(topic);

        if (!result.success || !result.blog) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to generate blog'
            }, { status: 500 });
        }

        const blog = result.blog;
        const imageUrl = result.imageUrl;

        // Auto-save to database if requested
        let savedPost = null;
        if (autoSave) {
            const slug = generateSlug(blog.title);

            // Check if slug exists
            const existingPost = await prisma.post.findUnique({
                where: { slug }
            });

            if (!existingPost) {
                savedPost = await prisma.post.create({
                    data: {
                        title: blog.title,
                        slug: slug,
                        content: blog.content,
                        excerpt: blog.excerpt,
                        image: imageUrl || '',
                        published: autoPublish
                    }
                });
                console.log('💾 Blog saved to database:', savedPost.id);
            } else {
                console.log('⚠️ Slug already exists, not saving');
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Blog generated successfully',
            blog: {
                title: blog.title,
                excerpt: blog.excerpt,
                content: blog.content,
                metaDescription: blog.metaDescription,
                keywords: blog.keywords,
                imageUrl: imageUrl,
                generatedAt: blog.generatedAt
            },
            saved: savedPost ? true : false,
            postId: savedPost?.id || null,
            slug: savedPost?.slug || generateSlug(blog.title)
        });

    } catch (error) {
        console.error('❌ Blog generation error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
