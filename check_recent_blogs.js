const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentBlogs() {
    try {
        // Get last 5 posts created
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true
            }
        });

        console.log('📝 Last 5 Blog Posts:');
        posts.forEach(post => {
            console.log(`- [${post.createdAt.toISOString()}] ${post.title}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRecentBlogs();
