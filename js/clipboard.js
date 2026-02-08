// clipboard.js - Clipboard functionality for copying device information


const COPY_FALLBACK_TEXT = {
    copied_success: { en: 'Copied!', zh: 'Copied!', de: 'Kopiert!', es: 'Copiado!' },
    copy_failed: { en: 'Copy failed', zh: 'Copy failed', de: 'Kopieren fehlgeschlagen', es: 'Error al copiar' },
    all_info_copied: { en: 'All information copied!', zh: 'All information copied!', de: 'Alle Informationen kopiert!', es: 'Toda la informacion copiada!' },
    copy_all_failed: { en: 'Copy failed', zh: 'Copy failed', de: 'Kopieren fehlgeschlagen', es: 'Error al copiar' },
    screen_resolution: { en: 'Screen Resolution', zh: 'Screen Resolution', de: 'Bildschirmaufloesung', es: 'Resolucion de Pantalla' },
    viewport_size: { en: 'Viewport Size', zh: 'Viewport Size', de: 'Viewport-Groesse', es: 'Tamano del Viewport' },
    aspect_ratio: { en: 'Aspect Ratio', zh: 'Aspect Ratio', de: 'Seitenverhaeltnis', es: 'Relacion de Aspecto' },
    device_pixel_ratio: { en: 'Device Pixel Ratio (DPR)', zh: 'Device Pixel Ratio (DPR)', de: 'Device Pixel Ratio (DPR)', es: 'Relacion de Pixeles del Dispositivo (DPR)' },
    color_depth: { en: 'Color Depth', zh: 'Color Depth', de: 'Farbtiefe', es: 'Profundidad de Color' },
    operating_system: { en: 'Operating System', zh: 'Operating System', de: 'Betriebssystem', es: 'Sistema Operativo' },
    browser: { en: 'Browser', zh: 'Browser', de: 'Browser', es: 'Navegador' },
    cookies_enabled: { en: 'Cookies Enabled', zh: 'Cookies Enabled', de: 'Cookies aktiviert', es: 'Cookies Habilitadas' },
    touch_support: { en: 'Touch Support', zh: 'Touch Support', de: 'Touch-Unterstuetzung', es: 'Soporte Tactil' },
    user_agent: { en: 'User Agent', zh: 'User Agent', de: 'User Agent', es: 'User Agent' }
};

function normalizeLangCode(rawLang) {
    return (rawLang || 'en').toLowerCase().split('-')[0];
}

function getCurrentLangForCopy() {
    const htmlLang = document.documentElement ? document.documentElement.lang : '';
    const storedLang = (() => {
        try {
            return localStorage.getItem('i18nextLng') || localStorage.getItem('lang') || '';
        } catch (_) {
            return '';
        }
    })();
    const i18nLang = (typeof i18next !== 'undefined' && (i18next.resolvedLanguage || i18next.language))
        ? (i18next.resolvedLanguage || i18next.language)
        : '';

    return normalizeLangCode(storedLang || htmlLang || i18nLang || 'en');
}

function getCopyText(key) {
    const lang = getCurrentLangForCopy();

    if (typeof i18next !== 'undefined' && typeof i18next.t === 'function') {
        let translated = '';

        if (typeof i18next.getFixedT === 'function') {
            translated = i18next.getFixedT(lang)(key);
        } else {
            translated = i18next.t(key, { lng: lang });
        }

        if (translated && translated !== key) {
            return translated;
        }
    }

    const fallback = COPY_FALLBACK_TEXT[key] || COPY_FALLBACK_TEXT.copy_failed;
    return fallback[lang] || fallback.en;
}

/**
 * Handle copy button clicks using event delegation
 * @param {Event} event - Click event
 */
export function handleCopyClick(event) {
    // Check if the clicked element is a copy button
    if (event.target.classList.contains('copy-btn')) {
        event.preventDefault();
        
        const copyBtn = event.target;
        const targetId = copyBtn.getAttribute('data-clipboard-target');
        
        if (targetId) {
            copyToClipboard(targetId, copyBtn);
        }
    }
}

/**
 * Copy text content to clipboard
 * @param {string} targetId - ID of the element to copy from
 * @param {HTMLElement} copyBtn - The copy button element
 */
