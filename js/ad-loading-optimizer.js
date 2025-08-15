/**
 * 高级 AdSense 加载优化器
 * 实现异步加载、延迟加载和错误处理
 */

class AdLoadingOptimizer {
    constructor() {
        this.adContainers = new Map();
        this.loadedAds = new Set();
        this.failedAds = new Set();
        this.observer = null;
        this.adSenseLoaded = false;
        this.loadTimeout = 10000; // 10秒超时
        
        this.init();
    }

    /**
     * 初始化广告加载优化器
     */
    init() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * 设置广告加载优化器
     */
    setup() {
        this.findAdContainers();
        this.loadAdSenseScript();
        this.setupIntersectionObserver();
        this.setupErrorHandling();
        
        console.log(`🚀 AdSense 优化器已初始化，发现 ${this.adContainers.size} 个广告位`);
    }

    /**
     * 查找页面中的所有广告容器
     */
    findAdContainers() {
        const containers = document.querySelectorAll('.ad-container');
        
        containers.forEach((container, index) => {
            const adId = container.dataset.adType || `ad-${index}`;
            const adElement = container.querySelector('.adsbygoogle');
            
            if (adElement) {
                this.adContainers.set(adId, {
                    container,
                    adElement,
                    loaded: false,
                    visible: false,
                    loadAttempts: 0
                });
            }
        });
    }

    /**
     * 异步加载 AdSense 脚本
     */
    async loadAdSenseScript() {
        if (this.adSenseLoaded || window.adsbygoogle) {
            this.adSenseLoaded = true;
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9212629010224868';
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                this.adSenseLoaded = true;
                console.log('✅ AdSense 脚本加载成功');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ AdSense 脚本加载失败');
                reject(new Error('AdSense script load failed'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * 设置 Intersection Observer 进行延迟加载
     */
    setupIntersectionObserver() {
        const options = {
            rootMargin: '200px 0px', // 提前200px开始加载
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const adId = this.getAdIdFromContainer(container);
                    
                    if (adId && !this.loadedAds.has(adId)) {
                        this.loadAd(adId);
                    }
                }
            });
        }, options);

        // 观察所有广告容器
        this.adContainers.forEach((adData) => {
            this.observer.observe(adData.container);
        });
    }

    /**
     * 从容器获取广告ID
     */
    getAdIdFromContainer(container) {
        for (const [adId, adData] of this.adContainers) {
            if (adData.container === container) {
                return adId;
            }
        }
        return null;
    }

    /**
     * 加载特定广告
     */
    async loadAd(adId) {
        const adData = this.adContainers.get(adId);
        if (!adData || adData.loaded) return;

        try {
            // 确保 AdSense 脚本已加载
            if (!this.adSenseLoaded) {
                await this.loadAdSenseScript();
            }

            // 标记为加载中
            adData.container.classList.add('ad-loading');
            adData.loadAttempts++;

            // 设置加载超时
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Ad load timeout')), this.loadTimeout);
            });

