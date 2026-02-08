// app.js - Main application entry point (Performance Optimized with Module Loading)

console.log('馃殌 Starting app.js module load...');

// Only import critical utilities immediately
import { debounce } from './utils.js';
import { performanceMonitor } from './performance-monitor.js';
import { moduleLoadingOptimizer } from './module-loading-optimizer.js';
import { initializeOptimizedEventManager } from './optimized-event-manager.js';
import CSSOptimizer from './css-optimizer.js';
import { initializeMobileOptimization } from './mobile-performance-optimizer.js';
// FontLoadingOptimizer will be imported dynamically to avoid blocking

// 鏆傛椂绉婚櫎璧勬簮鍔犺浇浼樺寲鍣ㄧ殑瀵煎叆浠ラ伩鍏嶉樆濉?let resourceLoadingOptimizer = null;
let performanceErrorHandler = null;
let optimizedEventManager = null;

console.log('鉁?Critical modules imported successfully');

// Module references (will be loaded by ModuleLoadingOptimizer)
let i18nModule = null;
let deviceDetectorModule = null;
let clipboardModule = null;
let languageModalModule = null;

// Global initialization flag
let isInitialized = false;

/**
 * Initialize the complete application with performance optimization
 */
async function initializeApp() {
    if (isInitialized) {
        console.log('App already initialized');
        return;
    }

    try {
        console.log('Starting optimized application initialization...');

        // PHASE 0: 璺宠繃閿欒澶勭悊鍣ㄥ垵濮嬪寲浠ラ伩鍏嶉樆濉?        // await initializeErrorHandler();

        // PHASE 1: 璺宠繃璧勬簮鍔犺浇浼樺寲鍣ㄤ互閬垮厤闃诲
        // await resourceLoadingOptimizer.initialize();

        // PHASE 2: Critical immediate initialization
        updateInitialDisplayValues();
        initializeTheme();

        // PHASE 2.0: 鍒濆鍖栫Щ鍔ㄧ鎬ц兘浼樺寲绯荤粺锛堝叧閿€ц兘浼樺寲锛?        try {
            const mobileOptimizer = initializeMobileOptimization({
                enableDeviceDetection: true,
                enableNetworkAdaptation: true,
                enableLowEndOptimization: true,
                debugMode: false
            });
            console.log('鉁?Mobile performance optimizer initialized successfully');
        } catch (error) {
            console.warn('鈿狅笍 Mobile performance optimizer failed to initialize:', error);
            // 绉诲姩绔紭鍖栧櫒鍒濆鍖栧け璐ヤ笉搴旇闃绘搴旂敤鍚姩
        }

        // PHASE 2.1: 鍒濆鍖栧瓧浣撳姞杞戒紭鍖栧櫒锛堝叧閿€ц兘浼樺寲锛?        try {
            const FontLoadingOptimizerModule = await import('./font-loading-optimizer.js');
            const FontLoadingOptimizer = FontLoadingOptimizerModule.default;

            const fontOptimizer = new FontLoadingOptimizer({
                preloadCriticalFonts: true,
                enableFallback: true,
                enableMetrics: true,
                fontDisplay: 'swap'
            });

            console.log('鉁?Font loading optimizer initialized successfully');
        } catch (error) {
            console.warn('鈿狅笍 Font loading optimizer failed to initialize:', error);
            // 瀛椾綋浼樺寲鍣ㄥ垵濮嬪寲澶辫触涓嶅簲璇ラ樆姝㈠簲鐢ㄥ惎鍔?        }

        // PHASE 2.2: 绔嬪嵆璁剧疆鍩虹浜嬩欢鐩戝惉鍣紝纭繚涓婚鍒囨崲鍔熻兘鍙敤
        setupBasicEventListeners();

        // PHASE 2.2: CSS Optimizer 閲嶆柊鍚敤锛屼絾閰嶇疆涓轰笉褰卞搷涓婚鍒囨崲
        const cssOptimizer = new CSSOptimizer({
            enableMinification: true,
            enableCaching: true,
            deferLoadDelay: 100,
            enableCSSCompression: false, // 绂佺敤CSS鍘嬬缉浠ラ伩鍏嶅奖鍝嶄富棰?            enableCSSCaching: false,     // 绂佺敤CSS缂撳瓨浠ラ伩鍏嶅奖鍝嶄富棰?            enableFallbackHandling: true,
            protectThemeCSS: true        // 鏂板锛氫繚鎶や富棰樼浉鍏矯SS
        });

        // 寤惰繜瀵艰埅楂樹寒璁剧疆锛岀‘淇滵OM瀹屽叏鍔犺浇
        setTimeout(() => {
            setupNavigationHighlighting();
        }, 100);

        // PHASE 3: Initialize optimized event manager (critical for performance)
        optimizedEventManager = initializeOptimizedEventManager({
            enablePerformanceMonitoring: true,
            usePassiveListeners: true,
            longTaskThreshold: 50
        });

        // PHASE 5: Lazy load and initialize non-critical modules
        setTimeout(async () => {
            await initializeNonCriticalModules();
        }, 50); // Small delay to allow critical content to render

        isInitialized = true;
        console.log('鉁?Critical application initialization completed!');

    } catch (error) {
        console.error('鉂?Failed to initialize application:', error);

        // 濡傛灉鏈夐敊璇鐞嗗櫒锛岃褰曢敊璇?        if (performanceErrorHandler) {
            performanceErrorHandler.logError('Application initialization failed', error);
        }

        // 鏄剧ず闄嶇骇鐨勯敊璇秷鎭拰鍩虹鍔熻兘
        showErrorMessage();
        updateInitialDisplayValues();

        // 灏濊瘯鍚敤鍩虹鍔熻兘
        try {
            initializeTheme();
            setupBasicEventListeners();
        } catch (fallbackError) {
            console.error('鉂?Even fallback initialization failed:', fallbackError);
        }
    }
}

