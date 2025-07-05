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
    if (currentPath.includes('/devices/')) {
        return '../locales/{{lng}}/translation.json';
    }
    return './locales/{{lng}}/translation.json';
}

/**
 * Get correct path for Chinese translations
 * @returns {string} Correct path to Chinese translations
 */
function getChineseTranslationsPath() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/devices/')) {
        return '../locales/zh/translation.json';
    }
    return './locales/zh/translation.json';
}

/**
 * Initialize i18next with optimized configuration
 * @returns {Promise} i18next instance
 */
export async function initializeI18next() {
    try {
        // Get saved language from localStorage or detect from browser
        const savedLng = localStorage.getItem('i18nextLng');
        const detectedLng = detectUserLanguage();
        const defaultLng = savedLng || detectedLng || 'en';
        
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
                debug: true, // 开启调试模式
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
 * Detect user's preferred language
 * @returns {string} Detected language code
 */
function detectUserLanguage() {
    try {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        return ['en', 'zh'].includes(langCode) ? langCode : 'en';
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en';
    }
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

/**
 * Update all UI elements with current language
 */
export function updateUIElements() {
    try {
        console.log('Updating UI elements with language:', i18next.language);
        
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('Found elements with data-i18n:', elements.length);
        
        // 定义不应该被翻译覆盖的动态内容元素（只包含实际的动态值元素）
        const dynamicValueElements = [
            'viewport-display', 'aspect-ratio', 'dpr', 'color-depth', 
            'os-info', 'browser-info', 'cookies-enabled', 'touch-support'
        ];
        
        let translatedCount = 0;
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                // 跳过已经包含实际检测值的动态元素
                if (element.id && dynamicValueElements.includes(element.id)) {
                    // 检查是否还在显示 "检测中..." 或 "Detecting..."
                    const currentText = element.textContent || element.value;
                    if (currentText.includes('检测中') || currentText.includes('Detecting')) {
                        // 如果还在检测中，则更新翻译
                        const translation = i18next.t(key);
                        if (translation && translation !== key) {
                            element.textContent = translation;
                            translatedCount++;
                        }
                    } else {
                        console.log('Skipping dynamic element with actual value:', element.id);
                    }
                    return;
                }
                
                // 跳过用户代理文本区域（除非它还在显示检测中）
                if (element.tagName === 'TEXTAREA' && element.id === 'user-agent') {
                    const currentText = element.value || element.textContent;
                    if (currentText.includes('检测中') || currentText.includes('Detecting')) {
                        const translation = i18next.t(key);
                        if (translation && translation !== key) {
                            element.value = translation;
                            translatedCount++;
                        }
                    } else {
                        console.log('Skipping user agent textarea with actual value');
                    }
                    return;
                }
                
                const translation = i18next.t(key);
                console.log('Translating key:', key, 'to:', translation);
                
                if (translation && translation !== key) {
                    if (element.tagName === 'INPUT' && element.type === 'text') {
                        element.placeholder = translation;
                    } else if (element.tagName === 'IMG') {
                        element.alt = translation;
                    } else {
                        element.textContent = translation;
                    }
                    translatedCount++;
                }
            }
        });
        
        console.log(`UI elements updated successfully: ${translatedCount} elements translated`);
    } catch (error) {
        console.error('Error updating UI elements:', error);
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
 * Set up language selector functionality
 */
export function setupLanguageSelector() {
    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) {
        console.error('Language selector not found');
        return;
    }

    console.log('Setting up language selector');

    // Set initial value
    languageSelect.value = i18next.language;

    // Add change event listener
    languageSelect.addEventListener('change', async (event) => {
        const newLang = event.target.value;
        console.log('Language selector changed to:', newLang);
        
        try {
            // 先更新选择器状态
            languageSelect.disabled = true;
            
            // 改变语言
            await i18next.changeLanguage(newLang);
            localStorage.setItem('i18nextLng', newLang);
            document.documentElement.lang = newLang;
            
            console.log('Language changed successfully, updating UI...');
            
            // 立即更新UI
            updateUIElements();
            
            // 重新启用选择器
            languageSelect.disabled = false;
            
            console.log('Language switch completed');
            
        } catch (error) {
            console.error('Error changing language:', error);
            languageSelect.disabled = false;
        }
    });
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