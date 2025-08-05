/**
 * 性能错误处理和降级系统
 * 处理资源加载失败、模块加载失败等场景的降级策略
 */
class PerformanceErrorHandler {
    constructor(config = {}) {
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            enableFallback: true,
            enableLogging: true,
            reportErrors: true,
            ...config
        };
        
        this.errorQueue = [];
        this.retryAttempts = new Map();
        this.fallbackStrategies = new Map();
        this.cdnFallbacks = new Map();
        this.errorStats = {
            resourceErrors: 0,
            moduleErrors: 0,
            performanceErrors: 0,
            totalErrors: 0
        };
        
        this.initializeFallbackStrategies();
        this.initializeCDNFallbacks();
        this.setupErrorListeners();
    }
    
    // 初始化降级策略
    initializeFallbackStrategies() {
        // 资源加载失败的降级策略
        this.fallbackStrategies.set('css', {
            fallback: this.handleCSSLoadFailure.bind(this),
            essential: ['css/base.css', 'css/main.css'],
            optional: ['css/blog.css', 'css/simulator.css']
        });
        
        this.fallbackStrategies.set('js', {
            fallback: this.handleJSLoadFailure.bind(this),
            essential: ['js/app.js', 'js/device-detector.js'],
            optional: ['js/blog.js', 'js/simulator.js']
        });
        
        this.fallbackStrategies.set('font', {
            fallback: this.handleFontLoadFailure.bind(this),
            essential: [],
            optional: ['google-fonts']
        });
        
        this.fallbackStrategies.set('image', {
            fallback: this.handleImageLoadFailure.bind(this),
            essential: [],
            optional: ['blog-images', 'device-images']
        });
    }
    
    // 初始化CDN降级配置
    initializeCDNFallbacks() {
        // 主CDN失败时的备用CDN
        this.cdnFallbacks.set('primary', {
            baseUrl: '',
            fallbacks: [
                'https://cdn.jsdelivr.net/gh/your-repo/',
                'https://unpkg.com/your-package/',
                './assets/' // 本地备份
            ]
        });
        
        this.cdnFallbacks.set('fonts', {
            baseUrl: 'https://fonts.googleapis.com/',
            fallbacks: [
                'https://fonts.gstatic.com/',
                './fonts/' // 本地字体备份
            ]
        });
    }
    
    // 设置错误监听器
    setupErrorListeners() {
        // 监听资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event);
            }
        }, true);
        
        // 监听未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event);
        });
        
        // 监听性能监控错误
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    // 监控性能API错误
                });
                observer.observe({ entryTypes: ['navigation', 'resource'] });
            } catch (error) {
                this.logError('PerformanceObserver setup failed', error);
            }
        }
    }
    
    // 处理资源加载错误
    async handleResourceError(event) {
        const element = event.target;
        const resourceUrl = element.src || element.href;
        const resourceType = this.getResourceType(element);
        
        this.errorStats.resourceErrors++;
        this.errorStats.totalErrors++;
        
        this.logError(`Resource load failed: ${resourceUrl}`, {
            type: resourceType,
            element: element.tagName,
            url: resourceUrl
        });
        
        // 尝试重试或降级
        const success = await this.retryOrFallback(resourceUrl, resourceType, element);
        
        if (!success) {
            this.applyFallbackStrategy(resourceType, resourceUrl, element);
        }
    }
    
    // 获取资源类型
    getResourceType(element) {
        if (element.tagName === 'SCRIPT') return 'js';
        if (element.tagName === 'LINK' && element.rel === 'stylesheet') return 'css';
        if (element.tagName === 'IMG') return 'image';
        if (element.tagName === 'LINK' && element.href.includes('fonts')) return 'font';
        return 'unknown';
    }
    
    // 重试或降级处理
    async retryOrFallback(url, type, element) {
        const retryKey = `${type}:${url}`;
        const currentAttempts = this.retryAttempts.get(retryKey) || 0;
        
        if (currentAttempts < this.config.maxRetries) {
            // 尝试重试
            this.retryAttempts.set(retryKey, currentAttempts + 1);
            
            // 延迟后重试
            await this.delay(this.config.retryDelay * (currentAttempts + 1));
            
            return this.retryResourceLoad(url, type, element);
        }
        
        return false;
    }
    
    // 重试资源加载
    retryResourceLoad(url, type, element) {
        return new Promise((resolve) => {
            const newElement = element.cloneNode(true);
            
            newElement.onload = () => {
                this.logInfo(`Resource retry successful: ${url}`);
                resolve(true);
            };
            
            newElement.onerror = () => {
                this.logError(`Resource retry failed: ${url}`);
                resolve(false);
            };
            
            // 尝试使用备用CDN
            const fallbackUrl = this.getFallbackUrl(url, type);
            if (fallbackUrl && fallbackUrl !== url) {
                if (newElement.src) newElement.src = fallbackUrl;
                if (newElement.href) newElement.href = fallbackUrl;
            }
            
            // 替换原元素
            element.parentNode.replaceChild(newElement, element);
        });
    }
    
    // 获取备用URL
    getFallbackUrl(originalUrl, type) {
        const cdnConfig = this.cdnFallbacks.get('primary');
        if (!cdnConfig) return null;
        
        // 提取相对路径
        const relativePath = originalUrl.replace(/^https?:\/\/[^\/]+/, '');
        
        // 尝试备用CDN
        for (const fallbackBase of cdnConfig.fallbacks) {
            if (!originalUrl.startsWith(fallbackBase)) {
                return fallbackBase + relativePath;
            }
        }
        
        return null;
    }
    
    // 应用降级策略
    applyFallbackStrategy(type, url, element) {
        const strategy = this.fallbackStrategies.get(type);
        if (!strategy) {
            this.logError(`No fallback strategy for type: ${type}`);
            return;
        }
        
        try {
            strategy.fallback(url, element);
        } catch (error) {
            this.logError(`Fallback strategy failed for ${type}:`, error);
        }
    }
    
    // CSS加载失败处理
    handleCSSLoadFailure(url, element) {
        const fileName = url.split('/').pop();
        
        // 检查是否为关键CSS
        const strategy = this.fallbackStrategies.get('css');
        const isEssential = strategy.essential.some(essential => url.includes(essential));
        
        if (isEssential) {
            // 关键CSS失败，使用内联样式降级
            this.applyMinimalCSS();
        } else {
            // 非关键CSS失败，记录但不影响核心功能
            this.logInfo(`Non-critical CSS failed, continuing: ${url}`);
        }
        
        // 移除失败的link元素
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    
    // 应用最小化CSS
    applyMinimalCSS() {
        const minimalCSS = `
            /* 最小化样式确保基本可用性 */
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background: #fff;
                color: #333;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .header {
                border-bottom: 1px solid #eee;
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            
            .info-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                background: #f9f9f9;
            }
            
            .copy-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .copy-btn:hover {
                background: #0056b3;
            }
            
            @media (max-width: 768px) {
                body { padding: 10px; }
                .container { padding: 0 10px; }
                .info-card { margin: 10px 0; padding: 15px; }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = minimalCSS;
        style.setAttribute('data-fallback', 'minimal-css');
        document.head.appendChild(style);
        
        this.logInfo('Applied minimal CSS fallback');
    }
    
    // JavaScript加载失败处理
    handleJSLoadFailure(url, element) {
        const fileName = url.split('/').pop().replace('.js', '');
        
        // 检查是否为关键JS
        const strategy = this.fallbackStrategies.get('js');
        const isEssential = strategy.essential.some(essential => url.includes(essential));
        
        if (isEssential) {
            // 关键JS失败，提供简化版本
            this.provideSimplifiedJS(fileName);
        } else {
            // 非关键JS失败，禁用相关功能
            this.disableOptionalFeature(fileName);
        }
        
        this.errorStats.moduleErrors++;
    }
    
    // 提供简化版本的JS功能
    provideSimplifiedJS(moduleName) {
        switch (moduleName) {
            case 'device-detector':
                this.provideBasicDeviceDetection();
                break;
            case 'app':
                this.provideBasicAppFunctionality();
                break;
            default:
                this.logError(`No simplified version available for: ${moduleName}`);
        }
    }
    
    // 提供基本设备检测功能
    provideBasicDeviceDetection() {
        window.DeviceDetector = {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            
            getDeviceInfo() {
                return {
                    width: this.screenWidth,
                    height: this.screenHeight,
                    pixelRatio: this.pixelRatio,
                    isMobile: this.isMobile
                };
            }
        };
        
        this.logInfo('Applied basic device detection fallback');
    }
    
    // 提供基本应用功能
    provideBasicAppFunctionality() {
        // 基本的复制功能
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('copy-btn')) {
                const textToCopy = event.target.getAttribute('data-copy') || 
                                 event.target.previousElementSibling?.textContent;
                
                if (textToCopy && navigator.clipboard) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        event.target.textContent = '已复制!';
                        setTimeout(() => {
                            event.target.textContent = '复制';
                        }, 2000);
                    }).catch(() => {
                        // 降级到传统复制方法
                        this.fallbackCopy(textToCopy, event.target);
                    });
                }
            }
        });
        
        this.logInfo('Applied basic app functionality fallback');
    }
    
    // 降级复制方法
    fallbackCopy(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            button.textContent = '已复制!';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        } catch (error) {
            button.textContent = '复制失败';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        }
        
        document.body.removeChild(textArea);
    }
    
    // 禁用可选功能
    disableOptionalFeature(moduleName) {
        const featureMap = {
            'blog': () => this.disableBlogFeatures(),
            'simulator': () => this.disableSimulatorFeatures(),
            'ppi-calculator': () => this.disableCalculatorFeatures(),
            'blog-progress': () => this.disableProgressFeatures()
        };
        
        const disableFunction = featureMap[moduleName];
        if (disableFunction) {
            disableFunction();
            this.logInfo(`Disabled optional feature: ${moduleName}`);
        }
    }
    
    // 禁用博客功能
    disableBlogFeatures() {
        // 隐藏博客相关的交互元素
        const blogElements = document.querySelectorAll('.blog-interactive, .blog-progress');
        blogElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // 显示降级提示
        this.showFeatureUnavailableMessage('博客交互功能');
    }
    
    // 禁用模拟器功能
    disableSimulatorFeatures() {
        const simulatorElements = document.querySelectorAll('.simulator-controls, .device-comparison');
        simulatorElements.forEach(element => {
            element.style.display = 'none';
        });
        
        this.showFeatureUnavailableMessage('设备模拟器');
    }
    
    // 禁用计算器功能
    disableCalculatorFeatures() {
        const calculatorElements = document.querySelectorAll('.calculator-form, .ppi-calculator');
        calculatorElements.forEach(element => {
            element.style.display = 'none';
        });
        
        this.showFeatureUnavailableMessage('PPI计算器');
    }
    
    // 禁用进度功能
    disableProgressFeatures() {
        const progressElements = document.querySelectorAll('.reading-progress, .scroll-indicator');
        progressElements.forEach(element => {
            element.style.display = 'none';
        });
    }
    
    // 显示功能不可用消息
    showFeatureUnavailableMessage(featureName) {
        const message = document.createElement('div');
        message.className = 'feature-unavailable-notice';
        message.innerHTML = `
            <div style="
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 4px;
                padding: 12px;
                margin: 10px 0;
                color: #856404;
                font-size: 14px;
            ">
                <strong>注意：</strong> ${featureName}暂时不可用，但不影响核心功能的使用。
            </div>
        `;
        
        // 插入到相关容器中
        const container = document.querySelector('.main-content') || document.body;
        container.insertBefore(message, container.firstChild);
    }
    
    // 字体加载失败处理
    handleFontLoadFailure(url, element) {
        // 使用系统字体作为降级
        const fallbackFontCSS = `
            body, * {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                           Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = fallbackFontCSS;
        style.setAttribute('data-fallback', 'system-fonts');
        document.head.appendChild(style);
        
        this.logInfo('Applied system font fallback');
    }
    
    // 图片加载失败处理
    handleImageLoadFailure(url, element) {
        // 使用占位符图片
        const placeholder = this.createImagePlaceholder(element);
        element.parentNode.replaceChild(placeholder, element);
    }
    
    // 创建图片占位符
    createImagePlaceholder(originalImg) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.cssText = `
            width: ${originalImg.width || 200}px;
            height: ${originalImg.height || 150}px;
            background: #f0f0f0;
            border: 2px dashed #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 14px;
            text-align: center;
        `;
        placeholder.textContent = '图片加载失败';
        
        return placeholder;
    }
    
    // 处理Promise拒绝
    handlePromiseRejection(event) {
        this.logError('Unhandled promise rejection:', event.reason);
        this.errorStats.performanceErrors++;
        this.errorStats.totalErrors++;
        
        // 防止错误传播到控制台
        event.preventDefault();
    }
    
    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 错误日志记录
    logError(message, details = null) {
        if (!this.config.enableLogging) return;
        
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message,
            details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('[PerformanceErrorHandler]', message, details);
        
        // 添加到错误队列
        this.errorQueue.push(errorInfo);
        
        // 限制队列大小
        if (this.errorQueue.length > 100) {
            this.errorQueue.shift();
        }
        
        // 报告错误（如果启用）
        if (this.config.reportErrors) {
            this.reportError(errorInfo);
        }
    }
    
    // 信息日志记录
    logInfo(message, details = null) {
        if (!this.config.enableLogging) return;
        console.info('[PerformanceErrorHandler]', message, details);
    }
    
    // 报告错误到监控系统
    reportError(errorInfo) {
        // 这里可以集成到错误监控服务
        // 例如：Sentry, LogRocket, 或自定义监控系统
        
        // 简单的本地存储报告
        try {
            const errors = JSON.parse(localStorage.getItem('performance_errors') || '[]');
            errors.push(errorInfo);
            
            // 只保留最近的50个错误
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('performance_errors', JSON.stringify(errors));
        } catch (e) {
            // 忽略存储错误
        }
    }
    
    // 获取错误统计
    getErrorStats() {
        return {
            ...this.errorStats,
            errorQueue: this.errorQueue.length,
            retryAttempts: this.retryAttempts.size
        };
    }
    
    // 清理错误队列
    clearErrorQueue() {
        this.errorQueue = [];
        this.retryAttempts.clear();
    }
    
    // 获取健康状态
    getHealthStatus() {
        const totalErrors = this.errorStats.totalErrors;
        const errorRate = totalErrors / (Date.now() - this.startTime) * 1000; // 每秒错误数
        
        let status = 'healthy';
        if (errorRate > 1) {
            status = 'critical';
        } else if (errorRate > 0.1) {
            status = 'warning';
        }
        
        return {
            status,
            errorRate,
            totalErrors,
            uptime: Date.now() - this.startTime
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceErrorHandler;
} else {
    window.PerformanceErrorHandler = PerformanceErrorHandler;
}