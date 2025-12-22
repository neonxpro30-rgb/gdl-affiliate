// Blog Comments API
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch approved comments for a post
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');
        const slug = searchParams.get('slug');

        if (!postId && !slug) {
            return NextResponse.json({ error: 'postId or slug required' }, { status: 400 });
        }

        let wherePost = {};
        if (postId) {
            wherePost = { id: postId };
        } else if (slug) {
            const post = await prisma.post.findUnique({ where: { slug } });
            if (!post) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
            wherePost = { id: post.id };
        }

        const comments = await prisma.blogComment.findMany({
            where: {
                postId: (wherePost as { id: string }).id,
                approved: true
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                content: true,
                createdAt: true
            }
        });

        return NextResponse.json({ success: true, comments });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// POST - Add a new comment (requires approval)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { postId, slug, name, email, content } = body;

        if (!name || !email || !content) {
            return NextResponse.json({ error: 'Name, email and comment required' }, { status: 400 });
        }

        if (content.length < 5 || content.length > 1000) {
            return NextResponse.json({ error: 'Comment must be 5-1000 characters' }, { status: 400 });
        }

        // Get post ID from slug if needed
        let finalPostId = postId;
        if (!finalPostId && slug) {
            const post = await prisma.post.findUnique({ where: { slug } });
            if (!post) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
            finalPostId = post.id;
        }

        if (!finalPostId) {
            return NextResponse.json({ error: 'Post ID or slug required' }, { status: 400 });
        }

        // Create comment (not approved by default)
        const comment = await prisma.blogComment.create({
            data: {
                postId: finalPostId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                content: content.trim(),
                approved: false
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Comment submitted for review. It will appear after approval.',
            commentId: comment.id
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
