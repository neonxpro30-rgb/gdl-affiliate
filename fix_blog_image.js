const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to generate image URL (same logic as in ai-blog-generator)
function generateBlogImageUrl(description) {
    const prompt = `Professional blog featured image, ${description}, modern clean design, vibrant colors, high quality, 16:9 aspect ratio, no text`;
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Date.now();
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&seed=${seed}&nologo=true`;
}

async function fixMissingImage() {
    try {
        const titleToFind = "How LearnPeak Helps You Build a Successful Digital Career";

        console.log(`🔍 Searching for post: "${titleToFind}"...`);

        const post = await prisma.post.findFirst({
            where: {
                title: {
                    contains: "How LearnPeak Helps You Build", // Partial match to be safe
                    mode: 'insensitive'
                }
            }
        });

        if (!post) {
            console.log('❌ Post not found!');
            return;
        }

        console.log(`✅ Found post: ${post.title}`);
        console.log(`🖼️ Current Image: ${post.image || 'None'}`);

        // Generate new image
        const newImage = generateBlogImageUrl("students learning digital skills online on laptop, success, education, growth");
        console.log(`✨ Generated New Image URL: ${newImage}`);

        // Update post
        await prisma.post.update({
            where: { id: post.id },
            data: { image: newImage }
        });

        console.log('🎉 Post image updated successfully!');

    } catch (error) {
        console.error('❌ Error updating image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixMissingImage();
