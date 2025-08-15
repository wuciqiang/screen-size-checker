// app.js - Main application entry point (Performance Optimized with Module Loading)

console.log('🚀 Starting app.js module load...');

// Only import critical utilities immediately
import { debounce } from './utils.js';
import { performanceMonitor } from './performance-monitor.js';
import { moduleLoadingOptimizer } from './module-loading-optimizer.js';
import { initializeOptimizedEventManager } from './optimized-event-manager.js';
import CSSOptimizer from './css-optimizer.js';
import { initializeMobileOptimization } from './mobile-performance-optimizer.js';
// FontLoadingOptimizer will be imported dynamically to avoid blocking

// 动态导入广告相关模块（避免阻塞）
let adConfigManager = null;
let adLoadingOptimizer = null;
let adPerformanceAnalytics = null;

// 暂时移除资源加载优化器的导入以避免阻塞
let resourceLoadingOptimizer = null;
let performanceErrorHandler = null;
let optimizedEventManager = null;

console.log('✅ Critical modules imported successfully');

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

        // PHASE 0: 跳过错误处理器初始化以避免阻塞
        // await initializeErrorHandler();

        // PHASE 1: 跳过资源加载优化器以避免阻塞
        // await resourceLoadingOptimizer.initialize();

        // PHASE 2: Critical immediate initialization
        updateInitialDisplayValues();
        initializeTheme();

        // PHASE 2.0: 初始化移动端性能优化系统（关键性能优化）
        try {
            const mobileOptimizer = initializeMobileOptimization({
                enableDeviceDetection: true,
                enableNetworkAdaptation: true,
                enableLowEndOptimization: true,
                debugMode: false
            });
            console.log('✅ Mobile performance optimizer initialized successfully');
        } catch (error) {
            console.warn('⚠️ Mobile performance optimizer failed to initialize:', error);
            // 移动端优化器初始化失败不应该阻止应用启动
        }

        // PHASE 2.1: 初始化字体加载优化器（关键性能优化）
        try {
            const FontLoadingOptimizerModule = await import('./font-loading-optimizer.js');
            const FontLoadingOptimizer = FontLoadingOptimizerModule.default;

            const fontOptimizer = new FontLoadingOptimizer({
                preloadCriticalFonts: true,
                enableFallback: true,
                enableMetrics: true,
                fontDisplay: 'swap'
            });

            console.log('✅ Font loading optimizer initialized successfully');
        } catch (error) {
            console.warn('⚠️ Font loading optimizer failed to initialize:', error);
            // 字体优化器初始化失败不应该阻止应用启动
        }

        // PHASE 2.2: 立即设置基础事件监听器，确保主题切换功能可用
        setupBasicEventListeners();

        // PHASE 2.2: CSS Optimizer 重新启用，但配置为不影响主题切换
        const cssOptimizer = new CSSOptimizer({
            enableMinification: true,
            enableCaching: true,
            deferLoadDelay: 100,
            enableCSSCompression: false, // 禁用CSS压缩以避免影响主题
            enableCSSCaching: false,     // 禁用CSS缓存以避免影响主题
            enableFallbackHandling: true,
            protectThemeCSS: true        // 新增：保护主题相关CSS
        });

        // PHASE 2.3: 初始化广告配置管理器（优先加载以提供配置）
        setTimeout(async () => {
            try {
                const AdConfigManagerModule = await import('./ad-config-manager.js');
                adConfigManager = AdConfigManagerModule.default || window.adConfigManager;
                console.log('✅ Ad config manager initialized successfully');
            } catch (error) {
                console.warn('⚠️ Ad config manager failed to initialize:', error);
                // 配置管理器初始化失败不应该阻止应用启动
            }
        }, 300); // 延迟300ms加载，优先于广告优化器

        // PHASE 2.4: 初始化广告加载优化器（延迟加载以避免阻塞）
        setTimeout(async () => {
            try {
                const AdLoadingOptimizerModule = await import('./ad-loading-optimizer.js');
                adLoadingOptimizer = AdLoadingOptimizerModule.default || window.adLoadingOptimizer;
                console.log('✅ Ad loading optimizer initialized successfully');
            } catch (error) {
                console.warn('⚠️ Ad loading optimizer failed to initialize:', error);
                // 广告优化器初始化失败不应该阻止应用启动
            }
        }, 500); // 延迟500ms加载，确保关键内容先渲染

        // PHASE 2.5: 初始化广告性能分析器（延迟加载以避免阻塞）
        setTimeout(async () => {
            try {
                const AdPerformanceAnalyticsModule = await import('./ad-performance-analytics.js');
                adPerformanceAnalytics = AdPerformanceAnalyticsModule.default || window.adPerformanceAnalytics;
                console.log('✅ Ad performance analytics initialized successfully');
            } catch (error) {
                console.warn('⚠️ Ad performance analytics failed to initialize:', error);
                // 性能分析器初始化失败不应该阻止应用启动
            }
        }, 1000); // 延迟1秒加载，确保广告优化器先初始化

        // 延迟导航高亮设置，确保DOM完全加载
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
        console.log('✅ Critical application initialization completed!');

    } catch (error) {
        console.error('❌ Failed to initialize application:', error);

        // 如果有错误处理器，记录错误
        if (performanceErrorHandler) {
            performanceErrorHandler.logError('Application initialization failed', error);
        }

        // 显示降级的错误消息和基础功能
        showErrorMessage();
        updateInitialDisplayValues();

        // 尝试启用基础功能
        try {
            initializeTheme();
            setupBasicEventListeners();
        } catch (fallbackError) {
            console.error('❌ Even fallback initialization failed:', fallbackError);
        }
    }
}

