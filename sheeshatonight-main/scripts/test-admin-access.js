const http = require('http');

async function testAdminPages() {
  // 1. Login
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
      res.on('end', () => {
        const json = JSON.parse(body);
        console.log('Login Result:', json.success, json.message);
        const token = json.token;
        const cookies = res.headers['set-cookie'];
        console.log('Set-Cookies:', cookies);

        // 2. Fetch /admin/cms/navigation with auth cookie
        const cookieHeader = cookies ? cookies.map((c) => c.split(';')[0]).join('; ') : `auth_token=${token}; user_role=ADMIN`;

        http.get(
          {
            hostname: 'localhost',
            port: 3000,
            path: '/admin/cms/navigation',
            headers: {
              Cookie: cookieHeader,
            },
          },
          (adminRes) => {
            console.log('/admin/cms/navigation Status:', adminRes.statusCode);
            console.log('Location (if redirect):', adminRes.headers.location);
            let adminBody = '';
            adminRes.on('data', (c) => (adminBody += c));
            adminRes.on('end', () => {
              console.log('Response length:', adminBody.length);
              if (adminRes.statusCode >= 400 || adminRes.statusCode === 307) {
                console.log('Admin Response Body snippet:', adminBody.slice(0, 300));
              }
            });
          }
        );
      });
    }
  );

  loginReq.write(loginData);
  loginReq.end();
}

testAdminPages();