async function copyToClipboard(targetId, copyBtn) {
    try {
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
            console.error(`Element with ID "${targetId}" not found`);
            return;
        }
        
        let textToCopy = '';
        
        // Get text based on element type
        if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
            textToCopy = targetElement.value;
        } else {
            textToCopy = targetElement.textContent || targetElement.innerText;
        }
        
        if (!textToCopy || textToCopy.trim() === '') {
            console.warn('No text to copy');
            return;
        }
        
        // Try to use the modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
        } else {
            // Fallback for older browsers
            await fallbackCopyToClipboard(textToCopy);
        }
        
        // Show toast notification
        const message = getCopyText('copied_success');
        showToastNotification(message);
        
        console.log('Text copied to clipboard:', textToCopy);
        
    } catch (error) {
        console.error('Failed to copy text:', error);
        // Show error toast
        const message = getCopyText('copy_failed');
        showToastNotification(message, 3000);
    }
}

/**
 * Show toast notification (internal implementation to avoid circular dependency)
 */
function showToastNotification(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopyToClipboard(text) {
    return new Promise((resolve, reject) => {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        try {
            textArea.focus();
            textArea.select();
            
            // Execute copy command
            const successful = document.execCommand('copy');
            
            if (successful) {
                resolve();
            } else {
                reject(new Error('execCommand failed'));
            }
        } catch (error) {
            reject(error);
        } finally {
            document.body.removeChild(textArea);
        }
    });
}

/**
 * Show copy success feedback
 * @param {HTMLElement} copyBtn - The copy button element
 */
function showCopySuccess(copyBtn) {
    // Keep button visuals unchanged; toast provides feedback.
    void copyBtn;
}

/**
 * Show copy error feedback
 * @param {HTMLElement} copyBtn - The copy button element
 */
function showCopyError(copyBtn) {
    // Keep button visuals unchanged; toast provides feedback.
    void copyBtn;
}

/**
 * Copy all device information to clipboard
 */
export async function copyAllInfo() {
    try {
        const infoData = [];
        
        // Collect all information
        const dataElements = [
            { labelKey: 'screen_resolution', id: 'screen-resolution-display' },
            { labelKey: 'viewport_size', id: 'viewport-display' },
            { labelKey: 'aspect_ratio', id: 'aspect-ratio' },
            { labelKey: 'device_pixel_ratio', id: 'dpr' },
            { labelKey: 'color_depth', id: 'color-depth' },
            { labelKey: 'operating_system', id: 'os-info' },
            { labelKey: 'browser', id: 'browser-info' },
            { labelKey: 'cookies_enabled', id: 'cookies-enabled' },
            { labelKey: 'touch_support', id: 'touch-support' },
            { labelKey: 'user_agent', id: 'user-agent' }
        ];
        
        for (const item of dataElements) {
            const element = document.getElementById(item.id);
            if (element) {
                let value = '';
                
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    value = element.value;
                } else if (item.id === 'screen-resolution-display') {
                    const span = element.querySelector('span:last-child');
                    value = span ? span.textContent : element.textContent;
                } else {
                    value = element.textContent;
                }
                
                if (value && value.trim() !== '') {
                    infoData.push(`${getCopyText(item.labelKey)}: ${value.trim()}`);
                }
            }
        }
        
        if (infoData.length === 0) {
            console.warn('No information to copy');
            return false;
        }
        
        const allInfo = infoData.join('\n');
        
        // Copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(allInfo);
        } else {
            await fallbackCopyToClipboard(allInfo);
        }
        
        // Show success message
        const message = getCopyText('all_info_copied');
        showToastNotification(message);
        
        console.log('All device information copied to clipboard');
        return true;
        
    } catch (error) {
        console.error('Failed to copy all information:', error);
        
        const message = getCopyText('copy_all_failed');
        showToastNotification(message, 3000);
        
        return false;
    }
}

/**
 * Format device information for copying
 * @param {Object} data - Device information object
 * @returns {string} Formatted string
 */
function formatDeviceInfo(data) {
    const sections = [];
    
    if (data.display) {
        sections.push('=== Display Information ===');
        sections.push(`Screen Resolution: ${data.display.screenResolution}`);
        sections.push(`Viewport Size: ${data.display.viewportSize}`);
        sections.push(`Aspect Ratio: ${data.display.aspectRatio}`);
        sections.push(`Device Pixel Ratio: ${data.display.dpr}`);
        sections.push(`Color Depth: ${data.display.colorDepth}`);
        sections.push('');
    }
    
    if (data.system) {
        sections.push('=== System Information ===');
        sections.push(`Operating System: ${data.system.os}`);
        sections.push(`Browser: ${data.system.browser}`);
        sections.push('');
    }
    
    if (data.advanced) {
        sections.push('=== Advanced Information ===');
        sections.push(`Cookies Enabled: ${data.advanced.cookies}`);
        sections.push(`Touch Support: ${data.advanced.touch}`);
        sections.push(`User Agent: ${data.advanced.userAgent}`);
    }
    
    return sections.join('\n');
} 