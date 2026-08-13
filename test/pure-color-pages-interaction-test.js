#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const out = path.join(root, 'multilang-build');
const config = JSON.parse(fs.readFileSync(path.join(root, 'build/pages-config.json'), 'utf8'));
const white = config.pages.find(page => page.name === 'white-screen');

if (!white || !fs.existsSync(path.join(out, 'white-screen.html'))) {
    throw new Error('Generated white-screen output is missing. Run npm run build first.');
}

const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

function serve() {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        let file = path.join(out, url.pathname.replace(/^\//, ''));
        if (url.pathname === '/') file = path.join(out, 'index.html');
        if (!path.extname(file) && fs.existsSync(`${file}.html`)) file += '.html';
        if (!fs.existsSync(file)) {
            response.writeHead(404);
            response.end();
            return;
        }
        response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(response);
    });
    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            resolve({ server, url: `http://127.0.0.1:${server.address().port}` });
        });
    });
}

function executable() {
    const candidates = [
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        chromium.executablePath(),
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
    ];
    return candidates.find(candidate => candidate && fs.existsSync(candidate));
}

async function contextFor(url, viewport, init = () => {}, colorScheme) {
    const context = await browser.newContext({ viewport, colorScheme });
    const errors = [];
    await context.addInitScript(init);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
        if (route.request().url().startsWith('http://127.0.0.1:')) return route.continue();
        return route.abort();
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
        return document.querySelector('.pure-color-tool') &&
            window.ScreenSizeToast &&
            typeof window.ScreenSizeToast.show === 'function';
    });
    return { context, page, errors };
}

async function closeContext(session) {
    assert.deepStrictEqual(session.errors, []);
    await session.context.close();
}

let browser;

