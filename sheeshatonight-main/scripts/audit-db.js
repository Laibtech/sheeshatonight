const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function s() {
  console.log('Users:', await p.user.count());
  console.log('Vendors:', await p.vendor.count());
  console.log('Products:', await p.product.count());
  console.log('Categories:', await p.category.count());
  console.log('Orders:', await p.order.count());
  console.log('CMS:', await p.cmsContent.count());
  console.log('Coupons:', await p.coupon.count());
  console.log('Reviews:', await p.review.count());
}

s()
  .catch(console.error)
  .finally(() => p.$disconnect());
