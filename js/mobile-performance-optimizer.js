// mobile-performance-optimizer.js - 移动端性能优化核心系统

/**
 * 移动端性能优化核心系统
 * 检测移动设备、评估设备能力、实现自适应优化策略
 */
class MobilePerformanceOptimizer {
    constructor(config = {}) {
        this.config = {
            enableDeviceDetection: true,
            enableNetworkAdaptation: true,
            enableLowEndOptimization: true,
            debugMode: false,
            ...config
        };

        // 设备信息
        this.deviceInfo = {
            isMobile: false,
            isTablet: false,
            isLowEnd: false,
            screenSize: 'unknown',
            orientation: 'unknown'
        };

        // 设备能力评估
        this.deviceCapabilities = {
            memory: 4,
            cores: 4,
            connectionType: 'unknown',
            downlink: 10,
            rtt: 100,
            saveData: false
        };

        // 优化级别
        this.optimizationLevel = 'light';

        // 优化策略配置
        this.optimizationStrategies = {
            aggressive: {
                maxConcurrentRequests: 2,
                imageQuality: 0.7,
                disableAnimations: true,
                simplifyUI: true,
                enableDataSaving: true,
                deferAllNonCritical: true
            },
            moderate: {
                maxConcurrentRequests: 4,
                imageQuality: 0.8,
                reduceAnimations: true,
                enableDataSaving: false,
                deferNonCritical: true
            },
            light: {
                maxConcurrentRequests: 6,
                imageQuality: 0.9,
                enablePreloading: true,
                enableDataSaving: false,
                deferNonCritical: false
            }
        };

        // 性能监控
        this.performanceMetrics = {
            initTime: 0,
            optimizationTime: 0,
            memoryUsage: 0,
            networkRequests: 0
        };

        // 与现有性能监控系统集成
        this.performanceMonitor = null;

        // 初始化
        this.initialize();
    }

    /**
     * 初始化移动端性能优化系统
     */
    async initialize() {
        const startTime = performance.now();

        try {
            console.log('🚀 Initializing Mobile Performance Optimizer...');

            // 检测移动设备
            await this.detectMobileDevice();

            // 评估设备能力
            await this.assessDeviceCapabilities();

            // 获取网络信息
            await this.getNetworkInfo();

            // 确定优化级别
            this.determineOptimizationLevel();

            // 应用移动端优化
            await this.applyMobileOptimizations();

            this.performanceMetrics.initTime = performance.now() - startTime;

            if (this.config.debugMode) {
                this.logOptimizationInfo();
            }

            // 集成现有性能监控系统
            this.integrateWithPerformanceMonitor();

            console.log(`✅ Mobile Performance Optimizer initialized in ${this.performanceMetrics.initTime.toFixed(2)}ms`);

        } catch (error) {
            console.error('❌ Error initializing Mobile Performance Optimizer:', error);
            // 降级到基础优化
            this.applyBasicMobileOptimizations();
        }
    }

    /**
     * 检测移动设备
     */
    async detectMobileDevice() {
        try {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = [
                'android', 'webos', 'iphone', 'ipad', 'ipod',
                'blackberry', 'iemobile', 'opera mini', 'mobile'
            ];

            const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
            const isMobileScreen = window.innerWidth <= 768;
            const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            this.deviceInfo.isMobile = isMobileUA || (isMobileScreen && hasTouchSupport);
            this.deviceInfo.isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
                (window.innerWidth >= 768 && window.innerWidth <= 1024 && hasTouchSupport);

            const screenWidth = window.innerWidth;
            if (screenWidth <= 480) {
                this.deviceInfo.screenSize = 'small';
            } else if (screenWidth <= 768) {
                this.deviceInfo.screenSize = 'medium';
            } else if (screenWidth <= 1024) {
                this.deviceInfo.screenSize = 'large';
            } else {
                this.deviceInfo.screenSize = 'xlarge';
            }

            this.deviceInfo.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

            console.log('📱 Device detection completed:', this.deviceInfo);
        } catch (error) {
            console.error('❌ Failed to detect mobile device:', error);
            this.deviceInfo.isMobile = window.innerWidth <= 768;
            this.deviceInfo.screenSize = window.innerWidth <= 480 ? 'small' : 'medium';
        }
    }

