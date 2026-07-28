#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const buildRoot = path.join(repoRoot, 'multilang-build');

const CONTENT_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
};

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
    let decodedPath;
    try {
        decodedPath = decodeURIComponent(urlPathname);
    } catch {
        decodedPath = urlPathname;
    }

    if (decodedPath === '/') return path.join(buildRoot, 'index.html');

    const normalizedPath = decodedPath.endsWith('/')
        ? decodedPath.slice(0, -1)
        : decodedPath;
    const candidate = path.join(buildRoot, normalizedPath.replace(/^\/+/, ''));

    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    if (!path.extname(candidate)) {
        const htmlCandidate = `${candidate}.html`;
        if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) return htmlCandidate;
    }

    return null;
}

function startStaticServer() {
    const server = http.createServer((request, response) => {
        const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
        const filePath = resolveRequestPath(pathname);

        if (!filePath) {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Not found');
            return;
        }

        response.writeHead(200, {
            'Content-Type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
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

async function prepareContext(browser, options) {
    const context = await browser.newContext(options);
    await context.addInitScript(() => {
        window.__mockFullscreenElement = null;
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            get: () => window.__mockFullscreenElement
        });
        Object.defineProperty(document, 'webkitFullscreenElement', {
            configurable: true,
            get: () => window.__mockFullscreenElement
        });
        Object.defineProperty(Element.prototype, 'requestFullscreen', {
            configurable: true,
            value() {
                window.__mockFullscreenElement = this;
                document.dispatchEvent(new Event('fullscreenchange'));
                return Promise.resolve();
            }
        });
        Object.defineProperty(document, 'exitFullscreen', {
            configurable: true,
            value() {
                window.__mockFullscreenElement = null;
                document.dispatchEvent(new Event('fullscreenchange'));
                return Promise.resolve();
            }
        });
    });
    return context;
}

function preparePage(page) {
    const diagnostics = {
        pageErrors: [],
        lcdScriptFailures: [],
        lcdScriptStatuses: []
    };

    page.on('pageerror', error => diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', request => {
        if (new URL(request.url()).pathname.endsWith('/js/lcd-screen-tester.js')) {
            diagnostics.lcdScriptFailures.push(request.failure()?.errorText || 'request failed');
        }
    });
    page.on('response', response => {
        if (new URL(response.url()).pathname.endsWith('/js/lcd-screen-tester.js')) {
            diagnostics.lcdScriptStatuses.push(response.status());
        }
    });
    page.route('**/*', route => {
        const hostname = new URL(route.request().url()).hostname;
        return hostname === '127.0.0.1' || hostname === 'localhost'
            ? route.continue()
            : route.abort();
    });

    return diagnostics;
}

async function openTester(page, url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(
        window.__lcdScreenTester
        && document.querySelector('[data-lcd-tester]')
        && document.getElementById('lcd-preview-canvas')?.dataset.renderDpr
    ));
}

async function assertNoHorizontalOverflow(page, label) {
    const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
    }));
    assert.ok(
        metrics.scrollWidth <= metrics.clientWidth,
        `${label} overflows horizontally: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`
    );
}

async function assertPrimaryActionsInViewport(page, label) {
    const actions = await page.$$eval('.lcd-hero [data-action]', elements => elements.map(element => {
        const rect = element.getBoundingClientRect();
        return {
            bottom: rect.bottom,
            height: rect.height,
            left: rect.left,
            right: rect.right,
            textFits: element.scrollWidth <= element.clientWidth + 1,
            top: rect.top,
            viewportHeight: window.innerHeight,
            viewportWidth: document.documentElement.clientWidth
        };
    }));

    assert.strictEqual(actions.length, 2, `${label} should show two primary entry actions`);
    for (const action of actions) {
        assert.ok(action.height >= 44, `${label} action target should be at least 44px high`);
        assert.ok(action.top >= 0 && action.bottom <= action.viewportHeight, `${label} action is outside the first viewport`);
        assert.ok(action.left >= 0 && action.right <= action.viewportWidth, `${label} action overflows horizontally`);
        assert.ok(action.textFits, `${label} action text overflows its button`);
    }
}

