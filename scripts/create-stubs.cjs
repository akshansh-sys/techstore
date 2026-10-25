const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const stubs = [
  ['src/shaders/sylva-living-world/sources/inner-green-3d.html', ''],
  ['src/shaders/tidecrest-hero/tidecrestDocument.js', 'export function buildTidecrestDocument() { return ""; }\n'],
  ['src/shaders/meridian-landing-page/meridianDocument.js', 'export function buildMeridianDocument() { return ""; }\n'],
  ['src/shaders/ascii-field/asciiFieldDocuments.js', 'export function buildAsciiFieldDocument() { return ""; }\n'],
  ['src/shaders/betawise-globe/betawiseGlobeDocument.js', 'export function buildBetawiseGlobeDocument() { return ""; }\n'],
  ['src/shaders/axonis-field/axonis-arbor.html', ''],
  ['src/shaders/axonis-field/axonis-vortex.html', ''],
  ['src/shaders/axonis-field/axonis-tide.html', ''],
  ['src/shaders/axonis-field/axonis-dune.html', ''],
  ['src/shaders/nocturne-hero/NocturneScene.ts', 'export const NOCTURNE_TITLES = {};\nexport const NOCTURNE_VARIANTS = [];\nexport function buildNocturneDocument() { return ""; }\n'],
  ['src/shaders/landing-pages/sandboxedPageDocument.ts', 'export function buildSandboxedPageDocument() { return ""; }\n'],
  ['src/shaders/sylva-living-world/SylvaLivingWorldScene.ts', 'export const MAPLE_AUTUMN_STYLE = "";\nexport const SAKURA_SUNSET_STYLE = "";\nexport const SEQUOIA_MIST_STYLE = "";\nexport function applyMapleAutumnVariant() {}\nexport function applySakuraSunsetVariant() {}\nexport function applySequoiaMistVariant() {}\n'],
];

for (const [relPath, content] of stubs) {
  const p = path.join(root, relPath);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('Created stub:', relPath);
}

console.log('All stubs created successfully.');
