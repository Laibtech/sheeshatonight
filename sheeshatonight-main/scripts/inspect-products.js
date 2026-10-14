const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      price: true,
      stock: true,
      isActive: true,
      images: true,
      vendor: { select: { name: true, location: true } },
    },
  });

  console.log(`Found ${products.length} products:`);
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.type}] "${p.title}" - AED ${p.price} (Vendor: ${p.vendor?.name || 'N/A'}, Stock: ${p.stock}, Active: ${p.isActive})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
