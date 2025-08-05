// performance-monitor.js - Core Web Vitals and Performance Monitoring System

/**
 * Performance Metrics Data Model
 * Manages all performance-related data and calculations
 */
class PerformanceMetricsModel {
    constructor() {
        this.coreWebVitals = {
            LCP: { value: null, rating: null, timestamp: null },
            FID: { value: null, rating: null, timestamp: null },
            CLS: { value: null, rating: null, timestamp: null },
            FCP: { value: null, rating: null, timestamp: null },
            TTI: { value: null, rating: null, timestamp: null }
        };
        
        this.resourceMetrics = {
            totalSize: 0,
            compressedSize: 0,
            loadTime: 0,
            cacheHitRate: 0,
            criticalResourcesLoadTime: 0,
            nonCriticalResourcesLoadTime: 0
        };
        
        this.customMetrics = {
            moduleLoadTimes: new Map(),
            translationLoadTime: 0,
            deviceDetectionTime: 0,
            firstInteractionTime: 0,
            domContentLoadedTime: 0
        };
        
        this.userExperienceMetrics = {
            bounceRate: 0,
            timeOnPage: 0,
            interactionCount: 0,
            errorCount: 0,
            performanceScore: 0
        };
        
        this.longTasks = [];
        this.resourceTimings = [];
    }
    
    /**
     * Update Core Web Vitals metric
     */
    updateCoreWebVital(metric, value) {
        if (this.coreWebVitals[metric]) {
            this.coreWebVitals[metric].value = value;
            this.coreWebVitals[metric].rating = this.getRating(metric, value);
            this.coreWebVitals[metric].timestamp = Date.now();
            
            console.log(`📊 ${metric} updated:`, {
                value: value,
                rating: this.coreWebVitals[metric].rating
            });
        }
    }
    
