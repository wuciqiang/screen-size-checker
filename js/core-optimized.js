// core-optimized.js - Phase 1.1 JavaScript浼樺寲
// 鏁村悎鏍稿績鍔熻兘妯″潡锛屽噺灏慔TTP璇锋眰锛屼繚鎸佹墍鏈変笟鍔￠€昏緫瀹屾暣鎬?
console.log('馃殌 Starting core-optimized.js...');

// ====== 鏍稿績宸ュ叿鍑芥暟 ======

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Calculate aspect ratio from width and height
 */
function calculateAspectRatio(width, height) {
    const gcd = (a, b) => {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    };

    const divisor = gcd(width, height);
    const aspectWidth = width / divisor;
    const aspectHeight = height / divisor;

    const commonRatios = {
        '16:9': [16, 9],
        '16:10': [16, 10],
        '4:3': [4, 3],
        '3:2': [3, 2],
        '21:9': [21, 9],
        '1:1': [1, 1]
    };

    for (const [ratio, [w, h]] of Object.entries(commonRatios)) {
        if (aspectWidth === w && aspectHeight === h) {
            return ratio;
        }
    }

    return `${aspectWidth}:${aspectHeight}`;
}

// ====== 璁惧妫€娴嬫牳蹇冨姛鑳?======

let deviceInfoCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000;

/**
 * 鏀堕泦璁惧淇℃伅锛堜紭鍖栫増鏈級
 */
function collectDeviceInfo() {
    const info = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        colorDepth: window.screen.colorDepth || 'Unknown',
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };

    info.aspectRatio = calculateAspectRatio(info.viewportWidth, info.viewportHeight);
    info.operatingSystem = detectOperatingSystem();
    info.browserInfo = detectBrowser();

    return info;
}

/**
 * 妫€娴嬫搷浣滅郴缁? */
function detectOperatingSystem() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Windows')) {
        if (userAgent.includes('Windows NT 10.0')) {
            return userAgent.includes('Chrome/110') || userAgent.includes('Edg/110') ? 'Windows 11' : 'Windows 10';
        }
        return 'Windows';
    } else if (userAgent.includes('Mac')) {
        return 'macOS';
    } else if (userAgent.includes('Linux')) {
        return 'Linux';
    } else if (userAgent.includes('Android')) {
        return 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        return 'iOS';
    }

    return 'Unknown';
}

/**
 * 妫€娴嬫祻瑙堝櫒淇℃伅
 */
function detectBrowser() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        const version = userAgent.match(/Chrome\/(\d+)/)?.[1];
        return `Chrome ${version || ''}`.trim();
    } else if (userAgent.includes('Edg')) {
        const version = userAgent.match(/Edg\/(\d+)/)?.[1];
        return `Edge ${version || ''}`.trim();
    } else if (userAgent.includes('Firefox')) {
        const version = userAgent.match(/Firefox\/(\d+)/)?.[1];
        return `Firefox ${version || ''}`.trim();
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        const version = userAgent.match(/Version\/(\d+)/)?.[1];
        return `Safari ${version || ''}`.trim();
    }

    return 'Unknown';
}

/**
 * 鏇存柊璁惧鏄剧ず淇℃伅
 */
function updateDisplay() {
    try {
        const deviceInfo = collectDeviceInfo();
        applyDeviceInfo(deviceInfo);
        deviceInfoCache = deviceInfo;
        cacheTimestamp = Date.now();
        console.log('Device information updated successfully');
    } catch (error) {
        console.error('Error during device detection:', error);
        setFallbackValues();
    }
}

/**
 * 搴旂敤璁惧淇℃伅鍒癠I
 */
