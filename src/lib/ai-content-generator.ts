// AI Content Generator using Google Gemini API (FREE)
// Generates unique social media content daily

import { getTodaysFestival } from './festival-calendar';

// Gemini API endpoint - using flash-lite for higher free tier limits
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// Day themes
const dayThemes: Record<number, { name: string; focus: string }> = {
    0: { name: 'Sunday Special', focus: 'weekly planning, rest and recharge, reflection' },
    1: { name: 'Motivation Monday', focus: 'new week motivation, goal setting, fresh start' },
    2: { name: 'Tip Tuesday', focus: 'practical tips, how-to advice, learning hacks' },
    3: { name: 'Wisdom Wednesday', focus: 'knowledge sharing, quotes, insights' },
    4: { name: 'Earning Thursday', focus: 'income strategies, side hustles, financial growth' },
    5: { name: 'Feature Friday', focus: 'course highlights, platform features, weekend learning' },
    6: { name: 'Success Saturday', focus: 'success stories, achievements, celebrating wins' }
};

// Content categories for variety
const contentAngles = [
    'affiliate marketing success',
    'digital skills development',
    'content creation tips',
    'social media growth',
    'passive income strategies',
    'online business basics',
    'personal branding',
    'time management for learners',
    'networking in digital space',
    'building online presence'
];

export interface AIGeneratedPost {
    caption: string;
    hashtags: string[];
    theme: string;
    isFestival: boolean;
    festivalName?: string;
    imageFile: string;
    generatedAt: Date;
}

// Generate content prompt based on context
function buildPrompt(dayOfWeek: number, festivalName?: string): string {
    const theme = dayThemes[dayOfWeek];
    const randomAngle = contentAngles[Math.floor(Math.random() * contentAngles.length)];
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (festivalName) {
        return `You are a social media content creator for LearnPeak, an online education platform focused on affiliate marketing and digital skills.

Create an Instagram post for ${festivalName} (${dateStr}).

Requirements:
- Language: English only
- Tone: Professional, inspiring, NOT salesy
- Length: 3-5 short sentences
- Include a subtle connection to learning/growth (but NOT pushy)
- End with a call-to-action mentioning LearnPeak
- NO fake income claims or get-rich-quick promises
- Be authentic and genuine

Format your response EXACTLY like this:
CAPTION: [your caption here]
HASHTAGS: [5-7 relevant hashtags separated by commas, without #]

Example output:
CAPTION: Wishing everyone a joyful Diwali! May this festival of lights illuminate your path to success. This is the perfect time to invest in yourself and learn new skills. Start your journey with LearnPeak. Link in bio.
HASHTAGS: HappyDiwali, FestivalOfLights, LearnPeak, DigitalSkills, NewBeginnings`;
    }

    return `You are a social media content creator for LearnPeak, an online education platform focused on affiliate marketing and digital skills.

Create an Instagram post for ${theme.name} (${dateStr}).

Today's focus: ${theme.focus}
Content angle to incorporate: ${randomAngle}

Requirements:
- Language: English only
- Tone: Professional, motivating, educational
- Length: 3-5 short sentences
- Include practical value or insight
- End with subtle CTA mentioning LearnPeak
- NO fake income claims or exaggerated promises
- Be authentic and helpful

Format your response EXACTLY like this:
CAPTION: [your caption here]
HASHTAGS: [5-7 relevant hashtags separated by commas, without #]

Example output:
CAPTION: New week, new opportunities. Success in affiliate marketing isn't about luck - it's about consistent learning and action. This week, focus on mastering one new skill. Your future self will thank you. Start at LearnPeak. Link in bio.
HASHTAGS: MondayMotivation, AffiliateMarketing, DigitalSkills, LearnPeak, GrowthMindset, OnlineBusiness`;
}

// Parse Gemini response
function parseGeminiResponse(text: string): { caption: string; hashtags: string[] } {
    // Replace newlines with spaces for simpler parsing
    const normalizedText = text.replace(/\n/g, ' ');
    const captionMatch = normalizedText.match(/CAPTION:\s*(.+?)(?=HASHTAGS:|$)/);
    const hashtagsMatch = normalizedText.match(/HASHTAGS:\s*(.+?)$/);

    const caption = captionMatch
        ? captionMatch[1].trim()
        : 'Build your skills. Build your future. Start learning at LearnPeak. Link in bio.';

    const hashtags = hashtagsMatch
        ? hashtagsMatch[1].split(',').map(h => h.trim().replace('#', ''))
        : ['LearnPeak', 'DigitalSkills', 'OnlineLearning', 'GrowthMindset'];

    return { caption, hashtags };
}

