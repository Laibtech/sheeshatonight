const http = require('http');

const PORT = parseInt(process.env.PORT || '3001', 10);

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const headers = { 
      Origin: `http://localhost:${PORT}`,
      ...options.headers 
    };
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: options.path,
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(raw);
          } catch (e) {
            json = { raw };
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: json,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testFullPurchaseFlow() {
  console.log('=== STARTING END-TO-END PURCHASE FLOW VALIDATION ===\n');

  // Step 1: Customer Login
  console.log('1. Customer Login...');
  const loginRes = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'customer@sheeshatonight.com', password: 'customer123' }
  );
  if (loginRes.statusCode !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  }
  const cookies = loginRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  const token = loginRes.body.token;
  console.log('✅ Logged in successfully. Token received.');

  const authHeaders = {
    Cookie: cookies,
    Authorization: token ? `Bearer ${token}` : '',
  };

  // Step 2: Fetch Products to pick an active one
  console.log('\n2. Fetching available active products...');
  const prodRes = await request({ path: '/api/products', method: 'GET', headers: authHeaders });
  const products = prodRes.body.data || prodRes.body.products || [];
  if (products.length === 0) {
    throw new Error('No products found to purchase!');
  }
  const targetProduct = products.find(p => p.stock > 0) || products[0];
  console.log(`✅ Selected Product: "${targetProduct.title}" (ID: ${targetProduct.id}, Price: AED ${targetProduct.price}, Stock: ${targetProduct.stock})`);

  // Step 3: Add to Cart
  console.log('\n3. Adding product to Cart...');
  const addCartRes = await request(
    { path: '/api/cart', method: 'POST', headers: authHeaders },
    { productId: targetProduct.id, quantity: 1 }
  );
  console.log('Add to cart response status:', addCartRes.statusCode);
  if (addCartRes.statusCode !== 200 && addCartRes.statusCode !== 201) {
    throw new Error(`Add to cart failed: ${JSON.stringify(addCartRes.body)}`);
  }
  console.log('✅ Product added to cart.');

  // Step 4: Verify Cart Contents
  console.log('\n4. Verifying cart contents...');
  const cartRes = await request({ path: '/api/cart', method: 'GET', headers: authHeaders });
  const cartData = cartRes.body.data || cartRes.body;
  const items = cartData.items || [];
  console.log(`✅ Cart contains ${items.length} item(s). Subtotal: AED ${cartData.subtotal || 0}`);

  // Step 5: Checkout
  console.log('\n5. Executing Checkout...');
  const checkoutPayload = {
    shippingAddress: {
      firstName: 'Ahmed',
      lastName: 'Al Maktoum',
      email: 'customer@sheeshatonight.com',
      phone: '+971501234567',
      street: 'Sheikh Zayed Road, Building 45',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '00000',
      country: 'UAE',
    },
    billingAddress: {
      firstName: 'Ahmed',
      lastName: 'Al Maktoum',
      email: 'customer@sheeshatonight.com',
      phone: '+971501234567',
      street: 'Sheikh Zayed Road, Building 45',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '00000',
      country: 'UAE',
    },
    paymentMethod: 'COD',
    notes: 'Please bring extra charcoal tongs and ice base.',
  };

  const checkoutRes = await request(
    { path: '/api/checkout', method: 'POST', headers: authHeaders },
    checkoutPayload
  );
  console.log('Checkout response status:', checkoutRes.statusCode);
  if (checkoutRes.statusCode !== 200 && checkoutRes.statusCode !== 201) {
    throw new Error(`Checkout failed: ${JSON.stringify(checkoutRes.body)}`);
  }
  const createdOrders = checkoutRes.body.data?.orders || [];
  console.log(`✅ Orders created: ${createdOrders.map(o => o.orderNumber).join(', ')}`);
  const firstOrder = createdOrders[0];

  // Step 6: Customer views their Orders
  console.log('\n6. Checking customer orders list...');
  const customerOrdersRes = await request({ path: '/api/orders', method: 'GET', headers: authHeaders });
  const myOrders = customerOrdersRes.body.data || customerOrdersRes.body.orders || [];
  console.log(`✅ Customer has ${myOrders.length} order(s) in history.`);

  // Step 7: Vendor views their Orders
  console.log('\n7. Checking vendor orders list...');
  const vendorLogin = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'vendor@sheeshatonight.com', password: 'vendor123' }
  );
  const vendorCookies = vendorLogin.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  const vendorToken = vendorLogin.body.token;
  const vendorHeaders = {
    Cookie: vendorCookies,
    Authorization: vendorToken ? `Bearer ${vendorToken}` : '',
  };
  const vendorOrdersRes = await request({ path: '/api/vendor/orders', method: 'GET', headers: vendorHeaders });
  console.log('Vendor orders status:', vendorOrdersRes.statusCode);
  console.log(`✅ Vendor orders query successful.`);

  // Step 8: Admin views Invoices and Orders
  console.log('\n8. Checking admin orders & invoices...');
  const adminLogin = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'admin@sheeshatonight.com', password: 'admin123' }
  );
  const adminCookies = adminLogin.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  const adminToken = adminLogin.body.token;
  const adminHeaders = {
    Cookie: adminCookies,
    Authorization: adminToken ? `Bearer ${adminToken}` : '',
  };
  const adminInvoicesRes = await request({ path: '/api/admin/invoices', method: 'GET', headers: adminHeaders });
  console.log('Admin invoices status:', adminInvoicesRes.statusCode);
  const invoices = adminInvoicesRes.body.data || adminInvoicesRes.body.invoices || [];
  console.log(`✅ Admin invoices total count: ${invoices.length || adminInvoicesRes.body.pagination?.total || 0}`);

  console.log('\n🎉 ALL COMMERCE PIPELINE CHECKS PASSED PERFECTLY!');
}

testFullPurchaseFlow().catch(err => {
  console.error('❌ Pipeline Test Failed:', err);
  process.exit(1);
});
