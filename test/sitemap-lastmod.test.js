const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const lm = require('../build/sitemap-lastmod');

const BASE = 'https://screensizechecker.com';
const TODAY = '2026-10-26';
const OLD = '2026-01-01';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'lastmod-'));
}

function page({ title = 'T', desc = 'D', main = 'hello', css = 'a{color:red}', footer = 'foot' } = {}) {
  return `<html><head><title>${title}</title><meta name="description" content="${desc}"><style>${css}</style></head>` +
    `<body><header>nav</header><main class="x">${main}</main><footer>${footer}</footer></body></html>`;
}

function sitemap(paths) {
  return '<?xml version="1.0"?>\n<urlset>\n' + paths.map(p =>
    `    <url>\n        <loc>${BASE}${p}</loc>\n        <lastmod>2099-12-31</lastmod>\n        <changefreq>weekly</changefreq>\n        <priority>0.5</priority>\n    </url>\n`
  ).join('') + '</urlset>';
}

function makeSite(pages) {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap(Object.keys(pages).map(f => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '')))));
  for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(dir, f), html);
  return dir;
}

function prevFile(urls, raw) {
  const f = path.join(tmpDir(), 'prev.json');
  fs.writeFileSync(f, raw !== undefined ? raw : JSON.stringify({ schema: 1, generatedAt: 'x', urls }));
  return f;
}

async function runSite(pages, prevPath) {
  const dir = makeSite(pages);
  const env = prevPath ? { SITEMAP_LASTMOD_PREV: prevPath } : { SITEMAP_LASTMOD_OFFLINE: '1' };
  const res = await lm.run({ dir, env, today: TODAY });
  const xml = fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8');
  const state = JSON.parse(fs.readFileSync(path.join(dir, lm.STATE_FILE), 'utf8'));
  return { dir, res, xml, state };
}

function lastmodOf(xml, p) {
  const re = new RegExp(`<loc>${BASE}${p}</loc>\\s*<lastmod>([^<]*)</lastmod>`);
  return (re.exec(xml) || [])[1];
}

async function silently(fn) {
  const o = [console.log, console.warn];
  console.log = () => {};
  console.warn = () => {};
  try { return await fn(); } finally { [console.log, console.warn] = o; }
}

