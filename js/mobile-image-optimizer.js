/**
 * 移动端图片优化器
 * 处理响应式图片、懒加载和图表优化
 */

class MobileImageOptimizer {
    constructor(options = {}) {
        this.options = {
            // 懒加载配置
            lazyLoadThreshold: '50px',
            lazyLoadRootMargin: '50px 0px',
            
            // 图片优化配置
            enableWebP: true,
            enableRetina: true,
            maxImageWidth: 800,
            
            // 图表优化配置
            chartMobileWidth: 350,
            chartMobileHeight: 250,
            
            // 性能配置
            enableIntersectionObserver: 'IntersectionObserver' in window,
            enableResizeObserver: 'ResizeObserver' in window,
            
            ...options
        };

        this.images = new Set();
        this.charts = new Set();
        this.observers = new Map();
        
        this.init();
    }

    /**
     * 初始化图片优化器
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * 设置图片优化
     */
    setup() {
        this.detectMobileDevice();
        this.setupLazyLoading();
        this.optimizeExistingImages();
        this.optimizeCharts();
        this.setupResizeHandler();
        
        // 监听动态添加的图片
        this.observeNewImages();
    }

    /**
     * 检测移动设备
     */
    detectMobileDevice() {
        this.isMobile = window.innerWidth <= 768;
        this.isSmallMobile = window.innerWidth <= 480;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.connectionSpeed = this.getConnectionSpeed();
    }

