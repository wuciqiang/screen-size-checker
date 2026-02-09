// i18n.js - Internationalization module

console.log('🌐 Loading i18n.js module...');

// 确保 i18next 已加载
if (typeof i18next === 'undefined') {
    console.error('❌ i18next library not loaded');
} else {
    console.log('✅ i18next library is available');
}

/**
 * Get correct path for locales based on current page location
 * @returns {string} Correct path to locales directory
 */
function getLocalesPath() {
    const currentPath = window.location.pathname;
    // console.log('🔍 Calculating locales path for:', currentPath); // 已注释减少日志
    
    // 如果在语言子目录下的设备页面 (/en/devices/, /zh/devices/ 等)，需要回到上两级目录
    if (currentPath.match(/\/[a-z]{2}\/devices\//) || currentPath.includes('/devices/')) {
        const path = '../../locales/{{lng}}/translation.json';
        // console.log('📂 Devices page path:', path); // 已注释减少日志
        return path;
    }
    
    // 如果只在语言子目录 (/zh/, /en/, /fr/ 等)，需要回到上一级目录
    if (currentPath.match(/\/[a-z]{2}\//)) {
        const path = '../locales/{{lng}}/translation.json';
        // console.log('🌍 Language subdirectory path:', path); // 已注释减少日志
        return path;
    }
    
    // 如果在根目录
    const path = './locales/{{lng}}/translation.json';
    // console.log('🏠 Root directory path:', path); // 已注释减少日志
    return path;
}

/**
 * Get correct path for Chinese translations
 * @returns {string} Correct path to Chinese translations
 */
function getChineseTranslationsPath() {
    const currentPath = window.location.pathname;
    
    // 如果在语言子目录下的设备页面 (/en/devices/, /zh/devices/ 等)，需要回到上两级目录
    if (currentPath.match(/\/[a-z]{2}\/devices\//) || currentPath.includes('/devices/')) {
        return '../../locales/zh/translation.json';
    }
    
    // 如果只在语言子目录 (/zh/, /en/, /fr/ 等)，需要回到上一级目录
    if (currentPath.match(/\/[a-z]{2}\//)) {
        return '../locales/zh/translation.json';
    }
    
    // 如果在根目录
    return './locales/zh/translation.json';
}

/**
 * Wait for i18next library and plugins to be loaded
 * @returns {Promise} 
 */
async function waitForI18next() {
    const maxRetries = 50; // 最多等待5秒
    let retries = 0;
    
    while (retries < maxRetries) {
        if (typeof i18next !== 'undefined' && 
            typeof i18nextHttpBackend !== 'undefined' && 
            typeof i18nextBrowserLanguageDetector !== 'undefined') {
            console.log('✅ All i18next libraries are ready');
            return;
        }
        
        console.log('Waiting for i18next libraries to load...', {
            i18next: typeof i18next !== 'undefined',
            httpBackend: typeof i18nextHttpBackend !== 'undefined',
            languageDetector: typeof i18nextBrowserLanguageDetector !== 'undefined',
            retry: retries
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    throw new Error('i18next libraries failed to load after 5 seconds');
}

/**
 * Initialize i18next with optimized configuration
 * @returns {Promise} i18next instance
 */
export async function initializeI18next() {
    try {
        // First, wait for i18next library to be loaded
        await waitForI18next();
        
        // Get language from URL path first, then saved language, then detect from browser
        const pathLng = getLanguageFromPath();
        const savedLng = localStorage.getItem('i18nextLng');
        const detectedLng = detectBrowserLanguage();
        
        // 如果URL路径明确指定了语言，优先使用路径语言，忽略localStorage
        const defaultLng = pathLng || savedLng || detectedLng || 'en';
        
        // 如果是从路径检测到的语言，强制使用该语言
        if (pathLng && pathLng !== savedLng) {
            console.log(`Path language (${pathLng}) overrides saved language (${savedLng})`);
        }
        
        console.log('Initializing i18next with:', {
            savedLng,
            detectedLng,
            defaultLng,
            path: getLocalesPath()
        });
        
        // Initialize with default language first
        await i18next
            .use(i18nextHttpBackend)
            .use(i18nextBrowserLanguageDetector)
            .init({
                lng: defaultLng,
                fallbackLng: 'en',
                supportedLngs: ['en', 'zh', 'de', 'es'],
                backend: {
                    loadPath: getLocalesPath(),
                    allowMultiLoading: true,
                    reloadInterval: false,
                    customHeaders: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                },
                detection: {
                    order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
                    lookupQuerystring: 'lng',
                    lookupLocalStorage: 'i18nextLng',
                    caches: ['localStorage'],
                    checkWhitelist: true
                },
                initImmediate: false,
                appendNamespaceToCIMode: false,
                keySeparator: '.',
                nsSeparator: ':',
                debug: false, // 关闭调试模式减少日志输出
                interpolation: {
                    escapeValue: false
                },
                compatibilityJSON: 'v4'
            });

        // Wait for the initial language to be loaded
        await i18next.loadNamespaces(i18next.language);
        
        // Update html lang attribute
        document.documentElement.lang = i18next.language.split('-')[0];
        
        console.log('i18next initialized with language:', i18next.language);
        
        return i18next;
    } catch (error) {
        console.error('Failed to initialize i18next:', error);
        throw error;
    }
}

/**
 * Detect user's preferred language (comprehensive detection)
 * @returns {string} Detected language code
 */
function detectUserLanguage() {
    try {
        // 1. 优先从URL路径检测语言
        const pathLang = getLanguageFromPath();
        if (pathLang) {
            console.log('Language detected from URL path:', pathLang);
            return pathLang;
        }
        
        // 2. 从HTML标签检测语言
        const htmlLang = document.documentElement.lang;
        if (htmlLang && ['en', 'zh', 'de', 'es'].includes(htmlLang)) {
            console.log('Language detected from HTML lang attribute:', htmlLang);
            return htmlLang;
        }
        
        // 3. 从浏览器语言检测
        return detectBrowserLanguage();
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en';
    }
}

/**
 * Detect language from browser settings only
 * @returns {string} Detected language code
 */
function detectBrowserLanguage() {
    try {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        const detected = ['en', 'zh', 'de', 'es'].includes(langCode) ? langCode : 'en';
        console.log('Language detected from browser:', detected);
        return detected;
    } catch (error) {
        console.error('Error detecting browser language:', error);
        return 'en';
    }
}

/**
 * Get language code from URL path
 * @returns {string|null} Language code or null if not found
 */
function getLanguageFromPath() {
    const pathname = window.location.pathname;
    console.log('Current pathname:', pathname);
    
    // 检查是否在根目录 - 根目录现在默认为英文（SEO优化）
    if (pathname === '/' || pathname === '/index.html') {
        console.log('Root directory detected, returning English (SEO optimized)');
        return 'en';
    }
    
    // 检查是否在多语言构建的路径中 (/zh/, /en/, /fr/, 等)
    const langMatch = pathname.match(/\/([a-z]{2})\//);
    if (langMatch) {
        const langCode = langMatch[1];
        if (['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it'].includes(langCode)) {
            // 特殊处理：/en/ 路径也被视为英文，但在SEO优化中应重定向到根目录
            if (langCode === 'en') {
                console.log('Detected /en/ path - should redirect to root for SEO optimization');
            }
            return langCode;
        }
    }
    
    // 检查是否在根目录的特定语言文件中
    if (pathname.includes('/zh-index.html') || pathname.endsWith('/zh/')) {
        return 'zh';
    }
    if (pathname.includes('/en-index.html') || pathname.endsWith('/en/')) {
        console.log('Detected /en/ directory path - should redirect to root for SEO optimization');
        return 'en';
    }
    
    // 检查是否是根目录下的页面（无语言前缀）- 默认为英文
    const pathParts = pathname.split('/').filter(part => part);
    if (pathParts.length > 0) {
        const firstPart = pathParts[0];
        // 如果第一部分不是语言代码，则认为是根目录下的英文页面
        if (!['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it'].includes(firstPart)) {
            console.log('Root-level page detected (no language prefix), returning English');
            return 'en';
        }
    }
    
    return null;
}

/**
 * Format number according to locale
 * @param {number} number - Number to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export function formatNumber(number, options = {}) {
    const locale = i18next.language;
    return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Format date according to locale
 * @param {Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
    const locale = i18next.language;
    return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Preload other supported languages
 */
function preloadOtherLanguages() {
    const supportedLngs = ['en', 'zh', 'de', 'es'];
    const currentLng = i18next.language;
    
    supportedLngs.forEach(lng => {
        if (lng !== currentLng) {
            i18next.loadNamespaces(lng).catch(error => {
                console.error(`Failed to preload language ${lng}:`, error);
            });
        }
    });
}

/**
 * Load Chinese translations with special handling
 */
async function loadChineseTranslations() {
    try {
        const response = await fetch(getChineseTranslationsPath());
        if (!response.ok) {
            throw new Error('Failed to load Chinese translations');
        }
        const translations = await response.json();
        i18next.addResourceBundle('zh', 'translation', translations, true, true);
    } catch (error) {
        console.error('Error loading Chinese translations:', error);
    }
}

// 缺失翻译键的记录
const missingTranslationKeys = new Set();

// DOM元素缓存
let cachedElements = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000; // 5秒缓存

// 防抖定时器
let updateDebounceTimer = null;
const UPDATE_DEBOUNCE_DELAY = 100; // 100ms防抖延迟

// 翻译资源缓存
let translationCache = new Map();
let translationCacheTimestamp = new Map();
const TRANSLATION_CACHE_DURATION = 300000; // 5分钟缓存

// 语言切换防抖定时器
let languageChangeTimer = null;
const LANGUAGE_CHANGE_DELAY = 150; // 150ms防抖延迟

// 性能监控
const i18nPerformanceMetrics = {
    translationLoadTimes: new Map(),
    cacheHits: 0,
    cacheMisses: 0,
    uiUpdateTimes: [],
    languageChangeTimes: []
};

/**
 * 获取缓存的翻译文本
 * @param {string} key - 翻译键
 * @param {string} language - 语言代码
 * @returns {string|null} - 缓存的翻译文本或null
 */
function getCachedTranslation(key, language) {
    const cacheKey = `${language}:${key}`;
    const cached = translationCache.get(cacheKey);
    const timestamp = translationCacheTimestamp.get(cacheKey);
    
    if (cached && timestamp && (Date.now() - timestamp) < TRANSLATION_CACHE_DURATION) {
        i18nPerformanceMetrics.cacheHits++;
        return cached;
    }
    
    i18nPerformanceMetrics.cacheMisses++;
    return null;
}

/**
 * 缓存翻译文本
 * @param {string} key - 翻译键
 * @param {string} language - 语言代码
 * @param {string} translation - 翻译文本
 */
function cacheTranslation(key, language, translation) {
    const cacheKey = `${language}:${key}`;
    translationCache.set(cacheKey, translation);
    translationCacheTimestamp.set(cacheKey, Date.now());
}

/**
 * 获取翻译文本，带有回退机制和缓存
 * @param {string} key - 翻译键
 * @param {string} fallback - 回退文本
 * @returns {string} - 翻译后的文本
 */
function getTranslationWithFallback(key, fallback = null) {
    try {
        const currentLanguage = i18next.language;
        
        // 首先检查缓存
        const cachedTranslation = getCachedTranslation(key, currentLanguage);
        if (cachedTranslation) {
            return cachedTranslation;
        }
        
        const translation = i18next.t(key);
        
        // 如果翻译存在且不等于键本身，缓存并返回翻译
        if (translation && translation !== key) {
            cacheTranslation(key, currentLanguage, translation);
            return translation;
        }
        
        // 如果当前语言不是英文，尝试获取英文翻译作为回退
        if (currentLanguage !== 'en') {
            const cachedEnglishTranslation = getCachedTranslation(key, 'en');
            if (cachedEnglishTranslation) {
                console.warn(`🔄 Using cached English fallback for key: ${key}`);
                return cachedEnglishTranslation;
            }
            
            const englishTranslation = i18next.t(key, { lng: 'en' });
            if (englishTranslation && englishTranslation !== key) {
                console.warn(`🔄 Using English fallback for key: ${key}`);
                cacheTranslation(key, 'en', englishTranslation);
                return englishTranslation;
            }
        }
        
        // 记录缺失的翻译键
        if (!missingTranslationKeys.has(key)) {
            missingTranslationKeys.add(key);
            console.warn(`❌ Missing translation for key: ${key} (language: ${currentLanguage})`);
        }
        
        // 如果提供了回退文本，使用回退文本
        if (fallback) {
            console.warn(`🔄 Using fallback text for key: ${key}`);
            cacheTranslation(key, currentLanguage, fallback);
            return fallback;
        }
        
        // 最后的回退：返回格式化的键名
        const formattedKey = key.split('.').pop().replace(/([A-Z])/g, ' $1').trim();
        console.warn(`🔄 Using formatted key as fallback: ${key} -> ${formattedKey}`);
        cacheTranslation(key, currentLanguage, formattedKey);
        return formattedKey;
        
    } catch (error) {
        console.error(`❌ Error getting translation for key: ${key}`, error);
        return fallback || key;
    }
}

/**
 * 获取缺失的翻译键列表
 * @returns {Array} - 缺失的翻译键数组
 */
export function getMissingTranslationKeys() {
    return Array.from(missingTranslationKeys);
}

/**
 * 清除缺失翻译键的记录
 */
export function clearMissingTranslationKeys() {
    missingTranslationKeys.clear();
}

/**
 * 获取缓存的DOM元素
 * @returns {NodeList} - 缓存的DOM元素列表
 */
function getCachedElements() {
    const now = Date.now();
    
    // 如果缓存过期或不存在，重新获取
    if (!cachedElements || (now - lastCacheTime) > CACHE_DURATION) {
        cachedElements = document.querySelectorAll('[data-i18n]');
        lastCacheTime = now;
        console.log(`🔄 Refreshed DOM elements cache: ${cachedElements.length} elements`);
    }
    
    return cachedElements;
}

/**
 * 防抖的UI更新函数
 * @param {boolean} immediate - 是否立即执行
 */
export function debouncedUpdateUIElements(immediate = false) {
    // 清除之前的定时器
    if (updateDebounceTimer) {
        clearTimeout(updateDebounceTimer);
    }
    
    if (immediate) {
        updateUIElementsInternal();
    } else {
        updateDebounceTimer = setTimeout(() => {
            updateUIElementsInternal();
        }, UPDATE_DEBOUNCE_DELAY);
    }
}

/**
 * Update all UI elements with translations
 */
export function updateUIElements() {
    debouncedUpdateUIElements(true);
}

/**
 * 内部UI更新实现（优化版本）
 */
function updateUIElementsInternal() {
    const startTime = performance.now();
    
    try {
        console.log('🔄 Updating UI elements with language:', i18next.language);
        
        // 使用缓存的DOM元素
        const elements = getCachedElements();
        console.log(`📝 Found ${elements.length} elements with data-i18n`);
        
        if (elements.length === 0) {
            console.warn('⚠️ No elements with data-i18n attribute found');
            return;
        }
        
        let translatedCount = 0;
        let fallbackCount = 0;
        let skippedCount = 0;
        
        // 批量处理翻译，减少DOM操作
        const updates = [];
        
        // 对每个元素应用翻译
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            if (!key) return;
            
            // 特殊处理：完全跳过视口显示元素，但允许分辨率标签翻译
            if (element.id === 'viewport-display') {
                skippedCount++;
                return;
            }
            
            // 特殊处理：跳过分辨率元素中已经有内容的span
            if (element.parentNode && 
                (element.parentNode.id === 'viewport-display' || 
                 element.parentNode.id === 'screen-resolution-display')) {
                
                // 仅在元素显示"Detecting..."或为空时更新
                const currentText = element.textContent || '';
                if (currentText.includes('Detecting') || 
                    currentText.includes('检测中') || 
                    currentText.trim() === '') {
                    
                    const fallbackText = element.textContent || '';
                    const translation = getTranslationWithFallback(key, fallbackText);
                    updates.push({ element, translation, type: 'textContent' });
                    translatedCount++;
                    
                    if (translation !== i18next.t(key) || i18next.t(key) === key) {
                        fallbackCount++;
                    }
                } else {
                    skippedCount++;
                }
                return;
            }
            
            // 特殊处理设备信息元素 - 只有当它们还在显示"Detecting..."时才翻译
            if (element.parentNode && element.parentNode.className === 'info-item') {
                const currentText = element.textContent || element.value || '';
                if (currentText.includes('Detecting') || 
                    currentText.includes('检测中') || 
                    currentText.trim() === '') {
                    
                    const fallbackText = element.textContent || '';
                    const translation = getTranslationWithFallback(key, fallbackText);
                    updates.push({ element, translation, type: 'textContent' });
                    translatedCount++;
                    
                    if (translation !== i18next.t(key) || i18next.t(key) === key) {
                        fallbackCount++;
                    }
                } else {
                    // 已经有实际值的设备信息不更新
                    skippedCount++;
                }
                return;
            }
            
            // 跳过用户代理文本区域（除非它还在显示检测中）
            if (element.tagName === 'TEXTAREA' && element.id === 'user-agent') {
                const currentText = element.value || element.textContent || '';
                if (currentText.includes('Detecting') || 
                    currentText.includes('检测中') || 
                    currentText.trim() === '') {
                    
                    const fallbackText = element.value || element.textContent || '';
                    const translation = getTranslationWithFallback(key, fallbackText);
                    updates.push({ element, translation, type: 'value' });
                    translatedCount++;
                    
                    if (translation !== i18next.t(key) || i18next.t(key) === key) {
                        fallbackCount++;
                    }
                } else {
                    skippedCount++;
                }
                return;
            }
            
            // 常规元素翻译处理
            const currentText = element.textContent || '';
            const fallbackText = currentText.trim() || null;
            const translation = getTranslationWithFallback(key, fallbackText);
            
            // 根据元素类型设置翻译
            if (element.tagName === 'INPUT') {
                if (element.type === 'text' || element.hasAttribute('placeholder')) {
                    updates.push({ element, translation, type: 'placeholder' });
                } else {
                    updates.push({ element, translation, type: 'value' });
                }
            } else if (element.tagName === 'IMG') {
                updates.push({ element, translation, type: 'alt' });
            } else {
                // 对于一般元素，不覆盖已有实际数值（不含"Detecting..."的内容）
                if (currentText.includes('Detecting') || 
                    currentText.includes('检测中') || 
                    currentText.trim() === '' ||
                    currentText === key) {
                    
                    updates.push({ element, translation, type: 'textContent' });
                } else {
                    skippedCount++;
                    return;
                }
            }
            
            translatedCount++;
            
            if (translation !== i18next.t(key) || i18next.t(key) === key) {
                fallbackCount++;
            }
        });
        
        // 批量应用DOM更新，减少重排重绘
        requestAnimationFrame(() => {
            updates.forEach(({ element, translation, type }) => {
                switch (type) {
                    case 'textContent':
                        element.textContent = translation;
                        break;
                    case 'value':
                        element.value = translation;
                        break;
                    case 'placeholder':
                        element.placeholder = translation;
                        break;
                    case 'alt':
                        element.alt = translation;
                        break;
                }
            });
        });
        
        const endTime = performance.now();
        const updateTime = endTime - startTime;
        i18nPerformanceMetrics.uiUpdateTimes.push(updateTime);
        
        console.log(`✅ UI elements updated in ${updateTime.toFixed(2)}ms: ${translatedCount} translated, ${skippedCount} skipped`);
        if (fallbackCount > 0) {
            console.warn(`⚠️ ${fallbackCount} elements used fallback translations`);
        }
        
        // 报告缺失的翻译键
        const missingKeys = getMissingTranslationKeys();
        if (missingKeys.length > 0) {
            console.warn(`❌ Missing translation keys (${missingKeys.length}):`, missingKeys.slice(0, 5));
        }
        
        // Update structured data
        updateStructuredData();
        
        // 触发翻译更新事件，通知其他组件
        window.dispatchEvent(new CustomEvent('translationsUpdated', {
            detail: { 
                language: i18next.language,
                translatedCount,
                fallbackCount,
                skippedCount,
                updateTime
            }
        }));
        
        // 也触发语言变更事件
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { 
                language: i18next.language,
                updateTime
            }
        }));
        
    } catch (error) {
        console.error('❌ Error updating UI elements:', error);
        
        const endTime = performance.now();
        const updateTime = endTime - startTime;
        i18nPerformanceMetrics.uiUpdateTimes.push(updateTime);
    }
}

/**
 * Set text content without interfering with translations
 * @param {string} elementId - Element ID
 * @param {string} text - Text to set
 */
export function setTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        console.log('Setting text content for:', elementId, 'to:', text);

        // 移除 data-i18n 属性以防止翻译系统覆盖动态内容
        if (element.hasAttribute('data-i18n')) {
            element.removeAttribute('data-i18n');
        }

        if (element.tagName === 'TEXTAREA') {
            element.value = text;
        } else {
            element.textContent = text;
        }
    } else {
        console.warn('Element not found:', elementId);
    }
}

/**
 * 防抖的语言切换函数（优化版本）
 * 现在与OptimizedEventManager协同工作
 * @param {string} newLang - 新语言代码
 * @param {Function} callback - 切换完成后的回调函数
 */
function debouncedLanguageChange(newLang, callback = null) {
    // 如果存在OptimizedEventManager，使用其防抖功能
    if (window.optimizedEventManager) {
        const debouncedChange = window.optimizedEventManager.debounce(async () => {
            await performLanguageChange(newLang, callback);
        }, LANGUAGE_CHANGE_DELAY, 'language-change');
        debouncedChange();
    } else {
        // 降级到原有的防抖处理
        if (languageChangeTimer) {
            clearTimeout(languageChangeTimer);
        }
        
        languageChangeTimer = setTimeout(async () => {
            await performLanguageChange(newLang, callback);
        }, LANGUAGE_CHANGE_DELAY);
    }
}

/**
 * 执行语言切换的核心逻辑
 * @param {string} newLang - 新语言代码
 * @param {Function} callback - 切换完成后的回调函数
 */
async function performLanguageChange(newLang, callback = null) {
    const startTime = performance.now();
    
    try {
        console.log(`🔄 Starting optimized language change to: ${newLang}`);
        
        // 改变语言
        await i18next.changeLanguage(newLang);
        localStorage.setItem('i18nextLng', newLang);
        document.documentElement.lang = newLang;
        
        // 清除翻译缓存以确保使用新语言
        translationCache.clear();
        translationCacheTimestamp.clear();
        
        // 清除DOM元素缓存以强制重新获取
        cachedElements = null;
        
        console.log('Language changed successfully, updating UI...');
        
        // 立即更新UI
        updateUIElements();
        
        const endTime = performance.now();
        const changeTime = endTime - startTime;
        i18nPerformanceMetrics.languageChangeTimes.push(changeTime);
        
        console.log(`✅ Optimized language switch completed in ${changeTime.toFixed(2)}ms`);
        
        if (callback) {
            callback();
        }
        
    } catch (error) {
        console.error('❌ Error changing language:', error);
        if (callback) {
            callback(error);
        }
    }
}

/**
 * Set up language selector functionality
 */
export function setupLanguageSelector() {
    // Setup legacy select element
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        console.log('Setting up language selector (legacy)');

        // Set initial value
        languageSelect.value = i18next.language;

        // Add change event listener with debouncing
        languageSelect.addEventListener('change', async (event) => {
            const newLang = event.target.value;
            console.log('Language selector changed to:', newLang);
            
            // 先更新选择器状态
            languageSelect.disabled = true;
            
            // 使用防抖的语言切换
            debouncedLanguageChange(newLang, (error) => {
                // 重新启用选择器
                languageSelect.disabled = false;
                
                if (error) {
                    // 如果出错，恢复之前的选择
                    languageSelect.value = i18next.language;
                }
            });
        });
    }
    
    // Setup new button-based language selector
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    
    if (languageToggle && languageDropdown) {
        console.log('Setting up language selector (new button style)');
        
        // Toggle dropdown when button is clicked
        languageToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            languageDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!languageToggle.contains(event.target) && !languageDropdown.contains(event.target)) {
                languageDropdown.classList.remove('active');
            }
        });
        
        // Handle language option clicks
        const languageOptions = languageDropdown.querySelectorAll('.language-option[data-lang]');
        languageOptions.forEach(option => {
            option.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                const newLang = option.getAttribute('data-lang');
                console.log('Language option clicked:', newLang);
                
                // Don't change if it's the same language
                if (newLang === i18next.language) {
                    languageDropdown.classList.remove('active');
                    return;
                }
                
                try {
                    // Show loading state
                    languageToggle.disabled = true;
                    languageDropdown.classList.remove('active');
                    
                    // Change language
                    await i18next.changeLanguage(newLang);
                    localStorage.setItem('i18nextLng', newLang);
                    document.documentElement.lang = newLang;
                    
                    console.log('Language changed successfully, updating UI...');
                    
                    // Update UI
                    updateUIElements();
                    
                    // Re-enable button
                    languageToggle.disabled = false;
                    
                    console.log('Language switch completed');
                    
                } catch (error) {
                    console.error('Error changing language:', error);
                    languageToggle.disabled = false;
                }
            });
        });
        
        // Close dropdown when pressing Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                languageDropdown.classList.remove('active');
            }
        });
    }
    
    if (!languageSelect && !languageToggle) {
        console.error('No language selector found (neither select nor button)');
    }
}

