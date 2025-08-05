// device-detector.js - Device and browser information detection

import { setTextContent } from './i18n.js';
import { calculateAspectRatio } from './utils.js';

// 设备信息缓存
let deviceInfoCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30秒缓存

// 防抖定时器
let viewportUpdateTimer = null;
const VIEWPORT_UPDATE_DELAY = 100; // 100ms防抖延迟

// 性能监控
const performanceMetrics = {
    detectionStartTime: 0,
    detectionEndTime: 0,
    cacheHits: 0,
    cacheMisses: 0
};

/**
 * 获取缓存的设备信息
 * @returns {Object|null} 缓存的设备信息或null
 */
function getCachedDeviceInfo() {
    const now = Date.now();
    if (deviceInfoCache && (now - cacheTimestamp) < CACHE_DURATION) {
        performanceMetrics.cacheHits++;
        console.log('📦 Using cached device info');
        return deviceInfoCache;
    }
    performanceMetrics.cacheMisses++;
    return null;
}

/**
 * 缓存设备信息
 * @param {Object} deviceInfo - 设备信息对象
 */
function cacheDeviceInfo(deviceInfo) {
    deviceInfoCache = deviceInfo;
    cacheTimestamp = Date.now();
    console.log('💾 Device info cached');
}

/**
 * Main function to update all display information
 */
export async function updateDisplay() {
    try {
        performanceMetrics.detectionStartTime = performance.now();
        console.log('Starting optimized device detection...');
        
        // 尝试使用缓存的设备信息
        const cachedInfo = getCachedDeviceInfo();
        if (cachedInfo) {
            applyDeviceInfo(cachedInfo);
            performanceMetrics.detectionEndTime = performance.now();
            console.log(`Device detection completed from cache in ${(performanceMetrics.detectionEndTime - performanceMetrics.detectionStartTime).toFixed(2)}ms`);
            return;
        }
        
        // 收集所有设备信息（一次性计算）
        const deviceInfo = await collectDeviceInfo();
        
        // 缓存设备信息
        cacheDeviceInfo(deviceInfo);
        
        // 应用设备信息到UI
        applyDeviceInfo(deviceInfo);
        
        performanceMetrics.detectionEndTime = performance.now();
        console.log(`Device detection completed in ${(performanceMetrics.detectionEndTime - performanceMetrics.detectionStartTime).toFixed(2)}ms`);
        console.log('Performance metrics:', {
            cacheHits: performanceMetrics.cacheHits,
            cacheMisses: performanceMetrics.cacheMisses,
            detectionTime: performanceMetrics.detectionEndTime - performanceMetrics.detectionStartTime
        });
        
    } catch (error) {
        console.error('Error during device detection:', error);
        setFallbackValues();
    }
}

/**
 * 收集所有设备信息（批量处理）
 * @returns {Object} 设备信息对象
 */
async function collectDeviceInfo() {
    const info = {
        // 屏幕信息
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        colorDepth: window.screen.colorDepth || 'Unknown',
        
        // 浏览器信息
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        
        // 计算属性
        aspectRatio: null,
        operatingSystem: null,
        browserInfo: null
    };
    
    // 计算宽高比
    info.aspectRatio = calculateAspectRatio(info.viewportWidth, info.viewportHeight);
    
    // 检测操作系统（优化版本）
    info.operatingSystem = detectOperatingSystemOptimized();
    
    // 检测浏览器信息（优化版本）
    info.browserInfo = detectBrowserInfoOptimized();
    
    return info;
}

/**
 * 应用设备信息到UI
 * @param {Object} deviceInfo - 设备信息对象
 */
