const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBlogYears() {
    try {
        console.log('🔄 Starting update: Replacing 2024 & 2025 with 2026 in blog posts...');

        // Find all posts containing "2024" or "2025"
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: '2024' } },
                    { title: { contains: '2025' } },
                    { content: { contains: '2024' } },
                    { content: { contains: '2025' } }
                ]
            }
        });

        console.log(`📝 Found ${posts.length} posts to update.`);

        for (const post of posts) {
            // Replace both 2024 and 2025 with 2026
            let newTitle = post.title.replace(/2024/g, '2026').replace(/2025/g, '2026');
            let newContent = post.content.replace(/2024/g, '2026').replace(/2025/g, '2026');
            let newExcerpt = post.excerpt ? post.excerpt.replace(/2024/g, '2026').replace(/2025/g, '2026') : null;

            // Update
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    title: newTitle,
                    content: newContent,
                    excerpt: newExcerpt
                }
            });

            console.log(`✅ Updated: ${post.title} -> ${newTitle}`);
        }

        console.log('🎉 All posts updated successfully!');

    } catch (error) {
        console.error('❌ Error updating posts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateBlogYears();
