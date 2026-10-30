const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('--- HEAD LINKS & SCRIPTS ---');
    const scripts = body.match(/<script[^>]*>/g) || [];
    const links = body.match(/<link[^>]*>/g) || [];
    const iframes = body.match(/<iframe[^>]*>/g) || [];
    
    console.log('Scripts count:', scripts.length);
    scripts.forEach(s => console.log('  ', s));
    
    console.log('Links count:', links.length);
    links.forEach(l => console.log('  ', l));
    
    console.log('Iframes count:', iframes.length);
    iframes.forEach(i => console.log('  ', i));

    console.log('--- ALL EXTERNAL URLS IN HTML ---');
    const extUrls = body.match(/https?:\/\/[^\s"'<>]+/g) || [];
    const uniqueExt = Array.from(new Set(extUrls));
    console.log('Unique external URLs count:', uniqueExt.length);
    uniqueExt.forEach(u => console.log('  ', u));
  });
});

