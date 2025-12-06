// internal-links.js - 统一内链管理系统

/**
 * 内链管理器类
 * 负责加载配置、检测当前页面、渲染内链组件
 */
export class InternalLinksManager {
    constructor(options = {}) {
        this.config = null;
        this.currentPageId = null;
        this.currentLanguage = 'zh';
        this.options = {
            maxItems: 8,
            excludeCurrent: true,
            configPath: this.getConfigPath(),
            ...options
        };
        
        // DOM 元素
        this.container = null;
        this.template = null;
        this.loadingElement = null;
        
        // 状态
        this.isInitialized = false;
        this.isLoading = false;
    }

    /**
     * 获取配置文件路径
     */
    getConfigPath() {
        const currentPath = window.location.pathname;
        
        // 根据当前页面位置计算配置文件的相对路径
        if (currentPath.includes('/blog/')) {
            // 在博客页面中，需要返回上级目录
            return '../data/internal-links-config.json';
        } else if (currentPath.includes('/devices/')) {
            // 在设备页面中，需要返回上级目录
            return '../data/internal-links-config.json';
        } else if (currentPath.includes('/multilang-build/')) {
            // 在构建目录中
            if (currentPath.includes('/multilang-build/en/') || currentPath.includes('/multilang-build/zh/')) {
                return '../data/internal-links-config.json';
            }
        } else {
            // 在根目录或其他位置
            return 'data/internal-links-config.json';
        }
        
        // 默认路径
        return 'data/internal-links-config.json';
    }

    /**
     * 初始化内链管理器
     */
    async init() {
        if (this.isInitialized) {
            console.log('Internal links manager already initialized');
            return;
        }

        try {
            console.log('🔗 Initializing Internal Links Manager...');
            
            // 检查DOM元素是否存在
            const elementsFound = this.bindElements();
            if (!elementsFound) {
                console.log('Internal links component disabled - required elements not found');
                return;
            }
            
            this.detectCurrentPage();
            this.detectLanguage();
            
            await this.loadConfig();
            await this.render();
            
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('✅ Internal Links Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Internal Links Manager:', error);
            if (this.container) {
                this.showError('初始化失败', '无法加载相关资源链接');
            }
        }
    }

    /**
     * 绑定DOM元素
     */
    bindElements() {
        this.container = document.getElementById('internal-links-container');
        this.template = document.getElementById('internal-link-template');
        this.loadingElement = document.getElementById('internal-links-loading');
        
        if (!this.container) {
            console.warn('Internal links container not found - component will be disabled');
            return false;
        }
        
        if (!this.template) {
            console.warn('Internal link template not found - component will be disabled');
            return false;
        }
        
        return true;
    }

    /**
     * 检测当前页面ID
     */
    detectCurrentPage() {
        // 优先使用构建时注入的页面ID
        if (window.CURRENT_PAGE_ID) {
            this.currentPageId = window.CURRENT_PAGE_ID;
            console.log('🔍 Current page ID from build injection:', this.currentPageId);
            return;
        }
        
        // 降级到URL检测
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        
        // 从URL中提取页面ID
        let pageFile = segments[segments.length - 1];
        if (pageFile && pageFile.endsWith('.html')) {
            pageFile = pageFile.replace('.html', '');
        }
        
        // 处理特殊情况
        if (pageFile === 'index' || !pageFile) {
            if (path.includes('/blog/')) {
                this.currentPageId = 'blog';
            } else {
                this.currentPageId = 'index';
            }
        } else {
            this.currentPageId = pageFile;
        }
        
        console.log('🔍 Detected current page from URL:', this.currentPageId);
    }

    /**
     * 检测当前语言
     */
    detectLanguage() {
        const path = window.location.pathname;
        
        if (path.includes('/zh/')) {
            this.currentLanguage = 'zh';
        } else if (path.includes('/en/')) {
            this.currentLanguage = 'en';
        } else {
            // 默认语言检测
            this.currentLanguage = document.documentElement.lang || 'zh';
        }
        
        console.log('🌍 Detected language:', this.currentLanguage);
    }

