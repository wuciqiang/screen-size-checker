// device-detector.js - Device and browser information detection

import { setTextContent } from './i18n.js';
import { calculateAspectRatio } from './utils.js';

/**
 * Main function to update all display information
 */
export async function updateDisplay() {
    try {
        console.log('Starting device detection...');
        
        // Update all device information
        updateScreenResolution();
        updateViewportSize();
        updateDevicePixelRatio();
        updateColorDepth();
        updateOperatingSystem();
        updateBrowserInfo();
        updateCookiesEnabled();
        updateTouchSupport();
        updateUserAgent();
        updateAspectRatio();
        
        console.log('Device detection completed successfully');
    } catch (error) {
        console.error('Error during device detection:', error);
        setFallbackValues();
    }
}

/**
 * Update screen resolution information
 */
function updateScreenResolution() {
    const width = window.screen.width;
    const height = window.screen.height;
    const resolution = `${width} × ${height}`;
    
    // Update hero section
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');
    if (screenResolutionDisplay) {
        const labelSpan = screenResolutionDisplay.querySelector('span:first-child');
        const valueSpan = screenResolutionDisplay.querySelector('span:last-child');
        
        // Update label with translation if available
        if (labelSpan && typeof i18next !== 'undefined' && i18next.t) {
            labelSpan.textContent = i18next.t('screen_resolution');
        }
        
        // Update value and remove data-i18n attribute to prevent translation override
        if (valueSpan) {
            valueSpan.removeAttribute('data-i18n');
            valueSpan.textContent = resolution;
        }
    }
    
    console.log('Screen resolution updated:', resolution);
}

/**
 * Update viewport size information
 */
export async function updateViewportSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const viewport = `${width} × ${height}`;
    
    // Update hero display using setTextContent to avoid conflicts
    setTextContent('viewport-display', viewport);
    
    console.log('Viewport size updated:', viewport);
}

/**
 * Update device pixel ratio information
 */
function updateDevicePixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    setTextContent('dpr', dpr.toFixed(2));
    console.log('Device pixel ratio updated:', dpr);
}

/**
 * Update color depth information
 */
function updateColorDepth() {
    const colorDepth = window.screen.colorDepth || 'Unknown';
    setTextContent('color-depth', `${colorDepth}-bit`);
    console.log('Color depth updated:', colorDepth);
}

/**
 * Update operating system information
 */
function updateOperatingSystem() {
    try {
        let osInfo = 'Unknown';
        
        if (typeof UAParser !== 'undefined') {
            const parser = new UAParser();
            const os = parser.getOS();
            
            // Enhanced Windows version detection
            if (os.name === 'Windows' && os.version === '10') {
                osInfo = detectWindowsVersion();
            } else {
                osInfo = os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown';
            }
        } else {
            // Fallback detection
            osInfo = detectOperatingSystemFallback();
        }
        
        setTextContent('os-info', osInfo);
        console.log('Operating system updated:', osInfo);
        
        // Debug information for Windows detection
        if (osInfo.includes('Windows')) {
            console.log('Windows detection debug:', {
                userAgent: navigator.userAgent,
                chromeVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1],
                edgeVersion: navigator.userAgent.match(/Edg\/(\d+)/)?.[1],
                hasUserAgentData: typeof navigator.userAgentData !== 'undefined',
                platform: navigator.userAgentData?.platform || 'N/A'
            });
        }
    } catch (error) {
        console.error('Error detecting OS:', error);
        setTextContent('os-info', 'Unknown');
    }
}

/**
 * Enhanced Windows version detection
 * @returns {string} Windows version string
 */
function detectWindowsVersion() {
    const userAgent = navigator.userAgent;
    
    // Windows 11 detection methods
    if (userAgent.includes('Windows NT 10.0')) {
        // Try to detect Windows 11 using multiple heuristics
        let isWindows11 = false;
        
        // Method 1: Check for newer browser versions (Windows 11 typically has newer browsers)
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
        const edgeMatch = userAgent.match(/Edg\/(\d+)/);
        
        if (chromeMatch && parseInt(chromeMatch[1]) >= 110) {
            isWindows11 = true;
        }
        
        if (edgeMatch && parseInt(edgeMatch[1]) >= 110) {
            isWindows11 = true;
        }
        
        // Method 2: Check for modern web features more common on Windows 11
        try {
            const hasModernFeatures = (
                'getDisplayMedia' in navigator.mediaDevices &&
                'getDisplayMedia' in navigator &&
                typeof navigator.userAgentData !== 'undefined'
            );
            
            if (hasModernFeatures) {
                isWindows11 = true;
            }
        } catch (e) {
            // Ignore errors in feature detection
        }
        
        // Method 3: Check build number if available in user agent
        if (userAgent.includes('Windows NT 10.0; Win64; x64')) {
            // Look for patterns that might indicate Windows 11
            const buildMatch = userAgent.match(/Windows NT 10\.0; Win64; x64.*?(\d{5,})/);
            if (buildMatch && parseInt(buildMatch[1]) >= 22000) {
                isWindows11 = true;
            }
        }
        
        // Method 4: Use navigator.userAgentData if available (Chromium browsers)
        try {
            if (navigator.userAgentData && navigator.userAgentData.platform === 'Windows') {
                // This is a newer API more likely to be on Windows 11
                isWindows11 = true;
            }
        } catch (e) {
            // Ignore errors
        }
        
        return isWindows11 ? 'Windows 11' : 'Windows 10';
    }
    
    // Other Windows versions
    if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
    if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
    if (userAgent.includes('Windows NT 6.0')) return 'Windows Vista';
    if (userAgent.includes('Windows NT 5.1')) return 'Windows XP';
    
    return 'Windows';
}

