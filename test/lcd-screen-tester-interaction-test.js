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

function contrastRatio(foreground, background) {
    const luminance = color => {
        const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255);
        const linear = channels.map(value => (
            value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        ));
        return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
    };
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
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

async function assertCompactTopLayout(page, label, limits) {
    const metrics = await page.evaluate(() => {
        const readRect = selector => {
            const rect = document.querySelector(selector).getBoundingClientRect();
            return { bottom: Math.round(rect.bottom), top: Math.round(rect.top) };
        };

        return {
            actions: readRect('.lcd-hero-actions'),
            h1: readRect('#lcd-page-title'),
            workbench: readRect('.lcd-workbench')
        };
    });

    assert.ok(metrics.h1.top >= 0 && metrics.h1.top <= limits.h1Max, `${label} H1 starts at ${metrics.h1.top}px`);
    assert.ok(metrics.workbench.top <= limits.workbenchMax, `${label} workbench starts at ${metrics.workbench.top}px`);
    assert.ok(metrics.actions.bottom <= metrics.workbench.top, `${label} actions overlap the workbench`);
}

async function assertContentStructure(page, label) {
    const structure = await page.evaluate(() => ({
        categories: Array.from(document.querySelectorAll('[data-action="choose-category"]'), button => button.dataset.categoryTarget),
        faqCount: document.querySelectorAll('.lcd-faq details').length,
        finalActionCount: document.querySelectorAll('.lcd-final-action-buttons button').length,
        preparationCount: document.querySelectorAll('.lcd-prep-list > li').length,
        resultCount: document.querySelectorAll('.lcd-result-grid > article').length
    }));

    assert.deepStrictEqual(structure, {
        categories: ['quick', 'pixels', 'uniformity', 'motion', 'sharpness'],
        faqCount: 8,
        finalActionCount: 2,
        preparationCount: 6,
        resultCount: 5
    }, `${label} content structure`);
}

async function assertContentTextFits(page, label) {
    const overflow = await page.$$eval(
        '.lcd-tester-tool h1, .lcd-tester-tool h2, .lcd-tester-tool h3, .lcd-tester-tool p, .lcd-tester-tool summary, .lcd-tester-tool button',
        elements => elements
            .filter(element => element.getClientRects().length > 0 && element.scrollWidth > element.clientWidth + 1)
            .map(element => ({
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                text: (element.textContent || '').trim().slice(0, 80)
            }))
    );
    assert.deepStrictEqual(overflow, [], `${label} contains clipped text`);
}

