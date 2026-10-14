const http = require('http');

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
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
    req.write(postData);
    req.end();
  });
}

function getWithCookie(path, cookieHeader) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      `http://localhost:3000${path}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            length: raw.length,
          });
        });
      }
    );
    req.on('error', reject);
  });
}

async function testAuth() {
  console.log('--- TESTING AUTH FLOWS ---');

  // Test 1: Customer Login
  console.log('\n1. Testing Customer Login: customer@sheeshatonight.com');
  const custRes = await postJson('/api/auth/login', {
    email: 'customer@sheeshatonight.com',
    password: 'customer123',
  });
  console.log('Customer Login Status:', custRes.statusCode);
  console.log('Customer Body:', custRes.body.message || custRes.body.user?.role || custRes.body);
  const custCookie = custRes.headers['set-cookie'] ? custRes.headers['set-cookie'].join('; ') : '';
  
  if (custCookie) {
    const dashCheck = await getWithCookie('/dashboard', custCookie);
    console.log('Customer accessing /dashboard status:', dashCheck.statusCode);
  }

  // Test 2: Admin Login
  console.log('\n2. Testing Admin Login: admin@sheeshatonight.com');
  let adminRes = await postJson('/api/auth/login', {
    email: 'admin@sheeshatonight.com',
    password: 'admin123',
  });
  if (adminRes.statusCode !== 200) {
    adminRes = await postJson('/api/auth/login', {
      email: 'admin@sheeshatonight.com',
      password: 'Password123!',
    });
  }
  console.log('Admin Login Status:', adminRes.statusCode);
  console.log('Admin Body:', adminRes.body.message || adminRes.body.user?.role || adminRes.body);
  const adminCookie = adminRes.headers['set-cookie'] ? adminRes.headers['set-cookie'].join('; ') : '';

  if (adminCookie) {
    const adminCheck = await getWithCookie('/admin', adminCookie);
    console.log('Admin accessing /admin status:', adminCheck.statusCode);
  }

  // Test 3: Vendor Login
  console.log('\n3. Testing Vendor Login: vendor@sheeshatonight.com');
  const vendorRes = await postJson('/api/auth/login', {
    email: 'vendor@sheeshatonight.com',
    password: 'vendor123',
  });
  console.log('Vendor Login Status:', vendorRes.statusCode);
  console.log('Vendor Body:', vendorRes.body.message || vendorRes.body.user?.role || vendorRes.body);
  const vendorCookie = vendorRes.headers['set-cookie'] ? vendorRes.headers['set-cookie'].join('; ') : '';

  if (vendorCookie) {
    const vendorCheck = await getWithCookie('/vendor', vendorCookie);
    console.log('Vendor accessing /vendor status:', vendorCheck.statusCode);
  }
}

testAuth().catch(console.error);
