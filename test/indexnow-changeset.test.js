const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cs = require('../build/indexnow-changeset');
const IndexNowSubmitter = require('../build/indexnow-submitter');

const BASE = 'https://screensizechecker.com';
const KEY = '965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'indexnow-cs-'));
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function page(text, date) {
  return `<html><body><p>${text}</p><script type="application/ld+json">{
  "featureList": [
    "Screen Resolution Detection",
    "User Agent String Display"
  ],
  "dateModified": "${date}"
}</script><script type="application/ld+json">{"@type":"Article","dateModified": "2025-05-15"}</script></body></html>`;
}

function sitemap(paths) {
  return `<?xml version="1.0"?><urlset>${paths.map(p => `<url><loc>${BASE}${p}</loc></url>`).join('')}</urlset>`;
}

// Builds a fixture site; `date` is the simulated build day, `overrides` maps file -> text.
function makeSite(date, overrides = {}) {
  const dir = tmpDir();
  const files = {
    'index.html': 'home',
    'devices/iphone-viewport-sizes.html': 'iphone',
    'de/index.html': 'de home',
    'de/devices/iphone-viewport-sizes.html': 'de iphone',
    'blog/some-post.html': 'post',
    'hub/guide/index.html': 'hub guide'
  };
  const urlPaths = ['/', '/devices/iphone-viewport-sizes', '/de/', '/de/devices/iphone-viewport-sizes', '/blog/some-post', '/hub/guide'];
  for (const [f, t] of Object.entries(files)) {
    write(dir, f, page(overrides[f] || t, date));
  }
  write(dir, 'sitemap.xml', sitemap(urlPaths));
  write(dir, 'build-id.txt', 'abc123\n');
  return dir;
}

function manifestOf(dir) {
  return cs.buildManifest({ dir, base: BASE });
}

function runCli(args) {
  const origLog = console.log;
  console.log = () => {};
  try {
    return cs.main(args);
  } finally {
    console.log = origLog;
  }
}

async function captureConsole(fn) {
  const lines = [];
  const origLog = console.log;
  console.log = (...a) => lines.push(a.join(' '));
  try {
    const result = await fn();
    return { result, lines };
  } finally {
    console.log = origLog;
  }
}

function failingBoundary(calls) {
  return {
    get: async (url) => {
      calls.push({ type: 'get', url });
      return { statusCode: 200, body: KEY };
    },
    post: async (url) => {
      calls.push({ type: 'post', url });
      return { statusCode: 200, body: '' };
    }
  };
}

