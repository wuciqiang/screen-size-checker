const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const SCHEMA = 1;
const DEFAULT_MAX_URLS = 50;

// Normalization rules: remove build-time noise so two builds of the same commit
// on different days hash identically. Every rule needs a reason.
const NORMALIZATION_RULES = [
  {
    name: 'line-endings',
    // Windows (CRLF) vs Linux (LF) builds must hash the same.
    pattern: /\r\n/g,
    replace: '\n'
  },
  {
    name: 'softwareapplication-dateModified',
    // build/multilang-builder.js sets the WebApplication JSON-LD dateModified to
    // new Date() (the build day) on every page. Anchored to the end of that
    // block's featureList so real per-article dateModified values stay significant.
    pattern: /("User Agent String Display"\s*\],\s*"dateModified":\s*")\d{4}-\d{2}-\d{2}(")/g,
    replace: '$1<BUILD_DATE>$2'
  }
];

function normalizeHtml(html) {
  let out = html;
  for (const rule of NORMALIZATION_RULES) {
    out = out.replace(rule.pattern, rule.replace);
  }
  return out;
}

function hashHtml(html) {
  return crypto.createHash('sha256').update(normalizeHtml(html), 'utf8').digest('hex');
}

function parseSitemapLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].replace(/&amp;/g, '&'));
  }
  return locs;
}

function candidateFiles(urlPath) {
  let p;
  try {
    p = decodeURIComponent(urlPath);
  } catch {
    p = urlPath;
  }
  const rel = p.replace(/^\/+/, '');
  if (rel === '') return ['index.html'];
  if (rel.endsWith('/')) return [rel + 'index.html'];
  return [rel + '.html', rel + '/index.html', rel];
}

function resolveUrlToFile(dir, loc) {
  let parsed;
  try {
    parsed = new URL(loc);
  } catch {
    return null;
  }
  const root = path.resolve(dir);
  for (const c of candidateFiles(parsed.pathname)) {
    const full = path.resolve(root, c);
    if (full !== root && !full.startsWith(root + path.sep)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

function detectCommit(dir) {
  try {
    const f = path.join(dir, 'build-id.txt');
    if (fs.existsSync(f)) {
      const v = fs.readFileSync(f, 'utf8').trim();
      if (v) return v;
    }
  } catch { /* fall through */ }
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function buildManifest({ dir, base }) {
  const sitemapPath = path.join(dir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`sitemap.xml not found in ${dir}`);
  }
  const baseNorm = base.replace(/\/+$/, '');
  const locs = parseSitemapLocs(fs.readFileSync(sitemapPath, 'utf8'));
  const urls = {};
  const unmapped = [];

  for (const loc of locs) {
    const file = resolveUrlToFile(dir, loc);
    if (!file) {
      unmapped.push(loc);
      continue;
    }
    urls[loc] = hashHtml(fs.readFileSync(file, 'utf8'));
  }

  return {
    schema: SCHEMA,
    base: baseNorm,
    generatedAt: new Date().toISOString(),
    commit: detectCommit(dir),
    urls,
    unmapped
  };
}

function loadManifest(file) {
  if (!file || file === 'missing') return null;
  try {
    const m = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!m || m.schema !== SCHEMA || typeof m.base !== 'string' || !m.urls || typeof m.urls !== 'object') {
      return null;
    }
    return m;
  } catch {
    return null;
  }
}

function diffManifests(prev, next, maxUrls = DEFAULT_MAX_URLS) {
  if (!prev || prev.schema !== next.schema || prev.base !== next.base) {
    return {
      mode: 'seed',
      urls: [],
      reason: !prev ? 'no previous manifest' : 'previous manifest has different base/schema'
    };
  }

  const changed = [];
  for (const [url, hash] of Object.entries(next.urls)) {
    if (prev.urls[url] !== hash) changed.push(url);
  }
  for (const url of Object.keys(prev.urls)) {
    if (!(url in next.urls)) changed.push(url);
  }

  if (changed.length === 0) return { mode: 'noop', urls: [] };
  if (changed.length > maxUrls) {
    return {
      mode: 'bulk-skip',
      urls: changed,
      reason: `${changed.length} changed URLs exceeds max-urls ${maxUrls}; likely a sitewide template change, human decision required`
    };
  }
  return { mode: 'submit', urls: changed };
}

function parseCliArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
    const next = argv[++i];
    if (next === undefined) throw new Error(`${arg} requires a value`);
    opts[arg.slice(2)] = next;
  }
  return opts;
}

function need(opts, name) {
  if (!opts[name]) throw new Error(`--${name} is required`);
  return opts[name];
}

function main(argv) {
  const [command, ...rest] = argv;
  const opts = parseCliArgs(rest);

  if (command === 'manifest') {
    const manifest = buildManifest({ dir: need(opts, 'dir'), base: need(opts, 'base') });
    fs.writeFileSync(need(opts, 'out'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(`Manifest: ${Object.keys(manifest.urls).length} URL(s), ${manifest.unmapped.length} unmapped, commit ${manifest.commit}`);
    if (manifest.unmapped.length) {
      console.warn(`Unmapped URLs (no built file found):\n  ${manifest.unmapped.join('\n  ')}`);
    }
    return 0;
  }

  if (command === 'diff') {
    const next = loadManifest(need(opts, 'next'));
    if (!next) throw new Error(`Cannot read next manifest: ${opts.next}`);
    const maxUrls = opts['max-urls'] === undefined ? DEFAULT_MAX_URLS : Number(opts['max-urls']);
    if (!Number.isInteger(maxUrls) || maxUrls < 0) throw new Error('--max-urls must be a non-negative integer');
    const prevArg = need(opts, 'prev');
    const result = diffManifests(loadManifest(prevArg), next, maxUrls);
    fs.writeFileSync(need(opts, 'out'), JSON.stringify(result, null, 2) + '\n');
    console.log(`Changeset mode=${result.mode}, ${result.urls.length} URL(s)`);
    return 0;
  }

  throw new Error('Usage: indexnow-changeset.js manifest|diff [options]');
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  NORMALIZATION_RULES,
  normalizeHtml,
  hashHtml,
  parseSitemapLocs,
  resolveUrlToFile,
  buildManifest,
  loadManifest,
  diffManifests,
  main
};
