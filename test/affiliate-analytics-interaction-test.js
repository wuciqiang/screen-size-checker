#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const analyticsSource = fs.readFileSync(path.join(repoRoot, 'js', 'analytics.js'), 'utf8');

function resolveBrowserExecutable() {
    const bundledPath = chromium.executablePath();
    if (fs.existsSync(bundledPath)) {
        return bundledPath;
    }

    const candidates = process.platform === 'win32'
        ? [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        ]
        : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

    return candidates.find(candidate => fs.existsSync(candidate));
}

function fixtureHtml({ language = 'en', withModule = true } = {}) {
    return `<!doctype html>
<html lang="${language}">
<head><meta charset="utf-8"><style>
    html, body { margin: 0; padding: 0; }
    body { min-height: 2400px; font-family: sans-serif; }
    #affiliate-module { height: 160px; width: 100%; background: #eee; }
    #below-module { height: 1200px; }
</style></head>
<body>
${withModule ? `<aside id="affiliate-module" data-affiliate-module data-affiliate-module-id="fixture_module" data-affiliate-program="amazon" data-affiliate-placement="fixture_placement" data-affiliate-result="monitor">
    <a id="affiliate-link" href="https://www.amazon.com/s?k=monitor&amp;tag=screensizechecker-20" target="_blank" rel="sponsored nofollow noopener" data-affiliate-link data-affiliate-link-id="fixture_amazon_monitor" data-affiliate-program="amazon" data-affiliate-action="fixture_amazon_monitor" data-affiliate-result="monitor">Open retailer search</a>
</aside>` : '<button id="tool-action" type="button">Calculate</button>'}
<div id="below-module"></div>
</body></html>`;
}

function isBlockedExternal(url) {
    return /^(https:\/\/(?:www\.amazon\.com|www\.googletagmanager\.com|www\.clarity\.ms|umami-blue-zeta\.vercel\.app)|https:\/\/pagead2\.googlesyndication\.com)/.test(url);
}

async function createPage(browser, { allowed = true, consentMode = 'known', language = 'en', withModule = true, gtagAvailable = true } = {}) {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    const blockedRequests = [];
    await page.route('**/*', route => {
        if (isBlockedExternal(route.request().url())) {
            blockedRequests.push(route.request().url());
            return route.abort();
        }
        return route.continue();
    });
    await page.setContent(fixtureHtml({ language, withModule }));
    await page.evaluate(({ allowed: initialAllowed, consentMode: initialConsentMode, gtagReady }) => {
        window.__affiliateEvents = [];
        window.__gtagCalls = [];
        window.__blockedNavigations = 0;
        window.__analyticsAllowed = initialAllowed;
        if (initialConsentMode === 'unknown') {
            window.ScreenSizeConsent = undefined;
        } else {
            window.ScreenSizeConsent = {
                canUseAnalytics: () => window.__analyticsAllowed
            };
        }
        if (gtagReady) {
            window.gtag = (...args) => {
                window.__gtagCalls.push(args);
                if (args[0] === 'event') {
                    window.__affiliateEvents.push({ name: args[1], payload: args[2] });
                }
            };
        } else {
            window.gtag = undefined;
        }
        document.addEventListener('click', event => {
            const link = event.target && event.target.closest ? event.target.closest('[data-affiliate-link]') : null;
            if (link) {
                event.preventDefault();
                window.__blockedNavigations += 1;
            }
        }, true);
    }, { allowed, consentMode, gtagReady: gtagAvailable });
    await page.addScriptTag({ content: analyticsSource });
    return { page, blockedRequests };
}

async function wait(page, milliseconds) {
    await page.waitForTimeout(milliseconds);
}

async function events(page, name) {
    return page.evaluate(eventName => window.__affiliateEvents.filter(event => !eventName || event.name === eventName), name);
}

async function setConsent(page, allowed) {
    await page.evaluate(nextAllowed => {
        window.__analyticsAllowed = nextAllowed;
        window.ScreenSizeConsent = {
            canUseAnalytics: () => window.__analyticsAllowed
        };
        window.dispatchEvent(new CustomEvent('screenSizeConsentChanged', { detail: { analytics: nextAllowed } }));
    }, allowed);
}

async function setVisibility(page, hidden) {
    await page.evaluate(nextHidden => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => nextHidden });
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => nextHidden ? 'hidden' : 'visible' });
        document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
}

async function setGtag(page, available) {
    await page.evaluate(nextAvailable => {
        if (!nextAvailable) {
            window.gtag = undefined;
            return;
        }
        window.gtag = (...args) => {
            window.__gtagCalls.push(args);
            if (args[0] === 'event') {
                window.__affiliateEvents.push({ name: args[1], payload: args[2] });
            }
        };
    }, available);
}

async function testAcceptedExposure(browser) {
    const { page, blockedRequests } = await createPage(browser);
    try {
        await wait(page, 1300);
        const views = await events(page, 'affiliate_module_view');
        assert.strictEqual(views.length, 1, 'accepted exposure should emit one module view');
        assert.strictEqual(views[0].payload.module_id, 'fixture_module');
        assert.strictEqual(views[0].payload.category, 'fixture_placement');
        assert.deepStrictEqual(blockedRequests, [], 'accepted exposure must not make external requests');
    } finally {
        await page.close();
    }
}

async function testDeniedAndUnknown(browser) {
    for (const options of [{ allowed: false }, { consentMode: 'unknown', allowed: false }]) {
        const { page } = await createPage(browser, options);
        try {
            await wait(page, 1300);
            assert.strictEqual((await events(page, 'affiliate_module_view')).length, 0, 'denied or unknown consent must not emit');
        } finally {
            await page.close();
        }
    }
}

