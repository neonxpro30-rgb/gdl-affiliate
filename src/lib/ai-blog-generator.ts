// AI Blog Generator using Gemini API
// Automatically generates blog content for LearnPeak

// Gemini API endpoint - using gemini-2.5-flash for better rate limits
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Blog topics relevant to LearnPeak - diverse topics for daily variety
const blogTopics = [
    // Affiliate Marketing
    'affiliate marketing tips for beginners',
    'how to start affiliate marketing in India',
    'best affiliate programs in India 2025',
    'Amazon affiliate marketing guide',

    // Freelancing
    'how to start freelancing in India',
    'best freelancing platforms for Indians',
    'freelancing skills in high demand 2025',
    'how to get first client as freelancer',
    'freelancing vs full time job - which is better',
    'Upwork and Fiverr tips for beginners',

    // Dropshipping & E-commerce
    'dropshipping business guide for India',
    'how to start dropshipping with zero investment',
    'Shopify vs WooCommerce for beginners',
    'e-commerce business ideas India',
    'Meesho reselling business tips',

    // YouTube & Video
    'how to start YouTube channel in 2025',
    'YouTube monetization tips India',
    'video editing tips for beginners',
    'YouTube Shorts vs Instagram Reels',
    'how to grow YouTube subscribers fast',

    // Social Media
    'Instagram growth strategies 2025',
    'Facebook ads for small business',
    'LinkedIn personal branding tips',
    'Twitter marketing for beginners',
    'social media manager career guide',

    // Digital Skills
    'digital marketing for beginners',
    'SEO basics everyone should know',
    'content writing tips for blogs',
    'graphic design career guide India',
    'web development roadmap 2025',

    // Passive Income
    'passive income ideas for students',
    'earn money online legitimately',
    'side hustle ideas for working professionals',
    'multiple income streams guide',

    // Career & Mindset
    'skill development for students',
    'personal branding on social media',
    'work from home tips India',
    'time management for entrepreneurs',
    'networking tips for career growth'
];

export interface GeneratedBlog {
    title: string;
    content: string;
    excerpt: string;
    metaDescription: string;
    keywords: string[];
    suggestedImage: string;
    generatedAt: Date;
}

// Build prompt for blog generation with SEO focus
function buildBlogPrompt(topic?: string): string {
    const selectedTopic = topic || blogTopics[Math.floor(Math.random() * blogTopics.length)];
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // Check if topic is money/earning related
    const isMoneyRelated = /earn|money|income|affiliate|freelanc|business|online|work from home|side hustle/i.test(selectedTopic);

    return `You are a professional content writer for LearnPeak (www.learnpeak.in), an Indian online education platform that teaches affiliate marketing, digital skills, and helps people build passive income.

Write a complete, SEO-optimized blog post about: "${selectedTopic}"

IMPORTANT SEO KEYWORDS TO NATURALLY INCLUDE:
- how to earn money online
- earn money online in India  
- online earning
- affiliate marketing
- digital marketing
- passive income
- work from home
- side income
- LearnPeak

Requirements:
1. Language: English (simple, easy to understand for young Indians age 18-35)
2. Tone: Professional, helpful, educational, motivational
3. Length: 1000-1500 words (comprehensive but engaging)
4. Include practical tips and actionable advice with steps
5. NO fake income claims, NO get-rich-quick promises, be realistic
6. Include relevant examples for Indian audience (mention Indian context, rupees, etc.)
7. ${isMoneyRelated
            ? 'IMPORTANT: Since this is about earning/money, naturally promote LearnPeak 2-3 times as the best platform to learn these skills. Mention that LearnPeak offers comprehensive courses with practical training.'
            : 'Naturally mention LearnPeak once or twice as a trusted learning resource.'}
8. End with a call-to-action encouraging readers to explore LearnPeak courses

SEO TITLE TIPS:
- Include "2025" or current year if relevant
- Use power words like "Complete Guide", "Step-by-Step", "Ultimate"
- Keep under 60 characters
- Target: "how to earn money online" type searches

Format your response EXACTLY like this:

TITLE: [Catchy, SEO-friendly title - max 60 characters]

EXCERPT: [2-3 sentence summary for preview - max 160 characters]

META_DESCRIPTION: [SEO meta description targeting "earn money online india" - max 155 characters]

KEYWORDS: [comma-separated list of 8-10 relevant SEO keywords including "earn money online", "LearnPeak"]

IMAGE_SUGGESTION: [describe the ideal featured image in one sentence]

CONTENT:
[Full blog content in HTML format with proper structure:
- Use <h2> for main sections (make them SEO-friendly)
- Use <p> for paragraphs
- Use <ul><li> for lists with actionable tips
- Use <strong> for emphasis and important keywords
- Use <blockquote> for motivational quotes
- Include 5-7 sections minimum
- Add a conclusion with LearnPeak CTA]

Remember: Write genuinely helpful content that ranks on Google and provides real value to readers looking to improve their skills and income.`;
}