/**
 * Initialize error handler for critical error handling
 */
async function initializeErrorHandler() {
    try {
        console.log('🔧 Initializing error handler...');

        // 动态导入错误处理器
        const { default: PerformanceErrorHandler } = await import('./performance-error-handler.js');

        // 创建错误处理器实例
        performanceErrorHandler = new PerformanceErrorHandler({
            enableLogging: true,
            reportErrors: true,
            maxRetries: 3,
            retryDelay: 1000,
            enableFallback: true
        });

        console.log('✅ Error handler initialized successfully');

    } catch (error) {
        console.error('❌ Failed to initialize error handler:', error);
        // 错误处理器初始化失败不应该阻止应用启动
        // 应用将在没有错误处理器的情况下继续运行
    }
}

/**
 * Initialize non-critical modules asynchronously using ModuleLoadingOptimizer
 */
async function initializeNonCriticalModules() {
    try {
        console.log('Loading non-critical modules with ModuleLoadingOptimizer...');

        // 使用模块加载优化器智能加载页面所需模块
        await moduleLoadingOptimizer.loadPageModules();

        // 获取已加载的关键模块
        i18nModule = moduleLoadingOptimizer.moduleRegistry.get('i18n');
        deviceDetectorModule = moduleLoadingOptimizer.moduleRegistry.get('device-detector');

        // 初始化已加载的i18n模块（优化版本）
        if (i18nModule) {
            const i18nStartTime = performance.now();
            await i18nModule.initializeI18next();
            i18nModule.setupLanguageSelector();
            i18nModule.updateUIElements();

            // 预加载其他语言的翻译资源
            if (i18nModule.preloadTranslations) {
                i18nModule.preloadTranslations(['en', 'zh']).catch(error => {
                    console.warn('Translation preloading failed:', error);
                });
            }

            // Record i18n load time
            const i18nLoadTime = performance.now() - i18nStartTime;
            performanceMonitor.recordCustomMetric('translationLoadTime', i18nLoadTime);

            // 记录国际化性能指标
            if (i18nModule.getI18nPerformanceMetrics) {
                const i18nMetrics = i18nModule.getI18nPerformanceMetrics();
                console.log('📊 I18n performance metrics:', i18nMetrics);
            }
        }

        // 初始化已加载的设备检测器模块（优化版本）
        if (deviceDetectorModule) {
            const deviceDetectorStartTime = performance.now();
            await deviceDetectorModule.updateDisplay();

            // 设置优化的视口尺寸更新监听器
            window.addEventListener('resize', deviceDetectorModule.updateViewportSize);

            // Record device detection time
            const deviceDetectionTime = performance.now() - deviceDetectorStartTime;
            performanceMonitor.recordCustomMetric('deviceDetectionTime', deviceDetectionTime);

            // 记录设备检测性能指标
            const deviceMetrics = deviceDetectorModule.getPerformanceMetrics();
            console.log('📊 Device detection performance:', deviceMetrics);
        }

        // Setup advanced event listeners
        setupAdvancedEventListeners();

        // Load page-specific modules (now handled by ModuleLoadingOptimizer)
        loadPageSpecificModulesOptimized();

        console.log('✅ Non-critical modules loaded successfully with optimization!');

        // 记录模块加载统计
        const stats = moduleLoadingOptimizer.getLoadingStats();
        console.log('📊 Module loading stats:', stats);

    } catch (error) {
        console.error('❌ Error loading non-critical modules:', error);

        // 如果有错误处理器，记录错误
        if (performanceErrorHandler) {
            performanceErrorHandler.logError('Non-critical modules loading failed', error);
        }

        // 尝试启用基础功能作为降级
        try {
            // 如果i18n加载失败，至少确保基础显示值是正确的
            if (!i18nModule) {
                console.log('i18n failed to load, using fallback display values');
                updateInitialDisplayValues();
            }

            // 如果设备检测器加载失败，至少确保视口尺寸更新
            if (!deviceDetectorModule) {
                console.log('Device detector failed to load, using basic viewport updates');
                window.addEventListener('resize', debounce(updateViewportDisplay, 100));
            }
        } catch (fallbackError) {
            console.error('❌ Even fallback for non-critical modules failed:', fallbackError);
        }
    }
}

