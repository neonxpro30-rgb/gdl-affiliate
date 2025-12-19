// Content Generator for Daily Social Media Posts
// Combines festival calendar and content templates to generate daily posts

import { getTodaysFestival, Festival } from './festival-calendar';
import { getTemplateForDay, ContentTemplate } from './content-templates';

export interface GeneratedPost {
    type: 'festival' | 'daily';
    caption: string;
    hashtags: string[];
    imageSearchTerm: string; // For Unsplash image search
    festivalName?: string;
    dayTheme?: string;
    generatedAt: Date;
}

// Day themes for reference
const dayThemes: Record<number, string> = {
    0: 'Sunday Special',
    1: 'Motivation Monday',
    2: 'Tip Tuesday',
    3: 'Wisdom Wednesday',
    4: 'Earning Thursday',
    5: 'Feature Friday',
    6: 'Success Saturday'
};

// Image search terms for each category
const imageSearchTerms: Record<string, string[]> = {
    motivation: ['success', 'motivation', 'sunrise', 'mountain top', 'achievement'],
    tip: ['lightbulb', 'idea', 'strategy', 'laptop workspace', 'productivity'],
    wisdom: ['books', 'knowledge', 'learning', 'library', 'wisdom'],
    earning: ['money', 'business', 'entrepreneur', 'laptop money', 'investment'],
    feature: ['online course', 'e-learning', 'digital education', 'laptop', 'study'],
    success: ['success', 'celebration', 'achievement', 'winner', 'growth'],
    special: ['planning', 'notebook', 'goals', 'reflection', 'peaceful'],
    festival: ['celebration', 'festival', 'happy', 'colorful', 'joy']
};

// Get random element from array
function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate today's post
export function generateDailyPost(): GeneratedPost {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Check for festival first
    const festival = getTodaysFestival();

    if (festival) {
        // Festival post takes priority
        return {
            type: 'festival',
            caption: festival.greeting,
            hashtags: festival.hashtags,
            imageSearchTerm: getRandomElement(imageSearchTerms.festival),
            festivalName: festival.name,
            generatedAt: new Date()
        };
    }

    // Regular day-based content
    const template = getTemplateForDay(dayOfWeek);

    return {
        type: 'daily',
        caption: template.caption,
        hashtags: template.hashtags,
        imageSearchTerm: getRandomElement(imageSearchTerms[template.category] || imageSearchTerms.motivation),
        dayTheme: dayThemes[dayOfWeek],
        generatedAt: new Date()
    };
}

// Format hashtags for Instagram
export function formatHashtags(hashtags: string[]): string {
    return hashtags.map(tag => `#${tag}`).join(' ');
}

// Generate full post text (caption + hashtags)
export function generateFullPostText(post: GeneratedPost): string {
    const hashtagString = formatHashtags(post.hashtags);
    return `${post.caption}\n\n${hashtagString}`;
}

// Get branded LearnPeak image URL based on day of week
// Images are stored in /public/social-posts/
export function getBrandedImageUrl(dayOfWeek: number, baseUrl: string = 'https://learnpeak.in'): string {
    const dayImages: Record<number, string> = {
        0: 'sunday.png',
        1: 'monday.png',
        2: 'tuesday.png',
        3: 'wednesday.png',
        4: 'thursday.png',
        5: 'friday.png',
        6: 'saturday.png'
    };

    return `${baseUrl}/social-posts/${dayImages[dayOfWeek] || 'motivation.png'}`;
}

// Get festival-specific image if available
export function getFestivalImageUrl(festivalName: string, baseUrl: string = 'https://learnpeak.in'): string {
    // Map festival names to image files
    const festivalImages: Record<string, string> = {
        'Christmas': 'christmas.png',
        'New Year': 'motivation.png',
        'Diwali': 'motivation.png', // TODO: Generate Diwali image
        'Holi': 'motivation.png',   // TODO: Generate Holi image
        'Independence Day': 'motivation.png',
        'Republic Day': 'motivation.png'
    };

    const imageName = festivalImages[festivalName] || 'motivation.png';
    return `${baseUrl}/social-posts/${imageName}`;
}

// Legacy function - kept for compatibility
export function getUnsplashImageUrl(searchTerm: string, width: number = 1080, height: number = 1080): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return getBrandedImageUrl(dayOfWeek);
}

// Get image URL based on content type
export function getPostImageUrl(post: { type: 'festival' | 'daily'; festivalName?: string; dayTheme?: string }): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://learnpeak.in';

    if (post.type === 'festival' && post.festivalName) {
        return getFestivalImageUrl(post.festivalName, baseUrl);
    }

    const today = new Date();
    return getBrandedImageUrl(today.getDay(), baseUrl);
}

// Generate complete post data
export function generateCompletePost(): {
    post: GeneratedPost;
    fullText: string;
    imageUrl: string;
} {
    const post = generateDailyPost();
    const fullText = generateFullPostText(post);
    const imageUrl = getUnsplashImageUrl(post.imageSearchTerm);

    return {
        post,
        fullText,
        imageUrl
    };
}
