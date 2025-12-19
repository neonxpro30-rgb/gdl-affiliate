// Daily Post Cron API v2
// Uses AI (Gemini) to generate unique content daily
// Triggered by Vercel Cron at 4:30 PM IST daily

import { NextResponse } from 'next/server';
import { generateAIPost } from '@/lib/ai-content-generator';
import { sendDailyPostEmail } from '@/lib/email';

// Admin email for receiving daily posts
const ADMIN_EMAIL = 'neonxpro30@gmail.com';

// Base URL for images
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://learnpeak.in';

export async function GET(request: Request) {
    try {
        console.log('🚀 Daily Post Cron Job Started (AI Version)');

        // Generate AI content
        const post = await generateAIPost();
        console.log(`📝 Generated ${post.isFestival ? 'festival' : 'daily'} post:`, post.theme);
        console.log(`💬 Caption preview:`, post.caption.substring(0, 100) + '...');

        // Build image URL
        const imageUrl = `${BASE_URL}/social-posts/${post.imageFile}`;
        console.log('🖼️ Image URL:', imageUrl);

        // Send email
        const emailResult = await sendDailyPostEmail(ADMIN_EMAIL, {
            type: post.isFestival ? 'festival' : 'daily',
            caption: post.caption,
            hashtags: post.hashtags,
            imageUrl: imageUrl,
            festivalName: post.festivalName,
            dayTheme: post.theme
        });

        if (emailResult.success) {
            console.log('✅ Daily post email sent successfully');
            return NextResponse.json({
                success: true,
                message: 'AI-generated post email sent successfully',
                postType: post.isFestival ? 'festival' : 'daily',
                theme: post.theme,
                caption: post.caption,
                hashtags: post.hashtags,
                imageUrl: imageUrl,
                sentTo: ADMIN_EMAIL,
                generatedAt: post.generatedAt
            });
        } else {
            console.error('❌ Failed to send email:', emailResult.error);
            return NextResponse.json({
                success: false,
                error: emailResult.error
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Cron job error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
    return GET(request);
}