/**
 * Initialize error handler for critical error handling
 */
async function initializeErrorHandler() {
    try {
        console.log('馃敡 Initializing error handler...');

        // 鍔ㄦ€佸鍏ラ敊璇鐞嗗櫒
        const { default: PerformanceErrorHandler } = await import('./performance-error-handler.js');

        // 鍒涘缓閿欒澶勭悊鍣ㄥ疄渚?        performanceErrorHandler = new PerformanceErrorHandler({
            enableLogging: true,
            reportErrors: true,
            maxRetries: 3,
            retryDelay: 1000,
            enableFallback: true
        });

        console.log('鉁?Error handler initialized successfully');

    } catch (error) {
        console.error('鉂?Failed to initialize error handler:', error);
        // 閿欒澶勭悊鍣ㄥ垵濮嬪寲澶辫触涓嶅簲璇ラ樆姝㈠簲鐢ㄥ惎鍔?        // 搴旂敤灏嗗湪娌℃湁閿欒澶勭悊鍣ㄧ殑鎯呭喌涓嬬户缁繍琛?    }
}

/**
 * Initialize non-critical modules asynchronously using ModuleLoadingOptimizer
 */
async function initializeNonCriticalModules() {
    try {
        console.log('Loading non-critical modules with ModuleLoadingOptimizer...');

        // 浣跨敤妯″潡鍔犺浇浼樺寲鍣ㄦ櫤鑳藉姞杞介〉闈㈡墍闇€妯″潡
        await moduleLoadingOptimizer.loadPageModules();

        // 鑾峰彇宸插姞杞界殑鍏抽敭妯″潡
        i18nModule = moduleLoadingOptimizer.moduleRegistry.get('i18n');
        deviceDetectorModule = moduleLoadingOptimizer.moduleRegistry.get('device-detector');

        // 鍒濆鍖栧凡鍔犺浇鐨刬18n妯″潡锛堜紭鍖栫増鏈級
        if (i18nModule) {
            const i18nStartTime = performance.now();
            await i18nModule.initializeI18next();
            i18nModule.setupLanguageSelector();
            i18nModule.updateUIElements();

            // 棰勫姞杞藉叾浠栬瑷€鐨勭炕璇戣祫婧?            if (i18nModule.preloadTranslations) {
                i18nModule.preloadTranslations(['en', 'zh']).catch(error => {
                    console.warn('Translation preloading failed:', error);
                });
            }

            // Record i18n load time
            const i18nLoadTime = performance.now() - i18nStartTime;
            performanceMonitor.recordCustomMetric('translationLoadTime', i18nLoadTime);

            // 璁板綍鍥介檯鍖栨€ц兘鎸囨爣
            if (i18nModule.getI18nPerformanceMetrics) {
                const i18nMetrics = i18nModule.getI18nPerformanceMetrics();
                console.log('馃搳 I18n performance metrics:', i18nMetrics);
            }
        }

        // 鍒濆鍖栧凡鍔犺浇鐨勮澶囨娴嬪櫒妯″潡锛堜紭鍖栫増鏈級
        if (deviceDetectorModule) {
            const deviceDetectorStartTime = performance.now();
            await deviceDetectorModule.updateDisplay();

            // 璁剧疆浼樺寲鐨勮鍙ｅ昂瀵告洿鏂扮洃鍚櫒
            window.addEventListener('resize', deviceDetectorModule.updateViewportSize);

            // Record device detection time
            const deviceDetectionTime = performance.now() - deviceDetectorStartTime;
            performanceMonitor.recordCustomMetric('deviceDetectionTime', deviceDetectionTime);

            // 璁板綍璁惧妫€娴嬫€ц兘鎸囨爣
            const deviceMetrics = deviceDetectorModule.getPerformanceMetrics();
            console.log('馃搳 Device detection performance:', deviceMetrics);
        }

        // Setup advanced event listeners
        setupAdvancedEventListeners();

        // Load page-specific modules (now handled by ModuleLoadingOptimizer)
        loadPageSpecificModulesOptimized();

        console.log('鉁?Non-critical modules loaded successfully with optimization!');

        // 璁板綍妯″潡鍔犺浇缁熻
        const stats = moduleLoadingOptimizer.getLoadingStats();
        console.log('馃搳 Module loading stats:', stats);

    } catch (error) {
        console.error('鉂?Error loading non-critical modules:', error);

        // 濡傛灉鏈夐敊璇鐞嗗櫒锛岃褰曢敊璇?        if (performanceErrorHandler) {
            performanceErrorHandler.logError('Non-critical modules loading failed', error);
        }

        // 灏濊瘯鍚敤鍩虹鍔熻兘浣滀负闄嶇骇
        try {
            // 濡傛灉i18n鍔犺浇澶辫触锛岃嚦灏戠‘淇濆熀纭€鏄剧ず鍊兼槸姝ｇ‘鐨?            if (!i18nModule) {
                console.log('i18n failed to load, using fallback display values');
                updateInitialDisplayValues();
            }

            // 濡傛灉璁惧妫€娴嬪櫒鍔犺浇澶辫触锛岃嚦灏戠‘淇濊鍙ｅ昂瀵告洿鏂?            if (!deviceDetectorModule) {
                console.log('Device detector failed to load, using basic viewport updates');
                window.addEventListener('resize', debounce(updateViewportDisplay, 100));
            }
        } catch (fallbackError) {
            console.error('鉂?Even fallback for non-critical modules failed:', fallbackError);
        }
    }
}

