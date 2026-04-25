// app.js - Main application entry point (Performance Optimized with Module Loading)

console.log('Starting app.js module load...');

// Only import critical utilities immediately
import { debounce } from './utils.js';
import { performanceMonitor } from './performance-monitor.js';
import { moduleLoadingOptimizer } from './module-loading-optimizer.js';
import { initializeOptimizedEventManager } from './optimized-event-manager.js';
import CSSOptimizer from './css-optimizer.js';
import { initializeMobileOptimization } from './mobile-performance-optimizer.js';
// FontLoadingOptimizer will be imported dynamically to avoid blocking

// NOTE: cleaned malformed mojibake comment.
let resourceLoadingOptimizer = null;
let performanceErrorHandler = null;
let optimizedEventManager = null;

console.log('Critical modules imported successfully');

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

        // PHASE 0: 闁荤姴鎼悿鍥╂崲閸愵喗鐓ユ繛鍡樺俯閸ゆ牕顭跨捄鍝勵伀闁诡喖锕畷鎶藉Ω閵夈儳浠存繝娈垮枛椤戝懐鈧潧寮剁粋鎺楀Ψ閳衡偓缂傚鏌涜箛鎾缎ф俊顖氭缁?        // await initializeErrorHandler();

        // PHASE 1: 闁荤姴鎼悿鍥╂崲閸愵亝灏庨柛鏇ㄥ墰閻栭亶鏌涢弮鍌毿繛鏉戞处鐎电厧螣閸濆嫷鍤欓梺闈╃祷閸斿绂嶉幒妤佺劶闁割煈鍠栫敮鎶芥⒒閸愵収鍤欐い?
        // await resourceLoadingOptimizer.initialize();

        // PHASE 2: Critical immediate initialization
        updateInitialDisplayValues();
        initializeTheme();

        // PHASE 2.0: Initialize mobile performance optimizations
        try {
            initializeMobileOptimization({
                enableDeviceDetection: true,
                enableNetworkAdaptation: true,
                enableLowEndOptimization: true,
                debugMode: false
            });
            console.log('Mobile performance optimizer initialized successfully');
        } catch (error) {
            console.warn('Mobile performance optimizer failed to initialize:', error);
        }

        // PHASE 2.1: Initialize the font loading optimizer lazily
        try {
            const FontLoadingOptimizerModule = await import('./font-loading-optimizer.js');
            const FontLoadingOptimizer = FontLoadingOptimizerModule.default;

            new FontLoadingOptimizer({
                preloadCriticalFonts: true,
                enableFallback: true,
                enableMetrics: true,
                fontDisplay: 'swap'
            });

            console.log('Font loading optimizer initialized successfully');
        } catch (error) {
            console.warn('Font loading optimizer failed to initialize:', error);
        }

        // PHASE 2.2: Initialize basic event listeners
        setupBasicEventListeners();

        // PHASE 2.3: Initialize CSS optimizer
        const cssOptimizer = new CSSOptimizer({
            enableMinification: true,
            enableCaching: true,
            deferLoadDelay: 100,
            enableCSSCompression: false,
            enableCSSCaching: false,
            enableFallbackHandling: true,
            protectThemeCSS: true
        });

        // 鐎点倖鍎肩换婊呪偓浣冨閸╁懏顨囧Ο鐟扮槰閻犱礁澧介悿鍡涙晬瀹€鈧垾妯荤┍濠婄M閻庣懓鑻崣蹇涘礉閻樼儤绁?
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
        console.log('Critical application initialization completed!');

    } catch (error) {
        console.error('Failed to initialize application:', error);

        // NOTE: cleaned malformed mojibake comment.
        if (performanceErrorHandler) {
            performanceErrorHandler.logError('Application initialization failed', error);
        }

        // 闂佸搫瀚晶浠嬪Φ濮樿埖鈷旂€广儱娲悰鎾绘煟閵娿儱顏柡浣革功閹风娀顢涘☉姣裤儵鏌熼褍鐏犻柟铚傚嵆瀹曟椽鎼圭拠鈩冩暏闂佸憡姊婚崰鏇㈠礂?
        showErrorMessage();
        updateInitialDisplayValues();

        // 闁诲繐绻戠换鍡涙儊椤栫偛瑙︽い鏍ㄧ矋閺嗗繘鏌涢埡鍕仩妞ゃ垹鎳樺畷婵嬫偄鐠囨彃骞?
        try {
            initializeTheme();
            setupBasicEventListeners();
        } catch (fallbackError) {
            console.error('Even fallback initialization failed:', fallbackError);
        }
    }
}

/**
 * Initialize error handler for critical error handling
 */
