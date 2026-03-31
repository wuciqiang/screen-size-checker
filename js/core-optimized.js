// core-optimized.js - Phase 1.1 JavaScript濠电偞娼欓崥瀣晪闁?
// 闂備浇妗ㄩ悞锕€顭囧▎鎾崇畺閹兼番鍔岄崘鈧紓浣割儓濞夋洘淇婇崶顒佺厱闁哄啫鍊搁弸娆撴煕韫囨枂顏囩亽闂佺偨鍎村▍鏇㈠磻閵夆晜鐓ユ繛鎴烆焾鐎氫即鏌涢敐鍫燁仩濞存粍鎮傞獮鍫ュ箼閻闂佽崵濮村ú顓㈠绩闁秵鍎戝ù鐓庣摠閺咁剟鎮橀悙璺轰汗缂佺姳绮欓弻鐔兼⒐閹邦喖濡芥繝鈷€鍐х€殿喖鐏氬鍕緞瀹€鈧幊婵嬫⒑閸涘﹥顥栫紒缁樼箞閸┾偓妞ゆ帊鐒﹂～妤冪磼妫版繂浜為柍褜鍓涢幊鎾诲嫉椤掑嫬姹查柨婵嗩槸缁?
console.log('濡絽鍟悾?Starting core-optimized.js...');

// ====== 闂備礁鎼粔鍫曗€﹂崼銏㈢处闁诡垎灞芥櫊闂侀潧顦崕鍗烆嚗閺冨牊鐓曢柟杈剧到琚氶梺?======

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

// ====== 闂佽崵濮抽悞锕傚磿閹跺壙鍥敆閳ь剝鐏嬮梺閫炲苯澧棁澶愭倵閿濆骸浜炲鐟邦儔閻擃偊宕惰閺嗘瑥鈹戦鐣屾创闁?======

let deviceInfoCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000;

/**
 * 闂備浇銆€閸嬫捇鏌涢锝嗙闁艰尙濞€閹鎷呴悷鏉垮Б濡炪倧瀵岄崜姘辩矚闁秴鐒洪柛鎰屽懐顦ラ梻浣瑰缁嬫垿鎮ч崨顖涱潟妞ゆ挶鍨圭粈宀勬煛瀹ュ骸浜滄い锝呫偢閺岋繝宕奸銏犫挄缂?
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
 * 婵犵妲呴崑鈧柛瀣尰缁绘盯寮堕幋顓炲壉闂佺懓銈搁弨閬嶅箯閸涱収鐓ラ柛娑欐綑閸樻瑧绱? */
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
 * 婵犵妲呴崑鈧柛瀣尰缁绘盯寮堕幋顓炲壉缂備椒娴囧畷鐢稿箟閹绢喖閱囨繝闈涙川瑜版粍绻涢敐鍛闁告挻绻冪€?
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
 * 闂備礁鎼ú銈夋偤閵娾晛钃熷┑鐘插婵ジ鏌熼鍡楁湰鏍￠梻浣告惈鐎氼剚鏅舵禒瀣︽慨姗嗗幘閳瑰秹鏌嶉埡浣告殨缂?
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
 * 闂佸湱鍘ч悺銊ヮ潖婵犳艾鏋侀柕鍫濇处婵ジ鏌熼鍡楁湰鏍″┑鐑囩到濞茬娀宕滃┑鍥ь嚤闁告稒娼欑粈鍡涙煟瑜忛崵?
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
 * 闂備礁鎼ú銈夋偤閵娾晛钃熷┑鐘插濞岊亪鐓崶銊﹀暗妞ゆ柨閰ｉ弻娑㈠箳閹寸儐妫ユ俊鐐茬摠閹倿骞冮幎钘夌倞闁靛鑵归弸鏍磽娴ｆ彃浜? */
