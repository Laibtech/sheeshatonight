const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== VENDORS ===');
  const vendors = await prisma.vendor.findMany({
    select: { id: true, name: true, slug: true, tier: true, isActive: true, location: true },
  });
  console.log(vendors);

  console.log('\n=== CATEGORIES ===');
  const categories = await prisma.category.findMany();
  console.log(categories);

  console.log('\n=== CMS PAGES ===');
  const pages = await prisma.cmsPage.findMany();
  console.log(pages.map(p => ({ slug: p.slug, title: p.title, isPublished: p.isPublished })));

  console.log('\n=== CMS BANNERS ===');
  const banners = await prisma.cmsBanner.findMany();
  console.log(banners);

  console.log('\n=== CMS CONTENT ===');
  const content = await prisma.cmsContent.findMany();
  console.log(content.map(c => c.key));

  console.log('\n=== PLATFORM SETTINGS ===');
  const settings = await prisma.platformSetting.findMany();
  console.log(settings);

  console.log('\n=== COUPONS ===');
  const coupons = await prisma.coupon.findMany();
  console.log(coupons);
}

main().catch(console.error).finally(() => prisma.$disconnect());
