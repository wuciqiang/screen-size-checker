#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const buildRoot = path.join(repoRoot, 'multilang-build');
const locales = ['en', 'zh', 'de', 'es', 'pt', 'fr'];

function assertBuildExists() {
    assert.ok(fs.existsSync(buildRoot), 'multilang-build is missing; run npm run multilang-build first');
    assert.ok(fs.existsSync(path.join(buildRoot, 'resolution-test.html')), 'English resolution page is missing');
}

function resolveFile(urlPath) {
    const relative = decodeURIComponent(urlPath.replace(/^\/+/, ''));
    const candidate = path.join(buildRoot, relative || 'resolution-test.html');
    return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
}

function startStaticServer() {
    const server = http.createServer((request, response) => {
        const filePath = resolveFile(new URL(request.url, 'http://127.0.0.1').pathname);
        if (!filePath) {
            response.writeHead(404);
            response.end('Not found');
            return;
        }
        const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json' };
        response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(response);
    });
    return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

async function createPage(browser, viewport) {
    const context = await browser.newContext({ viewport });
    let page;
    try {
        page = await context.newPage();
    } catch (error) {
        await context.close();
        throw error;
    }
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
        window.__resolutionWrites = [];
        window.__resolutionEvents = [];
        window.__resolutionCopyOptions = [];
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => window.__resolutionWrites.push(value) } });
        window.ScreenSizeAnalytics = {
            trackToolResult: payload => window.__resolutionEvents.push(payload),
            trackCopy: (payload, options) => { window.__resolutionEvents.push(payload); window.__resolutionCopyOptions.push(options); }
        };
    });
    return { context, page, errors };
}

