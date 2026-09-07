#!/usr/bin/env node
/**
 * Bundles the built site into one self contained HTML file, so the current
 * state can be looked at without running a server. Navigation inside the
 * preview switches panes; on the real site these are separate pages.
 *
 *   npm run build && npm run preview:single
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = 'dist';
const out = process.argv[2] ?? 'preview.html';

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
  });
}

const css = walk(dist)
  .length && readdirSync(join(dist, '_astro'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(dist, '_astro', f), 'utf8'))
    .join('\n');

const order = [
  '/', '/dental-implants/', '/dental-implants/single-tooth-implant/',
  '/dental-implants/all-on-4/', '/dental-implants/bone-grafting/',
  '/cosmetic-dentistry/', '/general-dentistry/', '/prices/', '/your-first-visit/',
  '/planning-your-trip/', '/second-opinion/', '/aftercare-and-warranty/',
  '/about/', '/reviews/', '/faq/', '/contact/', '/privacy-policy/', '/404.html',
];

const pages = walk(dist)
  .map((file) => {
    const html = readFileSync(file, 'utf8');
    const url = '/' + relative(dist, file).split('\\').join('/').replace(/index\.html$/, '');
    const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) ?? [, ''])[1]
      .replace(/<script[\s\S]*?<\/script>/g, '');
    const schema = [...html.matchAll(/"@type":"([^"]+)"/g)]
      .map((m) => m[1])
      .filter((t, i, a) => a.indexOf(t) === i && !['PostalAddress', 'ListItem', 'Question', 'Answer', 'MedicalProcedureType'].includes(t));
    return {
      url,
      title: (html.match(/<title>([^<]*)<\/title>/) ?? [, url])[1].replace(' | SoftDentalCare Los Algodones', ''),
      description: (html.match(/<meta name="description" content="([^"]*)"/) ?? [, ''])[1],
      // Count only the placeholders that belong to this page. The header and
      // footer repeat on all 18 pages and would otherwise dominate the total.
      todos: (body
        .replace(/<header[\s\S]*?<\/header>/, '')
        .replace(/<footer[\s\S]*?<\/footer>/, '')
        .match(/data-todo=/g) ?? []).length,
      schema,
      body,
    };
  })
  .sort((a, b) => order.indexOf(a.url) - order.indexOf(b.url));

const totalTodos = pages.reduce((sum, p) => sum + p.todos, 0);
const sharedTodos =
  (pages[0].body.match(/data-todo=/g) ?? []).length - pages[0].todos;

const shell = `<title>SoftDentalCare Build Preview</title>
<style>
  :root {
    --rail: #16232c;
    --rail-soft: #263a46;
    --rail-text: #c9d6dd;
    --rail-dim: #7f95a1;
    --accent: #4bbfae;
    --open: #f0b429;
    --page-ground: #6d7b84;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--page-ground);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: var(--rail-text);
  }
  .shell { display: grid; grid-template-columns: minmax(230px, 270px) 1fr; min-height: 100vh; }
  @media (max-width: 860px) { .shell { grid-template-columns: 1fr; } }

  .rail { background: var(--rail); display: flex; flex-direction: column; gap: 20px; padding: 22px 0 32px; }
  .rail header { padding: 0 20px; display: flex; flex-direction: column; gap: 6px; }
  .rail h1 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; color: #fff; }
  .rail .sub { font-size: 12px; line-height: 1.5; color: var(--rail-dim); }
  .count { font-variant-numeric: tabular-nums; color: var(--open); }

  .rail nav { display: flex; flex-direction: column; }
  .rail button {
    display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
    width: 100%; padding: 9px 20px; border: 0; border-left: 3px solid transparent;
    background: none; color: var(--rail-text); font: inherit; font-size: 13px;
    text-align: left; cursor: pointer;
  }
  .rail button:hover { background: var(--rail-soft); }
  .rail button[aria-current="true"] { border-left-color: var(--accent); background: var(--rail-soft); color: #fff; }
  .rail button .path { color: var(--rail-dim); font-size: 11px; display: block; margin-top: 2px; word-break: break-all; }
  .rail button .open { font-variant-numeric: tabular-nums; font-size: 11px; color: var(--open); flex: none; }
  .rail button[aria-current="true"] .path { color: #9fb3bd; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }

  .stage { display: flex; flex-direction: column; min-width: 0; }
  .meta {
    background: var(--rail-soft); padding: 12px 22px; display: flex; flex-wrap: wrap;
    gap: 6px 18px; align-items: baseline; font-size: 12px; border-bottom: 1px solid #0d171e;
  }
  .meta .label { color: var(--rail-dim); text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; }
  .meta code { font-size: 12px; color: #fff; }
  .meta .desc { flex-basis: 100%; color: var(--rail-text); line-height: 1.5; max-width: 72ch; }
  .frame { flex: 1; background: #fff; color: #14202b; overflow-x: auto; }
  .pane[hidden] { display: none; }
  .note { padding: 14px 22px; font-size: 12px; line-height: 1.6; color: var(--rail-dim); background: var(--rail); }
  .note strong { color: var(--rail-text); font-weight: 600; }
</style>
<style>${css}</style>

<div class="shell">
  <aside class="rail">
    <header>
      <h1>SoftDentalCare relaunch</h1>
      <p class="sub">${pages.length} pages built.<br><span class="count">${totalTodos} placeholders</span> waiting on real information, plus ${sharedTodos} in the shared header and footer.</p>
    </header>
    <nav aria-label="Pages">
      ${pages
        .map(
          (p, i) => `<button type="button" data-index="${i}" aria-current="${i === 0}">
        <span>${p.title}<span class="path">${p.url}</span></span>
        ${p.todos ? `<span class="open" title="open placeholders">${p.todos}</span>` : ''}
      </button>`,
        )
        .join('\n      ')}
    </nav>
    <p class="note">Clicking a link inside the page switches panes here. On the live site these are separate URLs.</p>
  </aside>

  <div class="stage">
    <div class="meta">
      <span><span class="label">URL</span> <code id="meta-url"></code></span>
      <span><span class="label">Structured data</span> <code id="meta-schema"></code></span>
      <span class="desc" id="meta-desc"></span>
    </div>
    <div class="frame">
      ${pages
        .map((p, i) => `<div class="pane" data-index="${i}"${i === 0 ? '' : ' hidden'}>${p.body}</div>`)
        .join('\n      ')}
    </div>
  </div>
</div>

<script>
  const data = ${JSON.stringify(pages.map((p) => ({ url: p.url, description: p.description, schema: p.schema })))};
  const buttons = [...document.querySelectorAll('.rail button')];
  const panes = [...document.querySelectorAll('.pane')];

  function show(index) {
    buttons.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
    panes.forEach((p, i) => { p.hidden = i !== index; });
    document.getElementById('meta-url').textContent = data[index].url;
    document.getElementById('meta-schema').textContent = data[index].schema.join(', ') || 'none';
    document.getElementById('meta-desc').textContent = data[index].description;
    document.querySelector('.frame').scrollTop = 0;
    window.scrollTo({ top: 0 });
  }

  buttons.forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.index))));

  // Internal links switch panes instead of navigating away.
  document.querySelector('.frame').addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="/"]');
    if (!link) return;
    const index = data.findIndex((p) => p.url === link.getAttribute('href'));
    if (index === -1) return;
    event.preventDefault();
    show(index);
  });

  show(0);
</script>
`;

writeFileSync(out, shell);
console.log(`${out}: ${pages.length} pages, ${totalTodos} placeholders, ${(shell.length / 1024).toFixed(0)} KB`);
