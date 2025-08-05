/**
 * CSS优化器 - 管理关键CSS提取和内联系统
 * 实现关键CSS的自动提取、内联和非关键CSS的延迟加载
 */
class CSSOptimizer {
    constructor(config = {}) {
        this.config = {
            // 关键CSS选择器配置
            criticalSelectors: [
                // 基础元素
                'html', 'body', '*',
                // CSS变量定义
                ':root', '[data-theme="dark"]',
                // 布局容器
                '.main-content', '.container', '.hero-section',
                // 头部导航
                '.header', '.header-container', '.nav-menu',
                // 首屏内容
                '.hero-title', '.hero-subtitle', '.hero-secondary',
                '.info-dashboard', '.dashboard-container',
                '.info-card', '.card-header', '.card-title',
                // 关键交互元素
                '.copy-btn', '.theme-toggle', '.language-toggle',
                // 响应式断点（移动端优先）
                '@media (max-width: 768px)',
                '@media (max-width: 480px)',
                '@media (min-width: 769px)'
            ],
            
            // 关键CSS文件
            criticalFiles: [
                'css/main.css',
                'css/base.css'
            ],
            
            // 非关键CSS文件
            nonCriticalFiles: [
                'css/blog.css',
                'css/blog-progress.css',
                'css/simulator.css',
                'css/comparison.css',
                'css/info-items.css'
            ],
            
            // 条件加载CSS文件（基于页面类型）
            conditionalFiles: {
                'blog': ['css/blog.css', 'css/blog-progress.css'],
                'devices': ['css/comparison.css', 'css/info-items.css'],
                'simulator': ['css/simulator.css'],
                'calculator': ['css/comparison.css']
            },
            
            // 性能配置
            maxInlineSize: 50 * 1024, // 50KB最大内联大小
            deferLoadDelay: 100, // 延迟加载延迟时间(ms)
            enableMinification: true,
            enableCaching: true,
            
            ...config
        };
        
        this.criticalCSS = '';
        this.inlinedCSS = new Set();
        this.loadedCSS = new Set();
        this.loadingPromises = new Map();
        this.currentPageType = this.detectPageType();
        this.deviceCapabilities = this.assessDeviceCapabilities();
        
        // 初始化
        this.initialize();
    }
    
    /**
     * 初始化CSS优化器
     */
    initialize() {
        console.log('🎨 CSS Optimizer initializing...');
        
        // 检测当前页面类型
        console.log(`📄 Page type detected: ${this.currentPageType}`);
        
        // 提取并内联关键CSS
        this.extractAndInlineCriticalCSS();
        
        // 延迟加载非关键CSS
        this.scheduleNonCriticalCSSLoading();
        
        // 优化字体加载
        this.optimizeFontLoading();
        
        // 设置CSS变量优化
        this.optimizeCSSVariables();
        
        console.log('✅ CSS Optimizer initialized successfully');
    }
    
    /**
     * 检测当前页面类型
     */
    detectPageType() {
        const path = window.location.pathname;
        
        if (path.includes('/blog/')) return 'blog';
        if (path.includes('/devices/compare')) return 'devices';
        if (path.includes('/devices/responsive-tester')) return 'simulator';
        if (path.includes('calculator')) return 'calculator';
        if (path.includes('/devices/')) return 'devices';
        
        return 'home';
    }
    
    /**
     * 评估设备能力
     */
    assessDeviceCapabilities() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const memory = navigator.deviceMemory || 4;
        
