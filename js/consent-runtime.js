(function (window, document) {
    'use strict';

    var PRODUCTION_HOST = /(^|\.)screensizechecker\.com$/;
    var GOOGLE_ANALYTICS_ID = 'G-X0Y5SZGFMX';
    var ADSENSE_CLIENT = 'ca-pub-9212629010224868';
    var STORAGE_KEY = 'screenSizeConsent';
    var CMP_REGIONS = {
        AT: true, BE: true, BG: true, HR: true, CY: true, CZ: true, DK: true,
        EE: true, FI: true, FR: true, DE: true, GR: true, HU: true, IE: true,
        IT: true, LV: true, LT: true, LU: true, MT: true, NL: true, PL: true,
        PT: true, RO: true, SK: true, SI: true, ES: true, SE: true,
        IS: true, LI: true, NO: true, GB: true, CH: true
    };
    var DENIED = {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
    };
    var state = {
        region: null,
        analytics: false,
        advertising: false,
        explicit: null,
        gpc: Boolean(window.navigator && window.navigator.globalPrivacyControl),
        ready: false,
        googleAnalyticsLoaded: false,
        adsenseLoaded: false,
        clarityLoaded: false
    };

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        if (arguments[0] === 'event' && !state.analytics) {
            return;
        }
        window.dataLayer.push(arguments);
    };
    window.gtag('consent', 'default', DENIED);

    function isProductionHost() {
        return PRODUCTION_HOST.test(window.location.hostname || '');
    }

    function readSavedChoice() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return null;
            }
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.analytics !== 'boolean' || typeof parsed.advertising !== 'boolean') {
                return null;
            }
            return {
                analytics: parsed.analytics,
                advertising: parsed.advertising
            };
        } catch (error) {
            return null;
        }
    }

    function updateGoogleConsent(analytics, advertising) {
        var values = {
            ad_storage: advertising ? 'granted' : 'denied',
            analytics_storage: analytics ? 'granted' : 'denied',
            ad_user_data: advertising ? 'granted' : 'denied',
            ad_personalization: advertising ? 'granted' : 'denied'
        };
        window.gtag('consent', 'update', values);
        state.analytics = analytics;
        state.advertising = advertising;
        if (typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
            window.dispatchEvent(new window.CustomEvent('screenSizeConsentChanged', { detail: getPublicState() }));
        }
    }

    function getPublicState() {
        return {
            region: state.region,
            analytics: state.analytics,
            advertising: state.advertising,
            explicit: Boolean(state.explicit),
            gpc: state.gpc,
            ready: state.ready
        };
    }

    function appendScript(id, src, attributes) {
        if (document.getElementById(id)) {
            return;
        }
        var script = document.createElement('script');
        script.id = id;
        script.async = true;
        script.src = src;
        Object.keys(attributes || {}).forEach(function (key) {
            script.setAttribute(key, attributes[key]);
        });
        document.head.appendChild(script);
    }

    function loadGoogleAnalytics() {
        if (state.googleAnalyticsLoaded) {
            return;
        }
        state.googleAnalyticsLoaded = true;
        appendScript('screen-size-google-analytics', 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS_ID);
        window.gtag('js', new Date());
        window.gtag('config', GOOGLE_ANALYTICS_ID);
    }

    function loadClarity() {
        if (state.clarityLoaded) {
            return;
        }
        state.clarityLoaded = true;
        var projectId = 'xi2qv9v3dh';
        window.clarity = window.clarity || function () {
            (window.clarity.q = window.clarity.q || []).push(arguments);
        };
        window.clarity('consentv2', {
            ad_Storage: 'denied',
            analytics_Storage: 'granted'
        });
        appendScript('screen-size-clarity', 'https://www.clarity.ms/tag/' + projectId);
    }

    function loadAdsense() {
        if (state.adsenseLoaded) {
            return;
        }
        state.adsenseLoaded = true;
        appendScript('screen-size-adsense', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT, {
            crossorigin: 'anonymous'
        });
    }

    function parseRegion(text) {
        var match = String(text || '').match(/(?:^|\n)loc=([A-Za-z]{2})(?:\n|$)/);
        return match ? match[1].toUpperCase() : null;
    }

    function isCmpRegion(region) {
        return Boolean(region && CMP_REGIONS[region]);
    }

    function fetchRegion() {
        if (typeof window.fetch !== 'function' || typeof window.AbortController !== 'function') {
            return Promise.resolve(null);
        }
        var controller = new AbortController();
        var timer = window.setTimeout(function () { controller.abort(); }, 3000);
        return window.fetch('/cdn-cgi/trace', { cache: 'no-store', signal: controller.signal })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('region lookup failed');
                }
                return response.text();
            })
            .then(parseRegion)
            .catch(function () { return null; })
            .finally(function () { window.clearTimeout(timer); });
    }

    function showFallbackDialog() {
        var existing = document.querySelector('[data-consent-dialog]');
        if (existing) {
            existing.remove();
        }
        var dialog = document.createElement('div');
        dialog.className = 'consent-dialog-backdrop';
        dialog.setAttribute('data-consent-dialog', 'true');
        dialog.innerHTML = '<div class="consent-dialog" role="dialog" aria-modal="true" aria-labelledby="consent-dialog-title">' +
            '<h2 id="consent-dialog-title">Privacy choices</h2>' +
            (state.region === 'US' && !state.gpc
                ? '<label><input type="checkbox" data-consent-analytics ' + (state.analytics ? 'checked' : '') + '> Analytics</label>' +
                  '<label><input type="checkbox" data-consent-advertising ' + (state.advertising ? 'checked' : '') + '> Advertising</label>' +
                  '<div class="consent-dialog-actions"><button type="button" data-consent-save>Save choices</button><button type="button" data-consent-accept>Accept all</button>'
                : '<p>Privacy choices are managed by Google Privacy &amp; Messaging for this region.</p><div class="consent-dialog-actions">') +
            '<button type="button" data-consent-close>Close</button></div></div>';
        document.body.appendChild(dialog);
        var close = function () { dialog.remove(); };
        dialog.querySelector('[data-consent-close]').addEventListener('click', close);
        var save = dialog.querySelector('[data-consent-save]');
        if (save) {
            save.addEventListener('click', function () {
                updatePreferences(
                    dialog.querySelector('[data-consent-analytics]').checked,
                    dialog.querySelector('[data-consent-advertising]').checked
                );
                close();
            });
        }
        var accept = dialog.querySelector('[data-consent-accept]');
        if (accept) {
            accept.addEventListener('click', function () {
                updatePreferences(true, true);
                close();
            });
        }
    }

    function openPrivacyChoices() {
        if (isCmpRegion(state.region) || !state.region || state.gpc) {
            if (window.googlefc && typeof window.googlefc.showRevocationMessage === 'function') {
                window.googlefc.showRevocationMessage();
                return true;
            }
            if (window.googlefc && Array.isArray(window.googlefc.callbackQueue)) {
                window.googlefc.callbackQueue.push({
                    CONSENT_API_READY: function () {
                        if (window.googlefc && typeof window.googlefc.showRevocationMessage === 'function') {
                            window.googlefc.showRevocationMessage();
                        }
                    }
                });
                return true;
            }
        }
        showFallbackDialog();
        return true;
    }

    function updatePreferences(analytics, advertising) {
        if (isCmpRegion(state.region) || !state.region || state.gpc) {
            return false;
        }
        state.explicit = { analytics: Boolean(analytics), advertising: Boolean(advertising) };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.explicit));
        updateGoogleConsent(state.explicit.analytics, state.explicit.advertising);
        if (state.analytics) {
            loadGoogleAnalytics();
            loadClarity();
        }
        if (state.advertising) {
            loadAdsense();
        }
        return true;
    }

    function resolveConsent(region) {
        state.region = region;
        if (state.gpc) {
            state.ready = true;
            return;
        }
        if (!region || isCmpRegion(region)) {
            updateGoogleConsent(false, false);
            loadGoogleAnalytics();
            loadAdsense();
        } else {
            state.explicit = readSavedChoice();
            var choice = state.explicit || { analytics: true, advertising: true };
            updateGoogleConsent(choice.analytics, choice.advertising);
            if (state.analytics) {
                loadGoogleAnalytics();
                loadClarity();
            }
            if (state.advertising) {
                loadAdsense();
            }
        }
        state.ready = true;
        if (typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
            window.dispatchEvent(new window.CustomEvent('screenSizeConsentReady', { detail: getPublicState() }));
        }
    }

    window.ScreenSizeConsent = {
        canUseAnalytics: function () { return state.analytics; },
        canUseAdvertising: function () { return state.advertising; },
        getState: getPublicState,
        openPrivacyChoices: openPrivacyChoices,
        updatePreferences: updatePreferences
    };

    document.addEventListener('click', function (event) {
        var trigger = event.target && event.target.closest ? event.target.closest('[data-privacy-settings]') : null;
        if (trigger) {
            event.preventDefault();
            openPrivacyChoices();
        }
    });

    if (isProductionHost()) {
        fetchRegion().then(resolveConsent);
    } else {
        state.ready = true;
    }
})(window, document);
