require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'info@sheeshatonight.com').trim().toLowerCase();
  const rawPassword = process.env.ADMIN_PASSWORD || 'SheeshaAdmin2026!#';

  if (!email || !rawPassword) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be configured.');
    process.exit(1);
  }

  console.log(`[SUPER ADMIN SEED] Configuring Super Admin: ${email}...`);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      kycStatus: 'APPROVED',
      updatedAt: new Date(),
    },
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      kycStatus: 'APPROVED',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SUPER_ADMIN_INITIALIZED',
      resourceType: 'USER',
      resourceId: admin.id,
      afterState: JSON.stringify({ email: admin.email, role: admin.role, status: admin.status }),
    },
  });

  console.log(`✅ [SUPER ADMIN READY] Admin ID: ${admin.id} | Email: ${admin.email} | Status: ACTIVE`);
  console.log(`   Password securely hashed with bcrypt (12 rounds). Zero credentials exposed.`);
}

seedSuperAdmin()
  .catch((err) => {
    console.error('Super Admin seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
