// analytics.js - GA4 event helper for low-cardinality tool analytics.
(function () {
    'use strict';

    var TOOL_PATHS = [
        { match: /\/devices\/compare(?:\/|$)?/, pageId: 'compare', toolName: 'screen_compare', resultType: 'comparison' },
        { match: /\/devices\/ppi-calculator(?:\/|$)?/, pageId: 'ppi-calculator', toolName: 'ppi_calculator', resultType: 'ppi' },
        { match: /\/devices\/aspect-ratio-calculator(?:\/|$)?/, pageId: 'aspect-ratio-calculator', toolName: 'aspect_ratio_calculator', resultType: 'aspect_ratio' },
        { match: /\/devices\/projection-calculator(?:\/|$)?/, pageId: 'projection-calculator', toolName: 'projection_calculator', resultType: 'projection' },
        { match: /\/devices\/responsive-tester(?:\/|$)?/, pageId: 'responsive-tester', toolName: 'responsive_tester', resultType: 'viewport' }
    ];

    var sentOnce = Object.create(null);
    var recentEvents = Object.create(null);
    var recentEventTtlMs = 750;

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

    window.ScreenSizeAnalytics = {
        track: track,
        trackToolResult: trackToolResult,
        trackCopy: trackCopy,
        trackComparison: trackComparison,
        trackCalculatorCompleted: trackCalculatorCompleted,
        getPageContext: getPageContext
    };
})();