    /**
     * Get performance rating based on Google's thresholds
     */
    getRating(metric, value) {
        const thresholds = {
            LCP: { good: 2500, needsImprovement: 4000 },
            FID: { good: 100, needsImprovement: 300 },
            CLS: { good: 0.1, needsImprovement: 0.25 },
            FCP: { good: 1800, needsImprovement: 3000 },
            TTI: { good: 3800, needsImprovement: 7300 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }
    
    /**
     * Calculate overall performance score
     */
    calculatePerformanceScore() {
        const weights = {
            LCP: 0.25,
            FID: 0.25,
            CLS: 0.25,
            FCP: 0.15,
            TTI: 0.10
        };
        
        let totalScore = 0;
        let totalWeight = 0;
        
        for (const [metric, weight] of Object.entries(weights)) {
            const metricData = this.coreWebVitals[metric];
            if (metricData && metricData.rating) {
                const score = this.getScoreFromRating(metricData.rating);
                totalScore += score * weight;
                totalWeight += weight;
            }
        }
        
        const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
        this.userExperienceMetrics.performanceScore = finalScore;
        return finalScore;
    }
    
    /**
     * Convert rating to numeric score
     */
    getScoreFromRating(rating) {
        switch (rating) {
            case 'good': return 100;
            case 'needs-improvement': return 70;
            case 'poor': return 30;
            default: return 0;
        }
    }
    
    /**
     * Add long task record
     */
    addLongTask(task) {
        this.longTasks.push({
            duration: task.duration,
            startTime: task.startTime,
            name: task.name,
            timestamp: Date.now()
        });
        
        // Keep only recent long tasks (last 100)
        if (this.longTasks.length > 100) {
            this.longTasks = this.longTasks.slice(-100);
        }
    }
    
    /**
     * Add resource timing record
     */
    addResourceTiming(resource) {
        this.resourceTimings.push({
            name: resource.name,
            duration: resource.duration,
            transferSize: resource.transferSize,
            encodedBodySize: resource.encodedBodySize,
            decodedBodySize: resource.decodedBodySize,
            timestamp: Date.now()
        });
        
        // Keep only recent resource timings (last 200)
        if (this.resourceTimings.length > 200) {
            this.resourceTimings = this.resourceTimings.slice(-200);
        }
    }
    
    /**
     * Get metric value
     */
    getMetric(metric) {
        if (this.coreWebVitals[metric]) {
            return this.coreWebVitals[metric].value;
        }
        return null;
    }
    
    /**
     * Get all metrics summary
     */
    getMetricsSummary() {
        return {
            coreWebVitals: this.coreWebVitals,
            resourceMetrics: this.resourceMetrics,
            customMetrics: this.customMetrics,
            userExperienceMetrics: this.userExperienceMetrics,
            performanceScore: this.calculatePerformanceScore(),
            longTasksCount: this.longTasks.length,
            resourceTimingsCount: this.resourceTimings.length
        };
    }
}

/**
 * Core Performance Monitor Class
 * Handles all performance monitoring, Core Web Vitals tracking, and reporting
 */
class PerformanceMonitor {
    constructor(config = {}) {
        this.config = {
            enableCWV: true,
            enableRUM: true,
            enableLongTaskMonitoring: true,
            enableResourceTimingMonitoring: true,
            enableErrorHandling: true,
            reportingInterval: 30000,
            performanceBudget: {
                LCP: 2500,
                FID: 100,
                CLS: 0.1,
                FCP: 1800,
                TTI: 3800
            },
            ...config
        };
        
        this.metrics = new PerformanceMetricsModel();
        this.observers = new Map();
        this.reportQueue = [];
        this.isInitialized = false;
        this.startTime = performance.now();
        
        // 错误处理器将在初始化时异步加载
        this.errorHandler = null;
        
        console.log('🔧 PerformanceMonitor initialized with config:', this.config);
    }
    
    /**
     * Initialize performance monitoring
     */
    initialize() {
        if (this.isInitialized) {
            console.log('PerformanceMonitor already initialized');
            return;
        }
        
        console.log('🚀 Initializing PerformanceMonitor...');
        
        try {
            if (this.config.enableCWV) {
                this.setupCoreWebVitalsMonitoring();
            }
            
            if (this.config.enableResourceTimingMonitoring) {
                this.setupResourceTimingMonitoring();
            }
            
            if (this.config.enableLongTaskMonitoring) {
                this.setupLongTaskMonitoring();
            }
            
            this.setupNavigationTimingMonitoring();
            this.setupUserInteractionMonitoring();
            
            // 错误处理器集成暂时禁用以避免阻塞初始化
            
            if (this.config.enableRUM) {
                this.startReporting();
            }
            
            this.isInitialized = true;
            console.log('✅ PerformanceMonitor initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize PerformanceMonitor:', error);
            
            // 如果初始化失败，尝试启用基础监控
            this.enableFallbackMonitoring();
        }
    }
    
    /**
     * Setup Core Web Vitals monitoring
     */
    setupCoreWebVitalsMonitoring() {
        console.log('📊 Setting up Core Web Vitals monitoring...');
        
        // LCP (Largest Contentful Paint) monitoring
        this.observeLCP();
        
        // FID (First Input Delay) monitoring
        this.observeFID();
        
        // CLS (Cumulative Layout Shift) monitoring
        this.observeCLS();
        
        // FCP (First Contentful Paint) monitoring
        this.observeFCP();
        
        // TTI (Time to Interactive) monitoring
        this.observeTTI();
    }
    
    /**
     * Observe Largest Contentful Paint (LCP)
     */
    observeLCP() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                if (lastEntry) {
                    this.metrics.updateCoreWebVital('LCP', lastEntry.startTime);
                    this.checkPerformanceBudget('LCP', lastEntry.startTime);
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('LCP', observer);
            
        } catch (error) {
            console.error('Error setting up LCP observer:', error);
        }
    }
    
    /**
     * Observe First Input Delay (FID)
     */
    observeFID() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    if (entry.name === 'first-input') {
                        const fid = entry.processingStart - entry.startTime;
                        this.metrics.updateCoreWebVital('FID', fid);
                        this.checkPerformanceBudget('FID', fid);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
            this.observers.set('FID', observer);
            
        } catch (error) {
            console.error('Error setting up FID observer:', error);
        }
    }
    
    /**
     * Observe Cumulative Layout Shift (CLS)
     */
    observeCLS() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            let clsValue = 0;
            let sessionValue = 0;
            let sessionEntries = [];
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                        
                        if (sessionValue && 
                            entry.startTime - lastSessionEntry.startTime < 1000 &&
                            entry.startTime - firstSessionEntry.startTime < 5000) {
                            sessionValue += entry.value;
                            sessionEntries.push(entry);
                        } else {
                            sessionValue = entry.value;
                            sessionEntries = [entry];
                        }
                        
