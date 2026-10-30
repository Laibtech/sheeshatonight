const http = require('http');

async function testAllAdminPages() {
  // Login
  const loginData = JSON.stringify({
    email: 'admin@sheeshatonight.com',
    password: 'Password123!',
  });

  const loginReq = http.request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData),
      },
    },
    (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', async () => {
        const json = JSON.parse(body);
        const token = json.token;
        const cookieHeader = `auth_token=${token}; user_role=ADMIN; user_logged_in=true`;

        const routes = [
          '/',
          '/auth/login',
          '/admin',
          '/admin/cms',
          '/admin/cms/homepage',
          '/admin/cms/banners',
          '/admin/cms/pages',
          '/admin/cms/navigation',
          '/admin/cms/faqs',
          '/admin/cms/blogs',
          '/admin/media',
          '/admin/rentals',
          '/admin/categories',
          '/admin/admin-users',
          '/admin/settings',
        ];

        for (const route of routes) {
          await new Promise((resolve) => {
            const req = http.get(
              {
                hostname: 'localhost',
                port: 3000,
                path: route,
                headers: { Cookie: cookieHeader },
              },
              (r) => {
                let d = '';
                r.on('data', (c) => (d += c));
                r.on('end', () => {
                  console.log(`Route [${route}] -> Status: ${r.statusCode} (length: ${d.length})`);
                  resolve();
                });
              }
            );
            req.on('error', (err) => {
              console.error(`Route [${route}] -> Error:`, err.message);
              resolve();
            });
          });
        }
      });
    }
  );

  loginReq.write(loginData);
  loginReq.end();
}

testAllAdminPages();

