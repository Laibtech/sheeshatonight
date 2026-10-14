const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.cmsBanner.updateMany({
    where: { ctaUrl: '/products' },
    data: { ctaUrl: '/shop' },
  });
  console.log('Updated banners:', updated.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
