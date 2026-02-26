const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'testA@example.com';
    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    });
    console.log(`User ${user.email} promoted to ${user.role}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
