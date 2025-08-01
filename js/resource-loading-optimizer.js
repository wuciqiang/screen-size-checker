// resource-loading-optimizer.js - Intelligent Resource Loading Optimization System

/**
 * Resource Loading Optimizer Class
 * Manages intelligent resource loading strategies with device capability assessment
 * and network condition detection for optimal performance
 */
class ResourceLoadingOptimizer {
    constructor() {
        this.criticalResources = new Set([
            'css/base.css',
            'css/main.css',
            'js/app.js',
            'js/device-detector.js',
            'js/utils.js'
        ]);
        
        this.deferredResources = new Set([
            'css/blog.css',
            'css/simulator.css',
            'css/comparison.css',
            'css/blog-progress.css',
            'js/blog.js',
            'js/simulator.js',
            'js/ppi-calculator.js',
            'js/aspect-ratio-calculator.js',
            'js/device-comparison.js',
            'js/internal-links.js'
        ]);
        
        this.loadedResources = new Set();
        this.loadingPromises = new Map();
        this.deviceCapabilities = null;
        this.networkInfo = null;
        this.maxConcurrentRequests = 6;
        this.activeRequests = 0;
        this.requestQueue = [];
        
        console.log('🚀 ResourceLoadingOptimizer initialized');
    }
    
    /**
     * Initialize the resource loading optimizer
     */
    async initialize() {
        console.log('🔧 Initializing ResourceLoadingOptimizer...');
        
        try {
            // Assess device capabilities and network conditions
            this.deviceCapabilities = this.assessDeviceCapabilities();
            this.networkInfo = this.getNetworkInfo();
            
            // Adjust optimization strategy based on device and network
            this.adjustOptimizationStrategy();
            
            console.log('📊 Device capabilities:', this.deviceCapabilities);
            console.log('🌐 Network info:', this.networkInfo);
            
            // Start intelligent resource loading
            await this.startIntelligentLoading();
            
            console.log('✅ ResourceLoadingOptimizer initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize ResourceLoadingOptimizer:', error);
        }
    }
    
    /**
     * Assess device capabilities for optimization decisions
     */
    assessDeviceCapabilities() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        
        // Determine device performance tier
        let performanceTier = 'high';
        if (memory < 4 || cores < 4) {
            performanceTier = 'low';
        } else if (memory < 8 || cores < 8) {
            performanceTier = 'medium';
        }
        
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         window.innerWidth <= 768;
        
