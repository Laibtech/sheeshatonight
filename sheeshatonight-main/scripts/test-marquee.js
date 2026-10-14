const http = require('http');

function checkPage(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          hasMarquee: body.includes('vertical-marquee') || body.includes('SheeshaTonight Luxury Highlights'),
        });
      });
    });
  });
}

async function run() {
  console.log('Testing Vertical Marquee presence:');
  const pages = ['/', '/vendors', '/vendor-support', '/shop', '/rentals'];
  for (const page of pages) {
    const res = await checkPage(page);
    console.log(`Page: ${res.path.padEnd(18)} Status: ${res.status} Has Marquee: ${res.hasMarquee ? '✅ YES' : '❌ NO'}`);
  }
}

run().catch(console.error);
