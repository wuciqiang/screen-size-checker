// device-detector.js - Device detection module

import { formatNumber } from './i18n.js';

/**
 * Update display with device information
 */
export async function updateDisplay() {
    try {
        if (!i18next.isInitialized) {
            console.warn('i18next not initialized yet, waiting...');
            // Wait for i18next to be initialized
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (i18next.isInitialized) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        const t = i18next.t;
        const parser = new UAParser();
        const result = parser.getResult();

        // Screen Resolution
        const screenResolution = document.getElementById('screen-resolution');
        if (screenResolution) {
            const width = window.screen.width;
            const height = window.screen.height;
            screenResolution.textContent = `${formatNumber(width)} × ${formatNumber(height)}`;
        }

        // Viewport Size
        await updateViewportSize();

        // DPR
        const dprValue = document.getElementById('dpr');
        if (dprValue) {
            dprValue.textContent = window.devicePixelRatio.toFixed(2);
        }

        // Color Depth
        const colorDepthValue = document.getElementById('color-depth');
        if (colorDepthValue) {
            colorDepthValue.textContent = formatNumber(window.screen.colorDepth);
        }

        // OS Info
        const osInfo = result.os.name && result.os.version ? `${result.os.name} ${result.os.version}` : result.os.name;
        const osValue = document.getElementById('os-info');
        if (osValue) {
            osValue.textContent = osInfo || t('not_available');
        }

        // Browser Info
        const browserInfo = result.browser.name && result.browser.version ? `${result.browser.name} ${result.browser.version}` : result.browser.name;
        const browserValue = document.getElementById('browser-info');
        if (browserValue) {
            browserValue.textContent = browserInfo || t('not_available');
        }

        // Cookies Enabled
        const cookiesValue = document.getElementById('cookies-enabled');
        if (cookiesValue) {
            cookiesValue.textContent = navigator.cookieEnabled ? t('cookies_enabled_yes') : t('cookies_enabled_no');
        }

        // Touch Support
        const touchValue = document.getElementById('touch-support');
        if (touchValue) {
            const touchSupport = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
            touchValue.textContent = touchSupport ? t('touch_supported') : t('touch_not_supported');
        }

        // User Agent
        const userAgentTextarea = document.getElementById('user-agent');
        if (userAgentTextarea) {
            userAgentTextarea.value = navigator.userAgent || t('not_available');
        }

        console.log('Device information updated successfully');
    } catch (error) {
        console.error('Error updating device information:', error);
        // Set fallback values for all elements
        setFallbackValues();
    }
}

/**
 * Set fallback values when detection fails
 */
function setFallbackValues() {
    const t = i18next.t;
    const elements = {
        'screen-resolution': t('not_available'),
        'viewport-value': t('not_available'),
        'dpr': t('not_available'),
        'color-depth': t('not_available'),
        'os-info': t('not_available'),
        'browser-info': t('not_available'),
        'cookies-enabled': t('not_available'),
        'touch-support': t('not_available')
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

/**
 * Update viewport size information
 */
export async function updateViewportSize() {
    try {
        if (!i18next.isInitialized) {
            console.warn('i18next not initialized yet');
            return;
        }
        
        const t = i18next.t;
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const viewportValueEl = document.getElementById('viewport-value');
        const viewportNoteSpan = document.getElementById('viewport-size')?.querySelector('span.note');

        if (viewportValueEl) {
            viewportValueEl.textContent = `${formatNumber(viewportW)} × ${formatNumber(viewportH)}`;
        }
        if (viewportNoteSpan) {
            viewportNoteSpan.textContent = t('viewport_dynamic_note');
        }
    } catch (error) {
        console.error('Error updating viewport size:', error);
        const viewportValueEl = document.getElementById('viewport-value');
        if (viewportValueEl) {
            viewportValueEl.textContent = t('not_available');
        }
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