    /**
     * 评估设备能力
     */
    async assessDeviceCapabilities() {
        try {
            if ('deviceMemory' in navigator) {
                this.deviceCapabilities.memory = navigator.deviceMemory;
            } else {
                this.deviceCapabilities.memory = this.estimateDeviceMemory();
            }

            if ('hardwareConcurrency' in navigator) {
                this.deviceCapabilities.cores = navigator.hardwareConcurrency;
            }

            this.deviceInfo.isLowEnd = this.deviceCapabilities.memory < 4 ||
                this.deviceCapabilities.cores < 4 ||
                this.deviceInfo.screenSize === 'small';

            console.log('⚡ Device capabilities assessed:', this.deviceCapabilities);
        } catch (error) {
            console.error('❌ Failed to assess device capabilities:', error);
            return {
                memory: 4,
                cores: 4,
                connectionType: 'unknown',
                isLowEnd: false
            };
        }
    }

    /**
     * 估算设备内存
     */
    estimateDeviceMemory() {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes('iphone')) {
            if (userAgent.includes('iphone os 15') || userAgent.includes('iphone os 16')) {
                return 6;
            } else if (userAgent.includes('iphone os 13') || userAgent.includes('iphone os 14')) {
                return 4;
            } else {
                return 3;
            }
        } else if (userAgent.includes('android')) {
            if (userAgent.includes('android 11') || userAgent.includes('android 12') || userAgent.includes('android 13')) {
                return 6;
            } else if (userAgent.includes('android 9') || userAgent.includes('android 10')) {
                return 4;
            } else {
                return 3;
            }
        }