        return {
            memory,
            cores,
            performanceTier,
            isMobile,
            connectionType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 10,
            rtt: connection?.rtt || 100,
            isLowEnd: performanceTier === 'low',
            isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
        };
    }
    
    /**
     * Get current network information
     */
    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (!connection) {
            return { 
                type: 'unknown', 
                speed: 'unknown',
                saveData: false,
                effectiveType: 'unknown'
            };
        }
        
        return {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData || false,
            effectiveType: connection.effectiveType
        };
    }
    
    /**
     * Adjust optimization strategy based on device and network conditions
     */
    adjustOptimizationStrategy() {
        const { isLowEnd, isSlowConnection, isMobile } = this.deviceCapabilities;
        const { saveData } = this.networkInfo;
        
        // Adjust concurrent request limits
        if (saveData || isSlowConnection) {
            this.maxConcurrentRequests = 2;
        } else if (isLowEnd || isMobile) {
            this.maxConcurrentRequests = 4;
        } else {
            this.maxConcurrentRequests = 8;
        }
        
        console.log(`🎯 Optimization strategy adjusted: maxConcurrentRequests=${this.maxConcurrentRequests}`);
    }
    
    /**
     * Start intelligent resource loading process
     */
    async startIntelligentLoading() {
        console.log('🚀 Starting intelligent resource loading...');
        
        // Phase 1: Preload critical resources immediately
        await this.preloadCriticalResources();
        
        // Phase 2: Setup deferred loading for non-critical resources
        this.setupDeferredLoading();
        
        // Phase 3: Monitor and optimize ongoing resource loading
        this.setupResourceMonitoring();
    }
    
    /**
     * Preload critical resources with high priority
     */
    async preloadCriticalResources() {
        console.log('⚡ Preloading critical resources...');
        
        const preloadPromises = [];
        
        for (const resource of this.criticalResources) {
            if (!this.loadedResources.has(resource)) {
                const promise = this.preloadResource(resource, { priority: 'high' });
                preloadPromises.push(promise);
            }
        }
        
        try {
            await Promise.all(preloadPromises);
            console.log('✅ Critical resources preloaded successfully');
        } catch (error) {
            console.error('❌ Error preloading critical resources:', error);
        }
    }
    
    /**
     * Preload a single resource with specified priority
     */
    async preloadResource(url, options = {}) {
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }
        
        const promise = new Promise((resolve, reject) => {
            // Check concurrent request limit
            if (this.activeRequests >= this.maxConcurrentRequests) {
                this.requestQueue.push({ url, options, resolve, reject });
                return;
            }
            
            this.activeRequests++;
            
            const link = document.createElement('link');
            link.rel = 'preload';
            
            // Set appropriate 'as' attribute based on file type
            if (url.endsWith('.css')) {
                link.as = 'style';
            } else if (url.endsWith('.js')) {
                link.as = 'script';
            } else if (url.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)) {
                link.as = 'image';
            } else if (url.match(/\.(woff|woff2|ttf|otf)$/i)) {
                link.as = 'font';
                link.crossOrigin = 'anonymous';
            }
            
            link.href = url;
            
            // Set priority if supported
            if (options.priority && 'fetchPriority' in link) {
                link.fetchPriority = options.priority;
            }
            
            link.onload = () => {
                this.loadedResources.add(url);
                this.activeRequests--;
                this.processRequestQueue();
                
                console.log(`✅ Resource preloaded: ${url}`);
                resolve();
            };
            
            link.onerror = (error) => {
                this.activeRequests--;
                this.processRequestQueue();
                
                console.error(`❌ Failed to preload resource: ${url}`, error);
                reject(error);
            };
            
            document.head.appendChild(link);
        });
        
        this.loadingPromises.set(url, promise);
        return promise;
    }
    
    /**
     * Process queued requests when slots become available
     */
    processRequestQueue() {
        while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const { url, options, resolve, reject } = this.requestQueue.shift();
            
            this.activeRequests++;
            
            // Execute the preload
            this.executePreload(url, options)
                .then(resolve)
                .catch(reject);
        }
    }
    
    /**
     * Execute actual preload operation
     */
    async executePreload(url, options) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            
            if (url.endsWith('.css')) {
                link.as = 'style';
            } else if (url.endsWith('.js')) {
                link.as = 'script';
            } else if (url.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)) {
                link.as = 'image';
            } else if (url.match(/\.(woff|woff2|ttf|otf)$/i)) {
                link.as = 'font';
                link.crossOrigin = 'anonymous';
            }
            
            link.href = url;
            
            if (options.priority && 'fetchPriority' in link) {
                link.fetchPriority = options.priority;
            }
            
            link.onload = () => {
                this.loadedResources.add(url);
                this.activeRequests--;
                this.processRequestQueue();
                resolve();
            };
            
            link.onerror = (error) => {
                this.activeRequests--;
                this.processRequestQueue();
                reject(error);
            };
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * Setup deferred loading for non-critical resources
     */
    setupDeferredLoading() {
        console.log('⏳ Setting up deferred resource loading...');
        
        const { isLowEnd, isSlowConnection } = this.deviceCapabilities;
        const { saveData } = this.networkInfo;
        
        // Determine delay based on device and network conditions
        let delay = 1000; // Default 1 second
        
        if (saveData || isSlowConnection) {
            delay = 3000; // 3 seconds for slow connections
        } else if (isLowEnd) {
            delay = 2000; // 2 seconds for low-end devices
        }
        
        // Use requestIdleCallback for better performance
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                setTimeout(() => {
                    this.loadDeferredResources();
                }, delay);
            }, { timeout: delay + 1000 });
        } else {
            // Fallback to setTimeout
            setTimeout(() => {
                this.loadDeferredResources();
            }, delay);
        }
    }
    
    /**
     * Load deferred resources with intelligent prioritization
     */
    async loadDeferredResources() {
        console.log('📦 Loading deferred resources...');
        
        const deferredArray = Array.from(this.deferredResources);
        
        // Prioritize resources based on current page context
        const prioritizedResources = this.prioritizeResourcesByContext(deferredArray);
        
        // Load resources in batches to avoid overwhelming the browser
        const batchSize = Math.max(2, Math.floor(this.maxConcurrentRequests / 2));
        
        for (let i = 0; i < prioritizedResources.length; i += batchSize) {
            const batch = prioritizedResources.slice(i, i + batchSize);
            const batchPromises = batch.map(resource => 
                this.loadResourceAsync(resource, { priority: 'low' })
            );
            
            try {
                await Promise.all(batchPromises);
                console.log(`✅ Loaded resource batch ${Math.floor(i / batchSize) + 1}`);
            } catch (error) {
                console.error(`❌ Error loading resource batch:`, error);
            }
            
            // Small delay between batches for low-end devices
            if (this.deviceCapabilities.isLowEnd) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        console.log('✅ All deferred resources loaded');
    }
    
    /**
     * Prioritize resources based on current page context
     */
    prioritizeResourcesByContext(resources) {
        const currentPath = window.location.pathname;
        const prioritized = [];
        const normal = [];
        
        resources.forEach(resource => {
            let isPriority = false;
            
            // Blog-related resources for blog pages
            if (currentPath.includes('/blog/') && resource.includes('blog')) {
                isPriority = true;
            }
            
            // Calculator resources for calculator pages
            if (currentPath.includes('calculator') && resource.includes('calculator')) {
                isPriority = true;
            }
            
            // Simulator resources for simulator pages
            if (currentPath.includes('simulator') && resource.includes('simulator')) {
                isPriority = true;
            }
            
            // Comparison resources for device comparison pages
            if (currentPath.includes('compare') && resource.includes('comparison')) {
                isPriority = true;
            }
            
            if (isPriority) {
                prioritized.push(resource);
            } else {
                normal.push(resource);
            }
        });
        
        return [...prioritized, ...normal];
    }
    
    /**
     * Load resource asynchronously with error handling
     */
    async loadResourceAsync(url, options = {}) {
        if (this.loadedResources.has(url)) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            if (url.endsWith('.css')) {
                this.loadCSSAsync(url, options).then(resolve).catch(reject);
            } else if (url.endsWith('.js')) {
                this.loadJSAsync(url, options).then(resolve).catch(reject);
            } else {
                // For other resources, use preload
                this.preloadResource(url, options).then(resolve).catch(reject);
            }
        });
    }
    
    /**
     * Load CSS file asynchronously
     */
    async loadCSSAsync(href, options = {}) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            // Use media="print" trick to avoid render blocking, then switch to "all"
            link.media = 'print';
            
            link.onload = () => {
                link.media = 'all';
                this.loadedResources.add(href);
                console.log(`✅ CSS loaded: ${href}`);
                resolve();
            };
            
            link.onerror = (error) => {
                console.error(`❌ Failed to load CSS: ${href}`, error);
                reject(error);
            };
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * Load JavaScript file asynchronously
     */
    async loadJSAsync(src, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            // Set priority if supported
            if (options.priority && 'fetchPriority' in script) {
                script.fetchPriority = options.priority;
            }
            
            script.onload = () => {
                this.loadedResources.add(src);
                console.log(`✅ JS loaded: ${src}`);
                resolve();
            };
            
            script.onerror = (error) => {
                console.error(`❌ Failed to load JS: ${src}`, error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Setup resource monitoring for performance tracking
     */
    setupResourceMonitoring() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    // Monitor resource loading performance
                    if (entry.duration > 1000) {
                        console.warn(`⚠️ Slow resource detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                    }
                    
                    // Track resource sizes
                    if (entry.transferSize > 100 * 1024) { // > 100KB
                        console.warn(`⚠️ Large resource detected: ${entry.name} (${(entry.transferSize / 1024).toFixed(2)}KB)`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
            
            // Setup network change monitoring
            this.setupNetworkChangeMonitoring();
            
        } catch (error) {
            console.error('Error setting up resource monitoring:', error);
        }
    }
    
    /**
     * Setup network change monitoring to adjust loading strategy
     */
    setupNetworkChangeMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (connection) {
                connection.addEventListener('change', () => {
                    console.log('🌐 Network conditions changed');
                    this.updateNetworkConditions();
                });
            }
        }
        
        // Also monitor online/offline events
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.handleConnectionRestore();
        });
        
        window.addEventListener('offline', () => {
            console.log('🌐 Connection lost');
            this.handleConnectionLoss();
        });
    }
    
    /**
     * Handle connection restoration
     */
    handleConnectionRestore() {
        console.log('📡 Handling connection restore...');
        
        // Resume any queued requests
        this.processRequestQueue();
        
        // Re-assess network conditions
        this.updateNetworkConditions();
    }
    
    /**
     * Handle connection loss
     */
    handleConnectionLoss() {
        console.log('📡 Handling connection loss...');
        
        // Pause non-critical resource loading
        this.requestQueue = [];
        
        // Set conservative loading strategy
        this.maxConcurrentRequests = 1;
    }
    
    /**
     * Check if resource is already loaded
     */
    isResourceLoaded(url) {
        return this.loadedResources.has(url);
    }
    
    /**
     * Get loading statistics
     */
    getLoadingStats() {
        return {
            totalResources: this.criticalResources.size + this.deferredResources.size,
            loadedResources: this.loadedResources.size,
            activeRequests: this.activeRequests,
            queuedRequests: this.requestQueue.length,
            maxConcurrentRequests: this.maxConcurrentRequests,
            deviceCapabilities: this.deviceCapabilities,
            networkInfo: this.networkInfo
        };
    }
    
    /**
     * Force load a specific resource immediately
     */
    async forceLoadResource(url, options = {}) {
        console.log(`🚀 Force loading resource: ${url}`);
        
        if (this.loadedResources.has(url)) {
            console.log(`Resource already loaded: ${url}`);
            return Promise.resolve();
        }
        
        return this.loadResourceAsync(url, { ...options, priority: 'high' });
    }
    
    /**
     * Add resource to critical list
     */
    addCriticalResource(url) {
        this.criticalResources.add(url);
        console.log(`Added critical resource: ${url}`);
    }
    
    /**
     * Add resource to deferred list
     */
    addDeferredResource(url) {
        this.deferredResources.add(url);
        console.log(`Added deferred resource: ${url}`);
    }
    
    /**
     * Remove resource from loading lists
     */
    removeResource(url) {
        this.criticalResources.delete(url);
        this.deferredResources.delete(url);
        console.log(`Removed resource: ${url}`);
    }
    
    /**
     * Update network conditions and adjust strategy
     */
    updateNetworkConditions() {
        const newNetworkInfo = this.getNetworkInfo();
        
        if (JSON.stringify(newNetworkInfo) !== JSON.stringify(this.networkInfo)) {
            console.log('🌐 Network conditions changed, adjusting strategy...');
            this.networkInfo = newNetworkInfo;
            this.adjustOptimizationStrategy();
        }
    }
    
    /**
     * Cleanup and destroy the optimizer
     */
    destroy() {
        console.log('🧹 Cleaning up ResourceLoadingOptimizer...');
        
        // Clear all promises and queues
        this.loadingPromises.clear();
        this.requestQueue = [];
        this.loadedResources.clear();
        
        console.log('✅ ResourceLoadingOptimizer cleanup completed');
    }
}

// Export the class
export { ResourceLoadingOptimizer };

// Create and export global instance
export const resourceLoadingOptimizer = new ResourceLoadingOptimizer();

console.log('📦 Resource Loading Optimizer module loaded');