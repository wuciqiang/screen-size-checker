function translate(key, fallback) {
    return window.i18next && typeof window.i18next.t === 'function'
        ? window.i18next.t(key, fallback)
        : fallback;
}

function gcd(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function readResults() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const dpr = window.devicePixelRatio || 1;
    const divisor = gcd(screenWidth, screenHeight);
    const orientation = screenWidth === screenHeight
        ? 'square'
        : screenWidth > screenHeight ? 'landscape' : 'portrait';
    const cssPixels = translate('resolution_test_css_pixels', 'CSS px');

    return {
        screen: `${screenWidth} x ${screenHeight} ${cssPixels}`,
        viewport: `${window.innerWidth} x ${window.innerHeight} ${cssPixels}`,
        dpr: String(dpr),
        aspect: `${screenWidth / divisor}:${screenHeight / divisor}`,
        depth: `${window.screen.colorDepth || 0}-${translate('resolution_test_bits', 'bit')}`,
        orientation: translate(`resolution_test_orientation_${orientation}`, orientation),
        available: `${window.screen.availWidth} x ${window.screen.availHeight} ${cssPixels}`,
        window: `${window.outerWidth} x ${window.outerHeight} ${cssPixels}`,
        estimated: `${Math.round(screenWidth * dpr)} x ${Math.round(screenHeight * dpr)} ${translate('resolution_test_estimated_unit', 'estimated px')}`
    };
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

let resolutionStatusTimer;

function showStatus(message, type = 'success') {
    const status = document.querySelector('[data-resolution-status]');
    if (status) status.textContent = message;
    const toast = document.getElementById('toast');
    const toastMessage = toast?.querySelector('.toast-message');
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    clearTimeout(resolutionStatusTimer);
    toast.classList.remove('success', 'info', 'error', 'show');
    toast.classList.add(type, 'show');
    resolutionStatusTimer = setTimeout(() => {
        toast.classList.remove('show', 'success', 'info', 'error');
    }, type === 'error' ? 3200 : 2200);
}

function trackView() {
    const api = window.ScreenSizeAnalytics;
    if (api && typeof api.trackToolResult === 'function') {
        api.trackToolResult({ page_id: 'resolution-test', tool_name: 'resolution_test', tool_action: 'view_result', result_type: 'screen_info' });
    }
}

function trackCopy(action) {
    const api = window.ScreenSizeAnalytics;
    if (api && typeof api.trackCopy === 'function') {
        api.trackCopy({
            page_id: 'resolution-test',
            tool_name: 'resolution_test',
            tool_action: action,
            result_type: 'screen_info'
        }, { dedupeMs: 0 });
    }
}

async function copyText(value) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    try {
        textarea.select();
        if (!document.execCommand('copy')) throw new Error('Clipboard copy failed');
    } finally {
        textarea.remove();
    }
}

function isMobileDevice() {
    if (typeof navigator.userAgentData?.mobile === 'boolean') return navigator.userAgentData.mobile;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function initializeResolutionTest() {
    const root = document.querySelector('[data-resolution-test]');
    if (!root || root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';

    const labels = Array.from(root.querySelectorAll('.resolution-test-metric > span'));
    const ids = ['screen-resolution-display', 'viewport-display', 'dpr', 'aspect-ratio', 'color-depth', 'orientation', 'available-area', 'window-size', 'estimated-pixels'];
    const keys = ['screen', 'viewport', 'dpr', 'aspect', 'depth', 'orientation', 'available', 'window', 'estimated'];
    const update = () => {
        const values = readResults();
        ids.forEach((id, index) => setText(id, values[keys[index]]));
        const copyLabel = translate('resolution_test_copy', 'Copy');
        labels.forEach((label, index) => {
            const button = label.parentElement.querySelector('.resolution-copy-button');
            if (button) {
                const name = `${copyLabel} ${label.textContent.trim()}`;
                button.setAttribute('aria-label', name);
                button.title = name;
            }
        });
        [['all', 'resolution_test_copy_all', 'Copy all'], ['share', 'resolution_test_share', 'Share']].forEach(([action, key, fallback]) => {
            const button = root.querySelector(`[data-resolution-copy="${action}"]`);
            if (button) {
                const name = translate(key, fallback);
                button.setAttribute('aria-label', name);
                button.title = name;
            }
        });
        return values;
    };

    update();
    trackView();
    if (window.i18next && typeof window.i18next.on === 'function') {
        window.i18next.on('languageChanged', update);
    }
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    root.addEventListener('click', async event => {
        const button = event.target.closest('[data-resolution-copy-target], [data-resolution-copy]');
        if (!button) return;
        const values = update();
        let value;
        let action;
        if (button.dataset.resolutionCopyTarget) {
            value = document.getElementById(button.dataset.resolutionCopyTarget).textContent;
            action = 'copy_single';
        } else if (button.dataset.resolutionCopy === 'all') {
            value = labels.map((label, index) => `${label.textContent}: ${values[keys[index]]}`).join('\n');
            action = 'copy_all';
        } else {
            const canonical = document.querySelector('link[rel="canonical"]')?.href || `${window.location.origin}/resolution-test`;
            if (isMobileDevice() && typeof navigator.share === 'function') {
                try {
                    await navigator.share({ title: document.title, url: canonical });
                    trackCopy('share_link');
                    showStatus(translate('resolution_test_shared', 'Shared'));
                    return;
                } catch (error) {
                    if (error.name === 'AbortError') {
                        showStatus(translate('resolution_test_share_cancelled', 'Share cancelled'), 'info');
                        return;
                    }
                    console.error(error);
                }
            }
            value = canonical;
            action = 'share_link';
        }
        try {
            await copyText(value);
            trackCopy(action);
            showStatus(translate('copied_success', 'Copied'));
        } catch (error) {
            console.error(error);
            showStatus(translate('copy_all_failed', 'Copy failed'), 'error');
        }
    });
}