async function initialize(page, origin, pathname = '/resolution-test.html') {
    await page.route('**/js/app.js*', route => route.abort());
    await page.goto(`${origin}${pathname}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
        const root = document.querySelector('[data-resolution-test]');
        if (root) delete root.dataset.initialized;
        window.ScreenSizeAnalytics = {
            trackToolResult: payload => window.__resolutionEvents.push(payload),
            trackCopy: (payload, options) => { window.__resolutionEvents.push(payload); window.__resolutionCopyOptions.push(options); }
        };
        const module = await import('/js/resolution-test.js');
        module.initializeResolutionTest();
    });
}

async function checkInteractions(page) {
    const controls = page.locator('.resolution-copy-button');
    assert.strictEqual(await controls.count(), 9, 'every metric must have one page-specific copy button');
    assert.strictEqual(await page.locator('[data-resolution-test] .copy-btn').count(), 0);
    const targets = await controls.evaluateAll(buttons => buttons.map(button => button.dataset.resolutionCopyTarget));
    assert.strictEqual(new Set(targets).size, 9, 'copy targets must be distinct');
    assert.ok(targets.every(Boolean), 'copy targets must be nonempty');
    for (const target of targets) {
        assert.strictEqual(await page.locator(`#${target}`).count(), 1, `${target} must resolve to a metric value`);
        assert.strictEqual(await page.locator(`.resolution-test-metric:has(#${target}) .resolution-copy-button[data-resolution-copy-target="${target}"]`).count(), 1, `${target} button and value must share a metric`);
    }
    await controls.first().click();
    let state = await page.evaluate(() => ({ writes: window.__resolutionWrites.slice(), events: window.__resolutionEvents.slice(), options: window.__resolutionCopyOptions.slice() }));
    assert.strictEqual(state.writes.length, 1);
    assert.deepStrictEqual(state.events.map(event => event.tool_action), ['view_result', 'copy_single']);
    assert.deepStrictEqual(state.options, [{ dedupeMs: 0 }]);
    await controls.first().click();
    state = await page.evaluate(() => ({ writes: window.__resolutionWrites.slice(), events: window.__resolutionEvents.slice(), options: window.__resolutionCopyOptions.slice() }));
    assert.strictEqual(state.writes.length, 2, 'a repeated single copy must write once again');
    assert.deepStrictEqual(state.events.map(event => event.tool_action), ['view_result', 'copy_single', 'copy_single']);
    assert.deepStrictEqual(state.options, [{ dedupeMs: 0 }, { dedupeMs: 0 }]);
    await page.locator('[data-resolution-copy="all"]').click();
    state = await page.evaluate(() => ({ writes: window.__resolutionWrites.slice(), events: window.__resolutionEvents.slice(), options: window.__resolutionCopyOptions.slice() }));
    assert.strictEqual(state.writes.length, 3);
    const visibleRows = await page.locator('.resolution-test-metric').evaluateAll(rows => rows.map(row => ({ label: row.querySelector('span')?.textContent.trim(), value: row.querySelector('strong')?.textContent.trim() })));
    for (const row of visibleRows) {
        assert.ok(state.writes[2].includes(`${row.label}: ${row.value}`), 'copy-all must contain visible labels and values');
    }
    assert.deepStrictEqual(state.events.map(event => event.tool_action), ['view_result', 'copy_single', 'copy_single', 'copy_all']);
    assert.deepStrictEqual(state.options, [{ dedupeMs: 0 }, { dedupeMs: 0 }, { dedupeMs: 0 }]);
    await page.evaluate(() => { try { delete navigator.share; } catch (error) { Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }); } });
    await page.locator('[data-resolution-copy="share"]').click();
    state = await page.evaluate(() => ({ writes: window.__resolutionWrites.slice(), events: window.__resolutionEvents.slice(), options: window.__resolutionCopyOptions.slice() }));
    assert.strictEqual(state.writes.length, 4);
    assert.strictEqual(state.writes[3], 'https://screensizechecker.com/resolution-test');
    assert.deepStrictEqual(state.events.map(event => event.tool_action), ['view_result', 'copy_single', 'copy_single', 'copy_all', 'share_link']);
    assert.deepStrictEqual(state.options, [{ dedupeMs: 0 }, { dedupeMs: 0 }, { dedupeMs: 0 }, { dedupeMs: 0 }]);
    const viewEvents = state.events.filter(event => event.tool_action === 'view_result');
    assert.strictEqual(viewEvents.length, 1);
    for (const event of state.events) {
        assert.strictEqual(event.page_id, 'resolution-test');
        assert.strictEqual(event.tool_name, 'resolution_test');
        assert.strictEqual(event.result_type, 'screen_info');
    }
}

async function checkLayout(page, width) {
    const layout = await page.evaluate(() => {
        const root = document.querySelector('.resolution-test-page');
        const metrics = [...document.querySelectorAll('.resolution-test-metric')];
        const overlap = metrics.some(metric => {
            const label = metric.querySelector('span').getBoundingClientRect();
            const value = metric.querySelector('strong').getBoundingClientRect();
            const button = metric.querySelector('button').getBoundingClientRect();
            return label.right > metric.getBoundingClientRect().right || value.right > metric.getBoundingClientRect().right ||
                button.right > metric.getBoundingClientRect().right || label.bottom > value.top || button.bottom > value.top;
        });
        return {
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            overlap,
            supportColumns: getComputedStyle(document.querySelector('.resolution-support-grid')).gridTemplateColumns.split(' ').length,
            dashboardColumns: getComputedStyle(document.querySelector('.resolution-test-dashboard')).gridTemplateColumns.split(' ').length,
            faqColumns: getComputedStyle(document.querySelector('.resolution-test-faq')).gridTemplateColumns.split(' ').length,
            faqItems: [...document.querySelectorAll('.resolution-faq-item')].length,
            faqPairs: [...document.querySelectorAll('.resolution-faq-item')].every(item => item.querySelector('h3')?.nextElementSibling?.tagName === 'P'),
            svg: [...document.querySelectorAll('.resolution-copy-button svg')].every(svg => {
                const button = svg.parentElement.getBoundingClientRect();
                const icon = svg.getBoundingClientRect();
                return icon.width <= 18 && icon.height <= 18 && Math.abs((icon.left + icon.width / 2) - (button.left + button.width / 2)) <= 1 && Math.abs((icon.top + icon.height / 2) - (button.top + button.height / 2)) <= 1;
            }),
            darkText: getComputedStyle(root).color
        };
    });
    assert.strictEqual(layout.overflow, false, `${width}px page must not overflow horizontally`);
    assert.strictEqual(layout.overlap, false, `${width}px metric controls must not overlap`);
    assert.strictEqual(layout.supportColumns, width >= 720 ? 2 : 1, `${width}px support grid columns`);
    assert.strictEqual(layout.dashboardColumns, width >= 1040 ? 2 : 1, `${width}px dashboard columns`);
    assert.strictEqual(layout.faqColumns, width >= 720 ? 2 : 1, `${width}px FAQ columns`);
    assert.strictEqual(layout.faqItems, 6, `${width}px FAQ item count`);
    assert.strictEqual(layout.faqPairs, true, `${width}px FAQ item pairs`);
    assert.strictEqual(layout.svg, true, `${width}px copy icons must remain compact`);
    return layout;
}