/**
 * Get language name from code
 */
function getLanguageName(code) {
    const languages = {
        en: 'English',
        zh: '中文',
        de: 'Deutsch',
        es: 'Español'
    };
    return languages[code] || code;
}

/**
 * 预加载翻译资源（优化版本）
 * @param {Array} languages - 要预加载的语言列表
 */
export async function preloadTranslations(languages = ['en', 'zh', 'de', 'es']) {
    const currentLng = i18next.language;
    const preloadPromises = [];
    
    languages.forEach(lng => {
        if (lng !== currentLng) {
            const promise = i18next.loadNamespaces(lng).catch(error => {
                console.error(`Failed to preload language ${lng}:`, error);
            });
            preloadPromises.push(promise);
        }
    });
    
    try {
        await Promise.all(preloadPromises);
        console.log('✅ Translation preloading completed');
    } catch (error) {
        console.error('❌ Error during translation preloading:', error);
    }
}

/**
 * 清除翻译缓存
 */
export function clearTranslationCache() {
    translationCache.clear();
    translationCacheTimestamp.clear();
    cachedElements = null;
    console.log('🗑️ Translation cache cleared');
}

/**
 * 获取国际化性能指标
 * @returns {Object} 性能指标对象
 */
export function getI18nPerformanceMetrics() {
    const avgLanguageChangeTime = i18nPerformanceMetrics.languageChangeTimes.length > 0 
        ? i18nPerformanceMetrics.languageChangeTimes.reduce((a, b) => a + b, 0) / i18nPerformanceMetrics.languageChangeTimes.length 
        : 0;
    
    const avgUIUpdateTime = i18nPerformanceMetrics.uiUpdateTimes.length > 0 
        ? i18nPerformanceMetrics.uiUpdateTimes.reduce((a, b) => a + b, 0) / i18nPerformanceMetrics.uiUpdateTimes.length 
        : 0;
    
    return {
        cacheHits: i18nPerformanceMetrics.cacheHits,
        cacheMisses: i18nPerformanceMetrics.cacheMisses,
        cacheHitRate: i18nPerformanceMetrics.cacheHits / (i18nPerformanceMetrics.cacheHits + i18nPerformanceMetrics.cacheMisses) || 0,
        averageLanguageChangeTime: avgLanguageChangeTime,
        averageUIUpdateTime: avgUIUpdateTime,
        translationCacheSize: translationCache.size,
        missingTranslationKeysCount: missingTranslationKeys.size
    };
}

