#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const buildRoot = path.join(repoRoot, 'multilang-build');

function resolveBrowserExecutable() {
    const bundledPath = chromium.executablePath();
    if (fs.existsSync(bundledPath)) {
        return bundledPath;
    }

    const candidates = process.platform === 'win32'
        ? [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
        ]
        : ['/usr/bin/google-chrome', '/usr/bin/chromium'];

    return candidates.find(candidate => fs.existsSync(candidate));
}

function resolveRequestPath(pathname) {
    if (pathname === '/') {
        return path.join(buildRoot, 'index.html');
    }

    const relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
    const candidate = path.join(buildRoot, relativePath);
    return fs.existsSync(candidate) && fs.statSync(candidate).isFile()
        ? candidate
        : null;
}

function startStaticServer() {
    const server = http.createServer((request, response) => {
        const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
        const filePath = resolveRequestPath(pathname);

        if (!filePath) {
            response.writeHead(404);
            response.end('Not found');
            return;
        }

        const contentTypes = {
            '.css': 'text/css; charset=utf-8',
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.svg': 'image/svg+xml'
        };
        response.writeHead(200, {
            'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream'
        });
        fs.createReadStream(filePath).pipe(response);
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => resolve({
            server,
            origin: `http://127.0.0.1:${server.address().port}`
        }));
    });
}

async function run() {
    const executablePath = resolveBrowserExecutable();
    assert.ok(executablePath, 'Chromium, Chrome, or Edge is required for this test.');

    const { server, origin } = await startStaticServer();
    const browser = await chromium.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const pageErrors = [];

    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('**/*', route => {
        const hostname = new URL(route.request().url()).hostname;
        return hostname === '127.0.0.1' || hostname === 'localhost'
            ? route.continue()
            : route.abort();
    });
    await page.addInitScript(() => {
        window.__clipboardWrites = [];
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: async text => window.__clipboardWrites.push(text)
            }
        });
    });

    try {
        await page.goto(origin, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => /^\d+\s*[x×]\s*\d+$/i.test(
            document.getElementById('viewport-display')?.textContent.trim() || ''
        ));
        await page.waitForFunction(() => {
            const ids = ['viewport-display', 'aspect-ratio', 'dpr'];
            const signature = ids.map(id => document.getElementById(id)?.textContent.trim()).join('|');
            if (/detect|fail|检测/i.test(signature)) {
                window.__copyReadySignature = '';
                return false;
            }
            if (window.__copyReadySignature !== signature) {
                window.__copyReadySignature = signature;
                window.__copyReadySince = performance.now();
                return false;
            }
            return performance.now() - window.__copyReadySince >= 250;
        });
        await page.evaluate(() => {
            window.__copyEvents = [];
            window.ScreenSizeAnalytics = {
                trackCopy: payload => window.__copyEvents.push(payload)
            };
        });

        const directCopyIds = [
            'viewport-display',
            'screen-resolution-display',
            'aspect-ratio',
            'dpr',
            'color-depth',
            'os-info',
            'browser-info',
            'cookies-enabled',
            'touch-support'
        ];
        const semantics = await page.evaluate(ids => ids.map(id => {
            const element = document.getElementById(id);
            return {
                id,
                tagName: element?.tagName,
                target: element?.getAttribute('data-clipboard-target'),
                text: element?.textContent.trim()
            };
        }), directCopyIds);

        for (const item of semantics) {
            assert.strictEqual(item.tagName, 'BUTTON', `${item.id} should be a button`);
            assert.strictEqual(item.target, item.id, `${item.id} should copy itself`);
        }

        const expectedWrites = [];
        expectedWrites.push(await page.$eval('#viewport-display', element => element.textContent.trim()));
        await page.click('#viewport-display');
        expectedWrites.push(await page.$eval('#aspect-ratio', element => element.textContent.trim()));
        await page.focus('#aspect-ratio');
        await page.keyboard.press('Enter');
        expectedWrites.push(await page.$eval('#dpr', element => element.textContent.trim()));
        await page.click('.copy-btn[data-clipboard-target="dpr"]');

        const result = await page.evaluate(() => ({
            writes: window.__clipboardWrites,
            events: window.__copyEvents
        }));
        assert.deepStrictEqual(
            result.writes,
            expectedWrites
        );
        assert.deepStrictEqual(
            result.events.map(event => ({
                toolAction: event.tool_action,
                resultType: event.result_type
            })),
            [
                { toolAction: 'copy_value', resultType: 'viewport-display' },
                { toolAction: 'copy_value', resultType: 'aspect-ratio' },
                { toolAction: 'copy_single', resultType: 'dpr' }
            ]
        );

        await page.setViewportSize({ width: 320, height: 720 });
        const mobileLayout = await page.evaluate(ids => ({
            viewportWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            targets: ids.map(id => {
                const rect = document.getElementById(id).getBoundingClientRect();
                return { id, left: rect.left, right: rect.right };
            })
        }), directCopyIds);
        assert.ok(
            mobileLayout.scrollWidth <= mobileLayout.viewportWidth,
            `mobile page overflows: ${mobileLayout.scrollWidth}px > ${mobileLayout.viewportWidth}px`
        );
        for (const target of mobileLayout.targets) {
            assert.ok(target.left >= 0 && target.right <= mobileLayout.viewportWidth, `${target.id} overflows mobile viewport`);
        }
        assert.deepStrictEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }

    console.log('Home result values support direct, keyboard, and icon copy without mobile overflow.');
}

run().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});
