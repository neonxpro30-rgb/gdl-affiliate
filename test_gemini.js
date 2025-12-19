// Quick test for Gemini API
require('dotenv').config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');
    
    const prompt = `Create a short Instagram caption for "Feature Friday" for LearnPeak, an online education platform. 
    Requirements: English only, professional tone, 2-3 sentences, end with "Link in bio".
    Format: CAPTION: [text] HASHTAGS: [comma separated]`;
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error:', errorText);
            return;
        }
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content';
        
        console.log('\n✅ AI Generated Content:');
        console.log('─'.repeat(50));
        console.log(generatedText);
        console.log('─'.repeat(50));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testGemini();
