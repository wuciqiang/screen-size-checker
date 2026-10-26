'use strict';
// Gives each sitemap <url> a real <lastmod>: the day its main content last changed,
// not the build day. State (hash + lastmod per URL) is published as /lastmod-state.json
// and read back from the live site on the next build.
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { normalizeHtml, parseSitemapLocs, resolveUrlToFile } = require('./indexnow-changeset');

const SCHEMA = 1;
const STATE_FILE = 'lastmod-state.json';
const FETCH_TIMEOUT_MS = 8000;
const DEFAULT_BASE = 'https://screensizechecker.com';

function utcToday() {
  return new Date().toISOString().split('T')[0];
}

function stripTags(html, tag) {
  return html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
}

// Returns { text, hasMain }. text = title + description + <main> inner HTML
// (fallback: <body> minus header/footer). Head CSS/scripts and footer are excluded on purpose.
function extractContent(html) {
  const norm = normalizeHtml(html);
  const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(norm) || [])[1] || '';
  let desc = '';
  const metaRe = /<meta\b[^>]*>/gi;
  let m;
  while ((m = metaRe.exec(norm)) !== null) {
    if (/\bname\s*=\s*["']description["']/i.test(m[0])) {
      desc = (/\bcontent\s*=\s*"([^"]*)"/i.exec(m[0]) || /\bcontent\s*=\s*'([^']*)'/i.exec(m[0]) || [])[1] || '';
      break;
    }
  }
  const mains = [];
  const mainRe = /<main\b[^>]*>([\s\S]*?)<\/main>/gi;
  while ((m = mainRe.exec(norm)) !== null) mains.push(m[1]);
  const hasMain = mains.length > 0;
  let body;
  if (hasMain) {
    body = mains.join('\n');
  } else {
    const b = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(norm);
    body = stripTags(stripTags(b ? b[1] : norm, 'header'), 'footer');
  }
  return { text: `${title.trim()}\n${desc.trim()}\n${body}`, hasMain };
}

function contentHash(html) {
  const { text, hasMain } = extractContent(html);
  return { hash: crypto.createHash('sha256').update(text, 'utf8').digest('hex'), hasMain };
}

function validPrevState(s) {
  return !!(s && s.schema === SCHEMA && s.urls && typeof s.urls === 'object' && !Array.isArray(s.urls));
}

// hashes: { loc: hash }. Returns { lastmods, stats }.
function computeLastmods(hashes, prev, today) {
  const lastmods = {};
  const stats = { kept: 0, bumped: 0, added: 0 };
  const prevUrls = validPrevState(prev) ? prev.urls : null;
  for (const [loc, hash] of Object.entries(hashes)) {
    const p = prevUrls && prevUrls[loc];
    if (p && p.hash === hash && /^\d{4}-\d{2}-\d{2}$/.test(p.lastmod || '')) {
      lastmods[loc] = p.lastmod;
      stats.kept++;
    } else {
      lastmods[loc] = today;
      if (prevUrls && p) stats.bumped++; else stats.added++;
    }
  }
  return { lastmods, stats };
}

// Replaces only the <lastmod> text inside each <url> block, keyed by that block's <loc>.
function rewriteSitemap(xml, lastmods) {
  return xml.replace(/<url>[\s\S]*?<\/url>/g, block => {
    const lm = /<loc>\s*([^<]+?)\s*<\/loc>/.exec(block);
    if (!lm) return block;
    const date = lastmods[lm[1].replace(/&amp;/g, '&')];
    if (!date) return block;
    return block.replace(/(<lastmod>)[^<]*(<\/lastmod>)/, `$1${date}$2`);
  });
}

function buildState(hashes, lastmods, generatedAt) {
  const urls = {};
  for (const loc of Object.keys(hashes).sort()) {
    urls[loc] = { hash: hashes[loc], lastmod: lastmods[loc] };
  }
  return { schema: SCHEMA, generatedAt, urls };
}

function fetchText(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'sitemap-lastmod-build' } }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout after ${timeoutMs}ms`)));
    req.on('error', reject);
  });
}

// Never throws: any problem means "no previous state" plus a warning.
async function loadPreviousState(env = process.env, fetcher = fetchText) {
  if (env.SITEMAP_LASTMOD_PREV) {
    try {
      const s = JSON.parse(fs.readFileSync(env.SITEMAP_LASTMOD_PREV, 'utf8'));
      if (!validPrevState(s)) throw new Error('wrong schema');
      return s;
    } catch (e) {
      console.warn(`[lastmod] WARNING: cannot use SITEMAP_LASTMOD_PREV (${e.message}); bootstrapping`);
      return null;
    }
  }
  if (env.SITEMAP_LASTMOD_OFFLINE === '1') return null;
  const base = (env.SITE_BASE || DEFAULT_BASE).replace(/\/+$/, '');
  const url = `${base}/${STATE_FILE}`;
  try {
    const s = JSON.parse(await fetcher(url, FETCH_TIMEOUT_MS));
    if (!validPrevState(s)) throw new Error('wrong schema');
    return s;
  } catch (e) {
    console.warn(`[lastmod] WARNING: no usable previous state from ${url} (${e.message}); bootstrapping`);
    return null;
  }
}

async function run({ dir = 'multilang-build', env = process.env, today = utcToday(), fetcher } = {}) {
  const sitemapPath = path.join(dir, 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const hashes = {};
  const unresolved = [];
  let noMain = 0;
  for (const loc of parseSitemapLocs(xml)) {
    const file = resolveUrlToFile(dir, loc);
    if (!file) { unresolved.push(loc); continue; }
    const { hash, hasMain } = contentHash(fs.readFileSync(file, 'utf8'));
    hashes[loc] = hash;
    if (!hasMain) noMain++;
  }
  if (unresolved.length) {
    throw new Error(`${unresolved.length} sitemap URL(s) have no HTML file, e.g. ${unresolved[0]}`);
  }
  const prev = await loadPreviousState(env, fetcher);
  const { lastmods, stats } = computeLastmods(hashes, prev, today);
  const count = Object.keys(hashes).length;
  if (!validPrevState(prev)) {
    console.log(`[lastmod] no previous state, bootstrapping ${count} URLs to ${today}`);
  }
  fs.writeFileSync(sitemapPath, rewriteSitemap(xml, lastmods));
  fs.writeFileSync(
    path.join(dir, STATE_FILE),
    JSON.stringify(buildState(hashes, lastmods, new Date().toISOString()), null, 2) + '\n'
  );
  console.log(`[lastmod] kept ${stats.kept} / bumped ${stats.bumped} / new ${stats.added} (${count} URLs, ${noMain} without <main>)`);
  return { stats, count, noMain };
}

module.exports = {
  extractContent, contentHash, computeLastmods, rewriteSitemap, buildState,
  loadPreviousState, run, STATE_FILE
};

if (require.main === module) {
  run({ dir: process.argv[2] || 'multilang-build' }).catch(err => {
    console.error('[lastmod] FAILED:', err.message);
    process.exit(1);
  });
}
