// Blog Reviews API - Star ratings and feedback
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch review stats for a post
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'slug required' }, { status: 400 });
        }

        const post = await prisma.post.findUnique({ where: { slug } });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const reviews = await prisma.blogReview.findMany({
            where: { postId: post.id }
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;
        const helpfulCount = reviews.filter(r => r.helpful).length;

        return NextResponse.json({
            success: true,
            stats: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                helpfulPercentage: totalReviews > 0 ? Math.round((helpfulCount / totalReviews) * 100) : 0
            }
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// POST - Add a review/rating
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slug, rating, feedback, helpful } = body;

        if (!slug) {
            return NextResponse.json({ error: 'slug required' }, { status: 400 });
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
        }

        const post = await prisma.post.findUnique({ where: { slug } });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const review = await prisma.blogReview.create({
            data: {
                postId: post.id,
                rating: parseInt(rating),
                feedback: feedback?.trim() || null,
                helpful: helpful !== false
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Thank you for your feedback!',
            reviewId: review.id
        });

    } catch (error) {
        console.error('Error adding review:', error);
        return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
    }
}
