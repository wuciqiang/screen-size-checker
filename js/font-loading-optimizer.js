/**
 * 字体加载优化器
 * 实现字体预加载、font-display优化、fallback机制和现代格式支持
 */
class FontLoadingOptimizer {
    constructor(config = {}) {
        this.config = {
            // 字体配置
            fonts: {
                system: {
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    fallback: 'Arial, sans-serif',
                    critical: true
                },
                mono: {
                    family: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                    fallback: '"Courier New", monospace',
                    critical: false
                }
            },
            
            // 字体显示策略
            fontDisplay: 'swap', // swap, fallback, optional, auto
            
            // 预加载设置
            preloadCriticalFonts: true,
            preloadTimeout: 3000,
            
            // 错误处理
            enableFallback: true,
            fallbackTimeout: 2000,
            
            // 性能监控
            enableMetrics: true,
            
            ...config
        };
        
        this.loadedFonts = new Set();
        this.failedFonts = new Set();
        this.fontMetrics = new Map();
        this.fallbackApplied = false;
        
        this.init();
    }
    
    /**
     * 初始化字体优化器
     */
    init() {
        console.log('FontLoadingOptimizer: 初始化字体加载优化器');
        
        // 应用字体显示策略
        this.applyFontDisplayStrategy();
        
        // 预加载关键字体
        if (this.config.preloadCriticalFonts) {
            this.preloadCriticalFonts();
        }
        
        // 设置字体加载监控
        this.setupFontLoadingMonitoring();
        
        // 设置fallback机制
        if (this.config.enableFallback) {
            this.setupFontFallback();
        }
        
        // 优化现有字体样式
        this.optimizeExistingFonts();
    }
    
    /**
     * 应用字体显示策略
     */
    applyFontDisplayStrategy() {
        const style = document.createElement('style');
        style.setAttribute('data-font-optimizer', 'display-strategy');
        
        let css = `
            /* 字体显示优化策略 */
            @font-face {
                font-display: ${this.config.fontDisplay};
            }
            
            /* 确保系统字体快速渲染 */
            body, html {
                font-family: ${this.config.fonts.system.family};
                font-display: swap;
            }
            
            /* 等宽字体优化 */
            code, pre, .code, .mono {
                font-family: ${this.config.fonts.mono.family};
                font-display: swap;
            }
            
            /* 防止字体加载时的布局跳动 */
            * {
                font-synthesis: none;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        `;
        
        style.textContent = css;
        document.head.insertBefore(style, document.head.firstChild);
        
        console.log('FontLoadingOptimizer: 应用字体显示策略');
    }
    
    /**
     * 预加载关键字体
     */
    preloadCriticalFonts() {
        const criticalFonts = Object.entries(this.config.fonts)
            .filter(([_, config]) => config.critical)
            .map(([name, config]) => ({ name, ...config }));
        
        console.log('FontLoadingOptimizer: 预加载关键字体', criticalFonts.length);
        
        criticalFonts.forEach(font => {
            this.preloadFont(font);
        });
    }
    