function updateScreenResolution(deviceInfo) {
    const resolution = deviceInfo.screenWidth + ' × ' + deviceInfo.screenHeight;
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
 * 闂備礁鎼ú銈夋偤閵娾晛钃熷┑鐘插閸犲棝鏌涢埄鍐炬當缂傚秵鎹囬幃妯跨疀閹惧瓨鍎撳銈嗘处閸欏啫顕ｆ导鏉戠鐟滃绂?
 */
function updateViewportSize(deviceInfo) {
    const viewport = deviceInfo.viewportWidth + ' × ' + deviceInfo.viewportHeight;
    const viewportDisplay = document.getElementById('viewport-display');

    if (viewportDisplay) {
        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = viewport;
    }
}

/**
 * 闂佽娴烽幊鎾凰囬鐐茬煑闊洦绋戦崡鎶芥倵濞戞鎴︽偂閳ь剟姊虹粙璺ㄧ闁哥喐澹嗙划鍫濈暆閸曨偅顥濋梺鎼炲劘閸斿秹骞忛柆宥嗙厱闁归偊鍓氶崳瑙勩亜?
 */
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        // 婵犵數鍋為幐鎼佸箠濡　鏋嶇€圭妯卼a-i18n闂佽绻掗崑鐔煎磻閻愬搫鐒垫い鎴墮濞诧缚绨烘繝娈垮枟缁哄潡宕规總闈╃稏妞?8next闂佽崵鍠愬ú鏍涘☉妯?
        element.removeAttribute('data-i18n');
        // 婵犵數鍋為幐鎼佸箠濡　鏋嶉幖杈剧岛閸嬫挸鈽夊▎蹇擃潓闂佸憡蓱閹告儳危閹扮増鍋愰柛顭戝亞閺嗙嚳ata-i18n
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
 * 闂佽崵濮崇粈浣规櫠娴犲鍋柛鈩冪⊕閳锋梻鈧箍鍎卞ú顓㈡偘閹剧粯鐓? */
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

// ====== 濠电偞鍨堕幐鎼佲€﹂悜濮愨偓鍌炴偩鐏炶棄顕ч梺鐓庮潟閸婃宕洪悩缁樼厸鐎广儱娴傞悞鍓х磼濞差亞鐣虹€规洘绻堥幃銏㈡嫚閹绘帒绠?======

/**
 * 闂備礁鎲＄敮妤冩崲閸岀儑缍栭柟鐗堟緲缁€宀勬煛瀹ュ繒鐣遍柣锔界矊铻為柣妤€鐗滈悞浠嬫⒑椤旂⒈鍤熺紒? */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * 闂備礁鎲＄敮鎺懨洪敃鈧悾鐑藉矗婢跺备鏋栨繝鐢靛У閸戝綊寮?
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
 * 闂佸湱鍘ч悺銊ヮ潖婵犳艾鏋侀柕鍫濇閳绘柨鈹戦悩鍐插毈闁?
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * 闂備礁鎼ú銈夋偤閵娾晛钃熷┑鐘插暟閳绘柨鈹戦悩鍐插毈闁哄棭鍨堕弻娑㈠Ψ瑜嶆禍楣冩煟?
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F';
    }
}

// ====== 濠电姰鍨煎▔娑氱矓閹绢喖鏄ユ俊銈呮噹缁€澶愭煟閺冨浂鍤欓柛妯绘尦閺屸€愁吋閸ュ墎鍔哥紓?======

/**
 * 婵犮垼娉涚粔鎾春濡ゅ懎妫橀柛銉ｅ妽閹烽亶鏌涢幒鎾寸凡濠㈠厜鍋撻柣鐘冲姇閻°劌顭?
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
 * 婵犮垼娉涚€氼噣骞冩繝鍐ㄧ窞鐎广儱鎳庨悡鎴︽煙缁嬫妯€闁瑰憡濞婇幃娆撴偡閺夋寧鐦栨繛瀛樼矊椤戝嫬鈻?
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
 * 濠电姰鍨煎▔娑氱矓閹绢喖鏄ユ俊銈呮噹缁犮儵鏌嶈閸撶喎顕ｉ崹顐㈢窞濠㈣泛顦辩粻姘舵⒑? */
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

// ====== 闂佽崵濮村ù鍌炲矗閳ь剟鏌嶇拠鑼ⅵ鐎规洘绻堥幃銏㈡嫚閹绘帒绠ｉ梻浣告惈缁夊爼鈥﹂崼銏㈢处?======

