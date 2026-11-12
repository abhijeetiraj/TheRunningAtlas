// After a build: every internal link and asset in dist/ must point at a file that exists, and every #fragment at an
// id on the target page. Run by `npm run build`. Exits with an error listing what is broken.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name.endsWith('.html')) pages.push(p); } })(DIST);

const ids = new Map();
const idsOf = file => {
  if (!ids.has(file)) ids.set(file, new Set([...fs.readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
  return ids.get(file);
};
const resolve = url => {
  let p = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!p.startsWith(BASE)) return { outside: true };
  p = path.join(DIST, p.slice(BASE.length));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  return { file: p };
};

const bad = [];
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const rel = path.relative(DIST, page);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|blob:|javascript:)/.test(url) || url.startsWith('//')) continue;
    if (url.startsWith('#')) {
      if (url.length > 1 && !idsOf(page).has(decodeURIComponent(url.slice(1)))) bad.push(`${rel}: no element with id ${url}`);
      continue;
    }
    if (!url.startsWith('/')) { bad.push(`${rel}: relative link ${url} (use href() from src/data/site.js)`); continue; }
    const r = resolve(url);
    if (r.outside) continue; // the host site (Jezero Base) checks its own pages
    if (!fs.existsSync(r.file)) { bad.push(`${rel}: ${url} does not exist`); continue; }
    const hash = url.split('#')[1];
    if (hash && r.file.endsWith('.html') && !idsOf(r.file).has(decodeURIComponent(hash))) bad.push(`${rel}: ${url} points at a missing id`);
  }
}
if (bad.length) {
  console.error(`check-links: ${bad.length} broken link${bad.length > 1 ? 's' : ''}\n  ` + [...new Set(bad)].join('\n  '));
  process.exit(1);
}
console.log(`check-links: ${pages.length} pages, every internal link resolves`);