async function testConsentTransitions(browser) {
    const { page } = await createPage(browser, { allowed: false });
    try {
        await wait(page, 250);
        await setConsent(page, true);
        await wait(page, 1300);
        assert.strictEqual((await events(page, 'affiliate_module_view')).length, 1, 'consent acceptance should start a fresh timer');
    } finally {
        await page.close();
    }

    const revoked = await createPage(browser, { allowed: true });
    try {
        await wait(revoked.page, 250);
        await setConsent(revoked.page, false);
        await wait(revoked.page, 1100);
        assert.strictEqual((await events(revoked.page, 'affiliate_module_view')).length, 0, 'revoking consent during timing must cancel exposure');
        await setConsent(revoked.page, true);
        await wait(revoked.page, 1300);
        assert.strictEqual((await events(revoked.page, 'affiliate_module_view')).length, 1, 're-acceptance should count only a fresh exposure');
    } finally {
        await revoked.page.close();
    }
}

async function testVisibilityAndReentry(browser) {
    const { page } = await createPage(browser, { allowed: true });
    try {
        await wait(page, 250);
        await page.locator('#affiliate-module').evaluate(element => { element.style.display = 'none'; });
        await wait(page, 1100);
        assert.strictEqual((await events(page, 'affiliate_module_view')).length, 0, 'short visibility must not emit');
        await page.locator('#affiliate-module').evaluate(element => { element.style.display = 'block'; });
        await wait(page, 1300);
        assert.strictEqual((await events(page, 'affiliate_module_view')).length, 1, 're-entry should start a new timer');
    } finally {
        await page.close();
    }

    const hidden = await createPage(browser, { allowed: true });
    try {
        await wait(hidden.page, 250);
        await setVisibility(hidden.page, true);
        await wait(hidden.page, 1100);
        assert.strictEqual((await events(hidden.page, 'affiliate_module_view')).length, 0, 'hidden page must cancel timing');
        await setVisibility(hidden.page, false);
        await wait(hidden.page, 1300);
        assert.strictEqual((await events(hidden.page, 'affiliate_module_view')).length, 1, 'visible recovery should re-evaluate current visibility');
    } finally {
        await hidden.page.close();
    }
}

async function testGtagRecovery(browser) {
    const { page } = await createPage(browser, { allowed: true, gtagAvailable: false });
    try {
        await wait(page, 1300);
        assert.strictEqual((await events(page, 'affiliate_module_view')).length, 0, 'missing gtag must not mark the module complete');
        await setGtag(page, true);
        await page.locator('#affiliate-module').evaluate(element => { element.style.display = 'none'; });
        await wait(page, 100);
        await page.locator('#affiliate-module').evaluate(element => { element.style.display = 'block'; });
        await wait(page, 1300);
        assert.strictEqual((await events(page, 'affiliate_module_view')).length, 1, 'gtag recovery plus re-entry should allow one attempt');
    } finally {
        await page.close();
    }
}

async function testRepeatedInitializationAndClicks(browser) {
    const { page, blockedRequests } = await createPage(browser, { allowed: true });
    try {
        await page.addScriptTag({ content: analyticsSource });
        await wait(page, 1300);
        assert.strictEqual((await events(page, 'affiliate_module_view')).length, 1, 'repeated initialization must not duplicate exposure');
        await page.locator('#affiliate-link').click();
        await page.locator('#affiliate-link').click();
        assert.strictEqual((await events(page, 'affiliate_click')).length, 2, 'two real clicks must preserve the existing two-event policy');
        const click = (await events(page, 'affiliate_click'))[0];
        assert.strictEqual(click.payload.link_id, 'fixture_amazon_monitor');
        assert.strictEqual(click.payload.module_id, 'fixture_module');
        assert.strictEqual(blockedRequests.length, 0, 'external navigation must be intercepted before a request');
        assert.strictEqual(await page.evaluate(() => window.__blockedNavigations), 2);
    } finally {
        await page.close();
    }
}

async function testNonAffiliateAndNonEnglish(browser) {
    const { page } = await createPage(browser, { allowed: true, language: 'zh', withModule: false });
    try {
        await page.evaluate(() => {
            const button = document.querySelector('#tool-action');
            button.addEventListener('click', () => window.ScreenSizeAnalytics.trackComparison({ result_type: 'comparison' }));
        });
        await page.locator('#tool-action').click();
        const toolEvents = await events(page, 'comparison_calculated');
        assert.strictEqual(toolEvents.length, 1, 'non-affiliate tool event should remain available');
        assert.strictEqual(toolEvents[0].payload.language, 'zh');
        assert.strictEqual((await events(page, 'affiliate_module_view')).length, 0, 'non-English page without a module must not gain affiliate exposure');
    } finally {
        await page.close();
    }
}

async function main() {
    const executablePath = resolveBrowserExecutable();
    assert.ok(executablePath, 'Chromium, Chrome, or Edge is required for this test.');
    const browser = await chromium.launch({ executablePath, headless: true });
    try {
        await testAcceptedExposure(browser);
        await testDeniedAndUnknown(browser);
        await testConsentTransitions(browser);
        await testVisibilityAndReentry(browser);
        await testGtagRecovery(browser);
        await testRepeatedInitializationAndClicks(browser);
        await testNonAffiliateAndNonEnglish(browser);
    } finally {
        await browser.close();
    }
    console.log('Affiliate analytics browser DOM tests passed with external statistics and navigation intercepted.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
