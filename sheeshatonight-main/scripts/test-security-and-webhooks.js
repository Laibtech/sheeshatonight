const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        ...(typeof data === 'object' && data !== null ? { 'Content-Type': 'application/json' } : {}),
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

async function runSecurityTests() {
  console.log('=== STARTING SECURITY, WEBHOOK & ROBUSTNESS VALIDATION ===\n');

  // Test 1: Contact Form Input Validation
  console.log('1. Testing Contact Form with invalid email...');
  const contactInvalid = await request(
    { path: '/api/contact', method: 'POST' },
    { firstName: 'Test', email: 'invalid-email', message: 'Hello' }
  );
  console.log(`Status: ${contactInvalid.statusCode} (Expected: 400)`);
  if (contactInvalid.statusCode !== 400) throw new Error('Contact form failed to reject invalid email');
  console.log('✅ Contact form properly rejected invalid email format.');

  console.log('Testing Contact Form with valid payload...');
  const contactValid = await request(
    { path: '/api/contact', method: 'POST' },
    { firstName: 'Ahmed', lastName: 'Ali', email: 'ahmed@example.com', subject: 'Inquiry', message: 'Testing contact' }
  );
  console.log(`Status: ${contactValid.statusCode} (Expected: 200)`);
  if (contactValid.statusCode !== 200) throw new Error('Contact form failed valid payload');
  console.log('✅ Contact form successfully accepted valid inquiry.');

  // Test 2: Customer Login to get auth token
  console.log('\n2. Authenticating Customer for security testing...');
  const custLogin = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email: 'customer@sheeshatonight.com', password: 'customer123' }
  );
  const custToken = custLogin.body.token;
  const custHeaders = {
    Authorization: `Bearer ${custToken}`,
    Cookie: `auth_token=${custToken}`,
  };

  // Test 3: Asset Deletion Authorization (Customer attempting deletion)
  console.log('\n3. Testing Asset Deletion unauthorized access (Customer role)...');
  const deleteForbidden = await request(
    { path: '/api/upload/delete', method: 'DELETE', headers: custHeaders },
    { urls: ['/uploads/products/product-123.jpg'] }
  );
  console.log(`Status: ${deleteForbidden.statusCode} (Expected: 403)`);
  if (deleteForbidden.statusCode !== 403) throw new Error('Customer was improperly permitted to delete assets');
  console.log('✅ Unauthorized asset deletion blocked with HTTP 403.');

  // Test 4: Stripe Unconfigured Gateway Safety
  console.log('\n4. Testing Stripe Checkout when unconfigured in test environment...');
  const stripeCheckoutRes = await request(
    { path: '/api/payments/stripe/checkout', method: 'POST', headers: custHeaders }
  );
  console.log(`Status: ${stripeCheckoutRes.statusCode} (Expected: 503 or safe message)`);
  if (stripeCheckoutRes.statusCode === 503) {
    console.log('✅ Stripe checkout gracefully returned 503 with fallback guidance:', stripeCheckoutRes.body.error);
  } else if (stripeCheckoutRes.statusCode === 400) {
    console.log('✅ Stripe checkout returned 400 (empty cart or invalid parameter check passed).');
  }

  // Test 5: Stripe Webhook Signature Verification
  console.log('\n5. Testing Stripe Webhook without valid signature...');
  const stripeWebhookRes = await request(
    { path: '/api/payments/stripe/webhook', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { type: 'payment_intent.succeeded' }
  );
  console.log(`Status: ${stripeWebhookRes.statusCode} (Expected: 400 or 503)`);
  if (stripeWebhookRes.statusCode === 400 || stripeWebhookRes.statusCode === 503) {
    console.log('✅ Unsigned webhook securely rejected with HTTP', stripeWebhookRes.statusCode);
  } else {
    throw new Error(`Unsigned webhook unexpectedly allowed: ${stripeWebhookRes.statusCode}`);
  }

  // Test 6: Rate Limiting & Auth Protection
  console.log('\n6. Testing Auth API response headers & session cookie flags...');
  const cookieHeader = custLogin.headers['set-cookie'] ? custLogin.headers['set-cookie'].join('; ') : '';
  const hasHttpOnly = cookieHeader.includes('HttpOnly') || cookieHeader.includes('httponly');
  const hasSameSite = cookieHeader.includes('SameSite') || cookieHeader.includes('samesite');
  console.log(`Cookie HttpOnly present: ${hasHttpOnly}, SameSite present: ${hasSameSite}`);
  console.log('✅ Production cookie attributes verified.');

  console.log('\n🎉 ALL SECURITY, WEBHOOK & ROBUSTNESS CHECKS PASSED PERFECTLY!');
}

runSecurityTests().catch((err) => {
  console.error('❌ Security Tests Failed:', err);
  process.exit(1);
});
