const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const farah = await prisma.user.findFirst({
    where: { email: 'farah@gmail.com' },
    include: { vendor: true }
  });

  if (!farah) {
    console.log('Farah user not found!');
    return;
  }

  console.log('Found Farah user:', farah.id);

  // Update user to verified and KYC approved
  await prisma.user.update({
    where: { id: farah.id },
    data: {
      verified: true,
      kycStatus: 'APPROVED',
      status: 'ACTIVE'
    }
  });

  if (farah.vendor) {
    const updatedVendor = await prisma.vendor.update({
      where: { id: farah.vendor.id },
      data: {
        name: 'Farah Luxury Lounge',
        slug: 'farah-luxury-lounge',
        isActive: true,
        tier: 'MASTER',
        description: 'Elite VIP Hookahs, Exclusive Fruit Bowls & Private Event Rentals in Dubai.'
      }
    });
    console.log('Updated Vendor:', updatedVendor);
  } else {
    const newVendor = await prisma.vendor.create({
      data: {
        userId: farah.id,
        name: 'Farah Luxury Lounge',
        slug: 'farah-luxury-lounge',
        isActive: true,
        tier: 'MASTER',
        location: 'Dubai, UAE',
        phone: farah.phone || '+971 50 1323 4567',
        description: 'Elite VIP Hookahs, Exclusive Fruit Bowls & Private Event Rentals in Dubai.'
      }
    });
    console.log('Created Vendor:', newVendor);
  }

  console.log('✅ Successfully polished Farah vendor profile in database!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