/**
 * Load page-specific modules using ModuleLoadingOptimizer (optimized version)
 */
function loadPageSpecificModulesOptimized() {
    const currentPath = window.location.pathname;
    console.log('Loading page-specific modules for path:', currentPath);

    // 使用模块加载优化器按需加载特定功能模块
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
            // 降级处理：尝试直接调用全局函数
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

    // Blog pages - 使用优化器加载博客相关模块
    if (currentPath.includes('/blog/')) {
        console.log('Blog page detected, loading blog modules with optimizer');

        // Blog模块已经在页面类型配置中处理，这里只需要确保特定功能加载
        moduleLoadingOptimizer.loadOnDemand('blog-progress').then(module => {
            if (module && module.initializeBlogProgress) {
                module.initializeBlogProgress();
            }
        }).catch(error => {
            console.warn('Blog progress module failed to load:', error);
        });
    }

    // Internal Links (load for all pages but with low priority) - 使用优化器加载
    setTimeout(() => {
        moduleLoadingOptimizer.loadOnDemand('internal-links').then(module => {
            if (module && module.initializeInternalLinks) {
                module.initializeInternalLinks();
            }
        }).catch(error => {
            console.error('Failed to load internal links:', error);
            // 降级处理：直接导入
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

    // 直接加载页面特定模块，不依赖资源优化器
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

    // Blog pages - 直接加载，不依赖优化器
    if (currentPath.includes('/blog/')) {
        // Blog功能会在需要时自动加载
        console.log('Blog page detected, modules will load as needed');
    }

    // Internal Links (load for all pages but with low priority)
    setTimeout(() => {
        import('./internal-links.js').then(module => {
            module.initializeInternalLinks();
        }).catch(error => {
            console.error('Failed to load internal links:', error);
            // 内链加载失败不应该影响其他功能
        });
    }, 1000);
}

/**
 * 更新初始显示值，不依赖于i18next或其他系统
 */
function updateInitialDisplayValues() {
    try {
        console.log('直接更新初始显示值...');

        // 直接更新视口尺寸，不使用任何依赖
        const viewportDisplay = document.getElementById('viewport-display');
        if (viewportDisplay) {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // 移除可能导致被翻译系统覆盖的属性
            viewportDisplay.removeAttribute('data-i18n');

            // 清除旧内容，包括可能存在的detecting span
            const detectingSpan = viewportDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                // 如果是span元素包含detecting，则替换整个内容
                viewportDisplay.innerHTML = '';
            }

            // 设置新内容
            viewportDisplay.textContent = `${width} × ${height}`;
            console.log(`视口尺寸已更新: ${width} × ${height}`);
        } else {
            console.warn('视口尺寸元素未找到');
        }

        // 直接更新屏幕分辨率，不使用任何依赖
        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        if (screenResolutionDisplay) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;

            // 检查是否存在旧的结构
            const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                // 如果找到"detecting..."的span，先移除它
                detectingSpan.parentNode.removeChild(detectingSpan);
            }

            // 查找或创建label和value的span元素
            let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
            let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

            if (!labelSpan) {
                // 如果没有label span，找第一个子元素，或者创建一个新的
                labelSpan = screenResolutionDisplay.querySelector('span:first-child') || document.createElement('span');
                labelSpan.setAttribute('data-i18n', 'screen_resolution');

                // 设置默认文本
                labelSpan.textContent = '屏幕分辨率';

                // 如果不在DOM中，添加它
                if (!labelSpan.parentNode) {
                    screenResolutionDisplay.appendChild(labelSpan);
                }
            }

            // 确保我们有冒号分隔符
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

            // 创建或更新value span
            if (!valueSpan) {
                valueSpan = document.createElement('span');
                screenResolutionDisplay.appendChild(valueSpan);
            }

            // 更新值
            valueSpan.removeAttribute('data-i18n');
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
            console.log(`屏幕分辨率已更新: ${screenWidth} × ${screenHeight}`);
        } else {
            console.warn('屏幕分辨率元素未找到');
        }
    } catch (error) {
        console.error('更新初始显示值时出错:', error);
    }
}

/**
 * Setup basic event listeners (critical, non-blocking)
 */
function setupBasicEventListeners() {
    console.log('🎧 Setting up basic event listeners...');

    // Theme toggle - 确保立即可用
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('✅ Found theme toggle button, binding click event');
        themeToggle.addEventListener('click', toggleTheme);

        // 验证事件绑定
        setTimeout(() => {
            const hasListener = themeToggle.onclick || themeToggle.addEventListener;
            console.log('🔍 Theme toggle event binding verified:', !!hasListener);
        }, 100);
    } else {
        console.warn('⚠️ Theme toggle button not found during basic event setup');
    }

    // Language selector basic setup (before i18n loads)
    setupBasicLanguageSelector();

    // Viewport size update on window resize (critical for screen checker)
    window.addEventListener('resize', debounce(updateViewportDisplay, 100));

    // FAQ toggle functionality
    setupFAQToggles();

    console.log('✅ Basic event listeners setup completed');
}

