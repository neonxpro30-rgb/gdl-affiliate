// AI Blog Generator using Gemini API
// Automatically generates blog content for LearnPeak

// Gemini API endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// Blog topics relevant to LearnPeak
const blogTopics = [
    'affiliate marketing tips',
    'how to start affiliate marketing in India',
    'passive income strategies',
    'digital marketing for beginners',
    'content creation tips',
    'social media marketing guide',
    'earn money online legitimately',
    'skill development for students',
    'side hustle ideas India',
    'personal branding tips',
    'video editing for beginners',
    'Instagram growth strategies',
    'Facebook ads basics',
    'freelancing tips India',
    'online business ideas'
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

// Build prompt for blog generation
function buildBlogPrompt(topic?: string): string {
    const selectedTopic = topic || blogTopics[Math.floor(Math.random() * blogTopics.length)];
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return `You are a professional content writer for LearnPeak (www.learnpeak.in), an Indian online education platform that teaches affiliate marketing, digital skills, and helps people build passive income.

Write a complete, SEO-optimized blog post about: "${selectedTopic}"

Requirements:
1. Language: English (simple, easy to understand)
2. Tone: Professional, helpful, educational
3. Length: 800-1200 words
4. Include practical tips and actionable advice
5. NO fake income claims, NO get-rich-quick promises
6. Include relevant examples for Indian audience
7. Naturally mention LearnPeak once or twice as a resource

Format your response EXACTLY like this:

TITLE: [Catchy, SEO-friendly title - max 60 characters]

EXCERPT: [2-3 sentence summary for preview - max 160 characters]

META_DESCRIPTION: [SEO meta description - max 155 characters]

KEYWORDS: [comma-separated list of 5-7 relevant keywords]

IMAGE_SUGGESTION: [describe the ideal featured image in one sentence]

CONTENT:
[Full blog content in HTML format with proper structure:
- Use <h2> for main sections
- Use <p> for paragraphs
- Use <ul><li> for lists
- Use <strong> for emphasis
- Use <blockquote> for quotes
- Include 4-6 sections minimum]

Remember: Write genuinely helpful content that provides real value to readers.`;
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
