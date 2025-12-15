import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        // Basic protection: Check if user exists. Ideally check role 'ADMIN' if you have it.
        if (!session) {
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
        const session = await getServerSession(authOptions);
        if (!session) {
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
