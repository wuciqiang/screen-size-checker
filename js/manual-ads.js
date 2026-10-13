(function (window, document) {
    'use strict';
    if (window.__screenSizeManualAds) return;
    window.__screenSizeManualAds = true;
    var productionHost = /(^|\.)screensizechecker\.com$/.test(window.location.hostname || '');
    var pending = new Set();
    var pendingReach = new Set();
    var reachedPositions = new Set();
    var suspended = false;
    var listenersBound = false;
    var observer = window.IntersectionObserver ? new window.IntersectionObserver(checkPending, { rootMargin: '300px 0px' }) : null;
    // Natural reach is independent of the advertising preload boundary.
    // Zero-area edge contact is also "intersecting"; the positive threshold
    // ensures a second notification when that contact becomes visible area.
    var reachObserver = window.IntersectionObserver ? new window.IntersectionObserver(checkReached, { rootMargin: '0px', threshold: [0, Number.EPSILON] }) : null;

    function isValidSlotId(value) { return /^[1-9]\d*$/.test(value); }
    function isValidClientId(value) { return /^ca-pub-\d+$/.test(value); }
    function allowed() {
        return isVisible() && window.ScreenSizeConsent && window.ScreenSizeConsent.canUseAdvertising();
    }
    function isVisible() {
        return !suspended && document.visibilityState !== 'hidden' && !document.hidden;
    }
    function isMeasuredPosition(slot) {
        var position = slot.getAttribute('data-manual-ad-position');
        return position === 'compare_results_after' || position === 'best_monitor_size_fps_after_guidance';
    }
    function checkReached() {
        if (!isVisible() || !window.ScreenSizeAnalytics || typeof window.ScreenSizeAnalytics.track !== 'function') return;
        pendingReach.forEach(function (slot) {
            var content = slot.querySelector('[data-manual-ad-content]');
            if (!content) return;
            var rect = content.getBoundingClientRect();
            var viewportWidth = document.documentElement.clientWidth || window.innerWidth;
            var viewportHeight = document.documentElement.clientHeight || window.innerHeight;
            if (rect.width <= 0 || rect.height <= 0 || rect.top >= viewportHeight || rect.bottom <= 0 ||
                rect.left >= viewportWidth || rect.right <= 0) return;
            var position = slot.getAttribute('data-manual-ad-position');
            // Only a successful, consent-gated helper call consumes this page's reach.
            if (!reachedPositions.has(position) && !window.ScreenSizeAnalytics.track('manual_ad_slot_reached', {
                tool_name: 'manual_ads',
                tool_action: 'slot_reached'
            }, { dedupeMs: 0 })) return;
            reachedPositions.add(position);
            pendingReach.delete(slot);
            if (reachObserver) reachObserver.unobserve(content);
        });
    }
    function checkSlots() {
        checkPending();
        checkReached();
    }
    function initializeSlot(slot) {
        if (!allowed() || slot.getAttribute('data-manual-ad-initialized') === 'true') return;
        var content = slot.querySelector('[data-manual-ad-content]');
        if (!content) return;
        var rect = content.getBoundingClientRect();
        if (rect.width < 250 || rect.height <= 0 || rect.top > window.innerHeight + 300 || rect.bottom < -300) return;
        var ad = document.createElement('ins');
        ad.className = 'adsbygoogle';
        // Google supports expandable width with a declared fixed height in inline CSS.
        ad.style.cssText = 'display:block;min-width:250px;max-width:970px;width:100%;height:250px;margin:0 auto';
        ad.setAttribute('data-ad-client', slot.getAttribute('data-ad-client'));
        ad.setAttribute('data-ad-slot', slot.getAttribute('data-manual-ad-slot'));
        content.appendChild(ad);
        slot.setAttribute('data-manual-ad-initialized', 'true');
        if (!window.adsbygoogle) window.adsbygoogle = [];
        try {
            window.adsbygoogle.push({});
            pending.delete(slot);
            if (observer) observer.unobserve(content);
        } catch (error) {
            slot.removeAttribute('data-manual-ad-initialized');
            ad.remove();
            console.warn('Manual ad request failed; placement remains reserved.', error);
        }
    }
    function checkPending() {
        if (!allowed()) return;
        pending.forEach(initializeSlot);
    }
    function initializeAll() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-manual-ad-slot]'), function (slot) {
            if (!isValidSlotId((slot.getAttribute('data-manual-ad-slot') || '').trim()) ||
                !isValidClientId((slot.getAttribute('data-ad-client') || '').trim())) {
                if (productionHost) slot.remove();
                return;
            }
            var content = slot.querySelector('[data-manual-ad-content]');
            if (!content) return;
            if (isMeasuredPosition(slot) && !reachedPositions.has(slot.getAttribute('data-manual-ad-position')) && !pendingReach.has(slot)) {
                pendingReach.add(slot);
                if (reachObserver) reachObserver.observe(content);
            }
            if (slot.getAttribute('data-manual-ad-initialized') === 'true' || pending.has(slot)) return;
            pending.add(slot);
            if (observer) observer.observe(content);
        });
        checkSlots();
    }
    function bindListeners() {
        if (listenersBound) return;
        listenersBound = true;
        window.addEventListener('screenSizeConsentReady', initializeAll);
        window.addEventListener('screenSizeConsentChanged', initializeAll);
        document.addEventListener('visibilitychange', checkSlots);
        window.addEventListener('resize', checkSlots);
        if (!observer) window.addEventListener('scroll', checkSlots, { passive: true });
    }
    window.addEventListener('pagehide', function () {
        suspended = true;
        if (observer) observer.disconnect();
        if (reachObserver) reachObserver.disconnect();
        window.removeEventListener('screenSizeConsentReady', initializeAll);
        window.removeEventListener('screenSizeConsentChanged', initializeAll);
        document.removeEventListener('visibilitychange', checkSlots);
        window.removeEventListener('resize', checkSlots);
        if (!observer) window.removeEventListener('scroll', checkSlots);
        listenersBound = false;
    });
    window.addEventListener('pageshow', function () {
        suspended = false;
        bindListeners();
        pending.forEach(function (slot) {
            if (observer) observer.observe(slot.querySelector('[data-manual-ad-content]'));
        });
        pendingReach.forEach(function (slot) {
            if (reachObserver) reachObserver.observe(slot.querySelector('[data-manual-ad-content]'));
        });
        checkSlots();
    });
    bindListeners();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
    else {
        initializeAll();
        // The deferred helper in the body may not be ready yet. Retry only
        // measurement at DOM readiness, without adding an advertising attempt.
        if (document.readyState === 'interactive') document.addEventListener('DOMContentLoaded', checkReached, { once: true });
    }
})(window, document);
