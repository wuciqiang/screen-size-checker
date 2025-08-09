// optimized-event-manager.js - 优化的事件处理和交互性能管理系统

console.log('🎯 Loading OptimizedEventManager...');

/**
 * 优化的事件管理器类
 * 实现事件防抖、节流、委托和性能监控
 */
class OptimizedEventManager {
    constructor(config = {}) {
        this.config = {
            // 防抖延迟配置
            debounceDelays: {
                resize: 100,
                scroll: 16,
                input: 300,
                search: 500,
                languageChange: 150
            },
            // 节流延迟配置
            throttleDelays: {
                mousemove: 16,
                touchmove: 16,
                scroll: 16,
                resize: 100
            },
            // 长任务阈值
            longTaskThreshold: 50,
            // 是否启用性能监控
            enablePerformanceMonitoring: true,
            // 是否使用passive监听器
            usePassiveListeners: true,
            ...config
        };
        
        // 防抖定时器存储
        this.debounceTimers = new Map();
        
        // 节流状态存储
        this.throttleStates = new Map();
        
        // 事件监听器注册表
        this.eventListeners = new Map();
        
        // 性能监控数据
        this.performanceMetrics = {
            eventCounts: new Map(),
            eventDurations: new Map(),
            longTasks: [],
            totalEvents: 0,
            averageEventDuration: 0
        };
        
        // 初始化
        this.initialize();
    }
    
    /**
     * 初始化事件管理器
     */
    initialize() {
        console.log('🚀 Initializing OptimizedEventManager...');
        
        // 设置全局事件委托
        this.setupGlobalEventDelegation();
        
        // 设置性能监控
        if (this.config.enablePerformanceMonitoring) {
            this.setupPerformanceMonitoring();
        }
        
        // 设置优化的事件监听器
        this.setupOptimizedEventListeners();
        
        console.log('✅ OptimizedEventManager initialized successfully');
    }
    