async function initializeErrorHandler() {
    try {
        console.log('Initializing error handler...');

        const { default: PerformanceErrorHandler } = await import('./performance-error-handler.js');

        performanceErrorHandler = new PerformanceErrorHandler({
            enableLogging: true,
            reportErrors: true,
            maxRetries: 3,
            retryDelay: 1000,
            enableFallback: true
        });

        console.log('Error handler initialized successfully');
    } catch (error) {
        console.error('Failed to initialize error handler:', error);
    }
}

/**
 * Initialize non-critical modules asynchronously using ModuleLoadingOptimizer
 */
async function initializeNonCriticalModules() {
    try {
        console.log('Loading non-critical modules with ModuleLoadingOptimizer...');

        // 婵炶揪缍€濞夋洟寮妶鍛傜喖鍨鹃搹顐淮闂佸憡姊绘慨鎯归崶銊ヮ嚤婵☆垰鎼褔鏌涢敐鍐ㄥ婵炲懌鍊濋幊妤呮寠婢跺娼遍柡澶屽仒缁瑩濡存径鎰棃闁靛繆鈧剚鏆￠梻鍌氭礌閸嬫挻淇婇妞诲亾閾忣偄浠?
        await moduleLoadingOptimizer.loadPageModules();

        // 闂佸吋鍎抽崲鑼躲亹閸パ屽晠闁圭粯甯掗～锝夊级閻愬灚娅曟繛鍫熷灴瀹曟骞庨懞銉︽濠碘槅鍨埀顒冩珪閸?
        i18nModule = moduleLoadingOptimizer.moduleRegistry.get('i18n');
        deviceDetectorModule = moduleLoadingOptimizer.moduleRegistry.get('device-detector');

        // 闂佸憡甯楃换鍌烇綖閹版澘绀岄柡宓啫娈ラ梺鍛婃⒒婵儳霉閸ヮ剚鍎嶉柛?8n濠碘槅鍨埀顒冩珪閸嬨儵鏌ㄥ☉妯煎缂侀硸鍙冨畷鐘诲冀椤愩埄鏆梺鍝勭墱閸撱劎妲?
        if (i18nModule) {
            const i18nStartTime = performance.now();
            await i18nModule.initializeI18next();
            i18nModule.setupLanguageSelector();
            i18nModule.updateUIElements();

            // NOTE: cleaned malformed mojibake comment.
            if (i18nModule.preloadTranslations) {
                i18nModule.preloadTranslations(['en', 'zh']).catch(error => {
                    console.warn('Translation preloading failed:', error);
                });
            }

            // Record i18n load time
            const i18nLoadTime = performance.now() - i18nStartTime;
            performanceMonitor.recordCustomMetric('translationLoadTime', i18nLoadTime);

            // 闁荤姳鐒﹀妯肩礊瀹ュ鐐婂ù鐘差儐椤庡酣鏌涢弽銊у闁逞屽劯閸℃骞嬮梺鍦焾濞诧箓鎮?
            if (i18nModule.getI18nPerformanceMetrics) {
                const i18nMetrics = i18nModule.getI18nPerformanceMetrics();
                console.log('I18n performance metrics:', i18nMetrics);
            }
        }

        // 闂佸憡甯楃换鍌烇綖閹版澘绀岄柡宓啫娈ラ梺鍛婃⒒婵儳霉閸ヮ剚鍎嶉柛鏇ㄥ櫘閸熷骸顭跨捄鐑樺妞ゃ儱鎳庨湁閻庯綆浜濋悵銈嗕繆椤栨せ鍋撻搹顐淮闂佹寧绋戦悧鍛椤撱垹绀岄柡宥庡亜椤ｅジ鏌￠崼顐㈠⒕缂?
        if (deviceDetectorModule) {
            const deviceDetectorStartTime = performance.now();
            await deviceDetectorModule.updateDisplay();

            // 闁荤姳绀佹晶浠嬫偪閸℃ê顕辨俊顖氭惈椤曆囨煟閵娿儱顏い顐㈩儔瀹曪綁鏁愰崨顔筋潊闁诲酣娼ч幉鈥趁洪崸妤€妫橀柟娈垮枟绾狙囨煕濮樼厧澧繛?
            window.addEventListener('resize', deviceDetectorModule.updateViewportSize);

            // Record device detection time
            const deviceDetectionTime = performance.now() - deviceDetectorStartTime;
            performanceMonitor.recordCustomMetric('deviceDetectionTime', deviceDetectionTime);

            // 闁荤姳鐒﹀妯肩礊瀹ュ洦濯奸柟顖嗗本校濠碘槅鍋€閸嬫挻绻涢弶鎴剱闁逞屽劯閸℃骞嬮梺鍦焾濞诧箓鎮?
            const deviceMetrics = deviceDetectorModule.getPerformanceMetrics();
            console.log('Device detection performance:', deviceMetrics);
        }

        // Setup advanced event listeners
        setupAdvancedEventListeners();

        // Load page-specific modules (now handled by ModuleLoadingOptimizer)
        loadPageSpecificModulesOptimized();

        console.log('Non-critical modules loaded successfully with optimization!');

        // 闁荤姳鐒﹀妯肩礊瀹ュ憘鐔煎灳閾忣偄浠撮梺鍛婃⒒婵儳霉閸モ晝纾奸柣鏃€妞块崥鈧?
        const stats = moduleLoadingOptimizer.getLoadingStats();
        console.log('Module loading stats:', stats);

    } catch (error) {
        console.error('Error loading non-critical modules:', error);

        // NOTE: cleaned malformed mojibake comment.
        if (performanceErrorHandler) {
            performanceErrorHandler.logError('Non-critical modules loading failed', error);
        }

        // 闁诲繐绻戠换鍡涙儊椤栫偛瑙︽い鏍ㄧ矋閺嗗繘鏌涢埡鍕仩妞ゃ垹鎳樺畷婵嬫偄鐠囨彃骞嬫繛杈剧稻缁牏鎷归悢鍏尖挃鐎广儱娲悰?
        try {
            // NOTE: cleaned malformed mojibake comment.
            if (!i18nModule) {
                console.log('i18n failed to load, using fallback display values');
                updateInitialDisplayValues();
            }

            // NOTE: cleaned malformed mojibake comment.
            if (!deviceDetectorModule) {
                console.log('Device detector failed to load, using basic viewport updates');
                window.addEventListener('resize', debounce(updateViewportDisplay, 100));
            }
        } catch (fallbackError) {
            console.error('Even fallback for non-critical modules failed:', fallbackError);
        }
    }
}