/**
 * Load page-specific modules using ModuleLoadingOptimizer (optimized version)
 */
function loadPageSpecificModulesOptimized() {
    const currentPath = window.location.pathname;
    console.log('Loading page-specific modules for path:', currentPath);

    // 浣跨敤妯″潡鍔犺浇浼樺寲鍣ㄦ寜闇€鍔犺浇鐗瑰畾鍔熻兘妯″潡
    if (currentPath.includes('ppi-calculator')) {
        moduleLoadingOptimizer.loadOnDemand('ppi-calculator').then(module => {
            if (module && module.initializePPICalculator) {
                module.initializePPICalculator();
            }
        }).catch(error => {
            console.error('Failed to load PPI calculator module:', error);
        });
    }

    // Aspect Ratio Calculator
    if (currentPath.includes('aspect-ratio-calculator')) {
        moduleLoadingOptimizer.loadOnDemand('aspect-ratio-calculator').then(module => {
            if (module && module.initializeAspectRatioCalculator) {
                module.initializeAspectRatioCalculator();
            }
        }).catch(error => {
            console.error('Failed to load aspect ratio calculator module:', error);
        });
    }

    // Responsive Tester/Simulator
    if (currentPath.includes('responsive-tester')) {
        moduleLoadingOptimizer.loadOnDemand('simulator').then(module => {
            if (module && typeof window.initializeSimulator === 'function') {
                window.initializeSimulator();
            } else if (module && module.initializeSimulator) {
                module.initializeSimulator();
            }
        }).catch(error => {
            console.error('Failed to load simulator module:', error);
            // 闄嶇骇澶勭悊锛氬皾璇曠洿鎺ヨ皟鐢ㄥ叏灞€鍑芥暟
            if (typeof window.initializeSimulator === 'function') {
                window.initializeSimulator();
            }
        });
    }

    // Screen Comparison
    if (currentPath.includes('compare')) {
        moduleLoadingOptimizer.loadOnDemand('screen-comparison-fixed').then(module => {
            console.log('Screen comparison module loaded');
        }).catch(error => {
            console.error('Failed to load screen comparison module:', error);
        });
    }

    // Blog pages - 浣跨敤浼樺寲鍣ㄥ姞杞藉崥瀹㈢浉鍏虫ā鍧?    if (currentPath.includes('/blog/')) {
        console.log('Blog page detected, loading blog modules with optimizer');

        // Blog妯″潡宸茬粡鍦ㄩ〉闈㈢被鍨嬮厤缃腑澶勭悊锛岃繖閲屽彧闇€瑕佺‘淇濈壒瀹氬姛鑳藉姞杞?        moduleLoadingOptimizer.loadOnDemand('blog-progress').then(module => {
            if (module && module.initializeBlogProgress) {
                module.initializeBlogProgress();
            }
        }).catch(error => {
            console.warn('Blog progress module failed to load:', error);
        });
    }

    // Internal Links (load for all pages but with low priority) - 浣跨敤浼樺寲鍣ㄥ姞杞?    setTimeout(() => {
        moduleLoadingOptimizer.loadOnDemand('internal-links').then(module => {
            if (module && module.initializeInternalLinks) {
                module.initializeInternalLinks();
            }
        }).catch(error => {
            console.error('Failed to load internal links:', error);
            // 闄嶇骇澶勭悊锛氱洿鎺ュ鍏?            import('./internal-links.js').then(module => {
                module.initializeInternalLinks();
            }).catch(fallbackError => {
                console.error('Fallback internal links loading also failed:', fallbackError);
            });
        });
    }, 1000);
}

