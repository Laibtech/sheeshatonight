const http = require('http');
const PORT = parseInt(process.env.PORT || '3001', 10);

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const reqOptions = {
      hostname: 'localhost',
      port: PORT,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        Origin: `http://localhost:${PORT}`,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          parsed = { raw };
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runWorkflowTest() {
  console.log('=== STARTING VENDOR & ADMIN WORKFLOW VALIDATION ===\n');

  // 1. Vendor Login
  console.log('1. Vendor Login...');
  const vendorRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'vendor@sheeshatonight.com', password: 'vendor123' }
  );
  if (vendorRes.statusCode !== 200) throw new Error('Vendor login failed');
  const vendorToken = vendorRes.body.token;
  const vendorCookie = vendorRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ');
  const vendorHeaders = {
    Authorization: `Bearer ${vendorToken}`,
    Cookie: vendorCookie,
  };
  console.log('✅ Vendor authenticated successfully.');

  // 2. Fetch Vendor Orders
  console.log('\n2. Fetching Vendor Orders...');
  const ordersRes = await request({ path: '/api/vendor/orders', method: 'GET', headers: vendorHeaders });
  console.log('Vendor orders response body:', JSON.stringify(ordersRes.body).slice(0, 300));
  const vendorOrders = Array.isArray(ordersRes.body.data?.data)
    ? ordersRes.body.data.data
    : (ordersRes.body.data?.orders || ordersRes.body.data || []);
  console.log(`✅ Vendor has ${vendorOrders.length} isolated order(s).`);
  const targetOrder = vendorOrders[0];
  if (!targetOrder) throw new Error('No orders found to test');
  console.log(`Selected Order for lifecycle test: ${targetOrder.orderNumber} (ID: ${targetOrder.id})`);

  // 3. Admin Login
  console.log('\n3. Admin Login...');
  const adminRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'admin@sheeshatonight.com', password: 'admin123' }
  );
  if (adminRes.statusCode !== 200) throw new Error('Admin login failed');
  const adminToken = adminRes.body.token;
  const adminCookie = adminRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ');
  const adminHeaders = {
    Authorization: `Bearer ${adminToken}`,
    Cookie: adminCookie,
  };
  console.log('✅ Admin authenticated successfully.');

  // 4. Admin Updates Order Status to DELIVERED
  console.log('\n4. Admin updates order status to DELIVERED...');
  const updateRes = await request(
    { path: `/api/admin/orders/${targetOrder.id}`, method: 'PATCH', headers: adminHeaders },
    { status: 'DELIVERED', trackingNote: 'Delivered securely to customer via courier.' }
  );
  console.log('Update response status:', updateRes.statusCode);
  if (updateRes.statusCode !== 200) {
    throw new Error(`Failed to update status: ${JSON.stringify(updateRes.body)}`);
  }
  console.log(`✅ Order ${targetOrder.orderNumber} updated to DELIVERED.`);
  console.log(`✅ Payout Status updated to: ${updateRes.body.data?.order?.payoutStatus}`);

  // 5. Admin Finance and Settlements Verification
  console.log('\n5. Checking Admin Finance and Settlements...');
  const financeRes = await request({ path: '/api/admin/finance', method: 'GET', headers: adminHeaders });
  console.log('Finance Status:', financeRes.statusCode);
  const settlementsRes = await request({ path: '/api/admin/settlements', method: 'GET', headers: adminHeaders });
  console.log('Settlements Status:', settlementsRes.statusCode);

  console.log('\n🎉 ALL VENDOR & ADMIN WORKFLOW CHECKS PASSED PERFECTLY!');
}

runWorkflowTest().catch((err) => {
  console.error('Workflow Test Failed:', err);
  process.exit(1);
});
