#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const buildRoot = path.join(repoRoot, 'multilang-build');
const translations = JSON.parse(fs.readFileSync(
    path.join(repoRoot, 'locales', 'en', 'translation.json'),
    'utf8'
));

function resolveBrowserExecutable() {
    const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    if (envPath && fs.existsSync(envPath)) return envPath;

    const bundledPath = chromium.executablePath();
    if (bundledPath && fs.existsSync(bundledPath)) return bundledPath;

    const candidates = process.platform === 'win32'
        ? [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        ]
        : ['/usr/bin/google-chrome', '/usr/bin/chromium'];

    return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

function startStaticServer() {
    const server = http.createServer((request, response) => {
        const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
        const relativePath = pathname.replace(/^\/+/, '') || 'devices/compare.html';
        const candidate = path.join(buildRoot, relativePath);
        const filePath = fs.existsSync(candidate) && fs.statSync(candidate).isFile()
            ? candidate
            : `${candidate}.html`;

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Not found');
            return;
        }

        const types = {
            '.css': 'text/css; charset=utf-8',
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8'
        };
        response.writeHead(200, {
            'Content-Type': types[path.extname(filePath)] || 'application/octet-stream'
        });
        fs.createReadStream(filePath).pipe(response);
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => resolve({
            origin: `http://127.0.0.1:${server.address().port}`,
            server
        }));
    });
}

async function run() {
    assert.ok(fs.existsSync(path.join(buildRoot, 'devices', 'compare.html')),
        'multilang-build is missing; run npm run multilang-build first');
    const executablePath = resolveBrowserExecutable();
    assert.ok(executablePath, 'Chromium, Chrome, or Edge is required for this test.');

    const { origin, server } = await startStaticServer();
    const browser = await chromium.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    try {
        await context.addInitScript(englishTranslations => {
            window.__comparisonTranslations = { ...englishTranslations };
            window.i18next = {
                exists: key => Object.prototype.hasOwnProperty.call(window.__comparisonTranslations, key),
                t: (key, options = {}) => Object.prototype.hasOwnProperty.call(window.__comparisonTranslations, key)
                    ? window.__comparisonTranslations[key]
                    : (options.defaultValue || key)
            };
        }, translations);

        const page = await context.newPage();
        await page.route('**/*', route => {
            const hostname = new URL(route.request().url()).hostname;
            return hostname === '127.0.0.1' || hostname === 'localhost'
                ? route.continue()
                : route.abort();
        });
        await page.route('**/js/app.js*', route => route.abort());
        await page.goto(`${origin}/devices/compare.html`, { waitUntil: 'domcontentloaded' });
        await page.addScriptTag({ url: `${origin}/js/screen-comparison-fixed.js` });
        await page.waitForFunction(() => document.getElementById('compare-btn')?.dataset.initialized === 'true');

        await page.click('#compare-btn');
        let result = await page.locator('#comp-actual1').innerText();
        assert.match(result, /11\.11% smaller/, '24-inch comparison should use the English smaller label');
        result = await page.locator('#comp-actual2').innerText();
        assert.match(result, /12\.5% larger/, '27-inch comparison should use the English larger label');

        await page.evaluate(() => { delete window.__comparisonTranslations.smaller; });
        await page.click('#compare-btn');
        result = await page.locator('#comp-actual1').innerText();
        assert.ok(result.includes('\u66f4\u5c0f'), 'a missing translation should retain the caller fallback');
    } finally {
        await context.close();
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }

    console.log('[screen-comparison-localization] dynamic English labels and missing-key fallback passed.');
}

run().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});