/**
 * Load page-specific modules only when needed (legacy version - kept for fallback)
 */
function loadPageSpecificModules() {
    const currentPath = window.location.pathname;

    // 鐩存帴鍔犺浇椤甸潰鐗瑰畾妯″潡锛屼笉渚濊禆璧勬簮浼樺寲鍣?    if (currentPath.includes('ppi-calculator')) {
        import('./ppi-calculator.js').then(module => {
            module.initializePPICalculator();
        }).catch(console.error);
    }

    // Aspect Ratio Calculator
    if (currentPath.includes('aspect-ratio-calculator')) {
        import('./aspect-ratio-calculator.js').then(module => {
            module.initializeAspectRatioCalculator();
        }).catch(console.error);
    }

    // Responsive Tester
    if (currentPath.includes('responsive-tester')) {
        if (typeof window.initializeSimulator === 'function') {
            window.initializeSimulator();
        }
    }

    // Blog pages - 鐩存帴鍔犺浇锛屼笉渚濊禆浼樺寲鍣?    if (currentPath.includes('/blog/')) {
        // Blog鍔熻兘浼氬湪闇€瑕佹椂鑷姩鍔犺浇
        console.log('Blog page detected, modules will load as needed');
    }

    // Internal Links (load for all pages but with low priority)
    setTimeout(() => {
        import('./internal-links.js').then(module => {
            module.initializeInternalLinks();
        }).catch(error => {
            console.error('Failed to load internal links:', error);
            // 鍐呴摼鍔犺浇澶辫触涓嶅簲璇ュ奖鍝嶅叾浠栧姛鑳?        });
    }, 1000);
}

/**
 * 鏇存柊鍒濆鏄剧ず鍊硷紝涓嶄緷璧栦簬i18next鎴栧叾浠栫郴缁? */
function updateInitialDisplayValues() {
    try {
        console.log('鐩存帴鏇存柊鍒濆鏄剧ず鍊?..');

        // 鐩存帴鏇存柊瑙嗗彛灏哄锛屼笉浣跨敤浠讳綍渚濊禆
        const viewportDisplay = document.getElementById('viewport-display');
        if (viewportDisplay) {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // 绉婚櫎鍙兘瀵艰嚧琚炕璇戠郴缁熻鐩栫殑灞炴€?            viewportDisplay.removeAttribute('data-i18n');

            // 娓呴櫎鏃у唴瀹癸紝鍖呮嫭鍙兘瀛樺湪鐨刣etecting span
            const detectingSpan = viewportDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                // 濡傛灉鏄痵pan鍏冪礌鍖呭惈detecting锛屽垯鏇挎崲鏁翠釜鍐呭
                viewportDisplay.innerHTML = '';
            }

            // 璁剧疆鏂板唴瀹?            viewportDisplay.textContent = `${width} × ${height}`;
            console.log(`瑙嗗彛灏哄宸叉洿鏂? ${width} × ${height}`);
        } else {
            console.warn('瑙嗗彛灏哄鍏冪礌鏈壘鍒?);
        }

        // 鐩存帴鏇存柊灞忓箷鍒嗚鲸鐜囷紝涓嶄娇鐢ㄤ换浣曚緷璧?        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        if (screenResolutionDisplay) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;

            // 妫€鏌ユ槸鍚﹀瓨鍦ㄦ棫鐨勭粨鏋?            const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                // 濡傛灉鎵惧埌"detecting..."鐨剆pan锛屽厛绉婚櫎瀹?                detectingSpan.parentNode.removeChild(detectingSpan);
            }

            // 鏌ユ壘鎴栧垱寤簂abel鍜寁alue鐨剆pan鍏冪礌
            let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
            let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

            if (!labelSpan) {
                // 濡傛灉娌℃湁label span锛屾壘绗竴涓瓙鍏冪礌锛屾垨鑰呭垱寤轰竴涓柊鐨?                labelSpan = screenResolutionDisplay.querySelector('span:first-child') || document.createElement('span');
                labelSpan.setAttribute('data-i18n', 'screen_resolution');

                // 璁剧疆榛樿鏂囨湰
                labelSpan.textContent = '灞忓箷鍒嗚鲸鐜?;

                // 濡傛灉涓嶅湪DOM涓紝娣诲姞瀹?                if (!labelSpan.parentNode) {
                    screenResolutionDisplay.appendChild(labelSpan);
                }
            }

            // 纭繚鎴戜滑鏈夊啋鍙峰垎闅旂
            let colonNode = null;
            for (let i = 0; i < screenResolutionDisplay.childNodes.length; i++) {
                const node = screenResolutionDisplay.childNodes[i];
                if (node.nodeType === Node.TEXT_NODE &&
                    (node.textContent.includes(':') || node.textContent.includes('锛?))) {
                    colonNode = node;
                    break;
                }
            }

            if (!colonNode) {
                colonNode = document.createTextNode(': ');
                screenResolutionDisplay.appendChild(colonNode);
            }

            // 鍒涘缓鎴栨洿鏂皏alue span
            if (!valueSpan) {
                valueSpan = document.createElement('span');
                screenResolutionDisplay.appendChild(valueSpan);
            }

            // 鏇存柊鍊?            valueSpan.removeAttribute('data-i18n');
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
            console.log(`灞忓箷鍒嗚鲸鐜囧凡鏇存柊: ${screenWidth} × ${screenHeight}`);
        } else {
            console.warn('灞忓箷鍒嗚鲸鐜囧厓绱犳湭鎵惧埌');
        }
    } catch (error) {
        console.error('鏇存柊鍒濆鏄剧ず鍊兼椂鍑洪敊:', error);
    }
}