async function checkFullRuntimeLocale(browser, origin, locale) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
    });
    try {
        const pathname = locale === 'en' ? '/resolution-test.html' : `/${locale}/resolution-test.html`;
        await page.goto(`${origin}${pathname}`, { waitUntil: 'networkidle' });
        await page.waitForFunction(expectedLocale => {
            const root = document.querySelector('[data-resolution-test]');
            return window.i18next && window.i18next.language === expectedLocale && root?.dataset.initialized === 'true';
        }, locale);
        const expected = JSON.parse(fs.readFileSync(path.join(repoRoot, 'locales', locale, 'translation.json'), 'utf8'));
        const values = await page.locator('[data-resolution-test] strong').evaluateAll(elements => elements.map(element => ({ text: element.textContent, children: element.children.length })));
        assert.strictEqual(values.length, 9, `${locale} must expose nine metric values`);
        assert.ok(values.every(value => value.children === 0), `${locale} metric values must remain value-only`);
        assert.ok(values.every(value => !value.text.includes('undefined')), `${locale} metrics must not contain undefined`);
        for (const index of [0, 1, 6, 7]) assert.ok(values[index].text.includes('CSS px'), `${locale} metric ${index} must retain CSS px`);
        const actual = await page.evaluate(() => ({
            language: document.documentElement.lang,
            i18nextLanguage: window.i18next.language,
            label: document.querySelector('.resolution-test-metric span')?.textContent.trim(),
            orientation: document.getElementById('orientation')?.textContent.trim()
        }));
        assert.strictEqual(actual.language, locale, `${locale} html language must match URL`);
        assert.strictEqual(actual.i18nextLanguage, locale, `${locale} i18next language must match URL`);
        assert.strictEqual(actual.label, expected.resolution_test_screen_resolution, `${locale} screen label must be localized`);
        assert.strictEqual(actual.orientation, expected.resolution_test_orientation_landscape, `${locale} orientation must be localized`);
        assert.deepStrictEqual(errors, [], `${locale} full runtime errors: ${errors.join(' | ')}`);
    } finally {
        await context.close();
    }
}