    /**
     * 预加载单个字体
     */
    preloadFont(font) {
        // 对于系统字体，我们主要是确保CSS规则正确应用
        if (font.family.includes('-apple-system') || font.family.includes('BlinkMacSystemFont')) {
            console.log(`FontLoadingOptimizer: 系统字体 ${font.name} 无需预加载`);
            this.loadedFonts.add(font.name);
            return Promise.resolve();
        }
        
        // 如果是Web字体，创建预加载链接
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.warn(`FontLoadingOptimizer: 字体 ${font.name} 预加载超时`);
                this.handleFontLoadError(font.name, 'timeout');
                reject(new Error('Font preload timeout'));
            }, this.config.preloadTimeout);
            
            link.onload = () => {
                clearTimeout(timeout);
                console.log(`FontLoadingOptimizer: 字体 ${font.name} 预加载成功`);
                this.loadedFonts.add(font.name);
                this.recordFontMetric(font.name, 'preload', 'success');
                resolve();
            };
            
            link.onerror = () => {
                clearTimeout(timeout);
                console.error(`FontLoadingOptimizer: 字体 ${font.name} 预加载失败`);
                this.handleFontLoadError(font.name, 'error');
                reject(new Error('Font preload failed'));
            };
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * 设置字体加载监控
     */
    setupFontLoadingMonitoring() {
        if (!this.config.enableMetrics) return;
        
        // 使用Font Loading API监控字体加载
        if ('fonts' in document) {
            document.fonts.addEventListener('loadingdone', (event) => {
                console.log('FontLoadingOptimizer: 字体加载完成事件', event);
                this.recordFontMetric('all', 'loading', 'done');
            });
            
            document.fonts.addEventListener('loadingerror', (event) => {
                console.error('FontLoadingOptimizer: 字体加载错误事件', event);
                this.recordFontMetric('all', 'loading', 'error');
            });
            
            // 检查字体加载状态
            this.checkFontLoadingStatus();
        }
        
        // 监控字体渲染性能
        this.monitorFontRenderingPerformance();
    }
    
    /**
     * 检查字体加载状态
     */
    checkFontLoadingStatus() {
        const checkInterval = setInterval(() => {
            if (document.fonts.status === 'loaded') {
                console.log('FontLoadingOptimizer: 所有字体加载完成');
                clearInterval(checkInterval);
                this.recordFontMetric('all', 'status', 'loaded');
                
                // 触发字体加载完成事件
                this.dispatchFontLoadedEvent();
            }
        }, 100);
        
        // 设置超时
        setTimeout(() => {
            if (document.fonts.status !== 'loaded') {
                console.warn('FontLoadingOptimizer: 字体加载超时，应用fallback');
                clearInterval(checkInterval);
                this.applyFontFallback();
            }
        }, this.config.fallbackTimeout);
    }
    
    /**
     * 监控字体渲染性能
     */
    monitorFontRenderingPerformance() {
        // 使用Performance Observer监控字体相关的性能指标
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name.includes('font') || entry.initiatorType === 'css') {
                            this.recordFontMetric(entry.name, 'performance', {
                                duration: entry.duration,
                                startTime: entry.startTime,
                                transferSize: entry.transferSize || 0
                            });
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('FontLoadingOptimizer: 无法设置性能监控', e);
            }
        }
    }
    
    /**
     * 设置字体fallback机制
     */
    setupFontFallback() {
        // 创建fallback样式
        const fallbackStyle = document.createElement('style');
        fallbackStyle.setAttribute('data-font-optimizer', 'fallback');
        fallbackStyle.id = 'font-fallback-styles';
        
        const fallbackCSS = `
            /* 字体加载失败时的fallback样式 */
            .font-fallback-active body,
            .font-fallback-active * {
                font-family: ${this.config.fonts.system.fallback} !important;
            }
            
            .font-fallback-active code,
            .font-fallback-active pre,
            .font-fallback-active .code,
            .font-fallback-active .mono {
                font-family: ${this.config.fonts.mono.fallback} !important;
            }
            
            /* 隐藏fallback样式，只在需要时激活 */
            .font-fallback-active {
                font-synthesis: none;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        `;
        
        fallbackStyle.textContent = fallbackCSS;
        document.head.appendChild(fallbackStyle);
        
        console.log('FontLoadingOptimizer: 设置字体fallback机制');
    }
    
    /**
     * 应用字体fallback
     */
    applyFontFallback() {
        if (this.fallbackApplied) return;
        
        console.log('FontLoadingOptimizer: 应用字体fallback');
        
        document.documentElement.classList.add('font-fallback-active');
        this.fallbackApplied = true;
        
        // 记录fallback应用
        this.recordFontMetric('fallback', 'applied', Date.now());
        
        // 触发fallback应用事件
        this.dispatchFontFallbackEvent();
    }
    
    /**
     * 优化现有字体样式
     */
    optimizeExistingFonts() {
        // 为现有的字体样式添加优化
        const optimizationStyle = document.createElement('style');
        optimizationStyle.setAttribute('data-font-optimizer', 'optimization');
        
        const optimizationCSS = `
            /* 字体渲染优化 */
            body {
                text-rendering: optimizeLegibility;
                -webkit-font-feature-settings: "kern" 1;
                font-feature-settings: "kern" 1;
                font-kerning: normal;
            }
            
            /* 防止字体加载时的闪烁 */
            .font-loading body {
                visibility: hidden;
            }
            
            .font-loaded body,
            .font-fallback-active body {
                visibility: visible;
            }
            
            /* 优化代码字体渲染 */
            code, pre, .code, .mono {
                font-variant-ligatures: common-ligatures;
                -webkit-font-feature-settings: "liga" 1, "calt" 1;
                font-feature-settings: "liga" 1, "calt" 1;
            }
            
            /* 确保字体大小一致性 */
            * {
                font-size-adjust: none;
            }
        `;
        
        optimizationStyle.textContent = optimizationCSS;
        document.head.appendChild(optimizationStyle);
        
        // 添加字体加载状态类
        document.documentElement.classList.add('font-loading');
        
        console.log('FontLoadingOptimizer: 应用字体渲染优化');
    }
    
    /**
     * 处理字体加载错误
     */
    handleFontLoadError(fontName, errorType) {
        console.error(`FontLoadingOptimizer: 字体 ${fontName} 加载失败 (${errorType})`);
        
        this.failedFonts.add(fontName);
        this.recordFontMetric(fontName, 'error', errorType);
        
        // 如果关键字体加载失败，立即应用fallback
        const fontConfig = this.config.fonts[fontName];
        if (fontConfig && fontConfig.critical) {
            this.applyFontFallback();
        }
    }
    
    /**
     * 记录字体性能指标
     */
    recordFontMetric(fontName, metricType, value) {
        if (!this.config.enableMetrics) return;
        
        const key = `${fontName}-${metricType}`;
        this.fontMetrics.set(key, {
            font: fontName,
            type: metricType,
            value: value,
            timestamp: Date.now()
        });
        
        // 发送到性能监控系统
        if (window.performanceMonitor) {
            window.performanceMonitor.recordMetric('font-loading', {
                font: fontName,
                type: metricType,
                value: value
            });
        }
    }
    
    /**
     * 触发字体加载完成事件
     */
    dispatchFontLoadedEvent() {
        document.documentElement.classList.remove('font-loading');
        document.documentElement.classList.add('font-loaded');
        
        const event = new CustomEvent('fontsLoaded', {
            detail: {
                loadedFonts: Array.from(this.loadedFonts),
                failedFonts: Array.from(this.failedFonts),
                metrics: Object.fromEntries(this.fontMetrics)
            }
        });
        
        document.dispatchEvent(event);
        console.log('FontLoadingOptimizer: 触发字体加载完成事件');
    }
    
    /**
     * 触发字体fallback事件
     */
    dispatchFontFallbackEvent() {
        const event = new CustomEvent('fontFallbackApplied', {
            detail: {
                fallbackApplied: this.fallbackApplied,
                failedFonts: Array.from(this.failedFonts)
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * 获取字体加载状态
     */
    getFontLoadingStatus() {
        return {
            loaded: Array.from(this.loadedFonts),
            failed: Array.from(this.failedFonts),
            fallbackApplied: this.fallbackApplied,
            metrics: Object.fromEntries(this.fontMetrics)
        };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 移除事件监听器
        if ('fonts' in document) {
            document.fonts.removeEventListener('loadingdone', this.handleFontLoadingDone);
            document.fonts.removeEventListener('loadingerror', this.handleFontLoadingError);
        }
        
        // 清理数据
        this.loadedFonts.clear();
        this.failedFonts.clear();
        this.fontMetrics.clear();
        
        console.log('FontLoadingOptimizer: 清理完成');
    }
}

// 导出类 - 确保正确的ES6模块导出
export default FontLoadingOptimizer;

// 兼容性导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontLoadingOptimizer;
} else if (typeof window !== 'undefined') {
    window.FontLoadingOptimizer = FontLoadingOptimizer;
}