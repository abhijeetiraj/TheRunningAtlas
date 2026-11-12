// Copies the atlas, built for Jezero Base (npm run build:jezero), into the base's repository at public/running/,
// where abhijeeti.dev serves it at /running/. The base's own build checks the copy (scripts/check-dist.mjs).
// Usage: npm run publish:jezero -- /path/to/mywebsite   (or set JEZERO_BASE to that path)
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || process.env.JEZERO_BASE;
if (!base) {
  console.error('Give the path to the Jezero Base repository: npm run publish:jezero -- /path/to/mywebsite');
  process.exit(1);
}
const root = path.resolve(base);
for (const f of ['astro.config.mjs', 'site.config.mjs', 'public']) {
  if (!fs.existsSync(path.join(root, f))) {
    console.error(`${root} doesn't look like the Jezero Base repository (no ${f}).`);
    process.exit(1);
  }
}
const dist = path.resolve('dist');
const html = path.join(dist, 'index.html');
if (!fs.existsSync(html) || !fs.readFileSync(html, 'utf8').includes('href="/running/')) {
  console.error('dist/ is not a build for /running/. Run npm run build:jezero first.');
  process.exit(1);
}
const target = path.join(root, 'public', 'running');
fs.rmSync(target, { recursive: true, force: true });
// The base answers missing pages with its own 404 page, so the atlas's isn't copied.
fs.cpSync(dist, target, { recursive: true, filter: (src) => path.relative(dist, src) !== '404.html' });
let files = 0;
const count = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? count(path.join(d, e.name)) : files++));
count(target);
console.log(`Copied the atlas to ${path.relative(process.cwd(), target) || target} (${files} files).`);
