require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'sheeshatonight_jwt_secret_key_2024_production_ready_min_32_chars_long';

const results = [];

function record(suite, testName, passed, details = '') {
  results.push({ suite, testName, passed, details });
  const status = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`  ${status} [${suite}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runVerification() {
  console.log('\n======================================================');
  console.log(' STEP 4 & 5: NOTIFICATIONS, ANNOUNCEMENTS & ADMIN APIs');
  console.log('======================================================\n');

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new Error('No admin user found in database');

    const adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    const authHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // ----------------------------------------------------
    // 4.1 Initial Notification Counts Verification
    // ----------------------------------------------------
    console.log('--- 4.1 Initial Notification Counts ---');
    const initRes = await fetch(`${BASE_URL}/api/admin/notifications?page=1&limit=20`, { headers: authHeaders });
    const initJson = await initRes.json();
    const initCounts = initJson.counts;
    record('Notifications', 'Authoritative Counts returned', !!initCounts, `All: ${initCounts?.all}, Unread: ${initCounts?.unread}, Read: ${initCounts?.read}`);
    record('Notifications', 'Math Integrity: All === Unread + Read', initCounts.all === (initCounts.unread + initCounts.read));

    // ----------------------------------------------------
    // 4.2 Tab Isolation Check
    // ----------------------------------------------------
    console.log('\n--- 4.2 Tab Filtering Independence ---');
    const readTabRes = await fetch(`${BASE_URL}/api/admin/notifications?read=true&page=1&limit=20`, { headers: authHeaders });
    const readTabJson = await readTabRes.json();
    record('Notifications', 'Read Tab does NOT overwrite All count', readTabJson.counts.all === initCounts.all, `All remains ${readTabJson.counts.all}`);

    const unreadTabRes = await fetch(`${BASE_URL}/api/admin/notifications?read=false&page=1&limit=20`, { headers: authHeaders });
    const unreadTabJson = await unreadTabRes.json();
    record('Notifications', 'Unread Tab does NOT overwrite All count', unreadTabJson.counts.all === initCounts.all, `All remains ${unreadTabJson.counts.all}`);

    // ----------------------------------------------------
    // 4.3 Controlled Single Notification Mark Read / Unread
    // ----------------------------------------------------
    console.log('\n--- 4.3 Mark as Read / Unread Functionality ---');
    // Create an isolated test notification
    const testNotif = await prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: 'SYSTEM',
        title: `Test Notification ${Date.now()}`,
        message: 'Independent verification test message',
        read: false
      }
    });

    // Mark as read
    const markReadRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ id: testNotif.id, read: true })
    });
    const markReadJson = await markReadRes.json();
    const dbNotifAfterRead = await prisma.notification.findUnique({ where: { id: testNotif.id } });
    record('Notifications', 'Mark Single as Read updates database record', dbNotifAfterRead?.read === true);
    record('Notifications', 'Mark Single as Read updates counts', markReadJson.counts?.read > 0);

    // Mark back as unread
    const markUnreadRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ id: testNotif.id, read: false })
    });
    const dbNotifAfterUnread = await prisma.notification.findUnique({ where: { id: testNotif.id } });
    record('Notifications', 'Mark Single as Unread updates database record', dbNotifAfterUnread?.read === false);

    // Delete test notification
    await prisma.notification.delete({ where: { id: testNotif.id } });

    // ----------------------------------------------------
    // 4.4 Announcement System: Customers, Vendors, Admins
    // ----------------------------------------------------
    console.log('\n--- 4.4 Announcement Targeting & Delivery ---');
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const vendorCount = await prisma.user.count({ where: { role: 'VENDOR' } });
    const adminRoleCount = await prisma.user.count({ where: { role: 'ADMIN' } });

    // 4.4.1 Customer broadcast
    const custTitle = `Customer Broadcast ${Date.now()}`;
    const custRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: custTitle,
        message: 'Exclusive customer update verification',
        targetRole: 'CUSTOMERS',
        type: 'PROMOTION'
      })
    });
    const custJson = await custRes.json();
    const custDbCount = await prisma.notification.count({ where: { title: custTitle } });
    record('Announcements', 'Customer Announcement delivered to all customers', custRes.status === 201 && custDbCount === customerCount, `Sent: ${custDbCount}/${customerCount}`);

    // 4.4.2 Vendor broadcast
    const vendTitle = `Vendor Broadcast ${Date.now()}`;
    const vendRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: vendTitle,
        message: 'Vendor policy update announcement test',
        targetRole: 'VENDORS',
        type: 'SYSTEM'
      })
    });
    const vendJson = await vendRes.json();
    const vendDbCount = await prisma.notification.count({ where: { title: vendTitle } });
    record('Announcements', 'Vendor Announcement delivered to all vendors', vendRes.status === 201 && vendDbCount === vendorCount, `Sent: ${vendDbCount}/${vendorCount}`);

    // 4.4.3 Admin-only broadcast
    const admTitle = `Admin Broadcast ${Date.now()}`;
    const admRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: admTitle,
        message: 'Urgent admin operational security announcement',
        targetRole: 'ADMINS',
        type: 'ALERT'
      })
    });
    const admJson = await admRes.json();
    const admDbCount = await prisma.notification.count({ where: { title: admTitle } });
    record('Announcements', 'Admin Announcement delivered to all admins', admRes.status === 201 && admDbCount === adminRoleCount, `Sent: ${admDbCount}/${adminRoleCount}`);

    // 4.4.4 Duplicate Prevention
    const dupRes = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: admTitle,
        message: 'Urgent admin operational security announcement',
        targetRole: 'ADMINS',
        type: 'ALERT'
      })
    });
    record('Announcements', 'Duplicate announcement blocked with HTTP 409 Conflict', dupRes.status === 409, `Status: ${dupRes.status}`);

    // Cleanup test announcement notifications
    await prisma.notification.deleteMany({
      where: { title: { in: [custTitle, vendTitle, admTitle] } }
    });
    console.log('  🧹 Cleaned up all test announcement notification records');

    // ----------------------------------------------------
    // 5. Complete Admin Module Endpoints Verification
    // ----------------------------------------------------
    console.log('\n--- 5. Admin Dashboard & Marketplace Modules Testing ---');

    // 5.1 Dashboard Stats
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, { headers: authHeaders });
    record('Admin Modules', 'Dashboard KPIs (/api/admin/stats)', statsRes.status === 200, `Status: ${statsRes.status}`);

    // 5.2 Orders
    const ordersRes = await fetch(`${BASE_URL}/api/admin/orders`, { headers: authHeaders });
    record('Admin Modules', 'Order Management (/api/admin/orders)', ordersRes.status === 200, `Status: ${ordersRes.status}`);

    // 5.3 Customers
    const customersRes = await fetch(`${BASE_URL}/api/admin/customers`, { headers: authHeaders });
    record('Admin Modules', 'Customer Directory (/api/admin/customers)', customersRes.status === 200, `Status: ${customersRes.status}`);

    // 5.4 Vendors
    const vendorsRes = await fetch(`${BASE_URL}/api/admin/vendors`, { headers: authHeaders });
    record('Admin Modules', 'Vendor Management (/api/admin/vendors)', vendorsRes.status === 200, `Status: ${vendorsRes.status}`);

    // 5.5 Products
    const productsRes = await fetch(`${BASE_URL}/api/admin/products`, { headers: authHeaders });
    record('Admin Modules', 'Product Catalog (/api/admin/products)', productsRes.status === 200, `Status: ${productsRes.status}`);

    // 5.6 Categories
    const categoriesRes = await fetch(`${BASE_URL}/api/admin/categories`, { headers: authHeaders });
    record('Admin Modules', 'Categories Directory (/api/admin/categories)', categoriesRes.status === 200, `Status: ${categoriesRes.status}`);

    // 5.7 Invoices
    const invoicesRes = await fetch(`${BASE_URL}/api/admin/invoices`, { headers: authHeaders });
    record('Admin Modules', 'Invoices (/api/admin/invoices)', invoicesRes.status === 200, `Status: ${invoicesRes.status}`);

    // 5.8 Settlements
    const settlementsRes = await fetch(`${BASE_URL}/api/admin/settlements`, { headers: authHeaders });
    record('Admin Modules', 'Settlements (/api/admin/settlements)', settlementsRes.status === 200, `Status: ${settlementsRes.status}`);

    // 5.9 CMS Pages
    const pagesRes = await fetch(`${BASE_URL}/api/admin/cms/pages`, { headers: authHeaders });
    record('Admin Modules', 'CMS Pages (/api/admin/cms/pages)', pagesRes.status === 200, `Status: ${pagesRes.status}`);

    // 5.10 Banners
    const bannersRes = await fetch(`${BASE_URL}/api/admin/cms/banners`, { headers: authHeaders });
    record('Admin Modules', 'CMS Banners (/api/admin/cms/banners)', bannersRes.status === 200, `Status: ${bannersRes.status}`);

    // 5.11 Blogs
    const blogsRes = await fetch(`${BASE_URL}/api/admin/cms/blogs`, { headers: authHeaders });
    record('Admin Modules', 'CMS Blogs (/api/admin/cms/blogs)', blogsRes.status === 200, `Status: ${blogsRes.status}`);

    // 5.12 FAQs
    const faqsRes = await fetch(`${BASE_URL}/api/admin/cms/faqs`, { headers: authHeaders });
    record('Admin Modules', 'CMS FAQs (/api/admin/cms/faqs)', faqsRes.status === 200, `Status: ${faqsRes.status}`);

    // 5.13 Media Library
    const mediaRes = await fetch(`${BASE_URL}/api/admin/media`, { headers: authHeaders });
    record('Admin Modules', 'Media Library (/api/admin/media)', mediaRes.status === 200, `Status: ${mediaRes.status}`);

    // 5.14 Audit Logs
    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, { headers: authHeaders });
    record('Admin Modules', 'Audit Logs (/api/admin/audit-logs)', auditRes.status === 200, `Status: ${auditRes.status}`);

    // 5.15 Backup API
    const backupRes = await fetch(`${BASE_URL}/api/admin/backup`, { headers: authHeaders });
    record('Admin Modules', 'Backup API (/api/admin/backup)', backupRes.status === 200, `Status: ${backupRes.status}`);

    // ----------------------------------------------------
    // 5.16 End-to-End CRUD Test on an Admin Module (Category CRUD)
    // ----------------------------------------------------
    console.log('\n--- 5.16 Real Database CRUD Operation Test (Category Lifecycle) ---');
    const timestamp = Date.now();
    const testName = `Test Category ${timestamp}`;
    const slugTest = `test-cat-${timestamp}`;
    const createCatRes = await fetch(`${BASE_URL}/api/admin/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: testName,
        slug: slugTest,
        description: 'Temporary category for CRUD verification',
        icon: 'Flame',
        sortOrder: 99
      })
    });
    const createCatJson = await createCatRes.json();
    const createdCatId = createCatJson.data?.category?.id || createCatJson.category?.id || createCatJson.data?.id;
    record('CRUD Lifecycle', 'Create Category in Live DB', createCatRes.status === 201 && !!createdCatId, `ID: ${createdCatId}`);

    if (createdCatId) {
      // Update
      const updateCatRes = await fetch(`${BASE_URL}/api/admin/categories/${createdCatId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ name: `Updated Cat ${timestamp}` })
      });
      const dbCat = await prisma.category.findUnique({ where: { id: createdCatId } });
      record('CRUD Lifecycle', 'Update Category in Live DB', updateCatRes.status === 200 && dbCat?.name === `Updated Cat ${timestamp}`);

      // Delete
      const deleteCatRes = await fetch(`${BASE_URL}/api/admin/categories/${createdCatId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const dbCatAfter = await prisma.category.findUnique({ where: { id: createdCatId } });
      record('CRUD Lifecycle', 'Delete Category in Live DB', deleteCatRes.status === 200 && !dbCatAfter);
      console.log('  🧹 Cleaned up temporary test category record');
    }

    // Summary
    const total = results.length;
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = total - passedCount;

    console.log('\n======================================================');
    console.log(` SUMMARY: ${passedCount} PASSED | ${failedCount} FAILED out of ${total}`);
    console.log('======================================================\n');

    process.exit(failedCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