    /**
     * 获取网络连接速度
     */
    getConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType) {
                return connection.effectiveType.includes('2g') ? 'slow' : 'fast';
            }
        }
        return 'unknown';
    }

    /**
     * 设置懒加载
     */
    setupLazyLoading() {
        if (!this.options.enableIntersectionObserver) {
            // 降级处理：立即加载所有图片
            this.loadAllImages();
            return;
        }

        const lazyImageObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            },
            {
                rootMargin: this.options.lazyLoadRootMargin,
                threshold: 0.1
            }
        );

        this.observers.set('lazy', lazyImageObserver);
    }

    /**
     * 优化现有图片
     */
    optimizeExistingImages() {
        const images = document.querySelectorAll('.blog-mobile-optimized img');
        
        images.forEach(img => {
            this.processImage(img);
        });
    }

    /**
     * 处理单个图片
     */
    processImage(img) {
        // 添加到图片集合
        this.images.add(img);

        // 添加响应式类
        img.classList.add('mobile-responsive-image');

        // 设置懒加载
        if (this.options.enableIntersectionObserver && !img.complete) {
            img.classList.add('lazy-loading');
            this.setupImagePlaceholder(img);
            this.observers.get('lazy').observe(img);
        } else {
            this.loadImage(img);
        }

        // 优化图片属性
        this.optimizeImageAttributes(img);
    }

    /**
     * 设置图片占位符
     */
    setupImagePlaceholder(img) {
        // 创建占位符
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.cssText = `
            width: 100%;
            height: 200px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading-shimmer 1.5s infinite;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 0.875rem;
        `;
        placeholder.textContent = 'Loading image...';

        // 插入占位符
        img.parentNode.insertBefore(placeholder, img);
        img.style.display = 'none';

        // 存储占位符引用
        img.dataset.placeholder = 'true';
        img.placeholder = placeholder;
    }

    /**
     * 加载图片
     */
    loadImage(img) {
        return new Promise((resolve, reject) => {
            const originalSrc = img.dataset.src || img.src;
            
            if (!originalSrc) {
                reject(new Error('No image source found'));
                return;
            }

            // 获取优化后的图片源
            const optimizedSrc = this.getOptimizedImageSrc(originalSrc);
            
            // 创建新的图片对象进行预加载
            const newImg = new Image();
            
            newImg.onload = () => {
                // 更新图片源
                img.src = optimizedSrc;
                
                // 移除懒加载类
                img.classList.remove('lazy-loading');
                img.classList.add('loaded');

                // 移除占位符
                if (img.placeholder) {
                    img.placeholder.remove();
                    img.style.display = '';
                }

                // 添加加载动画
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });

                resolve(img);
            };

            newImg.onerror = () => {
                // 如果优化版本加载失败且不是原始图片，尝试加载原始图片
                if (optimizedSrc !== originalSrc) {
                    console.warn(`Failed to load optimized image: ${optimizedSrc}, falling back to original: ${originalSrc}`);
                    
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => {
                        // 使用原始图片
                        img.src = originalSrc;
                        
                        // 移除懒加载类
                        img.classList.remove('lazy-loading');
                        img.classList.add('loaded');

                        // 移除占位符
                        if (img.placeholder) {
                            img.placeholder.remove();
                            img.style.display = '';
                        }

                        // 添加加载动画
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.3s ease';
                        
                        requestAnimationFrame(() => {
                            img.style.opacity = '1';
                        });

                        resolve(img);
                    };
                    
                    fallbackImg.onerror = () => {
                        // 连原始图片也加载失败
                        img.classList.remove('lazy-loading');
                        img.classList.add('load-error');
                        
                        if (img.placeholder) {
                            img.placeholder.textContent = 'Failed to load image';
                            img.placeholder.style.background = '#ffebee';
                            img.placeholder.style.color = '#c62828';
                        }

                        reject(new Error('Failed to load both optimized and original image'));
                    };
                    
                    fallbackImg.src = originalSrc;
                } else {
                    // 原始图片加载失败
                    img.classList.remove('lazy-loading');
                    img.classList.add('load-error');
                    
                    if (img.placeholder) {
                        img.placeholder.textContent = 'Failed to load image';
                        img.placeholder.style.background = '#ffebee';
                        img.placeholder.style.color = '#c62828';
                    }

                    reject(new Error('Failed to load image'));
                }
            };

            // 开始加载优化版本
            newImg.src = optimizedSrc;
        });
    }

    /**
     * 获取优化后的图片源
     */
    getOptimizedImageSrc(originalSrc) {
        // 如果是QuickChart图表，进行特殊处理
        if (originalSrc.includes('quickchart.io')) {
            return this.optimizeChartSrc(originalSrc);
        }

        // 其他图片的优化处理
        return this.optimizeRegularImageSrc(originalSrc);
    }

    /**
     * 优化图表源
     */
    optimizeChartSrc(originalSrc) {
        if (!this.isMobile) {
            return originalSrc;
        }

        try {
            const url = new URL(originalSrc);
            const params = new URLSearchParams(url.search);
            
            // 获取图表配置
            let config = params.get('c');
            if (config) {
                config = decodeURIComponent(config);
                const chartConfig = JSON.parse(config);
                
                // 移动端优化
                if (this.isSmallMobile) {
                    url.searchParams.set('width', '320');
                    url.searchParams.set('height', '200');
                } else {
                    url.searchParams.set('width', this.options.chartMobileWidth.toString());
                    url.searchParams.set('height', this.options.chartMobileHeight.toString());
                }

                // 优化图表配置
                if (chartConfig.options) {
                    // 移动端字体大小调整
                    if (!chartConfig.options.plugins) chartConfig.options.plugins = {};
                    if (!chartConfig.options.plugins.legend) chartConfig.options.plugins.legend = {};
                    chartConfig.options.plugins.legend.labels = {
                        ...chartConfig.options.plugins.legend.labels,
                        font: { size: this.isSmallMobile ? 10 : 12 }
                    };

                    // 标题字体调整
                    if (chartConfig.options.plugins.title) {
                        chartConfig.options.plugins.title.font = {
                            ...chartConfig.options.plugins.title.font,
                            size: this.isSmallMobile ? 12 : 14
                        };
                    }

                    // 坐标轴字体调整
                    if (chartConfig.options.scales) {
                        Object.keys(chartConfig.options.scales).forEach(axis => {
                            if (chartConfig.options.scales[axis].ticks) {
                                chartConfig.options.scales[axis].ticks.font = {
                                    size: this.isSmallMobile ? 9 : 10
                                };
                            }
                        });
                    }
                }

                // 更新配置参数
                url.searchParams.set('c', encodeURIComponent(JSON.stringify(chartConfig)));
            }

            return url.toString();
        } catch (error) {
            console.warn('Failed to optimize chart:', error);
            return originalSrc;
        }
    }

    /**
     * 优化常规图片源
     */
    optimizeRegularImageSrc(originalSrc) {
        // 如果是外部图片，直接返回
        if (originalSrc.startsWith('http') && !originalSrc.includes(window.location.hostname)) {
            return originalSrc;
        }

        // 对于博客图片，默认使用原始图片，不尝试高分辨率版本
        if (originalSrc.includes('/images/') || originalSrc.includes('blog')) {
            return originalSrc;
        }

        // 本地图片优化逻辑
        let optimizedSrc = originalSrc;

        // 根据设备像素比调整 - 只在设备像素比大于2时尝试高分辨率版本
        if (this.options.enableRetina && this.devicePixelRatio > 2) {
            // 尝试加载高分辨率版本（只针对非常高的像素比）
            const extension = originalSrc.split('.').pop();
            const baseName = originalSrc.replace(`.${extension}`, '');
            optimizedSrc = `${baseName}@${Math.min(this.devicePixelRatio, 3)}x.${extension}`;
        }

        return optimizedSrc;
    }

    /**
     * 优化图片属性
     */
    optimizeImageAttributes(img) {
        // 设置loading属性
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }

        // 设置decoding属性
        if ('decoding' in HTMLImageElement.prototype) {
            img.decoding = 'async';
        }

        // 添加尺寸属性以防止布局偏移
        if (!img.width && !img.height) {
            img.style.aspectRatio = '16/9'; // 默认宽高比
        }

        // 添加错误处理
        img.addEventListener('error', (e) => {
            this.handleImageError(e.target);
        });
    }

    /**
     * 处理图片加载错误
     */
    handleImageError(img) {
        img.classList.add('image-error');
        
        // 创建错误占位符
        const errorPlaceholder = document.createElement('div');
        errorPlaceholder.className = 'image-error-placeholder';
        errorPlaceholder.style.cssText = `
            width: 100%;
            height: 200px;
            background: #ffebee;
            border: 2px dashed #e57373;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #c62828;
            font-size: 0.875rem;
            text-align: center;
            padding: 1rem;
        `;
        errorPlaceholder.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div>
            <div>Image failed to load</div>
            <div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.7;">
                ${img.alt || 'No description available'}
            </div>
        `;

        // 替换图片
        img.parentNode.insertBefore(errorPlaceholder, img);
        img.style.display = 'none';
    }

    /**
     * 优化图表
     */
    optimizeCharts() {
        const chartImages = document.querySelectorAll('.blog-mobile-optimized img[src*="quickchart.io"]');
        
        chartImages.forEach(img => {
            this.charts.add(img);
            img.classList.add('mobile-chart');
            
            // 添加图表特定的样式
            img.style.cssText += `
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                background: white;
                padding: 8px;
                margin: 1rem auto;
                display: block;
            `;
        });
    }

    /**
     * 设置窗口大小变化处理
     */
    setupResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        const wasSmallMobile = this.isSmallMobile;
        const wasMobile = this.isMobile;
        
        this.detectMobileDevice();
        
        // 如果设备类型发生变化，重新优化图片
        if (wasSmallMobile !== this.isSmallMobile || wasMobile !== this.isMobile) {
            this.reoptimizeImages();
        }
    }

    /**
     * 重新优化图片
     */
    reoptimizeImages() {
        // 重新优化图表
        this.charts.forEach(img => {
            const originalSrc = img.dataset.originalSrc || img.src;
            img.dataset.originalSrc = originalSrc;
            
            const optimizedSrc = this.getOptimizedImageSrc(originalSrc);
            if (optimizedSrc !== img.src) {
                img.src = optimizedSrc;
            }
        });
    }

    /**
     * 观察新添加的图片
     */
    observeNewImages() {
        if (!this.options.enableIntersectionObserver) return;

        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 检查新添加的图片
                        const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        images.forEach(img => {
                            if (!this.images.has(img)) {
                                this.processImage(img);
                            }
                        });
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.set('mutation', mutationObserver);
    }

    /**
     * 立即加载所有图片（降级处理）
     */
    loadAllImages() {
        const images = document.querySelectorAll('.blog-mobile-optimized img');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            this.optimizeImageAttributes(img);
        });
    }

    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        return {
            totalImages: this.images.size,
            totalCharts: this.charts.size,
            loadedImages: document.querySelectorAll('.blog-mobile-optimized img.loaded').length,
            errorImages: document.querySelectorAll('.blog-mobile-optimized img.image-error').length,
            isMobile: this.isMobile,
            isSmallMobile: this.isSmallMobile,
            devicePixelRatio: this.devicePixelRatio,
            connectionSpeed: this.connectionSpeed
        };
    }

    /**
     * 销毁优化器
     */
    destroy() {
        // 清理观察器
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        // 清理集合
        this.images.clear();
        this.charts.clear();

        // 移除事件监听器
        window.removeEventListener('resize', this.handleResize);
    }
}

// 自动初始化
if (document.body.classList.contains('blog-mobile-optimized')) {
    window.mobileImageOptimizer = new MobileImageOptimizer();
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileImageOptimizer;
}