        return {
            connectionType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 10,
            memory,
            isLowEnd: memory < 4,
            isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
        };
    }
    
    /**
     * 提取并内联关键CSS
     */
    extractAndInlineCriticalCSS() {
        // 检查是否已经有内联的关键CSS
        const existingCriticalCSS = document.querySelector('style[data-critical="true"]');
        if (existingCriticalCSS) {
            console.log('📝 Critical CSS already inlined');
            return;
        }
        
        // 从现有样式表中提取关键CSS
        this.criticalCSS = this.extractCriticalCSSFromStylesheets();
        
        // 如果提取到关键CSS，则内联它
        if (this.criticalCSS && this.criticalCSS.length > 0) {
            this.inlineCriticalCSS();
        }
        
        // 标记关键CSS文件为已处理
        this.config.criticalFiles.forEach(file => {
            this.loadedCSS.add(file);
        });
    }
    
    /**
     * 从现有样式表中提取关键CSS
     */
    extractCriticalCSSFromStylesheets() {
        const criticalRules = [];
        const stylesheets = Array.from(document.styleSheets);
        
        stylesheets.forEach(stylesheet => {
            try {
                const rules = Array.from(stylesheet.cssRules || stylesheet.rules || []);
                
                rules.forEach(rule => {
                    if (this.isCriticalRule(rule)) {
                        criticalRules.push(rule.cssText);
                    }
                });
            } catch (e) {
                // 跨域样式表可能无法访问
                console.warn('⚠️ Cannot access stylesheet:', stylesheet.href, e.message);
            }
        });
        
        return criticalRules.join('\n');
    }
    
    /**
     * 判断CSS规则是否为关键规则
     */
    isCriticalRule(rule) {
        if (rule.type === CSSRule.STYLE_RULE) {
            const selectorText = rule.selectorText;
            
            // 检查是否匹配关键选择器
            return this.config.criticalSelectors.some(selector => {
                if (selector.startsWith('@media')) {
                    return false; // 媒体查询单独处理
                }
                
                // 精确匹配或包含匹配
                return selectorText === selector || 
                       selectorText.includes(selector) ||
                       this.matchesCriticalPattern(selectorText);
            });
        } else if (rule.type === CSSRule.MEDIA_RULE) {
            // 处理关键媒体查询
            const mediaText = rule.media.mediaText;
            return this.isCriticalMediaQuery(mediaText);
        } else if (rule.type === CSSRule.KEYFRAMES_RULE) {
            // 关键动画
            return this.isCriticalAnimation(rule.name);
        }
        
        return false;
    }
    
    /**
     * 匹配关键CSS模式
     */
    matchesCriticalPattern(selectorText) {
        const criticalPatterns = [
            /^body/, /^html/, /^\*/, /^:root/,
            /\.hero-/, /\.header/, /\.main-content/,
            /\.info-card/, /\.dashboard-/,
            /\.btn-primary/, /\.copy-btn/,
            /\[data-theme/, /\.theme-/
        ];
        
        return criticalPatterns.some(pattern => pattern.test(selectorText));
    }
    
    /**
     * 判断是否为关键媒体查询
     */
    isCriticalMediaQuery(mediaText) {
        const criticalMediaQueries = [
            'max-width: 768px',
            'max-width: 480px',
            'min-width: 769px',
            'prefers-color-scheme'
        ];
        
        return criticalMediaQueries.some(query => mediaText.includes(query));
    }
    
    /**
     * 判断是否为关键动画
     */
    isCriticalAnimation(animationName) {
        const criticalAnimations = [
            'fadeIn', 'slideIn', 'pulse', 'spin'
        ];
        
        return criticalAnimations.includes(animationName);
    }
    
    /**
     * 内联关键CSS
     */
    inlineCriticalCSS() {
        if (!this.criticalCSS || this.inlinedCSS.has('critical')) {
            return;
        }
        
        // 检查大小限制
        if (this.criticalCSS.length > this.config.maxInlineSize) {
            console.warn(`⚠️ Critical CSS size (${this.criticalCSS.length} bytes) exceeds limit (${this.config.maxInlineSize} bytes)`);
            // 截取关键部分
            this.criticalCSS = this.criticalCSS.substring(0, this.config.maxInlineSize);
        }
        
        // 创建内联样式元素
        const style = document.createElement('style');
        style.setAttribute('data-critical', 'true');
        style.setAttribute('data-generated', 'css-optimizer');
        
        // 压缩CSS（如果启用）
        const cssContent = this.config.enableMinification ? 
            this.minifyCSS(this.criticalCSS) : this.criticalCSS;
        
        style.textContent = cssContent;
        
        // 插入到head的最前面，确保优先级
        const firstStyleOrLink = document.head.querySelector('style, link[rel="stylesheet"]');
        if (firstStyleOrLink) {
            document.head.insertBefore(style, firstStyleOrLink);
        } else {
            document.head.appendChild(style);
        }
        
        this.inlinedCSS.add('critical');
        console.log(`✅ Critical CSS inlined (${cssContent.length} bytes)`);
    }
    
    /**
     * 简单的CSS压缩
     */
    minifyCSS(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
            .replace(/\s+/g, ' ') // 压缩空白
            .replace(/;\s*}/g, '}') // 移除最后一个分号
            .replace(/\s*{\s*/g, '{') // 压缩大括号
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';') // 压缩分号
            .replace(/\s*:\s*/g, ':') // 压缩冒号
            .trim();
    }
    
    /**
     * 安排非关键CSS的延迟加载
     */
    scheduleNonCriticalCSSLoading() {
        // 根据设备能力决定加载策略
        const delay = this.deviceCapabilities.isSlowConnection ? 
            this.config.deferLoadDelay * 2 : this.config.deferLoadDelay;
        
        // 使用 requestIdleCallback 在浏览器空闲时加载
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadNonCriticalCSS();
            }, { timeout: delay * 10 });
        } else {
            // 降级到 setTimeout
            setTimeout(() => {
                this.loadNonCriticalCSS();
            }, delay);
        }
        
        // 也在页面加载完成后加载
        if (document.readyState === 'complete') {
            setTimeout(() => this.loadNonCriticalCSS(), delay);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.loadNonCriticalCSS(), delay);
            });
        }
    }
    
    /**
     * 加载非关键CSS
     */
    async loadNonCriticalCSS() {
        console.log('🔄 Loading non-critical CSS...');
        
        const filesToLoad = new Set();
        
        // 添加通用非关键文件
        this.config.nonCriticalFiles.forEach(file => filesToLoad.add(file));
        
        // 添加页面特定的CSS文件
        const pageSpecificFiles = this.config.conditionalFiles[this.currentPageType];
        if (pageSpecificFiles) {
            pageSpecificFiles.forEach(file => filesToLoad.add(file));
        }
        
        // 并行加载所有非关键CSS文件
        const loadPromises = Array.from(filesToLoad).map(file => 
            this.loadCSSAsync(file)
        );
        
        try {
            await Promise.all(loadPromises);
            console.log('✅ Non-critical CSS loaded successfully');
            
            // 触发自定义事件
            this.dispatchCSSLoadedEvent();
        } catch (error) {
            console.error('❌ Error loading non-critical CSS:', error);
        }
    }
    
    /**
     * 异步加载CSS文件
     */
    loadCSSAsync(href) {
        if (this.loadedCSS.has(href)) {
            return Promise.resolve();
        }
        
        if (this.loadingPromises.has(href)) {
            return this.loadingPromises.get(href);
        }
        
        const promise = new Promise((resolve, reject) => {
            // 检查是否已经存在该样式表
            const existingLink = document.querySelector(`link[href="${href}"]`);
            if (existingLink) {
                this.loadedCSS.add(href);
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print'; // 先设置为print避免阻塞渲染
            
            link.onload = () => {
                link.media = 'all'; // 加载完成后切换为all
                this.loadedCSS.add(href);
                console.log(`📄 Loaded CSS: ${href}`);
                resolve();
            };
            
            link.onerror = (error) => {
                console.error(`❌ Failed to load CSS: ${href}`, error);
                reject(error);
            };
            
            // 添加到head
            document.head.appendChild(link);
        });
        
        this.loadingPromises.set(href, promise);
        return promise;
    }
    
    /**
     * 优化字体加载
     */
    optimizeFontLoading() {
        console.log('🔤 Optimizing font loading...');
        
        // 预加载关键字体
        const criticalFonts = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ];
        
        criticalFonts.forEach(fontUrl => {
            // 预加载字体样式表
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'style';
            preloadLink.href = fontUrl;
            preloadLink.crossOrigin = 'anonymous';
            document.head.appendChild(preloadLink);
            
            // 异步加载字体样式
            setTimeout(() => {
                const styleLink = document.createElement('link');
                styleLink.rel = 'stylesheet';
                styleLink.href = fontUrl;
                document.head.appendChild(styleLink);
            }, 50);
        });
        
        // 设置字体显示策略
        this.setFontDisplayStrategy();
    }
    
    /**
     * 设置字体显示策略
     */
    setFontDisplayStrategy() {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-display: swap;
            }
            
            /* 确保系统字体作为后备 */
            body, .hero-title, .hero-subtitle {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 优化CSS变量使用
     */
    optimizeCSSVariables() {
        // 确保CSS变量在关键CSS中定义
        const cssVariables = `
            :root {
                /* 性能优化的CSS变量 */
                --critical-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                --critical-transition: 0.15s ease;
                --critical-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                --critical-border-radius: 8px;
                
                /* 减少重复计算的变量 */
                --header-height: 64px;
                --content-max-width: 1200px;
                --card-padding: 1.5rem;
                --grid-gap: 2rem;
            }
            
            /* 性能优化的通用类 */
            .gpu-accelerated {
                transform: translateZ(0);
                will-change: transform;
            }
            
            .reduce-motion {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        
        const style = document.createElement('style');
        style.setAttribute('data-css-variables', 'optimized');
        style.textContent = cssVariables;
        document.head.appendChild(style);
    }
    
    /**
     * 触发CSS加载完成事件
     */
    dispatchCSSLoadedEvent() {
        const event = new CustomEvent('cssOptimized', {
            detail: {
                criticalCSSInlined: this.inlinedCSS.has('critical'),
                nonCriticalCSSLoaded: this.loadedCSS.size,
                pageType: this.currentPageType,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * 获取优化统计信息
     */
    getOptimizationStats() {
        return {
            criticalCSSSize: this.criticalCSS.length,
            criticalCSSInlined: this.inlinedCSS.has('critical'),
            loadedCSSFiles: Array.from(this.loadedCSS),
            pageType: this.currentPageType,
            deviceCapabilities: this.deviceCapabilities,
            optimizationLevel: this.deviceCapabilities.isLowEnd ? 'aggressive' : 'standard'
        };
    }
    
    /**
     * 手动触发非关键CSS加载（用于调试）
     */
    forceLoadNonCriticalCSS() {
        console.log('🔧 Force loading non-critical CSS...');
        return this.loadNonCriticalCSS();
    }
    
    /**
     * 清理和重置
     */
    cleanup() {
        this.loadingPromises.clear();
        console.log('🧹 CSS Optimizer cleaned up');
    }
}

// 导出类
export default CSSOptimizer;

// 如果不支持ES6模块，则添加到全局作用域
if (typeof module === 'undefined') {
    window.CSSOptimizer = CSSOptimizer;
}