const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const runtimeSource = fs.readFileSync(path.join(ROOT, 'js', 'consent-runtime.js'), 'utf8');

function createBrowser({ host = 'screensizechecker.com', trace = 'loc=US\n', gpc = false, saved = null, fetchError = false } = {}) {
    const scripts = [];
    const listeners = {};
    const storage = new Map(saved ? [['screenSizeConsent', JSON.stringify(saved)]] : []);
    const document = {
        head: { appendChild(node) { scripts.push(node); } },
        body: { appendChild() {} },
        addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
        createElement() {
            return {
                setAttribute() {},
                addEventListener() {},
                remove() {}
            };
        },
        getElementById() { return null; },
        querySelector() { return null; }
    };
    const window = {
        location: { hostname: host },
        navigator: { globalPrivacyControl: gpc },
        document,
        dataLayer: [],
        localStorage: {
            getItem(key) { return storage.get(key) || null; },
            setItem(key, value) { storage.set(key, value); }
        },
        setTimeout,
        clearTimeout,
        AbortController,
        CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } },
        fetch() {
            return fetchError
                ? Promise.reject(new Error('timeout'))
                : Promise.resolve({ ok: true, text: () => Promise.resolve(trace) });
        }
    };
    window.window = window;
    vm.runInNewContext(runtimeSource, { window, document, Promise, Boolean, String, JSON, Array, Error, AbortController, setTimeout, clearTimeout });
    return { window, scripts };
}

async function settle() {
    await new Promise(resolve => setTimeout(resolve, 20));
}

function scriptSources(scripts) {
    return scripts.map(script => script.src).filter(Boolean);
}

async function testUsDefault() {
    const { window, scripts } = createBrowser();
    await settle();
    const consentUpdates = window.dataLayer.filter(args => args[0] === 'consent' && args[1] === 'update');
    assert.deepStrictEqual(JSON.parse(JSON.stringify(consentUpdates[0][2])), {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
    });
    assert.ok(scriptSources(scripts).some(src => src.includes('googletagmanager')));
    assert.ok(scriptSources(scripts).some(src => src.includes('clarity.ms')));
    assert.ok(scriptSources(scripts).some(src => src.includes('googlesyndication')));
}

async function testGpc() {
    const { window, scripts } = createBrowser({ gpc: true });
    await settle();
    assert.deepStrictEqual(JSON.parse(JSON.stringify(window.dataLayer[0][2])), {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
    });
    assert.strictEqual(scripts.length, 0);
    const length = window.dataLayer.length;
    window.gtag('event', 'blocked_event');
    assert.strictEqual(window.dataLayer.length, length);
}

async function testNonGatedDefault() {
    const { window, scripts } = createBrowser({ trace: 'loc=CA\n' });
    await settle();
    const consentUpdates = window.dataLayer.filter(args => args[0] === 'consent' && args[1] === 'update');
    assert.deepStrictEqual(JSON.parse(JSON.stringify(consentUpdates[0][2])), {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
    });
    assert.ok(scriptSources(scripts).some(src => src.includes('googletagmanager')));
    assert.ok(scriptSources(scripts).some(src => src.includes('clarity.ms')));
    assert.ok(scriptSources(scripts).some(src => src.includes('googlesyndication')));
}

async function testRestrictedAndTimeout() {
    for (const options of [{ trace: 'loc=DE\n' }, { fetchError: true }]) {
        const { window, scripts } = createBrowser(options);
        await settle();
        assert.strictEqual(window.ScreenSizeConsent.canUseAnalytics(), false);
        assert.ok(scriptSources(scripts).some(src => src.includes('googletagmanager')));
        assert.ok(scriptSources(scripts).some(src => src.includes('googlesyndication')));
        assert.ok(!scriptSources(scripts).some(src => src.includes('clarity.ms')));
    }
}

async function testGoogleRevocationApi() {
    const restricted = createBrowser({ trace: 'loc=DE\n' });
    await settle();
    let directCalls = 0;
    restricted.window.googlefc = { showRevocationMessage: () => { directCalls += 1; } };
    assert.strictEqual(restricted.window.ScreenSizeConsent.openPrivacyChoices(), true);
    assert.strictEqual(directCalls, 1);

    const queued = createBrowser({ trace: 'loc=DE\n' });
    await settle();
    const callbackQueue = [];
    queued.window.googlefc = { callbackQueue };
    assert.strictEqual(queued.window.ScreenSizeConsent.openPrivacyChoices(), true);
    assert.strictEqual(callbackQueue.length, 1);
    assert.ok(typeof callbackQueue[0].CONSENT_API_READY === 'function');
    let queuedCalls = 0;
    queued.window.googlefc.showRevocationMessage = () => { queuedCalls += 1; };
    callbackQueue[0].CONSENT_API_READY();
    assert.strictEqual(queuedCalls, 1);
    assert.strictEqual(queued.window.localStorage.getItem('screenSizeConsent'), null);
}

function testDeniedAnalyticsHelper() {
    const source = fs.readFileSync(path.join(ROOT, 'js', 'analytics.js'), 'utf8');
    const calls = [];
    const document = { documentElement: { lang: 'en' }, addEventListener() {}, querySelectorAll() { return []; } };
    const window = {
        location: { pathname: '/' },
        document,
        ScreenSizeConsent: { canUseAnalytics: () => false },
        gtag(...args) { calls.push(args); },
        IntersectionObserver: undefined
    };
    vm.runInNewContext(source, { window, document, Object, String, Number, Date, RegExp, Array });
    assert.strictEqual(window.ScreenSizeAnalytics.track('test_event'), false);
    assert.strictEqual(calls.length, 0);
}

function testStaticContracts() {
    const head = fs.readFileSync(path.join(ROOT, 'components', 'head.html'), 'utf8');
    const privacy = fs.readFileSync(path.join(ROOT, 'privacy-policy.html'), 'utf8');
    const terms = fs.readFileSync(path.join(ROOT, 'terms-of-service.html'), 'utf8');
    assert.ok(head.indexOf('consent-runtime.js') < head.indexOf('SEO Meta Tags'));
    assert.strictEqual((head.match(/googletagmanager\.com\/gtag/g) || []).length, 0);
    assert.strictEqual((head.match(/adsbygoogle\.js/g) || []).length, 0);
    assert.ok(privacy.includes('consent-runtime.js'));
    assert.ok(terms.includes('consent-runtime.js'));
    assert.ok(privacy.includes('August 21, 2026'));
    assert.ok(privacy.includes('Google AdSense'));
    assert.ok(privacy.includes('Privacy &amp; Messaging'));
    assert.strictEqual((head + privacy + terms).match(/data-ad-slot/g), null);

    const internalLinks = fs.readFileSync(path.join(ROOT, 'js', 'internal-links.js'), 'utf8');
    assert.ok(internalLinks.includes("window.gtag && window.ScreenSizeConsent && window.ScreenSizeConsent.canUseAnalytics()"));
}

(async () => {
    await testUsDefault();
    await testNonGatedDefault();
    await testGpc();
    await testRestrictedAndTimeout();
    await testGoogleRevocationApi();
    testDeniedAnalyticsHelper();
    testStaticContracts();
    console.log('Consent runtime, tag ordering, GPC, restricted defaults, analytics gating, and policy contracts passed.');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