function applyDeviceInfo(deviceInfo) {
    requestAnimationFrame(() => {
        updateScreenResolution(deviceInfo);
        updateViewportSize(deviceInfo);
        updateElementText('dpr', Math.round(deviceInfo.devicePixelRatio));
        updateElementText('color-depth', `${deviceInfo.colorDepth}-bit`);
        updateElementText('os-info', deviceInfo.operatingSystem);
        updateElementText('browser-info', deviceInfo.browserInfo);
        // Use localized labels for cookie/touch statuses.
        const cookiesStatus = deviceInfo.cookiesEnabled
            ? (typeof i18next !== 'undefined' && i18next.t ? i18next.t('yes') : 'Yes')
            : (typeof i18next !== 'undefined' && i18next.t ? i18next.t('no') : 'No');
        updateElementText('cookies-enabled', cookiesStatus);

        const touchStatus = deviceInfo.touchSupported
            ? (typeof i18next !== 'undefined' && i18next.t ? i18next.t('supported') : 'Supported')
            : (typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_supported') : 'Not supported');
        updateElementText('touch-support', touchStatus);
        updateElementText('user-agent', deviceInfo.userAgent);
        updateElementText('aspect-ratio', deviceInfo.aspectRatio);
    });
}

/**
 * 鏇存柊灞忓箷鍒嗚鲸鐜囨樉绀? */
function updateScreenResolution(deviceInfo) {
    const resolution = `${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}`;
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');

    if (screenResolutionDisplay) {
        const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
        if (detectingSpan) {
            detectingSpan.parentNode.removeChild(detectingSpan);
        }

        let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

        if (!labelSpan) {
            labelSpan = document.createElement('span');
            labelSpan.setAttribute('data-i18n', 'screen_resolution');
            labelSpan.textContent = 'Screen Resolution';
            screenResolutionDisplay.innerHTML = '';
            screenResolutionDisplay.appendChild(labelSpan);
            screenResolutionDisplay.appendChild(document.createTextNode(': '));
        }

        if (!valueSpan) {
            valueSpan = document.createElement('span');
            screenResolutionDisplay.appendChild(valueSpan);
        }

        valueSpan.removeAttribute('data-i18n');
        valueSpan.textContent = resolution;
    }
}

/**
 * 鏇存柊瑙嗗彛灏哄鏄剧ず
 */
function updateViewportSize(deviceInfo) {
    const viewport = `${deviceInfo.viewportWidth} × ${deviceInfo.viewportHeight}`;
    const viewportDisplay = document.getElementById('viewport-display');

    if (viewportDisplay) {
        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = viewport;
    }
}

/**
 * 瀹夊叏鏇存柊鍏冪礌鏂囨湰鍐呭
 */
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        // 娓呴櫎data-i18n灞炴€ч槻姝㈣i18next瑕嗙洊
        element.removeAttribute('data-i18n');
        // 娓呴櫎瀛愬厓绱犵殑data-i18n
        const children = element.querySelectorAll('[data-i18n]');
        children.forEach(child => child.removeAttribute('data-i18n'));
        // Set text/value based on element type.
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            element.value = String(text);
        } else {
            element.textContent = text;
        }
        console.log(`Updated ${id}: ${text}`);
    } else {
        console.warn(`Element not found: ${id}`);
    }
}

/**
 * 璁剧疆闄嶇骇鍊? */
function setFallbackValues() {
    console.log('Setting fallback values...');

    updateElementText('viewport-display', 'Detection failed');
    updateElementText('aspect-ratio', 'Not available');
    updateElementText('dpr', 'Not available');
    updateElementText('color-depth', 'Not available');
    updateElementText('os-info', 'Not available');
    updateElementText('browser-info', 'Not available');
    const notAvailable = typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_available') : 'Not available';
    updateElementText('cookies-enabled', notAvailable);
    updateElementText('touch-support', notAvailable);
    updateElementText('user-agent', 'Not available');
}

// ====== 涓婚绯荤粺鏍稿績鍔熻兘 ======

/**
 * 鍒濆鍖栦富棰樼郴缁? */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * 鍒囨崲涓婚
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    setTimeout(() => {
        const appliedTheme = document.documentElement.getAttribute('data-theme');
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { oldTheme: currentTheme, newTheme: appliedTheme }
        }));
    }, 50);
}

/**
 * 搴旂敤涓婚
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * 鏇存柊涓婚鍥炬爣
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F';
    }
}

// ====== 澶嶅埗鍔熻兘鏍稿績 ======

/**
 * 澶嶅埗鏂囨湰鍒板壀璐存澘
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
}


const COPY_TEXT_FALLBACKS = {
    copied_success: { en: 'Copied!', zh: 'Copied!', de: 'Kopiert!', es: 'Copiado!' },
    copy_failed: { en: 'Copy failed', zh: 'Copy failed', de: 'Kopieren fehlgeschlagen', es: 'Error al copiar' },
    all_info_copied: { en: 'All information copied!', zh: 'All information copied!', de: 'Alle Informationen kopiert!', es: 'Toda la informacion copiada!' },
    copy_all_failed: { en: 'Copy failed', zh: 'Copy failed', de: 'Kopieren fehlgeschlagen', es: 'Error al copiar' },
    screen_resolution: { en: 'Screen Resolution', zh: 'Screen Resolution', de: 'Bildschirmaufloesung', es: 'Resolucion de Pantalla' },
    viewport_size: { en: 'Viewport Size', zh: 'Viewport Size', de: 'Viewport-Groesse', es: 'Tamano del Viewport' },
    aspect_ratio: { en: 'Aspect Ratio', zh: 'Aspect Ratio', de: 'Seitenverhaeltnis', es: 'Relacion de Aspecto' },
    device_pixel_ratio: { en: 'Device Pixel Ratio (DPR)', zh: 'Device Pixel Ratio (DPR)', de: 'Device Pixel Ratio (DPR)', es: 'Relacion de Pixeles del Dispositivo (DPR)' },
    color_depth: { en: 'Color Depth', zh: 'Color Depth', de: 'Farbtiefe', es: 'Profundidad de Color' },
    operating_system: { en: 'Operating System', zh: 'Operating System', de: 'Betriebssystem', es: 'Sistema Operativo' },
    browser: { en: 'Browser', zh: 'Browser', de: 'Browser', es: 'Navegador' },
    cookies_enabled: { en: 'Cookies Enabled', zh: 'Cookies Enabled', de: 'Cookies aktiviert', es: 'Cookies Habilitadas' },
    touch_support: { en: 'Touch Support', zh: 'Touch Support', de: 'Touch-Unterstuetzung', es: 'Soporte Tactil' },
    user_agent: { en: 'User Agent', zh: 'User Agent', de: 'User Agent', es: 'User Agent' }
};

function normalizeCopyLang(rawLang) {
    return (rawLang || 'en').toLowerCase().split('-')[0];
}

function getCurrentCopyLang() {
    const htmlLang = document.documentElement ? document.documentElement.lang : '';
    const storedLang = (() => {
        try {
            return localStorage.getItem('i18nextLng') || localStorage.getItem('lang') || '';
        } catch (_) {
            return '';
        }
    })();
    const i18nLang = (typeof i18next !== 'undefined' && (i18next.resolvedLanguage || i18next.language))
        ? (i18next.resolvedLanguage || i18next.language)
        : '';

    return normalizeCopyLang(storedLang || htmlLang || i18nLang || 'en');
}

function getCopyText(key) {
    const lang = getCurrentCopyLang();

    if (typeof i18next !== 'undefined' && typeof i18next.t === 'function') {
        let translated = '';

        if (typeof i18next.getFixedT === 'function') {
            translated = i18next.getFixedT(lang)(key);
        } else {
            translated = i18next.t(key, { lng: lang });
        }

        if (translated && translated !== key) {
            return translated;
        }
    }

    const fallback = COPY_TEXT_FALLBACKS[key] || COPY_TEXT_FALLBACKS.copy_failed;
    return fallback[lang] || fallback.en;
}

/**
 * 澶勭悊澶嶅埗鎸夐挳鐐瑰嚮浜嬩欢
 */