    /**
     * 设置全局事件委托
     */
    setupGlobalEventDelegation() {
        // 点击事件委托
        document.addEventListener('click', this.handleDelegatedClick.bind(this), {
            passive: false,
            capture: false
        });
        
        // 输入事件委托
        document.addEventListener('input', this.handleDelegatedInput.bind(this), {
            passive: true
        });
        
        // 变更事件委托
        document.addEventListener('change', this.handleDelegatedChange.bind(this), {
            passive: true
        });
        
        // 触摸事件委托（移动端优化）
        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', this.handleDelegatedTouch.bind(this), {
                passive: true
            });
            
            document.addEventListener('touchmove', this.throttle(
                this.handleDelegatedTouchMove.bind(this),
                this.config.throttleDelays.touchmove
            ), {
                passive: true
            });
        }
        
        console.log('🎯 Global event delegation setup completed');
    }
    
    /**
     * 处理委托的点击事件
     */
    handleDelegatedClick(event) {
        const startTime = performance.now();
        
        try {
            // 复制按钮处理
            if (event.target.classList.contains('copy-btn') || event.target.closest('.copy-btn')) {
                this.handleCopyButtonClick(event);
                return;
            }
            
            // 主题切换按钮
            if (event.target.id === 'theme-toggle' || event.target.closest('#theme-toggle')) {
                this.handleThemeToggleClick(event);
                return;
            }
            
            // 语言选择器相关
            if (event.target.closest('.language-card') || 
                event.target.closest('#language-modal-trigger') ||
                event.target.closest('#language-modal-close')) {
                this.handleLanguageRelatedClick(event);
                return;
            }
            
            // FAQ切换
            if (event.target.closest('.faq-question')) {
                this.handleFAQToggleClick(event);
                return;
            }
            
            // 导航链接
            if (event.target.closest('.nav-link')) {
                this.handleNavigationClick(event);
                return;
            }
            
            // 工具卡片点击
            if (event.target.closest('.tool-card')) {
                this.handleToolCardClick(event);
                return;
            }
            
        } catch (error) {
            console.error('❌ Error in delegated click handler:', error);
        } finally {
            this.recordEventPerformance('click', startTime);
        }
    }
    
    /**
     * 处理委托的输入事件
     */
    handleDelegatedInput(event) {
        const startTime = performance.now();
        
        try {
            // PPI计算器输入
            if (event.target.closest('.ppi-calculator')) {
                this.debounce(() => {
                    this.handlePPICalculatorInput(event);
                }, this.config.debounceDelays.input, 'ppi-input')();
                return;
            }
            
            // 搜索输入
            if (event.target.type === 'search' || event.target.classList.contains('search-input')) {
                this.debounce(() => {
                    this.handleSearchInput(event);
                }, this.config.debounceDelays.search, 'search-input')();
                return;
            }
            
            // 一般输入处理
            this.debounce(() => {
                this.handleGeneralInput(event);
            }, this.config.debounceDelays.input, `input-${event.target.id || 'anonymous'}`)();
            
        } catch (error) {
            console.error('❌ Error in delegated input handler:', error);
        } finally {
            this.recordEventPerformance('input', startTime);
        }
    }
    
    /**
     * 处理委托的变更事件
     */
    handleDelegatedChange(event) {
        const startTime = performance.now();
        
        try {
            // 语言选择器
            if (event.target.id === 'language-select') {
                this.debounce(() => {
                    this.handleLanguageSelectChange(event);
                }, this.config.debounceDelays.languageChange, 'language-change')();
                return;
            }
            
            // 单位选择器
            if (event.target.classList.contains('unit-selector')) {
                this.handleUnitSelectorChange(event);
                return;
            }
            
        } catch (error) {
            console.error('❌ Error in delegated change handler:', error);
        } finally {
            this.recordEventPerformance('change', startTime);
        }
    }
    
    /**
     * 处理委托的触摸事件
     */
    handleDelegatedTouch(event) {
        const startTime = performance.now();
        
        try {
            // 为触摸元素添加视觉反馈
            if (event.target.closest('button, .btn, .card, .tool-card')) {
                this.addTouchFeedback(event.target);
            }
            
        } catch (error) {
            console.error('❌ Error in delegated touch handler:', error);
        } finally {
            this.recordEventPerformance('touchstart', startTime);
        }
    }
    
    /**
     * 处理委托的触摸移动事件（节流）
     */
    handleDelegatedTouchMove(event) {
        const startTime = performance.now();
        
        try {
            // 处理触摸移动逻辑
            // 这里可以添加滑动手势识别等功能
            
        } catch (error) {
            console.error('❌ Error in delegated touchmove handler:', error);
        } finally {
            this.recordEventPerformance('touchmove', startTime);
        }
    }
    
    /**
     * 设置优化的事件监听器
     */
    setupOptimizedEventListeners() {
        // 优化的窗口大小调整监听器
        this.addOptimizedListener(window, 'resize', 
            this.debounce(this.handleWindowResize.bind(this), this.config.debounceDelays.resize, 'window-resize'),
            { passive: true }
        );
        
        // 优化的滚动监听器
        this.addOptimizedListener(window, 'scroll',
            this.throttle(this.handleWindowScroll.bind(this), this.config.throttleDelays.scroll),
            { passive: true }
        );
        
        // 页面可见性变化监听器
        this.addOptimizedListener(document, 'visibilitychange',
            this.handleVisibilityChange.bind(this),
            { passive: true }
        );
        
        // 键盘事件监听器
        this.addOptimizedListener(document, 'keydown',
            this.handleKeyDown.bind(this),
            { passive: false }
        );
        
        // 页面卸载前清理
        this.addOptimizedListener(window, 'beforeunload',
            this.handleBeforeUnload.bind(this),
            { passive: true }
        );
        
        console.log('🎧 Optimized event listeners setup completed');
    }
    
    /**
     * 添加优化的事件监听器
     */
    addOptimizedListener(target, eventType, handler, options = {}) {
        const optimizedOptions = {
            passive: this.config.usePassiveListeners,
            ...options
        };
        
        target.addEventListener(eventType, handler, optimizedOptions);
        
        // 记录监听器以便后续清理
        const key = `${target.constructor.name}-${eventType}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({ target, eventType, handler, options: optimizedOptions });
    }
    
    /**
     * 防抖函数
     */
    debounce(func, delay, key = 'default') {
        return (...args) => {
            // 清除之前的定时器
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            // 设置新的定时器
            const timerId = setTimeout(() => {
                this.debounceTimers.delete(key);
                func.apply(this, args);
            }, delay);
            
            this.debounceTimers.set(key, timerId);
        };
    }
    
    /**
     * 节流函数
     */
    throttle(func, delay) {
        const key = func.name || 'anonymous';
        
        return (...args) => {
            const state = this.throttleStates.get(key);
            const now = Date.now();
            
            if (!state || (now - state.lastCall) >= delay) {
                this.throttleStates.set(key, { lastCall: now });
                return func.apply(this, args);
            }
        };
    }
    
    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        // 监控长任务
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > this.config.longTaskThreshold) {
                            this.performanceMetrics.longTasks.push({
                                duration: entry.duration,
                                startTime: entry.startTime,
                                name: entry.name || 'unknown'
                            });
                            
                            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['longtask'] });
                console.log('📊 Long task monitoring enabled');
                
            } catch (error) {
                console.warn('⚠️ Long task monitoring not supported:', error);
            }
        }
        
        // 定期报告性能指标
        setInterval(() => {
            this.reportPerformanceMetrics();
        }, 30000); // 每30秒报告一次
    }
    
    /**
     * 记录事件性能
     */
    recordEventPerformance(eventType, startTime) {
        if (!this.config.enablePerformanceMonitoring) return;
        
        const duration = performance.now() - startTime;
        
        // 更新事件计数
        const currentCount = this.performanceMetrics.eventCounts.get(eventType) || 0;
        this.performanceMetrics.eventCounts.set(eventType, currentCount + 1);
        
        // 更新事件持续时间
        const durations = this.performanceMetrics.eventDurations.get(eventType) || [];
        durations.push(duration);
        this.performanceMetrics.eventDurations.set(eventType, durations);
        
        // 更新总计数
        this.performanceMetrics.totalEvents++;
        
        // 检查是否为长任务
        if (duration > this.config.longTaskThreshold) {
            console.warn(`⚠️ Long event handler: ${eventType} took ${duration.toFixed(2)}ms`);
        }
    }
    
    /**
     * 报告性能指标
     */
    reportPerformanceMetrics() {
        const metrics = this.performanceMetrics;
        
        console.log('📊 Event Performance Metrics:', {
            totalEvents: metrics.totalEvents,
            eventTypes: Array.from(metrics.eventCounts.keys()),
            longTasks: metrics.longTasks.length,
            averageDurations: this.calculateAverageDurations()
        });
        
        // 清理旧的性能数据
        this.cleanupPerformanceData();
    }
    
    /**
     * 计算平均持续时间
     */
    calculateAverageDurations() {
        const averages = {};
        
        for (const [eventType, durations] of this.performanceMetrics.eventDurations) {
            if (durations.length > 0) {
                const sum = durations.reduce((a, b) => a + b, 0);
                averages[eventType] = (sum / durations.length).toFixed(2) + 'ms';
            }
        }
        
        return averages;
    }
    
    /**
     * 清理性能数据
     */
    cleanupPerformanceData() {
        // 只保留最近的100个长任务记录
        if (this.performanceMetrics.longTasks.length > 100) {
            this.performanceMetrics.longTasks = this.performanceMetrics.longTasks.slice(-100);
        }
        
        // 清理事件持续时间数据，只保留最近的50个记录
        for (const [eventType, durations] of this.performanceMetrics.eventDurations) {
            if (durations.length > 50) {
                this.performanceMetrics.eventDurations.set(eventType, durations.slice(-50));
            }
        }
    }
    
    // ==================== 具体事件处理方法 ====================
    
    /**
     * 处理复制按钮点击
     */
    async handleCopyButtonClick(event) {
        event.preventDefault();
        
        const button = event.target.closest('.copy-btn');
        if (!button) return;
        
        const textToCopy = button.getAttribute('data-copy') || button.textContent;
        
        try {
            // 添加视觉反馈
            button.classList.add('copying');
            
            // 执行复制
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // 降级处理
                this.fallbackCopyText(textToCopy);
            }
            
            // 成功反馈
            button.classList.remove('copying');
            button.classList.add('copied');
            
            setTimeout(() => {
                button.classList.remove('copied');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Copy failed:', error);
            button.classList.remove('copying');
            button.classList.add('copy-error');
            
            setTimeout(() => {
                button.classList.remove('copy-error');
            }, 2000);
        }
    }
    
    /**
     * 处理主题切换点击
     */
    handleThemeToggleClick(event) {
        event.preventDefault();
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // 添加过渡效果
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // 切换主题
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新按钮状态
        const button = event.target.closest('#theme-toggle');
        if (button) {
            button.setAttribute('aria-label', `Switch to ${currentTheme} theme`);
        }
        
        // 移除过渡效果
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }
    
    /**
     * 处理语言相关点击
     */
    handleLanguageRelatedClick(event) {
        // 这里可以添加语言切换的优化逻辑
        // 由于语言切换逻辑比较复杂，保持现有的处理方式
        console.log('🌐 Language-related click handled by existing system');
    }
    
    /**
     * 处理FAQ切换点击
     */
    handleFAQToggleClick(event) {
        const question = event.target.closest('.faq-question');
        if (!question) return;
        
        // 检查是否是HTML5 details/summary元素
        const detailsElement = question.closest('details');
        if (detailsElement) {
            // 对于HTML5 details/summary元素，让浏览器处理默认行为
            return;
        }
        
        // 只对自定义FAQ实现使用preventDefault
        event.preventDefault();
        
        const answer = question.nextElementSibling;
        if (!answer || !answer.classList.contains('faq-answer')) return;
        
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        
        // 切换状态
        question.setAttribute('aria-expanded', !isExpanded);
        answer.style.maxHeight = isExpanded ? '0' : answer.scrollHeight + 'px';
        
        // 添加动画类
        answer.classList.toggle('expanded', !isExpanded);
    }
    
    /**
     * 处理导航点击
     */
    handleNavigationClick(event) {
        const link = event.target.closest('.nav-link');
        if (!link) return;
        
        // 添加点击反馈
        link.classList.add('clicked');
        setTimeout(() => {
            link.classList.remove('clicked');
        }, 200);
    }
    
    /**
     * 处理工具卡片点击
     */
    handleToolCardClick(event) {
        const card = event.target.closest('.tool-card');
        if (!card) return;
        
        // 添加点击动画
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }
    
    /**
     * 处理窗口大小调整
     */
    handleWindowResize() {
        console.log('📐 Window resized, updating viewport info');
        
        // 触发设备检测器更新
        if (window.deviceDetectorModule && window.deviceDetectorModule.updateViewportSize) {
            window.deviceDetectorModule.updateViewportSize();
        }
        
        // 触发其他需要响应窗口大小变化的组件
        window.dispatchEvent(new CustomEvent('optimizedResize', {
            detail: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }));
    }
    
    /**
     * 处理窗口滚动
     */
    handleWindowScroll() {
        // 这里可以添加滚动相关的优化逻辑
        // 比如懒加载、滚动进度等
    }
    
    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('📱 Page hidden, pausing non-critical operations');
            // 暂停非关键操作
        } else {
            console.log('📱 Page visible, resuming operations');
            // 恢复操作
        }
    }
    
    /**
     * 处理键盘事件
     */
    handleKeyDown(event) {
        // ESC键关闭模态框
        if (event.key === 'Escape') {
            const modal = document.querySelector('.modal.show, .language-modal.show');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
        
        // Ctrl+C 复制当前页面信息
        if (event.ctrlKey && event.key === 'c' && !event.target.matches('input, textarea')) {
            // 这里可以添加快捷复制功能
        }
    }
    
    /**
     * 处理页面卸载前
     */
    handleBeforeUnload() {
        // 清理资源
        this.cleanup();
    }
    
    /**
     * 添加触摸反馈
     */
    addTouchFeedback(element) {
        element.classList.add('touch-active');
        setTimeout(() => {
            element.classList.remove('touch-active');
        }, 150);
    }
    
    /**
     * 降级复制文本方法
     */
    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (error) {
            console.error('❌ Fallback copy failed:', error);
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            averageDurations: this.calculateAverageDurations(),
            activeListeners: this.eventListeners.size,
            activeDebounceTimers: this.debounceTimers.size,
            activeThrottleStates: this.throttleStates.size
        };
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        console.log('🧹 Cleaning up OptimizedEventManager...');
        
        // 清理防抖定时器
        for (const timerId of this.debounceTimers.values()) {
            clearTimeout(timerId);
        }
        this.debounceTimers.clear();
        
        // 清理节流状态
        this.throttleStates.clear();
        
        // 移除事件监听器
        for (const listeners of this.eventListeners.values()) {
            for (const { target, eventType, handler, options } of listeners) {
                target.removeEventListener(eventType, handler, options);
            }
        }
        this.eventListeners.clear();
        
        console.log('✅ OptimizedEventManager cleanup completed');
    }
    
    // ==================== 占位符方法（待实现） ====================
    
    handlePPICalculatorInput(event) {
        // PPI计算器输入处理逻辑
        console.log('🔢 PPI calculator input handled');
    }
    
    handleSearchInput(event) {
        // 搜索输入处理逻辑
        console.log('🔍 Search input handled');
    }
    
    handleGeneralInput(event) {
        // 一般输入处理逻辑
        console.log('📝 General input handled');
    }
    
    handleLanguageSelectChange(event) {
        // 语言选择变更处理逻辑
        console.log('🌐 Language select change handled');
    }
    
    handleUnitSelectorChange(event) {
        // 单位选择器变更处理逻辑
        console.log('📏 Unit selector change handled');
    }
}

// 创建全局实例
let optimizedEventManager = null;

/**
 * 初始化优化的事件管理器
 */
export function initializeOptimizedEventManager(config = {}) {
    if (optimizedEventManager) {
        console.log('OptimizedEventManager already initialized');
        return optimizedEventManager;
    }
    
    optimizedEventManager = new OptimizedEventManager(config);
    
    // 将实例暴露到全局作用域以便其他模块使用
    window.optimizedEventManager = optimizedEventManager;
    
    return optimizedEventManager;
}

/**
 * 获取优化的事件管理器实例
 */
export function getOptimizedEventManager() {
    return optimizedEventManager;
}

/**
 * 清理优化的事件管理器
 */
export function cleanupOptimizedEventManager() {
    if (optimizedEventManager) {
        optimizedEventManager.cleanup();
        optimizedEventManager = null;
        window.optimizedEventManager = null;
    }
}

// 导出类以便直接使用
export { OptimizedEventManager };

console.log('✅ OptimizedEventManager module loaded successfully');