const tests = {
  'maps root, plain, language-prefixed and directory-index URLs to files': () => {
    const m = manifestOf(makeSite('2026-10-26'));
    assert.deepStrictEqual(Object.keys(m.urls).sort(), [
      `${BASE}/`,
      `${BASE}/blog/some-post`,
      `${BASE}/de/`,
      `${BASE}/de/devices/iphone-viewport-sizes`,
      `${BASE}/devices/iphone-viewport-sizes`,
      `${BASE}/hub/guide`
    ].sort());
    assert.deepStrictEqual(m.unmapped, []);
    assert.strictEqual(m.schema, 1);
    assert.strictEqual(m.base, BASE);
    assert.strictEqual(m.commit, 'abc123');
  },

  'reports URLs without a built file as unmapped': () => {
    const dir = makeSite('2026-10-26');
    write(dir, 'sitemap.xml', sitemap(['/', '/missing-page']));
    const m = manifestOf(dir);
    assert.deepStrictEqual(Object.keys(m.urls), [`${BASE}/`]);
    assert.deepStrictEqual(m.unmapped, [`${BASE}/missing-page`]);
  },

  'does not resolve paths outside the build directory': () => {
    const dir = makeSite('2026-10-26');
    write(dir, 'sitemap.xml', sitemap(['/../../etc/passwd']));
    const m = manifestOf(dir);
    assert.strictEqual(Object.keys(m.urls).length, 0);
    assert.strictEqual(m.unmapped.length, 1);
  },

  'hash is stable across build days for identical content': () => {
    const a = manifestOf(makeSite('2026-10-26'));
    const b = manifestOf(makeSite('2026-11-15'));
    assert.deepStrictEqual(a.urls, b.urls);
  },

  'hash is stable across CRLF vs LF': () => {
    assert.strictEqual(cs.hashHtml('a\r\nb'), cs.hashHtml('a\nb'));
  },

  'real text change alters only that URL hash': () => {
    const a = manifestOf(makeSite('2026-10-26'));
    const b = manifestOf(makeSite('2026-11-15', { 'de/index.html': 'de home EDITED' }));
    const changed = Object.keys(a.urls).filter(u => a.urls[u] !== b.urls[u]);
    assert.deepStrictEqual(changed, [`${BASE}/de/`]);
  },

  'article dateModified change is significant (not normalized)': () => {
    const a = cs.hashHtml('<p>x</p>"dateModified": "2025-05-15"');
    const b = cs.hashHtml('<p>x</p>"dateModified": "2025-06-01"');
    assert.notStrictEqual(a, b);
  },

  'diff seeds when previous manifest is missing': () => {
    const next = manifestOf(makeSite('2026-10-26'));
    assert.deepStrictEqual(cs.diffManifests(null, next).urls, []);
    assert.strictEqual(cs.diffManifests(null, next).mode, 'seed');
  },

  'diff seeds when base or schema differs': () => {
    const next = manifestOf(makeSite('2026-10-26'));
    const other = { ...next, base: 'https://example.com' };
    assert.strictEqual(cs.diffManifests(other, next).mode, 'seed');
    const oldSchema = { ...next, schema: 0 };
    assert.strictEqual(cs.diffManifests(oldSchema, next).mode, 'seed');
  },

  'diff is noop for identical content on different days': () => {
    const prev = manifestOf(makeSite('2026-10-26'));
    const next = manifestOf(makeSite('2026-11-15'));
    assert.deepStrictEqual(cs.diffManifests(prev, next), { mode: 'noop', urls: [] });
  },

  'diff submits new, changed and removed URLs': () => {
    const prev = manifestOf(makeSite('2026-10-26'));
    const next = manifestOf(makeSite('2026-11-15', { 'blog/some-post.html': 'post v2' }));
    next.urls[`${BASE}/brand-new`] = 'h1';
    delete next.urls[`${BASE}/hub/guide`];
    const d = cs.diffManifests(prev, next);
    assert.strictEqual(d.mode, 'submit');
    assert.deepStrictEqual(d.urls.sort(), [`${BASE}/blog/some-post`, `${BASE}/brand-new`, `${BASE}/hub/guide`].sort());
  },

  'diff bulk-skips above max-urls and submits at the limit': () => {
    const prev = { schema: 1, base: BASE, urls: {} };
    const next = { schema: 1, base: BASE, urls: {} };
    for (let i = 0; i < 5; i++) {
      prev.urls[`${BASE}/p${i}`] = 'a';
      next.urls[`${BASE}/p${i}`] = 'b';
    }
    const bulk = cs.diffManifests(prev, next, 4);
    assert.strictEqual(bulk.mode, 'bulk-skip');
    assert.strictEqual(bulk.urls.length, 5);
    assert.ok(bulk.reason.includes('5'));
    assert.strictEqual(cs.diffManifests(prev, next, 5).mode, 'submit');
  },

  'CLI manifest and diff write files; missing prev gives seed': () => {
    const dir = makeSite('2026-10-26');
    const out = tmpDir();
    const m1 = path.join(out, 'm1.json');
    const cset = path.join(out, 'c.json');
    assert.strictEqual(runCli(['manifest', '--dir', dir, '--base', BASE, '--out', m1]), 0);
    assert.strictEqual(runCli(['diff', '--prev', 'missing', '--next', m1, '--out', cset]), 0);
    assert.strictEqual(JSON.parse(fs.readFileSync(cset, 'utf8')).mode, 'seed');
    fs.writeFileSync(path.join(out, 'bad.json'), '{not json');
    runCli(['diff', '--prev', path.join(out, 'bad.json'), '--next', m1, '--out', cset]);
    assert.strictEqual(JSON.parse(fs.readFileSync(cset, 'utf8')).mode, 'seed');
    runCli(['diff', '--prev', m1, '--next', m1, '--out', cset]);
    assert.strictEqual(JSON.parse(fs.readFileSync(cset, 'utf8')).mode, 'noop');
  },

  'submitter --urls-file reads urls and combines with --url': () => {
    const out = tmpDir();
    const f = path.join(out, 'c.json');
    fs.writeFileSync(f, JSON.stringify({ mode: 'submit', urls: [`${BASE}/a`, `${BASE}/b`] }));
    const parsed = new IndexNowSubmitter().parseArgs(['--urls-file', f, '--url', `${BASE}/c`]);
    assert.deepStrictEqual(parsed.urls, [`${BASE}/a`, `${BASE}/b`, `${BASE}/c`]);
    assert.strictEqual(parsed.confirmSubmit, false);
  },

  'submitter --urls-file rejects malformed file': () => {
    const out = tmpDir();
    const f = path.join(out, 'c.json');
    fs.writeFileSync(f, JSON.stringify({ mode: 'noop' }));
    assert.throws(() => new IndexNowSubmitter().parseArgs(['--urls-file', f]), /"urls" array/);
    assert.throws(() => new IndexNowSubmitter().parseArgs(['--urls-file', path.join(out, 'nope.json')]), /Cannot read/);
  },

  'submitter empty urls-file exits 0 with no network, even with --confirm-submit': async () => {
    const out = tmpDir();
    const f = path.join(out, 'c.json');
    fs.writeFileSync(f, JSON.stringify({ mode: 'noop', urls: [] }));
    const calls = [];
    const submitter = new IndexNowSubmitter({ httpBoundary: failingBoundary(calls) });
    const { result, lines } = await captureConsole(() => submitter.run(['--urls-file', f, '--confirm-submit']));
    assert.strictEqual(result, 0);
    assert.strictEqual(calls.length, 0);
    assert.ok(lines.join('\n').includes('Nothing to submit'));
  },

  'submitter --urls-file without --confirm-submit never POSTs (dry run)': async () => {
    const out = tmpDir();
    const f = path.join(out, 'c.json');
    fs.writeFileSync(f, JSON.stringify({ mode: 'submit', urls: [`${BASE}/a`] }));
    const calls = [];
    const submitter = new IndexNowSubmitter({ httpBoundary: failingBoundary(calls) });
    const { lines } = await captureConsole(() => submitter.run(['--urls-file', f]));
    assert.strictEqual(calls.length, 0);
    assert.ok(lines.join('\n').includes(`${BASE}/a`));
  },

  'submitter --urls-file with --confirm-submit posts once': async () => {
    const out = tmpDir();
    const f = path.join(out, 'c.json');
    fs.writeFileSync(f, JSON.stringify({ mode: 'submit', urls: [`${BASE}/a`] }));
    const calls = [];
    const submitter = new IndexNowSubmitter({ httpBoundary: failingBoundary(calls) });
    await captureConsole(() => submitter.run(['--urls-file', f, '--confirm-submit']));
    assert.strictEqual(calls.filter(c => c.type === 'post').length, 1);
  },

  'submitter still requires --url when no urls-file given': () => {
    assert.throws(() => new IndexNowSubmitter().parseArgs([]), /At least one --url/);
  }
};

async function main() {
  let failed = 0;
  const names = Object.keys(tests);

  for (const name of names) {
    try {
      await tests[name]();
      console.log(`ok - ${name}`);
    } catch (error) {
      failed++;
      console.error(`not ok - ${name}`);
      console.error(`  ${error.message}`);
    }
  }

  console.log(`\n${names.length - failed}/${names.length} tests passed`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { tests };
