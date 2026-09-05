#!/usr/bin/env node
/**
 * Turns docs/redirect-map.csv into the redirect file the host needs.
 *
 * The site is hosted on Hostinger, so `htaccess` is the format in use. It
 * prepends scripts/htaccess-head.conf, which holds the https redirect, the
 * canonical host, the trailing slash rule and the cache headers. The other two
 * formats are kept in case the site ever moves.
 *
 *   npm run redirects:htaccess   ->  public/.htaccess
 *   npm run redirects:netlify    ->  public/_redirects
 *   npm run redirects:vercel     ->  vercel.json
 *
 * Redirects belong on the server, never in a plugin or in JavaScript.
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
  // The rewrite block is generated as a whole so the order is guaranteed:
  // https and canonical host first, then the 301 map, and only afterwards the
  // generic trailing slash rule. The other way round, an old URL such as
  // /our-work would first be sent to /our-work/ and then hit a 404.
  //
  // Anchored RewriteRule, not mod_alias Redirect: Redirect matches by prefix,
  // so a row like /about -> /about/ would match its own target and loop.
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const trimmed = (value) => value.replace(/\/$/, '');

  // A row whose only difference is the trailing slash is left to the generic
  // rule further down. Writing it out here would make the pattern match its
  // own target and loop.
  const slashOnly = rows.filter((r) => trimmed(r.from) === trimmed(r.to));
  const rules = rows
    .filter((r) => trimmed(r.from) !== trimmed(r.to))
    .map((r) => `  RewriteRule "^${escape(trimmed(r.from).replace(/^\//, ''))}/?$" "${r.to}" [R=301,L]`);

  if (slashOnly.length) {
    rules.push(
      `  # ${slashOnly.length} further old URL(s) differ only by the trailing slash`,
      `  # and are covered by the rule below: ${slashOnly.map((r) => r.from).join(', ')}`,
    );
  }

  const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8').trimEnd();

  console.log(read('./htaccess-head.conf'));
  console.log(`
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Force https. No mixed content is allowed on this site.
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

  # Canonical host without www.
  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
  RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

  # 301 map, generated from docs/redirect-map.csv.
${rules.join('\n')}

  # Trailing slash for everything else, so every URL exists in one form only.
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !\\.[a-zA-Z0-9]{2,5}$
  RewriteCond %{REQUEST_URI} !/$
  RewriteRule ^(.*)$ /$1/ [R=301,L]
</IfModule>
`);
  console.log(read('./htaccess-tail.conf'));
}