/**
 * Setup basic event listeners (critical, non-blocking)
 */
function setupBasicEventListeners() {
    console.log('馃帶 Setting up basic event listeners...');

    // Theme toggle - 纭繚绔嬪嵆鍙敤
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('鉁?Found theme toggle button, binding click event');
        themeToggle.addEventListener('click', toggleTheme);

        // 楠岃瘉浜嬩欢缁戝畾
        setTimeout(() => {
            const hasListener = themeToggle.onclick || themeToggle.addEventListener;
            console.log('馃攳 Theme toggle event binding verified:', !!hasListener);
        }, 100);
    } else {
        console.warn('鈿狅笍 Theme toggle button not found during basic event setup');
    }

    // Language selector basic setup (before i18n loads)
    setupBasicLanguageSelector();

    // Viewport size update on window resize (critical for screen checker)
    window.addEventListener('resize', debounce(updateViewportDisplay, 100));

    // FAQ toggle functionality
    setupFAQToggles();

    console.log('鉁?Basic event listeners setup completed');
}

/**
 * Navigate to the corresponding language URL
 * Updated for SEO redirect optimization: root = English, /en/ redirects to root
 */
function navigateToLanguage(newLang) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;

    console.log('馃寪 Navigating to language:', newLang, 'from path:', currentPath);

    // Save language preference
    localStorage.setItem('i18nextLng', newLang);

    let newPath;

    // Handle different URL patterns
    if (currentPath.includes('/multilang-build/')) {
        // We're in the build directory structure like /multilang-build/en/index.html
        const buildMatch = currentPath.match(/^(.*)\/multilang-build\/([a-z]{2})(\/.*)?$/);
        if (buildMatch) {
            const basePath = buildMatch[1] || '';
            const currentLang = buildMatch[2];
            const pathAfterLang = buildMatch[3] || '/index.html';

            if (currentLang === newLang) {
                console.log('Already in the correct language');
                return;
            }

            // SEO optimization: English goes to root, others use language prefix
            if (newLang === 'en') {
                // Special case for blog: ensure /en/blog/* exists under multilang build
                if (pathAfterLang.startsWith('/blog/')) {
                    newPath = `${basePath}/multilang-build/en${pathAfterLang}`;
                } else {
                    newPath = `${basePath}/multilang-build${pathAfterLang}`;
                }
                console.log('馃彔 English: using root path for SEO optimization (with blog special-case in multilang-build)');
            } else {
                newPath = `${basePath}/multilang-build/${newLang}${pathAfterLang}`;
            }
        } else {
            // Fallback for build directory
            if (newLang === 'en') {
                newPath = `/multilang-build/index.html`;
            } else {
                newPath = `/multilang-build/${newLang}/index.html`;
            }
        }
    } else {
        // Standard URL pattern - SEO optimized structure
        const pathParts = currentPath.split('/').filter(part => part);
        
        // Determine current language and page path
        let currentLang = 'en';
        let pagePath = '';
        
        if (pathParts.length === 0) {
            // Root path (/) - this is English content
            currentLang = 'en';
            pagePath = '';
        } else {
            // Check if first part is a language code
            const possibleLang = pathParts[0];
            const supportedLangs = ['en', 'zh', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru'];
            
            if (supportedLangs.includes(possibleLang)) {
                currentLang = possibleLang;
                pagePath = pathParts.slice(1).join('/');
            } else {
                // No language prefix - treat as root English content
                currentLang = 'en';
                pagePath = pathParts.join('/');
            }
        }

        if (currentLang === newLang) {
            console.log('Already in the correct language');
            return;
        }

        // Build target URL based on SEO-optimized structure
        if (newLang === 'en') {
            // English: prefer root path without language prefix
            // All English pages including blog are at root level
            if (pagePath) {
                newPath = `/${pagePath}`;
            } else {
                newPath = '/';
            }
            console.log('馃彔 English: using root path for SEO optimization');
        } else {
            // Other languages: use language prefix
            newPath = `/${newLang}`;
            if (pagePath) {
                newPath += `/${pagePath}`;
            }
            console.log('馃實 Non-English: using language prefix');
        }
    }

    // Construct the full URL
    const newUrl = newPath + currentSearch + currentHash;

    console.log('馃幆 Navigating to:', newUrl);
    console.log('馃搳 Language switch mapping:', currentPath, '->', newUrl);

    // Navigate to the new URL
    window.location.href = newUrl;
}