                        if (sessionValue > clsValue) {
                            clsValue = sessionValue;
                            this.metrics.updateCoreWebVital('CLS', clsValue);
                            this.checkPerformanceBudget('CLS', clsValue);
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('CLS', observer);
            
        } catch (error) {
            console.error('Error setting up CLS observer:', error);
        }
    }
    
    /**
     * Observe First Contentful Paint (FCP)
     */
    observeFCP() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.updateCoreWebVital('FCP', entry.startTime);
                        this.checkPerformanceBudget('FCP', entry.startTime);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
            this.observers.set('FCP', observer);
            
        } catch (error) {
            console.error('Error setting up FCP observer:', error);
        }
    }
    
    /**
     * Observe Time to Interactive (TTI) - approximation
     */
    observeTTI() {
        // TTI is complex to measure accurately, this is a simplified approximation
        try {
            const calculateTTI = () => {
                const navigationEntry = performance.getEntriesByType('navigation')[0];
                if (navigationEntry) {
                    // Simplified TTI calculation based on DOMContentLoaded + additional heuristics
                    const domContentLoaded = navigationEntry.domContentLoadedEventEnd;
                    const loadComplete = navigationEntry.loadEventEnd;
                    
                    // Estimate TTI as somewhere between DOMContentLoaded and Load
                    const estimatedTTI = domContentLoaded + (loadComplete - domContentLoaded) * 0.7;
                    
                    this.metrics.updateCoreWebVital('TTI', estimatedTTI);
                    this.checkPerformanceBudget('TTI', estimatedTTI);
                }
            };
            
            // Calculate TTI after page load
            if (document.readyState === 'complete') {
                setTimeout(calculateTTI, 100);
            } else {
                window.addEventListener('load', () => {
                    setTimeout(calculateTTI, 100);
                });
            }
            
        } catch (error) {
            console.error('Error setting up TTI monitoring:', error);
        }
    }
    
    /**
     * Setup long task monitoring
     */
    setupLongTaskMonitoring() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    if (entry.duration > 50) {
                        console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
                        
                        this.metrics.addLongTask({
                            duration: entry.duration,
                            startTime: entry.startTime,
                            name: entry.name
                        });
                        
                        // Report long task violation
                        this.reportViolation('long-task', {
                            duration: entry.duration,
                            threshold: 50,
                            violation: entry.duration - 50
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
            this.observers.set('longtask', observer);
            
        } catch (error) {
            console.error('Error setting up long task monitoring:', error);
        }
    }
    
    /**
     * Setup resource timing monitoring
     */
    setupResourceTimingMonitoring() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    this.metrics.addResourceTiming({
                        name: entry.name,
                        duration: entry.duration,
                        transferSize: entry.transferSize || 0,
                        encodedBodySize: entry.encodedBodySize || 0,
                        decodedBodySize: entry.decodedBodySize || 0
                    });
                    
                    // Check for slow resources
                    if (entry.duration > 1000) {
                        console.warn(`⚠️ Slow resource detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
            
        } catch (error) {
            console.error('Error setting up resource timing monitoring:', error);
        }
    }
    
    /**
     * Setup navigation timing monitoring
     */
    setupNavigationTimingMonitoring() {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            if (navigationEntry) {
                // Record key navigation timings
                this.metrics.customMetrics.domContentLoadedTime = navigationEntry.domContentLoadedEventEnd;
                
                console.log('📊 Navigation timings recorded:', {
                    domContentLoaded: navigationEntry.domContentLoadedEventEnd,
                    loadComplete: navigationEntry.loadEventEnd,
                    domInteractive: navigationEntry.domInteractive
                });
            }
        } catch (error) {
            console.error('Error setting up navigation timing monitoring:', error);
        }
    }
    
    /**
     * Setup user interaction monitoring
     */
    setupUserInteractionMonitoring() {
        let firstInteractionRecorded = false;
        
        const recordFirstInteraction = (event) => {
            if (!firstInteractionRecorded) {
                this.metrics.customMetrics.firstInteractionTime = performance.now();
                firstInteractionRecorded = true;
                
                console.log('👆 First user interaction recorded at:', this.metrics.customMetrics.firstInteractionTime);
            }
            
            this.metrics.userExperienceMetrics.interactionCount++;
        };
        
        // Listen for various interaction events
        ['click', 'keydown', 'touchstart', 'scroll'].forEach(eventType => {
            document.addEventListener(eventType, recordFirstInteraction, { 
                once: eventType !== 'scroll' && eventType !== 'click',
                passive: true 
            });
        });
    }
    
    /**
     * Check performance budget violations
     */
    checkPerformanceBudget(metric, value) {
        const budget = this.config.performanceBudget[metric];
        if (budget && value > budget) {
            const violation = {
                metric,
                current: value,
                budget,
                violation: value - budget,
                timestamp: Date.now()
            };
            
            console.warn(`🚨 Performance budget violation:`, violation);
            this.reportViolation('performance-budget', violation);
        }
    }
    
    /**
     * Report performance violation
     */
    reportViolation(type, data) {
        const violation = {
            type,
            data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.reportQueue.push(violation);
        
        // Trigger immediate report for critical violations
        if (type === 'performance-budget' && data.violation > data.budget * 0.5) {
            this.sendReport([violation]);
        }
    }
    
    /**
     * Start periodic reporting
     */
    startReporting() {
        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
        }
        
        this.reportingInterval = setInterval(() => {
            this.generateReport();
        }, this.config.reportingInterval);
        
        console.log(`📊 Performance reporting started (interval: ${this.config.reportingInterval}ms)`);
    }
    
    /**
     * Generate and send performance report
     */
    generateReport() {
        const report = {
            timestamp: Date.now(),
            url: window.location.href,
            metrics: this.metrics.getMetricsSummary(),
            violations: [...this.reportQueue],
            sessionDuration: performance.now() - this.startTime,
            deviceInfo: this.getDeviceInfo()
        };
        
        console.log('📊 Performance Report Generated:', report);
        
        // Send report (in a real implementation, this would go to analytics)
        this.sendReport([report]);
        
        // Clear report queue
        this.reportQueue = [];
    }
    
    /**
     * Send report to analytics endpoint
     */
    sendReport(reports) {
        // In a real implementation, this would send to Google Analytics, custom endpoint, etc.
        console.log('📤 Sending performance reports:', reports);
        
        // For now, just log to console and store in sessionStorage for debugging
        try {
            const existingReports = JSON.parse(sessionStorage.getItem('performanceReports') || '[]');
            existingReports.push(...reports);
            
            // Keep only last 10 reports
            const recentReports = existingReports.slice(-10);
            sessionStorage.setItem('performanceReports', JSON.stringify(recentReports));
            
        } catch (error) {
            console.error('Error storing performance reports:', error);
        }
    }
    
    /**
     * Get device information for reporting
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: window.screen.width,
                height: window.screen.height
            },
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : 'unknown'
        };
    }
    
    /**
     * Get current performance metrics
     */
    getMetrics() {
        return this.metrics.getMetricsSummary();
    }
    
    /**
     * Get specific metric value
     */
    getMetric(metric) {
        return this.metrics.getMetric(metric);
    }
    
    /**
     * Manually record custom metric
     */
    recordCustomMetric(name, value) {
        this.metrics.customMetrics[name] = value;
        console.log(`📊 Custom metric recorded: ${name} = ${value}`);
    }
    
    /**
     * Setup error handler integration
     */
    setupErrorHandlerIntegration() {
        if (!this.errorHandler) return;
        
        console.log('🔧 Setting up error handler integration...');
        
        // 监听错误处理器的错误统计
        const originalLogError = this.errorHandler.logError.bind(this.errorHandler);
        this.errorHandler.logError = (message, details) => {
            // 调用原始方法
            originalLogError(message, details);
            
            // 更新性能指标中的错误计数
            this.metrics.userExperienceMetrics.errorCount++;
            
            // 如果错误率过高，触发性能预算违规
            if (this.metrics.userExperienceMetrics.errorCount > 10) {
                this.reportViolation('error-rate', {
                    errorCount: this.metrics.userExperienceMetrics.errorCount,
                    threshold: 10,
                    message: 'High error rate detected'
                });
            }
        };
        
        console.log('✅ Error handler integration completed');
    }
    
    /**
     * Enable fallback monitoring when main initialization fails
     */
    enableFallbackMonitoring() {
        console.log('🔄 Enabling fallback monitoring...');
        
        try {
            // 基础的性能监控
            this.setupBasicPerformanceMonitoring();
            
            // 基础的错误监控
            this.setupBasicErrorMonitoring();
            
            // 启用简化的报告
            if (this.config.enableRUM) {
                this.startBasicReporting();
            }
            
            this.isInitialized = true;
            console.log('✅ Fallback monitoring enabled');
            
        } catch (error) {
            console.error('❌ Fallback monitoring also failed:', error);
        }
    }
    
    /**
     * Setup basic performance monitoring (fallback)
     */
    setupBasicPerformanceMonitoring() {
        // 使用基础的 Navigation Timing API
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    // 记录基础指标
                    const loadTime = navigation.loadEventEnd - navigation.navigationStart;
                    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
                    
                    this.metrics.customMetrics.domContentLoadedTime = domContentLoaded;
                    this.metrics.resourceMetrics.loadTime = loadTime;
                    
                    console.log('📊 Basic performance metrics recorded:', {
                        loadTime,
                        domContentLoaded
                    });
                }
            }, 100);
        });
    }
    
    /**
     * Setup basic error monitoring (fallback)
     */
    setupBasicErrorMonitoring() {
        // 监听基础的JavaScript错误
        window.addEventListener('error', (event) => {
            this.metrics.userExperienceMetrics.errorCount++;
            console.error('Basic error monitoring:', event.error);
        });
        
        // 监听未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.userExperienceMetrics.errorCount++;
            console.error('Basic promise rejection monitoring:', event.reason);
        });
    }
    
    /**
     * Start basic reporting (fallback)
     */
    startBasicReporting() {
        this.reportingInterval = setInterval(() => {
            const basicReport = {
                timestamp: Date.now(),
                url: window.location.href,
                errorCount: this.metrics.userExperienceMetrics.errorCount,
                loadTime: this.metrics.resourceMetrics.loadTime,
                domContentLoadedTime: this.metrics.customMetrics.domContentLoadedTime,
                sessionDuration: performance.now() - this.startTime
            };
            
            console.log('📊 Basic Performance Report:', basicReport);
            
            // 存储基础报告
            try {
                const reports = JSON.parse(sessionStorage.getItem('basicPerformanceReports') || '[]');
                reports.push(basicReport);
                
                // 只保留最近的5个报告
                const recentReports = reports.slice(-5);
                sessionStorage.setItem('basicPerformanceReports', JSON.stringify(recentReports));
            } catch (error) {
                console.error('Error storing basic performance reports:', error);
            }
        }, this.config.reportingInterval * 2); // 降低报告频率
        
        console.log('📊 Basic performance reporting started');
    }
    
    /**
     * Get error handler statistics
     */
    getErrorHandlerStats() {
        if (!this.errorHandler) {
            return { available: false };
        }
        
        return {
            available: true,
            stats: this.errorHandler.getErrorStats(),
            healthStatus: this.errorHandler.getHealthStatus()
        };
    }
    
    /**
     * Get comprehensive performance and error report
     */
    getComprehensiveReport() {
        const baseReport = {
            timestamp: Date.now(),
            url: window.location.href,
            metrics: this.metrics.getMetricsSummary(),
            sessionDuration: performance.now() - this.startTime,
            deviceInfo: this.getDeviceInfo(),
            isInitialized: this.isInitialized
        };
        
        // 添加错误处理器统计
        const errorStats = this.getErrorHandlerStats();
        if (errorStats.available) {
            baseReport.errorHandling = errorStats;
        }
        
        return baseReport;
    }
    
    /**
     * Cleanup observers and intervals
     */
    destroy() {
        console.log('🧹 Cleaning up PerformanceMonitor...');
        
        // Disconnect all observers
        this.observers.forEach((observer, name) => {
            try {
                observer.disconnect();
                console.log(`Observer ${name} disconnected`);
            } catch (error) {
                console.error(`Error disconnecting observer ${name}:`, error);
            }
        });
        
        // Clear reporting interval
        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
            this.reportingInterval = null;
        }
        
        // 清理错误处理器
        if (this.errorHandler) {
            this.errorHandler.clearErrorQueue();
        }
        
        this.observers.clear();
        this.isInitialized = false;
        
        console.log('✅ PerformanceMonitor cleanup completed');
    }
}

// Export classes
export { PerformanceMonitor, PerformanceMetricsModel };

// Create and export global instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        performanceMonitor.initialize();
    });
} else {
    // DOM is already loaded, initialize immediately
    setTimeout(() => {
        performanceMonitor.initialize();
    }, 0);
}

console.log('📊 Performance monitoring module loaded');