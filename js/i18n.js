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
        
        // Initialize with default language first
        await i18next
            .use(i18nextHttpBackend)
            .use(i18nextBrowserLanguageDetector)
            .init({
                lng: defaultLng,
                fallbackLng: 'en',
                supportedLngs: ['en', 'zh', 'fr', 'de', 'ko', 'ja', 'es', 'ru', 'pt', 'it'],
                backend: {
                    loadPath: '/locales/{{lng}}/translation.json',
                    allowMultiLoading: true,
                    reloadInterval: false
                },
                detection: {
                    order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
                    lookupQuerystring: 'lng',
                    lookupLocalStorage: 'i18nextLng',
                    caches: ['localStorage'],
                    checkWhitelist: true
                },
                // Performance optimizations
                initImmediate: false,
                appendNamespaceToCIMode: false,
                keySeparator: '.',
                nsSeparator: ':',
                // Debug mode - set to true to see i18next debug messages
                debug: false
            });

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
        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Check if language is supported
        const supportedLngs = ['en', 'zh', 'fr', 'de', 'ko', 'ja', 'es', 'ru', 'pt', 'it'];
        if (supportedLngs.includes(langCode)) {
            console.log('Detected language:', langCode);
            return langCode;
        }
        
        // Check browser languages in order of preference
        const browserLangs = navigator.languages || [browserLang];
        for (const lang of browserLangs) {
            const code = lang.split('-')[0].toLowerCase();
            if (supportedLngs.includes(code)) {
                console.log('Detected language from browser preferences:', code);
                return code;
            }
        }
        
        console.log('No supported language detected, defaulting to English');
        return 'en';
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
 * Preload other languages in the background
 */
function preloadOtherLanguages() {
    const languages = ['zh', 'fr', 'de', 'ko', 'ja', 'es', 'ru', 'pt', 'it'];
    languages.forEach(lng => {
        if (lng !== i18next.language) {
            i18next.loadNamespaces(lng, () => {
                console.log(`Preloaded language: ${lng}`);
            });
        }
    });
}

/**
 * Update UI elements with translations
 */
export function updateUIElements() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        let attribute = 'textContent';
        let actualKey = key;

        if (key.startsWith('[')) {
            const parts = key.match(/\[(.*?)\](.*)/);
            if (parts && parts.length === 3) {
                attribute = parts[1];
                actualKey = parts[2];
            } else {
                console.warn(`Invalid data-i18n attribute format: ${key}`);
                return; // Skip invalid format
            }
        }

        const translation = i18next.t(actualKey);

        if (el.tagName === 'TITLE') {
            document.title = translation;
        } else if (el.tagName === 'META' && attribute === 'content') {
            el.setAttribute('content', translation);
        } else if (attribute === 'placeholder') {
            el.setAttribute('placeholder', translation);
        } else if (attribute !== 'textContent' && el.hasAttribute(attribute)) {
            el.setAttribute(attribute, translation);
        } else {
            // Ensure we don't try to set textContent on elements that shouldn't have it directly
            if (typeof el.textContent !== 'undefined') {
                el.textContent = translation;
            }
        }
    });
    
    // Specifically re-translate copy button texts if they were in "Copied!" state
    document.querySelectorAll('.copy-btn.copied').forEach(btn => {
        btn.textContent = i18next.t('copy_btn');
        btn.classList.remove('copied'); // Reset class if language changes
    });
}

/**
 * Setup language selector
 */
export function setupLanguageSelector() {
    const langSelector = document.getElementById('language-select');
    if (langSelector) {
        // Set initial value from localStorage or current language
        const currentLang = localStorage.getItem('i18nextLng') || i18next.language.split('-')[0];
        langSelector.value = currentLang;
        
        // Add all supported languages
        const supportedLngs = i18next.options.supportedLngs;
        langSelector.innerHTML = supportedLngs.map(lng => {
            const langName = getLanguageName(lng);
            return `<option value="${lng}">${langName}</option>`;
        }).join('');
        
        // Set the current language
        langSelector.value = currentLang;
        
        langSelector.addEventListener('change', async (event) => {
            const chosenLng = event.target.value;
            
            // Add transition class
            document.body.classList.add('language-changing');
            
            // Save to localStorage
            localStorage.setItem('i18nextLng', chosenLng);
            
            // Change language
            await i18next.changeLanguage(chosenLng);
            
            // Remove transition class after a short delay
            setTimeout(() => {
                document.body.classList.remove('language-changing');
            }, 300);
        });
    } else {
        console.warn("Language selector not found.");
    }
}

/**
 * Get language name in its native form
 */
function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'zh': '中文 (Chinese)',
        'fr': 'Français (French)',
        'de': 'Deutsch (German)',
        'ko': '한국어 (Korean)',
        'ja': '日本語 (Japanese)',
        'es': 'Español (Spanish)',
        'ru': 'Русский (Russian)',
        'pt': 'Português (Portuguese)',
        'it': 'Italiano (Italian)'
    };
    return languages[code] || code;
} 