/**
 * Setup basic language selector functionality before i18n loads
 */
function setupBasicLanguageSelector() {
    // Setup modal-based language selector
    const languageModalTrigger = document.getElementById('language-modal-trigger');
    const languageModal = document.getElementById('language-modal');
    const languageModalClose = document.getElementById('language-modal-close');
    const languageModalBackdrop = document.getElementById('language-modal-backdrop');

    if (languageModalTrigger && languageModal) {
        console.log('Setting up basic language modal (before i18n)');

        // Open modal when button is clicked
        languageModalTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            languageModal.classList.add('show');
            languageModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            console.log('Language modal opened');
        });

        // Close modal function
        const closeModal = () => {
            languageModal.classList.remove('show');
            languageModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            console.log('Language modal closed');
        };

        // Close modal when close button is clicked
        if (languageModalClose) {
            languageModalClose.addEventListener('click', closeModal);
        }

        // Close modal when backdrop is clicked
        if (languageModalBackdrop) {
            languageModalBackdrop.addEventListener('click', closeModal);
        }

        // Close modal when Escape key is pressed
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && languageModal.classList.contains('show')) {
                closeModal();
            }
        });

        // Setup language card clicks (direct navigation for multilang build)
        const languageCards = languageModal.querySelectorAll('.language-card:not(.disabled)');
        languageCards.forEach(card => {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                const newLang = card.getAttribute('data-lang');
                console.log('Language card clicked:', newLang);

                // Show loading state
                const originalContent = card.innerHTML;
                card.innerHTML = '<div class="lang-name">Loading...</div>';

                try {
                    // Close modal first
                    const modal = document.getElementById('language-modal');
                    if (modal) {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }

                    // Navigate to the new language URL immediately
                    navigateToLanguage(newLang);
                } catch (error) {
                    console.error('Error changing language:', error);
                    card.innerHTML = originalContent;

                    // Show error message
                    alert('Language switch failed. Please try again.');
                }
            });
        });
    }

    // Setup legacy select element
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        console.log('Setting up basic language select (before i18n)');

        languageSelect.addEventListener('change', async (event) => {
            const newLang = event.target.value;
            console.log('Language select changed to:', newLang);

            // If i18n is not loaded yet, wait for it
            if (typeof i18next === 'undefined' || !i18nModule) {
                languageSelect.disabled = true;

                // Wait for i18n to load
                let retries = 0;
                const maxRetries = 50;
                while (retries < maxRetries && (!i18nModule || typeof i18next === 'undefined')) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    retries++;
                }

                if (i18nModule && typeof i18next !== 'undefined') {
                    try {
                        await i18next.changeLanguage(newLang);
                        localStorage.setItem('i18nextLng', newLang);
                        document.documentElement.lang = newLang;

                        if (i18nModule.updateUIElements) {
                            i18nModule.updateUIElements();
                        }
                    } catch (error) {
                        console.error('Error changing language:', error);
                    }
                }

                languageSelect.disabled = false;
            } else {
                // i18n is already loaded
                try {
                    languageSelect.disabled = true;
                    await i18next.changeLanguage(newLang);
                    localStorage.setItem('i18nextLng', newLang);
                    document.documentElement.lang = newLang;

                    if (i18nModule.updateUIElements) {
                        i18nModule.updateUIElements();
                    }

                    languageSelect.disabled = false;
                } catch (error) {
                    console.error('Error changing language:', error);
                    languageSelect.disabled = false;
                }
            }
        });
    }
}

