// module-loading-optimizer.js - JavaScript模块懒加载优化系统

console.log('🔧 Loading ModuleLoadingOptimizer...');

/**
 * JavaScript模块懒加载优化器
 * 根据页面类型和用户交互智能加载JavaScript模块
 */
export class ModuleLoadingOptimizer {
    constructor() {
        this.moduleRegistry = new Map();
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.pageTypeModules = this.definePageTypeModules();
        this.currentPageType = this.detectPageType();
        this.deviceCapabilities = this.assessDeviceCapabilities();
        
        console.log('ModuleLoadingOptimizer initialized for page type:', this.currentPageType);
    }
    
    /**
     * 定义页面类型对应的模块配置
     */
    definePageTypeModules() {
        return {
            'home': {
                critical: ['device-detector', 'i18n'],
                deferred: ['clipboard', 'language-modal', 'internal-links'],
                onDemand: ['cookie-notice']
            },
            'devices': {
                critical: ['device-detector', 'i18n'],
                deferred: ['device-comparison', 'clipboard', 'internal-links'],
                onDemand: []
            },
            'blog': {
                critical: ['i18n'],
                deferred: ['blog', 'blog-progress', 'clipboard', 'internal-links'],
                onDemand: ['language-modal']
            },
            'calculator': {
                critical: ['device-detector', 'i18n'],
                deferred: ['clipboard', 'internal-links'],
                onDemand: []
            },
            'simulator': {
                critical: ['device-detector', 'i18n'],
                deferred: ['simulator', 'clipboard', 'internal-links'],
                onDemand: []
            }
        };
    }
    
    /**
     * 检测当前页面类型
     */
    detectPageType() {
        const path = window.location.pathname;
        
        if (path.includes('/blog/')) return 'blog';
        if (path.includes('/devices/compare')) return 'devices';
        if (path.includes('/devices/ppi-calculator')) return 'calculator';
        if (path.includes('/devices/aspect-ratio-calculator')) return 'calculator';
        if (path.includes('/devices/responsive-tester')) return 'simulator';
        if (path.includes('/devices/')) return 'devices';
        
        return 'home';
    }
    
