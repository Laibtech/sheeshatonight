const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function login(email, password) {
  const postData = JSON.stringify({ email, password });
  const res = await makeRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    postData
  );

  let cookies = [];
  if (res.headers['set-cookie']) {
    cookies = res.headers['set-cookie'].map((c) => c.split(';')[0]);
  }

  let data = {};
  try {
    data = JSON.parse(res.body);
  } catch (e) {}

  return {
    statusCode: res.statusCode,
    cookies: cookies.join('; '),
    user: data.user || null,
    token: data.token || null,
  };
}

async function get(path, cookieStr = '') {
  const headers = {};
  if (cookieStr) {
    headers['Cookie'] = cookieStr;
  }

  return makeRequest({
    hostname: 'localhost',
    port: 3000,
    path,
    method: 'GET',
    headers,
  });
}

async function runTests() {
  console.log('======================================================================');
  console.log('SHEESHATONIGHT ROLE-BASED NAVIGATION & VENDOR REDIRECT VERIFICATION');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST SUITE 1: LOGGED-OUT VISITOR
  console.log('--- Test Suite 1: Logged-Out Visitor ---');
  {
    const home = await get('/');
    assert(home.statusCode === 200, 'Home page (/) returns 200 OK');

    const vendors = await get('/vendors');
    assert(vendors.statusCode === 200, 'Public Vendor Directory (/vendors) returns 200 OK');

    const vendorSupport = await get('/vendor-support');
    assert(vendorSupport.statusCode === 200, 'Public Vendor Support (/vendor-support) returns 200 OK');

    const vendorDashboard = await get('/vendor');
    const isRedirectToLogin =
      vendorDashboard.statusCode === 307 ||
      vendorDashboard.statusCode === 302 ||
      (vendorDashboard.headers['location'] && vendorDashboard.headers['location'].includes('/auth/login'));
    assert(
      isRedirectToLogin,
      `Protected /vendor redirects logged-out user to login (status: ${vendorDashboard.statusCode}, location: ${vendorDashboard.headers['location']})`
    );

    const admin = await get('/admin');
    const isAdminRedirectToLogin =
      admin.statusCode === 307 ||
      admin.statusCode === 302 ||
      (admin.headers['location'] && admin.headers['location'].includes('/auth/login'));
    assert(isAdminRedirectToLogin, 'Protected /admin redirects logged-out user to login');

    const customerDash = await get('/dashboard');
    const isCustomerRedirect =
      customerDash.statusCode === 307 ||
      customerDash.statusCode === 302 ||
      (customerDash.headers['location'] && customerDash.headers['location'].includes('/auth/login'));
    assert(isCustomerRedirect, 'Protected /dashboard redirects logged-out user to login');
  }

  // TEST SUITE 2: LOGGED-IN CUSTOMER
  console.log('\n--- Test Suite 2: Logged-In Customer ---');
  {
    const customerAuth = await login('customer@sheeshatonight.com', 'customer123');
    assert(customerAuth.statusCode === 200 && customerAuth.user, 'Customer login succeeded');
    const cookie = customerAuth.cookies;

    const customerDash = await get('/dashboard', cookie);
    assert(customerDash.statusCode === 200, 'Customer can access /dashboard (status: 200)');

    // CRITICAL: Customer visiting /vendors MUST NOT redirect to /dashboard
    const vendors = await get('/vendors', cookie);
    const notRedirectedToDash =
      vendors.statusCode === 200 &&
      (!vendors.headers['location'] || !vendors.headers['location'].includes('/dashboard'));
    assert(
      notRedirectedToDash,
      `Customer visiting public /vendors gets 200 OK and IS NOT redirected to /dashboard (status: ${vendors.statusCode})`
    );

    // Customer visiting protected /vendor dashboard
    const vendorPortalAttempt = await get('/vendor', cookie);
    // Middleware should NOT silently 307 redirect to /dashboard.
    const notSilentlyRedirected =
      vendorPortalAttempt.statusCode === 200 ||
      (vendorPortalAttempt.headers['location'] && !vendorPortalAttempt.headers['location'].includes('/dashboard'));
    assert(
      notSilentlyRedirected,
      `Customer opening /vendor does NOT get silently redirected to /dashboard (status: ${vendorPortalAttempt.statusCode}, location: ${vendorPortalAttempt.headers['location'] || 'none'})`
    );

    // Customer trying to open /admin should be blocked
    const adminAttempt = await get('/admin', cookie);
    assert(
      adminAttempt.statusCode === 307 || adminAttempt.statusCode === 302,
      `Customer accessing /admin is redirected away (status: ${adminAttempt.statusCode})`
    );
  }

  // TEST SUITE 3: APPROVED VENDOR
  console.log('\n--- Test Suite 3: Approved Vendor ---');
  {
    const vendorAuth = await login('vendor@sheeshatonight.com', 'vendor123');
    assert(vendorAuth.statusCode === 200 && vendorAuth.user, 'Vendor login succeeded');
    const cookie = vendorAuth.cookies;

    const vendorDash = await get('/vendor', cookie);
    assert(vendorDash.statusCode === 200, 'Approved vendor accesses /vendor dashboard (status: 200)');

    const vendorProducts = await get('/vendor/products', cookie);
    assert(vendorProducts.statusCode === 200, 'Approved vendor accesses /vendor/products (status: 200)');

    const vendorsMarket = await get('/vendors', cookie);
    assert(vendorsMarket.statusCode === 200, 'Approved vendor can browse /vendors directory (status: 200)');
  }

  // TEST SUITE 4: ADMIN
  console.log('\n--- Test Suite 4: Admin ---');
  {
    const adminAuth = await login('admin@sheeshatonight.com', 'admin123');
    assert(adminAuth.statusCode === 200 && adminAuth.user, 'Admin login succeeded');
    const cookie = adminAuth.cookies;

    const adminDash = await get('/admin', cookie);
    assert(adminDash.statusCode === 200, 'Admin accesses /admin dashboard (status: 200)');

    const adminVendors = await get('/admin/vendors', cookie);
    assert(adminVendors.statusCode === 200, 'Admin accesses /admin/vendors (status: 200)');
  }

  console.log('\n======================================================================');
  console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');
}

runTests().catch(console.error);
