require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'sheeshatonight_jwt_secret_key_2024_production_ready_min_32_chars_long';

const results = [];

function record(flow, step, passed, details = '') {
  results.push({ flow, step, passed, details });
  const icon = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`  ${icon} [${flow}] ${step} ${details ? '(' + details + ')' : ''}`);
}

async function runLaunchWorkflows() {
  console.log('\n======================================================');
  console.log(' SHEESHATONIGHT COMPLETE MARKETPLACE REAL-WORLD FLOWS ');
  console.log('======================================================\n');

  const timestamp = Date.now();
  let createdCustomerId = null;
  let createdOrderId = null;
  let createdVendorUserId = null;
  let createdVendorId = null;
  let createdProductId = null;

  try {
    // ========================================================
    // WORKFLOW 1: CUSTOMER END-TO-END JOURNEY
    // ========================================================
    console.log('--- WORKFLOW 1: CUSTOMER JOURNEY ---');
    const custEmail = `customer_launch_${timestamp}@sheeshatest.ae`;
    const custPass = 'LaunchPass2026!#';

    // 1.1 Customer Registration
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
      body: JSON.stringify({
        name: 'Launch Customer',
        email: custEmail,
        password: custPass,
        confirmPassword: custPass,
      }),
    });
    const regJson = await regRes.json();
    record('Customer Flow', '1. Register Account', regRes.status === 201 || regRes.status === 200, `Status: ${regRes.status}`);

    const dbCustomer = await prisma.user.findUnique({ where: { email: custEmail } });
    if (dbCustomer) createdCustomerId = dbCustomer.id;

    // 1.2 Customer Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
      body: JSON.stringify({ email: custEmail, password: custPass }),
    });
    const loginJson = await loginRes.json();
    const customerToken = loginJson.token;
    record('Customer Flow', '2. Authenticate & Issue JWT', loginRes.status === 200 && !!customerToken, `Email: ${custEmail}`);

    const custAuthHeaders = {
      Authorization: `Bearer ${customerToken}`,
      'Content-Type': 'application/json',
      Origin: BASE_URL,
    };

    // 1.3 Browse Products
    const browseRes = await fetch(`${BASE_URL}/api/products?limit=5`);
    const browseJson = await browseRes.json();
    const productList = Array.isArray(browseJson) ? browseJson : browseJson.products || browseJson.data || [];
    const sampleProduct = productList[0];
    record('Customer Flow', '3. Browse Marketplace Catalog', browseRes.status === 200 && productList.length > 0, `Products found: ${productList.length}`);

    // 1.4 Add to Cart
    if (sampleProduct) {
      const cartRes = await fetch(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: custAuthHeaders,
        body: JSON.stringify({ productId: sampleProduct.id, quantity: 1 }),
      });
      record('Customer Flow', '4. Add Product to Cart', cartRes.status === 200 || cartRes.status === 201, `Product: "${sampleProduct.title}"`);
    }

    // 1.5 Place Order (Cash on Delivery / Marketplace order)
    if (sampleProduct && dbCustomer) {
      const orderRes = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: custAuthHeaders,
        body: JSON.stringify({
          items: [{ productId: sampleProduct.id, quantity: 1, price: Number(sampleProduct.price) }],
          shippingAddress: {
            street: 'Downtown Boulevard 12',
            city: 'Dubai',
            country: 'United Arab Emirates',
          },
          paymentMethod: 'CASH_ON_DELIVERY',
          notes: 'Launch verification test order',
        }),
      });
      const orderJson = await orderRes.json();
      const placedOrder = orderJson.data?.order || orderJson.order || orderJson.data;
      if (placedOrder?.id) createdOrderId = placedOrder.id;

      record('Customer Flow', '5. Checkout & Place Order', (orderRes.status === 200 || orderRes.status === 201) && !!createdOrderId, `Order ID: ${createdOrderId}`);

      // 1.6 Track Order
      if (createdOrderId) {
        const trackRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
          headers: custAuthHeaders,
        });
        const trackJson = await trackRes.json();
        record('Customer Flow', '6. Track Placed Order', trackRes.status === 200, `Status: ${trackJson.data?.status || trackJson.status}`);
      }
    }

    // ========================================================
    // WORKFLOW 2: VENDOR APPLICATION & APPROVAL LIFECYCLE
    // ========================================================
    console.log('\n--- WORKFLOW 2: VENDOR LIFECYCLE & APPROVAL ---');
    const vendEmail = `vendor_launch_${timestamp}@sheeshatest.ae`;
    const vendPass = 'VendorPass2026!#';

    // 2.1 Vendor Registration
    const vendRegRes = await fetch(`${BASE_URL}/api/auth/register/vendor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
      body: JSON.stringify({
        firstName: 'Ahmed',
        lastName: 'Al-Mansoor',
        email: vendEmail,
        phone: `+97150${Math.floor(1000000 + Math.random() * 9000000)}`,
        password: vendPass,
        confirmPassword: vendPass,
        businessName: `Al-Mansoor Luxury Sheesha ${timestamp}`,
        businessType: 'Lounge & Retail',
        region: 'Dubai',
      }),
    });
    const vendRegJson = await vendRegRes.json();
    record('Vendor Flow', '1. Register Vendor Store Application', vendRegRes.status === 201 || vendRegRes.status === 200, `Status: ${vendRegRes.status}`);

    const dbVendorUser = await prisma.user.findUnique({
      where: { email: vendEmail },
      include: { vendor: true },
    });
    if (dbVendorUser) {
      createdVendorUserId = dbVendorUser.id;
      createdVendorId = dbVendorUser.vendor?.id;
    }

    record('Vendor Flow', '2. Verify Application Stored as PENDING', dbVendorUser?.kycStatus === 'PENDING' && dbVendorUser?.vendor?.isActive === false, `KYC: ${dbVendorUser?.kycStatus}, Active: ${dbVendorUser?.vendor?.isActive}`);

    // 2.2 Pending Vendor blocked from vendor management API
    const vendToken = jwt.sign(
      { userId: createdVendorUserId, email: vendEmail, role: 'VENDOR', vendorId: createdVendorId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const blockedRes = await fetch(`${BASE_URL}/api/vendor/dashboard`, {
      headers: { Authorization: `Bearer ${vendToken}` },
    });
    record('Vendor Flow', '3. Pending Vendor Blocked from Dashboard API (403)', blockedRes.status === 403, `Status: ${blockedRes.status}`);

    // 2.3 Admin Reviews and Approves Vendor
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
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

    if (createdVendorId) {
      const approveRes = await fetch(`${BASE_URL}/api/admin/vendors/${createdVendorId}`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ action: 'approve' }),
      });
      const approveJson = await approveRes.json();
      record('Vendor Flow', '4. Admin Approves Vendor Store Application', approveRes.status === 200, `Msg: "${approveJson.message}"`);

      // 2.4 Verify Activation in Database
      const dbVendorAfter = await prisma.vendor.findUnique({
        where: { id: createdVendorId },
        include: { user: true },
      });
      record('Vendor Flow', '5. Vendor Access Activated in DB', dbVendorAfter?.isActive === true && dbVendorAfter?.user?.kycStatus === 'APPROVED', `KYC: ${dbVendorAfter?.user?.kycStatus}, Active: ${dbVendorAfter?.isActive}`);

      // 2.5 Approved Vendor now accesses vendor dashboard
      const allowedRes = await fetch(`${BASE_URL}/api/vendor/dashboard`, {
        headers: { Authorization: `Bearer ${vendToken}` },
      });
      record('Vendor Flow', '6. Approved Vendor Accesses Vendor Dashboard (200 OK)', allowedRes.status === 200, `Status: ${allowedRes.status}`);

      // 2.6 Approved Vendor adds a product
      const addProdRes = await fetch(`${BASE_URL}/api/vendor/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vendToken}`,
          'Content-Type': 'application/json',
          Origin: BASE_URL,
        },
        body: JSON.stringify({
          title: `Gold Khalil Mamoon Edition ${timestamp}`,
          description: 'Handcrafted Egyptian luxury brass sheesha',
          price: 450,
          stock: 10,
          type: 'SHEESHA_PIPE',
          currency: 'AED',
          images: ['/Categories/Sheesha Setups.webp'],
        }),
      });
      const addProdJson = await addProdRes.json();
      const newProd = addProdJson.data?.product || addProdJson.product || addProdJson.data;
      if (newProd?.id) createdProductId = newProd.id;
      record('Vendor Flow', '7. Approved Vendor Creates Catalog Product', (addProdRes.status === 200 || addProdRes.status === 201) && !!createdProductId, `Product ID: ${createdProductId}`);
    }

    // ========================================================
    // WORKFLOW 3: ADMIN MARKETPLACE MANAGEMENT
    // ========================================================
    console.log('\n--- WORKFLOW 3: ADMIN MARKETPLACE GOVERNANCE ---');
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, { headers: adminHeaders });
    record('Admin Flow', '1. Real-time Marketplace Revenue & KPIs', statsRes.status === 200);

    const ordersAdminRes = await fetch(`${BASE_URL}/api/admin/orders`, { headers: adminHeaders });
    record('Admin Flow', '2. Live Order Monitoring', ordersAdminRes.status === 200);

    const invoicesAdminRes = await fetch(`${BASE_URL}/api/admin/invoices`, { headers: adminHeaders });
    record('Admin Flow', '3. Tax Invoices & Settlements Audit', invoicesAdminRes.status === 200);

    const cmsRes = await fetch(`${BASE_URL}/api/admin/cms/pages`, { headers: adminHeaders });
    record('Admin Flow', '4. Website CMS Pages Governance', cmsRes.status === 200);

    const notifAdminRes = await fetch(`${BASE_URL}/api/admin/notifications`, { headers: adminHeaders });
    record('Admin Flow', '5. Admin Activity & Broadcast Notifications', notifAdminRes.status === 200);

    // ========================================================
    // CLEANUP AUTOMATED TEST RECORDS
    // ========================================================
    console.log('\n--- CLEANING UP AUTOMATED TEST RECORDS ---');
    if (createdOrderId) {
      await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } });
      await prisma.orderTracking.deleteMany({ where: { orderId: createdOrderId } });
      await prisma.invoice.deleteMany({ where: { orderId: createdOrderId } });
      await prisma.order.delete({ where: { id: createdOrderId } }).catch(() => {});
      console.log(`  🧹 Cleaned test order: ${createdOrderId}`);
    }

    if (createdCustomerId) {
      await prisma.cart.deleteMany({ where: { userId: createdCustomerId } });
      await prisma.user.delete({ where: { id: createdCustomerId } }).catch(() => {});
      console.log(`  🧹 Cleaned test customer: ${createdCustomerId}`);
    }

    if (createdProductId) {
      await prisma.product.delete({ where: { id: createdProductId } }).catch(() => {});
      console.log(`  🧹 Cleaned test product: ${createdProductId}`);
    }

    if (createdVendorUserId) {
      await prisma.notification.deleteMany({ where: { userId: createdVendorUserId } });
      await prisma.vendor.deleteMany({ where: { userId: createdVendorUserId } });
      await prisma.user.delete({ where: { id: createdVendorUserId } }).catch(() => {});
      console.log(`  🧹 Cleaned test vendor user: ${createdVendorUserId}`);
    }

    // Summary
    const total = results.length;
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = total - passedCount;

    console.log('\n======================================================');
    console.log(` WORKFLOW TEST SUMMARY: ${passedCount}/${total} PASSED | ${failedCount} FAILED`);
    console.log('======================================================\n');

    process.exit(failedCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Launch workflow execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runLaunchWorkflows();