async function getTesterState(page) {
    return page.evaluate(() => {
        const tester = window.__lcdScreenTester;
        return {
            activeCategory: tester.activeCategory,
            controlHideTimer: tester.controlHideTimer,
            controlsHidden: tester.controlsHidden,
            currentModeId: tester.currentModeId,
            grayLevel: tester.grayLevel,
            graySteps: tester.graySteps,
            guidedActive: tester.guidedActive,
            guidedCompleted: tester.guidedCompleted,
            motionBackground: tester.motionBackground,
            motionFrameActive: tester.motionFrame !== null,
            motionSpeed: tester.motionSpeed,
            overlayOpen: tester.overlayOpen,
            paused: tester.paused,
            remainingStepMs: tester.remainingStepMs,
            sequenceIndex: tester.sequenceIndex,
            sequenceLength: tester.sequence.length,
            stepTimerActive: tester.stepTimer !== null,
            touchStart: tester.touchStart,
            wasNativeFullscreen: tester.wasNativeFullscreen
        };
    });
}

async function assertClosedState(page, expectedStatus) {
    const state = await page.evaluate(() => {
        const tester = window.__lcdScreenTester;
        return {
            bodyActive: document.body.classList.contains('lcd-test-active'),
            controlHideTimer: tester.controlHideTimer,
            fullscreenElement: document.fullscreenElement?.id || null,
            motionFrame: tester.motionFrame,
            overlayAriaHidden: tester.overlay.getAttribute('aria-hidden'),
            overlayHidden: tester.overlay.classList.contains('is-hidden'),
            overlayOpen: tester.overlayOpen,
            status: tester.workbench.dataset.state,
            stepTimer: tester.stepTimer,
            touchStart: tester.touchStart
        };
    });

    assert.deepStrictEqual(state, {
        bodyActive: false,
        controlHideTimer: null,
        fullscreenElement: null,
        motionFrame: null,
        overlayAriaHidden: 'true',
        overlayHidden: true,
        overlayOpen: false,
        status: expectedStatus,
        stepTimer: null,
        touchStart: null
    });
}

