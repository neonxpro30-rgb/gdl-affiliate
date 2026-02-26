const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSlugs() {
    try {
        console.log('🔄 Fixing Slugs: Replacing 2024/2025 with 2026...');

        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { slug: { contains: '2024' } },
                    { slug: { contains: '2025' } }
                ]
            }
        });

        console.log(`📝 Found ${posts.length} slugs to fix.`);

        for (const post of posts) {
            // Replace years in slug
            let newSlug = post.slug.replace(/2024/g, '2026').replace(/2025/g, '2026');

            // Ensure slug is unique, append a small random string if collision might happen (basic handling)
            // Though replacing year usually keeps uniqueness if title was unique

            try {
                await prisma.post.update({
                    where: { id: post.id },
                    data: { slug: newSlug }
                });
                console.log(`✅ Fixed: ${post.slug} -> ${newSlug}`);
            } catch (e) {
                // Fallback if that slug already exists (rare)
                const randomSuffix = Math.floor(Math.random() * 1000);
                newSlug = `${newSlug}-${randomSuffix}`;
                await prisma.post.update({
                    where: { id: post.id },
                    data: { slug: newSlug }
                });
                console.log(`⚠️ Collision fixed: ${post.slug} -> ${newSlug}`);
            }
        }

        console.log('🎉 Slugs updated for better SEO!');

    } catch (error) {
        console.error('❌ Error fixing slugs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixSlugs();