async function inspectLocalePage(page, html, locale, englishProjection) {
    await page.setContent(html);
    const projection = await page.evaluate(() => {
        const faqScript = [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map(script => JSON.parse(script.textContent))
            .find(value => value['@type'] === 'FAQPage');
        const pairs = [...document.querySelectorAll('.resolution-test-faq h3')].map(question => ({
            name: question.textContent.trim(),
            answer: question.nextElementSibling?.textContent.trim() || ''
        }));
        return {
            faq: faqScript?.mainEntity || [],
            pairs,
            header: [...document.querySelectorAll('[data-resolution-global-link="header"]')].map(link => link.getAttribute('href')),
            footer: [...document.querySelectorAll('[data-resolution-global-link="footer"]')].map(link => link.getAttribute('href'))
        };
    });
    assert.ok(projection.faq.length, `${locale} must contain FAQPage JSON-LD`);
    assert.strictEqual(projection.faq.length, 6, `${locale} FAQ must contain six entries`);
    assert.strictEqual(projection.pairs.length, 6, `${locale} must expose six visible FAQ pairs`);
    assert.ok(projection.pairs.every(pair => pair.name && pair.answer), `${locale} visible FAQ entries must be nonempty`);
    assert.deepStrictEqual(projection.faq.map(item => ({ name: item.name, answer: item.acceptedAnswer?.text })), projection.pairs);
    if (englishProjection) assert.notDeepStrictEqual(projection.faq.map(item => ({ name: item.name, answer: item.acceptedAnswer.text })), englishProjection);
    assert.deepStrictEqual(projection.header, [locale === 'en' ? '/resolution-test' : `/${locale}/resolution-test`]);
    assert.deepStrictEqual(projection.footer, [locale === 'en' ? '/resolution-test' : `/${locale}/resolution-test`]);
    return projection.faq.map(item => ({ name: item.name, answer: item.acceptedAnswer.text }));
}

async function inspectContextualLink(page, html, marker, expectedHref) {
    await page.setContent(html);
    const link = page.locator(`a[data-resolution-context-link="${marker}"]`);
    assert.strictEqual(await link.count(), 1, `${marker} must be exactly one real anchor`);
    const details = await link.evaluate(anchor => {
        const parent = anchor.parentElement;
        const previous = parent?.previousElementSibling;
        const section = anchor.closest('.content-section');
        const container = anchor.closest('.section-container');
        const hero = anchor.closest('.devices-hero, .devices-hero-section, .resolution-test-hero, .hero-section');
        return {
            href: anchor.getAttribute('href'),
            parentTag: parent?.tagName,
            parentClass: parent?.className || '',
            previousTag: previous?.tagName || '',
            previousClass: previous?.className || '',
            previousI18n: previous?.getAttribute('data-i18n') || '',
            parentText: parent?.textContent || '',
            hero: Boolean(hero),
            inToolIntro: Boolean(anchor.closest('.tool-intro')),
            listPrevious: previous?.tagName === 'UL',
            cardHeading: Boolean(anchor.closest('.content-card, .section-container')?.querySelector('h3[data-i18n="viewport_basics"]')),
            explanatoryContainer: Boolean(section && container && section.contains(container)),
            pIsLastChild: container?.lastElementChild === parent,
            nextIsFaq: section?.nextElementSibling?.matches('.faq-section') || false,
            previousText: previous?.textContent.trim() || ''
        };
    });
    const normalizedHref = details.href
        .replace(/^(?:\.\.\/|\.\/)+/, '')
        .replace(/^\/+/, '')
        .replace(/\.html$/, '');
    assert.strictEqual(normalizedHref, expectedHref.replace(/^\//, ''), `${marker} must use the canonical resolution path`);
    return details;
}

async function run() {
    assertBuildExists();
    const { server, origin } = await startStaticServer();
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
    } catch (error) {
        await new Promise(resolve => server.close(resolve));
        throw error;
    }
    let desktop;
    let mobileSession;
    try {
        desktop = await createPage(browser, { width: 1440, height: 900 });
        await initialize(desktop.page, origin);
        const results = await desktop.page.locator('#resolution-results').boundingBox();
        assert.ok(results && results.y <= 260, `desktop results top must be <=260, got ${results && results.y}`);
        assert.strictEqual(await desktop.page.locator('[data-resolution-test] main').count(), 0);
        await checkInteractions(desktop.page);
        await checkLayout(desktop.page, 1440);
        const lightThemeText = await desktop.page.evaluate(() => getComputedStyle(document.querySelector('.resolution-test-page')).color);
        const darkTheme = await desktop.page.evaluate(() => {
            const root = document.documentElement;
            const previous = root.getAttribute('data-theme');
            root.setAttribute('data-theme', 'dark');
            const page = document.querySelector('.resolution-test-page');
            const style = getComputedStyle(page);
            const probe = document.createElement('span');
            probe.style.color = 'var(--text-primary)';
            page.appendChild(probe);
            const tokenColor = getComputedStyle(probe).color;
            probe.remove();
            return { token: tokenColor, color: style.color, previous };
        });
        assert.strictEqual(darkTheme.color, darkTheme.token, 'dark theme page text must use the dark text token');
        assert.notStrictEqual(darkTheme.color, lightThemeText, 'dark theme text must differ from light text');
        await desktop.page.evaluate(previous => {
            if (previous === null) document.documentElement.removeAttribute('data-theme');
            else document.documentElement.setAttribute('data-theme', previous);
        }, darkTheme.previous);
        for (const width of [936, 768]) {
            await desktop.page.setViewportSize({ width, height: 900 });
            await checkLayout(desktop.page, width);
        }
        await desktop.page.setViewportSize({ width: 1440, height: 900 });
        assert.deepStrictEqual(desktop.errors, [], `desktop page errors: ${desktop.errors.join(' | ')}`);
        assert.ok((await desktop.page.title()).includes('Screen Resolution Checker'));
        assert.strictEqual(await desktop.page.locator('link[rel="canonical"]').getAttribute('href'), 'https://screensizechecker.com/resolution-test');
        const guideWords = await desktop.page.locator('.resolution-guide-content').innerText();
        assert.ok(guideWords.trim().split(/\s+/).length >= 700 && guideWords.trim().split(/\s+/).length <= 900, 'English guide must contain 700-900 words');

        mobileSession = await createPage(browser, { width: 390, height: 844 });
        await initialize(mobileSession.page, origin);
        await checkLayout(mobileSession.page, 390);
        const mobile = await mobileSession.page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            scrollY: window.scrollY,
            top: document.querySelector('#resolution-results').getBoundingClientRect().top,
            boxes: [...document.querySelectorAll('.resolution-test-metric')].slice(0, 3).map(metric => {
                const rect = metric.getBoundingClientRect();
                return { top: rect.top, bottom: rect.bottom };
            })
        }));
        assert.ok(mobile.scrollWidth <= mobile.clientWidth, 'mobile page must not overflow horizontally');
        assert.ok(mobile.top <= 360, `mobile results top must be <=360, got ${mobile.top}`);
        for (const box of mobile.boxes) {
            assert.ok(
                box.top >= 0 && box.bottom <= 844,
                `first three metric rectangles must fit in mobile viewport: ${JSON.stringify({ box, scrollY: mobile.scrollY })}`
            );
        }
        assert.deepStrictEqual(mobileSession.errors, [], `mobile page errors: ${mobileSession.errors.join(' | ')}`);
        const narrow = await createPage(browser, { width: 320, height: 844 });
        await initialize(narrow.page, origin);
        await checkLayout(narrow.page, 320);
        await narrow.context.close();

        for (const locale of locales) await checkFullRuntimeLocale(browser, origin, locale);

        const inspectionPage = await desktop.context.newPage();
        let englishProjection;
        for (const locale of locales) {
            const file = locale === 'en' ? 'resolution-test.html' : `${locale}/resolution-test.html`;
            const html = fs.readFileSync(path.join(buildRoot, file), 'utf8');
            const projection = await inspectLocalePage(inspectionPage, html, locale, englishProjection);
            if (locale === 'en') englishProjection = projection;
        }
        const contextualPages = {
            'home-tool-intro': 'index.html', 'standard-resolutions-faq': 'devices/standard-resolutions.html',
            'aspect-ratio-explainer': 'devices/aspect-ratio-calculator.html', 'ppi-explainer': 'devices/ppi-calculator.html',
            'laptop-related': 'devices/laptop-screen-size-checker.html', 'iphone-viewport': 'devices/iphone-viewport-sizes.html',
            'ipad-viewport': 'devices/ipad-viewport-sizes.html', 'android-viewport': 'devices/android-viewport-sizes.html',
            'how-to-check-quick-answer': 'blog/how-to-check-screen-resolution.html', 'viewport-basics-checking': 'blog/viewport-basics.html'
        };
        for (const [marker, output] of Object.entries(contextualPages)) {
            const html = fs.readFileSync(path.join(buildRoot, output), 'utf8');
            const details = await inspectContextualLink(inspectionPage, html, marker, '/resolution-test');
            if (marker === 'home-tool-intro') {
                assert.strictEqual(details.previousClass, 'tool-intro-description');
                assert.ok(details.inToolIntro && !details.hero);
            } else if (marker === 'standard-resolutions-faq') {
                assert.strictEqual(details.previousI18n, 'standard_seo_faq_check_q');
            } else if (marker === 'aspect-ratio-explainer') {
                assert.strictEqual(details.previousI18n, 'aspectRatioCalculator.responsiveDesignDescription');
            } else if (marker === 'ppi-explainer') {
                assert.ok(details.parentTag === 'P' && details.previousTag === 'UL');
                assert.ok(details.explanatoryContainer && details.pIsLastChild && details.nextIsFaq);
            } else if (marker === 'laptop-related') {
                assert.ok(details.parentText.includes('Need to compare a laptop'));
                assert.ok(!details.hero);
            } else if (['iphone-viewport', 'ipad-viewport', 'android-viewport'].includes(marker)) {
                assert.ok(details.listPrevious && details.cardHeading);
            } else if (marker === 'how-to-check-quick-answer') {
                assert.ok(details.parentText.includes('Quick Answer'));
            } else if (marker === 'viewport-basics-checking') {
                assert.strictEqual(details.previousTag, 'H2');
                assert.strictEqual(details.previousText.replace(/\s+/g, ' ').trim(), 'How to Check Your Viewport Size');
            }
        }
        const homepage = fs.readFileSync(path.join(buildRoot, 'index.html'), 'utf8');
        await inspectionPage.setContent(homepage);
        const homepageDetails = await inspectionPage.evaluate(() => {
            const hero = document.querySelector('h1.hero-title');
            const link = document.querySelector('a[data-resolution-context-link="home-tool-intro"]');
            return {
                title: document.title,
                canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
                staticTitle: hero?.querySelector('[data-i18n="static_hero_title"]')?.textContent.trim(),
                dynamicButton: Boolean(hero?.querySelector('#viewport-display')),
                noscriptChild: Boolean(hero?.querySelector('noscript')),
                heroMarker: Boolean(hero?.querySelector('[data-resolution-context-link]')),
                linkAfterIntro: link?.parentElement?.previousElementSibling?.classList.contains('tool-intro-description'),
                inToolIntro: Boolean(link?.closest('.tool-intro'))
            };
        });
        assert.strictEqual(homepageDetails.title, 'What Is My Screen Size? Instant Screen Resolution Checker');
        assert.strictEqual(homepageDetails.canonical, 'https://screensizechecker.com/');
        assert.strictEqual(homepageDetails.staticTitle, 'What Is My Screen Size & Resolution?');
        assert.ok(homepageDetails.dynamicButton);
        assert.ok(homepageDetails.noscriptChild);
        assert.strictEqual(homepageDetails.heroMarker, false);
        assert.ok(homepageDetails.linkAfterIntro && homepageDetails.inToolIntro);
        const componentSource = fs.readFileSync(path.join(repoRoot, 'components/resolution-test-content.html'), 'utf8');
        assert.ok(!/margin(?:-top)?\s*:\s*-\d/.test(componentSource), 'resolution component must not contain negative margin declarations');
    } finally {
        try {
            if (mobileSession?.context) await mobileSession.context.close();
        } finally {
            try {
                if (desktop?.context) await desktop.context.close();
            } finally {
                try {
                    if (browser) await browser.close();
                } finally {
                    await new Promise(resolve => server.close(resolve));
                }
            }
        }
    }
    console.log('[resolution-test] complete Playwright acceptance contract passed');
}

run().catch(error => { console.error(error.stack || error); process.exit(1); });
