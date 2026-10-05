#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const manualAdsSource = fs.readFileSync(path.join(repoRoot, 'js', 'manual-ads.js'), 'utf8');

function resolveBrowserExecutable() {
    const bundledPath = chromium.executablePath();
    if (fs.existsSync(bundledPath)) return bundledPath;

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

function fixtureHtml({ slotId = '123456', clientId = 'ca-pub-9212629010224868' } = {}) {
    return `<!doctype html>
<html><head><meta charset="utf-8"></head><body>
<aside id="manual-ad" data-manual-ad-slot="${slotId}" data-ad-client="${clientId}" aria-label="Advertisement">
    <div data-manual-ad-empty>Manual ad slot pending.</div>
</aside>
</body></html>`;
}

async function createPage(browser, { production = false, allowed = true, slotId, clientId, throwPush = false } = {}) {
    const page = await browser.newPage();
    const html = fixtureHtml({ slotId, clientId });

    if (production) {
        await page.route('**/*', route => {
            if (route.request().isNavigationRequest()) {
                return route.fulfill({
                    status: 200,
                    contentType: 'text/html',
                    body: html
                });
            }
            return route.abort();
        });
        await page.goto('https://screensizechecker.com/manual-ad-test.html', { waitUntil: 'domcontentloaded' });
    } else {
        await page.setContent(html);
    }

    await page.evaluate(({ initialAllowed, shouldThrow }) => {
        window.__adAllowed = initialAllowed;
        window.__adPushes = 0;
        window.ScreenSizeConsent = {
            canUseAdvertising: () => window.__adAllowed
        };
        window.adsbygoogle = [];
        window.adsbygoogle.push = function () {
            window.__adPushes += 1;
            if (shouldThrow) throw new Error('simulated adsbygoogle failure');
            return window.__adPushes;
        };
    }, { initialAllowed: allowed, shouldThrow: throwPush });

    await page.addScriptTag({ content: manualAdsSource });
    await page.waitForTimeout(50);
    return page;
}

async function testAllowedInitialization(browser) {
    const page = await createPage(browser, { allowed: true });
    try {
        assert.strictEqual(await page.locator('#manual-ad').getAttribute('data-manual-ad-initialized'), 'true');
        assert.strictEqual(await page.locator('#manual-ad ins.adsbygoogle').count(), 1);
        assert.strictEqual(await page.evaluate(() => window.__adPushes), 1);

        await page.addScriptTag({ content: manualAdsSource });
        assert.strictEqual(await page.evaluate(() => window.__adPushes), 1, 're-initialization must not push twice');
        assert.strictEqual(await page.locator('#manual-ad ins.adsbygoogle').count(), 1);
    } finally {
        await page.close();
    }
}

async function testConsentTransition(browser) {
    const page = await createPage(browser, { allowed: false });
    try {
        assert.strictEqual(await page.locator('#manual-ad ins.adsbygoogle').count(), 0);
        await page.evaluate(() => {
            window.__adAllowed = true;
            window.dispatchEvent(new CustomEvent('screenSizeConsentChanged'));
        });
        await page.waitForTimeout(50);
        assert.strictEqual(await page.evaluate(() => window.__adPushes), 1, 'accepted advertising consent should initialize once');
    } finally {
        await page.close();
    }
}

async function testEmptyAndInvalidSlots(browser) {
    for (const slotId of ['', 'not-a-slot']) {
        const page = await createPage(browser, { allowed: true, slotId });
        try {
            assert.strictEqual(await page.locator('#manual-ad ins.adsbygoogle').count(), 0);
            assert.strictEqual(await page.evaluate(() => window.__adPushes), 0);
            assert.strictEqual(await page.locator('#manual-ad').count(), 1, 'non-production placeholders remain visible');
        } finally {
            await page.close();
        }
    }

    const productionPage = await createPage(browser, { production: true, allowed: true, slotId: '' });
    try {
        assert.strictEqual(await productionPage.locator('#manual-ad').count(), 0, 'production empty slots must be removed');
        assert.strictEqual(await productionPage.evaluate(() => window.__adPushes), 0);
    } finally {
        await productionPage.close();
    }
}

async function testPushFailure(browser) {
    const page = await createPage(browser, { allowed: true, throwPush: true });
    try {
        assert.strictEqual(await page.evaluate(() => window.__adPushes), 1);
        assert.strictEqual(await page.locator('#manual-ad').getAttribute('data-manual-ad-initialized'), null);
        assert.strictEqual(await page.locator('#manual-ad ins.adsbygoogle').count(), 0);
    } finally {
        await page.close();
    }
}

async function main() {
    const executablePath = resolveBrowserExecutable();
    assert.ok(executablePath, 'Chromium, Chrome, or Edge is required for this test.');
    const browser = await chromium.launch({ executablePath, headless: true });
    try {
        await testAllowedInitialization(browser);
        await testConsentTransition(browser);
        await testEmptyAndInvalidSlots(browser);
        await testPushFailure(browser);
    } finally {
        await browser.close();
    }
    console.log('Manual ad browser lifecycle tests passed with consent and external ad calls mocked.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
