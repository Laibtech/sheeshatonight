const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Deactivate test entries
  await prisma.product.updateMany({
    where: {
      OR: [
        { title: { contains: 'Est sunt' } },
        { title: 'Hookah', price: 11 },
      ],
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  // Ensure titles are neat
  await prisma.product.updateMany({
    where: { title: 'Sheesha setups ' },
    data: {
      title: 'Premium Sheesha Setup Package',
      description: 'Turnkey sheesha package ready for home or event enjoyment, featuring German engineering and quick-light coconut coals.',
    },
  });

  const active = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { title: true, price: true, type: true },
  });
  console.log(`Now active (${active.length} products):`);
  active.forEach(p => console.log(`- [${p.type}] ${p.title} (AED ${p.price})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
