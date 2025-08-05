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
                supportedLngs: ['en', 'zh'],
                backend: {
                    loadPath: getLocalesPath(),
                    allowMultiLoading: true,
                    reloadInterval: false,
                    queryStringParams: { v: new Date().getTime() },
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
        if (htmlLang && ['en', 'zh'].includes(htmlLang)) {
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
        const detected = ['en', 'zh'].includes(langCode) ? langCode : 'en';
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
    
    // 检查是否在多语言构建的路径中 (/zh/, /en/, /fr/, 等)
    const langMatch = pathname.match(/\/([a-z]{2})\//);
    if (langMatch) {
        const langCode = langMatch[1];
        if (['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it'].includes(langCode)) {
            return langCode;
        }
    }
    
    // 检查是否在根目录的特定语言文件中
    if (pathname.includes('/zh-index.html') || pathname.endsWith('/zh/')) {
        return 'zh';
    }
    if (pathname.includes('/en-index.html') || pathname.endsWith('/en/')) {
        return 'en';
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
    const supportedLngs = ['en', 'zh'];
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
 * 防抖的语言切换函数
 * @param {string} newLang - 新语言代码
 * @param {Function} callback - 切换完成后的回调函数
 */
function debouncedLanguageChange(newLang, callback = null) {
    // 清除之前的定时器
    if (languageChangeTimer) {
        clearTimeout(languageChangeTimer);
    }
    
    languageChangeTimer = setTimeout(async () => {
        const startTime = performance.now();
        
        try {
            console.log(`🔄 Starting language change to: ${newLang}`);
            
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
            
            console.log(`✅ Language switch completed in ${changeTime.toFixed(2)}ms`);
            
            if (callback) {
                callback();
            }
            
        } catch (error) {
            console.error('❌ Error changing language:', error);
            if (callback) {
                callback(error);
            }
        }
    }, LANGUAGE_CHANGE_DELAY);
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
        zh: '中文'
    };
    return languages[code] || code;
}

/**
 * 预加载翻译资源（优化版本）
 * @param {Array} languages - 要预加载的语言列表
 */
export async function preloadTranslations(languages = ['en', 'zh']) {
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