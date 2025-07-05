// clipboard.js - Clipboard functionality for copying device information

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
        
        // Show success feedback
        showCopySuccess(copyBtn);
        
        // Show toast notification
        const message = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copied_success') : '已复制!';
        showToastNotification(message);
        
        console.log('Text copied to clipboard:', textToCopy);
        
    } catch (error) {
        console.error('Failed to copy text:', error);
        showCopyError(copyBtn);
        
        // Show error toast
        const message = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copy_failed') : '复制失败';
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
    const originalText = copyBtn.textContent;
    const successText = '✓';
    
    copyBtn.textContent = successText;
    copyBtn.classList.add('copied');
    
    // Reset after 1.5 seconds
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
    }, 1500);
}

/**
 * Show copy error feedback
 * @param {HTMLElement} copyBtn - The copy button element
 */
function showCopyError(copyBtn) {
    const originalText = copyBtn.textContent;
    const errorText = '✗';
    
    copyBtn.textContent = errorText;
    copyBtn.style.backgroundColor = '#dc3545';
    copyBtn.style.color = 'white';
    
    // Reset after 2 seconds
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '';
        copyBtn.style.color = '';
    }, 2000);
}

/**
 * Copy all device information to clipboard
 */
export async function copyAllInfo() {
    try {
        const infoData = [];
        
        // Collect all information
        const dataElements = [
            { label: 'Screen Resolution', id: 'screen-resolution-display' },
            { label: 'Viewport Size', id: 'viewport-display' },
            { label: 'Aspect Ratio', id: 'aspect-ratio' },
            { label: 'Device Pixel Ratio', id: 'dpr' },
            { label: 'Color Depth', id: 'color-depth' },
            { label: 'Operating System', id: 'os-info' },
            { label: 'Browser', id: 'browser-info' },
            { label: 'Cookies Enabled', id: 'cookies-enabled' },
            { label: 'Touch Support', id: 'touch-support' },
            { label: 'User Agent', id: 'user-agent' }
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
                    infoData.push(`${item.label}: ${value.trim()}`);
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
        const message = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('all_info_copied') : '所有信息已复制!';
        showToastNotification(message);
        
        console.log('All device information copied to clipboard');
        return true;
        
    } catch (error) {
        console.error('Failed to copy all information:', error);
        
        const message = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copy_all_failed') : '复制失败';
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