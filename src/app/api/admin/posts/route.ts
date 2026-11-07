import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
    try {
        // Admin-only (audit 2026-11-07, critical #5): a bare session check let
        // ANY logged-in customer manage blog posts.
        const admin = await requireAdmin();
        if (!admin.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, image, published } = body;

        // Simple slug generation
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const post = await prisma.post.create({
            data: {
                title,
                content,
                image,
                published: published || false,
                slug: `${slug}-${Date.now()}`, // Ensure uniqueness
            },
        });
        return NextResponse.json(post);
    } catch (error) {
        console.error('Create Post Error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
