// device-detector.js - Device detection module

/**
 * Update display with device information
 */
export function updateDisplay() {
    if (!i18next.isInitialized) return;
    const t = i18next.t;
    const parser = new UAParser(); // Initialize UA Parser
    const result = parser.getResult();

    // Screen Resolution
    setTextContent('screen-resolution', `${window.screen.width} x ${window.screen.height}`, t('not_available'));

    // Viewport Size
    updateViewportSize(); // Call dedicated function for viewport

    // DPR
    setTextContent('dpr', window.devicePixelRatio, t('not_available'));

    // Color Depth
    setTextContent('color-depth', window.screen.colorDepth ? `${window.screen.colorDepth}-bit` : null, t('not_available'));

    // OS Info
    const osInfo = result.os.name && result.os.version ? `${result.os.name} ${result.os.version}` : result.os.name;
    setTextContent('os-info', osInfo, t('not_available'));

    // Browser Info
    const browserInfo = result.browser.name && result.browser.version ? `${result.browser.name} ${result.browser.version}` : result.browser.name;
    setTextContent('browser-info', browserInfo, t('not_available'));

    // Cookies Enabled
    setTextContent('cookies-enabled', navigator.cookieEnabled ? t('cookies_enabled_yes') : t('cookies_enabled_no'), t('not_available'));

    // Touch Support
    const touchSupport = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
    setTextContent('touch-support', touchSupport ? t('touch_supported') : t('touch_not_supported'), t('not_available'));

    // User Agent
    const userAgentTextarea = document.getElementById('user-agent');
    if (userAgentTextarea) {
        userAgentTextarea.value = navigator.userAgent || t('not_available');
        // Update placeholder if needed
        const placeholderKeyAttr = userAgentTextarea.getAttribute('data-i18n');
        if (placeholderKeyAttr && placeholderKeyAttr.startsWith('[placeholder]')) {
            userAgentTextarea.setAttribute('placeholder', t(placeholderKeyAttr.substring('[placeholder]'.length)));
        }
    }
}

/**
 * Update viewport size information
 */
export function updateViewportSize() {
    if (!i18next.isInitialized) return;
    const t = i18next.t;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const viewportValueEl = document.getElementById('viewport-value'); // Use the span with ID
    const viewportNoteSpan = document.getElementById('viewport-size')?.querySelector('span.note');

    if (viewportValueEl) {
        viewportValueEl.textContent = viewportW && viewportH ? `${viewportW} x ${viewportH}` : t('not_available');
    }
    if (viewportNoteSpan) {
        viewportNoteSpan.textContent = t('viewport_dynamic_note');
    }
}

/**
 * Helper to set text content safely
 * @param {string} elementId - ID of the element
 * @param {string|number} value - Value to set
 * @param {string} fallback - Fallback value if main value is empty
 */
export function setTextContent(elementId, value, fallback) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = (value !== null && typeof value !== 'undefined' && value !== '') ? value : fallback;
    } else {
        console.warn(`Element with ID "${elementId}" not found.`);
    }
} 