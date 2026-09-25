#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const buildRoot = path.join(repoRoot, 'multilang-build');

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

function resolveRequestPath(urlPathname) {
    const decodedPath = decodeURIComponent(urlPathname);
    if (decodedPath === '/') return path.join(buildRoot, 'index.html');

    const normalizedPath = decodedPath.endsWith('/') ? decodedPath.slice(0, -1) : decodedPath;
    const candidate = path.join(buildRoot, normalizedPath.replace(/^\/+/, ''));
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    if (!path.extname(candidate) && fs.existsSync(`${candidate}.html`)) return `${candidate}.html`;
    return null;
}

function startStaticServer() {
    const contentTypes = {
        '.css': 'text/css; charset=utf-8',
        '.html': 'text/html; charset=utf-8',
        '.ico': 'image/x-icon',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
    };

    const server = http.createServer((request, response) => {
        const filePath = resolveRequestPath(new URL(request.url, 'http://127.0.0.1').pathname);
        if (!filePath) {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Not found');
            return;
        }

        response.writeHead(200, {
            'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
        });
        fs.createReadStream(filePath).pipe(response);
    });

    return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({
        server,
        origin: `http://127.0.0.1:${server.address().port}`
    })));
}

async function preparePage(context, origin, viewport) {
    await context.addInitScript(() => {
        window.__responsiveEvents = [];
        window.gtag = (command, eventName, payload) => {
            if (command === 'event') {
                window.__responsiveEvents.push({ eventName, payload });
            }
        };
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('**/*', route => {
        const hostname = new URL(route.request().url()).hostname;
        return hostname === '127.0.0.1' || hostname === 'localhost'
            ? route.continue()
            : route.abort();
    });

    await page.goto(`${origin}/devices/responsive-tester`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.simulator-section');
    await page.waitForFunction(() => typeof window.initializeSimulator === 'function');
    await page.evaluate(() => {
        const frame = document.getElementById('simulator-frame');
        if (!frame?.style.width) window.initializeSimulator();
    });
    await page.waitForFunction(() => {
        const frame = document.getElementById('simulator-frame');
        const display = document.getElementById('simulator-size-display');
        return frame?.style.width === '1366px' && display?.textContent.includes('1366');
    });
    await page.evaluate(() => {
        if (window.ScreenSizeConsent) {
            window.ScreenSizeConsent.canUseAnalytics = () => true;
        }
    });

    return { page, pageErrors, viewport };
}

async function runDesktopFlow(browser, origin) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const { page, pageErrors } = await preparePage(context, origin, 'desktop');

    try {
        assert.strictEqual(await page.locator('#responsive-checklist-title').textContent(), 'Responsive Testing Checklist');
        assert.strictEqual(await page.locator('.responsive-checklist').locator('li').count(), 6);
        assert.deepStrictEqual(
            await page.locator('.responsive-checklist-links a').evaluateAll(links => links.map(link => link.href)),
            [`${origin}/blog/responsive-debugging-checklist`, `${origin}/blog/viewport-basics`]
        );
        assert.strictEqual(await page.evaluate(() => window.__responsiveEvents?.length || 0), 0, 'initial render must not count as a test start');

        await page.click('.device-buttons button[data-width="375"]');
        assert.strictEqual(await page.$eval('#simulator-size-display', node => node.textContent.includes('375 × 667')), true);
        assert.strictEqual(await page.$eval('#simulator-frame', node => `${node.style.width}|${node.style.height}`), '375px|667px');

        await page.fill('#custom-width', '600');
        await page.fill('#custom-height', '800');
        await page.click('#apply-custom-size');
        assert.strictEqual(await page.$eval('#simulator-frame', node => `${node.style.width}|${node.style.height}`), '600px|800px');

        await page.click('#rotate-device');
        assert.strictEqual(await page.$eval('#simulator-frame', node => `${node.style.width}|${node.style.height}`), '800px|600px');

        await page.fill('#website-url', `${origin}/`);
        await page.click('#load-website');
        assert.strictEqual(await page.$eval('#simulator-frame', node => node.getAttribute('src')), `${origin}/`);

        const events = await page.evaluate(() => window.__responsiveEvents || []);
        const starts = events.filter(event => event.eventName === 'responsive_test_started');
        const previews = events.filter(event => event.eventName === 'tool_result_view');
        assert.strictEqual(starts.length, 1, 'responsive test start must be emitted once per page view');
        assert.strictEqual(starts[0].payload.interaction_source, 'preset');
        assert.ok(previews.some(event => event.payload.viewport_bucket === 'narrow'));
        assert.ok(previews.some(event => event.payload.viewport_bucket === 'custom'));
        assert.ok(previews.some(event => event.payload.viewport_bucket === 'medium'), 'rotate should retain a width-based medium bucket');
        assert.ok(events.every(event => !JSON.stringify(event).includes(origin)), 'analytics must not contain the entered URL');
        assert.deepStrictEqual(pageErrors, [], `desktop page errors: ${pageErrors.join(' | ')}`);
    } finally {
        await context.close();
    }
}

async function runMobileFlow(browser, origin) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const { page, pageErrors } = await preparePage(context, origin, 'mobile');

    try {
        const geometry = await page.evaluate(() => ({
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            checklistWidth: document.querySelector('.responsive-checklist-card').getBoundingClientRect().width
        }));
        assert.ok(geometry.scrollWidth <= geometry.clientWidth, `mobile page overflows: ${JSON.stringify(geometry)}`);
        assert.ok(geometry.checklistWidth <= geometry.clientWidth, `checklist overflows: ${JSON.stringify(geometry)}`);

        await page.fill('#custom-width', '360');
        await page.fill('#custom-height', '720');
        await page.click('#apply-custom-size');
        assert.strictEqual(await page.$eval('#simulator-size-display', node => node.textContent.includes('360 × 720')), true);
        assert.deepStrictEqual(pageErrors, [], `mobile page errors: ${pageErrors.join(' | ')}`);
    } finally {
        await context.close();
    }
}

async function run() {
    const executablePath = resolveBrowserExecutable();
    assert.ok(executablePath, 'Chromium, Chrome, or Edge is required for this test.');
    const { server, origin } = await startStaticServer();
    const browser = await chromium.launch({ executablePath, headless: true });

    try {
        await runDesktopFlow(browser, origin);
        await runMobileFlow(browser, origin);
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }

    console.log('Responsive tester checklist, desktop/mobile interactions, iframe loading, low-cardinality analytics, and internal links passed.');
}

run().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});