/**
 * Setup advanced event listeners (non-critical, can be delayed)
 * Note: Basic event delegation is now handled by OptimizedEventManager
 */
function setupAdvancedEventListeners() {
    console.log('馃帶 Setting up advanced event listeners (optimized event manager handles basic delegation)...');

    // Individual copy button delegation.
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('copy-btn') && event.target.getAttribute('data-clipboard-target')) {
            event.preventDefault();

            if (!clipboardModule) {
                clipboardModule = moduleLoadingOptimizer.moduleRegistry.get('clipboard') ||
                    await moduleLoadingOptimizer.loadOnDemand('clipboard');
            }

            if (clipboardModule && clipboardModule.handleCopyClick) {
                clipboardModule.handleCopyClick(event);
            } else {
                console.warn('Clipboard module not available for individual copy');
            }
        }
    });

    // Copy-all button handler.
    const copyAllBtn = document.getElementById('copy-all-info');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', async () => {
            try {
                if (!clipboardModule) {
                    // 浼樺厛浠庢ā鍧楁敞鍐岃〃鑾峰彇锛屽鏋滄病鏈夊垯鎸夐渶鍔犺浇
                    clipboardModule = moduleLoadingOptimizer.moduleRegistry.get('clipboard') ||
                        await moduleLoadingOptimizer.loadOnDemand('clipboard');
                }

                if (clipboardModule && clipboardModule.copyAllInfo) {
                    await clipboardModule.copyAllInfo();
                } else {
                    console.warn('Clipboard module not available for copyAllInfo');
                    const message = (typeof i18next !== 'undefined' && i18next.t && i18next.t('copy_all_failed') !== 'copy_all_failed') ? i18next.t('copy_all_failed') : 'Copy failed';
                    if (window.showToast) window.showToast(message, 3000);
                }
            } catch (e) {
                console.error('Copy all info failed:', e);
                const message = (typeof i18next !== 'undefined' && i18next.t && i18next.t('copy_all_failed') !== 'copy_all_failed') ? i18next.t('copy_all_failed') : 'Copy failed';
                if (window.showToast) window.showToast(message, 3000);
            }
        });
    }

    // Language change listener
    if (typeof i18next !== 'undefined') {
        i18next.on('languageChanged', async (lng) => {
            console.log('i18next language changed event triggered for:', lng);
            try {
                if (i18nModule) {
                    i18nModule.updateUIElements();
                }

                if (deviceDetectorModule) {
                    await deviceDetectorModule.updateDisplay();
                }

                updateViewportDisplay();

                console.log('UI updated after language change');
            } catch (error) {
                console.error('Error updating UI after language change:', error);
            }
        });
    }

    // 鐩戝惉浼樺寲浜嬩欢绠＄悊鍣ㄧ殑鑷畾涔変簨浠?    window.addEventListener('optimizedResize', (event) => {
        console.log('馃搻 Optimized resize event received:', event.detail);
        // 杩欓噷鍙互娣诲姞鍏朵粬闇€瑕佸搷搴旂獥鍙ｅぇ灏忓彉鍖栫殑閫昏緫
    });

    console.log('鉁?Advanced event listeners setup completed');
}

/**
 * Setup navigation highlighting based on current page
 */
function setupNavigationHighlighting() {
    try {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;

        // Skip if server-side active states are already set
        const hasServerActive = document.querySelector('.nav-link.active');
        if (hasServerActive) {
            console.log('Server-side active state detected, skipping client-side navigation highlighting');
            return;
        }

        console.log('Setting up navigation highlighting for path:', currentPath);

        // First remove all active classes
        navLinks.forEach(link => link.classList.remove('active'));

        // Determine which section we're in
        if (currentPath.includes('/blog/')) {
            // We're in the blog section, find and highlight the blog link
            navLinks.forEach(link => {
                const linkText = link.textContent.trim();
                const linkDataI18n = link.getAttribute('data-i18n');

                // Check if this is the blog link by text content or data-i18n attribute
                if (linkDataI18n === 'nav_blog' || linkText.includes('鍗氬') || linkText.includes('Blog')) {
                    link.classList.add('active');
                    console.log('Added active class to blog link');
                }
            });
        } else {
            // We're not in the blog section, find and highlight the home link
            navLinks.forEach(link => {
                const linkDataI18n = link.getAttribute('data-i18n');
                const linkText = link.textContent.trim();

                // Check if this is the home link by data-i18n attribute or text content
                if (linkDataI18n === 'nav_home' || linkText.includes('棣栭〉') || linkText.includes('Home')) {
                    link.classList.add('active');
                    console.log('Added active class to home link');
                }
            });
        }
    } catch (error) {
        console.error('Error setting up navigation highlighting:', error);
    }
}

/**
 * Setup FAQ toggle functionality
 */