const tests = {
  'no previous state bootstraps all URLs to today': async () => {
    const { xml, res } = await silently(() => runSite({ 'index.html': page(), 'a.html': page({ main: 'a' }) }));
    assert.strictEqual(lastmodOf(xml, '/'), TODAY);
    assert.strictEqual(lastmodOf(xml, '/a'), TODAY);
    assert.strictEqual(res.stats.added, 2);
  },

  'unchanged content keeps the old date; changed main bumps': async () => {
    const first = await silently(() => runSite({ 'index.html': page(), 'a.html': page({ main: 'a' }) }));
    const urls = JSON.parse(JSON.stringify(first.state.urls));
    for (const u of Object.values(urls)) u.lastmod = OLD;
    const prev = prevFile(urls);
    const { xml, res } = await silently(() => runSite({ 'index.html': page(), 'a.html': page({ main: 'a CHANGED' }) }, prev));
    assert.strictEqual(lastmodOf(xml, '/'), OLD);
    assert.strictEqual(lastmodOf(xml, '/a'), TODAY);
    assert.deepStrictEqual([res.stats.kept, res.stats.bumped, res.stats.added], [1, 1, 0]);
  },

  'title or description change bumps': async () => {
    const first = await silently(() => runSite({ 'a.html': page() }));
    const prev = prevFile(Object.fromEntries(Object.entries(first.state.urls).map(([k, v]) => [k, { ...v, lastmod: OLD }])));
    const t = await silently(() => runSite({ 'a.html': page({ title: 'T2' }) }, prev));
    assert.strictEqual(lastmodOf(t.xml, '/a'), TODAY);
    const d = await silently(() => runSite({ 'a.html': page({ desc: 'D2' }) }, prev));
    assert.strictEqual(lastmodOf(d.xml, '/a'), TODAY);
  },

  'head CSS and footer changes do not bump': async () => {
    const first = await silently(() => runSite({ 'a.html': page() }));
    const prev = prevFile(Object.fromEntries(Object.entries(first.state.urls).map(([k, v]) => [k, { ...v, lastmod: OLD }])));
    const { xml } = await silently(() => runSite({ 'a.html': page({ css: 'a{color:blue}.new{x:y}', footer: 'new footer' }) }, prev));
    assert.strictEqual(lastmodOf(xml, '/a'), OLD);
  },

  'pages without main fall back to body minus header/footer': async () => {
    const noMain = (body, header, footer) => `<html><head><title>T</title></head><body><header>${header}</header>${body}<footer>${footer}</footer></body></html>`;
    const first = await silently(() => runSite({ 'a.html': noMain('content', 'h1', 'f1') }));
    assert.strictEqual(first.res.noMain, 1);
    const prev = prevFile(Object.fromEntries(Object.entries(first.state.urls).map(([k, v]) => [k, { ...v, lastmod: OLD }])));
    const same = await silently(() => runSite({ 'a.html': noMain('content', 'h2', 'f2') }, prev));
    assert.strictEqual(lastmodOf(same.xml, '/a'), OLD);
    const diff = await silently(() => runSite({ 'a.html': noMain('content2', 'h1', 'f1') }, prev));
    assert.strictEqual(lastmodOf(diff.xml, '/a'), TODAY);
  },

  'new URL gets today and removed URL is dropped from state': async () => {
    const first = await silently(() => runSite({ 'index.html': page(), 'gone.html': page({ main: 'g' }) }));
    const prev = prevFile(Object.fromEntries(Object.entries(first.state.urls).map(([k, v]) => [k, { ...v, lastmod: OLD }])));
    const { xml, state, res } = await silently(() => runSite({ 'index.html': page(), 'fresh.html': page({ main: 'f' }) }, prev));
    assert.strictEqual(lastmodOf(xml, '/'), OLD);
    assert.strictEqual(lastmodOf(xml, '/fresh'), TODAY);
    assert.ok(!(`${BASE}/gone` in state.urls));
    assert.ok(`${BASE}/fresh` in state.urls);
    assert.strictEqual(res.stats.added, 1);
  },

  'malformed or wrong-schema previous state bootstraps without throwing': async () => {
    for (const raw of ['{not json', JSON.stringify({ schema: 2, urls: {} }), '[]', 'null']) {
      const { xml } = await silently(() => runSite({ 'a.html': page() }, prevFile(null, raw)));
      assert.strictEqual(lastmodOf(xml, '/a'), TODAY, raw);
    }
  },

  'unreachable remote previous state bootstraps without throwing': async () => {
    const dir = makeSite({ 'a.html': page() });
    const fetcher = async () => { throw new Error('boom'); };
    await silently(() => lm.run({ dir, env: {}, today: TODAY, fetcher }));
    assert.strictEqual(lastmodOf(fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8'), '/a'), TODAY);
  },

  'sitemap URL without an HTML file fails loudly': async () => {
    const dir = makeSite({ 'a.html': page() });
    fs.unlinkSync(path.join(dir, 'a.html'));
    await assert.rejects(() => silently(() => lm.run({ dir, env: { SITEMAP_LASTMOD_OFFLINE: '1' }, today: TODAY })), /no HTML file/);
  },

  'rewrite only touches lastmod values': async () => {
    const xml = sitemap(['/', '/a']);
    const out = lm.rewriteSitemap(xml, { [`${BASE}/`]: OLD, [`${BASE}/a`]: TODAY });
    assert.strictEqual(out, xml.replace('2099-12-31', OLD).replace('2099-12-31', TODAY));
    // unknown loc left alone
    assert.strictEqual(lm.rewriteSitemap(xml, {}), xml);
  },

  'state file is sorted and stable apart from generatedAt': async () => {
    const pages = { 'b.html': page({ main: 'b' }), 'a.html': page({ main: 'a' }) };
    const one = await silently(() => runSite(pages));
    const two = await silently(() => runSite(pages));
    assert.deepStrictEqual(Object.keys(one.state.urls), Object.keys(one.state.urls).slice().sort());
    assert.deepStrictEqual(one.state.urls, two.state.urls);
    assert.strictEqual(one.state.schema, 1);
  }
};

async function main() {
  let failed = 0;
  const names = Object.keys(tests);
  for (const name of names) {
    try {
      await tests[name]();
      console.log(`✓ ${name}`);
    } catch (error) {
      failed++;
      console.error(`✗ ${name}`);
      console.error(`  ${error.stack || error.message}`);
    }
  }
  console.log(`\n${names.length - failed}/${names.length} tests passed`);
  if (failed > 0) process.exit(1);
}

main();