async function handleCopyClick(event) {
    const button = event.target;
    const targetId = button.getAttribute('data-clipboard-target');
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
        console.error("Target element with id '" + targetId + "' not found");
        return;
    }

    try {
        const textToCopy = targetElement.textContent || targetElement.innerText;
        const success = await copyToClipboard(textToCopy);
        const message = success ? getCopyText('copied_success') : getCopyText('copy_failed');
        showToast(message, success ? 1800 : 3000);
    } catch (error) {
        console.error('Copy failed:', error);
        showToast(getCopyText('copy_failed'), 3000);
    }
}

/**
 * 澶嶅埗鎵€鏈変俊鎭? */
async function copyAllInfo() {
    try {
        const info = [];

        const dataElements = [
            { labelKey: 'viewport_size', id: 'viewport-display' },
            { labelKey: 'screen_resolution', id: 'screen-resolution-display' },
            { labelKey: 'aspect_ratio', id: 'aspect-ratio' },
            { labelKey: 'device_pixel_ratio', id: 'dpr' },
            { labelKey: 'color_depth', id: 'color-depth' },
            { labelKey: 'operating_system', id: 'os-info' },
            { labelKey: 'browser', id: 'browser-info' },
            { labelKey: 'cookies_enabled', id: 'cookies-enabled' },
            { labelKey: 'touch_support', id: 'touch-support' },
            { labelKey: 'user_agent', id: 'user-agent' }
        ];

        for (const item of dataElements) {
            const element = document.getElementById(item.id);
            if (!element) continue;

            let value = '';
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                value = element.value;
            } else if (item.id === 'screen-resolution-display') {
                const span = element.querySelector('span:last-child');
                value = span ? span.textContent : element.textContent;
            } else {
                value = element.textContent || element.innerText;
            }

            const cleaned = (value || '').trim();
            if (cleaned) {
                info.push(`${getCopyText(item.labelKey)}: ${cleaned}`);
            }
        }

        if (info.length === 0) {
            console.warn('No information to copy');
            showToast(getCopyText('copy_all_failed'), 3000);
            return false;
        }

        const textToCopy = info.join('\n');
        const success = await copyToClipboard(textToCopy);

        if (success) {
            showToast(getCopyText('all_info_copied'));
        } else {
            showToast(getCopyText('copy_all_failed'), 3000);
        }

        return success;
    } catch (error) {
        console.error('Failed to copy all info:', error);
        showToast(getCopyText('copy_all_failed'), 3000);
        return false;
    }
}

// ====== 璇█鍔熻兘鏍稿績 ======

/**
 * 瀵艰埅鍒版寚瀹氳瑷€
 */