/**
 * 闂佽绨肩徊缁樼珶閸儱鏄ラ柛娑欐綑缁€鍡涙煟濡も偓閻楀棝鎯佽ぐ鎺撳€甸悷娆忓娴溿垺銇勯弴妯虹伄闁硅櫕鐩崺鈧?
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
                // 闂備礁鍚嬪Σ鎺撱仈閹间礁鍑犻柛鎰靛枛绾偓濠殿喗锕╅崜锕傚触閸屾凹娓婚柕鍫濇处閺嗩剚绻涢梻鏉戝祮闁哄苯鐗撻幐濠冨緞鐎ｎ厼鎯堥梻浣告惈缁夋潙锕㈤崡鐏绘椽骞忕仦璁虫睏闂佸搫娲﹀銊╂偡閹剧粯鐓ユ繛鎴灻〃娆戠磼濡も偓椤﹂潧螞娓氣偓閸┾偓妞ゆ帒鍊归崯?/en/ 闂備礁鎲￠幐鍝ョ矓閸撲焦顫?
                newPath = `/${pagePath}`;
            } else {
                newPath = '/';
            }
        } else {
            newPath = pagePath ? `/${newLang}/${pagePath}` : `/${newLang}/`;
        }
    }

    const newUrl = newPath + currentSearch + currentHash;
    window.location.href = newUrl;
}

// ====== FAQ闂備礁鎲″濠氬窗閺囥垹绀傛慨妞诲亾鐎殿喚鏅划娆戞崉閵娿儺娲?======

/**
 * 闂佽崵濮崇粈浣规櫠娴犲鍋柛婊咁浌Q闂備礁鎲＄敮鎺懨洪敃鈧悾鐑藉蓟閵夈儳顦梺缁樻椤曆囧储?
 */
function setupFAQToggles() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            const answer = faqItem.querySelector('.faq-answer');

            // 闂備胶顭堢换鎴炵箾婵犲伣娑㈠箻椤旇偐顓奸梺閫炲苯澧寸€殿喖鐏氱换鍛村礌閹佃鲸淇婇悙顏勨偓鏇烇耿閸楃伝?
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

            // 闂備礁鎲＄敮鎺懨洪敃鈧悾鐑芥嚑闊弓姹楅梺瑙勫劤閸熷潡路閸涱収娓婚柕鍫濇噺鐠愨剝绻?
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

// ====== Toast闂傚倷绶￠崑鍛潩閵娾晜鍋傞柨鐔哄Т缁€澶愭煟閺冨浂鍤欓柛?======

/**
 * 闂備礁鎼€氼剚鏅舵禒瀣︽慨婵嗘湞ast闂傚倷绶￠崑鍛潩閵娾晜鍋?
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

// ====== 濠电偞鍨堕幑渚€顢氳瀹曞綊宕归锝呭伎闁诲函缍嗘禍婊堫敋瑜旈弻娑㈠箣閿濆憛鎾绘煛?======

let isInitialized = false;

/**
 * 闂備礁鎲＄敮妤冩崲閸岀儑缍栭柟鐗堟緲缁€宀勬煛瀹擃喖鎳庨悾銊╂⒑? */
function initializeApp() {
    if (isInitialized) return;

    try {
        console.log('Starting optimized application initialization...');

        // 缂傚倷鐒﹂弻銊╊敄閸涱厾鏆ら柛鈩冪☉缁犮儳鎲搁幋锔衡偓渚€骞嬮敂钘夊壄闂佸憡娲﹂崑鍕亹閻樼粯鈷戞繛鍡樺劤閺嬫盯鏌涢妸銉т粵闁逛究鍔庨埀顒婄秵娴滄粓顢?
        updateInitialDisplayValues();
        initializeTheme();
        setupBasicEventListeners();

        // Defer non-critical tasks.
        setTimeout(() => {
            updateDisplay();
            setupAdvancedEventListeners();
        }, 50);

        isInitialized = true;
        console.log('Critical application initialization completed!');

    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage();
        updateInitialDisplayValues();

        try {
            initializeTheme();
            setupBasicEventListeners();
        } catch (fallbackError) {
            console.error('Even fallback initialization failed:', fallbackError);
        }
    }
}

