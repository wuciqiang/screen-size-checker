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
            memory: 4, // GB
            cores: 4,
            connectionType: 'unknown',
            downlink: 10, // Mbps
            rtt: 100, // ms
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
        // 基于用户代理的检测
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 
            'blackberry', 'iemobile', 'opera mini', 'mobile'
        ];
        
        this.deviceInfo.isMobile = mobileKeywords.some(keyword => 
            userAgent.includes(keyword)
        ) || window.innerWidth <= 768;
        
        // 检测平板设备
        this.deviceInfo.isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
            (window.innerWidth >= 768 && window.innerWidth <= 1024);
        
        // 屏幕尺寸分类
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
        
        // 检测屏幕方向
        this.deviceInfo.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        // 监听方向变化
        if ('orientation' in window) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.deviceInfo.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
                    this.handleOrientationChange();
                }, 100);
            });
        }
        
        console.log('📱 Device detection completed:', this.deviceInfo);
    }
    
    /**
     * 评估设备能力
     */
    async assessDeviceCapabilities() {
        // 内存信息
        if ('deviceMemory' in navigator) {
            this.deviceCapabilities.memory = navigator.deviceMemory;
        } else {
            // 基于其他指标估算内存
            this.deviceCapabilities.memory = this.estimateDeviceMemory();
        }
        
        // CPU核心数
        if ('hardwareConcurrency' in navigator) {
            this.deviceCapabilities.cores = navigator.hardwareConcurrency;
        }
        
        // 判断是否为低端设备
        this.deviceInfo.isLowEnd = this.deviceCapabilities.memory < 4 || 
                                   this.deviceCapabilities.cores < 4 ||
                                   this.deviceInfo.screenSize === 'small';
        
        console.log('⚡ Device capabilities assessed:', this.deviceCapabilities);
    }
    
    /**
     * 估算设备内存（当navigator.deviceMemory不可用时）
     */
    estimateDeviceMemory() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // 基于设备类型和用户代理估算
        if (userAgent.includes('iphone')) {
            // iPhone内存估算
            if (userAgent.includes('iphone os 15') || userAgent.includes('iphone os 16')) {
                return 6; // 较新的iPhone通常有6GB+
            } else if (userAgent.includes('iphone os 13') || userAgent.includes('iphone os 14')) {
                return 4;
            } else {
                return 3;
            }
        } else if (userAgent.includes('android')) {
            // Android设备内存估算
            if (userAgent.includes('android 11') || userAgent.includes('android 12') || userAgent.includes('android 13')) {
                return 6; // 较新的Android设备
            } else if (userAgent.includes('android 9') || userAgent.includes('android 10')) {
                return 4;
            } else {
                return 3;
            }
        }
        
        // 默认估算值
        return this.deviceInfo.isMobile ? 3 : 8;
    }
    
    /**
     * 获取网络信息
     */
    async getNetworkInfo() {
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;
        
        if (connection) {
            this.deviceCapabilities.connectionType = connection.effectiveType || 'unknown';
            this.deviceCapabilities.downlink = connection.downlink || 10;
            this.deviceCapabilities.rtt = connection.rtt || 100;
            this.deviceCapabilities.saveData = connection.saveData || false;
            
            // 监听网络变化
            connection.addEventListener('change', () => {
                this.handleNetworkChange();
            });
        } else {
            // 降级检测：基于加载时间估算网络速度
            this.estimateNetworkSpeed();
        }
        
        console.log('🌐 Network info obtained:', {
            type: this.deviceCapabilities.connectionType,
            downlink: this.deviceCapabilities.downlink,
            rtt: this.deviceCapabilities.rtt,
            saveData: this.deviceCapabilities.saveData
        });
    }
    
    /**
     * 估算网络速度（当Network Information API不可用时）
     */
    estimateNetworkSpeed() {
        const startTime = performance.now();
        
        // 创建一个小的测试图片来估算网络速度
        const testImage = new Image();
        testImage.onload = () => {
            const loadTime = performance.now() - startTime;
            
            // 基于加载时间估算连接类型
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
        
        // 使用一个小的1x1像素图片进行测试
        testImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
    
    /**
     * 确定优化级别
     */
    determineOptimizationLevel() {
        const { connectionType, saveData } = this.deviceCapabilities;
        const { isLowEnd } = this.deviceInfo;
        
        // 激进优化条件
        if (saveData || 
            connectionType === 'slow-2g' || 
            connectionType === '2g' ||
            isLowEnd) {
            this.optimizationLevel = 'aggressive';
        }
        // 中等优化条件
        else if (connectionType === '3g' || 
                 this.deviceCapabilities.memory < 6 ||
                 this.deviceInfo.screenSize === 'small') {
            this.optimizationLevel = 'moderate';
        }
        // 轻度优化
        else {
            this.optimizationLevel = 'light';
        }
        
        console.log(`🎯 Optimization level determined: ${this.optimizationLevel}`);
    }
    
    /**
     * 应用移动端优化
     */
    async applyMobileOptimizations() {
        if (!this.deviceInfo.isMobile && !this.deviceInfo.isTablet) {
            console.log('📱 Not a mobile device, skipping mobile optimizations');
            return;
        }
        
        const strategy = this.optimizationStrategies[this.optimizationLevel];
        console.log(`🔧 Applying ${this.optimizationLevel} mobile optimizations...`);
        
        // 应用基础移动端优化
        this.applyBasicMobileOptimizations();
        
        // 根据优化级别应用特定优化
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
        
        // 设置资源加载策略
        this.configureResourceLoading(strategy);
        
        // 优化事件处理
        this.optimizeEventHandling();
        
        console.log('✅ Mobile optimizations applied successfully');
    }
    
    /**
     * 应用基础移动端优化
     */
    applyBasicMobileOptimizations() {
        // 优化视口配置
        this.optimizeViewport();
        
        // 优化触摸事件
        this.optimizeTouchEvents();
        
        // 启用硬件加速
        this.enableHardwareAcceleration();
        
        // 优化滚动性能
        this.optimizeScrolling();
        
        // 添加移动端CSS类
        document.documentElement.classList.add('mobile-optimized');
        
        if (this.deviceInfo.isTablet) {
            document.documentElement.classList.add('tablet-device');
        }
        
        if (this.deviceInfo.isLowEnd) {
            document.documentElement.classList.add('low-end-device');
        }
    }
    
    /**
     * 应用激进优化（低端设备/慢网络）
     */
    async applyAggressiveOptimizations(strategy) {
        console.log('🔥 Applying aggressive optimizations...');
        
        // 禁用动画
        document.documentElement.classList.add('reduce-motion', 'disable-animations');
        
        // 简化UI
        this.simplifyUI();
        
        // 启用数据节省模式
        this.enableDataSavingMode();
        
        // 延迟所有非关键资源
        this.deferAllNonCriticalResources();
        
        // 限制并发请求
        this.limitConcurrentRequests(strategy.maxConcurrentRequests);
        
        // 降低图片质量
        this.optimizeImageQuality(strategy.imageQuality);
        
        // 禁用非必要功能
        this.disableNonEssentialFeatures();
    }
    
    /**
     * 应用中等优化
     */
    async applyModerateOptimizations(strategy) {
        console.log('⚡ Applying moderate optimizations...');
        
        // 减少动画复杂度
        document.documentElement.classList.add('reduce-animations');
        
        // 延迟部分非关键资源
        this.deferNonCriticalResources();
        
        // 限制并发请求
        this.limitConcurrentRequests(strategy.maxConcurrentRequests);
        
        // 优化图片质量
        this.optimizeImageQuality(strategy.imageQuality);
        
        // 启用懒加载
        this.enableLazyLoading();
    }
    
    /**
     * 应用轻度优化
     */
    async applyLightOptimizations(strategy) {
        console.log('💨 Applying light optimizations...');
        
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 启用预取
        this.enableResourcePrefetching();
        
        // 优化缓存策略
        this.optimizeCaching();
    }
    
    /**
     * 优化视口配置
     */
    optimizeViewport() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // 根据设备类型设置不同的视口配置
        let viewportContent = 'width=device-width, initial-scale=1';
        
        if (this.deviceInfo.isLowEnd) {
            // 低端设备禁用缩放以提高性能
            viewportContent += ', user-scalable=no, maximum-scale=1, minimum-scale=1';
        } else {
            // 允许适度缩放
            viewportContent += ', maximum-scale=2, minimum-scale=0.5';
        }
        
        // 添加viewport-fit支持（iPhone X等设备）
        viewportContent += ', viewport-fit=cover';
        
        viewport.content = viewportContent;
        
        console.log('📐 Viewport optimized:', viewportContent);
    }
    
    /**
     * 优化触摸事件
     */
    optimizeTouchEvents() {
        // 设置touch-action样式
        const style = document.createElement('style');
        style.textContent = `
            /* 优化触摸事件性能 */
            * {
                touch-action: manipulation;
            }
            
            /* 消除点击延迟 */
            a, button, input, select, textarea, [role="button"] {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            
            /* 优化滚动区域 */
            .scrollable, .overflow-auto, .overflow-scroll {
                -webkit-overflow-scrolling: touch;
                overscroll-behavior: contain;
            }
        `;
        document.head.appendChild(style);
        
        // 使用passive事件监听器
        const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];
        passiveEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {}, { passive: true });
        });
        
        console.log('👆 Touch events optimized');
    }
    
    /**
     * 启用硬件加速
     */
    enableHardwareAcceleration() {
        const style = document.createElement('style');
        style.textContent = `
            /* 启用硬件加速 */
            .info-card,
            .tool-card,
            .hero-section,
            .fade-in,
            .slide-in {
                transform: translateZ(0);
                will-change: transform;
                backface-visibility: hidden;
            }
            
            /* 优化动画性能 */
            .animated {
                transform: translate3d(0, 0, 0);
                animation-fill-mode: both;
            }
            
            /* 低端设备优化 */
            .low-end-device .animated {
                animation: none !important;
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('🚀 Hardware acceleration enabled');
    }
    
    /**
     * 优化滚动性能
     */
    optimizeScrolling() {
        // 启用平滑滚动（仅在非低端设备上）
        if (!this.deviceInfo.isLowEnd) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
        
        // 优化滚动容器
        const scrollContainers = document.querySelectorAll('.scrollable, .overflow-auto');
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
            container.style.overscrollBehavior = 'contain';
        });
        
        // 添加滚动优化样式
        const style = document.createElement('style');
        style.textContent = `
            /* 滚动性能优化 */
            body {
                overscroll-behavior-y: none;
            }
            
            .scroll-container {
                contain: layout style paint;
                overflow-anchor: none;
            }
            
            /* 低端设备禁用平滑滚动 */
            .low-end-device * {
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('📜 Scrolling optimized');
    }
    
    /**
     * 简化UI（激进优化）
     */
    simplifyUI() {
        document.documentElement.classList.add('simplified-ui');
        
        const style = document.createElement('style');
        style.textContent = `
            /* 简化UI样式 */
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
        
        // 禁用自动播放媒体
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(media => {
            media.preload = 'none';
            media.autoplay = false;
        });
        
        // 延迟加载所有图片
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.loading) {
                img.loading = 'lazy';
            }
        });
        
        console.log('💾 Data saving mode enabled');
    }
    
    /**
     * 配置资源加载策略
     */
    configureResourceLoading(strategy) {
        // 设置全局资源加载配置
        window.mobileOptimizationConfig = {
            maxConcurrentRequests: strategy.maxConcurrentRequests,
            imageQuality: strategy.imageQuality,
            enablePreloading: strategy.enablePreloading || false,
            deferNonCritical: strategy.deferNonCritical || false
        };
        
        // 通知其他优化系统
        if (window.resourceLoadingOptimizer) {
            window.resourceLoadingOptimizer.updateConfig(window.mobileOptimizationConfig);
        }
        
        console.log('📦 Resource loading strategy configured:', strategy);
    }
    
    /**
     * 优化事件处理
     */
    optimizeEventHandling() {
        // 使用事件委托减少事件监听器数量
        document.addEventListener('click', this.handleDelegatedClick.bind(this), { passive: false });
        document.addEventListener('touchstart', this.handleDelegatedTouch.bind(this), { passive: true });
        
        // 优化resize事件
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        }, { passive: true });
        
        console.log('🎯 Event handling optimized');
    }
    
    /**
     * 处理委托点击事件
     */
    handleDelegatedClick(event) {
        const target = event.target.closest('[data-mobile-optimized]');
        if (target) {
            // 添加触觉反馈（如果支持）
            if ('vibrate' in navigator && this.deviceInfo.isMobile) {
                navigator.vibrate(10);
            }
        }
    }
    
    /**
     * 处理委托触摸事件
     */
    handleDelegatedTouch(event) {
        // 为触摸元素添加视觉反馈
        const target = event.target.closest('button, a, [role="button"]');
        if (target && !target.classList.contains('no-touch-feedback')) {
            target.classList.add('touch-active');
            setTimeout(() => {
                target.classList.remove('touch-active');
            }, 150);
        }
    }
    
    /**
     * 处理屏幕方向变化
     */
    handleOrientationChange() {
        console.log('📱 Orientation changed to:', this.deviceInfo.orientation);
        
        // 重新评估优化策略
        setTimeout(() => {
            this.determineOptimizationLevel();
            this.applyOrientationOptimizations();
        }, 100);
    }
    
    /**
     * 应用方向相关优化
     */
    applyOrientationOptimizations() {
        const isPortrait = this.deviceInfo.orientation === 'portrait';
        
        document.documentElement.classList.toggle('portrait-mode', isPortrait);
        document.documentElement.classList.toggle('landscape-mode', !isPortrait);
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('mobileOrientationChange', {
            detail: { orientation: this.deviceInfo.orientation }
        }));
    }
    
    /**
     * 处理网络变化
     */
    handleNetworkChange() {
        console.log('🌐 Network conditions changed');
        
        // 重新获取网络信息
        this.getNetworkInfo().then(() => {
            // 重新确定优化级别
            const oldLevel = this.optimizationLevel;
            this.determineOptimizationLevel();
            
            // 如果优化级别发生变化，重新应用优化
            if (oldLevel !== this.optimizationLevel) {
                console.log(`🔄 Optimization level changed: ${oldLevel} → ${this.optimizationLevel}`);
                this.applyMobileOptimizations();
            }
        });
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 重新检测屏幕尺寸
        const oldScreenSize = this.deviceInfo.screenSize;
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
        
        // 如果屏幕尺寸分类发生变化，重新应用优化
        if (oldScreenSize !== this.deviceInfo.screenSize) {
            console.log(`📏 Screen size changed: ${oldScreenSize} → ${this.deviceInfo.screenSize}`);
            this.determineOptimizationLevel();
            this.applyMobileOptimizations();
        }
    }
    
    /**
     * 限制并发请求数量
     */
    limitConcurrentRequests(maxRequests) {
        // 设置全局配置供其他模块使用
        window.maxConcurrentRequests = maxRequests;
        
        console.log(`🚦 Concurrent requests limited to: ${maxRequests}`);
    }
    
    /**
     * 优化图片质量
     */
    optimizeImageQuality(quality) {
        // 设置全局图片质量配置
        window.imageQuality = quality;
        
        // 为现有图片添加质量优化标记
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.dataset.quality = quality;
        });
        
        console.log(`🖼️ Image quality optimized to: ${quality}`);
    }
    
    /**
     * 启用懒加载
     */
    enableLazyLoading() {
        // 为所有图片启用懒加载
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });
        
        // 为iframe启用懒加载
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
     * 延迟所有非关键资源
     */
    deferAllNonCriticalResources() {
        // 延迟非关键CSS
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
        });
        
        // 延迟非关键JavaScript
        const nonCriticalJS = document.querySelectorAll('script:not([data-critical])');
        nonCriticalJS.forEach(script => {
            if (!script.async && !script.defer) {
                script.defer = true;
            }
        });
        
        console.log('⏳ Non-critical resources deferred');
    }
    
    /**
     * 延迟非关键资源
     */
    deferNonCriticalResources() {
        // 中等程度的资源延迟
        const deferredResources = [
            'css/blog.css',
            'css/simulator.css',
            'js/blog.js',
            'js/simulator.js'
        ];
        
        // 使用requestIdleCallback延迟加载
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadDeferredResources(deferredResources);
            });
        } else {
            setTimeout(() => {
                this.loadDeferredResources(deferredResources);
            }, 2000);
        }
        
        console.log('⏱️ Non-critical resources deferred');
    }
    
    /**
     * 加载延迟的资源
     */
    loadDeferredResources(resources) {
        resources.forEach(resource => {
            if (resource.endsWith('.css')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = resource;
                document.head.appendChild(link);
            } else if (resource.endsWith('.js')) {
                const script = document.createElement('script');
                script.src = resource;
                script.async = true;
                document.head.appendChild(script);
            }
        });
    }
    
    /**
     * 禁用非必要功能
     */
    disableNonEssentialFeatures() {
        // 禁用自动完成
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (!input.hasAttribute('autocomplete')) {
                input.autocomplete = 'off';
            }
        });
        
        // 禁用拼写检查
        const textElements = document.querySelectorAll('input[type="text"], textarea');
        textElements.forEach(element => {
            element.spellcheck = false;
        });
        
        console.log('🚫 Non-essential features disabled');
    }
    
    /**
     * 启用资源预取
     */
    enableResourcePrefetching() {
        // 预取可能需要的资源
        const prefetchResources = [
            '/devices/compare',
            '/devices/ppi-calculator',
            'css/comparison.css'
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
        // 设置Service Worker缓存策略（如果可用）
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                // 发送缓存优化配置
                registration.active?.postMessage({
                    type: 'OPTIMIZE_CACHE',
                    config: {
                        strategy: this.optimizationLevel,
                        deviceType: this.deviceInfo.isMobile ? 'mobile' : 'desktop'
                    }
                });
            });
        }
        
        console.log('💾 Caching strategy optimized');
    }
    
    /**
     * 集成现有性能监控系统
     */
    integrateWithPerformanceMonitor() {
        try {
            // 尝试获取现有的性能监控器
            if (window.performanceMonitor) {
                this.performanceMonitor = window.performanceMonitor;
                
                // 记录移动端优化指标
                this.performanceMonitor.recordCustomMetric('mobileOptimizationInitTime', this.performanceMetrics.initTime);
                this.performanceMonitor.recordCustomMetric('mobileOptimizationLevel', this.optimizationLevel);
                this.performanceMonitor.recordCustomMetric('isMobileDevice', this.deviceInfo.isMobile);
                this.performanceMonitor.recordCustomMetric('isLowEndDevice', this.deviceInfo.isLowEnd);
                this.performanceMonitor.recordCustomMetric('deviceMemory', this.deviceCapabilities.memory);
                this.performanceMonitor.recordCustomMetric('networkType', this.deviceCapabilities.connectionType);
                
                console.log('✅ Integrated with existing performance monitor');
            } else {
                console.log('⚠️ Performance monitor not available, mobile optimizer running independently');
            }
        } catch (error) {
            console.warn('⚠️ Failed to integrate with performance monitor:', error);
        }
    }
    
    /**
     * 记录移动端性能指标
     */
    recordMobileMetric(name, value) {
        if (this.performanceMonitor && this.performanceMonitor.recordCustomMetric) {
            this.performanceMonitor.recordCustomMetric(`mobile_${name}`, value);
        }
        
        // 同时记录到本地指标
        this.performanceMetrics[name] = value;
    }
    
    /**
     * 记录优化信息（调试模式）
     */
    logOptimizationInfo() {
        console.group('📊 Mobile Performance Optimization Info');
        console.log('Device Info:', this.deviceInfo);
        console.log('Device Capabilities:', this.deviceCapabilities);
        console.log('Optimization Level:', this.optimizationLevel);
        console.log('Performance Metrics:', this.performanceMetrics);
        console.groupEnd();
    }
    
    /**
     * 获取优化状态
     */
    getOptimizationStatus() {
        return {
            deviceInfo: this.deviceInfo,
            deviceCapabilities: this.deviceCapabilities,
            optimizationLevel: this.optimizationLevel,
            performanceMetrics: this.performanceMetrics,
            isOptimized: true
        };
    }
    
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // 重新应用优化
        if (newConfig.enableDeviceDetection !== undefined || 
            newConfig.enableNetworkAdaptation !== undefined) {
            this.initialize();
        }
    }
    
    /**
     * 销毁优化器
     */
    destroy() {
        // 移除事件监听器
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleResize);
        
        // 清理全局配置
        delete window.mobileOptimizationConfig;
        delete window.maxConcurrentRequests;
        delete window.imageQuality;
        
        console.log('🗑️ Mobile Performance Optimizer destroyed');
    }
}

// 导出类
export { MobilePerformanceOptimizer };

// 创建全局实例
let mobileOptimizer = null;

/**
 * 初始化移动端性能优化
 */
export function initializeMobileOptimization(config = {}) {
    if (!mobileOptimizer) {
        mobileOptimizer = new MobilePerformanceOptimizer(config);
        
        // 设置全局引用
        window.mobilePerformanceOptimizer = mobileOptimizer;
    }
    
    return mobileOptimizer;
}

/**
 * 获取移动端优化器实例
 */
export function getMobileOptimizer() {
    return mobileOptimizer;
}

/**
 * 检查是否为移动设备
 */
export function isMobileDevice() {
    return mobileOptimizer?.deviceInfo.isMobile || false;
}

/**
 * 获取设备优化级别
 */
export function getOptimizationLevel() {
    return mobileOptimizer?.optimizationLevel || 'light';
}

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    // 等待DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeMobileOptimization();
        });
    } else {
        // DOM已经加载完成，立即初始化
        initializeMobileOptimization();
    }
}