function applyDeviceInfo(deviceInfo) {
    // 批量更新DOM元素，减少重排重绘
    requestAnimationFrame(() => {
        updateScreenResolutionOptimized(deviceInfo);
        updateViewportSizeOptimized(deviceInfo);
        setTextContent('dpr', deviceInfo.devicePixelRatio.toFixed(2));
        setTextContent('color-depth', `${deviceInfo.colorDepth}-bit`);
        setTextContent('os-info', deviceInfo.operatingSystem);
        setTextContent('browser-info', deviceInfo.browserInfo);
        
        // 处理需要翻译的状态值
        const cookiesStatus = deviceInfo.cookiesEnabled ? 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('yes') : '是') : 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('no') : '否');
        setTextContent('cookies-enabled', cookiesStatus);
        
        const touchStatus = deviceInfo.touchSupported ? 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('supported') : '支持') : 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_supported') : '不支持');
        setTextContent('touch-support', touchStatus);
        
        setTextContent('user-agent', deviceInfo.userAgent);
        setTextContent('aspect-ratio', deviceInfo.aspectRatio);
    });
}

/**
 * 优化的视口尺寸更新（带防抖）
 */
export async function updateViewportSize() {
    // 清除之前的定时器
    if (viewportUpdateTimer) {
        clearTimeout(viewportUpdateTimer);
    }
    
    // 防抖处理
    viewportUpdateTimer = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const viewport = `${width} × ${height}`;
        
        // 直接更新viewport-display元素的内容，防止被翻译覆盖
        const viewportDisplay = document.getElementById('viewport-display');
        if (viewportDisplay) {
            // 移除data-i18n属性以防止翻译覆盖
            viewportDisplay.removeAttribute('data-i18n');
            viewportDisplay.textContent = viewport;
        }
        
        // 同时更新缓存中的视口信息
        if (deviceInfoCache) {
            deviceInfoCache.viewportWidth = width;
            deviceInfoCache.viewportHeight = height;
            deviceInfoCache.aspectRatio = calculateAspectRatio(width, height);
            
            // 更新宽高比显示
            setTextContent('aspect-ratio', deviceInfoCache.aspectRatio);
        }
        
        console.log('Viewport size updated with debounce:', viewport);
    }, VIEWPORT_UPDATE_DELAY);
}

/**
 * 优化的屏幕分辨率更新
 * @param {Object} deviceInfo - 设备信息对象
 */
function updateScreenResolutionOptimized(deviceInfo) {
    const resolution = `${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}`;
    
    // Update hero section
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');
    if (screenResolutionDisplay) {
        // 检查是否存在旧的结构
        const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
        if (detectingSpan) {
            // 如果找到"detecting..."的span，先移除它
            detectingSpan.parentNode.removeChild(detectingSpan);
        }
        
        // 获取label和value的span元素
        let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');
        
        // 如果没有标签span，创建一个
        if (!labelSpan) {
            labelSpan = document.createElement('span');
            labelSpan.setAttribute('data-i18n', 'screen_resolution');
            labelSpan.textContent = '屏幕分辨率';
            
            // 清空并重建内容
            screenResolutionDisplay.innerHTML = '';
            screenResolutionDisplay.appendChild(labelSpan);
            screenResolutionDisplay.appendChild(document.createTextNode(': '));
        }
        
        // 如果不存在value span，则创建一个
        if (!valueSpan) {
            valueSpan = document.createElement('span');
            screenResolutionDisplay.appendChild(valueSpan);
        }
        
        // 确保值span没有data-i18n属性
        valueSpan.removeAttribute('data-i18n');
        valueSpan.textContent = resolution;
    }
}

/**
 * 优化的视口尺寸更新
 * @param {Object} deviceInfo - 设备信息对象
 */
function updateViewportSizeOptimized(deviceInfo) {
    const viewport = `${deviceInfo.viewportWidth} × ${deviceInfo.viewportHeight}`;
    
    // 直接更新viewport-display元素的内容，防止被翻译覆盖
    const viewportDisplay = document.getElementById('viewport-display');
    if (viewportDisplay) {
        // 移除data-i18n属性以防止翻译覆盖
        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = viewport;
    }
}

/**
 * 优化的操作系统检测
 * @returns {string} 操作系统信息
 */
function detectOperatingSystemOptimized() {
    try {
        let osInfo = 'Unknown';
        
        if (typeof UAParser !== 'undefined') {
            const parser = new UAParser();
            const os = parser.getOS();
            
            // Enhanced Windows version detection
            if (os.name === 'Windows' && os.version === '10') {
                osInfo = detectWindowsVersionOptimized();
            } else {
                osInfo = os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown';
            }
        } else {
            // Fallback detection
            osInfo = detectOperatingSystemFallback();
        }
        
        return osInfo;
    } catch (error) {
        console.error('Error detecting OS:', error);
        return 'Unknown';
    }
}