// Parse Gemini response into blog structure
function parseGeminiBlogResponse(text: string): GeneratedBlog | null {
    try {
        // Normalize text for simpler parsing
        const normalizedText = text.replace(/\r\n/g, '\n');
        const titleMatch = normalizedText.match(/TITLE:\s*([^\n]+)/);
        const excerptMatch = normalizedText.match(/EXCERPT:\s*([^\n]+)/);
        const metaMatch = normalizedText.match(/META_DESCRIPTION:\s*([^\n]+)/);
        const keywordsMatch = normalizedText.match(/KEYWORDS:\s*([^\n]+)/);
        const imageMatch = normalizedText.match(/IMAGE_SUGGESTION:\s*([^\n]+)/);
        const contentMatch = normalizedText.match(/CONTENT:\s*([\s\S]+)$/);

        if (!titleMatch || !contentMatch) {
            console.error('Failed to parse blog response - missing title or content');
            return null;
        }

        return {
            title: titleMatch[1].trim(),
            excerpt: excerptMatch ? excerptMatch[1].trim() : '',
            metaDescription: metaMatch ? metaMatch[1].trim() : '',
            keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
            suggestedImage: imageMatch ? imageMatch[1].trim() : '',
            content: contentMatch[1].trim(),
            generatedAt: new Date()
        };
    } catch (error) {
        console.error('Error parsing blog response:', error);
        return null;
    }
}

// Generate Pollinations image URL from description
export function generateBlogImageUrl(imageDescription: string): string {
    const prompt = `Professional blog featured image, ${imageDescription}, modern clean design, vibrant colors, high quality, 16:9 aspect ratio, no text`;
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Date.now();
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&seed=${seed}&nologo=true`;
}

// Main function: Generate blog using Gemini
export async function generateBlogPost(topic?: string): Promise<{
    success: boolean;
    blog?: GeneratedBlog;
    imageUrl?: string;
    error?: string;
}> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'Gemini API key not found' };
    }

    try {
        console.log('🚀 Starting blog generation...');
        const prompt = buildBlogPrompt(topic);

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 4096,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            return { success: false, error: `API error: ${response.status}` };
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return { success: false, error: 'No content generated' };
        }

        const blog = parseGeminiBlogResponse(generatedText);

        if (!blog) {
            return { success: false, error: 'Failed to parse generated content' };
        }

        // Generate featured image URL
        const imageUrl = generateBlogImageUrl(blog.suggestedImage);

        console.log('✅ Blog generated successfully:', blog.title);

        return {
            success: true,
            blog,
            imageUrl
        };

    } catch (error) {
        console.error('Blog generation error:', error);
        return { success: false, error: String(error) };
    }
}

// Get trending topic based on current news and events
export async function getTrendingTopic(): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const monthName = today.toLocaleDateString('en-IN', { month: 'long' });

    if (!apiKey) {
        return blogTopics[Math.floor(Math.random() * blogTopics.length)];
    }

    try {
        const prompt = `Today is ${dateStr}. 

You are helping create a blog for LearnPeak, an Indian online education platform focused on affiliate marketing, digital skills, and earning online.

Based on current events, trends, or time of year, suggest ONE specific blog topic that would be highly relevant and timely RIGHT NOW.

Consider:
- Any major events happening in India (festivals, budget, elections, etc.)
- Seasonal relevance (${monthName}, end of year if applicable)
- Current digital marketing trends
- Economic news affecting online earning
- Technology updates relevant to content creators
- Social media platform updates

Requirements:
- Topic must be educational and helpful
- Related to digital skills, online earning, or personal development
- NO fake promises or get-rich-quick themes
- Should be interesting for young Indians aged 18-35

Respond with ONLY the topic title, nothing else. Example format:
How to Plan Your 2025 Digital Marketing Strategy`;

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 100 }
            })
        });

        if (!response.ok) {
            return blogTopics[Math.floor(Math.random() * blogTopics.length)];
        }

        const data = await response.json();
        const topic = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        if (topic.length > 10 && topic.length < 100) {
            console.log('📰 Trending topic found:', topic);
            return topic;
        }

        return blogTopics[Math.floor(Math.random() * blogTopics.length)];

    } catch (error) {
        console.error('Error getting trending topic:', error);
        return blogTopics[Math.floor(Math.random() * blogTopics.length)];
    }
}

// Get topic suggestions for manual selection
export async function getTopicSuggestions(): Promise<string[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!apiKey) {
        return blogTopics.slice(0, 5);
    }

    try {
        const prompt = `Today is ${dateStr}. Suggest 5 trending and timely blog topics for an Indian online education platform that teaches affiliate marketing, digital skills, and passive income strategies.

Consider current events, festivals, trends in India.

Format: Just list 5 topics, one per line, no numbering or bullets.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
            })
        });

        if (!response.ok) {
            return blogTopics.slice(0, 5);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const topics = text.split('\n').filter((t: string) => t.trim().length > 5).slice(0, 5);
        return topics.length > 0 ? topics : blogTopics.slice(0, 5);

    } catch (error) {
        return blogTopics.slice(0, 5);
    }
}