/**
 * Load page-specific modules using ModuleLoadingOptimizer (optimized version)
 */
function loadPageSpecificModulesOptimized() {
    const currentPath = window.location.pathname;
    console.log('Loading page-specific modules for path:', currentPath);

    // 婵炶揪缍€濞夋洟寮妶鍛傜喖鍨鹃搹顐淮闂佸憡姊绘慨鎯归崶銊ヮ嚤婵☆垰鎼褔鏌涢敐鍐ㄥ閻庡灚绮撳Λ渚€鍩€椤掑嫬绀夐柣妯煎劋缁佷即鏌ｅΔ鍐╁殌闁伙綁绠栧畷婵嬫偄鐠囨彃骞嬪┑鈽嗗灙閳ь剝娅曢崑?
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
            // 闂傚倸瀚粔鑸殿殽閸ャ劌绶為柛鏇ㄥ幗閸婄偤鏌ㄥ☉娆掑闁汇劌澧介幏鐘诲即閻樺磭鍑介梺瑙勪航閸庢挳鎯冮悢鍏煎仺闁靛鍎卞鍧楁倶閻愨晛浜鹃梺鍛婂灱婵倝寮?
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

    // NOTE: cleaned malformed mojibake comment.
    if (currentPath.includes('/blog/')) {
        console.log('Blog page detected, loading blog modules with optimizer');

        // NOTE: cleaned malformed mojibake comment.
        moduleLoadingOptimizer.loadOnDemand('blog-progress').then(module => {
            if (module && module.initializeBlogProgress) {
                module.initializeBlogProgress();
            }
        }).catch(error => {
            console.warn('Blog progress module failed to load:', error);
        });
    }

    // NOTE: cleaned malformed mojibake comment.
    setTimeout(() => {
        moduleLoadingOptimizer.loadOnDemand('internal-links').then(module => {
            if (module && module.initializeInternalLinks) {
                module.initializeInternalLinks();
            }
        }).catch(error => {
            console.error('Failed to load internal links:', error);
            // NOTE: cleaned malformed mojibake comment.
            import('./internal-links.js').then(module => {
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

    // NOTE: cleaned malformed mojibake comment.
    if (currentPath.includes('ppi-calculator')) {
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

    // NOTE: cleaned malformed mojibake comment.
    if (currentPath.includes('/blog/')) {
        // Blog闂佸憡姊婚崰鏇㈠礂濡顕辨慨姗嗗墯闊剟姊婚崶锝呬壕闁荤喐娲戦悞锕€顪冮崒鐐村殜妞ゅ繐瀚闂佸憡姊绘慨鎯?
        console.log('Blog page detected, modules will load as needed');
    }

    // Internal Links (load for all pages but with low priority)
    setTimeout(() => {
        import('./internal-links.js').then(module => {
            module.initializeInternalLinks();
        }).catch(error => {
            console.error('Failed to load internal links:', error);
            // NOTE: cleaned malformed mojibake comment.
            });
    }, 1000);
}

/**
 * 闂佸搫娲ら悺銊╁蓟婵犲洤绀嗘繝闈涙－濞兼鏌￠崟顐⑩挃闁靛洦宀稿畷鎰兜妞嬪海顦繛鎴炴尭缁夊磭娆㈡搴㈠皫闁哄稄濡囬懝绶?8next闂佺懓鐡ㄩ悧鏇㈠矗閻愵剛顩烽柡宥庡亰閸忓洨绱? */
function updateInitialDisplayValues() {
    try {
        console.log('Initializing display values...');

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
            console.log('Viewport updated: ' + width + ' × ' + height);
        } else {
            console.warn('Viewport display element not found');
        }

        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        if (screenResolutionDisplay) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const screenResolution = screenWidth + ' × ' + screenHeight;

            if (screenResolutionDisplay.dataset.displayFormat === 'value') {
                screenResolutionDisplay.textContent = screenResolution;
                console.log('Screen resolution updated: ' + screenResolution);
                return;
            }

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
            valueSpan.textContent = screenResolution;
            console.log('Screen resolution updated: ' + screenResolution);
        } else {
            console.warn('Screen resolution display element not found');
        }
    } catch (error) {
        console.error('Error updating initial display values:', error);
    }
}

/**
 * Setup basic event listeners (critical, non-blocking)
 */
function setupBasicEventListeners() {
    console.log('Setting up basic event listeners...');

    // Theme toggle - 缂佺虎鍙庨崰鏇犳崲濮樿京鍗氶悗锝庝簻缁侇噣鏌涘▎妯虹仯闁?
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('Found theme toggle button, binding click event');
        themeToggle.addEventListener('click', toggleTheme);

        // 婵°倗濮撮惌渚€鎯佹径瀣洸閻庯絺鏅滈鐣岀磽娴ｇ懓鐏ラ柣?
        setTimeout(() => {
            const hasListener = themeToggle.onclick || themeToggle.addEventListener;
            console.log('Theme toggle event binding verified:', !!hasListener);
        }, 100);
    } else {
        console.warn('Theme toggle button not found during basic event setup');
    }

    // Language selector basic setup (before i18n loads)
    setupBasicLanguageSelector();

    // Viewport size update on window resize (critical for screen checker)
    window.addEventListener('resize', debounce(updateViewportDisplay, 100));

    // FAQ toggle functionality
    setupFAQToggles();

    console.log('Basic event listeners setup completed');
}

/**
 * Navigate to the corresponding language URL
 * Updated for SEO redirect optimization: root = English, /en/ redirects to root
 */
function navigateToLanguage(newLang) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;

    console.log('Navigating to language:', newLang, 'from path:', currentPath);

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
                console.log('English: using root path for SEO optimization (with blog special-case in multilang-build)');
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
            console.log('English: using root path for SEO optimization');
        } else {
            // Other languages: use language prefix
            newPath = `/${newLang}`;
            if (pagePath) {
                newPath += `/${pagePath}`;
            }
            console.log('Non-English: using language prefix');
        }
    }

    // Construct the full URL
    const newUrl = newPath + currentSearch + currentHash;

    console.log('Navigating to:', newUrl);
    console.log('Language switch mapping:', currentPath, '->', newUrl);

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
        if (languageModal.dataset.basicSelectorBound === 'true') {
            console.log('Basic language modal already initialized, skipping duplicate binding');
            return;
        }

        languageModal.dataset.basicSelectorBound = 'true';
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
    console.log('Setting up advanced event listeners (optimized event manager handles basic delegation)...');

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
                    // 婵炴潙鍚嬮敋闁告ɑ绋掔粋鎺撴償閳锋稐绶氬畷绋课旀担瑙勬畼闂佸憡鍔曢惌渚€濡撮崘顔藉殧鐎瑰嫭婢樼徊鍧楁煥濞戞瀚版い鈹洤鍑犳繝濠傚濮婇箖鏌￠崼婵愭Ц闁割煈鍨堕獮鎰緞閹邦厺绮梺鍛婃⒒婵儳霉?
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

    // Listen for optimized resize events emitted by the event manager
    window.addEventListener('optimizedResize', (event) => {
        console.log('Optimized resize event received:', event.detail);
        // 闁哄鏅滈悷鈺呭闯閻戣棄鐭楁い鏍ㄧ懁缁ㄧ増绻涢敐鍫殭濠殿喚鍋ゅ畷妤呭嫉閻㈢敻鎼ㄩ梻鍌氭礌閸嬫捇鎮烽弴姘鳖槮闁瑰ジ鏀遍幆鏃堝籍閸屾粌鐐婇梺鍛婄懕缁蹭粙濡甸崶鈺€鐒婇煫鍥ㄦ尭缂嶄線鏌涢弽銊у⒈婵炲牊鍨块弻鍛村及韫囨洖绔?
    });

    console.log('Advanced event listeners setup completed');
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
                if (linkDataI18n === 'nav_blog' || linkText.includes('博客') || linkText.includes('Blog')) {
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
                if (linkDataI18n === 'nav_home' || linkText.includes('首页') || linkText.includes('Home')) {
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

        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = width + ' × ' + height;
    }

    if (screenResolutionDisplay) {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const screenResolution = screenWidth + ' × ' + screenHeight;

        if (screenResolutionDisplay.dataset.displayFormat === 'value') {
            screenResolutionDisplay.textContent = screenResolution;
            return;
        }

        const labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        const valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

        if (valueSpan) {
            valueSpan.textContent = screenResolution;
        }

        if (labelSpan && typeof i18next !== 'undefined' && i18next.t) {
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

    console.log('Toggling theme:', currentTheme, '->', newTheme);

    // 缂佺虎鍙庨崰鏇犳崲濮橆厾鈻斿┑鐘冲嚬閺嗩垶鏌涢幒鎴炲鐎规洝灏欑划鈺冣偓锝庝簻缁侇噣鏌ｉ姀銏犳瀾闁?
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    // 婵°倗濮撮惌渚€鎯佹径瀣枖濠电姵鍑归弳顖炴煛閸曢潧鐏犻柟顖欑窔楠炲骞囬鈧～鐘诲箹鐎涙ɑ鈷掗柡?
    setTimeout(() => {
        const appliedTheme = document.documentElement.getAttribute('data-theme');
        console.log('Theme applied successfully:', appliedTheme);

        // 闁荤喐鐟辩粻鎴ｃ亹閸岀偞鍤婃い蹇撳閺嗘澘鈽夐弬娆炬Х缂併劊鍔嶇粋鎺楀醇閺囨浜炬慨妯夸含閸欌偓婵炴垶鎸搁…鐑姐€傛禒瀣煑婵☆垰鎼?
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { oldTheme: currentTheme, newTheme: appliedTheme }
        }));
    }, 50);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    console.log('Applying theme:', theme);

    // NOTE: cleaned malformed mojibake comment.
    document.documentElement.setAttribute('data-theme', theme);

    // NOTE: cleaned malformed mojibake comment.
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--background-primary');

    console.log('Theme attribute set to:', document.documentElement.getAttribute('data-theme'));
    console.log('CSS variable --background-primary:', bgColor.trim());
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F';
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
            <h2>濠碘槅鍋€閸嬫挻绻涢弶鎴剰闁靛洦鍨归幏?/h2>
            <p>闂佸搫鍟版慨鐢垫兜鐠轰綍娑㈠焵椤掆偓闇夐悗锝庡弾閸熷骸顭跨捄鐑樼煑濞ｅ洤锕獮渚€顢涢妶鍥╊槷闁荤姴娲ら崲鏌ュ春濞戙垹妫樺ù鍏肩暘閳ь剙顦靛Λ鍐閵堝懏顏熼柣鐘叉处濞插繘鍩€?/p>
            <button onclick="window.location.reload()">闂備焦褰冪粔鐑芥儊?/button>
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

// 缂佺虎鍙庨崰鏇犳崲濮樿泛绀傞柟鎯板Г閺嗘盯鏌涢幋锝呅撻柡鍡欏枛瀹曠兘濡搁妷銉ヤ紟闁诲繒鍋愰崑鎾趁归敐鍡欑煂闁轰降鍊濆畷娲偄閹澘骞€闂佸憡鐟崹鎶藉极閵堝鏅柛顐犲灪閺嗗繐霉濠婂啯鍞夐柣銊у枔閹风娀寮撮悙鏉戭伅闂佺绻掗崢褔顢欓幇鏉跨畱鐟滄繄妲?
if (typeof window !== 'undefined') {
    window.toggleTheme = toggleTheme;
    window.applyTheme = applyTheme;
    window.initializeTheme = initializeTheme;
    window.updateThemeIcon = updateThemeIcon;
    console.log('Theme functions exposed to global scope for compatibility');
} 
