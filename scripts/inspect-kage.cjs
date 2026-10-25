const fs = require('fs');
const html = fs.readFileSync('D:\\projects\\techstore\\public\\landing-pages\\kage.html', 'utf8');
const matches = html.match(/secret-pathways-assets\/[^\s"')]+/g) || [];
console.log('Unique asset paths count:', new Set(matches).size);
console.log('Sample asset paths:', Array.from(new Set(matches)).slice(0, 15));
