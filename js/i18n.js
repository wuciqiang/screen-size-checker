// i18n.js - Internationalization module

/**
 * Initialize i18next with optimized configuration
 * @returns {Promise} i18next instance
 */
export async function initializeI18next() {
    // Get saved language from localStorage or use browser default
    const savedLng = localStorage.getItem('i18nextLng');
    const defaultLng = savedLng || 'en';
    
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
                // Add cache control headers
                allowMultiLoading: true,
                reloadInterval: false
            },
            detection: {
                order: ['localStorage', 'navigator'],
                caches: ['localStorage'],
                lookupLocalStorage: 'i18nextLng'
            },
            // Performance optimizations
            initImmediate: true,
            appendNamespaceToCIMode: false,
            keySeparator: '.',
            nsSeparator: ':',
            // Disable debug in production
            debug: false
        });
    
    // Update html lang attribute
    document.documentElement.lang = i18next.language.split('-')[0];
    
    // Preload other languages in the background
    preloadOtherLanguages();
    
    return i18next;
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