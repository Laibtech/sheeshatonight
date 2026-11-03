const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const livePrisma = new PrismaClient();
const BACKUP_FILE = path.join(__dirname, '..', 'backups', 'backup_2026-11-03T06-03-06-089Z.json');

function parseRecord(record) {
  if (!record || typeof record !== 'object') return record;
  const copy = { ...record };
  for (const [k, v] of Object.entries(copy)) {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
      copy[k] = new Date(v);
    }
  }
  return copy;
}

function parseAll(records) {
  return (records || []).map(parseRecord);
}

async function testRestore() {
  console.log('\n======================================================');
  console.log(' DATABASE BACKUP RESTORATION INDEPENDENT VERIFICATION ');
  console.log('======================================================\n');

  let tempPrisma = null;
  const tempDbName = 'sheeshatonight_restore_test';

  try {
    // 1. Validate source backup file
    if (!fs.existsSync(BACKUP_FILE)) {
      throw new Error(`Backup file not found at ${BACKUP_FILE}`);
    }
    const backupJson = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
    console.log(`[1] Source backup file validated: ${path.basename(BACKUP_FILE)}`);
    console.log(`    Timestamp: ${backupJson.metadata.timestamp}`);
    console.log(`    Total tables in JSON: ${Object.keys(backupJson.tables).length}`);

    // 2. Prepare temporary database URL
    const liveUrl = new URL(process.env.DATABASE_URL);
    const tempUrlObj = new URL(process.env.DATABASE_URL);
    tempUrlObj.pathname = `/${tempDbName}`;
    const tempUrl = tempUrlObj.toString();

    console.log(`\n[2] Target isolated temporary database: ${tempDbName}`);
    console.log(`    Ensuring LIVE database is NEVER modified: ${liveUrl.pathname}`);

    // Recreate clean temporary database on same MariaDB instance
    await livePrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${tempDbName};`);
    await livePrisma.$executeRawUnsafe(`CREATE DATABASE ${tempDbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`    Database ${tempDbName} created successfully.`);

    // 3. Push schema to temporary database
    console.log('\n[3] Pushing Prisma schema to temporary test database...');
    execSync(`node .\\node_modules\\prisma\\build\\index.js db push --accept-data-loss --skip-generate`, {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: tempUrl },
      stdio: 'pipe'
    });
    console.log('    Schema pushed successfully. Tables created in temporary database.');

    // 4. Initialize Prisma client connected to temporary database
    tempPrisma = new PrismaClient({
      datasources: { db: { url: tempUrl } }
    });

    // 5. Restore tables in relational dependency order
    const t = backupJson.tables;
    console.log('\n[4] Restoring records into temporary database in dependency order...');

    if (t.users && t.users.length) {
      await tempPrisma.user.createMany({ data: parseAll(t.users) });
      console.log(`    - Users: ${t.users.length} restored`);
    }

    if (t.categories && t.categories.length) {
      await tempPrisma.category.createMany({ data: parseAll(t.categories) });
      console.log(`    - Categories: ${t.categories.length} restored`);
    }

    if (t.vendors && t.vendors.length) {
      await tempPrisma.vendor.createMany({ data: parseAll(t.vendors) });
      console.log(`    - Vendors: ${t.vendors.length} restored`);
    }

    if (t.vendorDocuments && t.vendorDocuments.length) {
      await tempPrisma.vendorDocument.createMany({ data: parseAll(t.vendorDocuments) });
      console.log(`    - VendorDocuments: ${t.vendorDocuments.length} restored`);
    }

    if (t.products && t.products.length) {
      await tempPrisma.product.createMany({ data: parseAll(t.products) });
      console.log(`    - Products: ${t.products.length} restored`);
    }

    if (t.coupons && t.coupons.length) {
      await tempPrisma.coupon.createMany({ data: parseAll(t.coupons) });
      console.log(`    - Coupons: ${t.coupons.length} restored`);
    }

    if (t.orders && t.orders.length) {
      await tempPrisma.order.createMany({ data: parseAll(t.orders) });
      console.log(`    - Orders: ${t.orders.length} restored`);
    }

    if (t.orderItems && t.orderItems.length) {
      await tempPrisma.orderItem.createMany({ data: parseAll(t.orderItems) });
      console.log(`    - OrderItems: ${t.orderItems.length} restored`);
    }

    if (t.orderTrackings && t.orderTrackings.length) {
      await tempPrisma.orderTracking.createMany({ data: parseAll(t.orderTrackings) });
      console.log(`    - OrderTrackings: ${t.orderTrackings.length} restored`);
    }

    if (t.invoices && t.invoices.length) {
      await tempPrisma.invoice.createMany({ data: parseAll(t.invoices) });
      console.log(`    - Invoices: ${t.invoices.length} restored`);
    }

    if (t.settlements && t.settlements.length) {
      await tempPrisma.settlement.createMany({ data: parseAll(t.settlements) });
      console.log(`    - Settlements: ${t.settlements.length} restored`);
    }

    if (t.addresses && t.addresses.length) {
      await tempPrisma.address.createMany({ data: parseAll(t.addresses) });
      console.log(`    - Addresses: ${t.addresses.length} restored`);
    }

    if (t.carts && t.carts.length) {
      await tempPrisma.cart.createMany({ data: parseAll(t.carts) });
      console.log(`    - Carts: ${t.carts.length} restored`);
    }

    if (t.wishlists && t.wishlists.length) {
      await tempPrisma.wishlist.createMany({ data: parseAll(t.wishlists) });
      console.log(`    - Wishlists: ${t.wishlists.length} restored`);
    }

    if (t.notifications && t.notifications.length) {
      await tempPrisma.notification.createMany({ data: parseAll(t.notifications) });
      console.log(`    - Notifications: ${t.notifications.length} restored`);
    }

    if (t.auditLogs && t.auditLogs.length) {
      await tempPrisma.auditLog.createMany({ data: parseAll(t.auditLogs) });
      console.log(`    - AuditLogs: ${t.auditLogs.length} restored`);
    }

    if (t.reviews && t.reviews.length) {
      await tempPrisma.review.createMany({ data: parseAll(t.reviews) });
      console.log(`    - Reviews: ${t.reviews.length} restored`);
    }

    if (t.cmsBanners && t.cmsBanners.length) {
      await tempPrisma.cmsBanner.createMany({ data: parseAll(t.cmsBanners) });
      console.log(`    - CMSBanners: ${t.cmsBanners.length} restored`);
    }

    if (t.cmsPages && t.cmsPages.length) {
      await tempPrisma.cmsPage.createMany({ data: parseAll(t.cmsPages) });
      console.log(`    - CMSPages: ${t.cmsPages.length} restored`);
    }

    if (t.cmsContents && t.cmsContents.length) {
      await tempPrisma.cmsContent.createMany({ data: parseAll(t.cmsContents) });
      console.log(`    - CMSContents: ${t.cmsContents.length} restored`);
    }

    if (t.platformSettings && t.platformSettings.length) {
      await tempPrisma.platformSetting.createMany({ data: parseAll(t.platformSettings) });
      console.log(`    - PlatformSettings: ${t.platformSettings.length} restored`);
    }

    // 6. Quantitative Verification
    console.log('\n[5] Comparing restored record counts against backup metadata:');
    const actualCounts = {
      users: await tempPrisma.user.count(),
      vendors: await tempPrisma.vendor.count(),
      vendorDocuments: await tempPrisma.vendorDocument.count(),
      products: await tempPrisma.product.count(),
      orders: await tempPrisma.order.count(),
      orderItems: await tempPrisma.orderItem.count(),
      orderTrackings: await tempPrisma.orderTracking.count(),
      invoices: await tempPrisma.invoice.count(),
      settlements: await tempPrisma.settlement.count(),
      addresses: await tempPrisma.address.count(),
      carts: await tempPrisma.cart.count(),
      wishlists: await tempPrisma.wishlist.count(),
      notifications: await tempPrisma.notification.count(),
      auditLogs: await tempPrisma.auditLog.count(),
      categories: await tempPrisma.category.count(),
      coupons: await tempPrisma.coupon.count(),
      reviews: await tempPrisma.review.count(),
      cmsBanners: await tempPrisma.cmsBanner.count(),
      cmsPages: await tempPrisma.cmsPage.count(),
      cmsContents: await tempPrisma.cmsContent.count(),
      platformSettings: await tempPrisma.platformSetting.count()
    };

    let allCountsMatch = true;
    for (const [table, expected] of Object.entries(backupJson.metadata.recordCounts)) {
      const actual = actualCounts[table];
      const match = actual === expected;
      if (!match) allCountsMatch = false;
      const marker = match ? '✅' : '❌';
      console.log(`    ${marker} ${table.padEnd(18)} Expected: ${String(expected).padEnd(4)} Actual: ${actual}`);
    }

    if (!allCountsMatch) {
      throw new Error('Record count mismatch between backup and restored temporary database!');
    }

    // 7. Relational Integrity Checks
    console.log('\n[6] Testing Relational Foreign Key Integrity in restored database...');
    
    // Check 1: Vendor relation to User
    const testVendor = await tempPrisma.vendor.findFirst({ include: { user: true } });
    if (!testVendor || !testVendor.user) {
      throw new Error('Relational check failed: Vendor -> User relation missing or broken');
    }
    console.log(`    ✅ Vendor -> User: Business "${testVendor.businessName}" belongs to User "${testVendor.user.email}"`);

    // Check 2: Order relation to OrderItems and User
    const testOrder = await tempPrisma.order.findFirst({
      where: { items: { some: {} } },
      include: { items: true, user: true, vendor: true }
    });
    if (!testOrder || testOrder.items.length === 0 || !testOrder.user) {
      throw new Error('Relational check failed: Order -> OrderItems / User relation missing');
    }
    console.log(`    ✅ Order -> Items & User: Order #${testOrder.orderNumber} has ${testOrder.items.length} items for Customer "${testOrder.user.email}"`);

    // Check 3: Product relation to Vendor
    const testProduct = await tempPrisma.product.findFirst({
      include: { vendor: true }
    });
    if (!testProduct || !testProduct.vendor) {
      throw new Error('Relational check failed: Product -> Vendor relation missing');
    }
    console.log(`    ✅ Product -> Vendor: "${testProduct.title}" from Vendor "${testProduct.vendor.businessName}"`);

    console.log('\n======================================================');
    console.log(' ✅ RESTORATION TEST RESULT: 100% SUCCESSFUL & VERIFIED');
    console.log('======================================================');

    // 8. Safely cleanup temporary test database
    await tempPrisma.$disconnect();
    tempPrisma = null;

    console.log(`\n[7] Cleaning up temporary database ${tempDbName}...`);
    await livePrisma.$executeRawUnsafe(`DROP DATABASE ${tempDbName};`);
    console.log(`    Temporary database ${tempDbName} dropped cleanly.`);
    console.log(`    LIVE database remained 100% untouched and preserved.\n`);

  } catch (err) {
    console.error('\n❌ Restoration test error:', err);
    process.exit(1);
  } finally {
    if (tempPrisma) await tempPrisma.$disconnect();
    await livePrisma.$disconnect();
  }
}

testRestore();