(async () => {
    const exe = executable();
    if (!exe) throw new Error('Chromium executable not found.');
    const site = await serve();

    try {
        browser = await chromium.launch({ executablePath: exe, headless: true });

        const viewports = [
            { width: 1440, height: 900 },
            { width: 1280, height: 800 },
            { width: 1280, height: 900 },
            { width: 768, height: 1024 },
            { width: 390, height: 844 }
        ];

        for (const viewport of viewports) {
            const session = await contextFor(`${site.url}/white-screen`, viewport, () => {
                window.ScreenSizeAnalytics = {
                    calls: [],
                    track(name, params) { this.calls.push({ name, params }); },
                    trackCopy(params) { this.calls.push({ name: 'copy_result', params }); }
                };
                Object.defineProperty(document, 'visibilityState', {
                    configurable: true,
                    value: 'visible'
                });
            });

            try {
                await session.page.waitForTimeout(250);
                const checks = await session.page.evaluate(() => {
                    const root = document.querySelector('.pure-color-tool');
                    const workbench = root.querySelector('.color-workbench');
                    const stage = root.querySelector('.color-stage-wrap');
                    const controls = root.querySelector('.color-controls');
                    const family = root.querySelector('.color-family');
                    const header = root.querySelector('.color-page-header');
                    const stageRect = stage.getBoundingClientRect();
                    const controlRect = controls.getBoundingClientRect();
                    const workbenchRect = workbench.getBoundingClientRect();
                    const familyRect = family.getBoundingClientRect();
                    const headerRect = header.getBoundingClientRect();
                    const visibleControls = [...controls.querySelectorAll('button, label')]
                        .filter(element => {
                            const style = getComputedStyle(element);
                            const rect = element.getBoundingClientRect();
                            return !element.hidden && style.display !== 'none' && rect.width > 0 && rect.height > 0;
                        });
                    const primary = root.querySelector('[data-action="fullscreen"]');
                    const primaryProbe = document.createElement('span');
                    primaryProbe.style.color = 'var(--primary-color)';
                    document.body.appendChild(primaryProbe);
                    const primaryColor = getComputedStyle(primaryProbe).color;
                    primaryProbe.remove();

                    return {
                        title: document.title,
                        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                        columns: getComputedStyle(workbench).gridTemplateColumns.trim().split(/\s+/).length,
                        stageColor: getComputedStyle(root.querySelector('.color-stage')).backgroundColor,
                        ratio: stageRect.width / stageRect.height,
                        stageRect: stageRect.toJSON(),
                        controlRect: controlRect.toJSON(),
                        workbenchRect: workbenchRect.toJSON(),
                        familyRect: familyRect.toJSON(),
                        headerRect: headerRect.toJSON(),
                        controlRects: visibleControls.map(element => element.getBoundingClientRect().toJSON()),
                        primaryBackground: getComputedStyle(primary).backgroundColor,
                        primaryText: getComputedStyle(primary).color,
                        primaryColor,
                        swatches: [...root.querySelectorAll('.color-swatch-chip')].map(element => {
                            const rect = element.getBoundingClientRect();
                            return [getComputedStyle(element).backgroundColor, rect.width, rect.height];
                        }),
                        current: root.querySelectorAll('[aria-current="page"]').length,
                        faq: (() => { const item = root.querySelector('.color-faq details'); const summary = item.querySelector('summary'); item.open = true; const answer = item.querySelector('p'); const ss = getComputedStyle(summary); const as = getComputedStyle(answer); return { summaryDisplay: ss.display, summaryPadding: [parseFloat(ss.paddingLeft), parseFloat(ss.paddingRight)], summaryHeight: summary.getBoundingClientRect().height, answerHorizontalPadding: [parseFloat(as.paddingLeft), parseFloat(as.paddingRight)], answerVerticalPadding: [parseFloat(as.paddingTop), parseFloat(as.paddingBottom)], summaryBorderBottomWidth: parseFloat(ss.borderBottomWidth), overflow: answer.scrollWidth > answer.clientWidth }; })(),
                        homeLinks: [...document.querySelectorAll('main a[href]')]
                            .filter(link => new URL(link.href).pathname === '/').length
                    };
                });

                assert.strictEqual(checks.title, white.config.page_title);
                assert.strictEqual(checks.overflow, false, `horizontal overflow at ${viewport.width}x${viewport.height}`);
                assert.strictEqual(checks.columns, viewport.width >= 1040 ? 2 : 1);
                assert.strictEqual(checks.stageColor, 'rgb(255, 255, 255)');
                assert.ok(Math.abs(checks.ratio - 16 / 9) < 0.03);
                assert.ok(checks.headerRect.bottom <= checks.workbenchRect.top);
                assert.ok(checks.workbenchRect.bottom <= checks.familyRect.top);
                assert.ok(
                    checks.controlRects.every(rect => rect.height >= 44),
                    `control heights at ${viewport.width}x${viewport.height}: ${checks.controlRects.map(rect => rect.height).join(', ')}`
                );
                assert.ok(checks.controlRects.every(rect => rect.left >= 0 && rect.right <= viewport.width));
                assert.strictEqual(checks.primaryBackground, checks.primaryColor);
                assert.strictEqual(checks.primaryText, 'rgb(255, 255, 255)');

                if (viewport.width >= 1040) {
                    assert.ok(checks.stageRect.right <= checks.controlRect.left);
                    assert.ok(checks.stageRect.top <= checks.controlRect.top + 1);
                } else {
                    assert.ok(checks.stageRect.bottom <= checks.controlRect.top);
                }

                if (viewport.width === 1280 && viewport.height === 800) {
                    assert.ok(checks.stageRect.width >= 760);
                    assert.ok(checks.stageRect.bottom <= viewport.height);
                    assert.ok(checks.controlRect.bottom <= viewport.height);
                }

                assert.strictEqual(checks.swatches.length, 10);
                assert.ok(checks.swatches.every(item => item[1] >= 28 && item[2] >= 28));
                assert.strictEqual(checks.current, 1);
                assert.ok(checks.homeLinks >= 1);
                assert.ok(checks.faq.summaryPadding.every(value => value >= (viewport.width <= 720 ? 16 : 20)));
                assert.ok(checks.faq.summaryHeight >= 52);
                assert.ok(checks.faq.answerHorizontalPadding.every(value => value >= (viewport.width <= 720 ? 16 : 20)));
                assert.ok(checks.faq.answerVerticalPadding.every(value => value >= 16));
                assert.ok(checks.faq.summaryBorderBottomWidth >= 1);
                assert.strictEqual(checks.faq.summaryDisplay, 'list-item');
                assert.strictEqual(checks.faq.overflow, false);
            } finally {
                await closeContext(session);
            }
        }

        const copy = await contextFor(`${site.url}/white-screen`, { width: 1280, height: 800 }, () => {
            window.clipboardWrites = [];
            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: { writeText: value => (window.clipboardWrites.push(value), Promise.resolve()) }
            });
            window.ScreenSizeAnalytics = {
                calls: [],
                trackCopy(params) { this.calls.push(params); }
            };
        });

        try {
            await copy.page.evaluate(() => {
                window.ScreenSizeAnalytics = {
                    calls: [],
                    trackCopy(params) { this.calls.push(params); }
                };
            });
            assert.strictEqual(await copy.page.evaluate(() => typeof window.ScreenSizeToast.show), 'function');
            await copy.page.locator('[data-copy="hex"]').click();
            await copy.page.locator('[data-copy="rgb"]').click();
            const copyState = await copy.page.evaluate(() => {
                const toast = document.querySelector('#toast');
                const toastRect = toast.getBoundingClientRect();
                const headerRect = document.querySelector('.header-v2').getBoundingClientRect();
                const status = document.querySelector('[data-status]');
                const statusRect = status.getBoundingClientRect();
                return {
                    writes: window.clipboardWrites,
                    analytics: window.ScreenSizeAnalytics.calls,
                    toast: {
                        classes: [...toast.classList],
                        message: toast.querySelector('.toast-message').textContent,
                        position: getComputedStyle(toast).position,
                        zIndex: getComputedStyle(toast).zIndex,
                        rect: toastRect.toJSON(),
                        headerBottom: headerRect.bottom
                    },
                    status: {
                        text: status.textContent,
                        width: statusRect.width,
                        height: statusRect.height
                    }
                };
            });
            assert.deepStrictEqual(copyState.writes, ['#FFFFFF', 'rgb(255, 255, 255)']);
            assert.deepStrictEqual(copyState.analytics.map(call => call.tool_action), ['copy_hex', 'copy_rgb']);
            assert.ok(copyState.toast.classes.includes('show'));
            assert.ok(copyState.toast.classes.includes('success'));
            assert.strictEqual(copyState.toast.message, 'RGB copied to clipboard.');
            assert.strictEqual(copyState.toast.position, 'fixed');
            assert.strictEqual(copyState.toast.zIndex, '10000');
            assert.ok(copyState.toast.rect.top >= copyState.toast.headerBottom);
            assert.ok(copyState.toast.rect.left >= 0 && copyState.toast.rect.right <= 1280);
            assert.strictEqual(copyState.status.text, 'RGB copied to clipboard.');
            assert.ok(copyState.status.width <= 1 && copyState.status.height <= 1);

            const timerState = await copy.page.evaluate(async () => {
                const toast = document.querySelector('#toast');
                window.ScreenSizeToast.show('First', { type: 'success', duration: 80 });
                await new Promise(resolve => setTimeout(resolve, 40));
                window.ScreenSizeToast.show('Second', { type: 'error', duration: 100 });
                await new Promise(resolve => setTimeout(resolve, 60));
                const during = {
                    message: toast.querySelector('.toast-message').textContent,
                    classes: [...toast.classList]
                };
                await new Promise(resolve => setTimeout(resolve, 70));
                return { during, after: [...toast.classList] };
            });
            assert.strictEqual(timerState.during.message, 'Second');
            assert.ok(timerState.during.classes.includes('show'));
            assert.ok(timerState.during.classes.includes('error'));
            assert.deepStrictEqual(timerState.after, ['toast']);
        } finally {
            await closeContext(copy);
        }

        const canvas = await contextFor(`${site.url}/white-screen`, { width: 1280, height: 800 }, () => {
            window.downloads = [];
            window.canvasOps = [];
            HTMLCanvasElement.prototype.getContext = function () {
                const canvas = this;
                return {
                    canvas,
                    set fillStyle(value) { this.currentFill = value; },
                    get fillStyle() { return this.currentFill; },
                    fillRect(x, y, width, height) {
                        window.canvasOps.push({
                            canvasWidth: canvas.width,
                            canvasHeight: canvas.height,
                            fillStyle: this.currentFill,
                            x,
                            y,
                            width,
                            height
                        });
                    }
                };
            };
            HTMLCanvasElement.prototype.toBlob = function (callback, type) {
                window.canvasOps.push({ mime: type });
                callback(new Blob(['x'], { type }));
            };
            URL.createObjectURL = () => 'blob:fixture';
            HTMLAnchorElement.prototype.click = function () {
                window.downloads.push({ href: this.href, download: this.download });
            };
            window.ScreenSizeAnalytics = {
                calls: [],
                track(name, params) { this.calls.push({ name, params }); }
            };
        });

        try {
            await canvas.page.evaluate(() => {
                window.ScreenSizeAnalytics = {
                    calls: [],
                    track(name, params) { this.calls.push({ name, params }); }
                };
            });
            await canvas.page.locator('[data-download="1080p"]').click();
            await canvas.page.locator('[data-download="4k"]').click();
            await canvas.page.waitForTimeout(50);
            const result = await canvas.page.evaluate(() => ({
                downloads: window.downloads,
                calls: window.ScreenSizeAnalytics.calls,
                ops: window.canvasOps
            }));
            assert.deepStrictEqual(result.downloads.map(item => item.download), [
                'white-screen-1920x1080.png',
                'white-screen-3840x2160.png'
            ]);
            assert.deepStrictEqual(result.calls.map(item => item.params.tool_action), [
                'download_1080p',
                'download_4k'
            ]);
            assert.deepStrictEqual(result.ops.filter(item => item.width).map(item => [
                item.canvasWidth,
                item.canvasHeight,
                item.fillStyle,
                item.x,
                item.y,
                item.width,
                item.height
            ]), [
                [1920, 1080, '#FFFFFF', 0, 0, 1920, 1080],
                [3840, 2160, '#FFFFFF', 0, 0, 3840, 2160]
            ]);
            assert.deepStrictEqual(result.ops.filter(item => item.mime).map(item => item.mime), [
                'image/png',
                'image/png'
            ]);
        } finally {
            await closeContext(canvas);
        }

        const native = await contextFor(`${site.url}/white-screen`, { width: 800, height: 600 }, () => {
            window.fullscreenFixture = { element: null };
            Object.defineProperty(document, 'fullscreenElement', {
                configurable: true,
                get: () => window.fullscreenFixture.element
            });
        });

        try {
            await native.page.evaluate(() => {
                const stage = document.querySelector('.color-stage');
                stage.requestFullscreen = () => {
                    window.fullscreenFixture.element = stage;
                    document.dispatchEvent(new Event('fullscreenchange'));
                    return Promise.resolve();
                };
                document.exitFullscreen = () => {
                    window.fullscreenFixture.element = null;
                    document.dispatchEvent(new Event('fullscreenchange'));
                    return Promise.resolve();
                };
            });
            await native.page.locator('[data-action="fullscreen"]').click();
            assert.strictEqual(await native.page.locator('.pure-color-tool').evaluate(element => element.classList.contains('immersive')), true);
            assert.strictEqual(await native.page.locator('#toast .toast-message').textContent(), 'Fullscreen active. Press Escape to exit.');
            await native.page.locator('[data-action="exit"]').click();
            assert.strictEqual(await native.page.locator('[data-action="fullscreen"]').evaluate(element => document.activeElement === element), true);
            await native.page.locator('.color-stage').focus();
            await native.page.keyboard.press('Enter');
            await native.page.locator('[data-action="exit"]').click();
            assert.strictEqual(await native.page.locator('.color-stage').evaluate(element => document.activeElement === element), true);
        } finally {
            await closeContext(native);
        }

        const fallback = await contextFor(`${site.url}/white-screen`, { width: 800, height: 600 });
        try {
            await fallback.page.evaluate(() => {
                document.querySelector('.color-stage').requestFullscreen = undefined;
            });
            await fallback.page.locator('[data-action="fullscreen"]').click();
            const geometry = await fallback.page.locator('.color-stage').evaluate(element => ({
                fallback: element.classList.contains('fallback'),
                locked: document.body.classList.contains('pure-color-locked'),
                viewport: [innerWidth, innerHeight],
                rect: element.getBoundingClientRect().toJSON()
            }));
            assert.strictEqual(geometry.fallback, true);
            assert.strictEqual(geometry.locked, true);
            assert.ok(geometry.rect.width >= geometry.viewport[0]);
            assert.ok(geometry.rect.height >= geometry.viewport[1]);
            await fallback.page.keyboard.press('Escape');
            assert.strictEqual(await fallback.page.locator('.pure-color-tool').evaluate(element => element.classList.contains('immersive')), false);
            assert.strictEqual(await fallback.page.locator('body').evaluate(element => element.classList.contains('pure-color-locked')), false);
            assert.strictEqual(await fallback.page.locator('[data-action="fullscreen"]').evaluate(element => document.activeElement === element), true);
        } finally {
            await closeContext(fallback);
        }

        for (const mode of ['dark', 'light', 'auto']) {
            const themed = await contextFor(`${site.url}/white-screen`, { width: 800, height: 600 }, () => {}, 'dark');
            try {
                await themed.page.evaluate(theme => {
                    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
                    else document.documentElement.setAttribute('data-theme', theme);
                }, mode);
                await themed.page.waitForTimeout(350);
                const colors = await themed.page.evaluate(() => {
                    const page = document.querySelector('.color-page');
                    const intent = document.querySelector('.color-intent');
                    const fullscreen = document.querySelector('[data-action="fullscreen"]');
                    const copyButton = document.querySelector('[data-copy="hex"]');
                    const probe = document.createElement('span');
                    probe.style.color = 'var(--primary-color)';
                    document.body.appendChild(probe);
                    const primary = getComputedStyle(probe).color;
                    probe.remove();
                    return {
                        page: getComputedStyle(page).color,
                        intent: getComputedStyle(intent).color,
                        fullscreenBackground: getComputedStyle(fullscreen).backgroundColor,
                        fullscreenText: getComputedStyle(fullscreen).color,
                        copyBackground: getComputedStyle(copyButton).backgroundColor,
                        primary
                    };
                });
                assert.strictEqual(colors.fullscreenBackground, colors.primary);
                assert.strictEqual(colors.fullscreenText, 'rgb(255, 255, 255)');
                assert.strictEqual(colors.copyBackground, mode === 'dark' ? 'rgb(11, 18, 32)' : 'rgb(255, 255, 255)');
                assert.strictEqual(colors.page, mode === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(15, 23, 42)');
                assert.strictEqual(colors.intent, mode === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(71, 85, 105)');
            } finally {
                await closeContext(themed);
            }
        }

        const wake = await contextFor(`${site.url}/white-screen`, { width: 800, height: 600 }, () => {
            window.wake = { requests: 0, releases: 0, nativeReleases: 0, current: null };
            const createSentinel = () => {
                const listeners = {};
                return {
                    addEventListener(type, listener) { listeners[type] = listener; },
                    release() {
                        window.wake.releases += 1;
                        if (listeners.release) listeners.release();
                        return Promise.resolve();
                    },
                    nativeRelease() {
                        window.wake.nativeReleases += 1;
                        if (listeners.release) listeners.release();
                    }
                };
            };
            Object.defineProperty(navigator, 'wakeLock', {
                configurable: true,
                value: {
                    request: () => {
                        window.wake.requests += 1;
                        window.wake.current = createSentinel();
                        return Promise.resolve(window.wake.current);
                    }
                }
            });
            Object.defineProperty(document, 'visibilityState', {
                configurable: true,
                get: () => window.fixtureVisibility || 'visible'
            });
        });

        try {
            const checkbox = wake.page.locator('[data-wake-lock] input');
            await checkbox.check();
            await wake.page.waitForTimeout(20);
            assert.strictEqual(await wake.page.locator('#toast .toast-message').textContent(), 'Screen wake lock enabled.');
            await checkbox.uncheck();
            await wake.page.waitForTimeout(20);
            assert.strictEqual(await wake.page.locator('#toast .toast-message').textContent(), 'Screen wake lock disabled.');
            await checkbox.check();
            await wake.page.waitForTimeout(20);
            await wake.page.evaluate(() => {
                window.fixtureVisibility = 'hidden';
                window.wake.current.nativeRelease();
                document.dispatchEvent(new Event('visibilitychange'));
            });
            await wake.page.evaluate(() => {
                window.fixtureVisibility = 'visible';
                document.dispatchEvent(new Event('visibilitychange'));
            });
            await wake.page.waitForTimeout(20);
            await wake.page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
            await wake.page.waitForTimeout(20);
            await wake.page.evaluate(() => {
                window.fixtureVisibility = 'visible';
                document.dispatchEvent(new Event('visibilitychange'));
            });
            await wake.page.waitForTimeout(20);
            const counts = await wake.page.evaluate(() => ({
                requests: window.wake.requests,
                releases: window.wake.releases,
                nativeReleases: window.wake.nativeReleases
            }));
            assert.deepStrictEqual(counts, { requests: 3, releases: 2, nativeReleases: 1 });
        } finally {
            await closeContext(wake);
        }

        const pending = await contextFor(`${site.url}/white-screen`, { width: 800, height: 600 }, () => {
            window.wake = { requests: 0, releases: 0, resolve: null };
            Object.defineProperty(navigator, 'wakeLock', {
                configurable: true,
                value: {
                    request: () => {
                        window.wake.requests += 1;
                        return new Promise(resolve => { window.wake.resolve = resolve; });
                    }
                }
            });
        });

        try {
            const checkbox = pending.page.locator('[data-wake-lock] input');
            await checkbox.check();
            await checkbox.uncheck();
            await pending.page.evaluate(() => {
                window.wake.resolve({
                    addEventListener() {},
                    release: () => {
                        window.wake.releases += 1;
                        return Promise.resolve();
                    }
                });
            });
            await pending.page.waitForTimeout(20);
            const counts = await pending.page.evaluate(() => ({
                requests: window.wake.requests,
                releases: window.wake.releases
            }));
            assert.deepStrictEqual(counts, { requests: 1, releases: 1 });
        } finally {
            await closeContext(pending);
        }

        const language = await contextFor(`${site.url}/zh/white-screen`, { width: 900, height: 700 });
        try {
            await language.page.locator('#language-modal-trigger').click();
            assert.strictEqual(await language.page.locator('#language-modal').evaluate(element => element.classList.contains('show')), true);
            assert.strictEqual(await language.page.locator('.language-card.active').count(), 6);
            await language.page.locator('.language-card[data-lang="de"]').click();
            await language.page.waitForURL('**/de/white-screen');
            await language.page.waitForFunction(() => document.documentElement.lang === 'de');
            assert.strictEqual(language.page.url().endsWith('/de/white-screen'), true);
            assert.strictEqual(await language.page.title(), 'Wei\u00dfer Bildschirm - Staub, Flecken und dunkle Pixel pr\u00fcfen');
        } finally {
            await closeContext(language);
        }

        const mobileLanguage = await contextFor(`${site.url}/white-screen`, { width: 390, height: 844 });
        try {
            await mobileLanguage.page.locator('#mobile-menu-toggle').click();
            await mobileLanguage.page.waitForFunction(() => document.querySelector('#main-nav').classList.contains('active'));
            await mobileLanguage.page.waitForTimeout(350);
            const selectorRect = await mobileLanguage.page.locator('#language-modal-trigger').boundingBox();
            assert.ok(selectorRect);
            assert.ok(selectorRect.x >= 0 && selectorRect.x + selectorRect.width <= 390);
            assert.ok(selectorRect.height >= 44);
            await mobileLanguage.page.locator('#language-modal-trigger').click();
            assert.strictEqual(await mobileLanguage.page.locator('#language-modal').evaluate(element => element.classList.contains('show')), true);
            assert.strictEqual(await mobileLanguage.page.locator('.language-card.active').count(), 6);
        } finally {
            await closeContext(mobileLanguage);
        }

        const localeCases = [
            {
                lang: 'zh',
                copy: '\u5df2\u590d\u5236 RGB\u3002',
                wakeEnabled: '\u5df2\u5f00\u542f\u5c4f\u5e55\u5524\u9192\u9501\u5b9a\u3002',
                wakeDisabled: '\u5df2\u5173\u95ed\u5c4f\u5e55\u5524\u9192\u9501\u5b9a\u3002'
            },
            {
                lang: 'de',
                copy: 'RGB in die Zwischenablage kopiert.',
                wakeEnabled: 'Bildschirmaktivierung ist eingeschaltet.',
                wakeDisabled: 'Bildschirmaktivierung ausgeschaltet.'
            }
        ];

        for (const expected of localeCases) {
            const localized = await contextFor(`${site.url}/${expected.lang}/white-screen`, { width: 900, height: 700 }, () => {
                window.clipboardWrites = [];
                Object.defineProperty(navigator, 'clipboard', {
                    configurable: true,
                    value: { writeText: value => (window.clipboardWrites.push(value), Promise.resolve()) }
                });
                Object.defineProperty(navigator, 'wakeLock', {
                    configurable: true,
                    value: {
                        request: () => Promise.resolve({
                            addEventListener() {},
                            release: () => Promise.resolve()
                        })
                    }
                });
            });

            try {
                await localized.page.locator('[data-copy="hex"]').click();
                await localized.page.locator('[data-copy="rgb"]').click();
                assert.deepStrictEqual(await localized.page.evaluate(() => window.clipboardWrites), [
                    '#FFFFFF',
                    'rgb(255, 255, 255)'
                ]);
                assert.strictEqual(await localized.page.locator('#toast .toast-message').textContent(), expected.copy);
                const checkbox = localized.page.locator('[data-wake-lock] input');
                await checkbox.check();
                await localized.page.waitForTimeout(20);
                assert.strictEqual(await localized.page.locator('#toast .toast-message').textContent(), expected.wakeEnabled);
                await checkbox.uncheck();
                await localized.page.waitForTimeout(20);
                assert.strictEqual(await localized.page.locator('#toast .toast-message').textContent(), expected.wakeDisabled);
                const labels = await localized.page.locator('.color-controls button').evaluateAll(buttons => {
                    return buttons.slice(0, 5).map(button => button.textContent.trim());
                });
                assert.ok(labels.every(Boolean));
            } finally {
                await closeContext(localized);
            }
        }

        console.log('[pure-color] runtime interaction acceptance passed');
    } finally {
        if (browser) await browser.close();
        await new Promise(resolve => site.server.close(resolve));
    }
})().catch(error => {
    console.error(`[pure-color] ${error.stack || error.message}`);
    process.exitCode = 1;
});