        return this.deviceInfo.isMobile ? 3 : 8;
    }

    /**
     * 获取网络信息
     */
    async getNetworkInfo() {
        try {
            const connection = navigator.connection ||
                navigator.mozConnection ||
                navigator.webkitConnection;

            if (connection) {
                this.deviceCapabilities.connectionType = connection.effectiveType || 'unknown';
                this.deviceCapabilities.downlink = connection.downlink || 10;
                this.deviceCapabilities.rtt = connection.rtt || 100;
                this.deviceCapabilities.saveData = connection.saveData || false;
            } else {
                this.estimateNetworkSpeed();
            }

            console.log('🌐 Network info obtained:', {
                type: this.deviceCapabilities.connectionType,
                downlink: this.deviceCapabilities.downlink,
                rtt: this.deviceCapabilities.rtt,
                saveData: this.deviceCapabilities.saveData
            });
        } catch (error) {
            console.error('❌ Failed to get network info:', error);
            return {
                connectionType: 'unknown',
                downlink: 10,
                rtt: 100,
                saveData: false
            };
        }
    }

    /**
     * 估算网络速度
     */
    estimateNetworkSpeed() {
        const startTime = performance.now();

        const testImage = new Image();
        testImage.onload = () => {
            const loadTime = performance.now() - startTime;

            if (loadTime < 100) {
                this.deviceCapabilities.connectionType = '4g';
                this.deviceCapabilities.downlink = 10;
            } else if (loadTime < 300) {
                this.deviceCapabilities.connectionType = '3g';
                this.deviceCapabilities.downlink = 1.5;
            } else {
                this.deviceCapabilities.connectionType = '2g';
                this.deviceCapabilities.downlink = 0.5;
            }
        };

        testImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    /**
     * 确定优化级别
     */
    determineOptimizationLevel() {
        try {
            const { connectionType, saveData } = this.deviceCapabilities;
            const { isLowEnd } = this.deviceInfo;

            if (saveData ||
                connectionType === 'slow-2g' ||
                connectionType === '2g' ||
                isLowEnd) {
                this.optimizationLevel = 'aggressive';
            }
            else if (connectionType === '3g' ||
                this.deviceCapabilities.memory < 6 ||
                this.deviceInfo.screenSize === 'small') {
                this.optimizationLevel = 'moderate';
            }
            else {
                this.optimizationLevel = 'light';
            }

            console.log(`🎯 Optimization level determined: ${this.optimizationLevel}`);
        } catch (error) {
            console.error('❌ Failed to determine optimization level:', error);
            return 'light';
        }
    }

    /**
     * 应用移动端优化
     */
    async applyMobileOptimizations() {
        try {
            // 更严格的设备检测，避免在桌面端错误应用移动优化
            const isRealMobileDevice = this.isRealMobileDevice();
            const isDesktopBrowser = this.isDesktopBrowser();
            
            if (isDesktopBrowser) {
                console.log('🖥️ Desktop browser detected, skipping all mobile optimizations');
                return;
            }

            if (!isRealMobileDevice && window.innerWidth > 768) {
                console.log('📱 Not a real mobile device and screen is large, skipping mobile optimizations');
                return;
            }

            if (this.isInDevToolsMobileMode()) {
                console.log('🔧 Developer tools mobile mode detected, applying limited optimizations');
                this.applyLimitedMobileOptimizations();
                return;
            }

            // 只在真正的移动设备上应用优化
            if (!isRealMobileDevice) {
                console.log('📱 Device detection uncertain, skipping mobile optimizations for safety');
                return;
            }

            const strategy = this.optimizationStrategies[this.optimizationLevel];
            console.log(`🔧 Applying ${this.optimizationLevel} mobile optimizations on verified mobile device...`);

            this.applyBasicMobileOptimizations();

            switch (this.optimizationLevel) {
                case 'aggressive':
                    await this.applyAggressiveOptimizations(strategy);
                    break;
                case 'moderate':
                    await this.applyModerateOptimizations(strategy);
                    break;
                case 'light':
                    await this.applyLightOptimizations(strategy);
                    break;
            }

            console.log('✅ Mobile optimizations applied successfully');
        } catch (error) {
            console.error('❌ Failed to apply mobile optimizations:', error);
            this.rollbackOptimizations();
        }
    }

    /**
     * 检测是否为真正的移动设备
     */
    isRealMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // 检查真实的移动设备标识
        const realMobilePatterns = [
            /android.*mobile/i,
            /iphone/i,
            /ipod/i,
            /blackberry/i,
            /iemobile/i,
            /opera mini/i,
            /mobile/i
        ];
        
        const hasRealMobileUA = realMobilePatterns.some(pattern => pattern.test(userAgent));
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const hasSmallScreen = window.innerWidth <= 768;
        
        // 必须同时满足：移动UA + 触摸支持 + 小屏幕
        return hasRealMobileUA && hasTouchSupport && hasSmallScreen;
    }

    /**
     * 检测是否为桌面浏览器
     */
    isDesktopBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // 桌面浏览器特征
        const desktopPatterns = [
            /windows nt/i,
            /macintosh/i,
            /linux.*x86/i,
            /chrome.*(?!mobile)/i,
            /firefox.*(?!mobile)/i,
            /safari.*(?!mobile)/i,
            /edge/i
        ];
        
        const hasDesktopUA = desktopPatterns.some(pattern => pattern.test(userAgent));
        const hasLargeScreen = window.innerWidth > 1024;
        const noTouchSupport = !('ontouchstart' in window) && navigator.maxTouchPoints === 0;
        
        // 桌面特征：桌面UA 或 (大屏幕 + 无触摸)
        return hasDesktopUA || (hasLargeScreen && noTouchSupport);
    }

    /**
     * 检测是否在开发者工具的移动模拟模式下
     */
    isInDevToolsMobileMode() {
        const userAgent = navigator.userAgent;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isSmallScreen = window.innerWidth <= 768;

        return !isMobileUA && isSmallScreen;
    }

    /**
     * 应用有限的移动优化（开发者工具模式）
     */
    applyLimitedMobileOptimizations() {
        console.log('🔧 Applying limited mobile optimizations for dev tools mode');

        document.documentElement.classList.add('mobile-optimized');
        document.documentElement.classList.add('dev-tools-mobile-mode');

        const style = document.createElement('style');
        style.setAttribute('data-mobile-optimizer', 'dev-tools-limited');
        style.textContent = `
            .dev-tools-mobile-mode * {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            
            .dev-tools-mobile-mode .container {
                max-width: 100%;
                padding: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 应用基础移动端优化
     */
    applyBasicMobileOptimizations() {
        try {
            this.optimizeViewport();
            this.optimizeTouchEvents();
            this.enableHardwareAcceleration();
            this.optimizeScrolling();

            document.documentElement.classList.add('mobile-optimized');

            if (this.deviceInfo.screenSize === 'small') {
                document.documentElement.classList.add('small-screen-optimized');
            } else if (this.deviceInfo.screenSize === 'medium') {
                document.documentElement.classList.add('medium-screen-optimized');
            }

            if (this.deviceInfo.isTablet) {
                document.documentElement.classList.add('tablet-device');
            }

            if (this.deviceInfo.isLowEnd) {
                document.documentElement.classList.add('low-end-device');
            }
        } catch (error) {
            console.error('❌ Failed to apply basic mobile optimizations:', error);
        }
    }

    /**
     * 应用激进优化
     */
    async applyAggressiveOptimizations(strategy) {
        try {
            console.log('🔥 Applying aggressive optimizations...');

            document.documentElement.classList.add('reduce-motion', 'disable-animations');
            this.simplifyUI();
            this.enableDataSavingMode();
            this.deferAllNonCriticalResources();
            this.limitConcurrentRequests(strategy.maxConcurrentRequests);
            this.optimizeImageQuality(strategy.imageQuality);
            this.disableNonEssentialFeatures();
        } catch (error) {
            console.error('❌ Failed to apply aggressive optimizations:', error);
        }
    }

    /**
     * 应用中等优化
     */
    async applyModerateOptimizations(strategy) {
        try {
            console.log('⚡ Applying moderate optimizations...');

            document.documentElement.classList.add('reduce-animations');
            this.deferNonCriticalResources();
            this.limitConcurrentRequests(strategy.maxConcurrentRequests);
            this.optimizeImageQuality(strategy.imageQuality);
            this.enableLazyLoading();
        } catch (error) {
            console.error('❌ Failed to apply moderate optimizations:', error);
        }
    }

    /**
     * 应用轻度优化
     */
    async applyLightOptimizations(strategy) {
        try {
            console.log('💨 Applying light optimizations...');

            this.preloadCriticalResources();
            this.enableResourcePrefetching();
            this.optimizeCaching();
        } catch (error) {
            console.error('❌ Failed to apply light optimizations:', error);
        }
    }

    /**
     * 优化视口配置
     */
    optimizeViewport() {
        try {
            // 只在真正的移动设备上优化视口
            if (!this.isRealMobileDevice()) {
                console.log('📐 Not a real mobile device, skipping viewport optimization');
                return;
            }

            let viewport = document.querySelector('meta[name="viewport"]');

            if (viewport && viewport.content && viewport.content.includes('width=device-width')) {
                console.log('📐 Viewport already configured properly, no changes needed');
                return;
            }

            if (!viewport) {
                viewport = document.createElement('meta');
                viewport.name = 'viewport';
                document.head.appendChild(viewport);
            }

            let viewportContent = 'width=device-width, initial-scale=1';

            // 只在低端设备上限制缩放
            if (this.deviceInfo.isLowEnd && this.deviceCapabilities.memory < 2) {
                viewportContent += ', user-scalable=no, maximum-scale=1, minimum-scale=1';
            }

            viewportContent += ', viewport-fit=cover';
            viewport.content = viewportContent;

            console.log('📐 Viewport optimized for mobile device:', viewportContent);
        } catch (error) {
            console.error('❌ Failed to optimize viewport:', error);
        }
    }

    /**
     * 优化触摸事件
     */
    optimizeTouchEvents() {
        try {
            const style = document.createElement('style');
            style.setAttribute('data-mobile-optimizer', 'touch-events');
            style.textContent = `
                * {
                    touch-action: manipulation;
                }
                
                a, button, input, select, textarea, [role="button"] {
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .scrollable, .overflow-auto, .overflow-scroll {
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }
            `;
            document.head.appendChild(style);

            const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];
            passiveEvents.forEach(eventType => {
                document.addEventListener(eventType, () => { }, { passive: true });
            });

            console.log('👆 Touch events optimized');
        } catch (error) {
            console.error('❌ Failed to optimize touch interactions:', error);
        }
    }

    /**
     * 启用硬件加速
     */
    enableHardwareAcceleration() {
        try {
            const style = document.createElement('style');
            style.setAttribute('data-mobile-optimizer', 'hardware-acceleration');
            style.textContent = `
                .mobile-optimized .mobile-hw-accelerated {
                    transform: translateZ(0);
                    will-change: transform;
                    backface-visibility: hidden;
                }
                
                .mobile-optimized .mobile-animated {
                    transform: translate3d(0, 0, 0);
                    animation-fill-mode: both;
                }
                
                .low-end-device .mobile-animated,
                .low-end-device .animated {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(style);

            console.log('🚀 Hardware acceleration enabled');
        } catch (error) {
            console.error('❌ Failed to apply hardware acceleration:', error);
        }
    }

    /**
     * 优化滚动性能
     */
    optimizeScrolling() {
        try {
            if (!this.deviceInfo.isLowEnd) {
                document.documentElement.style.scrollBehavior = 'smooth';
            }

            const scrollContainers = document.querySelectorAll('.scrollable, .overflow-auto');
            scrollContainers.forEach(container => {
                container.style.webkitOverflowScrolling = 'touch';
                container.style.overscrollBehavior = 'contain';
            });

            const style = document.createElement('style');
            style.setAttribute('data-mobile-optimizer', 'scrolling');
            style.textContent = `
                body {
                    overscroll-behavior-y: none;
                }
                
                .scroll-container {
                    contain: layout style paint;
                    overflow-anchor: none;
                }
                
                .low-end-device * {
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);

            console.log('📜 Scrolling optimized');
        } catch (error) {
            console.error('❌ Failed to optimize scrolling:', error);
        }
    }

    /**
     * 简化UI
     */
    simplifyUI() {
        document.documentElement.classList.add('simplified-ui');

        const style = document.createElement('style');
        style.setAttribute('data-mobile-optimizer', 'simplified-ui');
        style.textContent = `
            .simplified-ui .decorative-element,
            .simplified-ui .non-essential-animation,
            .simplified-ui .complex-shadow {
                display: none !important;
            }
            
            .simplified-ui .info-card {
                box-shadow: none !important;
                border: 1px solid #e0e0e0;
            }
            
            .simplified-ui .gradient-background {
                background: #f5f5f5 !important;
            }
        `;
        document.head.appendChild(style);

        console.log('🎨 UI simplified for low-end devices');
    }

    /**
     * 启用数据节省模式
     */
    enableDataSavingMode() {
        document.documentElement.classList.add('data-saving-mode');

        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(media => {
            media.preload = 'none';
            media.autoplay = false;
        });

        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.loading) {
                img.loading = 'lazy';
            }
        });

        console.log('💾 Data saving mode enabled');
    }

    /**
     * 延迟非关键资源
     */
    deferNonCriticalResources() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][href*="blog"], link[rel="stylesheet"][href*="simulator"]');
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = function () {
                this.media = 'all';
            };
        });

        console.log('⏳ Non-critical resources deferred (moderate)');
    }

    /**
     * 启用资源预取
     */
    enableResourcePrefetching() {
        const prefetchResources = [
            'css/blog.css',
            'css/simulator.css'
        ];

        prefetchResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });

        console.log('🔮 Resource prefetching enabled');
    }

    /**
     * 优化缓存策略
     */
    optimizeCaching() {
        window.cacheOptimizationEnabled = true;
        console.log('💾 Caching optimized');
    }

    /**
     * 延迟所有非关键资源
     */
    deferAllNonCriticalResources() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = function () {
                this.media = 'all';
            };
        });

        const nonCriticalJS = document.querySelectorAll('script:not([data-critical])');
        nonCriticalJS.forEach(script => {
            if (!script.async && !script.defer) {
                script.defer = true;
            }
        });

        console.log('⏳ Non-critical resources deferred');
    }

    /**
     * 限制并发请求数量
     */
    limitConcurrentRequests(maxRequests) {
        window.maxConcurrentRequests = maxRequests;
        console.log(`🚦 Concurrent requests limited to: ${maxRequests}`);
    }

    /**
     * 优化图片质量
     */
    optimizeImageQuality(quality) {
        window.imageQuality = quality;

        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.dataset.quality = quality;
        });

        console.log(`🖼️ Image quality optimized to: ${quality}`);
    }

    /**
     * 禁用非必要功能
     */
    disableNonEssentialFeatures() {
        document.documentElement.classList.add('minimal-features');

        const autoRefreshElements = document.querySelectorAll('[data-auto-refresh]');
        autoRefreshElements.forEach(element => {
            element.removeAttribute('data-auto-refresh');
        });

        console.log('🚫 Non-essential features disabled');
    }

    /**
     * 启用懒加载
     */
    enableLazyLoading() {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });

        const iframes = document.querySelectorAll('iframe:not([loading])');
        iframes.forEach(iframe => {
            iframe.loading = 'lazy';
        });

        console.log('🔄 Lazy loading enabled');
    }

    /**
     * 预加载关键资源
     */
    preloadCriticalResources() {
        const criticalResources = [
            'css/base.css',
            'css/main.css',
            'js/app.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';

            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            }

            link.href = resource;
            document.head.appendChild(link);
        });

        console.log('⚡ Critical resources preloaded');
    }

    /**
     * 回滚优化
     */
    rollbackOptimizations() {
        try {
            const problematicClasses = [
                'mobile-optimized', 'low-end-device', 'reduce-motion',
                'disable-animations', 'simplified-ui', 'data-saving-mode'
            ];

            problematicClasses.forEach(className => {
                document.documentElement.classList.remove(className);
            });

            const optimizerStyles = document.querySelectorAll('style[data-mobile-optimizer]');
            optimizerStyles.forEach(style => {
                style.remove();
            });

            console.log('🔄 Mobile optimizations rolled back');
        } catch (error) {
            console.error('❌ Failed to rollback optimizations:', error);
        }
    }

    /**
     * 获取优化状态
     */
    getOptimizationStatus() {
        try {
            return {
                isActive: document.documentElement.classList.contains('mobile-optimized'),
                level: this.optimizationLevel,
                deviceInfo: this.deviceInfo,
                capabilities: this.deviceCapabilities,
                metrics: this.performanceMetrics
            };
        } catch (error) {
            console.error('❌ Failed to get optimization status:', error);
            return {
                isActive: false,
                level: 'unknown',
                error: error.message
            };
        }
    }

    /**
     * 更新性能指标
     */
    updatePerformanceMetrics() {
        try {
            if ('memory' in performance) {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
            }

            if ('getEntriesByType' in performance) {
                const resourceEntries = performance.getEntriesByType('resource');
                this.performanceMetrics.networkRequests = resourceEntries.length;
            }

            this.performanceMetrics.optimizationTime = performance.now() - this.performanceMetrics.initTime;
        } catch (error) {
            console.error('❌ Failed to update performance metrics:', error);
        }
    }

    /**
     * 记录性能数据
     */
    logPerformanceData() {
        try {
            if (this.config.debugMode) {
                console.group('📊 Mobile Performance Optimizer Status');
                console.log('Device Info:', this.deviceInfo);
                console.log('Capabilities:', this.deviceCapabilities);
                console.log('Optimization Level:', this.optimizationLevel);
                console.log('Performance Metrics:', this.performanceMetrics);
                console.groupEnd();
            }

            if (this.performanceMonitor) {
                this.performanceMonitor.recordCustomMetric('mobileOptimizationLevel', this.optimizationLevel);
                this.performanceMonitor.recordCustomMetric('mobileDeviceMemory', this.deviceCapabilities.memory);
                this.performanceMonitor.recordCustomMetric('mobileConnectionType', this.deviceCapabilities.connectionType);
            }
        } catch (error) {
            console.error('❌ Failed to log performance data:', error);
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        try {
            console.log('🧹 Mobile Performance Optimizer cleaned up');
        } catch (error) {
            console.error('❌ Failed to cleanup resources:', error);
        }
    }

    /**
     * 集成现有性能监控系统
     */
    integrateWithPerformanceMonitor() {
        if (window.performanceMonitor) {
            this.performanceMonitor = window.performanceMonitor;
            console.log('🔗 Integrated with existing performance monitor');
        }
    }

    /**
     * 记录优化信息
     */
    logOptimizationInfo() {
        console.group('🚀 Mobile Performance Optimizer Status');
        console.log('Device Info:', this.deviceInfo);
        console.log('Capabilities:', this.deviceCapabilities);
        console.log('Optimization Level:', this.optimizationLevel);
        console.log('Performance Metrics:', this.performanceMetrics);
        console.groupEnd();
    }
}

// 导出函数供其他模块使用
window.MobilePerformanceOptimizer = MobilePerformanceOptimizer;

// 创建全局实例
if (typeof window !== 'undefined') {
    window.mobilePerformanceOptimizer = new MobilePerformanceOptimizer({
        debugMode: false
    });
}

// 导出优化状态检查函数
window.getMobileOptimizationStatus = function() {
    if (window.mobilePerformanceOptimizer) {
        return window.mobilePerformanceOptimizer.getOptimizationStatus();
    }
    return { isActive: false, error: 'Mobile optimizer not initialized' };
};

// 导出设备检测函数
window.isMobileDevice = function() {
    if (window.mobilePerformanceOptimizer) {
        return window.mobilePerformanceOptimizer.isRealMobileDevice();
    }
    
    // 简单的后备检测
    const userAgent = navigator.userAgent.toLowerCase();
    const mobilePatterns = [/android.*mobile/i, /iphone/i, /ipod/i, /mobile/i];
    const hasMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
    const hasSmallScreen = window.innerWidth <= 768;
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return hasMobileUA && hasSmallScreen && hasTouchSupport;
};

// 导出桌面检测函数
window.isDesktopBrowser = function() {
    if (window.mobilePerformanceOptimizer) {
        return window.mobilePerformanceOptimizer.isDesktopBrowser();
    }
    
    // 简单的后备检测
    const userAgent = navigator.userAgent.toLowerCase();
    const desktopPatterns = [/windows nt/i, /macintosh/i, /linux.*x86/i];
    const hasDesktopUA = desktopPatterns.some(pattern => pattern.test(userAgent));
    const hasLargeScreen = window.innerWidth > 1024;
    const noTouchSupport = !('ontouchstart' in window) && navigator.maxTouchPoints === 0;
    
    return hasDesktopUA || (hasLargeScreen && noTouchSupport);
};

// console.log('📱 Mobile Performance Optimizer module loaded successfully'); Debug Info');
//         console.log('Configuration:', this.config);
//         console.log('Device Detection:', this.deviceInfo);
//         console.log('Device Capabilities:', this.deviceCapabilities);
//         console.log('Optimization Level:', this.optimizationLevel);
//         console.log('Applied Strategy:', this.optimizationStrategies[this.optimizationLevel]);
//         console.groupEnd();
//     }
// }

/**
 * 初始化移动端优化的导出函数
 */
export function initializeMobileOptimization(config = {}) {
    try {
        if (typeof window === 'undefined') {
            console.warn('⚠️ Mobile optimization requires browser environment');
            return null;
        }

        // 避免重复初始化
        if (window.mobilePerformanceOptimizer) {
            console.log('📱 Mobile Performance Optimizer already initialized');
            return window.mobilePerformanceOptimizer;
        }

        const optimizer = new MobilePerformanceOptimizer({
            debugMode: window.location.search.includes('debug=mobile'),
            ...config
        });

        window.mobilePerformanceOptimizer = optimizer;
        console.log('✅ Mobile Performance Optimizer initialized via export');
        return optimizer;
    } catch (error) {
        console.error('❌ Failed to initialize mobile optimization:', error);
        return null;
    }
}

// 自动初始化移动端性能优化器（保持向后兼容）
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.mobilePerformanceOptimizer) {
                initializeMobileOptimization();
            }
        });
    } else {
        if (!window.mobilePerformanceOptimizer) {
            initializeMobileOptimization();
        }
    }
}

// 导出类和函数
export { MobilePerformanceOptimizer };
export default MobilePerformanceOptimizer;