function setupFAQToggles() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            const answer = faqItem.querySelector('.faq-answer');

            // Close all FAQ items and update ARIA attributes and inline styles
            document.querySelectorAll('.faq-question').forEach(q => {
                const item = q.closest('.faq-item');
                if (item) {
                    item.classList.remove('active');
                    q.setAttribute('aria-expanded', 'false');

                    // Reset inline max-height style for all answers
                    const ans = item.querySelector('.faq-answer');
                    if (ans) {
                        ans.style.maxHeight = '0px';
                        ans.setAttribute('hidden', '');
                    }
                }
            });

            // Toggle current item if it wasn't expanded
            if (!isExpanded) {
                faqItem.classList.add('active');
                question.setAttribute('aria-expanded', 'true');

                // Set max-height to show the answer
                if (answer) {
                    // Remove hidden attribute
                    answer.removeAttribute('hidden');

                    // Calculate the actual height needed
                    answer.style.maxHeight = '0px';
                    answer.style.overflow = 'hidden';

                    // Temporarily make visible to measure height
                    answer.style.maxHeight = 'none';
                    answer.style.display = 'block';
                    const height = answer.scrollHeight;

                    // Apply the measured height with animation
                    answer.style.maxHeight = '0px';
                    answer.offsetHeight; // Force reflow
                    answer.style.maxHeight = height + 'px';

                    // Remove the inline style after animation completes to allow CSS to take over
                    setTimeout(() => {
                        answer.style.maxHeight = '200px'; // Match CSS value
                    }, 300);
                }

                // Smooth scroll to the question for better UX
                question.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

/**
 * Update viewport display in hero section
 */
function updateViewportDisplay() {
    const viewportDisplay = document.getElementById('viewport-display');
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');

    if (viewportDisplay) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 鐩存帴鏇存柊瑙嗗彛灏哄鏄剧ず锛岀Щ闄ょ炕璇戝睘鎬?        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = `${width} × ${height}`;
    }

    if (screenResolutionDisplay) {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        // 鑾峰彇鐜版湁鐨勬爣绛惧拰鍊肩殑span
        let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

        // 濡傛灉鎵惧埌浜嗗€約pan锛屽彧鏇存柊鍏跺唴瀹?        if (valueSpan) {
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
        }

        // 濡傛灉鎵惧埌浜嗘爣绛緎pan骞朵笖i18next鍙敤锛屾洿鏂扮炕璇?        if (labelSpan && typeof i18next !== 'undefined' && i18next.t) {
            labelSpan.textContent = i18next.t('screen_resolution');
        }
    }
}

/**
 * Initialize theme system
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log('Initializing theme:', savedTheme);
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    console.log('馃帹 Toggling theme:', currentTheme, '->', newTheme);

    // 纭繚涓婚鍒囨崲绔嬪嵆鐢熸晥
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    // 楠岃瘉涓婚鏄惁鎴愬姛搴旂敤
    setTimeout(() => {
        const appliedTheme = document.documentElement.getAttribute('data-theme');
        console.log('鉁?Theme applied successfully:', appliedTheme);

        // 瑙﹀彂鑷畾涔変簨浠堕€氱煡涓婚鍙樺寲
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { oldTheme: currentTheme, newTheme: appliedTheme }
        }));
    }, 50);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    console.log('馃帹 Applying theme:', theme);

    // 绔嬪嵆搴旂敤涓婚灞炴€?    document.documentElement.setAttribute('data-theme', theme);

    // 寮哄埗閲嶆柊璁＄畻CSS鍙橀噺锛屼絾涓嶅奖鍝嶆樉绀?    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--background-primary');

    console.log('鉁?Theme attribute set to:', document.documentElement.getAttribute('data-theme'));
    console.log('馃帹 CSS variable --background-primary:', bgColor.trim());
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '馃寵' : '鈽€锔?;
    }
}

/**
 * Show error message
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

/**
 * Show toast notification
 */
export function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    setTimeout(initializeApp, 0);
}

// Also try to initialize after a short delay to ensure all scripts are loaded
setTimeout(() => {
    if (!isInitialized) {
        console.log('Fallback initialization...');
        initializeApp();
    }
}, 100);

// Export for manual initialization if needed
export { initializeApp, toggleTheme, applyTheme, updateThemeIcon, initializeTheme };

// 纭繚鍏抽敭鍑芥暟鍦ㄥ叏灞€浣滅敤鍩熶腑鍙敤锛堢敤浜庤皟璇曞拰鍏煎鎬э級
if (typeof window !== 'undefined') {
    window.toggleTheme = toggleTheme;
    window.applyTheme = applyTheme;
    window.initializeTheme = initializeTheme;
    window.updateThemeIcon = updateThemeIcon;
    console.log('馃實 Theme functions exposed to global scope for compatibility');
} 