    /**
     * 加载配置文件
     */
    async loadConfig() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // 优先使用构建时注入的配置
            if (window.INTERNAL_LINKS_CONFIG) {
                this.config = window.INTERNAL_LINKS_CONFIG;
                console.log('📋 Config loaded from build injection:', this.config);
                return;
            }
            
            // 降级到运行时加载
            const response = await fetch(this.options.configPath);
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status}`);
            }
            
            this.config = await response.json();
            console.log('📋 Config loaded from file:', this.config);
            
        } catch (error) {
            console.error('Failed to load internal links config:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 获取相关链接
     */
    getRelevantLinks() {
        if (!this.config || !this.config.pages) {
            return [];
        }

        const allPages = Object.values(this.config.pages);
        let relevantLinks = allPages;

        // 排除当前页面
        if (this.options.excludeCurrent && this.currentPageId) {
            relevantLinks = relevantLinks.filter(page => page.id !== this.currentPageId);
        }

        // 首页排除blog链接（顶部导航已有blog入口）
        if (this.currentPageId === 'index' || this.currentPageId === 'index-root') {
            console.log('🚫 Excluding blog from homepage, currentPageId:', this.currentPageId);
            relevantLinks = relevantLinks.filter(page => page.id !== 'blog');
        }
        
        console.log('📋 Relevant links after filtering:', relevantLinks.map(p => p.id));

        // 计算相关性分数并排序
        relevantLinks = relevantLinks.map(page => ({
            ...page,
            relevanceScore: this.calculateRelevance(page)
        }));

        // 智能分类和排序
        const categorizedLinks = this.categorizeAndSortLinks(relevantLinks);
        
        // 根据设备类型调整显示数量
        const maxItems = this.getMaxItemsForDevice();
        
        return categorizedLinks.slice(0, maxItems);
    }

    /**
     * 智能分类和排序链接
     */
    categorizeAndSortLinks(links) {
        if (!this.config.rules?.prioritizeCategory) {
            // 如果不启用分类优先，直接按相关性排序
            return links.sort((a, b) => {
                if (b.relevanceScore !== a.relevanceScore) {
                    return b.relevanceScore - a.relevanceScore;
                }
                return a.priority - b.priority;
            });
        }

        // 按分类分组
        const categorizedLinks = {};
        links.forEach(link => {
            const category = link.category || 'other';
            if (!categorizedLinks[category]) {
                categorizedLinks[category] = [];
            }
            categorizedLinks[category].push(link);
        });

        // 对每个分类内的链接排序
        Object.keys(categorizedLinks).forEach(category => {
            categorizedLinks[category].sort((a, b) => {
                if (b.relevanceScore !== a.relevanceScore) {
                    return b.relevanceScore - a.relevanceScore;
                }
                return a.priority - b.priority;
            });
        });

        // 按分类优先级合并结果
        const sortedCategories = Object.keys(categorizedLinks).sort((a, b) => {
            const categoryA = this.config.categories[a];
            const categoryB = this.config.categories[b];
            const priorityA = categoryA?.priority || 999;
            const priorityB = categoryB?.priority || 999;
            return priorityA - priorityB;
        });

        const result = [];
        const currentPage = this.config.pages[this.currentPageId];
        const currentCategory = currentPage?.category;

        // 优先添加当前页面同类别的链接
        if (currentCategory && categorizedLinks[currentCategory]) {
            const categoryConfig = this.config.categories[currentCategory];
            const maxCategoryItems = categoryConfig?.maxItems || 3;
            result.push(...categorizedLinks[currentCategory].slice(0, maxCategoryItems));
            delete categorizedLinks[currentCategory];
        }

        // 添加其他分类的链接
        sortedCategories.forEach(category => {
            if (categorizedLinks[category]) {
                const categoryConfig = this.config.categories[category];
                const maxCategoryItems = categoryConfig?.maxItems || 2;
                result.push(...categorizedLinks[category].slice(0, maxCategoryItems));
            }
        });

        return result;
    }

    /**
     * 根据设备类型获取最大显示数量
     */
    getMaxItemsForDevice() {
        const defaultMax = this.config?.display?.maxTotal || 9;
        
        if (!this.config?.display?.responsive) {
            return defaultMax;
        }

        // 检测设备类型 - 使用更准确的移动端检测
        const screenWidth = window.innerWidth;
        const isMobileDevice = this.isMobileDevice();
        
        console.log(`📱 Device detection: screenWidth=${screenWidth}, isMobile=${isMobileDevice}`);
        
        if (isMobileDevice && screenWidth <= 480) {
            // 小屏幕移动设备
            const mobileCount = this.config.display.responsive.mobile || 6;
            console.log(`📱 Using mobile count: ${mobileCount}`);
            return mobileCount;
        } else if (isMobileDevice && screenWidth <= 768) {
            // 大屏幕移动设备/小平板
            const tabletCount = this.config.display.responsive.tablet || 8;
            console.log(`📱 Using tablet count: ${tabletCount}`);
            return tabletCount;
        } else if (screenWidth <= 1024) {
            // 平板设备
            const tabletCount = this.config.display.responsive.tablet || 8;
            console.log(`💻 Using tablet count: ${tabletCount}`);
            return tabletCount;
        } else {
            // 桌面设备
            const desktopCount = this.config.display.responsive.desktop || defaultMax;
            console.log(`🖥️ Using desktop count: ${desktopCount}`);
            return desktopCount;
        }
    }

    /**
     * 检测是否为移动设备
     */
    isMobileDevice() {
        // 检查是否有移动端性能优化器
        if (window.isMobileDevice && typeof window.isMobileDevice === 'function') {
            return window.isMobileDevice();
        }
        
        // 改进的移动设备检测逻辑
        const userAgent = navigator.userAgent.toLowerCase();
        const screenWidth = window.innerWidth;
        
        // 更准确的移动设备UA检测
        const mobilePatterns = [
            /android.*mobile/i, 
            /iphone/i, 
            /ipod/i, 
            /mobile/i,
            /blackberry/i,
            /windows phone/i
        ];
        
        // 平板设备检测（不应该被认为是移动设备）
        const tabletPatterns = [
            /ipad/i,
            /android(?!.*mobile)/i,
            /tablet/i
        ];
        
        const hasMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
        const hasTabletUA = tabletPatterns.some(pattern => pattern.test(userAgent));
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 如果是平板设备，根据屏幕尺寸判断
        if (hasTabletUA) {
            return screenWidth <= 768; // 小平板当作移动设备
        }
        
        // 移动设备判断：有移动UA或者（小屏幕+触摸支持）
        return hasMobileUA || (screenWidth <= 480 && hasTouchSupport);
    }

    /**
     * 计算页面相关性分数
     */
    calculateRelevance(targetPage) {
        let score = 0;
        
        if (!this.config || !this.currentPageId) {
            return score;
        }

        const currentPage = this.config.pages[this.currentPageId];
        if (!currentPage) {
            return score;
        }

        // 同类别加分（最高权重）
        if (currentPage.category === targetPage.category) {
            score += 20;
        }

        // 页面优先级加分（数字越小分数越高）
        score += Math.max(0, 15 - targetPage.priority);

        // 分类优先级加分
        const categoryConfig = this.config.categories[targetPage.category];
        if (categoryConfig) {
            score += Math.max(0, 10 - categoryConfig.priority);
        }

        // 特殊相关性规则
        score += this.calculateSpecialRelevance(currentPage, targetPage);

        return score;
    }

    /**
     * 计算特殊相关性（基于页面类型的特殊关联）
     */
    calculateSpecialRelevance(currentPage, targetPage) {
        let score = 0;

        // 计算器类页面之间的相关性
        if (currentPage.category === 'calculator' && targetPage.category === 'calculator') {
            score += 5;
        }

        // 设备信息页面之间的相关性
        if (currentPage.category === 'device-info' && targetPage.category === 'device-info') {
            score += 5;
        }

        // 工具类页面与计算器的相关性
        if ((currentPage.category === 'tools' && targetPage.category === 'calculator') ||
            (currentPage.category === 'calculator' && targetPage.category === 'tools')) {
            score += 3;
        }

        // 设备信息与对比工具的相关性
        if ((currentPage.category === 'device-info' && targetPage.id === 'compare') ||
            (currentPage.id === 'compare' && targetPage.category === 'device-info')) {
            score += 8;
        }

        // PPI计算器与设备信息的相关性
        if ((currentPage.id === 'ppi-calculator' && targetPage.category === 'device-info') ||
            (currentPage.category === 'device-info' && targetPage.id === 'ppi-calculator')) {
            score += 6;
        }

        // 响应式测试器与设备信息的相关性
        if ((currentPage.id === 'responsive-tester' && targetPage.category === 'device-info') ||
            (currentPage.category === 'device-info' && targetPage.id === 'responsive-tester')) {
            score += 4;
        }

        return score;
    }

    /**
     * 渲染内链组件
     */
    async render() {
        if (!this.container || !this.template) {
            console.error('Missing required DOM elements for rendering');
            return;
        }

        try {
            // 显示加载状态
            this.showLoading();

            // 获取相关链接
            const links = this.getRelevantLinks();
            
            if (links.length === 0) {
                this.showEmpty();
                return;
            }

            // 清空容器
            this.container.innerHTML = '';

            // 创建文档片段以提高性能
            const fragment = document.createDocumentFragment();

            // 渲染每个链接
            for (const link of links) {
                const linkElement = await this.createLinkElement(link);
                if (linkElement) {
                    fragment.appendChild(linkElement);
                }
            }

            // 一次性添加到DOM
            this.container.appendChild(fragment);

            console.log(`✅ Rendered ${links.length} internal links`);

        } catch (error) {
            console.error('Error rendering internal links:', error);
            this.showError('渲染失败', '无法显示相关资源链接');
        }
    }

    /**
     * 创建单个链接元素
     */
    async createLinkElement(linkData) {
        try {
            // 克隆模板
            const linkElement = this.template.content.cloneNode(true);
            const card = linkElement.querySelector('.internal-link-card');
            const icon = linkElement.querySelector('.link-icon');
            const title = linkElement.querySelector('.link-title');
            const description = linkElement.querySelector('.link-description');

            // 设置URL
            const url = this.buildUrl(linkData);
            card.href = url;
            card.setAttribute('data-category', linkData.category || '');
            card.setAttribute('data-page-id', linkData.id || '');

            // 设置图标
            icon.textContent = linkData.icon || '🔗';

            // 设置标题
            const titleText = await this.getTranslatedText(linkData.titleKey);
            title.textContent = titleText;

            // 设置描述
            const descriptionText = await this.getTranslatedText(linkData.descriptionKey);
            description.textContent = descriptionText;

            return linkElement;

        } catch (error) {
            console.error('Error creating link element:', error);
            return null;
        }
    }

    /**
     * 构建URL
     */
    buildUrl(linkData) {
        if (!linkData.urls || !linkData.urls[this.currentLanguage]) {
            console.warn('No URL found for language:', this.currentLanguage);
            // 尝试使用其他语言的URL作为降级
            const availableLanguages = Object.keys(linkData.urls || {});
            if (availableLanguages.length > 0) {
                const fallbackUrl = linkData.urls[availableLanguages[0]];
                console.warn(`Using fallback URL for ${availableLanguages[0]}:`, fallbackUrl);
                return this.buildUrlPath(fallbackUrl);
            }
            return '#';
        }

        const relativePath = linkData.urls[this.currentLanguage];
        return this.buildUrlPath(relativePath);
    }

    /**
     * 构建URL路径，处理相对路径和语言前缀
     */
    buildUrlPath(relativePath) {
        const currentPath = window.location.pathname;
        
        // 移除.html后缀（支持clean URLs）
        relativePath = relativePath.replace(/\.html$/, '');
        
        // 如果相对路径已经是绝对路径，直接使用
        if (relativePath.startsWith('/')) {
            return relativePath;
        }
        
        // 如果相对路径已经包含语言前缀，需要根据当前位置调整
        if (relativePath.startsWith(`${this.currentLanguage}/`) || relativePath.startsWith(`en/`) || relativePath.startsWith(`zh/`)) {
            // 移除语言前缀，因为我们会根据当前位置重新构建
            relativePath = relativePath.replace(/^(en|zh)\//, '');
        }
        
        // 判断目标路径的类型
        const isDevicePage = relativePath.startsWith('devices/');
        const isBlogPage = relativePath.startsWith('blog/');
        
        // 根据当前页面位置和目标页面类型计算正确的相对路径
        if (currentPath.includes('/devices/')) {
            // 当前在设备页面中 (如 /zh/devices/xxx.html)
            if (isDevicePage) {
                // 目标也是设备页面，移除devices/前缀
                return relativePath.replace('devices/', '');
            } else if (isBlogPage) {
                // 目标是博客页面，需要返回上级目录
                return `../${relativePath}`;
            } else {
                // 其他页面，直接使用相对路径
                return relativePath;
            }
        } else if (currentPath.includes('/blog/')) {
            // 当前在博客页面中
            if (isDevicePage) {
                // 目标是设备页面，需要返回上级目录
                return `../${relativePath}`;
            } else if (isBlogPage) {
                // 目标也是博客页面，移除blog/前缀
                return relativePath.replace('blog/', '');
            } else {
                // 其他页面，返回上级目录
                return `../${relativePath}`;
            }
        } else if (currentPath.includes(`/${this.currentLanguage}/`)) {
            // 当前在语言子目录的根目录中 (如 /zh/)
            return relativePath;
        } else {
            // 当前在网站根目录
            // 英文版不需要语言前缀（根目录就是英文版）
            if (this.currentLanguage === 'en') {
                return relativePath;
            }
            // 其他语言需要添加语言前缀
            return `${this.currentLanguage}/${relativePath}`;
        }
    }

    /**
     * 获取翻译文本
     */
    async getTranslatedText(key) {
        if (!key) return '';

        // 尝试使用i18next翻译
        if (window.i18next && window.i18next.isInitialized) {
            try {
                const translation = window.i18next.t(key);
                if (translation && translation !== key) {
                    return translation;
                }
            } catch (error) {
                console.warn('Translation failed for key:', key, error);
            }
        }

        // 如果i18next未初始化，等待一段时间后重试
        if (window.i18next && !window.i18next.isInitialized) {
            await this.waitForI18next();
            return this.getTranslatedText(key);
        }

        // 降级到默认文本
        return this.getDefaultText(key);
    }

    /**
     * 等待i18next初始化完成
     */
    async waitForI18next(maxWait = 3000) {
        const startTime = Date.now();
        
        while (!window.i18next?.isInitialized && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return window.i18next?.isInitialized || false;
    }

    /**
     * 获取默认文本（降级方案）
     */
    getDefaultText(key) {
        const defaultTexts = {
            zh: {
                'iphone_sizes': 'iPhone 尺寸',
                'ipad_sizes': 'iPad 尺寸', 
                'android_sizes': 'Android 尺寸',
                'ppi_calculator': 'PPI 计算器',
                'aspect_ratio_calculator': '长宽比计算器',
                'compare_tool': '对比工具',
                'standard_resolutions': '标准分辨率',
                'responsive_tester': '响应式测试器',
                'blog': '博客',
                'iphone_page_description': '查看所有iPhone机型的屏幕尺寸、分辨率和视口信息',
                'ipad_page_description': '查看所有iPad机型的屏幕尺寸、分辨率和视口信息',
                'android_page_description': '查看主流Android设备的屏幕尺寸、分辨率和视口信息',
                'compare_page_description': '对比不同设备的屏幕尺寸和规格参数',
                'standard_resolutions_page_description': '查看标准屏幕分辨率和宽高比参考表',
                'responsive_tester_description': '测试网站在不同屏幕尺寸下的响应式表现'
            },
            en: {
                'iphone_sizes': 'iPhone Sizes',
                'ipad_sizes': 'iPad Sizes',
                'android_sizes': 'Android Sizes',
                'ppi_calculator': 'PPI Calculator',
                'aspect_ratio_calculator': 'Aspect Ratio Calculator',
                'compare_tool': 'Compare Tool',
                'standard_resolutions': 'Standard Resolutions',
                'responsive_tester': 'Responsive Tester',
                'blog': 'Blog',
                'iphone_page_description': 'View screen sizes, resolutions, and viewport information for all iPhone models',
                'ipad_page_description': 'View screen sizes, resolutions, and viewport information for all iPad models',
                'android_page_description': 'View screen sizes, resolutions, and viewport information for popular Android devices',
                'compare_page_description': 'Compare screen sizes and specifications of different devices',
                'standard_resolutions_page_description': 'View standard screen resolutions and aspect ratio reference table',
                'responsive_tester_description': 'Test website responsive performance across different screen sizes'
            }
        };

        const langTexts = defaultTexts[this.currentLanguage] || defaultTexts.zh;
        return langTexts[key] || key;
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
    }

    /**
     * 显示空状态
     */
    showEmpty() {
        const emptyTitle = this.currentLanguage === 'en' ? 'No Related Resources' : '暂无相关资源';
        const emptyDesc = this.currentLanguage === 'en' ? 
            'No related resource links found for current page' : 
            '当前页面没有找到相关的资源链接';
            
        this.container.innerHTML = `
            <div class="internal-links-error">
                <span class="error-icon">📭</span>
                <div class="error-message">${emptyTitle}</div>
                <div class="error-description">${emptyDesc}</div>
            </div>
        `;
    }

    /**
     * 显示错误状态
     */
    showError(title, message) {
        // 如果没有提供多语言错误信息，使用默认的
        if (!title || !message) {
            title = this.currentLanguage === 'en' ? 'Loading Failed' : '初始化失败';
            message = this.currentLanguage === 'en' ? 
                'Unable to load related resource links' : 
                '无法加载相关资源链接';
        }
        
        this.container.innerHTML = `
            <div class="internal-links-error">
                <span class="error-icon">⚠️</span>
                <div class="error-message">${title}</div>
                <div class="error-description">${message}</div>
            </div>
        `;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听语言变化
        if (window.i18next) {
            window.i18next.on('languageChanged', (lng) => {
                console.log('🌍 Language changed to:', lng);
                this.currentLanguage = lng;
                this.render();
            });
        }

        // 监听链接点击（用于统计）
        this.container.addEventListener('click', (event) => {
            const linkCard = event.target.closest('.internal-link-card');
            if (linkCard) {
                const pageId = linkCard.getAttribute('data-page-id');
                const category = linkCard.getAttribute('data-category');
                
                console.log('🔗 Internal link clicked:', {
                    pageId,
                    category,
                    from: this.currentPageId
                });

                // 这里可以添加统计代码
                this.trackLinkClick(pageId, category);
            }
        });
    }

    /**
     * 跟踪链接点击（用于统计分析）
     */
    trackLinkClick(pageId, category) {
        // 可以在这里添加统计代码，比如Google Analytics
        if (window.gtag) {
            window.gtag('event', 'internal_link_click', {
                'page_id': pageId,
                'category': category,
                'from_page': this.currentPageId
            });
        }
    }

    /**
     * 刷新内链（用于动态更新）
     */
    async refresh() {
        console.log('🔄 Refreshing internal links...');
        await this.render();
    }

    /**
     * 销毁管理器
     */
    destroy() {
        if (window.i18next) {
            window.i18next.off('languageChanged');
        }
        
        if (this.container) {
            this.container.removeEventListener('click', this.handleLinkClick);
        }
        
        this.isInitialized = false;
        console.log('🗑️ Internal Links Manager destroyed');
    }
}

/**
 * 初始化内链管理器
 */
export function initializeInternalLinks(options = {}) {
    console.log('🚀 Starting Internal Links initialization...');
    
    // 等待DOM准备就绪
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const manager = new InternalLinksManager(options);
            manager.init();
        });
    } else {
        const manager = new InternalLinksManager(options);
        manager.init();
    }
}

// 自动初始化（如果页面包含内链容器）
if (typeof window !== 'undefined') {
    // 延迟初始化以确保其他脚本加载完成
    setTimeout(() => {
        const container = document.getElementById('internal-links-container');
        if (container) {
            initializeInternalLinks();
        }
    }, 100);
}