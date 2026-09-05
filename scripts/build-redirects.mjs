#!/usr/bin/env node
/**
 * Turns docs/redirect-map.csv into the redirect file the chosen host needs.
 * The hosting decision is still open, so all three formats are supported:
 *
 *   node scripts/build-redirects.mjs netlify   > public/_redirects
 *   node scripts/build-redirects.mjs vercel    > vercel.json
 *   node scripts/build-redirects.mjs htaccess  > public/.htaccess
 *
 * Redirects belong on the server or CDN, never in a plugin or in JavaScript.
 */
import { readFileSync } from 'node:fs';

const format = process.argv[2];
if (!['netlify', 'vercel', 'htaccess'].includes(format)) {
  console.error('Usage: build-redirects.mjs <netlify|vercel|htaccess>');
  process.exit(1);
}

const rows = readFileSync(new URL('../docs/redirect-map.csv', import.meta.url), 'utf8')
  .split('\n')
  .filter((line) => line.trim() && !line.startsWith('#'))
  .slice(1) // header
  .map((line) => {
    const [oldUrl, , , , newTarget] = line.split(',');
    return { from: pathOf(oldUrl.trim()), to: newTarget.trim() };
  })
  .filter((row) => row.from && row.to);

function pathOf(value) {
  try {
    return new URL(value).pathname;
  } catch {
    return value.startsWith('/') ? value : '';
  }
}

const missing = rows.filter((row) => !row.to);
if (missing.length) {
  console.error(`${missing.length} old URLs have no target. Fill them in first.`);
  process.exit(1);
}

if (format === 'netlify') {
  console.log(rows.map((r) => `${r.from}  ${r.to}  301!`).join('\n'));
} else if (format === 'vercel') {
  console.log(
    JSON.stringify(
      { redirects: rows.map((r) => ({ source: r.from, destination: r.to, permanent: true })) },
      null,
      2,
    ),
  );
} else {
  console.log('RewriteEngine On');
  console.log(rows.map((r) => `Redirect 301 ${r.from} ${r.to}`).join('\n'));
}