/**
 * 优化的Windows版本检测
 * @returns {string} Windows版本字符串
 */
function detectWindowsVersionOptimized() {
    const userAgent = navigator.userAgent;
    
    // Windows 11 detection methods (优化版本，减少重复检查)
    if (userAgent.includes('Windows NT 10.0')) {
        let isWindows11 = false;
        
        // 合并多个检测方法，减少重复计算
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
        const edgeMatch = userAgent.match(/Edg\/(\d+)/);
        
        // 检查浏览器版本和现代特性
        if ((chromeMatch && parseInt(chromeMatch[1]) >= 110) ||
            (edgeMatch && parseInt(edgeMatch[1]) >= 110) ||
            (typeof navigator.userAgentData !== 'undefined' && navigator.userAgentData.platform === 'Windows')) {
            isWindows11 = true;
        }
        
        // 检查构建号（如果可用）
        if (!isWindows11 && userAgent.includes('Windows NT 10.0; Win64; x64')) {
            const buildMatch = userAgent.match(/Windows NT 10\.0; Win64; x64.*?(\d{5,})/);
            if (buildMatch && parseInt(buildMatch[1]) >= 22000) {
                isWindows11 = true;
            }
        }
        
        return isWindows11 ? 'Windows 11' : 'Windows 10';
    }
    
    // 其他Windows版本的快速检测
    const versionMap = {
        'Windows NT 6.3': 'Windows 8.1',
        'Windows NT 6.2': 'Windows 8',
        'Windows NT 6.1': 'Windows 7',
        'Windows NT 6.0': 'Windows Vista',
        'Windows NT 5.1': 'Windows XP'
    };
    
    for (const [pattern, version] of Object.entries(versionMap)) {
        if (userAgent.includes(pattern)) {
            return version;
        }
    }
    
    return 'Windows';
}

/**
 * 优化的浏览器信息检测
 * @returns {string} 浏览器信息
 */
function detectBrowserInfoOptimized() {
    try {
        let browserInfo = 'Unknown';
        
        if (typeof UAParser !== 'undefined') {
            const parser = new UAParser();
            const browser = parser.getBrowser();
            browserInfo = browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown';
        } else {
            // 优化的回退检测，使用预编译的正则表达式
            const userAgent = navigator.userAgent;
            
            // 使用更高效的检测顺序（最常见的浏览器优先）
            if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
                const version = userAgent.match(/Chrome\/(\d+)/)?.[1];
                browserInfo = `Chrome ${version || ''}`.trim();
            } else if (userAgent.includes('Edg')) {
                const version = userAgent.match(/Edg\/(\d+)/)?.[1];
                browserInfo = `Edge ${version || ''}`.trim();
            } else if (userAgent.includes('Firefox')) {
                const version = userAgent.match(/Firefox\/(\d+)/)?.[1];
                browserInfo = `Firefox ${version || ''}`.trim();
            } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                const version = userAgent.match(/Version\/(\d+)/)?.[1];
                browserInfo = `Safari ${version || ''}`.trim();
            }
        }
        
        return browserInfo;
    } catch (error) {
        console.error('Error detecting browser:', error);
        return 'Unknown';
    }
}

/**
 * Fallback operating system detection without UAParser
 * @returns {string} Operating system name
 */
function detectOperatingSystemFallback() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    if (userAgent.includes('Windows') || platform.includes('Win')) {
        return detectWindowsVersionOptimized();
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
 * 清除设备信息缓存（用于强制刷新）
 */
export function clearDeviceInfoCache() {
    deviceInfoCache = null;
    cacheTimestamp = 0;
    console.log('🗑️ Device info cache cleared');
}

/**
 * 获取性能指标
 * @returns {Object} 性能指标对象
 */
export function getPerformanceMetrics() {
    return {
        ...performanceMetrics,
        cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) || 0,
        averageDetectionTime: performanceMetrics.detectionEndTime - performanceMetrics.detectionStartTime
    };
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