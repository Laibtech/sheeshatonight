const http = require('http');

http.get('http://localhost:3000/rentals', (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Contains 4.95?:', body.includes('4.95'));
    console.log('Contains (43)?:', body.includes('(43)'));
  });
});
