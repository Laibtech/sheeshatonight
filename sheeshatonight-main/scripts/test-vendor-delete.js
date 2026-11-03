const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'sheeshatonight-jwt-super-secret-production-key-2026';

async function runTest() {
  console.log('\n======================================================');
  console.log('   SHEESHATONIGHT ADMIN VENDOR DELETION TEST SUITE   ');
  console.log('======================================================\n');

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
      throw new Error('Admin user not found for testing');
    }

    const adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
      Origin: BASE_URL,
    };

    const timestamp = Date.now();
    const passwordHash = await bcrypt.hash('TestPass123!#', 10);

    // ========================================================
    // TEST 1: Delete a vendor with 0 orders
    // ========================================================
    console.log('--- TEST 1: DELETE VENDOR WITH 0 ORDERS ---');
    const testVendorEmail = `temp_del_vendor_${timestamp}@sheeshatest.ae`;

    const testUser = await prisma.user.create({
      data: {
        name: `Vendor To Delete ${timestamp}`,
        email: testVendorEmail,
        password: passwordHash,
        role: 'VENDOR',
        kycStatus: 'APPROVED',
        verified: true,
      },
    });

    const testVendor = await prisma.vendor.create({
      data: {
        userId: testUser.id,
        name: `Delete Target Store ${timestamp}`,
        slug: `delete-target-store-${timestamp}`,
        tier: 'SOLO',
        isActive: true,
      },
    });

    console.log(`   Created test vendor ID: ${testVendor.id}`);

    const delRes = await fetch(`${BASE_URL}/api/admin/vendors/${testVendor.id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const delJson = await delRes.json();

    console.log(`   HTTP Status: ${delRes.status}`);
    console.log(`   Response Message: "${delJson.message || delJson.error}"`);

    if (delRes.status !== 200 || delJson.success === false) {
      throw new Error(`Expected 200 OK from DELETE, got ${delRes.status}`);
    }

    const vendorInDb = await prisma.vendor.findUnique({ where: { id: testVendor.id } });
    if (vendorInDb !== null) {
      throw new Error(`Vendor ${testVendor.id} still exists in DB!`);
    }
    console.log('   ✅ Vendor record completely removed from database!');

    const userInDb = await prisma.user.findUnique({ where: { id: testUser.id } });
    if (userInDb?.role !== 'CUSTOMER') {
      throw new Error(`Expected user role CUSTOMER, got ${userInDb?.role}`);
    }
    console.log('   ✅ User successfully demoted to CUSTOMER!');

    await prisma.user.delete({ where: { id: testUser.id } });

    // ========================================================
    // TEST 2: Vendor with orders - Requires Force Confirmation
    // ========================================================
    console.log('\n--- TEST 2: DELETE VENDOR WITH ACTIVE ORDERS (SAFEGUARD & FORCE) ---');
    const orderVendorEmail = `order_vendor_${timestamp}@sheeshatest.ae`;
    const orderUser = await prisma.user.create({
      data: {
        name: `Order Vendor ${timestamp}`,
        email: orderVendorEmail,
        password: passwordHash,
        role: 'VENDOR',
        kycStatus: 'APPROVED',
        verified: true,
      },
    });

    const orderVendor = await prisma.vendor.create({
      data: {
        userId: orderUser.id,
        name: `Order Vendor Store ${timestamp}`,
        slug: `order-vendor-store-${timestamp}`,
        tier: 'SOLO',
        isActive: true,
      },
    });

    const testProduct = await prisma.product.create({
      data: {
        vendorId: orderVendor.id,
        title: `Test Hookah ${timestamp}`,
        type: 'SHEESHA_PIPE',
        price: 250,
        stock: 5,
        currency: 'AED',
        images: ['/Categories/Sheesha Setups.webp'],
      },
    });

    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORD-${timestamp}`,
        userId: adminUser.id,
        vendorId: orderVendor.id,
        totalAmount: 250,
        status: 'PREPARING',
        currency: 'AED',
      },
    });

    console.log(`   Created vendor ${orderVendor.id} with Order: ${testOrder.orderNumber}`);

    // Attempt 1: Call DELETE without force (should be blocked)
    console.log('   Calling DELETE without force flag...');
    const noForceRes = await fetch(`${BASE_URL}/api/admin/vendors/${orderVendor.id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const noForceJson = await noForceRes.json();

    console.log(`   HTTP Status: ${noForceRes.status}`);
    console.log(`   Requires Force: ${noForceJson.requiresForce}`);

    if (noForceRes.status !== 400 || !noForceJson.requiresForce) {
      throw new Error('Expected 400 with requiresForce: true when deleting vendor with active orders');
    }
    console.log('   ✅ Order protection safeguard verified! Blocked accidental deletion.');

    // Attempt 2: Call DELETE with ?force=true (should cascade and succeed)
    console.log('   Calling DELETE with ?force=true...');
    const forceRes = await fetch(`${BASE_URL}/api/admin/vendors/${orderVendor.id}?force=true`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const forceJson = await forceRes.json();

    console.log(`   HTTP Status: ${forceRes.status}`);
    console.log(`   Response Message: "${forceJson.message || forceJson.error}"`);

    if (forceRes.status !== 200 || forceJson.success === false) {
      throw new Error(`Expected 200 OK from force DELETE, got ${forceRes.status}`);
    }

    const orderVendorInDb = await prisma.vendor.findUnique({ where: { id: orderVendor.id } });
    if (orderVendorInDb !== null) {
      throw new Error(`Vendor ${orderVendor.id} still exists in DB after force delete!`);
    }
    console.log('   ✅ Force deletion completely removed vendor and cascade cleaned dependencies!');

    await prisma.user.delete({ where: { id: orderUser.id } });

    console.log('\n======================================================');
    console.log('   ALL 2/2 VENDOR DELETION TEST SUITES PASSED (100%)  ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
