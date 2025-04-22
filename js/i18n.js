// i18n.js - Internationalization module

// 确保 i18next 已加载
if (typeof i18next === 'undefined') {
    console.error('i18next library not loaded');
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
            defaultLng
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
                    loadPath: '../locales/{{lng}}/translation.json',
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
                debug: false,
                interpolation: {
                    escapeValue: false
                },
                compatibilityJSON: 'v4'
            });

        // 如果是中文，使用特殊处理
        if (defaultLng === 'zh') {
            await loadChineseTranslations();
        }

        // Wait for the initial language to be loaded
        await i18next.loadNamespaces(i18next.language);
        
        // Update html lang attribute
        document.documentElement.lang = i18next.language.split('-')[0];
        
        // Preload other languages in the background
        preloadOtherLanguages();
        
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
        const response = await fetch('../locales/zh/translation.json');
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
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                const translation = i18next.t(key);
                if (translation && translation !== key) {
                    if (element.tagName === 'INPUT' && element.type === 'text') {
                        element.placeholder = translation;
                    } else if (element.tagName === 'IMG') {
                        element.alt = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });
        
        // Update select options
        const selectElements = document.querySelectorAll('select[data-i18n-options]');
        selectElements.forEach(select => {
            const options = select.getAttribute('data-i18n-options').split(',');
            options.forEach(option => {
                const optionElement = select.querySelector(`option[value="${option}"]`);
                if (optionElement) {
                    const translation = i18next.t(`select.${option}`);
                    if (translation) {
                        optionElement.textContent = translation;
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error updating UI elements:', error);
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

    // Set initial value
    languageSelect.value = i18next.language;

    // Add change event listener
    languageSelect.addEventListener('change', async (event) => {
        const newLang = event.target.value;
        try {
            await i18next.changeLanguage(newLang);
            localStorage.setItem('i18nextLng', newLang);
            document.documentElement.lang = newLang;
            updateUIElements();
        } catch (error) {
            console.error('Error changing language:', error);
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