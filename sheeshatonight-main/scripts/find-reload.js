const fs = require('fs');
const path = require('path');

function searchPatterns(dirs) {
  for (const dir of dirs) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        searchPatterns([full]);
      } else if (/\.(tsx|ts|js)$/.test(f.name)) {
        const text = fs.readFileSync(full, 'utf8');
        if (text.includes('window.location') || text.includes('router.refresh') || text.includes('router.replace')) {
          console.log(`FOUND in ${full}`);
          text.split('\n').forEach((l, i) => {
            if (l.includes('window.location') || l.includes('router.refresh') || l.includes('router.replace')) {
              console.log(`  Line ${i+1}: ${l.trim()}`);
            }
          });
        }
      }
    }
  }
}

searchPatterns(['contexts', 'components', 'app']);