async function runDesktopFlow(browser, origin) {
    const context = await prepareContext(browser, {
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    const diagnostics = preparePage(page);

    try {
        await openTester(page, `${origin}/devices/lcd-screen-tester`);
        await assertNoHorizontalOverflow(page, 'desktop page');
        await assertPrimaryActionsInViewport(page, 'desktop page');

        await page.evaluate(() => {
            window.__lcdAnalytics = [];
            window.ScreenSizeAnalytics = {
                track(eventName, payload, options) {
                    window.__lcdAnalytics.push({
                        eventName,
                        options: { ...options },
                        payload: { ...payload }
                    });
                    return true;
                }
            };
        });

        await page.click('#lcd-tab-pixels');
        await page.click('[data-mode="solid-green"]');
        let state = await getTesterState(page);
        assert.strictEqual(state.activeCategory, 'pixels');
        assert.strictEqual(state.currentModeId, 'solid-green');
        assert.strictEqual(await page.getAttribute('#lcd-tab-pixels', 'aria-selected'), 'true');
        assert.strictEqual(await page.isHidden('#lcd-panel-quick'), true);
        assert.strictEqual(await page.isVisible('#lcd-panel-pixels'), true);

        await page.locator('#lcd-custom-color').evaluate(input => {
            input.value = '#123456';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        state = await getTesterState(page);
        assert.strictEqual(state.currentModeId, 'solid-custom');
        assert.strictEqual(await page.textContent('#lcd-custom-color-value'), '#123456');

        await page.click('#lcd-tab-uniformity');
        await page.click('[data-gray-level="20"]');
        await page.click('[data-gray-steps="64"]');
        state = await getTesterState(page);
        assert.strictEqual(state.grayLevel, 20);
        assert.strictEqual(state.graySteps, 64);
        assert.strictEqual(state.currentModeId, 'grayscale-bars');

        await page.click('#lcd-tab-motion');
        await page.click('[data-mode="motion-text"]');
        await page.click('[data-motion-bg="white"]');
        await page.click('[data-motion-speed="fast"]');
        state = await getTesterState(page);
        assert.strictEqual(state.currentModeId, 'motion-text');
        assert.strictEqual(state.motionBackground, 'white');
        assert.strictEqual(state.motionSpeed, 'fast');
        assert.strictEqual(state.motionFrameActive, true);

        await page.click('#lcd-tab-sharpness');
        state = await getTesterState(page);
        assert.strictEqual(state.currentModeId, 'checkerboard');
        assert.strictEqual(state.motionFrameActive, false);

        await page.click('#lcd-tab-pixels');
        await page.click('[data-mode="solid-blue"]');
        await page.click('#lcd-panel-pixels [data-action="start-manual"]');
        await page.waitForFunction(() => window.__lcdScreenTester.overlayOpen);
        state = await getTesterState(page);
        assert.strictEqual(state.guidedActive, false);
        assert.strictEqual(state.sequenceLength, 9);
        assert.strictEqual(state.sequenceIndex, 2);
        assert.strictEqual(state.wasNativeFullscreen, true);
        assert.notStrictEqual(state.controlHideTimer, null);
        assert.strictEqual(await page.evaluate(() => document.fullscreenElement?.id), 'lcd-test-overlay');
        assert.strictEqual(await page.getAttribute('#lcd-test-overlay', 'aria-hidden'), 'false');
        assert.strictEqual(await page.isHidden('#lcd-overlay-pause'), true);

        await page.keyboard.press('Space');
        assert.strictEqual((await getTesterState(page)).currentModeId, 'solid-white');
        await page.keyboard.press('ArrowLeft');
        assert.strictEqual((await getTesterState(page)).currentModeId, 'solid-blue');

        await page.dispatchEvent('#lcd-test-canvas', 'pointerdown', {
            clientX: 320,
            clientY: 300,
            pointerId: 7,
            pointerType: 'touch'
        });
        await page.dispatchEvent('#lcd-test-canvas', 'pointerup', {
            clientX: 230,
            clientY: 305,
            pointerId: 7,
            pointerType: 'touch'
        });
        assert.strictEqual((await getTesterState(page)).currentModeId, 'solid-white');

        await page.evaluate(() => document.exitFullscreen());
        await page.waitForFunction(() => !window.__lcdScreenTester.overlayOpen);
        await assertClosedState(page, 'ready');

        await page.click('.lcd-hero [data-action="start-guided"]');
        await page.waitForFunction(() => window.__lcdScreenTester.stepTimer !== null);
        state = await getTesterState(page);
        assert.strictEqual(state.guidedActive, true);
        assert.strictEqual(state.sequenceLength, 12);
        assert.strictEqual(state.sequenceIndex, 0);
        assert.notStrictEqual(state.controlHideTimer, null);
        assert.strictEqual(await page.isVisible('#lcd-overlay-pause'), true);

        await page.keyboard.press('Space');
        await page.waitForFunction(() => window.__lcdScreenTester.paused);
        const pausedAt = (await getTesterState(page)).remainingStepMs;
        await page.waitForTimeout(180);
        state = await getTesterState(page);
        assert.strictEqual(state.stepTimerActive, false);
        assert.strictEqual(state.remainingStepMs, pausedAt);
        assert.strictEqual(await page.getAttribute('#lcd-overlay-pause', 'aria-label'), 'Resume test');

        await page.keyboard.press('Space');
        await page.waitForFunction(() => !window.__lcdScreenTester.paused);
        await page.evaluate(() => window.__lcdScreenTester.startStepTimer(120));
        await page.waitForFunction(() => window.__lcdScreenTester.sequenceIndex === 1, null, { timeout: 1500 });

        await page.click('#lcd-overlay-next');
        state = await getTesterState(page);
        assert.strictEqual(state.sequenceIndex, 2);
        assert.ok(state.remainingStepMs > 4500 && state.remainingStepMs <= 5000);
        await page.click('#lcd-overlay-previous');
        assert.strictEqual((await getTesterState(page)).sequenceIndex, 1);

        await page.evaluate(() => {
            const tester = window.__lcdScreenTester;
            tester.sequenceIndex = tester.sequence.length - 1;
            tester.selectMode(tester.sequence[tester.sequenceIndex], { track: true });
            tester.startStepTimer(80);
        });
        await page.waitForFunction(() => !window.__lcdScreenTester.overlayOpen, null, { timeout: 1500 });
        await assertClosedState(page, 'complete');

        await page.click('.lcd-hero [data-action="start-guided"]');
        await page.dispatchEvent('#lcd-test-overlay', 'pointermove', {
            clientX: 500,
            clientY: 400,
            pointerType: 'mouse'
        });
        assert.notStrictEqual((await getTesterState(page)).controlHideTimer, null);
        await page.click('#lcd-overlay-exit');
        await assertClosedState(page, 'ready');

        const analytics = await page.evaluate(() => window.__lcdAnalytics);
        const eventNames = analytics.map(event => event.eventName);
        assert.ok(eventNames.includes('screen_test_started'));
        assert.ok(eventNames.includes('tool_result_view'));
        assert.ok(eventNames.includes('screen_test_completed'));
        assert.ok(analytics.some(event => event.eventName === 'screen_test_exited' && event.payload.tool_action === 'early_exit'));
        assert.ok(analytics.some(event => event.eventName === 'screen_test_exited' && event.payload.tool_action === 'completed_exit'));

        const allowedActions = new Set([
            'completed_exit', 'early_exit', 'guided_complete', 'guided_start', 'manual_start', 'view_pattern'
        ]);
        const allowedResults = new Set([
            'color', 'motion', 'pixel', 'screen_test', 'sharpness', 'uniformity'
        ]);
        for (const event of analytics) {
            assert.deepStrictEqual(Object.keys(event.payload).sort(), [
                'page_id', 'result_type', 'tool_action', 'tool_name'
            ]);
            assert.strictEqual(event.payload.page_id, 'lcd-screen-tester');
            assert.strictEqual(event.payload.tool_name, 'lcd_screen_tester');
            assert.ok(allowedActions.has(event.payload.tool_action), `Unexpected tool_action: ${event.payload.tool_action}`);
            assert.ok(allowedResults.has(event.payload.result_type), `Unexpected result_type: ${event.payload.result_type}`);
        }

        const payloadText = JSON.stringify(analytics.map(event => event.payload));
        const displayValues = await page.evaluate(() => [
            document.getElementById('lcd-viewport-value').textContent,
            document.getElementById('lcd-screen-value').textContent,
            document.getElementById('lcd-dpr-value').textContent,
            document.getElementById('lcd-refresh-value').textContent
        ]);
        assert.ok(!payloadText.includes('#123456') && !payloadText.includes('123456'));
        for (const value of displayValues) {
            assert.ok(!payloadText.includes(value), `Analytics payload includes display value: ${value}`);
        }

        assert.deepStrictEqual(diagnostics.pageErrors, [], `desktop page errors: ${diagnostics.pageErrors.join(' | ')}`);
        assert.deepStrictEqual(diagnostics.lcdScriptFailures, []);
        assert.ok(diagnostics.lcdScriptStatuses.includes(200), 'LCD page script should load with HTTP 200');
    } finally {
        await context.close();
    }
}

function assertCanvasDpr(metrics, expectedDpr, label) {
    assert.strictEqual(metrics.renderDpr, expectedDpr, `${label} render DPR`);
    assert.ok(Math.abs(metrics.bitmapWidth - metrics.cssWidth * expectedDpr) <= 1, `${label} bitmap width`);
    assert.ok(Math.abs(metrics.bitmapHeight - metrics.cssHeight * expectedDpr) <= 1, `${label} bitmap height`);
    assert.ok(Math.abs(metrics.rectWidth - metrics.cssWidth) <= 1, `${label} CSS width`);
    assert.ok(Math.abs(metrics.rectHeight - metrics.cssHeight) <= 1, `${label} CSS height`);
}

async function readCanvasMetrics(page, selector) {
    return page.$eval(selector, canvas => {
        const rect = canvas.getBoundingClientRect();
        return {
            bitmapHeight: canvas.height,
            bitmapWidth: canvas.width,
            cssHeight: Number(canvas.dataset.cssHeight),
            cssWidth: Number(canvas.dataset.cssWidth),
            rectHeight: Math.round(rect.height),
            rectWidth: Math.round(rect.width),
            renderDpr: Number(canvas.dataset.renderDpr)
        };
    });
}

async function runMobileFlow(browser, origin) {
    const context = await prepareContext(browser, {
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    const diagnostics = preparePage(page);

    try {
        await openTester(page, `${origin}/devices/lcd-screen-tester`);
        await assertNoHorizontalOverflow(page, 'mobile page');
        await assertPrimaryActionsInViewport(page, 'mobile page');
        assertCanvasDpr(await readCanvasMetrics(page, '#lcd-preview-canvas'), 3, 'mobile preview');

        await page.click('.lcd-hero [data-action="start-manual"]');
        await page.waitForFunction(() => window.__lcdScreenTester.overlayOpen);
        assertCanvasDpr(await readCanvasMetrics(page, '#lcd-test-canvas'), 3, 'mobile fullscreen');

        await page.dispatchEvent('#lcd-test-canvas', 'pointerdown', {
            clientX: 300,
            clientY: 420,
            pointerId: 11,
            pointerType: 'touch'
        });
        await page.dispatchEvent('#lcd-test-canvas', 'pointerup', {
            clientX: 210,
            clientY: 425,
            pointerId: 11,
            pointerType: 'touch'
        });
        assert.strictEqual((await getTesterState(page)).currentModeId, 'solid-green');

        await page.setViewportSize({ width: 412, height: 780 });
        await page.waitForFunction(() => {
            const canvas = document.getElementById('lcd-test-canvas');
            return Number(canvas.dataset.cssWidth) === Math.round(canvas.getBoundingClientRect().width);
        });
        assertCanvasDpr(await readCanvasMetrics(page, '#lcd-test-canvas'), 3, 'resized mobile fullscreen');

        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !window.__lcdScreenTester.overlayOpen);
        await assertClosedState(page, 'ready');
        await assertNoHorizontalOverflow(page, 'resized mobile page');

        assert.deepStrictEqual(diagnostics.pageErrors, [], `mobile page errors: ${diagnostics.pageErrors.join(' | ')}`);
        assert.deepStrictEqual(diagnostics.lcdScriptFailures, []);
        assert.ok(diagnostics.lcdScriptStatuses.includes(200), 'mobile LCD script should load with HTTP 200');
    } finally {
        await context.close();
    }
}

async function runLanguageFlow(browser, origin) {
    const context = await prepareContext(browser, {
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    const diagnostics = preparePage(page);
    const languages = ['en', 'zh', 'de', 'es', 'pt', 'fr'];

    try {
        for (const language of languages) {
            const translations = JSON.parse(fs.readFileSync(
                path.join(repoRoot, 'locales', language, 'translation.json'),
                'utf8'
            ));
            const prefix = language === 'en' ? '' : `/${language}`;
            await openTester(page, `${origin}${prefix}/devices/lcd-screen-tester`);

            assert.strictEqual((await page.textContent('#lcd-page-title')).trim(), translations.lcdTester.title);
            await assertNoHorizontalOverflow(page, `${language} mobile page`);
            await assertPrimaryActionsInViewport(page, `${language} mobile page`);
            const overflowingButtons = await page.$$eval('.lcd-tester-tool button', buttons => (
                buttons.filter(button => button.scrollWidth > button.clientWidth + 1).length
            ));
            assert.strictEqual(overflowingButtons, 0, `${language} mobile buttons should not overflow`);
            const scriptPath = await page.$eval('script[src*="lcd-screen-tester.js"]', script => new URL(script.src).pathname);
            assert.strictEqual(scriptPath, '/js/lcd-screen-tester.js');

            await page.click('#lcd-tab-pixels');
            await page.click('[data-mode="solid-green"]');
            assert.strictEqual((await getTesterState(page)).currentModeId, 'solid-green');
            assert.strictEqual((await page.textContent('#lcd-preview-name')).trim(), translations.lcdTester.green);
        }

        assert.deepStrictEqual(diagnostics.pageErrors, [], `localized page errors: ${diagnostics.pageErrors.join(' | ')}`);
        assert.deepStrictEqual(diagnostics.lcdScriptFailures, []);
        assert.ok(diagnostics.lcdScriptStatuses.length >= 1);
        assert.ok(diagnostics.lcdScriptStatuses.every(status => status === 200));
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
        await runLanguageFlow(browser, origin);
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }

    console.log('LCD workbench interactions, fullscreen state, DPR rendering, analytics, and six locales passed.');
}

run().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});