/**
 * Navigate to the corresponding language URL
 * Updated for SEO redirect optimization: root = English, /en/ redirects to root
 */
function navigateToLanguage(newLang) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;

    console.log('🌐 Navigating to language:', newLang, 'from path:', currentPath);

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
                console.log('🏠 English: using root path for SEO optimization (with blog special-case in multilang-build)');
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
            // Special case: blog pages are only available under /en/blog/* in current build output
            if (pagePath) {
                if (pagePath.startsWith('blog/')) {
                    newPath = `/en/${pagePath}`;
                } else {
                    newPath = `/${pagePath}`;
                }
            } else {
                newPath = '/';
            }
            console.log('🏠 English: using root path for SEO optimization (with blog special-case)');
        } else {
            // Other languages: use language prefix
            newPath = `/${newLang}`;
            if (pagePath) {
                newPath += `/${pagePath}`;
            }
            
            // Ensure trailing slash for directory-like paths
            if (!pagePath || (!pagePath.includes('.') && !pagePath.endsWith('/'))) {
                newPath += '/';
            }
            console.log('🌍 Non-English: using language prefix');
        }
    }

    // Construct the full URL
    const newUrl = newPath + currentSearch + currentHash;

    console.log('🎯 Navigating to:', newUrl);
    console.log('📊 Language switch mapping:', currentPath, '->', newUrl);

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
    console.log('🎧 Setting up advanced event listeners (optimized event manager handles basic delegation)...');

    // 个人复制按钮事件委托 - 使用模块加载优化器
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

    // 一键复制全部按钮事件 - 使用模块加载优化器
    const copyAllBtn = document.getElementById('copy-all-info');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', async () => {
            copyAllBtn.disabled = true;
            const originalText = copyAllBtn.textContent;
            try {
                if (!clipboardModule) {
                    // 优先从模块注册表获取，如果没有则按需加载
                    clipboardModule = moduleLoadingOptimizer.moduleRegistry.get('clipboard') ||
                        await moduleLoadingOptimizer.loadOnDemand('clipboard');
                }

                let result = false;
                if (clipboardModule && clipboardModule.copyAllInfo) {
                    result = await clipboardModule.copyAllInfo();
                } else {
                    console.warn('Clipboard module not available for copyAllInfo');
                    // 可以在这里添加降级的复制全部信息逻辑
                }

                if (result) {
                    copyAllBtn.textContent = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copied_success') : '已复制!';
                    copyAllBtn.classList.add('copied');
                    setTimeout(() => {
                        copyAllBtn.textContent = originalText;
                        copyAllBtn.classList.remove('copied');
                        copyAllBtn.disabled = false;
                    }, 1500);
                } else {
                    copyAllBtn.textContent = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copy_failed') : '复制失败';
                    copyAllBtn.classList.add('error');
                    setTimeout(() => {
                        copyAllBtn.textContent = originalText;
                        copyAllBtn.classList.remove('error');
                        copyAllBtn.disabled = false;
                    }, 2000);
                }
            } catch (e) {
                console.error('Copy all info failed:', e);
                copyAllBtn.textContent = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copy_failed') : '复制失败';
                copyAllBtn.classList.add('error');
                setTimeout(() => {
                    copyAllBtn.textContent = originalText;
                    copyAllBtn.classList.remove('error');
                    copyAllBtn.disabled = false;
                }, 2000);
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

    // 监听优化事件管理器的自定义事件
    window.addEventListener('optimizedResize', (event) => {
        console.log('📐 Optimized resize event received:', event.detail);
        // 这里可以添加其他需要响应窗口大小变化的逻辑
    });

    console.log('✅ Advanced event listeners setup completed');
}