function navigateToLanguage(newLang) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;

    localStorage.setItem('i18nextLng', newLang);

    let newPath;

    if (currentPath.includes('/multilang-build/')) {
        const buildMatch = currentPath.match(/^(.*)\/multilang-build\/([a-z]{2})(\/.*)?$/);
        if (buildMatch) {
            const basePath = buildMatch[1] || '';
            const currentLang = buildMatch[2];
            const pathAfterLang = buildMatch[3] || '/index.html';

            if (currentLang === newLang) return;

            if (newLang === 'en') {
                if (pathAfterLang.startsWith('/blog/')) {
                    newPath = `${basePath}/multilang-build/en${pathAfterLang}`;
                } else {
                    newPath = `${basePath}/multilang-build${pathAfterLang}`;
                }
            } else {
                newPath = `${basePath}/multilang-build/${newLang}${pathAfterLang}`;
            }
        } else {
            if (newLang === 'en') {
                newPath = `/multilang-build/index.html`;
            } else {
                newPath = `/multilang-build/${newLang}/index.html`;
            }
        }
    } else {
        const pathParts = currentPath.split('/').filter(part => part);
        let currentLang = 'en';
        let pagePath = '';

        if (pathParts.length === 0) {
            currentLang = 'en';
            pagePath = '';
        } else {
            const possibleLang = pathParts[0];
            const supportedLangs = ['en', 'zh', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru'];

            if (supportedLangs.includes(possibleLang)) {
                currentLang = possibleLang;
                pagePath = pathParts.slice(1).join('/');
            } else {
                currentLang = 'en';
                pagePath = pathParts.join('/');
            }
        }

        if (currentLang === newLang) return;

        if (newLang === 'en') {
            if (pagePath) {
                // 鑻辨枃鍗氬椤甸潰閮藉湪鏍圭洰褰曚笅锛屼笉闇€瑕?/en/ 鍓嶇紑
                newPath = `/${pagePath}`;
            } else {
                newPath = '/';
            }
        } else {
            newPath = `/${newLang}`;
            if (pagePath) {
                newPath += `/${pagePath}`;
            }

            if (!pagePath || (!pagePath.includes('.') && !pagePath.endsWith('/'))) {
                newPath += '/';
            }
        }
    }

    const newUrl = newPath + currentSearch + currentHash;
    window.location.href = newUrl;
}

// ====== FAQ鍔熻兘鏍稿績 ======

/**
 * 璁剧疆FAQ鍒囨崲鍔熻兘
 */
function setupFAQToggles() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            const answer = faqItem.querySelector('.faq-answer');

            // 鍏抽棴鎵€鏈塅AQ椤圭洰
            document.querySelectorAll('.faq-question').forEach(q => {
                const item = q.closest('.faq-item');
                if (item) {
                    item.classList.remove('active');
                    q.setAttribute('aria-expanded', 'false');

                    const ans = item.querySelector('.faq-answer');
                    if (ans) {
                        ans.style.maxHeight = '0px';
                        ans.setAttribute('hidden', '');
                    }
                }
            });

            // 鍒囨崲褰撳墠椤圭洰
            if (!isExpanded) {
                faqItem.classList.add('active');
                question.setAttribute('aria-expanded', 'true');

                if (answer) {
                    answer.removeAttribute('hidden');
                    answer.style.maxHeight = '0px';
                    answer.style.overflow = 'hidden';

                    answer.style.maxHeight = 'none';
                    answer.style.display = 'block';
                    const height = answer.scrollHeight;

                    answer.style.maxHeight = '0px';
                    answer.offsetHeight;
                    answer.style.maxHeight = height + 'px';

                    setTimeout(() => {
                        answer.style.maxHeight = '200px';
                    }, 300);
                }

                question.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

// ====== Toast閫氱煡鍔熻兘 ======

/**
 * 鏄剧ずToast閫氱煡
 */
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = toast?.querySelector('.toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

// ====== 涓诲垵濮嬪寲鍑芥暟 ======

let isInitialized = false;

/**
 * 鍒濆鍖栧簲鐢? */
function initializeApp() {
    if (isInitialized) return;

    try {
        console.log('Starting optimized application initialization...');

        // 绔嬪嵆鎵ц鐨勫叧閿垵濮嬪寲
        updateInitialDisplayValues();
        initializeTheme();
        setupBasicEventListeners();

        // Defer non-critical tasks.
        setTimeout(() => {
            updateDisplay();
            setupAdvancedEventListeners();
        }, 50);

        isInitialized = true;
        console.log('鉁?Critical application initialization completed!');

    } catch (error) {
        console.error('鉂?Failed to initialize application:', error);
        showErrorMessage();
        updateInitialDisplayValues();

        try {
            initializeTheme();
            setupBasicEventListeners();
        } catch (fallbackError) {
            console.error('鉂?Even fallback initialization failed:', fallbackError);
        }
    }
}

/**
 * 鏇存柊鍒濆鏄剧ず鍊? */
function updateInitialDisplayValues() {
    try {
        const viewportDisplay = document.getElementById('viewport-display');
        if (viewportDisplay) {
            const width = window.innerWidth;
            const height = window.innerHeight;

            viewportDisplay.removeAttribute('data-i18n');

            const detectingSpan = viewportDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                viewportDisplay.innerHTML = '';
            }

            viewportDisplay.textContent = `${width} × ${height}`;
        }

        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        if (screenResolutionDisplay) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;

            const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                detectingSpan.parentNode.removeChild(detectingSpan);
            }

            let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
            let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

            if (!labelSpan) {
                labelSpan = screenResolutionDisplay.querySelector('span:first-child') || document.createElement('span');
                labelSpan.setAttribute('data-i18n', 'screen_resolution');
                labelSpan.textContent = 'Screen Resolution';

                if (!labelSpan.parentNode) {
                    screenResolutionDisplay.appendChild(labelSpan);
                }
            }

            let colonNode = null;
            for (let i = 0; i < screenResolutionDisplay.childNodes.length; i++) {
                const node = screenResolutionDisplay.childNodes[i];
                if (node.nodeType === Node.TEXT_NODE &&
                    (node.textContent.includes(':') || node.textContent.includes('：'))) {
                    colonNode = node;
                    break;
                }
            }

            if (!colonNode) {
                colonNode = document.createTextNode(': ');
                screenResolutionDisplay.appendChild(colonNode);
            }

            if (!valueSpan) {
                valueSpan = document.createElement('span');
                screenResolutionDisplay.appendChild(valueSpan);
            }

            valueSpan.removeAttribute('data-i18n');
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
        }
    } catch (error) {
        console.error('鏇存柊鍒濆鏄剧ず鍊兼椂鍑洪敊:', error);
    }
}