async function assertFaqSpacing(page, label) {
    const spacing = await page.evaluate(() => {
        const details = document.querySelector('.lcd-faq details');
        const summary = details.querySelector('summary');
        const answer = details.querySelector('p');
        const detailsRect = details.getBoundingClientRect();
        const textNode = Array.from(summary.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        const range = document.createRange();
        range.selectNodeContents(textNode);

        return {
            answerInset: Math.round(answer.getBoundingClientRect().left - detailsRect.left),
            iconInset: parseFloat(getComputedStyle(summary, '::after').right),
            questionInset: Math.round(range.getBoundingClientRect().left - detailsRect.left)
        };
    });

    assert.ok(spacing.questionInset >= 14, `${label} FAQ question inset is ${spacing.questionInset}px`);
    assert.ok(spacing.answerInset >= 14, `${label} FAQ answer inset is ${spacing.answerInset}px`);
    assert.ok(spacing.iconInset >= 14, `${label} FAQ icon inset is ${spacing.iconInset}px`);
}

async function assertVisibleControlTargets(page, selector, label) {
    const undersized = await page.$$eval(selector, elements => elements
        .filter(element => element.getClientRects().length > 0)
        .map(element => {
            const rect = element.getBoundingClientRect();
            return {
                height: rect.height,
                text: (element.textContent || element.getAttribute('aria-label') || '').trim(),
                width: rect.width
            };
        })
        .filter(element => element.width < 44 || element.height < 44));

    assert.deepStrictEqual(undersized, [], `${label} contains controls smaller than 44x44px`);
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
            backgroundInert: document.querySelector('[data-lcd-tester]').inert,
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
        backgroundInert: false,
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
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    const diagnostics = preparePage(page);

    try {
        await openTester(page, `${origin}/devices/lcd-screen-tester`);
        const initialState = await getTesterState(page);
        assert.strictEqual(initialState.currentModeId, 'solid-black');
        assert.strictEqual(await page.textContent('#lcd-preview-name'), 'Black');
        assert.strictEqual(await page.textContent('#lcd-overlay-mode-name'), 'Black');
        assert.strictEqual(await page.getAttribute('[data-mode="solid-white"]', 'aria-pressed'), 'false');
        assert.strictEqual(await page.getAttribute('[data-mode="solid-black"]', 'aria-pressed'), 'true');
        assert.strictEqual(await page.getAttribute('[data-mode="solid-red"]', 'aria-pressed'), 'false');
        assert.strictEqual(await page.getAttribute('[data-overlay-mode="solid-white"]', 'aria-pressed'), 'false');
        assert.strictEqual(await page.getAttribute('[data-overlay-mode="solid-black"]', 'aria-pressed'), 'true');
        assert.strictEqual(await page.getAttribute('[data-overlay-mode="solid-red"]', 'aria-pressed'), 'false');
        const initialPreviewPixel = await page.$eval('#lcd-preview-canvas', canvas => {
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Preview canvas 2D context is unavailable');
            const pixel = context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
            return Array.from(pixel);
        });
        assert.deepStrictEqual(initialPreviewPixel, [0, 0, 0, 255]);
        await assertNoHorizontalOverflow(page, 'desktop page');
        await assertPrimaryActionsInViewport(page, 'desktop page');
        await assertCompactTopLayout(page, 'desktop page', { h1Max: 190, workbenchMax: 340 });
        await assertContentStructure(page, 'desktop page');
        await assertContentTextFits(page, 'desktop page');
        await assertFaqSpacing(page, 'desktop page');
        const statusColors = await page.$eval('#lcd-status-text', element => ({
            background: getComputedStyle(element.closest('.lcd-workbench')).backgroundColor,
            foreground: getComputedStyle(element).color
        }));
        assert.ok(
            contrastRatio(statusColors.foreground, statusColors.background) >= 4.5,
            `ready status text contrast is below 4.5:1: ${JSON.stringify(statusColors)}`
        );

        const initialTabs = await page.$$eval('.lcd-tab', tabs => tabs.map(tab => ({
            id: tab.id,
            selected: tab.getAttribute('aria-selected'),
            tabIndex: tab.tabIndex
        })));
        assert.deepStrictEqual(initialTabs, [
            { id: 'lcd-tab-quick', selected: 'true', tabIndex: 0 },
            { id: 'lcd-tab-pixels', selected: 'false', tabIndex: -1 },
            { id: 'lcd-tab-uniformity', selected: 'false', tabIndex: -1 },
            { id: 'lcd-tab-motion', selected: 'false', tabIndex: -1 },
            { id: 'lcd-tab-sharpness', selected: 'false', tabIndex: -1 }
        ]);
        await page.focus('#lcd-tab-quick');
        await page.keyboard.press('ArrowRight');
        assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'lcd-tab-pixels');
        assert.strictEqual(await page.getAttribute('#lcd-tab-pixels', 'aria-selected'), 'true');
        await page.keyboard.press('End');
        assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'lcd-tab-sharpness');
        await page.keyboard.press('Home');
        assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'lcd-tab-quick');

        await page.click('[data-action="choose-category"][data-category-target="uniformity"]');
        await page.waitForFunction(() => (
            window.__lcdScreenTester.activeCategory === 'uniformity'
            && document.querySelector('.lcd-workbench').getBoundingClientRect().top <= 100
        ));
        assert.strictEqual(await page.getAttribute('#lcd-tab-uniformity', 'aria-selected'), 'true');

        await page.focus('[data-action="choose-category"][data-category-target="sharpness"]');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => (
            window.__lcdScreenTester.activeCategory === 'sharpness'
            && document.activeElement.id === 'lcd-tab-sharpness'
        ));
        assert.strictEqual(await page.getAttribute('#lcd-tab-sharpness', 'aria-selected'), 'true');

        await page.focus('[data-action="return-workbench"]');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.activeElement.id === 'lcd-tab-sharpness');
        assert.strictEqual((await getTesterState(page)).activeCategory, 'sharpness');

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
        assert.strictEqual(await page.getAttribute('[data-mode="solid-green"]', 'aria-pressed'), 'true');
        assert.strictEqual(await page.getAttribute('[data-mode="solid-red"]', 'aria-pressed'), 'false');
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
        assert.strictEqual(await page.getAttribute('[data-gray-level="20"]', 'aria-pressed'), 'true');
        assert.strictEqual(await page.getAttribute('[data-gray-steps="64"]', 'aria-pressed'), 'true');

        await page.click('#lcd-tab-motion');
        await page.click('[data-mode="motion-text"]');
        await page.click('[data-motion-bg="white"]');
        await page.click('[data-motion-speed="fast"]');
        state = await getTesterState(page);
        assert.strictEqual(state.currentModeId, 'motion-text');
        assert.strictEqual(state.motionBackground, 'white');
        assert.strictEqual(state.motionSpeed, 'fast');
        assert.strictEqual(state.motionFrameActive, true);
        assert.strictEqual(await page.getAttribute('[data-motion-bg="white"]', 'aria-pressed'), 'true');
        assert.strictEqual(await page.getAttribute('[data-motion-speed="fast"]', 'aria-pressed'), 'true');

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
        assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'lcd-test-overlay');
        assert.strictEqual(await page.$eval('[data-lcd-tester]', element => element.inert), true);
        assert.deepStrictEqual(await page.evaluate(() => window.__lcdScreenTester.getCanvasTargets().map(target => target.canvas.id)), [
            'lcd-test-canvas'
        ]);
        assert.strictEqual(await page.getAttribute('[data-overlay-mode="solid-blue"]', 'aria-pressed'), 'true');

        await page.keyboard.press('Tab');
        assert.strictEqual(await page.evaluate(() => document.activeElement.dataset.overlayMode), 'solid-red');
        await page.keyboard.press('Shift+Tab');
        assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'lcd-overlay-exit');

        await page.click('#lcd-overlay-next');
        await page.waitForFunction(() => window.__lcdScreenTester.controlsHidden, null, { timeout: 4000 });
        assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'lcd-test-overlay');
        await page.keyboard.press('ArrowLeft');
        assert.strictEqual((await getTesterState(page)).controlsHidden, false);

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

        await page.click('#lcd-tab-motion');
        await page.click('[data-mode="motion-text"]');

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
        state = await getTesterState(page);
        assert.strictEqual(state.activeCategory, 'motion');
        assert.strictEqual(state.currentModeId, 'motion-text');
        assert.strictEqual(await page.getAttribute('#lcd-tab-motion', 'aria-selected'), 'true');
        assert.strictEqual(await page.isVisible('#lcd-panel-motion'), true);
        assert.strictEqual((await page.textContent('#lcd-preview-name')).trim(), 'Scrolling Text');

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
        assert.ok(
            eventNames.indexOf('screen_test_started') < eventNames.indexOf('tool_result_view'),
            'screen_test_started should precede the first tool_result_view event'
        );

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
        await assertCompactTopLayout(page, 'mobile page', { h1Max: 190, workbenchMax: 420 });
        await assertContentStructure(page, 'mobile page');
        await assertContentTextFits(page, 'mobile page');
        await assertFaqSpacing(page, 'mobile page');
        assertCanvasDpr(await readCanvasMetrics(page, '#lcd-preview-canvas'), 3, 'mobile preview');

        await page.click('.lcd-hero [data-action="start-manual"]');
        await page.waitForFunction(() => window.__lcdScreenTester.overlayOpen);
        assertCanvasDpr(await readCanvasMetrics(page, '#lcd-test-canvas'), 3, 'mobile fullscreen');
        await assertVisibleControlTargets(
            page,
            '#lcd-test-overlay button',
            'mobile fullscreen'
        );

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
        assert.strictEqual((await getTesterState(page)).currentModeId, 'solid-cyan');

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