    /**
     * 评估设备能力
     */
    assessDeviceCapabilities() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        
        return {
            connectionType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 10,
            memory,
            cores,
            isLowEnd: memory < 4 || cores < 4,
            isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
        };
    }
    
    /**
     * 智能模块加载 - 根据页面类型和设备能力
     */
    async loadPageModules() {
        const pageModules = this.pageTypeModules[this.currentPageType];
        
        if (!pageModules) {
            console.warn(`No module configuration for page type: ${this.currentPageType}`);
            return;
        }
        
        console.log(`Loading modules for page type: ${this.currentPageType}`);
        
        try {
            // 根据设备能力对关键模块做动态调整（低端/慢网延后 i18n）
            const dynamicCritical = [...(pageModules.critical || [])];
            const dynamicDeferred = [...(pageModules.deferred || [])];

            const shouldDeferI18n = this.deviceCapabilities.isLowEnd || this.deviceCapabilities.isSlowConnection || this.deviceCapabilities.connectionType === '3g';
            if (shouldDeferI18n) {
                const idx = dynamicCritical.indexOf('i18n');
                if (idx !== -1) {
                    dynamicCritical.splice(idx, 1);
                    // 避免重复加入
                    if (!dynamicDeferred.includes('i18n')) dynamicDeferred.unshift('i18n');
                    console.log('🕒 Deferring i18n for low-end/slow connection device');
                }
            }

            // 阶段1: 立即加载关键模块（可能已移除 i18n）
            console.log('Loading critical modules:', dynamicCritical);
            const criticalPromises = dynamicCritical.map(module =>
                this.loadModule(module, { priority: 'high', timeout: 5000 })
            );

            await Promise.all(criticalPromises);
            console.log('✅ Critical modules loaded successfully');
            
            // 阶段2: 根据设备能力决定延迟加载策略
            const deferDelay = this.calculateDeferDelay();
            
            setTimeout(async () => {
                console.log('Loading deferred modules:', dynamicDeferred);
                const deferredPromises = dynamicDeferred.map(module =>
                    this.loadModule(module, { priority: 'low', timeout: 10000 })
                );
                
                // 不等待延迟模块完成，让它们在后台加载
                Promise.all(deferredPromises).then(() => {
                    console.log('✅ Deferred modules loaded successfully');
                }).catch(error => {
                    console.warn('⚠️ Some deferred modules failed to load:', error);
                });
            }, shouldDeferI18n ? deferDelay + 300 : deferDelay);
            
            // 阶段3: 预加载按需模块（仅在高端设备上）
            if (!this.deviceCapabilities.isLowEnd && !this.deviceCapabilities.isSlowConnection) {
                setTimeout(() => {
                    this.preloadOnDemandModules(pageModules.onDemand);
                }, deferDelay + 2000);
            }
            
        } catch (error) {
            console.error('❌ Error loading page modules:', error);
            // 降级处理：尝试加载最基本的模块
            await this.loadFallbackModules();
        }
    }
    
    /**
     * 计算延迟加载的延迟时间
     */
    calculateDeferDelay() {
        const { isLowEnd, isSlowConnection, connectionType } = this.deviceCapabilities;
        
        if (isSlowConnection || connectionType === '2g') {
            return 3000; // 慢网络延迟3秒
        } else if (isLowEnd || connectionType === '3g') {
            return 1500; // 低端设备延迟1.5秒
        } else {
            return 500;  // 高端设备延迟0.5秒
        }
    }
    
    /**
     * 预加载按需模块
     */
    async preloadOnDemandModules(modules) {
        if (!modules || modules.length === 0) return;
        
        console.log('Preloading on-demand modules:', modules);
        
        // 使用requestIdleCallback在浏览器空闲时预加载
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                modules.forEach(module => {
                    this.preloadModule(module);
                });
            }, { timeout: 5000 });
        } else {
            // 降级到setTimeout
            setTimeout(() => {
                modules.forEach(module => {
                    this.preloadModule(module);
                });
            }, 2000);
        }
    }
    
    /**
     * 预加载单个模块（不执行）
     */
    async preloadModule(moduleName) {
        try {
            const moduleMap = this.getModuleMap();
            const importFunction = moduleMap[moduleName];
            
            if (importFunction) {
                // 只预加载，不执行初始化
                const module = await importFunction();
                this.moduleRegistry.set(moduleName, module);
                console.log(`📦 Module preloaded: ${moduleName}`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to preload module ${moduleName}:`, error);
        }
    }
    
    /**
     * 加载单个模块
     */
    async loadModule(moduleName, options = {}) {
        const { priority = 'normal', timeout = 10000 } = options;
        
        if (this.loadedModules.has(moduleName)) {
            return this.moduleRegistry.get(moduleName);
        }
        
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }
        
        console.log(`🔄 Loading module: ${moduleName} (priority: ${priority})`);
        
        const loadPromise = this.dynamicImportModule(moduleName, { priority, timeout });
        this.loadingPromises.set(moduleName, loadPromise);
        
        try {
            const module = await loadPromise;
            this.moduleRegistry.set(moduleName, module);
            this.loadedModules.add(moduleName);
            
            console.log(`✅ Module loaded successfully: ${moduleName}`);
            return module;
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            this.loadingPromises.delete(moduleName);
            
            // 尝试降级处理
            return this.handleModuleLoadError(moduleName, error);
        }
    }
    
    /**
     * 动态导入模块
     */
    async dynamicImportModule(moduleName, options) {
        const { priority, timeout } = options;
        const moduleMap = this.getModuleMap();
        
        const importFunction = moduleMap[moduleName];
        if (!importFunction) {
            throw new Error(`Unknown module: ${moduleName}`);
        }
        
        // 根据优先级决定加载时机
        if (priority === 'low') {
            // 低优先级模块在空闲时加载
            await this.waitForIdle();
        }
        
        // 添加超时处理
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Module load timeout: ${moduleName}`)), timeout);
        });
        
        return Promise.race([importFunction(), timeoutPromise]);
    }
    
    /**
     * 等待浏览器空闲
     */
    waitForIdle() {
        return new Promise(resolve => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(resolve, { timeout: 2000 });
            } else {
                setTimeout(resolve, 100);
            }
        });
    }
    
    /**
     * 获取模块映射表
     */
    getModuleMap() {
        return {
            'device-detector': () => import('./device-detector.js'),
            'i18n': () => import('./i18n.js'),
            'clipboard': () => import('./clipboard.js'),
            'blog': () => import('./blog.js'),
            'blog-progress': () => import('./blog-progress.js'),
            'ppi-calculator': () => import('./ppi-calculator.js'),
            'aspect-ratio-calculator': () => import('./aspect-ratio-calculator.js'),
            'device-comparison': () => import('./device-comparison.js'),
            'language-modal': () => import('./language-modal.js'),
            'internal-links': () => import('./internal-links.js'),
            'simulator': () => import('./simulator.js'),
            'screen-comparison-fixed': () => import('./screen-comparison-fixed.js'),
            'cookie-notice': () => import('./cookie-notice.js'),
            'font-loading-optimizer': () => import('./font-loading-optimizer.js'),
            'utils': () => import('./utils.js')
        };
    }
    
    /**
     * 处理模块加载错误
     */
    async handleModuleLoadError(moduleName, error) {
        console.warn(`🔄 Attempting fallback for module: ${moduleName}`);
        
        // 对于关键模块，尝试重新加载
        if (this.isCriticalModule(moduleName)) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
                return this.loadModule(moduleName, { priority: 'high', timeout: 15000 });
            } catch (retryError) {
                console.error(`❌ Retry failed for critical module ${moduleName}:`, retryError);
            }
        }
        
        // 返回空的模块对象作为降级
        return this.createFallbackModule(moduleName);
    }
    
    /**
     * 检查是否为关键模块
     */
    isCriticalModule(moduleName) {
        const pageModules = this.pageTypeModules[this.currentPageType];
        return pageModules?.critical?.includes(moduleName) || false;
    }
    
    /**
     * 创建降级模块
     */
    createFallbackModule(moduleName) {
        console.warn(`🔄 Creating fallback module for: ${moduleName}`);
        
        const fallbackModules = {
            'device-detector': {
                updateDisplay: () => console.warn('Device detector fallback'),
                updateViewportSize: () => console.warn('Viewport update fallback')
            },
            'i18n': {
                initializeI18next: () => Promise.resolve(),
                updateUIElements: () => console.warn('i18n fallback'),
                setupLanguageSelector: () => console.warn('Language selector fallback')
            },
            'clipboard': {
                handleCopyClick: () => console.warn('Clipboard fallback'),
                copyAllInfo: () => Promise.resolve(false)
            }
        };
        
        return fallbackModules[moduleName] || {};
    }
    
    /**
     * 加载降级模块
     */
    async loadFallbackModules() {
        console.warn('🔄 Loading fallback modules...');
        
        try {
            // 尝试加载最基本的模块
            await this.loadModule('device-detector', { priority: 'high', timeout: 15000 });
        } catch (error) {
            console.error('❌ Even fallback modules failed to load:', error);
        }
    }
    
    /**
     * 按需加载模块（用于用户交互触发）
     */
    async loadOnDemand(moduleName) {
        console.log(`🎯 Loading module on demand: ${moduleName}`);
        
        try {
            return await this.loadModule(moduleName, { priority: 'high', timeout: 8000 });
        } catch (error) {
            console.error(`❌ Failed to load on-demand module ${moduleName}:`, error);
            return this.createFallbackModule(moduleName);
        }
    }
    
    /**
     * 获取模块加载统计
     */
    getLoadingStats() {
        return {
            totalModules: this.moduleRegistry.size,
            loadedModules: this.loadedModules.size,
            loadingModules: this.loadingPromises.size,
            pageType: this.currentPageType,
            deviceCapabilities: this.deviceCapabilities
        };
    }
    
    /**
     * 清理未使用的模块（内存优化）
     */
    cleanupUnusedModules() {
        const currentPageModules = this.pageTypeModules[this.currentPageType];
        const requiredModules = [
            ...(currentPageModules?.critical || []),
            ...(currentPageModules?.deferred || []),
            ...(currentPageModules?.onDemand || [])
        ];
        
        // 移除不需要的模块
        for (const [moduleName] of this.moduleRegistry) {
            if (!requiredModules.includes(moduleName)) {
                this.moduleRegistry.delete(moduleName);
                this.loadedModules.delete(moduleName);
                console.log(`🗑️ Cleaned up unused module: ${moduleName}`);
            }
        }
    }
}

// 创建全局实例
export const moduleLoadingOptimizer = new ModuleLoadingOptimizer();

// 导出便捷函数
export const loadModule = (moduleName) => moduleLoadingOptimizer.loadOnDemand(moduleName);
export const getLoadingStats = () => moduleLoadingOptimizer.getLoadingStats();

console.log('✅ ModuleLoadingOptimizer loaded successfully');
