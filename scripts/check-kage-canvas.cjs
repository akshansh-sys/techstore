const fs = require('fs');
const html = fs.readFileSync('D:\\projects\\techstore\\public\\landing-pages\\kage.html', 'utf8');

const canvasMatch = html.match(/<canvas[^>]*id=["']([^"']+)["'][^>]*>/i);
console.log('Canvas id:', canvasMatch ? canvasMatch[1] : 'not found');
console.log('Has id="gl"?', html.includes('id="gl"'));
console.log('Has id="grain"?', html.includes('id="grain"'));
console.log('Has id="vignette"?', html.includes('id="vignette"'));
console.log('Has preloader id="pre"?', html.includes('id="pre"'));

// Check how canvas is created or in html
const canvasMatches = html.match(/<canvas[\s\S]*?<\/canvas>/gi) || [];
console.log('canvas tags in HTML:', canvasMatches.length);
if (canvasMatches.length === 0) {
  // Check if canvas is created via js or has tag
  const tagMatch = html.match(/<canvas[^>]*>/i);
  console.log('Single canvas tag:', tagMatch ? tagMatch[0] : 'none');
}