/**
 * 批量更新嵌套翻译键
 * @param {Object} nestedKeys - 嵌套的翻译键对象
 */
export function updateNestedTranslations(nestedKeys) {
    const startTime = performance.now();
    
    try {
        Object.entries(nestedKeys).forEach(([elementId, keyPath]) => {
            const element = document.getElementById(elementId);
            if (element) {
                const translation = getTranslationWithFallback(keyPath);
                
                if (element.tagName === 'INPUT') {
                    if (element.type === 'text' || element.hasAttribute('placeholder')) {
                        element.placeholder = translation;
                    } else {
                        element.value = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        const endTime = performance.now();
        const updateTime = endTime - startTime;
        i18nPerformanceMetrics.uiUpdateTimes.push(updateTime);
        
        console.log(`📝 Nested translations updated in ${updateTime.toFixed(2)}ms`);
        
    } catch (error) {
        console.error('❌ Error updating nested translations:', error);
    }
} 
/**
 *
 Update structured data based on current language
 */
export function updateStructuredData() {
    try {
        const currentLang = i18next.language;
        
        // Update HowTo structured data
        const structuredDataElement = document.getElementById('structured-data');
        if (structuredDataElement) {
            const structuredData = {
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": currentLang === 'zh' ? "如何使用长宽比计算器" : "How to Use Aspect Ratio Calculator",
                "description": currentLang === 'zh' 
                    ? "学习如何使用在线长宽比计算器来计算和转换不同的屏幕比例，保持图像和视频的正确比例。"
                    : "Learn how to use the online aspect ratio calculator to calculate and convert different screen ratios while maintaining proper proportions for images and videos.",
                "image": {
                    "@type": "ImageObject",
                    "url": "https://screensize.cc/images/aspect-ratio-calculator-guide.jpg",
                    "width": 1200,
                    "height": 630
                },
                "totalTime": "PT2M",
                "estimatedCost": {
                    "@type": "MonetaryAmount",
                    "currency": "USD",
                    "value": "0"
                },
                "supply": [
                    {
                        "@type": "HowToSupply",
                        "name": currentLang === 'zh' ? "网络浏览器" : "Web Browser"
                    },
                    {
                        "@type": "HowToSupply", 
                        "name": currentLang === 'zh' ? "原始尺寸数据（宽度和高度）" : "Original dimension data (width and height)"
                    }
                ],
                "tool": [
                    {
                        "@type": "HowToTool",
                        "name": currentLang === 'zh' ? "长宽比计算器" : "Aspect Ratio Calculator",
                        "url": "https://screensize.cc/tools/aspect-ratio-calculator/"
                    }
                ],
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": currentLang === 'zh' ? "输入原始尺寸" : "Enter Original Dimensions",
                        "text": currentLang === 'zh' 
                            ? "在计算器的左侧输入框中输入您的原始宽度和高度数值。例如，输入1920作为宽度，1080作为高度。"
                            : "Enter your original width and height values in the calculator's left input boxes. For example, enter 1920 as width and 1080 as height.",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://screensize.cc/images/step1-input-dimensions.jpg",
                            "width": 800,
                            "height": 450
                        },
                        "url": "https://screensize.cc/tools/aspect-ratio-calculator/#step1"
                    },
                    {
                        "@type": "HowToStep",
                        "name": currentLang === 'zh' ? "查看当前比例" : "View Current Ratio",
                        "text": currentLang === 'zh' 
                            ? "系统会自动计算并显示当前的长宽比，例如16:9。这个比例将在整个计算过程中保持不变。"
                            : "The system will automatically calculate and display the current aspect ratio, such as 16:9. This ratio will remain constant throughout the calculation process.",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://screensize.cc/images/step2-view-ratio.jpg",
                            "width": 800,
                            "height": 450
                        },
                        "url": "https://screensize.cc/tools/aspect-ratio-calculator/#step2"
                    },
                    {
                        "@type": "HowToStep",
                        "name": currentLang === 'zh' ? "输入目标尺寸" : "Enter Target Dimensions",
                        "text": currentLang === 'zh' 
                            ? "在右侧的新尺寸区域，输入您希望转换到的新宽度或新高度。只需输入其中一个值即可。"
                            : "In the new dimensions section on the right, enter the new width or height you want to convert to. You only need to enter one value.",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://screensize.cc/images/step3-target-size.jpg",
                            "width": 800,
                            "height": 450
                        },
                        "url": "https://screensize.cc/tools/aspect-ratio-calculator/#step3"
                    },
                    {
                        "@type": "HowToStep",
                        "name": currentLang === 'zh' ? "获取计算结果" : "Get Calculation Results",
                        "text": currentLang === 'zh' 
                            ? "系统将自动计算并显示保持相同长宽比的对应尺寸。您可以在计算摘要中查看缩放倍数和最终比例。"
                            : "The system will automatically calculate and display the corresponding dimensions that maintain the same aspect ratio. You can view the scale factor and final ratio in the calculation summary.",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://screensize.cc/images/step4-get-result.jpg",
                            "width": 800,
                            "height": 450
                        },
                        "url": "https://screensize.cc/tools/aspect-ratio-calculator/#step4"
                    },
                    {
                        "@type": "HowToStep",
                        "name": currentLang === 'zh' ? "使用预设比例（可选）" : "Use Preset Ratios (Optional)",
                        "text": currentLang === 'zh' 
                            ? "您也可以点击页面下方的常见比例按钮（如16:9、4:3等）快速应用标准比例，系统会自动填入对应的数值。"
                            : "You can also click the common ratio buttons below the page (such as 16:9, 4:3, etc.) to quickly apply standard ratios, and the system will automatically fill in the corresponding values.",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://screensize.cc/images/step5-preset-ratios.jpg",
                            "width": 800,
                            "height": 450
                        },
                        "url": "https://screensize.cc/tools/aspect-ratio-calculator/#step5"
                    },
                    {
                        "@type": "HowToStep",
                        "name": currentLang === 'zh' ? "查看可视化预览" : "View Visual Preview",
                        "text": currentLang === 'zh' 
                            ? "在长宽比预览区域，您可以看到比例的可视化表示，帮助您更好地理解尺寸变化的效果。"
                            : "In the aspect ratio preview area, you can see a visual representation of the ratio, helping you better understand the effect of dimension changes.",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://screensize.cc/images/step6-visual-preview.jpg",
                            "width": 800,
                            "height": 450
                        },
                        "url": "https://screensize.cc/tools/aspect-ratio-calculator/#step6"
                    }
                ],
                "video": {
                    "@type": "VideoObject",
                    "name": currentLang === 'zh' ? "长宽比计算器使用教程" : "Aspect Ratio Calculator Tutorial",
                    "description": currentLang === 'zh' 
                        ? "详细演示如何使用长宽比计算器进行尺寸转换"
                        : "Detailed demonstration of how to use the aspect ratio calculator for dimension conversion",
                    "thumbnailUrl": "https://screensize.cc/images/video-thumbnail-aspect-ratio.jpg",
                    "uploadDate": "2024-01-15",
                    "duration": "PT1M30S",
                    "contentUrl": "https://screensize.cc/videos/aspect-ratio-calculator-tutorial.mp4"
                },
                "author": {
                    "@type": "Organization",
                    "name": "ScreenSize.cc",
                    "url": "https://screensize.cc"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "ScreenSize.cc",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://screensize.cc/images/logo.png",
                        "width": 200,
                        "height": 60
                    }
                },
                "datePublished": "2024-01-15",
                "dateModified": "2024-01-20"
            };
            
            structuredDataElement.textContent = JSON.stringify(structuredData, null, 2);
        }
        
        // Update FAQ structured data
        const faqStructuredDataElement = document.getElementById('faq-structured-data');
        if (faqStructuredDataElement) {
            const faqData = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "什么是长宽比？" : "What is aspect ratio?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "长宽比是指图像、屏幕或显示器的宽度与高度的比例关系。它通常用两个数字表示，如16:9，表示宽度是高度的16/9倍。长宽比在响应式网页设计、视频制作和显示器选择中都非常重要。"
                                : "Aspect ratio is the proportional relationship between the width and height of an image, screen, or display. It's usually expressed as two numbers, such as 16:9, indicating that the width is 16/9 times the height. Aspect ratio is very important in responsive web design, video production, and display selection."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "最常见的长宽比有哪些？" : "What are the most common aspect ratios?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "最常见的长宽比包括：16:9（现代显示器和电视）、4:3（传统显示器）、21:9（超宽屏显示器）、1:1（正方形，常用于社交媒体）、3:2（摄影标准）和5:4（老式显示器）。每种比例都有其特定的应用场景。"
                                : "The most common aspect ratios include: 16:9 (modern displays and TVs), 4:3 (traditional displays), 21:9 (ultrawide displays), 1:1 (square, commonly used for social media), 3:2 (photography standard), and 5:4 (older displays). Each ratio has its specific application scenarios."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "如何计算长宽比？" : "How to calculate aspect ratio?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "计算长宽比的方法是将宽度除以高度。例如，1920x1080的分辨率，长宽比为1920÷1080=1.78，约等于16:9。您也可以使用我们的在线计算器，只需输入尺寸即可自动计算。"
                                : "The method to calculate aspect ratio is to divide width by height. For example, with a 1920x1080 resolution, the aspect ratio is 1920÷1080=1.78, approximately equal to 16:9. You can also use our online calculator - just input the dimensions and it will calculate automatically."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "为什么长宽比在网页设计中很重要？" : "Why is aspect ratio important in web design?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "长宽比在网页设计中至关重要，因为它影响内容在不同设备上的显示效果。正确的长宽比可以确保图像不变形、布局保持美观、响应式设计正常工作。这对用户体验和SEO都有积极影响。"
                                : "Aspect ratio is crucial in web design because it affects how content displays on different devices. The correct aspect ratio ensures images don't distort, layouts remain aesthetically pleasing, and responsive design works properly. This has positive impacts on both user experience and SEO."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "如何在保持长宽比的同时调整图像尺寸？" : "How to resize images while maintaining aspect ratio?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "要在保持长宽比的同时调整图像尺寸，您需要按比例缩放宽度和高度。使用我们的计算器，输入原始尺寸和目标宽度（或高度），系统会自动计算出对应的高度（或宽度），确保比例不变。"
                                : "To resize images while maintaining aspect ratio, you need to scale width and height proportionally. Using our calculator, input the original dimensions and target width (or height), and the system will automatically calculate the corresponding height (or width), ensuring the ratio remains unchanged."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "移动设备和桌面设备的长宽比有什么区别？" : "What's the difference between mobile and desktop device aspect ratios?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "移动设备通常使用竖屏比例，如9:16或9:18，而桌面设备多使用横屏比例，如16:9或16:10。在响应式设计中，需要考虑这些差异，确保内容在不同设备上都能良好显示。"
                                : "Mobile devices typically use portrait ratios like 9:16 or 9:18, while desktop devices mostly use landscape ratios like 16:9 or 16:10. In responsive design, these differences need to be considered to ensure content displays well on different devices."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "长宽比计算器的主要用途是什么？" : "What are the main uses of an aspect ratio calculator?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "长宽比计算器主要用于：1）网页设计中创建响应式布局；2）视频编辑时调整视频尺寸适配不同平台；3）图像处理中按比例缩放图片避免变形；4）印刷设计中确保设计在不同尺寸下保持比例；5）社交媒体内容创建中制作适合各平台的内容尺寸。"
                                : "An aspect ratio calculator is mainly used for: 1) Creating responsive layouts in web design; 2) Adjusting video dimensions for different platforms in video editing; 3) Proportionally scaling images in image processing to avoid distortion; 4) Ensuring designs maintain proportions at different sizes in print design; 5) Creating content sized for various platforms in social media content creation."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": currentLang === 'zh' ? "如何选择适合的长宽比？" : "How to choose the right aspect ratio?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": currentLang === 'zh' 
                                ? "选择长宽比应考虑用途：网页和视频内容推荐16:9；社交媒体帖子可选择1:1；电影制作适合21:9；传统印刷可选择4:3或3:2。还要考虑目标设备和平台的要求，确保内容在预期环境中有最佳显示效果。"
                                : "Choosing aspect ratio should consider the purpose: 16:9 is recommended for web and video content; 1:1 can be chosen for social media posts; 21:9 is suitable for film production; 4:3 or 3:2 can be chosen for traditional printing. Also consider the requirements of target devices and platforms to ensure content has the best display effect in the expected environment."
                        }
                    }
                ]
            };
            
            faqStructuredDataElement.textContent = JSON.stringify(faqData, null, 2);
        }
        
        console.log('✅ Structured data updated for language:', currentLang);
    } catch (error) {
        console.error('❌ Error updating structured data:', error);
    }
}

// Listen for language changes and update structured data
window.addEventListener('languageChanged', () => {
    updateStructuredData();
});

// ====== Auto-initialization ======
(async function autoInitializeI18n() {
    try {
        console.log('Starting i18next auto-initialization...');
        
        // Initialize i18next
        await initializeI18next();
        
        console.log('\u2705 i18next initialized successfully');
        
        // Update UI with translations
        updateUIElements();
        
        // Trigger initialized event for other scripts
        document.dispatchEvent(new CustomEvent('i18nextInitialized', {
            detail: { language: i18next.language }
        }));
        
        console.log('\u2705 i18nextInitialized event dispatched');
        
    } catch (error) {
        console.error('\u274c Failed to auto-initialize i18next:', error);
    }
})();
