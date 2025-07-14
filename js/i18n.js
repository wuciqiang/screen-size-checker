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

/**
 * Update all UI elements with translations
 */
export function updateUIElements() {
    try {
        console.log('Updating UI elements with language:', i18next.language);
        
        // 找到所有有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('Found elements with data-i18n:', elements.length);
        
        if (elements.length === 0) {
            console.warn('No elements with data-i18n attribute found');
        }
        
        let translatedCount = 0;
        
        // 对每个元素应用翻译
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            if (key) {
                // 特殊处理：完全跳过视口和分辨率显示元素
                if (element.id === 'viewport-display' || 
                    element.id === 'screen-resolution-display') {
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
                        
                        const translation = i18next.t(key);
                        if (translation && translation !== key) {
                            element.textContent = translation;
                            translatedCount++;
                        }
                    }
                    return;
                }
                
                // 特殊处理设备信息元素 - 只有当它们还在显示"Detecting..."时才翻译
                if (element.parentNode && element.parentNode.className === 'info-item') {
                    const currentText = element.textContent || element.value || '';
                    if (currentText.includes('Detecting') || 
                        currentText.includes('检测中') || 
                        currentText.trim() === '') {
                        
                        const translation = i18next.t(key);
                        if (translation && translation !== key) {
                            element.textContent = translation;
                            translatedCount++;
                        }
                    } 
                    // 已经有实际值的设备信息不更新
                    return;
                }
                
                // 跳过用户代理文本区域（除非它还在显示检测中）
                if (element.tagName === 'TEXTAREA' && element.id === 'user-agent') {
                    const currentText = element.value || element.textContent || '';
                    if (currentText.includes('Detecting') || 
                        currentText.includes('检测中') || 
                        currentText.trim() === '') {
                        
                        const translation = i18next.t(key);
                        if (translation && translation !== key) {
                            element.value = translation;
                            translatedCount++;
                        }
                    }
                    return;
                }
                
                // 常规元素翻译处理
                const translation = i18next.t(key);
                
                if (translation && translation !== key) {
                    // 根据元素类型设置翻译
                    if (element.tagName === 'INPUT' && element.type === 'text') {
                        element.placeholder = translation;
                    } else if (element.tagName === 'IMG') {
                        element.alt = translation;
                    } else {
                        // 对于一般元素，不覆盖已有实际数值（不含"Detecting..."的内容）
                        const currentText = element.textContent || '';
                        if (currentText.includes('Detecting') || 
                            currentText.includes('检测中') || 
                            currentText.trim() === '') {
                            
                            element.textContent = translation;
                        }
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
    // Setup legacy select element
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        console.log('Setting up language selector (legacy)');

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