/**
 * 璁剧疆鍩虹浜嬩欢鐩戝惉鍣? */
function setupBasicEventListeners() {
    console.log('馃帶 Setting up basic event listeners...');

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('鉁?Found theme toggle button, binding click event');
        themeToggle.addEventListener('click', toggleTheme);
    }

    setupBasicLanguageSelector();

    window.addEventListener('resize', debounce(updateViewportDisplay, 100));

    setupFAQToggles();
    setupNavigationActiveState();
    // setupInternalLinks(); // 宸茶縼绉诲埌 internal-links.js 妯″潡

    console.log('鉁?Basic event listeners setup completed');
}

/**
 * 璁剧疆楂樼骇浜嬩欢鐩戝惉鍣? */
function setupAdvancedEventListeners() {
    console.log('馃帶 Setting up advanced event listeners...');

    // 澶嶅埗鎸夐挳浜嬩欢
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('copy-btn') && event.target.getAttribute('data-clipboard-target')) {
            event.preventDefault();
            await handleCopyClick(event);
        }
    });

    // Copy all info button
    const copyAllBtn = document.getElementById('copy-all-info');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', async () => {
            try {
                const result = await copyAllInfo();
                if (!result) {
                    const message = getCopyText('copy_all_failed');
                    showToast(message, 3000);
                }
            } catch (e) {
                console.error('Copy all info failed:', e);
                const message = getCopyText('copy_all_failed');
                showToast(message, 3000);
            }
        });
    }

    console.log('鉁?Advanced event listeners setup completed');
}

/**
 * 璁剧疆瀵艰埅婵€娲荤姸鎬? */
function setupNavigationActiveState() {
    // Skip client-side update when active nav already exists.
    const hasServerSideActive = document.querySelector('.nav-link.active');
    
    // If server already marked active nav, skip client update.
    if (hasServerSideActive) {
        console.log('Navigation state already set by server, skipping client-side update');
        return;
    }
    
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            // Remove any existing active classes
            link.classList.remove('active');

            // Check if this link matches the current page
            if (href === currentPath ||
                (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/index.html'))) ||
                (href === currentPath.split('/').pop())) {
                link.classList.add('active');
            }
        }
    });
}

/**
 * 璁剧疆鍐呴摼鍔熻兘
 */
function setupInternalLinks() {
    const container = document.getElementById('internal-links-container');
    const loading = document.getElementById('internal-links-loading');

    if (!container) {
        console.log('Internal links container not found');
        return;
    }

    // Simulate loading delay for better UX
    setTimeout(() => {
        try {
            const links = generateInternalLinks();
            renderInternalLinks(container, links);

            if (loading) {
                loading.style.display = 'none';
            }
        } catch (error) {
            console.error('Error setting up internal links:', error);
            if (loading) {
                loading.innerHTML = '<span class="error-text">Failed to load resources</span>';
            }
        }
    }, 300);
}

/**
 * 妫€娴嬪綋鍓嶈瑷€
 */
function detectCurrentLanguage() {
    const path = window.location.pathname;

    // 浠庤矾寰勪腑妫€娴嬭瑷€
    if (path.includes('/zh/') || path.endsWith('/zh')) {
        return 'zh';
    }
    if (path.includes('/en/') || path.endsWith('/en')) {
        return 'en';
    }

    // Detect from local storage.
    const storedLang = localStorage.getItem('i18nextLng') || localStorage.getItem('lang');
    if (storedLang && ['en', 'zh'].includes(storedLang)) {
        return storedLang;
    }

    // Detect from html lang.
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang && ['en', 'zh'].includes(htmlLang)) {
        return htmlLang;
    }

    // 榛樿杩斿洖鑻辨枃
    return 'en';
}

/**
 * 璋冩暣鐩稿璺緞
 */
