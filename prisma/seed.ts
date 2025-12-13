import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const packages = [
    {
      name: 'Silver',
      price: 799,
      description: 'Basic Affiliate Marketing Course',
      courses: {
        create: [
          { title: 'Affiliate Marketing 101', description: 'Introduction to Affiliate Marketing' },
          { title: 'Social Media Mastery', description: 'How to grow on Instagram' }
        ]
      }
    },
    {
      name: 'Gold',
      price: 1299,
      description: 'Advanced Strategies & Content Creation',
      courses: {
        create: [
          { title: 'Content Creation Blueprint', description: 'Create viral content' },
          { title: 'Facebook Ads Mastery', description: 'Run profitable ads' }
        ]
      }
    },
    {
      name: 'Diamond',
      price: 3899,
      description: 'Complete Digital Marketing Mastery',
      courses: {
        create: [
          { title: 'Digital Marketing Expert', description: 'Full stack digital marketing' },
          { title: 'Public Speaking & Sales', description: 'Master the art of selling' }
        ]
      }
    }
  ]

  for (const pkg of packages) {
    const upsertedPkg = await prisma.package.upsert({
      where: { name: pkg.name },
      update: {},
      create: pkg,
    })
    console.log(`Upserted package: ${upsertedPkg.name}`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
