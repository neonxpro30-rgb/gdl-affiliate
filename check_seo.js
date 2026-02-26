const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSEO() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                title: true,
                slug: true,
                excerpt: true
            }
        });

        console.log('🔍 SEO Inspection (Last 5 Posts):');
        posts.forEach(post => {
            console.log('--------------------------------------------------');
            console.log(`📌 Title:   ${post.title}`);
            console.log(`🔗 Slug:    ${post.slug}`);
            console.log(`📝 Excerpt: ${post.excerpt ? post.excerpt.substring(0, 100) + '...' : '❌ MISSING'}`);

            // Basic Checks
            const titleLength = post.title.length;
            const slugValid = /^[a-z0-9-]+$/.test(post.slug);

            if (titleLength > 60) console.log('⚠️ Warning: Title too long (>60 chars)');
            if (!slugValid) console.log('⚠️ Warning: Slug contains invalid characters');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSEO();