function adjustRelativePath(url, currentPath) {
    // If already relative, return as-is.
    if (!url.startsWith('/')) {
        return url;
    }

    // 瑙ｆ瀽褰撳墠璺緞
    const pathParts = currentPath.split('/').filter(part => part);
    const urlParts = url.split('/').filter(part => part);

    // Detect current path language and depth.
    let currentLang = 'en';
    let currentDepth = 0;
    let isInLanguageDir = false;
    let isInBlogDir = false;

    // 鍒嗘瀽褰撳墠璺緞缁撴瀯
    if (pathParts.length >= 1 && ['en', 'zh'].includes(pathParts[0])) {
        currentLang = pathParts[0];
        isInLanguageDir = true;
        currentDepth = 1;

        // Check whether current page is inside /blog/.
        if (pathParts.length >= 2 && pathParts[1] === 'blog') {
            isInBlogDir = true;
            currentDepth = 2;
        }
    }

    // Build relative path for current directory depth.
    if (isInLanguageDir && isInBlogDir) {
        // 褰撳墠鍦ㄥ崥瀹㈢洰褰曚笅: /en/blog/xxx
        if (urlParts[0] === 'blog') {
            // 璺宠浆鍒板崥瀹㈤〉闈? blog/index.html -> ../blog/index.html
            return '../' + urlParts.join('/');
        } else {
            // 璺宠浆鍒板伐鍏烽〉闈? devices/xxx.html -> ../../devices/xxx.html
            return '../../' + urlParts.join('/');
        }
    } else if (isInLanguageDir && !isInBlogDir) {
        // 褰撳墠鍦ㄨ瑷€鐩綍涓嬩絾涓嶅湪鍗氬鐩綍: /en/xxx
        if (urlParts[0] === 'blog') {
            // 璺宠浆鍒板崥瀹㈤〉闈? blog/index.html -> ./blog/index.html
            return urlParts.join('/');
        } else {
            // 璺宠浆鍒板伐鍏烽〉闈? devices/xxx.html -> ./devices/xxx.html
            return urlParts.join('/');
        }
    } else {
        // 褰撳墠鍦ㄦ牴鐩綍涓? /xxx
        if (urlParts[0] === 'blog') {
            // 璺宠浆鍒板崥瀹㈤〉闈紝闇€瑕佹坊鍔犺瑷€鍓嶇紑: blog/index.html -> en/blog/index.html
            return currentLang + '/' + urlParts.join('/');
        } else {
            // 璺宠浆鍒板伐鍏烽〉闈? devices/xxx.html -> devices/xxx.html
            return urlParts.join('/');
        }
    }
}

/**
 * 鐢熸垚鍐呴摼鏁版嵁
 */
