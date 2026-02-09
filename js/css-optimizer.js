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
                'css/core-optimized.css'  // 统一使用 core-optimized.css 作为基础样式
            ],
            
            // 非关键CSS文件（只包含确实存在的文件）
            nonCriticalFiles: [
                'css/blog.css',
                'css/blog-progress.css',
                'css/simulator.css',
                'css/comparison.css',
                'css/info-items.css',
                'css/internal-links.css',
                'css/language-selector.css',
                'css/mobile-performance.css',
                'css/mobile-ui-optimization.css',
                'css/optimized-events.css'
            ],
            
            // 条件加载CSS文件（基于页面类型）
            conditionalFiles: {
                'blog': ['css/blog.css', 'css/blog-progress.css'],
                'devices': ['css/comparison.css', 'css/info-items.css'],
                'simulator': ['css/simulator.css'],
                'calculator': ['css/comparison.css'],
                'mobile': ['css/mobile-performance.css', 'css/mobile-ui-optimization.css'],
                'events': ['css/optimized-events.css']
            },
            
            // 性能配置
            maxInlineSize: 50 * 1024, // 50KB最大内联大小
            deferLoadDelay: 100, // 延迟加载延迟时间(ms)
            enableMinification: true,
            enableCaching: true,
            enableCSSCompression: false,
            enableCSSCaching: false,
            enableFallbackHandling: true,
            
            ...config
        };
        
        this.criticalCSS = '';
        this.inlinedCSS = new Set();
        this.loadedCSS = new Set();
        this.loadingPromises = new Map();
        this.currentPageType = this.detectPageType();
        this.deviceCapabilities = this.assessDeviceCapabilities();
        this._cacheStorage = null;
        
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
     * 安排非关键CSS的延迟加载（增强版本）
     */
    scheduleNonCriticalCSSLoading() {
        // 根据设备能力决定加载策略
        const delay = this.calculateOptimalDelay();
        
        console.log(`📅 Scheduling non-critical CSS loading with ${delay}ms delay`);
        
        // 多种触发机制确保CSS能够加载
        this.setupMultipleTriggers(delay);
        
        // 设置性能监控
        this.monitorCSSLoadingPerformance();
    }
    
    /**
     * 计算最优延迟时间
     */
    calculateOptimalDelay() {
        let baseDelay = this.config.deferLoadDelay;
        
        // 根据设备能力调整
        if (this.deviceCapabilities.isSlowConnection) {
            baseDelay *= 3;
        } else if (this.deviceCapabilities.isLowEnd) {
            baseDelay *= 2;
        }
        
        // 根据页面复杂度调整
        const pageComplexity = this.assessPageComplexity();
        baseDelay *= pageComplexity;
        
        return Math.min(baseDelay, 2000); // 最大不超过2秒
    }
    
    /**
     * 评估页面复杂度
     */
    assessPageComplexity() {
        const domNodes = document.querySelectorAll('*').length;
        const images = document.querySelectorAll('img').length;
        const scripts = document.querySelectorAll('script').length;
        
        // 基于DOM节点数量、图片数量和脚本数量计算复杂度
        let complexity = 1;
        
        if (domNodes > 500) complexity += 0.5;
        if (images > 10) complexity += 0.3;
        if (scripts > 5) complexity += 0.2;
        
        return Math.min(complexity, 2); // 最大2倍
    }
    
    /**
     * 设置多种触发机制
     */
    setupMultipleTriggers(delay) {
        // 1. 空闲时间触发（优先）
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadNonCriticalCSS();
            }, { timeout: delay * 10 });
        }
        
        // 2. 定时器触发（备用）
        setTimeout(() => {
            this.loadNonCriticalCSS();
        }, delay);
        
        // 3. 页面加载完成触发
        if (document.readyState === 'complete') {
            setTimeout(() => this.loadNonCriticalCSS(), delay / 2);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.loadNonCriticalCSS(), delay / 2);
            });
        }
        
        // 4. 用户交互触发（鼠标移动、滚动等）
        this.setupInteractionTriggers(delay);
    }
    
    /**
     * 设置交互触发器
     */
    setupInteractionTriggers(delay) {
        let interactionTriggered = false;
        
        const triggerLoad = () => {
            if (!interactionTriggered) {
                interactionTriggered = true;
                console.log('🖱️ User interaction detected, loading non-critical CSS');
                setTimeout(() => this.loadNonCriticalCSS(), 50);
            }
        };
        
        // 监听各种用户交互
        const events = ['mousemove', 'scroll', 'touchstart', 'click', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, triggerLoad, { 
                once: true, 
                passive: true 
            });
        });
        
        // 清理未使用的监听器
        setTimeout(() => {
            events.forEach(event => {
                document.removeEventListener(event, triggerLoad);
            });
        }, delay * 2);
    }
    
    /**
     * 监控CSS加载性能
     */
    monitorCSSLoadingPerformance() {
        const startTime = performance.now();
        
        document.addEventListener('cssOptimized', (event) => {
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            console.log(`📊 CSS loading performance: ${loadTime.toFixed(2)}ms`);
            
            // 记录性能指标
            if (window.performanceMonitor) {
                window.performanceMonitor.recordCustomMetric('cssLoadTime', loadTime);
            }
            
            // 如果加载时间过长，记录警告
            if (loadTime > 1000) {
                console.warn(`⚠️ CSS loading took ${loadTime.toFixed(2)}ms, consider optimization`);
            }
        });
    }
    
    /**
     * 加载非关键CSS
     */
    async loadNonCriticalCSS() {
        console.log('🔄 Loading non-critical CSS...');
        
        const filesToLoad = new Set();
        
        // 添加通用非关键文件（排除移动端专用文件）
        this.config.nonCriticalFiles.forEach(file => {
            // 移动端专用CSS只在移动设备上加载
            if (file.includes('mobile-') && !this.shouldLoadMobileCSS()) {
                console.log(`📱 Skipping mobile CSS on desktop: ${file}`);
                return;
            }
            filesToLoad.add(file);
        });
        
        // 添加页面特定的CSS文件
        const pageSpecificFiles = this.config.conditionalFiles[this.currentPageType];
        if (pageSpecificFiles) {
            pageSpecificFiles.forEach(file => {
                // 移动端专用CSS只在移动设备上加载
                if (file.includes('mobile-') && !this.shouldLoadMobileCSS()) {
                    console.log(`📱 Skipping mobile CSS on desktop: ${file}`);
                    return;
                }
                filesToLoad.add(file);
            });
        }
        
        // 如果是移动设备，添加移动端优化CSS
        if (this.shouldLoadMobileCSS()) {
            const mobileFiles = this.config.conditionalFiles['mobile'] || [];
            mobileFiles.forEach(file => filesToLoad.add(file));
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
     * 异步加载CSS文件（增强版本，支持重试和降级处理）
     */
    loadCSSAsync(href) {
        if (this.loadedCSS.has(href)) {
            return Promise.resolve();
        }
        
        if (this.loadingPromises.has(href)) {
            return this.loadingPromises.get(href);
        }
        
        const promise = this.loadCSSWithRetry(href, 3);
        this.loadingPromises.set(href, promise);
        return promise;
    }
    
    /**
     * 带重试机制的CSS加载
     */
    async loadCSSWithRetry(href, maxRetries = 3) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.loadSingleCSS(href, attempt);
                this.loadedCSS.add(href);
                console.log(`📄 Loaded CSS: ${href} (attempt ${attempt})`);
                return;
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ CSS load attempt ${attempt} failed for ${href}:`, error.message);
                
                // 如果不是最后一次尝试，等待一段时间后重试
                if (attempt < maxRetries) {
                    await this.delay(1000 * attempt); // 递增延迟
                }
            }
        }
        
        // 所有重试都失败，尝试降级处理
        if (this.config.enableFallbackHandling) {
            console.error(`❌ All CSS load attempts failed for ${href}, attempting fallback`);
            await this.handleCSSLoadFailure(href, lastError);
        }
        throw lastError;
    }
    
    /**
     * 加载单个CSS文件
     */
    loadSingleCSS(href, attempt = 1) {
        return new Promise((resolve, reject) => {
            // 检查是否已经存在该样式表
            const existingLink = document.querySelector(`link[href*="${href.split('/').pop()}"]`);
            if (existingLink && existingLink.sheet) {
                resolve();
                return;
            }
            
            // 构建完整的URL路径
            const fullUrl = href.startsWith('http') ? href : `${window.location.origin}/${href}`;
            const testUrl = this.addCacheBuster(fullUrl, attempt);
            
            // 先进行HEAD请求检查文件是否存在
            fetch(testUrl, { 
                method: 'HEAD',
                cache: 'no-cache'
            })
                .then(response => {
                    if (!response.ok) {
                        console.warn(`⚠️ CSS file not found: ${href} (${response.status})`);
                        // 文件不存在时直接resolve，避免阻塞其他CSS加载
                        resolve();
                        return;
                    }
                    
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = fullUrl;
                    link.media = 'print'; // 先设置为print避免阻塞渲染
                    
                    // 设置超时
                    const timeout = setTimeout(() => {
                        console.warn(`⚠️ CSS load timeout: ${href}`);
                        // 超时时也resolve，避免阻塞
                        resolve();
                    }, 3000); // 减少到3秒超时
                    
                    link.onload = () => {
                        clearTimeout(timeout);
                        link.media = 'all'; // 加载完成后切换为all
                        console.log(`✅ CSS loaded successfully: ${href}`);
                        resolve();
                    };
                    
                    link.onerror = (error) => {
                        clearTimeout(timeout);
                        console.warn(`⚠️ CSS load error: ${href} - ${error.message || 'Unknown error'}`);
                        // 错误时也resolve，避免阻塞其他CSS加载
                        resolve();
                    };
                    
                    // 添加到head
                    document.head.appendChild(link);
                })
                .catch(error => {
                    console.warn(`⚠️ CSS file check failed for ${href}:`, error.message);
                    // 网络错误时也resolve，避免阻塞
                    resolve();
                });
        });
    }
    
    /**
     * 添加缓存破坏参数（仅在重试时使用）
     */
    addCacheBuster(href, attempt) {
        if (attempt === 1) {
            return href; // 第一次尝试不添加缓存破坏参数
        }
        
        const separator = href.includes('?') ? '&' : '?';
        return `${href}${separator}retry=${attempt}&t=${Date.now()}`;
    }
    
    /**
     * 处理CSS加载失败的降级策略
     */
    async handleCSSLoadFailure(href, error) {
        console.log(`🔄 Attempting CSS load fallback for: ${href}`);
        
        // 尝试从备用CDN加载（如果配置了）
        const fallbackUrl = this.getFallbackCSSUrl(href);
        if (fallbackUrl && fallbackUrl !== href) {
            try {
                await this.loadSingleCSS(fallbackUrl);
                console.log(`✅ CSS loaded from fallback URL: ${fallbackUrl}`);
                return;
            } catch (fallbackError) {
                console.warn(`⚠️ Fallback CSS load also failed: ${fallbackUrl}`);
            }
        }
        
        // 最后的降级：内联基础样式
        this.inlineBasicFallbackCSS(href);
    }
    
    /**
     * 获取备用CSS URL
     */
    getFallbackCSSUrl(href) {
        // 可以配置备用CDN或本地备份
        const fallbackMappings = {
            'css/blog.css': 'css/blog-fallback.css',
            'css/simulator.css': 'css/simulator-fallback.css'
        };
        
        return fallbackMappings[href] || null;
    }
    
    /**
     * 内联基础降级CSS
     */
    inlineBasicFallbackCSS(href) {
        console.log(`📝 Inlining basic fallback CSS for: ${href}`);
        
        const fallbackCSS = this.getBasicFallbackCSS(href);
        if (fallbackCSS) {
            const style = document.createElement('style');
            style.setAttribute('data-fallback-for', href);
            style.textContent = fallbackCSS;
            document.head.appendChild(style);
            
            console.log(`✅ Basic fallback CSS inlined for: ${href}`);
        }
    }
    
    /**
     * 获取基础降级CSS
     */
    getBasicFallbackCSS(href) {
        const fallbackStyles = {
            'css/blog.css': `
                .blog-content { max-width: 800px; margin: 0 auto; padding: 1rem; }
                .blog-post { line-height: 1.6; }
                .blog-header { margin-bottom: 2rem; }
                .blog-title { font-size: 2rem; margin-bottom: 1rem; }
            `,
            'css/simulator.css': `
                .simulator-container { padding: 1rem; }
                .simulator-controls { margin-bottom: 1rem; }
                .simulator-frame { border: 1px solid #ccc; }
            `,
            'css/comparison.css': `
                .comparison-container { padding: 1rem; }
                .comparison-table { width: 100%; border-collapse: collapse; }
                .comparison-table th, .comparison-table td { 
                    padding: 0.5rem; border: 1px solid #ddd; 
                }
            `,
            'css/blog-progress.css': `
                .blog-progress { 
                    position: fixed; top: 0; left: 0; right: 0; 
                    height: 3px; background: #007bff; z-index: 1000; 
                }
            `
        };
        
        return fallbackStyles[href] || '';
    }
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        // 确保CSS变量在关键CSS中定义，但不覆盖主题变量
        const cssVariables = `
            /* 性能优化的通用类 - 不影响主题变量 */
            .gpu-accelerated {
                transform: translateZ(0);
                will-change: transform;
            }
            
            .reduce-motion {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            /* 性能优化的CSS变量 - 使用不同的命名空间避免冲突 */
            :root {
                --perf-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                --perf-transition: 0.15s ease;
                --perf-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                --perf-border-radius: 8px;
                --perf-header-height: 64px;
                --perf-content-max-width: 1200px;
                --perf-card-padding: 1.5rem;
                --perf-grid-gap: 2rem;
            }
        `;
        
        const style = document.createElement('style');
        style.setAttribute('data-css-variables', 'optimized');
        style.setAttribute('data-no-theme-conflict', 'true');
        style.textContent = cssVariables;
        document.head.appendChild(style);
    }
    
    /**
     * 消除CSS渲染阻塞
     */
    eliminateRenderBlocking() {
        console.log('🚫 Eliminating CSS render blocking...');
        
        // 查找所有阻塞渲染的CSS链接
        const blockingLinks = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
        
        blockingLinks.forEach(link => {
            const href = link.href;
            
            // 跳过已经处理的关键CSS文件，确保主题相关的CSS不被影响
            if (this.config.criticalFiles.some(file => href.includes(file))) {
                console.log(`🔒 Keeping critical CSS blocking: ${href}`);
                return;
            }
            
            // 将非关键CSS设置为非阻塞
            if (this.config.nonCriticalFiles.some(file => href.includes(file))) {
                console.log(`🔄 Making CSS non-blocking: ${href}`);
                
                // 使用media="print"技巧避免阻塞渲染
                link.media = 'print';
                link.onload = function() {
                    this.media = 'all';
                };
                
                // 添加noscript标签作为降级
                const noscript = document.createElement('noscript');
                const fallbackLink = link.cloneNode();
                fallbackLink.media = 'all';
                noscript.appendChild(fallbackLink);
                link.parentNode.insertBefore(noscript, link.nextSibling);
            }
        });
    }
    
    /**
     * 实现CSS文件压缩和缓存优化
     */
    enableCSSCompressionAndCaching() {
        if (!this.config.enableCSSCompression && !this.config.enableCSSCaching) {
            return;
        }
        
        console.log('🗜️ Enabling CSS compression and caching...');
        
        // 启用CSS压缩
        if (this.config.enableCSSCompression) {
            this.enableCSSCompression();
        }
        
        // 设置缓存控制
        if (this.config.enableCSSCaching) {
            this.setupCSSCaching();
        }
    }
    
    /**
     * 启用CSS压缩
     */
    enableCSSCompression() {
        console.log('🗜️ CSS compression enabled');
        
        // 压缩已加载的CSS
        this.compressLoadedCSS();
        
        // 设置未来加载的CSS自动压缩
        this.setupAutomaticCSSCompression();
    }
    
    /**
     * 压缩已加载的CSS
     */
    compressLoadedCSS() {
        const styleSheets = document.styleSheets;
        
        for (let i = 0; i < styleSheets.length; i++) {
            const styleSheet = styleSheets[i];
            
            try {
                if (styleSheet.ownerNode && styleSheet.ownerNode.tagName === 'STYLE') {
                    const originalCSS = styleSheet.ownerNode.textContent;
                    const compressedCSS = this.minifyCSS(originalCSS);
                    
                    if (compressedCSS.length < originalCSS.length) {
                        styleSheet.ownerNode.textContent = compressedCSS;
                        console.log(`🗜️ Compressed inline CSS: ${originalCSS.length} → ${compressedCSS.length} bytes`);
                    }
                }
            } catch (error) {
                // 跨域样式表无法访问
                console.warn('⚠️ Cannot compress cross-origin stylesheet');
            }
        }
    }
    
    /**
     * 设置自动CSS压缩
     */
    setupAutomaticCSSCompression() {
        // 监听新添加的样式表
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'STYLE' && node.textContent) {
                        // 跳过关键CSS和主题相关的CSS，避免影响主题切换
                        if (node.hasAttribute('data-critical') || 
                            node.hasAttribute('data-no-theme-conflict') ||
                            node.textContent.includes('[data-theme') ||
                            node.textContent.includes('--primary-color') ||
                            node.textContent.includes('--background-primary')) {
                            return;
                        }
                        
                        const originalCSS = node.textContent;
                        const compressedCSS = this.minifyCSS(originalCSS);
                        
                        if (compressedCSS.length < originalCSS.length) {
                            node.textContent = compressedCSS;
                            console.log(`🗜️ Auto-compressed CSS: ${originalCSS.length} → ${compressedCSS.length} bytes`);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.head, {
            childList: true,
            subtree: true
        });
        
        // 清理观察器
        setTimeout(() => {
            observer.disconnect();
        }, 30000); // 30秒后停止观察
    }
    
    /**
     * 设置CSS缓存
     */
    setupCSSCaching() {
        console.log('⚙️ Setting up CSS caching...');
        
        // 实现CSS文件的智能缓存
        this.implementIntelligentCSSCaching();
        
        // 设置缓存失效策略
        this.setupCacheInvalidation();
    }
    
    /**
     * 实现智能CSS缓存
     */
    implementIntelligentCSSCaching() {
        const cacheStorage = this.getCacheStorage();
        
        // 缓存关键CSS
        if (this.criticalCSS) {
            cacheStorage.set('critical-css', {
                content: this.criticalCSS,
                timestamp: Date.now(),
                pageType: this.currentPageType
            });
        }
        
        // 缓存非关键CSS加载状态
        cacheStorage.set('non-critical-css-status', {
            loadedFiles: Array.from(this.loadedCSS),
            timestamp: Date.now()
        });
    }
    
    /**
     * 设置缓存失效策略
     */
    setupCacheInvalidation() {
        // 页面卸载时清理缓存
        window.addEventListener('beforeunload', () => {
            this.cleanupExpiredCache();
        });
        
        // 定期清理过期缓存
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 300000); // 5分钟清理一次
    }
    
    /**
     * 清理过期缓存
     */
    cleanupExpiredCache() {
        console.log('🧹 Cleaning up expired CSS cache...');
        // 这里可以实现更复杂的缓存清理逻辑
    }
    
    /**
     * 提升首次内容绘制时间
     */
    improveFCP() {
        console.log('⚡ Improving First Contentful Paint...');
        
        // 确保关键CSS优先加载
        this.prioritizeCriticalCSS();
        
        // 延迟非关键CSS
        this.deferNonCriticalCSS();
        
        // 优化CSS加载顺序
        this.optimizeCSSLoadOrder();
    }
    
    /**
     * 优先加载关键CSS
     */
    prioritizeCriticalCSS() {
        // 确保关键CSS在页面头部最前面
        const criticalStyle = document.querySelector('style[data-critical="true"]');
        if (criticalStyle) {
            const firstChild = document.head.firstChild;
            if (firstChild !== criticalStyle) {
                document.head.insertBefore(criticalStyle, firstChild);
            }
        }
    }
    
    /**
     * 延迟非关键CSS
     */
    deferNonCriticalCSS() {
        // 将所有非关键CSS设置为延迟加载
        const nonCriticalLinks = document.querySelectorAll('link[rel="stylesheet"]');
        
        nonCriticalLinks.forEach(link => {
            const href = link.href;
            
            // 跳过关键CSS文件，确保主题相关的CSS不被延迟
            if (this.config.criticalFiles.some(file => href.includes(file))) {
                return;
            }
            
            // 检查是否为非关键CSS
            if (this.config.nonCriticalFiles.some(file => href.includes(file))) {
                // 使用preload + onload技巧
                link.rel = 'preload';
                link.as = 'style';
                link.onload = function() {
                    this.rel = 'stylesheet';
                };
            }
        });
    }
    
    /**
     * 优化CSS加载顺序
     */
    optimizeCSSLoadOrder() {
        // 重新排序CSS文件以优化加载，但保持关键CSS的原始位置
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]'));
        
        // 分离关键CSS和非关键CSS
        const criticalLinks = [];
        const nonCriticalLinks = [];
        
        links.forEach(link => {
            const href = link.href;
            if (this.config.criticalFiles.some(file => href.includes(file))) {
                criticalLinks.push(link);
            } else {
                nonCriticalLinks.push(link);
            }
        });
        
        // 只对非关键CSS进行重新排序，保持关键CSS的原始位置
        nonCriticalLinks.sort((a, b) => {
            const aPriority = this.getCSSPriority(a.href);
            const bPriority = this.getCSSPriority(b.href);
            return bPriority - aPriority; // 高优先级在前
        });
        
        console.log(`📊 CSS load order: ${criticalLinks.length} critical, ${nonCriticalLinks.length} non-critical`);
    }
    
    /**
     * 获取CSS优先级
     */
    getCSSPriority(href) {
        if (this.config.criticalFiles.some(file => href.includes(file))) {
            return 100; // 最高优先级
        }
        
        if (href.includes('base.css') || href.includes('main.css')) {
            return 90;
        }
        
        if (this.config.conditionalFiles[this.currentPageType]?.some(file => href.includes(file))) {
            return 70; // 页面特定CSS
        }
        
        return 50; // 默认优先级
    }
    
    /**
     * 获取缓存存储
     */
    getCacheStorage() {
        if (this._cacheStorage) {
            return this._cacheStorage;
        }
        
        const storage = new Map();
        const prefix = 'css-optimizer-';
        
        this._cacheStorage = {
            set: (key, value) => {
                try {
                    sessionStorage.setItem(prefix + key, JSON.stringify(value));
                    storage.set(key, value);
                } catch (error) {
                    console.warn('⚠️ Failed to cache CSS data:', error);
                    storage.set(key, value); // 至少保存在内存中
                }
            },
            get: (key) => {
                try {
                    const cached = sessionStorage.getItem(prefix + key);
                    return cached ? JSON.parse(cached) : storage.get(key);
                } catch (error) {
                    return storage.get(key);
                }
            },
            clear: () => {
                storage.clear();
                Object.keys(sessionStorage).forEach(key => {
                    if (key.startsWith(prefix)) {
                        sessionStorage.removeItem(key);
                    }
                });
            }
        };
        
        return this._cacheStorage;
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
                timestamp: Date.now(),
                optimizationStats: this.getOptimizationStats()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * 判断是否应该加载移动端CSS
     */
    shouldLoadMobileCSS() {
        // 检查是否有移动端性能优化器
        if (window.mobilePerformanceOptimizer) {
            return window.mobilePerformanceOptimizer.isRealMobileDevice();
        }
        
        // 如果没有移动端优化器，使用简单的检测逻辑
        if (window.isMobileDevice) {
            return window.isMobileDevice();
        }
        
        // 后备检测逻辑
        const userAgent = navigator.userAgent.toLowerCase();
        const mobilePatterns = [/android.*mobile/i, /iphone/i, /ipod/i, /mobile/i];
        const hasMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
        const hasSmallScreen = window.innerWidth <= 768;
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return hasMobileUA && hasSmallScreen && hasTouchSupport;
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
            optimizationLevel: this.deviceCapabilities.isLowEnd ? 'aggressive' : 'standard',
            isMobileOptimized: this.shouldLoadMobileCSS()
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