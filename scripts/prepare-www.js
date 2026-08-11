/**
 * Web dosyalarını Capacitor www/ klasörüne kopyalar (Play Store APK/AAB için).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const COPY_ITEMS = [
  'index.html',
  'style.css',
  'manifest.json',
  'sw.js',
  'privacy.html',
  'robots.txt',
  'sitemap.xml',
  'js',
  'data',
  'ASSETS',
  '.well-known'
];

const SKIP_IN_WWW = new Set(['node_modules', 'www', 'android', '.git', '.github']);

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (SKIP_IN_WWW.has(name)) continue;
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function main() {
  if (fs.existsSync(WWW)) {
    fs.rmSync(WWW, { recursive: true, force: true });
  }
  fs.mkdirSync(WWW, { recursive: true });

  for (const item of COPY_ITEMS) {
    const src = path.join(ROOT, item);
    if (!fs.existsSync(src)) {
      console.warn(`Atlandı (yok): ${item}`);
      continue;
    }
    copyRecursive(src, path.join(WWW, item));
    console.log(`Kopyalandı: ${item}`);
  }

  console.log('\n✅ www/ hazır. Sonraki adım: npm run cap:sync');
}

main();