function generateInternalLinks() {
    const currentPath = window.location.pathname;
    const currentPageId = getCurrentPageId(currentPath);
    const allLinks = [];

    // 鍐呴摼閰嶇疆鏁版嵁 - 鍩轰簬internal-links-config.json
    const INTERNAL_LINKS_CONFIG = {
        pages: {
            "iphone-viewport-sizes": {
                id: "iphone-viewport-sizes",
                category: "device-info",
                priority: 1,                icon: "tablet",
                urls: {
                    "en": "devices/iphone-viewport-sizes.html",
                    "zh": "devices/iphone-viewport-sizes.html"
                },
                title: "iPhone Viewport Sizes",
                description: "Complete list of iPhone viewport sizes for all models"
            },
            "ipad-viewport-sizes": {
                id: "ipad-viewport-sizes",
                category: "device-info",
                priority: 2,
                icon: "tablet",
                urls: {
                    "en": "devices/ipad-viewport-sizes.html",
                    "zh": "devices/ipad-viewport-sizes.html"
                },
                title: "iPad Viewport Sizes",
                description: "Complete list of iPad viewport sizes for all models"
            },
            "android-viewport-sizes": {
                id: "android-viewport-sizes",
                category: "device-info",
                priority: 3,
                icon: "馃",
                urls: {
                    "en": "devices/android-viewport-sizes.html",
                    "zh": "devices/android-viewport-sizes.html"
                },
                title: "Android Viewport Sizes",
                description: "Common Android device viewport sizes and resolutions"
            },
            "ppi-calculator": {
                id: "ppi-calculator",
                category: "calculator",
                priority: 1,
                icon: "馃攳",
                urls: {
                    "en": "devices/ppi-calculator.html",
                    "zh": "devices/ppi-calculator.html"
                },
                title: "PPI Calculator",
                description: "Calculate pixels per inch for any display"
            },
            "aspect-ratio-calculator": {
                id: "aspect-ratio-calculator",
                category: "calculator",
                priority: 2,
                icon: "馃搻",
                urls: {
                    "en": "devices/aspect-ratio-calculator.html",
                    "zh": "devices/aspect-ratio-calculator.html"
                },
                title: "Aspect Ratio Calculator",
                description: "Calculate and convert aspect ratios for displays"
            },
            "compare": {
                id: "compare",
                category: "tools",
                priority: 1,
                icon: "馃啔",
                urls: {
                    "en": "devices/compare.html",
                    "zh": "devices/compare.html"
                },
                title: "Screen Size Comparison",
                description: "Compare different screen sizes side by side"
            },
            "standard-resolutions": {
                id: "standard-resolutions",
                category: "reference",
                priority: 1,
                icon: "馃搳",
                urls: {
                    "en": "devices/standard-resolutions.html",
                    "zh": "devices/standard-resolutions.html"
                },
                title: "Standard Screen Resolutions",
                description: "Common screen resolutions and their uses"
            },
            "responsive-tester": {
                id: "responsive-tester",
                category: "tools",
                priority: 2,
                icon: "馃摫",
                urls: {
                    "en": "devices/responsive-tester.html",
                    "zh": "devices/responsive-tester.html"
                },
                title: "Responsive Design Tester",
                description: "Test your website on different screen sizes"
            },
            "blog": {
                id: "blog",
                category: "content",
                priority: 1,
                icon: "馃摑",
                urls: {
                    "en": "blog/index.html",
                    "zh": "blog/index.html"
                },
                title: "Blog",
                description: "Latest articles about screen sizes and responsive design"
            }
        },
        categories: {
            "device-info": {
                name: "Device Info",
                maxItems: 4
            },
            "calculator": {
                name: "Calculators",
                maxItems: 3
            },
            "tools": {
                name: "Tools",
                maxItems: 3
            },
            "reference": {
                name: "Reference",
                maxItems: 2
            },
            "content": {
                name: "Content",
                maxItems: 1
            }
        },
        display: {
            maxTotal: 9
        },
        rules: {
            excludeCurrent: true,
            prioritizeCategory: true,
            fallbackToAll: true
        }
    };

    // 妫€娴嬪綋鍓嶈瑷€
    const currentLang = detectCurrentLanguage();

    // 鏀堕泦鎵€鏈夐〉闈㈢殑閾炬帴
    for (const [pageKey, page] of Object.entries(INTERNAL_LINKS_CONFIG.pages)) {
        // 璺宠繃褰撳墠椤甸潰
        if (page.id === currentPageId) {
            continue;
        }

        // 鑾峰彇閫傚悎褰撳墠璇█鐨刄RL
        let url = page.urls[currentLang] || page.urls.en || Object.values(page.urls)[0];

        // 鏍规嵁褰撳墠椤甸潰璺緞璋冩暣鐩稿璺緞
        url = adjustRelativePath(url, currentPath);

        allLinks.push({
            ...page,
            url: url,
            categoryName: INTERNAL_LINKS_CONFIG.categories[page.category]?.name || page.category
        });
    }

    // Sort by priority and cap the result count.
    allLinks.sort((a, b) => (a.priority || 999) - (b.priority || 999));

    return allLinks.slice(0, INTERNAL_LINKS_CONFIG.display.maxTotal);
}

/**
 * 鑾峰彇褰撳墠椤甸潰ID
 */
function getCurrentPageId(path) {
    const pathParts = path.split('/').filter(part => part);
    const fileName = pathParts[pathParts.length - 1] || '';

    if (fileName.includes('iphone')) return 'iphone-viewport-sizes';
    if (fileName.includes('ipad')) return 'ipad-viewport-sizes';
    if (fileName.includes('android')) return 'android-viewport-sizes';
    if (fileName.includes('ppi')) return 'ppi-calculator';
    if (fileName.includes('aspect')) return 'aspect-ratio-calculator';
    if (fileName.includes('responsive')) return 'responsive-tester';
    if (fileName.includes('compare')) return 'compare';
    if (fileName.includes('standard')) return 'standard-resolutions';
    if (fileName.includes('blog')) return 'blog';

    return 'home';
}

/**
 * 娓叉煋鍐呴摼鍒伴〉闈? */
