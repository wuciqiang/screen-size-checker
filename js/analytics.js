// analytics.js - GA4 event helper for low-cardinality tool analytics.
(function () {
    'use strict';

    var TOOL_PATHS = [
        { match: /\/devices\/compare(?:\/|$)?/, pageId: 'compare', toolName: 'screen_compare', resultType: 'comparison' },
        { match: /\/devices\/ppi-calculator(?:\/|$)?/, pageId: 'ppi-calculator', toolName: 'ppi_calculator', resultType: 'ppi' },
        { match: /\/devices\/aspect-ratio-calculator(?:\/|$)?/, pageId: 'aspect-ratio-calculator', toolName: 'aspect_ratio_calculator', resultType: 'aspect_ratio' },
        { match: /\/devices\/projection-calculator(?:\/|$)?/, pageId: 'projection-calculator', toolName: 'projection_calculator', resultType: 'projection' },
        { match: /\/devices\/responsive-tester(?:\/|$)?/, pageId: 'responsive-tester', toolName: 'responsive_tester', resultType: 'viewport' },
        { match: /\/resolution-test(?:\/|$)?/, pageId: 'resolution-test', toolName: 'resolution_test', resultType: 'screen_info' }
    ];

    var sentOnce = Object.create(null);
    var recentEvents = Object.create(null);
    var recentEventTtlMs = 750;
    var affiliateTrackerState = document.__screenSizeAffiliateTrackerState;

    if (!affiliateTrackerState) {
        affiliateTrackerState = {
            clickListenerBound: false,
            domReadyBound: false,
            moduleTrackingInitialized: false,
            lifecycleListenersBound: false,
            modules: [],
            observer: null
        };
        document.__screenSizeAffiliateTrackerState = affiliateTrackerState;
    }

    function getLanguage() {
        return (document.documentElement && document.documentElement.lang) || 'en';
    }

    function getPageContext() {
        var path = window.location.pathname || '/';
        var normalizedPath = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');

        for (var i = 0; i < TOOL_PATHS.length; i += 1) {
            if (TOOL_PATHS[i].match.test(normalizedPath)) {
                return {
                    page_id: TOOL_PATHS[i].pageId,
                    tool_name: TOOL_PATHS[i].toolName,
                    result_type: TOOL_PATHS[i].resultType
                };
            }
        }

        if (/^\/(?:zh|de|es|pt|fr)?\/?$/.test(normalizedPath) || normalizedPath === '/') {
            return {
                page_id: 'home',
                tool_name: 'screen_size_checker',
                result_type: 'viewport'
            };
        }

        return {
            page_id: normalizedPath.split('/').filter(Boolean).pop() || 'home'
        };
    }

    function cleanValue(value) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }

        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : undefined;
        }

        if (typeof value === 'boolean') {
            return value;
        }

        return String(value).slice(0, 100);
    }

    function cleanParams(params) {
        var result = {};
        Object.keys(params || {}).forEach(function (key) {
            var value = cleanValue(params[key]);
            if (value !== undefined) {
                result[key] = value;
            }
        });
        return result;
    }

    function getRecentEventKey(eventName, payload) {
        return [
            eventName,
            payload.page_id || '',
            payload.tool_name || '',
            payload.tool_action || '',
            payload.result_type || '',
            payload.language || ''
        ].join('|');
    }

    function shouldSkipRecentDuplicate(eventName, payload, options) {
        var opts = options || {};
        var ttl = typeof opts.dedupeMs === 'number' ? opts.dedupeMs : recentEventTtlMs;
        if (ttl <= 0) {
            return false;
        }

        var now = Date.now();
        var key = getRecentEventKey(eventName, payload);
        if (recentEvents[key] && now - recentEvents[key] < ttl) {
            return true;
        }

        recentEvents[key] = now;
        return false;
    }

    function track(eventName, params, options) {
        var opts = options || {};
        if (!window.ScreenSizeConsent || !window.ScreenSizeConsent.canUseAnalytics()) {
            return false;
        }
        if (opts.onceKey) {
            if (sentOnce[opts.onceKey]) {
                return false;
            }
            sentOnce[opts.onceKey] = true;
        }

        if (typeof window.gtag !== 'function') {
            return false;
        }

        var payload = cleanParams(Object.assign(
            {},
            getPageContext(),
            {
                language: getLanguage()
            },
            params || {}
        ));

        if (shouldSkipRecentDuplicate(eventName, payload, opts)) {
            return false;
        }

        window.gtag('event', eventName, payload);
        return true;
    }

    function trackToolResult(params, options) {
        return track('tool_result_view', Object.assign({
            tool_action: 'view_result'
        }, params || {}), options);
    }

    function trackCopy(params, options) {
        return track('copy_result', Object.assign({
            tool_action: 'copy'
        }, params || {}), options);
    }

    function trackComparison(params, options) {
        return track('comparison_calculated', Object.assign({
            tool_name: 'screen_compare',
            tool_action: 'calculate',
            result_type: 'comparison'
        }, params || {}), options);
    }

    function trackCalculatorCompleted(params, options) {
        return track('calculator_completed', Object.assign({
            tool_action: 'calculate'
        }, params || {}), options);
    }

    function trackAffiliateClick(params, options) {
        return track('affiliate_click', Object.assign({
            tool_name: 'affiliate_links',
            tool_action: 'affiliate_click'
        }, params || {}), options);
    }

    function trackAffiliateModuleView(params, options) {
        return track('affiliate_module_view', Object.assign({
            tool_name: 'affiliate_links',
            tool_action: 'module_view'
        }, params || {}), options);
    }

    function handleAffiliateClick(event) {
        var link = event.target && event.target.closest ? event.target.closest('[data-affiliate-link]') : null;
        if (!link) {
            return;
        }

        var module = link.closest && link.closest('[data-affiliate-module]');

        trackAffiliateClick({
            affiliate_program: link.getAttribute('data-affiliate-program') || 'unknown',
            tool_action: link.getAttribute('data-affiliate-action') || 'affiliate_click',
            result_type: link.getAttribute('data-affiliate-result') || 'affiliate',
            link_id: link.getAttribute('data-affiliate-link-id') || 'unknown',
            product_id: link.getAttribute('data-affiliate-product') || 'unknown',
            marketplace: link.getAttribute('data-affiliate-marketplace') || 'unknown',
            module_id: module ? (module.getAttribute('data-affiliate-module-id') || 'unknown') : 'unknown',
            category: module ? (module.getAttribute('data-affiliate-placement') || 'unknown') : 'unknown'
        }, {
            dedupeMs: 0
        });
    }

    var affiliateModuleViewThreshold = 0.5;
    var affiliateModuleViewDelayMs = 1000;

    function clearAffiliateModuleTimer(module) {
        if (module.__affiliateViewTimer !== null && module.__affiliateViewTimer !== undefined) {
            window.clearTimeout(module.__affiliateViewTimer);
            module.__affiliateViewTimer = null;
        }
    }

    function canUseAffiliateAnalytics() {
        return Boolean(
            window.ScreenSizeConsent &&
            typeof window.ScreenSizeConsent.canUseAnalytics === 'function' &&
            window.ScreenSizeConsent.canUseAnalytics()
        );
    }

    function isDocumentVisible() {
        return document.visibilityState !== 'hidden' && !document.hidden;
    }

    function clearAffiliateModuleObservation(module) {
        clearAffiliateModuleTimer(module);
        if (affiliateTrackerState.observer && !module.__affiliateViewSent) {
            affiliateTrackerState.observer.unobserve(module);
        }
    }

    function pauseAffiliateModuleObservation() {
        for (var i = 0; i < affiliateTrackerState.modules.length; i += 1) {
            clearAffiliateModuleObservation(affiliateTrackerState.modules[i]);
        }
    }

    function observePendingAffiliateModules() {
        if (!affiliateTrackerState.observer || !canUseAffiliateAnalytics() || !isDocumentVisible()) {
            return;
        }

        for (var i = 0; i < affiliateTrackerState.modules.length; i += 1) {
            var module = affiliateTrackerState.modules[i];
            if (module.__affiliateViewSent) {
                continue;
            }
            clearAffiliateModuleTimer(module);
            affiliateTrackerState.observer.unobserve(module);
            affiliateTrackerState.observer.observe(module);
        }
    }

    function fireAffiliateModuleView(module, observer) {
        clearAffiliateModuleTimer(module);
        if (module.__affiliateViewSent || !canUseAffiliateAnalytics() || !isDocumentVisible()) {
            return;
        }

        var tracked = trackAffiliateModuleView({
            affiliate_program: module.getAttribute('data-affiliate-program') || 'unknown',
            result_type: module.getAttribute('data-affiliate-result') || 'affiliate',
            category: module.getAttribute('data-affiliate-placement') || 'unknown',
            module_id: module.getAttribute('data-affiliate-module-id') || 'unknown'
        }, {
            dedupeMs: 0
        });

        if (!tracked) {
            return;
        }

        module.__affiliateViewSent = true;
        observer.unobserve(module);
    }

    function scheduleAffiliateModuleView(module, observer) {
        if (
            module.__affiliateViewSent ||
            (module.__affiliateViewTimer !== null && module.__affiliateViewTimer !== undefined) ||
            !canUseAffiliateAnalytics() ||
            !isDocumentVisible()
        ) {
            return;
        }
        module.__affiliateViewTimer = window.setTimeout(function () {
            fireAffiliateModuleView(module, observer);
        }, affiliateModuleViewDelayMs);
    }

    function handleAffiliateModuleEntries(entries, observer) {
        for (var i = 0; i < entries.length; i += 1) {
            var entry = entries[i];
            if (!entry || !entry.target) {
                continue;
            }
            if (entry.intersectionRatio >= affiliateModuleViewThreshold && canUseAffiliateAnalytics() && isDocumentVisible()) {
                scheduleAffiliateModuleView(entry.target, observer);
            } else {
                clearAffiliateModuleTimer(entry.target);
            }
        }
    }

    function reconcileAffiliateModuleObservation() {
        if (!canUseAffiliateAnalytics() || !isDocumentVisible()) {
            pauseAffiliateModuleObservation();
            return;
        }
        observePendingAffiliateModules();
    }

    function handleAffiliateVisibilityChange() {
        reconcileAffiliateModuleObservation();
    }

    function handleAffiliatePageHide() {
        pauseAffiliateModuleObservation();
        if (affiliateTrackerState.observer) {
            affiliateTrackerState.observer.disconnect();
        }
    }

    function handleAffiliatePageShow() {
        reconcileAffiliateModuleObservation();
    }

    function bindAffiliateLifecycleListeners() {
        if (affiliateTrackerState.lifecycleListenersBound) {
            return;
        }

        affiliateTrackerState.lifecycleListenersBound = true;
        document.addEventListener('visibilitychange', handleAffiliateVisibilityChange);
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('screenSizeConsentReady', reconcileAffiliateModuleObservation);
            window.addEventListener('screenSizeConsentChanged', reconcileAffiliateModuleObservation);
            window.addEventListener('pagehide', handleAffiliatePageHide);
            window.addEventListener('pageshow', handleAffiliatePageShow);
        }
    }

    function initAffiliateModuleViewTracking() {
        if (affiliateTrackerState.moduleTrackingInitialized) {
            return;
        }
        affiliateTrackerState.moduleTrackingInitialized = true;

        if (typeof window.IntersectionObserver !== 'function') {
            return;
        }

        affiliateTrackerState.modules = Array.prototype.slice.call(document.querySelectorAll('[data-affiliate-module]'));
        if (!affiliateTrackerState.modules.length) {
            return;
        }

        bindAffiliateLifecycleListeners();
        affiliateTrackerState.observer = new IntersectionObserver(handleAffiliateModuleEntries, {
            threshold: [0, affiliateModuleViewThreshold]
        });
        observePendingAffiliateModules();
    }

    function initAffiliateTracking() {
        if (affiliateTrackerState.clickListenerBound) {
            return;
        }
        affiliateTrackerState.clickListenerBound = true;
        document.addEventListener('click', handleAffiliateClick);
    }

    if (document.readyState === 'loading') {
        if (!affiliateTrackerState.domReadyBound) {
            affiliateTrackerState.domReadyBound = true;
            document.addEventListener('DOMContentLoaded', initAffiliateTracking, { once: true });
            document.addEventListener('DOMContentLoaded', initAffiliateModuleViewTracking, { once: true });
        }
    } else {
        initAffiliateTracking();
        initAffiliateModuleViewTracking();
    }

    window.ScreenSizeAnalytics = {
        track: track,
        trackToolResult: trackToolResult,
        trackCopy: trackCopy,
        trackComparison: trackComparison,
        trackCalculatorCompleted: trackCalculatorCompleted,
        trackAffiliateClick: trackAffiliateClick,
        trackAffiliateModuleView: trackAffiliateModuleView,
        getPageContext: getPageContext
    };
})();
