const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBlogYears() {
    try {
        console.log('🔄 Starting update: Replacing 2025 with 2026 in blog posts...');

        // Find all posts containing "2025" in title or content
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: '2025' } },
                    { content: { contains: '2025' } },
                    { excerpt: { contains: '2025' } }
                ]
            }
        });

        console.log(`📝 Found ${posts.length} posts to update.`);

        for (const post of posts) {
            const newTitle = post.title.replace(/2025/g, '2026');
            const newContent = post.content.replace(/2025/g, '2026');
            const newExcerpt = post.excerpt ? post.excerpt.replace(/2025/g, '2026') : null;

            // Update the post
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    title: newTitle,
                    content: newContent,
                    excerpt: newExcerpt
                }
            });

            console.log(`✅ Updated post: ${post.title} -> ${newTitle}`);
        }

        console.log('🎉 All posts updated successfully!');

    } catch (error) {
        console.error('❌ Error updating posts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateBlogYears();