function renderInternalLinks(container, links) {
    if (!links || links.length === 0) {
        container.innerHTML = '<div class="no-links">No related resources available</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'internal-links-grid';

    links.forEach(link => {
        const card = createInternalLinkCard(link);
        grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
}

/**
 * 鍒涘缓鍐呴摼鍗＄墖鍏冪礌
 */
function createInternalLinkCard(link) {
    const template = document.getElementById('internal-link-template');
    const card = template ? template.content.cloneNode(true) : createDefaultLinkCard();

    const linkElement = card.querySelector('.internal-link-card');
    if (linkElement) {
        linkElement.href = link.url;
        linkElement.setAttribute('data-category', link.category);
        linkElement.setAttribute('data-page-id', link.id);

        const icon = linkElement.querySelector('.link-icon');
        if (icon) {
            icon.textContent = link.icon || getLinkIcon(link.category);
        }

        const title = linkElement.querySelector('.link-title');
        if (title) {
            title.textContent = link.title;
        }

        const description = linkElement.querySelector('.link-description');
        if (description) {
            description.textContent = link.description;
        }
    }

    return card;
}

/**
 * 鍒涘缓榛樿閾炬帴鍗＄墖
 */
function createDefaultLinkCard() {
    const fragment = document.createDocumentFragment();
    const link = document.createElement('a');
    link.className = 'internal-link-card';
    link.innerHTML = `
        <span class="link-icon" aria-hidden="true">馃摫</span>
        <div class="link-content">
            <span class="link-title"></span>
            <span class="link-description"></span>
        </div>
    `;
    fragment.appendChild(link);
    return fragment;
}

/**
 * 鑾峰彇閾炬帴鍥炬爣
 */
function getLinkIcon(category) {
    const icons = {
        'device-info': '馃摫',
        'calculator': '馃М',
        'tools': '馃敡',
        'reference': '馃摎',
        'content': '馃摑'
    };

    return icons[category] || '馃敆';
}

/**
 * 璁剧疆鍩虹璇█閫夋嫨鍣? */
function setupBasicLanguageSelector() {
    const languageModalTrigger = document.getElementById('language-modal-trigger');
    const languageModal = document.getElementById('language-modal');
    const languageModalClose = document.getElementById('language-modal-close');
    const languageModalBackdrop = document.getElementById('language-modal-backdrop');

    if (languageModalTrigger && languageModal) {
        console.log('Setting up basic language modal');

        languageModalTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            languageModal.classList.add('show');
            languageModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });

        const closeModal = () => {
            languageModal.classList.remove('show');
            languageModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (languageModalClose) {
            languageModalClose.addEventListener('click', closeModal);
        }

        if (languageModalBackdrop) {
            languageModalBackdrop.addEventListener('click', closeModal);
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && languageModal.classList.contains('show')) {
                closeModal();
            }
        });

        const languageCards = languageModal.querySelectorAll('.language-card:not(.disabled)');
        languageCards.forEach(card => {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                const newLang = card.getAttribute('data-lang');

                const originalContent = card.innerHTML;
                card.innerHTML = '<div class="lang-name">Loading...</div>';

                try {
                    const modal = document.getElementById('language-modal');
                    if (modal) {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }

                    navigateToLanguage(newLang);
                } catch (error) {
                    console.error('Error changing language:', error);
                    card.innerHTML = originalContent;
                    alert('Language switch failed. Please try again.');
                }
            });
        });
    }
}

/**
 * 鏇存柊瑙嗗彛鏄剧ず
 */
function updateViewportDisplay() {
    const viewportDisplay = document.getElementById('viewport-display');
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');

    if (viewportDisplay) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = `${width} × ${height}`;
    }

    if (screenResolutionDisplay) {
        const valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');
        if (valueSpan) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
        }
    }
}

/**
 * 鏄剧ず閿欒娑堟伅
 */
function showErrorMessage() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>妫€娴嬪け璐?/h2>
            <p>鏃犳硶妫€娴嬭澶囦俊鎭紝璇峰埛鏂伴〉闈㈤噸璇曘€?/p>
            <button onclick="window.location.reload()">閲嶈瘯</button>
        `;
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}

// ====== 鑷姩鍒濆鍖?======

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    setTimeout(initializeApp, 0);
}

setTimeout(() => {
    if (!isInitialized) {
        console.log('Fallback initialization...');
        initializeApp();
    }
}, 100);

// Refresh translated values after i18next initialization.
document.addEventListener('i18nextInitialized', () => {
    console.log('i18next initialized, updating translated values...');
    
    // 寤惰繜鎵ц锛岀‘淇濆湪 i18next 鐨?updateUIElements 涔嬪悗
    setTimeout(() => {
        if (deviceInfoCache) {
            const cookiesStatus = deviceInfoCache.cookiesEnabled
                ? (typeof i18next !== 'undefined' && i18next.t ? i18next.t('yes') : 'Yes')
                : (typeof i18next !== 'undefined' && i18next.t ? i18next.t('no') : 'No');
            updateElementText('cookies-enabled', cookiesStatus);

            const touchStatus = deviceInfoCache.touchSupported
                ? (typeof i18next !== 'undefined' && i18next.t ? i18next.t('supported') : 'Supported')
                : (typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_supported') : 'Not supported');
            updateElementText('touch-support', touchStatus);
            
            console.log('鉁?Updated cookies and touch support after i18next');
        }
    }, 100);
});

// ====== 瀵煎嚭鍏ㄥ眬鍑芥暟 ======

if (typeof window !== 'undefined') {
    window.toggleTheme = toggleTheme;
    window.applyTheme = applyTheme;
    window.updateThemeIcon = updateThemeIcon;
    window.initializeTheme = initializeTheme;
    window.copyToClipboard = copyToClipboard;
    window.handleCopyClick = handleCopyClick;
    window.copyAllInfo = copyAllInfo;
    window.showToast = showToast;
    window.navigateToLanguage = navigateToLanguage;
    window.updateDisplay = updateDisplay;
    window.calculateAspectRatio = calculateAspectRatio;
    window.debounce = debounce;

    console.log('馃實 Core functions exposed to global scope for compatibility');
}

// Functions are already exposed to global scope for compatibility

console.log('鉁?core-optimized.js loaded successfully');