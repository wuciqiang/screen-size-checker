(function (window, document) {
    'use strict';

    var productionHost = /(^|\.)screensizechecker\.com$/.test(window.location.hostname || '');

    function removeUnconfiguredSlot(slot) {
        if (!productionHost) return;
        slot.remove();
    }

    function isValidSlotId(slotId) {
        return /^[1-9]\d*$/.test(slotId);
    }

    function isValidClientId(clientId) {
        return /^ca-pub-\d+$/.test(clientId);
    }

    function initializeSlot(slot) {
        if (!slot || slot.getAttribute('data-manual-ad-initialized') === 'true') return;
        var slotId = (slot.getAttribute('data-manual-ad-slot') || '').trim();
        var clientId = (slot.getAttribute('data-ad-client') || '').trim();
        if (!isValidSlotId(slotId) || !isValidClientId(clientId)) {
            removeUnconfiguredSlot(slot);
            return;
        }
        if (!window.ScreenSizeConsent || !window.ScreenSizeConsent.canUseAdvertising()) return;
        if (!window.adsbygoogle) window.adsbygoogle = [];
        var ad = document.createElement('ins');
        ad.className = 'adsbygoogle';
        ad.style.display = 'block';
        ad.style.minHeight = '90px';
        ad.setAttribute('data-ad-client', clientId);
        ad.setAttribute('data-ad-slot', slotId);
        ad.setAttribute('data-ad-format', 'auto');
        ad.setAttribute('data-full-width-responsive', 'true');
        slot.textContent = '';
        slot.appendChild(ad);
        slot.setAttribute('data-manual-ad-initialized', 'true');
        try {
            window.adsbygoogle.push({});
        } catch (error) {
            slot.removeAttribute('data-manual-ad-initialized');
            slot.textContent = '';
        }
    }

    function initializeAll() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-manual-ad-slot]'), initializeSlot);
    }

    window.addEventListener('screenSizeConsentReady', initializeAll);
    window.addEventListener('screenSizeConsentChanged', initializeAll);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
    } else {
        initializeAll();
    }
})(window, document);