            // 推送广告到 AdSense
            const loadPromise = new Promise((resolve, reject) => {
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    
                    // 监听广告加载状态
                    this.monitorAdLoad(adId, resolve, reject);
                } catch (error) {
                    reject(error);
                }
            });

            // 等待加载完成或超时
            await Promise.race([loadPromise, timeoutPromise]);
            
            this.onAdLoadSuccess(adId);
            
        } catch (error) {
            this.onAdLoadError(adId, error);
        }
    }

    /**
     * 监控广告加载状态
     */
    monitorAdLoad(adId, resolve, reject) {
        const adData = this.adContainers.get(adId);
        if (!adData) return reject(new Error('Ad data not found'));

        const checkInterval = 100;
        let checkCount = 0;
        const maxChecks = this.loadTimeout / checkInterval;

        const checkLoad = () => {
            checkCount++;
            
            // 检查广告是否已填充
            const adElement = adData.adElement;
            const isLoaded = adElement.dataset.adStatus === 'filled' || 
                           adElement.querySelector('iframe') ||
                           adElement.offsetHeight > 50;

            if (isLoaded) {
                resolve();
            } else if (checkCount >= maxChecks) {
                reject(new Error('Ad load check timeout'));
            } else {
                setTimeout(checkLoad, checkInterval);
            }
        };

        setTimeout(checkLoad, checkInterval);
    }

    /**
     * 广告加载成功处理
     */
    onAdLoadSuccess(adId) {
        const adData = this.adContainers.get(adId);
        if (!adData) return;

        adData.loaded = true;
        adData.container.classList.remove('ad-loading');
        adData.container.classList.add('ad-loaded');
        
        this.loadedAds.add(adId);
        
        console.log(`✅ 广告 ${adId} 加载成功`);
        
        // 停止观察已加载的广告
        if (this.observer) {
            this.observer.unobserve(adData.container);
        }

        // 触发自定义事件
        this.dispatchAdEvent('adLoaded', { adId, container: adData.container });
    }

    /**
     * 广告加载失败处理
     */
    onAdLoadError(adId, error) {
        const adData = this.adContainers.get(adId);
        if (!adData) return;

        adData.container.classList.remove('ad-loading');
        adData.container.classList.add('ad-load-failed');
        
        this.failedAds.add(adId);
        
        console.warn(`⚠️ 广告 ${adId} 加载失败:`, error.message);

        // 重试逻辑（最多重试2次）
        if (adData.loadAttempts < 3) {
            setTimeout(() => {
                console.log(`🔄 重试加载广告 ${adId} (第${adData.loadAttempts}次)`);
                this.loadAd(adId);
            }, 2000 * adData.loadAttempts); // 递增延迟
        } else {
            console.error(`❌ 广告 ${adId} 最终加载失败`);
            this.handleFinalAdFailure(adId);
        }

        // 触发自定义事件
        this.dispatchAdEvent('adLoadError', { adId, error, container: adData.container });
    }

    /**
     * 处理最终广告加载失败
     */
    handleFinalAdFailure(adId) {
        const adData = this.adContainers.get(adId);
        if (!adData) return;

        // 减小容器高度以减少布局影响
        const container = adData.container;
        const originalMinHeight = getComputedStyle(container).minHeight;
        
        // 根据广告类型调整失败后的高度
        if (container.classList.contains('ad-banner-top')) {
            container.style.minHeight = '60px';
        } else if (container.classList.contains('ad-rectangle-in-content')) {
            container.style.minHeight = '100px';
        } else if (container.classList.contains('ad-skyscraper-right')) {
            container.style.minHeight = '200px';
        }

        // 可选：显示备用内容
        this.showFallbackContent(container);
    }

    /**
     * 显示备用内容
     */
    showFallbackContent(container) {
        // 可以在这里添加备用内容，比如相关链接或其他推广内容
        // 目前只是调整样式
        container.style.opacity = '0.5';
    }

    /**
     * 触发自定义广告事件
     */
    dispatchAdEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        // 监听全局错误
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('googlesyndication')) {
                console.error('AdSense 脚本错误:', event.error);
            }
        });

        // 监听未处理的 Promise 拒绝
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && 
                event.reason.message.includes('adsbygoogle')) {
                console.error('AdSense Promise 错误:', event.reason);
                event.preventDefault();
            }
        });
    }

    /**
     * 获取加载统计信息
     */
    getLoadStats() {
        return {
            total: this.adContainers.size,
            loaded: this.loadedAds.size,
            failed: this.failedAds.size,
            pending: this.adContainers.size - this.loadedAds.size - this.failedAds.size,
            successRate: this.adContainers.size > 0 ? 
                (this.loadedAds.size / this.adContainers.size * 100).toFixed(2) + '%' : '0%'
        };
    }

    /**
     * 强制加载所有可见广告（用于调试）
     */
    forceLoadVisibleAds() {
        this.adContainers.forEach((adData, adId) => {
            if (!adData.loaded && this.isElementVisible(adData.container)) {
                this.loadAd(adId);
            }
        });
    }

    /**
     * 检查元素是否可见
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    /**
     * 销毁优化器
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.adContainers.clear();
        this.loadedAds.clear();
        this.failedAds.clear();
        
        console.log('🔄 AdSense 优化器已销毁');
    }
}

// 自动初始化
let adOptimizer = null;

// 确保只初始化一次
if (!window.adLoadingOptimizer) {
    adOptimizer = new AdLoadingOptimizer();
    window.adLoadingOptimizer = adOptimizer;
    
    // 暴露调试方法到全局
    window.getAdStats = () => adOptimizer.getLoadStats();
    window.forceLoadAds = () => adOptimizer.forceLoadVisibleAds();
}

// 导出类（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdLoadingOptimizer;
}