// Get image file based on day/festival
function getImageFile(dayOfWeek: number, festivalName?: string): string {
    if (festivalName) {
        const festivalImages: Record<string, string> = {
            'Christmas': 'christmas.png',
            'Diwali': 'motivation.png',
            'Holi': 'motivation.png',
            'New Year': 'motivation.png',
            'Independence Day': 'motivation.png',
            'Republic Day': 'motivation.png'
        };
        return festivalImages[festivalName] || 'motivation.png';
    }

    const dayImages: Record<number, string> = {
        0: 'sunday.png',
        1: 'monday.png',
        2: 'tuesday.png',
        3: 'wednesday.png',
        4: 'thursday.png',
        5: 'friday.png',
        6: 'saturday.png'
    };
    return dayImages[dayOfWeek] || 'motivation.png';
}

// Main function: Generate AI content
export async function generateAIPost(geminiApiKey?: string): Promise<AIGeneratedPost> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const festival = getTodaysFestival();
    const theme = dayThemes[dayOfWeek];

    // If no API key, use fallback content
    const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.log('⚠️ No Gemini API key, using fallback content');
        return getFallbackPost(dayOfWeek, festival?.name);
    }

    try {
        const prompt = buildPrompt(dayOfWeek, festival?.name);

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 500,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const { caption, hashtags } = parseGeminiResponse(generatedText);

        return {
            caption,
            hashtags,
            theme: festival?.name || theme.name,
            isFestival: !!festival,
            festivalName: festival?.name,
            imageFile: getImageFile(dayOfWeek, festival?.name),
            generatedAt: new Date()
        };

    } catch (error) {
        console.error('Gemini API error:', error);
        return getFallbackPost(dayOfWeek, festival?.name);
    }
}

// Fallback content when API fails
function getFallbackPost(dayOfWeek: number, festivalName?: string): AIGeneratedPost {
    const theme = dayThemes[dayOfWeek];

    const fallbackCaptions: Record<number, string> = {
        0: "Sunday is for planning your success. Take a moment to reflect on your goals and prepare for the week ahead. Your growth journey continues at LearnPeak. Link in bio.",
        1: "New week, new possibilities. The best investment you can make is in yourself. Start building skills that matter. Learn at LearnPeak. Link in bio.",
        2: "Quick tip: Consistency beats perfection every time. Show up, learn something new, and keep moving forward. LearnPeak is here to help. Link in bio.",
        3: "Knowledge is the best investment. The more you learn, the more doors open. What will you learn today? Start at LearnPeak. Link in bio.",
        4: "Building income streams takes time and skill. Focus on learning first, earning follows. Get started at LearnPeak. Link in bio.",
        5: "Weekend is coming! Perfect time to explore new courses and level up your skills. Check out what's new at LearnPeak. Link in bio.",
        6: "Celebrate your progress, no matter how small. Every step forward counts. Keep learning, keep growing with LearnPeak. Link in bio."
    };

    const fallbackHashtags: Record<number, string[]> = {
        0: ['SundayPlanning', 'WeeklyGoals', 'LearnPeak', 'PersonalGrowth'],
        1: ['MondayMotivation', 'NewWeek', 'LearnPeak', 'SelfImprovement', 'DigitalSkills'],
        2: ['TipTuesday', 'LearningTips', 'LearnPeak', 'GrowthMindset'],
        3: ['WisdomWednesday', 'Knowledge', 'LearnPeak', 'Education', 'Learning'],
        4: ['EarningThursday', 'SideHustle', 'LearnPeak', 'DigitalIncome'],
        5: ['FeatureFriday', 'WeekendLearning', 'LearnPeak', 'OnlineCourses'],
        6: ['SuccessSaturday', 'Celebration', 'LearnPeak', 'Progress', 'Achievement']
    };

    return {
        caption: fallbackCaptions[dayOfWeek] || fallbackCaptions[1],
        hashtags: fallbackHashtags[dayOfWeek] || fallbackHashtags[1],
        theme: festivalName || theme.name,
        isFestival: !!festivalName,
        festivalName,
        imageFile: getImageFile(dayOfWeek, festivalName),
        generatedAt: new Date()
    };
}
