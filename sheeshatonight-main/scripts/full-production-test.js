require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'sheeshatonight_jwt_secret_key_2024_production_ready_min_32_chars_long';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' SHEESHATONIGHT PRODUCTION READINESS AUTOMATED SUITE  ');
  console.log('======================================================\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Database Health Check API
    // ----------------------------------------------------
    console.log('TEST SUITE 1: Health Check Endpoint (/api/health)');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200', `Status: ${healthRes.status}`);
    assert(healthData.status === 'Healthy', 'Health reports Healthy status', `Reported: ${healthData.status}`);
    assert(healthData.database.status === 'CONNECTED', 'Database status is CONNECTED', `Engine: ${healthData.database.engine}`);
    assert(healthData.database.latencyMs < 100, 'Database latency is acceptable', `${healthData.database.latencyMs}ms`);
    assert(healthData.database.requiredTablesPresent === true, 'All 10 core tables verified present in DB');

    // ----------------------------------------------------
    // TEST 2: Real Database CRUD & Integrity
    // ----------------------------------------------------
    console.log('\nTEST SUITE 2: Live Database Model Verification');
    const userCount = await prisma.user.count();
    const vendorCount = await prisma.vendor.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const notifCount = await prisma.notification.count();
    const auditCount = await prisma.auditLog.count();

    assert(userCount > 0, `Users table populated`, `Count: ${userCount}`);
    assert(vendorCount > 0, `Vendors table populated`, `Count: ${vendorCount}`);
    assert(productCount > 0, `Products table populated`, `Count: ${productCount}`);
    assert(orderCount > 0, `Orders table populated`, `Count: ${orderCount}`);
    assert(notifCount > 0, `Notifications table populated`, `Count: ${notifCount}`);
    assert(auditCount > 0, `AuditLogs table populated`, `Count: ${auditCount}`);

    // Verify relations
    const sampleOrder = await prisma.order.findFirst({
      include: { items: true, user: true, vendor: true }
    });
    assert(!!sampleOrder, 'Order found with relations', `Order #${sampleOrder?.orderNumber}`);
    assert(sampleOrder.items.length > 0, 'Order has associated line items', `${sampleOrder.items.length} items`);

    // ----------------------------------------------------
    // TEST 3: Authentication & Permissions
    // ----------------------------------------------------
    console.log('\nTEST SUITE 3: Authentication & Role Permissions');
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    assert(!!admin, 'Admin account exists in database', admin?.email);

    const adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Unauthenticated access blocked
    const unauthRes = await fetch(`${BASE_URL}/api/admin/users`);
    assert(unauthRes.status === 401, 'Unauthenticated access to /api/admin/users blocked with 401', `Status: ${unauthRes.status}`);

    // Customer token blocked from Admin API
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    if (customer) {
      const customerToken = jwt.sign(
        { userId: customer.id, email: customer.email, role: 'CUSTOMER' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const custRes = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      assert(custRes.status === 403, 'Customer token blocked from /api/admin/users with 403', `Status: ${custRes.status}`);
    }

    // Admin token granted access
    const adminRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminRes.status === 200, 'Admin token granted access to /api/admin/users', `Status: ${adminRes.status}`);

    // ----------------------------------------------------
    // TEST 4: Notification Tab Counts & State Persistence
    // ----------------------------------------------------
    console.log('\nTEST SUITE 4: Notification Tab Counts & Filtering Logic');
    const notifsAllRes = await fetch(`${BASE_URL}/api/admin/notifications?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const notifsAllData = await notifsAllRes.json();
    const initialCounts = notifsAllData.counts;

    assert(notifsAllRes.status === 200, 'Notifications API GET succeeded');
    assert(typeof initialCounts.all === 'number', 'Authoritative "all" count returned', `All: ${initialCounts.all}`);
    assert(typeof initialCounts.unread === 'number', 'Authoritative "unread" count returned', `Unread: ${initialCounts.unread}`);
    assert(typeof initialCounts.read === 'number', 'Authoritative "read" count returned', `Read: ${initialCounts.read}`);
    assert(initialCounts.all === (initialCounts.unread + initialCounts.read), 'Global math integrity: All === Unread + Read');

    // Filter by read=true tab
    const notifsReadRes = await fetch(`${BASE_URL}/api/admin/notifications?read=true&page=1&limit=20`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const notifsReadData = await notifsReadRes.json();
    assert(
      notifsReadData.counts.all === initialCounts.all,
      'Tab switching preserves ALL count (does NOT reset to 0)',
      `All remains ${notifsReadData.counts.all}`
    );

    // Filter by read=false tab
    const notifsUnreadRes = await fetch(`${BASE_URL}/api/admin/notifications?read=false&page=1&limit=20`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const notifsUnreadData = await notifsUnreadRes.json();
    assert(
      notifsUnreadData.counts.all === initialCounts.all,
      'Unread tab switching preserves ALL count',
      `All remains ${notifsUnreadData.counts.all}`
    );

    // ----------------------------------------------------
    // TEST 5: Complete Announcement Fan-out & Duplicate Defense
    // ----------------------------------------------------
    console.log('\nTEST SUITE 5: Announcement System & Duplicate Prevention');
    const testTitle = `Test Broadcast ${Date.now()}`;
    const testMsg = 'Automated system announcement verification test message.';

    // Send announcement to ADMINS
    const announceRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: testTitle,
        message: testMsg,
        targetRole: 'ADMINS',
        type: 'SYSTEM'
      })
    });
    const announceData = await announceRes.json();
    assert(announceRes.status === 201, 'Announcement dispatch succeeded', `Status: ${announceRes.status}, Sent: ${announceData.recipientCount}`);

    // Immediate duplicate send must be rejected with 409 Conflict
    const dupRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: testTitle,
        message: testMsg,
        targetRole: 'ADMINS',
        type: 'SYSTEM'
      })
    });
    assert(dupRes.status === 409, 'Duplicate announcement within 2 minutes rejected with 409 Conflict', `Status: ${dupRes.status}`);

    // Cleanup the test notification
    const testNotifs = await prisma.notification.findMany({
      where: { title: testTitle }
    });
    if (testNotifs.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: testNotifs.map(n => n.id) } }
      });
      console.log(`  🧹 Cleaned up ${testNotifs.length} automated test notification record(s)`);
    }

    // ----------------------------------------------------
    // TEST 6: Backup Verification API
    // ----------------------------------------------------
    console.log('\nTEST SUITE 6: Database Backup & Verification API');
    const backupRes = await fetch(`${BASE_URL}/api/admin/backup`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const backupJson = await backupRes.json();
    const backupPayload = backupJson.data || backupJson;
    const backupList = backupPayload.backups || [];

    assert(backupRes.status === 200, 'Backup API accessible by Admin', `Status: ${backupRes.status}`);
    assert(backupList.length > 0, 'Verified backup snapshot file detected on disk', `Found ${backupList.length} backup(s)`);

    if (backupList.length > 0) {
      const verifyRes = await fetch(`${BASE_URL}/api/admin/backup?action=verify&file=${backupList[0].fileName}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const verifyJson = await verifyRes.json();
      const verifyData = verifyJson.data || verifyJson;
      assert(verifyData.verified === true, 'Latest backup passed structural integrity verification', `Tables: ${verifyData.tablesPresent?.length}`);
    }

    // Summary
    console.log('\n======================================================');
    console.log(` SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed with unhandled error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
