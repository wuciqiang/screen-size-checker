/**
 * 广告性能分析器
 * 监控广告加载性能、CLS 影响和用户体验指标
 */

class AdPerformanceAnalytics {
    constructor() {
        this.metrics = {
            ads: {
                total: 0,
                loaded: 0,
                failed: 0,
                loadTimes: [],
                errors: []
            },
            cls: {
                score: 0,
                shifts: [],
                adRelatedShifts: 0
            },
            vitals: {
                lcp: null,
                fid: null,
                cls: null,
                fcp: null,
                ttfb: null
            },
            performance: {
                pageLoadTime: null,
                adLoadStartTime: null,
                adLoadEndTime: null,
                totalAdLoadTime: 0
            },
            user: {
                viewportSize: null,
                deviceType: null,
                connectionType: null,
                adBlockerDetected: false
            }
        };

        this.observers = new Map();
        this.startTime = performance.now();
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * 初始化性能分析器
     */
    init() {
        if (this.isInitialized) return;
        
        this.collectBasicMetrics();
        this.setupCLSMonitoring();
        this.setupWebVitalsMonitoring();
        this.setupAdEventListeners();
        this.setupPerformanceObserver();
        this.detectAdBlocker();
        
        this.isInitialized = true;
        console.log('📊 广告性能分析器已初始化');
    }

    /**
     * 收集基础指标
     */
    collectBasicMetrics() {
        // 视口尺寸
        this.metrics.user.viewportSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // 设备类型检测
        this.metrics.user.deviceType = this.detectDeviceType();

        // 连接类型检测
        if ('connection' in navigator) {
            this.metrics.user.connectionType = navigator.connection.effectiveType;
        }

        // 页面加载时间
        if (document.readyState === 'complete') {
            this.calculatePageLoadTime();
        } else {
            window.addEventListener('load', () => this.calculatePageLoadTime());
        }
    }

    /**
     * 检测设备类型
     */
    detectDeviceType() {
        const width = window.innerWidth;
        if (width <= 480) return 'mobile';
        if (width <= 768) return 'tablet';
        if (width <= 1440) return 'desktop';
        return 'large-desktop';
    }

    /**
     * 计算页面加载时间
     */
    calculatePageLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.performance.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        }
    }

    /**
     * 设置 CLS 监控
     */
    setupCLSMonitoring() {
        if (!('LayoutShift' in window)) return;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // 只统计非用户交互引起的布局偏移
                if (!entry.hadRecentInput) {
                    this.metrics.cls.score += entry.value;
                    this.metrics.cls.shifts.push({
                        value: entry.value,
                        time: entry.startTime,
                        sources: entry.sources ? Array.from(entry.sources) : []
                    });

                    // 检查是否与广告相关
                    if (this.isAdRelatedShift(entry)) {
                        this.metrics.cls.adRelatedShifts++;
                    }
                }
            }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
        this.observers.set('cls', observer);
    }

    /**
     * 检查布局偏移是否与广告相关
     */
    isAdRelatedShift(entry) {
        if (!entry.sources) return false;
        
        return Array.from(entry.sources).some(source => {
            const element = source.node;
            return element && (
                element.closest('.ad-container') ||
                element.classList.contains('adsbygoogle') ||
                element.tagName === 'INS'
            );
        });
    }

    /**
     * 设置 Web Vitals 监控
     */
    setupWebVitalsMonitoring() {
        // LCP (Largest Contentful Paint)
        this.observeWebVital('largest-contentful-paint', (entry) => {
            this.metrics.vitals.lcp = entry.startTime;
        });

        // FCP (First Contentful Paint)
        this.observeWebVital('first-contentful-paint', (entry) => {
            this.metrics.vitals.fcp = entry.startTime;
        });

        // FID (First Input Delay) - 需要用户交互
        this.observeWebVital('first-input', (entry) => {
            this.metrics.vitals.fid = entry.processingStart - entry.startTime;
        });

        // TTFB (Time to First Byte)
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.vitals.ttfb = navigation.responseStart - navigation.requestStart;
        }
    }

    /**
     * 观察特定的 Web Vital 指标
     */
    observeWebVital(type, callback) {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    callback(lastEntry);
                }
            });

            observer.observe({ type, buffered: true });
            this.observers.set(type, observer);
        } catch (error) {
            console.warn(`无法观察 ${type} 指标:`, error);
        }
    }

    /**
     * 设置广告事件监听器
     */
    setupAdEventListeners() {
        // 监听广告加载成功事件
        document.addEventListener('adLoaded', (event) => {
            this.onAdLoaded(event.detail);
        });

        // 监听广告加载失败事件
        document.addEventListener('adLoadError', (event) => {
            this.onAdLoadError(event.detail);
        });

        // 监听广告开始加载事件（如果有的话）
        document.addEventListener('adLoadStart', (event) => {
            this.onAdLoadStart(event.detail);
        });
    }

    /**
     * 广告加载开始处理
     */
    onAdLoadStart(detail) {
        if (!this.metrics.performance.adLoadStartTime) {
            this.metrics.performance.adLoadStartTime = performance.now();
        }
        this.metrics.ads.total++;
    }

    /**
     * 广告加载成功处理
     */
    onAdLoaded(detail) {
        const loadTime = performance.now();
        
        this.metrics.ads.loaded++;
        
        if (this.metrics.performance.adLoadStartTime) {
            const adLoadTime = loadTime - this.metrics.performance.adLoadStartTime;
            this.metrics.ads.loadTimes.push(adLoadTime);
            this.metrics.performance.totalAdLoadTime += adLoadTime;
        }

        this.metrics.performance.adLoadEndTime = loadTime;

        console.log(`📊 广告 ${detail.adId} 加载完成，用时: ${this.getLastAdLoadTime()}ms`);
    }

    /**
     * 广告加载失败处理
     */
    onAdLoadError(detail) {
        this.metrics.ads.failed++;
        this.metrics.ads.errors.push({
            adId: detail.adId,
            error: detail.error.message,
            time: performance.now(),
            userAgent: navigator.userAgent
        });

        console.log(`📊 广告 ${detail.adId} 加载失败: ${detail.error.message}`);
    }

    /**
     * 设置性能观察器
     */
    setupPerformanceObserver() {
        if (!('PerformanceObserver' in window)) return;

        // 观察资源加载性能
        try {
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.includes('googlesyndication') || 
                        entry.name.includes('googleads')) {
                        this.trackAdResourceLoad(entry);
                    }
                }
            });

            resourceObserver.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', resourceObserver);
        } catch (error) {
            console.warn('无法设置资源性能观察器:', error);
        }
    }

    /**
     * 跟踪广告资源加载
     */
    trackAdResourceLoad(entry) {
        const loadTime = entry.responseEnd - entry.startTime;
        console.log(`📊 AdSense 资源加载: ${entry.name.split('/').pop()}, 用时: ${loadTime.toFixed(2)}ms`);
    }

    /**
     * 检测广告拦截器
     */
    detectAdBlocker() {
        // 创建一个测试元素来检测广告拦截器
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-10000px';
        testAd.style.width = '1px';
        testAd.style.height = '1px';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            const isBlocked = testAd.offsetHeight === 0 || 
                            window.getComputedStyle(testAd).display === 'none';
            
            this.metrics.user.adBlockerDetected = isBlocked;
            document.body.removeChild(testAd);
            
            if (isBlocked) {
                console.log('📊 检测到广告拦截器');
            }
        }, 100);
    }

    /**
     * 获取最后一个广告的加载时间
     */
    getLastAdLoadTime() {
        const loadTimes = this.metrics.ads.loadTimes;
        return loadTimes.length > 0 ? loadTimes[loadTimes.length - 1].toFixed(2) : 0;
    }

    /**
     * 获取平均广告加载时间
     */
    getAverageAdLoadTime() {
        const loadTimes = this.metrics.ads.loadTimes;
        if (loadTimes.length === 0) return 0;
        
        const sum = loadTimes.reduce((a, b) => a + b, 0);
        return (sum / loadTimes.length).toFixed(2);
    }

    /**
     * 获取广告加载成功率
     */
    getAdSuccessRate() {
        if (this.metrics.ads.total === 0) return 0;
        return ((this.metrics.ads.loaded / this.metrics.ads.total) * 100).toFixed(2);
    }

    /**
     * 获取 CLS 评级
     */
    getCLSRating() {
        const cls = this.metrics.cls.score;
        if (cls <= 0.1) return 'good';
        if (cls <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    /**
     * 获取完整的性能报告
     */
    getPerformanceReport() {
        // 更新最终的 CLS 分数到 vitals
        this.metrics.vitals.cls = this.metrics.cls.score;

        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...this.metrics,
            computed: {
                averageAdLoadTime: this.getAverageAdLoadTime(),
                adSuccessRate: this.getAdSuccessRate(),
                clsRating: this.getCLSRating(),
                totalAnalysisTime: performance.now() - this.startTime
            }
        };
    }

    /**
     * 发送性能数据到分析服务（可选）
     */
    sendAnalytics(endpoint = null) {
        const report = this.getPerformanceReport();
        
        // 控制台输出（开发环境）
        console.group('📊 广告性能分析报告');
        console.log('广告统计:', {
            总数: report.ads.total,
            成功: report.ads.loaded,
            失败: report.ads.failed,
            成功率: report.computed.adSuccessRate + '%',
            平均加载时间: report.computed.averageAdLoadTime + 'ms'
        });
        console.log('CLS 影响:', {
            总分数: report.cls.score.toFixed(4),
            评级: report.computed.clsRating,
            广告相关偏移: report.cls.adRelatedShifts,
            总偏移次数: report.cls.shifts.length
        });
        console.log('Web Vitals:', report.vitals);
        console.log('用户环境:', report.user);
        console.groupEnd();

        // 如果提供了端点，发送到服务器
        if (endpoint) {
            this.sendToServer(endpoint, report);
        }

        return report;
    }

    /**
     * 发送数据到服务器
     */
    async sendToServer(endpoint, data) {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            console.log('📊 性能数据已发送到服务器');
        } catch (error) {
            console.warn('📊 发送性能数据失败:', error);
        }
    }

    /**
     * 销毁分析器
     */
    destroy() {
        // 断开所有观察器
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        // 移除事件监听器
        document.removeEventListener('adLoaded', this.onAdLoaded);
        document.removeEventListener('adLoadError', this.onAdLoadError);
        document.removeEventListener('adLoadStart', this.onAdLoadStart);

        console.log('📊 广告性能分析器已销毁');
    }
}

// 自动初始化（延迟以避免影响页面加载）
let adPerformanceAnalytics = null;

setTimeout(() => {
    if (!window.adPerformanceAnalytics) {
        adPerformanceAnalytics = new AdPerformanceAnalytics();
        window.adPerformanceAnalytics = adPerformanceAnalytics;
        
        // 暴露调试方法
        window.getAdPerformanceReport = () => adPerformanceAnalytics.getPerformanceReport();
        window.sendAdAnalytics = (endpoint) => adPerformanceAnalytics.sendAnalytics(endpoint);
    }
}, 1000); // 延迟1秒初始化

// 页面卸载时发送最终报告
window.addEventListener('beforeunload', () => {
    if (adPerformanceAnalytics) {
        adPerformanceAnalytics.sendAnalytics();
    }
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdPerformanceAnalytics;
}