/**
 * Fallback operating system detection without UAParser
 * @returns {string} Operating system name
 */
function detectOperatingSystemFallback() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    if (userAgent.includes('Windows') || platform.includes('Win')) {
        return detectWindowsVersion();
    } else if (userAgent.includes('Mac') || platform.includes('Mac')) {
        return 'macOS';
    } else if (userAgent.includes('Linux') || platform.includes('Linux')) {
        return 'Linux';
    } else if (userAgent.includes('Android')) {
        return 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        return 'iOS';
    }
    
    return 'Unknown';
}

/**
 * Update browser information
 */
function updateBrowserInfo() {
    try {
        let browserInfo = 'Unknown';
        
        if (typeof UAParser !== 'undefined') {
            const parser = new UAParser();
            const browser = parser.getBrowser();
            browserInfo = browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown';
        } else {
            // Fallback detection
            const userAgent = navigator.userAgent;
            
            if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
                const version = userAgent.match(/Chrome\/(\d+)/)?.[1];
                browserInfo = `Chrome ${version || ''}`.trim();
            } else if (userAgent.includes('Firefox')) {
                const version = userAgent.match(/Firefox\/(\d+)/)?.[1];
                browserInfo = `Firefox ${version || ''}`.trim();
            } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                const version = userAgent.match(/Version\/(\d+)/)?.[1];
                browserInfo = `Safari ${version || ''}`.trim();
            } else if (userAgent.includes('Edg')) {
                const version = userAgent.match(/Edg\/(\d+)/)?.[1];
                browserInfo = `Edge ${version || ''}`.trim();
            }
        }
        
        setTextContent('browser-info', browserInfo);
        console.log('Browser info updated:', browserInfo);
    } catch (error) {
        console.error('Error detecting browser:', error);
        setTextContent('browser-info', 'Unknown');
    }
}

/**
 * Update cookies enabled status
 */
function updateCookiesEnabled() {
    const cookiesEnabled = navigator.cookieEnabled;
    const status = cookiesEnabled ? 
        (typeof i18next !== 'undefined' && i18next.t ? i18next.t('yes') : '是') : 
        (typeof i18next !== 'undefined' && i18next.t ? i18next.t('no') : '否');
    setTextContent('cookies-enabled', status);
    console.log('Cookies enabled updated:', cookiesEnabled);
}

/**
 * Update touch support information
 */
function updateTouchSupport() {
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const status = touchSupported ? 
        (typeof i18next !== 'undefined' && i18next.t ? i18next.t('supported') : '支持') : 
        (typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_supported') : '不支持');
    setTextContent('touch-support', status);
    console.log('Touch support updated:', touchSupported);
}

/**
 * Update user agent information
 */
function updateUserAgent() {
    const userAgent = navigator.userAgent;
    setTextContent('user-agent', userAgent);
    console.log('User agent updated');
}

/**
 * Update aspect ratio information
 */
function updateAspectRatio() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = calculateAspectRatio(width, height);
    setTextContent('aspect-ratio', aspectRatio);
    console.log('Aspect ratio updated:', aspectRatio);
}

/**
 * Set fallback values when detection fails
 */
function setFallbackValues() {
    console.log('Setting fallback values...');
    
    const fallbackText = typeof i18next !== 'undefined' && i18next.t ? 
        i18next.t('not_available') : '不可用';
    
    setTextContent('viewport-display', '检测失败');
    setTextContent('aspect-ratio', fallbackText);
    setTextContent('dpr', fallbackText);
    setTextContent('color-depth', fallbackText);
    setTextContent('os-info', fallbackText);
    setTextContent('browser-info', fallbackText);
    setTextContent('cookies-enabled', fallbackText);
    setTextContent('touch-support', fallbackText);
    setTextContent('user-agent', fallbackText);
    
    // Update screen resolution display
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');
    if (screenResolutionDisplay) {
        const valueSpan = screenResolutionDisplay.querySelector('span:last-child');
        if (valueSpan) {
            valueSpan.removeAttribute('data-i18n');
            valueSpan.textContent = '检测失败';
        }
    }
} 