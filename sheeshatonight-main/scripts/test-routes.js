const http = require('http');

const routes = [
  '/',
  '/shop',
  '/browse',
  '/rentals',
  '/stores',
  '/auth/login',
  '/auth/signup',
  '/forgot-password',
  '/cart',
  '/checkout',
  '/order-success',
  '/dashboard',
  '/dashboard/orders',
  '/dashboard/bookings',
  '/dashboard/wishlist',
  '/dashboard/settings',
  '/admin',
  '/admin/products',
  '/admin/vendors',
  '/admin/customers',
  '/admin/orders',
  '/admin/kyc',
  '/admin/payments',
  '/admin/cms',
  '/admin/settings',
  '/vendor',
  '/vendor/products',
  '/vendor/orders',
  '/vendor/earnings',
  '/vendor/settings',
  '/about',
  '/contact',
  '/faqs',
  '/help',
  '/privacy',
  '/terms',
  '/api/health',
  '/api/products',
  '/api/categories',
  '/api/vendors',
  '/api/cms/banners',
  '/api/cms/content/homepage_hero',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          length: data.length,
          contentType: res.headers['content-type'],
        });
      });
    });
    req.on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing routes on http://localhost:3000 ...\n');
  const results = [];
  for (const route of routes) {
    const res = await checkRoute(route);
    results.push(res);
    const status = res.statusCode ? `${res.statusCode}` : 'ERR';
    const tag = res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302 || res.statusCode === 401 ? '✅' : '❌';
    console.log(`${tag} [${status}] ${res.path} (${res.length || 0} bytes) ${res.error ? '- ' + res.error : ''}`);
  }
}

run();