/**
 * Setup navigation highlighting based on current page
 */
function setupNavigationHighlighting() {
    try {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;

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
            const isActive = faqItem.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
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

        // 直接更新视口尺寸显示，移除翻译属性
        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = `${width} × ${height}`;
    }

    if (screenResolutionDisplay) {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        // 获取现有的标签和值的span
        let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

        // 如果找到了值span，只更新其内容
        if (valueSpan) {
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
        }

        // 如果找到了标签span并且i18next可用，更新翻译
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

    console.log('🎨 Toggling theme:', currentTheme, '->', newTheme);

    // 确保主题切换立即生效
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    // 验证主题是否成功应用
    setTimeout(() => {
        const appliedTheme = document.documentElement.getAttribute('data-theme');
        console.log('✅ Theme applied successfully:', appliedTheme);

        // 触发自定义事件通知主题变化
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { oldTheme: currentTheme, newTheme: appliedTheme }
        }));
    }, 50);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    console.log('🎨 Applying theme:', theme);

    // 立即应用主题属性
    document.documentElement.setAttribute('data-theme', theme);

    // 强制重新计算CSS变量，但不影响显示
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--background-primary');

    console.log('✅ Theme attribute set to:', document.documentElement.getAttribute('data-theme'));
    console.log('🎨 CSS variable --background-primary:', bgColor.trim());
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
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
            <h2>检测失败</h2>
            <p>无法检测设备信息，请刷新页面重试。</p>
            <button onclick="window.location.reload()">重试</button>
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

// 确保关键函数在全局作用域中可用（用于调试和兼容性）
if (typeof window !== 'undefined') {
    window.toggleTheme = toggleTheme;
    window.applyTheme = applyTheme;
    window.initializeTheme = initializeTheme;
    window.updateThemeIcon = updateThemeIcon;
    console.log('🌍 Theme functions exposed to global scope for compatibility');
} 