async function runWideLayoutFlow(browser, origin) {
    const context = await prepareContext(browser, {
        viewport: { width: 2560, height: 1305 }
    });
    const page = await context.newPage();
    const diagnostics = preparePage(page);

    try {
        await openTester(page, `${origin}/devices/lcd-screen-tester`);
        await assertNoHorizontalOverflow(page, 'wide desktop page');
        await assertCompactTopLayout(page, 'wide desktop page', { h1Max: 190, workbenchMax: 340 });
        await assertContentTextFits(page, 'wide desktop page');
        assert.deepStrictEqual(diagnostics.pageErrors, [], `wide desktop page errors: ${diagnostics.pageErrors.join(' | ')}`);
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
    const englishTranslations = JSON.parse(fs.readFileSync(
        path.join(repoRoot, 'locales', 'en', 'translation.json'),
        'utf8'
    ));
    const expectedLcdKeys = Object.keys(englishTranslations.lcdTester).sort();

    try {
        for (const language of languages) {
            const translations = JSON.parse(fs.readFileSync(
                path.join(repoRoot, 'locales', language, 'translation.json'),
                'utf8'
            ));
            assert.deepStrictEqual(
                Object.keys(translations.lcdTester).sort(),
                expectedLcdKeys,
                `${language} LCD translation keys should match English`
            );
            const prefix = language === 'en' ? '' : `/${language}`;
            await openTester(page, `${origin}${prefix}/devices/lcd-screen-tester`);

            assert.strictEqual((await page.textContent('#lcd-page-title')).trim(), translations.lcdTester.title);
            const invalidRenderedKeys = await page.$$eval(
                '[data-i18n^="lcdTester."], [data-i18n-aria-label^="lcdTester."]',
                (elements, expectedKeys) => elements.flatMap(element => [
                    element.getAttribute('data-i18n'),
                    element.getAttribute('data-i18n-aria-label')
                ]).filter(Boolean).filter(key => !expectedKeys.includes(key.slice('lcdTester.'.length))),
                expectedLcdKeys
            );
            assert.deepStrictEqual(invalidRenderedKeys, [], `${language} built LCD translation attributes should remain valid`);
            const localizedText = await page.$$eval(
                '[data-i18n^="lcdTester."]',
                (elements, lcdTranslations) => elements.map(element => {
                    const key = element.getAttribute('data-i18n').slice('lcdTester.'.length);
                    return {
                        actual: element.textContent.trim(),
                        expected: lcdTranslations[key],
                        key
                    };
                }),
                translations.lcdTester
            );
            assert.strictEqual(localizedText.length, 141, `${language} should render all LCD localized text elements`);
            assert.deepStrictEqual(
                localizedText.filter(({ actual, expected }) => actual !== expected),
                [],
                `${language} LCD text should match the locale`
            );
            const localizedAriaLabels = await page.$$eval(
                '[data-i18n-aria-label^="lcdTester."]',
                (elements, lcdTranslations) => elements.map(element => {
                    const key = element.getAttribute('data-i18n-aria-label').slice('lcdTester.'.length);
                    return {
                        actual: element.getAttribute('aria-label'),
                        expected: lcdTranslations[key],
                        key
                    };
                }),
                translations.lcdTester
            );
            assert.strictEqual(localizedAriaLabels.length, 9, `${language} should render all LCD aria labels`);
            assert.deepStrictEqual(
                localizedAriaLabels.filter(({ actual, expected }) => actual !== expected),
                [],
                `${language} LCD aria labels should match the locale`
            );
            await assertNoHorizontalOverflow(page, `${language} mobile page`);
            await assertPrimaryActionsInViewport(page, `${language} mobile page`);
            await assertCompactTopLayout(page, `${language} mobile page`, { h1Max: 190, workbenchMax: 420 });
            await assertContentTextFits(page, `${language} mobile page`);
            assert.strictEqual(
                (await page.textContent('.lcd-mode-choice span[data-i18n="lcdTester.modeQuickGuide"]')).trim(),
                translations.lcdTester.modeQuickGuide
            );
            assert.strictEqual(await page.locator('.lcd-faq details').count(), 8);
            const overflowingButtons = await page.$$eval('.lcd-tester-tool button', buttons => (
                buttons.filter(button => button.scrollWidth > button.clientWidth + 1).length
            ));
            assert.strictEqual(overflowingButtons, 0, `${language} mobile buttons should not overflow`);
            const scriptPath = await page.$eval('script[src*="lcd-screen-tester.js"]', script => new URL(script.src).pathname);
            assert.strictEqual(scriptPath, '/js/lcd-screen-tester.js');

            await page.click('#lcd-tab-pixels');
            await page.click('[data-mode="solid-green"]');
            await assertVisibleControlTargets(page, '#lcd-panel-pixels button', `${language} pixel controls`);
            assert.strictEqual((await getTesterState(page)).currentModeId, 'solid-green');
            assert.strictEqual((await page.textContent('#lcd-preview-name')).trim(), translations.lcdTester.green);
            assert.strictEqual(
                (await page.textContent('.lcd-results article:first-child h3')).trim(),
                translations.lcdTester.deadPixels
            );
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
        await runWideLayoutFlow(browser, origin);
        await runLanguageFlow(browser, origin);
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }

    console.log('LCD layout, content paths, workbench interactions, fullscreen state, DPR rendering, analytics, and six locales passed.');
}

run().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});
