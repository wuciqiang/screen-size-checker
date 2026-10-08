(function (window, document) {
    'use strict';
    if (window.__screenSizeManualAds) return;
    window.__screenSizeManualAds = true;
    var productionHost = /(^|\.)screensizechecker\.com$/.test(window.location.hostname || '');
    var pending = new Set();
    var observer = window.IntersectionObserver ? new window.IntersectionObserver(checkPending, { rootMargin: '300px 0px' }) : null;

    function isValidSlotId(value) { return /^[1-9]\d*$/.test(value); }
    function isValidClientId(value) { return /^ca-pub-\d+$/.test(value); }
    function allowed() {
        return document.visibilityState !== 'hidden' && window.ScreenSizeConsent && window.ScreenSizeConsent.canUseAdvertising();
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
            if (slot.getAttribute('data-manual-ad-initialized') === 'true' || pending.has(slot)) return;
            if (!isValidSlotId((slot.getAttribute('data-manual-ad-slot') || '').trim()) ||
                !isValidClientId((slot.getAttribute('data-ad-client') || '').trim())) {
                if (productionHost) slot.remove();
                return;
            }
            var content = slot.querySelector('[data-manual-ad-content]');
            if (!content) return;
            pending.add(slot);
            if (observer) observer.observe(content);
        });
        checkPending();
    }
    window.addEventListener('screenSizeConsentReady', initializeAll);
    window.addEventListener('screenSizeConsentChanged', initializeAll);
    document.addEventListener('visibilitychange', checkPending);
    window.addEventListener('resize', checkPending);
    if (!observer) window.addEventListener('scroll', checkPending, { passive: true });
    window.addEventListener('pagehide', function () {
        if (observer) observer.disconnect();
    });
    window.addEventListener('pageshow', function () {
        pending.forEach(function (slot) {
            if (observer) observer.observe(slot.querySelector('[data-manual-ad-content]'));
        });
        checkPending();
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
    else initializeAll();
})(window, document);
