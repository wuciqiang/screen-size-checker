/**
 * 广告配置管理器
 * 处理环境特定配置、广告单元 ID 管理和配置验证
 */

class AdConfigManager {
    constructor() {
        this.config = null;
        this.currentEnvironment = this.detectEnvironment();
        this.deviceType = this.detectDeviceType();
        this.isLoaded = false;
        
        this.init();
    }

    /**
     * 初始化配置管理器
     */
    async init() {
        try {
            await this.loadConfig();
            this.validateConfig();
            this.applyEnvironmentConfig();
            this.isLoaded = true;
            
            console.log(`🔧 广告配置已加载 (环境: ${this.currentEnvironment}, 设备: ${this.deviceType})`);
        } catch (error) {
            console.error('❌ 广告配置加载失败:', error);
            this.loadFallbackConfig();
        }
    }

    /**
     * 加载配置文件
     */
    async loadConfig() {
        try {
            // 尝试从缓存加载
            const cachedConfig = this.getCachedConfig();
            if (cachedConfig && this.isConfigValid(cachedConfig)) {
                this.config = cachedConfig;
                console.log('📦 使用缓存的广告配置');
                return;
            }

            // 从服务器加载
            const response = await fetch('/data/ad-config.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.config = await response.json();
            
            // 缓存配置
            this.cacheConfig(this.config);
            
        } catch (error) {
            console.warn('⚠️ 无法从服务器加载配置，使用默认配置');
            throw error;
        }
    }

    /**
     * 检测当前环境
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.includes('dev') ||
            hostname.includes('test')) {
            return 'development';
        }
        
        return 'production';
    }

    /**
     * 检测设备类型
     */
    detectDeviceType() {
        const width = window.innerWidth;
        const config = this.config?.responsive?.breakpoints;
        
        if (!config) {
            // 使用默认断点
            if (width <= 768) return 'mobile';
            if (width <= 1024) return 'tablet';
            if (width <= 1440) return 'desktop';
            return 'desktop';
        }
        
        if (width <= config.mobile) return 'mobile';
        if (width <= config.tablet) return 'tablet';
        if (width <= config.desktop) return 'desktop';
        return 'desktop';
    }

    /**
     * 验证配置
     */
    validateConfig() {
        if (!this.config) {
            throw new Error('配置为空');
        }

        const requiredFields = ['environments', 'responsive', 'pageTypes', 'adTypes'];
        for (const field of requiredFields) {
            if (!this.config[field]) {
                throw new Error(`缺少必需字段: ${field}`);
            }
        }

        const envConfig = this.config.environments[this.currentEnvironment];
        if (!envConfig) {
            throw new Error(`未找到环境配置: ${this.currentEnvironment}`);
        }

        if (!envConfig.client || !envConfig.slots) {
            throw new Error('环境配置缺少必需字段');
        }
    }

    /**
     * 应用环境特定配置
     */
    applyEnvironmentConfig() {
        const envConfig = this.config.environments[this.currentEnvironment];
        
        // 更新全局 AdSense 客户端 ID
        if (window.adsbygoogle) {
            window.adsbygoogle.client = envConfig.client;
        }

        // 设置调试模式
        if (envConfig.debug) {
            window.adConfigDebug = true;
            console.log('🐛 广告调试模式已启用');
        }

        // 应用设备特定配置
        this.applyDeviceConfig();
    }

    /**
     * 应用设备特定配置
     */
    applyDeviceConfig() {
        const deviceConfig = this.config.responsive[this.deviceType];
        if (!deviceConfig) return;

        // 设置设备特定的全局变量
        window.adDeviceConfig = {
            type: this.deviceType,
            showSidebar: deviceConfig.showSidebar,
            maxAdsPerPage: deviceConfig.maxAdsPerPage,
            enableStickyAds: deviceConfig.enableStickyAds,
            adPositions: deviceConfig.adPositions
        };
    }

    /**
     * 获取广告单元 ID
     */
    getAdSlotId(slotType) {
        const envConfig = this.config?.environments[this.currentEnvironment];
        if (!envConfig || !envConfig.slots) {
            console.warn(`⚠️ 未找到广告位配置: ${slotType}`);
            return `FALLBACK_${slotType.toUpperCase()}_SLOT`;
        }

        return envConfig.slots[slotType] || `UNKNOWN_${slotType.toUpperCase()}_SLOT`;
    }

    /**
     * 获取 AdSense 客户端 ID
     */
    getClientId() {
        const envConfig = this.config?.environments[this.currentEnvironment];
        return envConfig?.client || 'ca-pub-fallback';
    }

    /**
     * 检查广告是否启用
     */
    isAdEnabled() {
        const envConfig = this.config?.environments[this.currentEnvironment];
        return envConfig?.enabled !== false;
    }

    /**
     * 检查是否为测试模式
     */
    isTestMode() {
        const envConfig = this.config?.environments[this.currentEnvironment];
        return envConfig?.testMode === true;
    }

    /**
     * 获取页面类型配置
     */
    getPageTypeConfig(pageType) {
        return this.config?.pageTypes[pageType] || this.config?.pageTypes['default'] || {
            positions: ['after-h1'],
            maxAds: 1,
            priority: 'low',
            enableSidebar: false
        };
    }

    /**
     * 获取广告类型配置
     */
    getAdTypeConfig(adType) {
        return this.config?.adTypes[adType] || {
            minHeight: '100px',
            maxHeight: '200px',
            responsive: true,
            lazyLoad: true,
            priority: 'medium'
        };
    }

    /**
     * 获取性能配置
     */
    getPerformanceConfig() {
        return this.config?.performance || {
            lazyLoadThreshold: '200px',
            loadTimeout: 10000,
            maxRetries: 3,
            retryDelay: 2000,
            enableIntersectionObserver: true,
            enablePerformanceMonitoring: true
        };
    }

    /**
     * 获取响应式配置
     */
    getResponsiveConfig() {
        return this.config?.responsive[this.deviceType] || {
            showSidebar: false,
            maxAdsPerPage: 2,
            enableStickyAds: false,
            adPositions: ['top-banner', 'in-content']
        };
    }

    /**
     * 检查是否应该显示侧边栏广告
     */
    shouldShowSidebar() {
        const deviceConfig = this.getResponsiveConfig();
        return deviceConfig.showSidebar && this.deviceType !== 'mobile';
    }

    /**
     * 获取分析配置
     */
    getAnalyticsConfig() {
        const envConfig = this.config?.environments[this.currentEnvironment];
        return envConfig?.analytics || {
            enabled: false,
            endpoint: null
        };
    }

    /**
     * 缓存配置
     */
    cacheConfig(config) {
        try {
            const cacheData = {
                config,
                timestamp: Date.now(),
                version: config.version
            };
            localStorage.setItem('adConfig', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('⚠️ 无法缓存广告配置:', error);
        }
    }

    /**
     * 获取缓存的配置
     */
    getCachedConfig() {
        try {
            const cached = localStorage.getItem('adConfig');
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            
            // 检查缓存是否过期（24小时）
            const maxAge = 24 * 60 * 60 * 1000;
            if (Date.now() - cacheData.timestamp > maxAge) {
                localStorage.removeItem('adConfig');
                return null;
            }

            return cacheData.config;
        } catch (error) {
            console.warn('⚠️ 无法读取缓存的广告配置:', error);
            localStorage.removeItem('adConfig');
            return null;
        }
    }

    /**
     * 检查配置是否有效
     */
    isConfigValid(config) {
        return config && 
               config.version && 
               config.environments && 
               config.environments[this.currentEnvironment];
    }

    /**
     * 加载备用配置
     */
    loadFallbackConfig() {
        console.log('📦 使用备用广告配置');
        
        this.config = {
            version: '1.0.0-fallback',
            environments: {
                [this.currentEnvironment]: {
                    enabled: true,
                    testMode: this.currentEnvironment === 'development',
                    client: 'ca-pub-9212629010224868',
                    slots: {
                        topBanner: 'FALLBACK_TOP_BANNER',
                        inContentRectangle: 'FALLBACK_IN_CONTENT',
                        skyscraperRight: 'FALLBACK_SKYSCRAPER',
                        endOfContent: 'FALLBACK_END_CONTENT'
                    },
                    debug: this.currentEnvironment === 'development',
                    analytics: {
                        enabled: false,
                        endpoint: null
                    }
                }
            },
            responsive: {
                mobile: { showSidebar: false, maxAdsPerPage: 2 },
                tablet: { showSidebar: false, maxAdsPerPage: 3 },
                desktop: { showSidebar: true, maxAdsPerPage: 4 }
            },
            pageTypes: {},
            adTypes: {},
            performance: {
                lazyLoadThreshold: '200px',
                loadTimeout: 10000,
                maxRetries: 3
            }
        };

        this.isLoaded = true;
    }

    /**
     * 重新加载配置
     */
    async reload() {
        this.isLoaded = false;
        localStorage.removeItem('adConfig');
        await this.init();
    }

    /**
     * 获取完整配置（用于调试）
     */
    getFullConfig() {
        return {
            config: this.config,
            environment: this.currentEnvironment,
            deviceType: this.deviceType,
            isLoaded: this.isLoaded
        };
    }

    /**
     * 更新广告单元 ID（运行时）
     */
    updateSlotId(slotType, newSlotId) {
        const envConfig = this.config?.environments[this.currentEnvironment];
        if (envConfig && envConfig.slots) {
            envConfig.slots[slotType] = newSlotId;
            console.log(`🔧 已更新广告位 ${slotType}: ${newSlotId}`);
        }
    }
}

// 创建全局实例
let adConfigManager = null;

// 自动初始化
if (!window.adConfigManager) {
    adConfigManager = new AdConfigManager();
    window.adConfigManager = adConfigManager;
    
    // 暴露调试方法
    window.getAdConfig = () => adConfigManager.getFullConfig();
    window.reloadAdConfig = () => adConfigManager.reload();
    window.updateAdSlot = (type, id) => adConfigManager.updateSlotId(type, id);
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdConfigManager;
}