/**
 * 闂備礁鎼ú銈夋偤閵娾晛钃熷┑鐘叉搐缁€鍡樼節闂堟稒锛嶆繛鍏碱殜閺岋繝宕熼鈶╂寖闂侀潧娲﹀畝绋跨暦? */
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

            viewportDisplay.textContent = width + ' × ' + height;
        }

        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        if (screenResolutionDisplay) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;

            const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan && detectingSpan.parentNode) {
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
                if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(':')) {
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
            valueSpan.textContent = screenWidth + ' × ' + screenHeight;
        }
    } catch (error) {
        console.error('Error updating initial display values:', error);
    }
}

/**
 * 闂佽崵濮崇粈浣规櫠娴犲鍋柛鈩冪☉閺勩儵鏌ц箛姘煎殐闁衡偓閵娿儍鐟邦煥閸愭儳鍓┑鐐叉閸ㄤ粙骞嗛崟顖氱婵犻潧娲ら崜鍫曟⒑? */
function setupBasicEventListeners() {
    console.log('Setting up basic event listeners...');

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('Found theme toggle button, binding click event');
        themeToggle.addEventListener('click', toggleTheme);
    }

    setupBasicLanguageSelector();

    window.addEventListener('resize', debounce(updateViewportDisplay, 100));

    setupFAQToggles();
    setupNavigationActiveState();
    // setupInternalLinks(); // 闁诲氦顫夐悺鏇犱焊椤忓棛绱﹂柤娴嬫櫇閻捇鎮归崶銊ョ祷闁?internal-links.js 婵犵妲呴崹顏堝焵椤掑啯鐝柛?

    console.log('Basic event listeners setup completed');
}

/**
 * 闂佽崵濮崇粈浣规櫠娴犲鍋柛鈩冿供濞堟淇婇姘ュ仮闁绘稒鎸搁湁婵犲﹤鍠氶崕搴㈢箾閸℃劕鐏查柟顖氬楠炲鈹戦崶褍澹庨梻? */
function setupAdvancedEventListeners() {
    console.log('Setting up advanced event listeners...');

    // 濠电姰鍨煎▔娑氱矓閹绢喖鏄ユ俊銈呮噹缁犳澘顭块懜闈涘閻忓骏绠戦湁婵犲﹤鍠氶崕搴㈢箾?
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

    console.log('Advanced event listeners setup completed');
}

/**
 * 闂佽崵濮崇粈浣规櫠娴犲鍋柛鈩冪憿閸嬫挻鎷呴崘顭戞闂佺硶鏅涢幊搴ㄥ煘閹达箑鐒垫い鎺嗗亾閻撱倝鏌ゆ慨鎰偓鏇犵懅闂? */
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
 * 闂佽崵濮崇粈浣规櫠娴犲鍋柛鈩冪☉缁€鍐煕濞戞鎽犻柟宕囧█閺屾盯寮崒姘亞闂?
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
 * 婵犵妲呴崑鈧柛瀣尰缁绘盯寮堕幋顓炲壈缂傚倸绉撮澶婄暦濠婂喚鍚嬮柛顐亜濞堁囨煟閻旈娈遍柛?
 */
function detectCurrentLanguage() {
    const path = window.location.pathname;

    // 濠电偛顕慨鏉戭潩閿曞倹鍎楅柟顖嗗苯娈梺鍛婃处娴滐綁宕㈤浣风箚妞ゆ劗鍠庢禍鎯р攽閻愬瓨缍戞い鎴濈墦椤㈡岸濮€閵忊€虫疁闂?
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

    // 濠殿喗甯楃粙鎺椻€﹂崼銉晣缂備焦蓱娴溿倝鏌￠崒娑橆嚋缂佲偓閳ь剟姊洪崗鍏碱潡濡炲瓨鎮傚?
    return 'en';
}

/**
 * 闂佽崵濮撮鍛村疮椤栫偛姹查柨婵嗩槹閸庡海绱掔€ｎ偒鍎ラ柛銈囧█閹绗熼姘变哗缂?
 */
function adjustRelativePath(url, currentPath) {
    // If already relative, return as-is.
    if (!url.startsWith('/')) {
        return url;
    }

    // 闂佽崵鍠愰悷杈╁緤妤ｅ啯鍊甸柛濠勫枂娴滃綊鏌熼幆褍鏆辨い銈呮嚇閹绗熼姘变哗缂?
    const pathParts = currentPath.split('/').filter(part => part);
    const urlParts = url.split('/').filter(part => part);

    // Detect current path language and depth.
    let currentLang = 'en';
    let currentDepth = 0;
    let isInLanguageDir = false;
    let isInBlogDir = false;

    // 闂備礁鎲＄敮鎺懳涘▎鎾村€甸柛濠勫枂娴滃綊鏌熼幆褍鏆辨い銈呮嚇閹绗熼姘变哗缂備礁澧庨崑鐔烘閹烘绠婚悗鐢电《閸?
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
        // 闁荤喐绮庢晶妤呭箰閸涘﹥娅犻柣妯款嚙閹瑰爼鏌曟繛鍨姎閻熸瑱绠撻幃妤呯嵁閸喚浼勫┑鐐插级婵粙濡甸幇鏉垮嵆婵浜幉? /en/blog/xxx
        if (urlParts[0] === 'blog') {
            // 闂佽崵濮撮幖顐︽偪閸ヮ灐褰掑幢濞戞顦梺鍝勵槸閻忔繄鎲撮敃鍌涘€垫鐐茬仢閻忔煡鏌曢崱妤婃█婵? blog/index.html -> ../blog/index.html
            return '../' + urlParts.join('/');
        } else {
            // 闂佽崵濮撮幖顐︽偪閸ヮ灐褰掑幢濞戞顦梺鍝勵槸閵囨妲愰敐澶嬬厱闊洦娲栭崢鎾煏閸℃妯€婵? devices/xxx.html -> ../../devices/xxx.html
            return '../../' + urlParts.join('/');
        }
    } else if (isInLanguageDir && !isInBlogDir) {
        // 闁荤喐绮庢晶妤呭箰閸涘﹥娅犻柣妯款嚙閹瑰爼鏌曟繝搴ｅ帥闁搞倖妫冮幃椋庝焊娴ｉ晲澹曢梻浣哄劦閺呪晠宕伴弽顐ょ鐎广儱妫涢埢鏃堟倵閿濆倹娅囩紒瀣嚙閳藉骞樺畷鍥嗐垺绻濋埀顒勵敂閸繄顢呭┑顔斤供閸擄箓宕ラ崒鐐寸厽闁冲搫锕ら弸娑氱磽? /en/xxx
        if (urlParts[0] === 'blog') {
            // 闂佽崵濮撮幖顐︽偪閸ヮ灐褰掑幢濞戞顦梺鍝勵槸閻忔繄鎲撮敃鍌涘€垫鐐茬仢閻忔煡鏌曢崱妤婃█婵? blog/index.html -> ./blog/index.html
            return urlParts.join('/');
        } else {
            // 闂佽崵濮撮幖顐︽偪閸ヮ灐褰掑幢濞戞顦梺鍝勵槸閵囨妲愰敐澶嬬厱闊洦娲栭崢鎾煏閸℃妯€婵? devices/xxx.html -> ./devices/xxx.html
            return urlParts.join('/');
        }
    } else {
        // 闁荤喐绮庢晶妤呭箰閸涘﹥娅犻柣妯款嚙閹瑰爼鏌曟繝蹇擃洭濠㈢懓鐭傞弻锝夊煛婵犲倹鐏堢紓鍌氱Т缁夌數绮? /xxx
        if (urlParts[0] === 'blog') {
            // 闂佽崵濮撮幖顐︽偪閸ヮ灐褰掑幢濞戞顦梺鍝勵槸閻忔繄鎲撮敃鍌涘€垫鐐茬仢閻忔煡鏌曢崱妤婃█婵☆偄鍟撮敐鐐侯敊閸撗屾Х闂傚倸鍊稿ú鐘诲磻閹剧粯鍋￠柡鍥ㄦ皑閸斿秹鏌涜閿曨亜鐣峰┑瀣亹濞撴凹鍨板▓褔鏌ｉ悢椋庢闁稿鎹囬弻娑㈠箻瀹曞泦銈囩磼? blog/index.html -> en/blog/index.html
            return currentLang + '/' + urlParts.join('/');
        } else {
            // 闂佽崵濮撮幖顐︽偪閸ヮ灐褰掑幢濞戞顦梺鍝勵槸閵囨妲愰敐澶嬬厱闊洦娲栭崢鎾煏閸℃妯€婵? devices/xxx.html -> devices/xxx.html
            return urlParts.join('/');
        }
    }
}

/**
 * 闂備焦鐪归崹濠氬窗閹版澘鍨傛慨妯挎硾缁€鍐煕濞戞鎽犻柟宕囧█閺屸剝鎷呴崫鍕垫毉閻?
 */
function generateInternalLinks() {
    const currentPath = window.location.pathname;
    const currentPageId = getCurrentPageId(currentPath);
    const allLinks = [];

    // 闂備礁鎲￠崝鏇㈠箠濮椻偓楠炴绺介崨濠勫帎閻庡箍鍎卞ú銊╁几閸岀偞鐓涘ù锝呮惈椤ｈ偐鈧?- 闂備胶纭堕弲鐐差浖閵娧嗗С闁荤偟鐏恡ernal-links-config.json
    const INTERNAL_LINKS_CONFIG = {
        pages: {
            "iphone-viewport-sizes": {
                id: "iphone-viewport-sizes",
                category: "device-info",
                priority: 1,                icon: "📱",
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
                icon: "📱",
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
                icon: "📱",
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
                icon: "📱",
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
                icon: "📱",
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
                icon: "📱",
                urls: {
                    "en": "devices/compare",
                    "zh": "devices/compare"
                },
                title: "Screen Size Comparison",
                description: "Compare different screen sizes side by side"
            },
            "standard-resolutions": {
                id: "standard-resolutions",
                category: "reference",
                priority: 1,
                icon: "📱",
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
                icon: "📱",
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
                icon: "📱",
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

    // 婵犵妲呴崑鈧柛瀣尰缁绘盯寮堕幋顓炲壈缂傚倸绉撮澶婄暦濠婂喚鍚嬮柛顐亜濞堁囨煟閻旈娈遍柛?
    const currentLang = detectCurrentLanguage();

    // 闂備浇銆€閸嬫捇鏌涢锝嗙闁艰尙濞€閺岀喓鍠婂Ο杞板闂備礁鎼悧鍡浰囬悽绋课ュ鑸靛姈椤ュ牓鏌曡箛瀣仾闁伙綁浜跺娲礈瑜嶆禍楣冩偨?
    for (const [pageKey, page] of Object.entries(INTERNAL_LINKS_CONFIG.pages)) {
        // 闂佽崵濮撮幖顐︽偪閸モ晜宕查柛鎰靛幑娴滃綊鏌熼幆褍鏆辨い銈呮噹椤啴濡堕崶銊︽瘓濠?
        if (page.id === currentPageId) {
            continue;
        }

        // 闂備礁鍚嬮崕鎶藉床閼艰翰浜归柛銉墯閻掑鏌涚仦鍓ь暡闁稿鍊楅幉鎼佹偋閸喎纰嶆繝鈷€鍛ラ柟椋庡█椤㈡﹢鍩﹂埀顒勫几閸涘瓨鐓熼柕濞垮劚閻庣ΖL
        let url = page.urls[currentLang] || page.urls.en || Object.values(page.urls)[0];

        // 闂備礁鎼粔鐑斤綖婢跺﹦鏆ゅù锝咁潟娴滃綊鏌熼幆褍鏆辨い銈呮噹椤啴濡堕崶銊︽瘓濠电偛鍚嬫竟鍡涘箲閸曨垼鏁嶆慨妯夸含閻涱噣鏌ｉ悩宸剰闁哥噥鍨跺鎶芥晲婢跺鍓紓浣割儐椤戞瑩宕甸悩缁樺仯濞撴凹鍨伴悘鐘电磼?
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
 * 闂備礁鍚嬮崕鎶藉床閼艰翰浜归柛銉簵娴滃綊鏌熼幆褍鏆辨い銈呮噹椤啴濡堕崶銊︽瘓濠电偠鍋愬绡?
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
 * 婵犵數鍋為幐绋款嚕閸洘鍋傞悗锝庡枛缁€鍐煕濞戞鎽犻柟宕囧█閺屾盯骞掑鍛ギ闂侀潧妫楅ˇ闈浳? */
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
 * 闂備礁鎲＄敮妤冪矙閹寸姷纾介柟鎹愵嚙缁€鍐煕濞戞鎽犻柟宕囧█閺屾稑螖鐎ｎ剛锛熸繝鈷€鍕⒌鐎规洘顨婂畷姗€顢旈崱鈺傂?
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
 * 闂備礁鎲＄敮妤冪矙閹寸姷纾介柟鐐儗濞撹埖淇婇娑卞劌闁告艾娲娲礈瑜嶆禍楣冩偨椤栨稒灏︾€规洩绻濋弫宥夊礋椤愵偅姣?
 */
function createDefaultLinkCard() {
    const fragment = document.createDocumentFragment();
    const link = document.createElement('a');
    link.className = 'internal-link-card';
    link.innerHTML = `
        <span class="link-icon" aria-hidden="true">濡絽鍟幊?/span>
        <div class="link-content">
            <span class="link-title"></span>
            <span class="link-description"></span>
        </div>
    `;
    fragment.appendChild(link);
    return fragment;
}

/**
 * 闂備礁鍚嬮崕鎶藉床閼艰翰浜归柛銉墯閻擄綁鏌ｉ幇闈涘濠㈣泛绉归弻娑㈠Ψ瑜嶆禍楣冩煟?
 */
function getLinkIcon(category) {
    const icons = {
        'device-info': '📱',
        'calculator': '🧮',
        'tools': '🛠️',
        'reference': '📚',
        'content': '📄'
    };

    return icons[category] || '📋';
}

/**
 * 闂佽崵濮崇粈浣规櫠娴犲鍋柛鈩冪☉閺勩儵鏌ц箛姘煎殐闁衡偓閵娾晜鍋ｉ柛銉ㄦ硾瀵劑鏌嶇拠鑼ⅵ闁哄苯鎳忓鍕偓锝庝憾娴犳挳姊? */
function setupBasicLanguageSelector() {
    const languageModalTrigger = document.getElementById('language-modal-trigger');
    const languageModal = document.getElementById('language-modal');
    const languageModalClose = document.getElementById('language-modal-close');
    const languageModalBackdrop = document.getElementById('language-modal-backdrop');

    if (languageModalTrigger && languageModal) {
        if (languageModal.dataset.basicSelectorBound === 'true') {
            console.log('Basic language modal already initialized, skipping duplicate binding');
            return;
        }

        languageModal.dataset.basicSelectorBound = 'true';
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
 * 闂佸搫娲ら悺銊╁蓟婵犲嫭鍠嗛柛鈩冾殔缂嶆捇鏌￠崟顐⑩挃闁?
 */
function updateViewportDisplay() {
    const viewportDisplay = document.getElementById('viewport-display');
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');

    if (viewportDisplay) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = width + ' × ' + height;
    }

    if (screenResolutionDisplay) {
        const valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');
        if (valueSpan) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            valueSpan.textContent = screenWidth + ' × ' + screenHeight;
        }
    }
}

/**
 * 闂備礁鎼€氼剚鏅舵禒瀣︽慨妯垮煐閻撱儲绻涢崱妯轰刊闁搞倖鐗楃换娑㈠箣濠靛牆顤€婵?
 */
function showErrorMessage() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = '<h2>Something went wrong</h2>' +
            '<p>We could not load all device information. Please refresh the page and try again.</p>' +
            '<button onclick="window.location.reload()">Reload page</button>';
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}

// ====== 闂備胶鍘ч〃搴㈢濠婂嫭鍙忛柍鍝勬噹缁€鍡樼節闂堟稒锛嶆繛鍏碱殜閺?======

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
    
    // 闁诲海鍋ｉ崐鏍磿閼测晜宕叉繝濠傜墕缁犮儳鎲搁幋锔衡偓渚€骞嬮敂鑺ユ珫閻庡厜鍋撻柍褜鍓熼崹鎯熼懡銈傛敵濠电娀娼уΛ娆撶叕?i18next 闂?updateUIElements 濠电偞鍨堕弻銊╊敄閸涙潙绠?
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
            
            console.log('Updated cookies and touch support after i18next');
        }
    }, 100);
});

// ====== 闁诲海鏁搁崢褔宕甸銏犵闁靛鍎冲﹢浼存煕閹达絽袚闁?======

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

    console.log('Core functions exposed to global scope for compatibility');
}

// Functions are already exposed to global scope for compatibility

console.log('core-optimized.js loaded successfully');
