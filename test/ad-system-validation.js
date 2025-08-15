/**
 * 广告系统验证测试
 * 验证广告组件、响应式布局和性能指标
 */

class AdSystemValidator {
    constructor() {
        this.testResults = {
            components: [],
            layout: [],
            performance: [],
            cls: [],
            overall: 'pending'
        };
        
        this.startTime = performance.now();
        this.clsObserver = null;
        this.initialCLS = 0;
    }

    /**
     * 运行完整的验证测试套件
     */
    async runFullValidation() {
        console.group('🧪 开始广告系统验证测试');
        
        try {
            // 等待页面完全加载
            await this.waitForPageLoad();
            
            // 运行各项测试
            await this.validateAdComponents();
            await this.validateResponsiveLayout();
            await this.validatePerformanceMetrics();
            await this.validateCLSImpact();
            
            // 生成最终报告
            this.generateFinalReport();
            
        } catch (error) {
            console.error('❌ 验证测试失败:', error);
            this.testResults.overall = 'failed';
        } finally {
            console.groupEnd();
        }
        
        return this.testResults;
    }

    /**
     * 等待页面加载完成
     */
    waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    /**
     * 验证广告组件
     */
    async validateAdComponents() {
        console.log('🔍 验证广告组件...');
        
        const adContainers = document.querySelectorAll('.ad-container');
        const componentTests = [];

        for (const container of adContainers) {
            const test = await this.validateSingleAdComponent(container);
            componentTests.push(test);
        }

        this.testResults.components = componentTests;
        
        const passedTests = componentTests.filter(t => t.passed).length;
        console.log(`✅ 广告组件验证完成: ${passedTests}/${componentTests.length} 通过`);
    }

    /**
     * 验证单个广告组件
     */
    async validateSingleAdComponent(container) {
        const adType = container.dataset.adType || 'unknown';
        const test = {
            adType,
            element: container,
            tests: {},
            passed: false,
            issues: []
        };

        // 测试1: 检查容器结构
        test.tests.structure = this.validateAdStructure(container);
        if (!test.tests.structure.passed) {
            test.issues.push('广告容器结构不正确');
        }

        // 测试2: 检查CSS类和样式
        test.tests.styling = this.validateAdStyling(container);
        if (!test.tests.styling.passed) {
            test.issues.push('广告样式配置不正确');
        }

        // 测试3: 检查AdSense代码
        test.tests.adsenseCode = this.validateAdSenseCode(container);
        if (!test.tests.adsenseCode.passed) {
            test.issues.push('AdSense代码配置不正确');
        }

        // 测试4: 检查响应式行为
        test.tests.responsive = this.validateAdResponsive(container);
        if (!test.tests.responsive.passed) {
            test.issues.push('响应式行为不正确');
        }

        // 测试5: 检查可访问性
        test.tests.accessibility = this.validateAdAccessibility(container);
        if (!test.tests.accessibility.passed) {
            test.issues.push('可访问性问题');
        }

        // 计算总体通过状态
        const allTests = Object.values(test.tests);
        test.passed = allTests.every(t => t.passed);

        return test;
    }

    /**
     * 验证广告结构
     */
    validateAdStructure(container) {
        const issues = [];
        
        // 检查必需的CSS类
        if (!container.classList.contains('ad-container')) {
            issues.push('缺少 ad-container 类');
        }

        // 检查AdSense元素
        const adsenseElement = container.querySelector('.adsbygoogle');
        if (!adsenseElement) {
            issues.push('缺少 adsbygoogle 元素');
        }

        // 检查数据属性
        if (!container.dataset.adType) {
            issues.push('缺少 data-ad-type 属性');
        }

        return {
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 25)
        };
    }

    /**
     * 验证广告样式
     */
    validateAdStyling(container) {
        const issues = [];
        const computedStyle = window.getComputedStyle(container);
        
        // 检查最小高度
        const minHeight = parseInt(computedStyle.minHeight);
        if (minHeight < 50) {
            issues.push('最小高度过小，可能导致CLS问题');
        }

        // 检查定位
        const position = computedStyle.position;
        if (container.classList.contains('ad-skyscraper-right') && position !== 'sticky') {
            issues.push('右侧广告应该使用sticky定位');
        }

        // 检查响应式隐藏
        if (container.classList.contains('ad-skyscraper-right')) {
            const mediaQuery = window.matchMedia('(max-width: 1440px)');
            if (mediaQuery.matches && computedStyle.display !== 'none') {
                issues.push('移动端应该隐藏侧边栏广告');
            }
        }

        return {
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20)
        };
    }

    /**
     * 验证AdSense代码
     */
    validateAdSenseCode(container) {
        const issues = [];
        const adsenseElement = container.querySelector('.adsbygoogle');
        
        if (adsenseElement) {
            // 检查必需属性
            const requiredAttrs = ['data-ad-client', 'data-ad-slot'];
            for (const attr of requiredAttrs) {
                if (!adsenseElement.hasAttribute(attr)) {
                    issues.push(`缺少${attr}属性`);
                }
            }

            // 检查客户端ID格式
            const clientId = adsenseElement.getAttribute('data-ad-client');
            if (clientId && !clientId.startsWith('ca-pub-')) {
                issues.push('客户端ID格式不正确');
            }

            // 检查响应式设置
            const fullWidth = adsenseElement.getAttribute('data-full-width-responsive');
            if (fullWidth !== 'true') {
                issues.push('建议启用全宽响应式');
            }
        }

        return {
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 15)
        };
    }

    /**
     * 验证广告响应式行为
     */
    validateAdResponsive(container) {
        const issues = [];
        const originalWidth = window.innerWidth;
        
        // 模拟不同屏幕尺寸（仅检查CSS规则）
        const breakpoints = [480, 768, 1024, 1440];
        
        for (const breakpoint of breakpoints) {
            const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
            
            if (container.classList.contains('ad-skyscraper-right') && mediaQuery.matches) {
                const computedStyle = window.getComputedStyle(container);
                if (computedStyle.display !== 'none') {
                    issues.push(`在${breakpoint}px断点下侧边栏广告应该隐藏`);
                }
            }
        }

        return {
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 30)
        };
    }

    /**
     * 验证广告可访问性
     */
    validateAdAccessibility(container) {
        const issues = [];
        
        // 检查ARIA标签
        const adsenseElement = container.querySelector('.adsbygoogle');
        if (adsenseElement && !adsenseElement.hasAttribute('aria-label')) {
            // 这不是严重问题，因为AdSense会自动处理
        }

        // 检查焦点管理
        if (container.tabIndex === 0) {
            issues.push('广告容器不应该可聚焦');
        }

        // 检查颜色对比度（如果有文本）
        const textElements = container.querySelectorAll('*');
        for (const element of textElements) {
            if (element.textContent.trim()) {
                // 简单的颜色对比度检查
                const style = window.getComputedStyle(element);
                if (style.color === style.backgroundColor) {
                    issues.push('文本颜色对比度不足');
                }
            }
        }

        return {
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 10)
        };
    }

    /**
     * 验证响应式布局
     */
    async validateResponsiveLayout() {
        console.log('📱 验证响应式布局...');
        
        const layoutTests = [];
        
        // 测试1: 检查布局容器
        layoutTests.push(this.validateLayoutContainers());
        
        // 测试2: 检查CSS Grid实现
        layoutTests.push(this.validateCSSGrid());
        
        // 测试3: 检查媒体查询
        layoutTests.push(this.validateMediaQueries());
        
        // 测试4: 检查侧边栏行为
        layoutTests.push(this.validateSidebarBehavior());

        this.testResults.layout = layoutTests;
        
        const passedTests = layoutTests.filter(t => t.passed).length;
        console.log(`✅ 响应式布局验证完成: ${passedTests}/${layoutTests.length} 通过`);
    }

    /**
     * 验证布局容器
     */
    validateLayoutContainers() {
        const issues = [];
        
        // 检查主布局容器
        const mainLayout = document.querySelector('.main-layout-container');
        if (mainLayout) {
            const style = window.getComputedStyle(mainLayout);
            if (style.display !== 'grid') {
                issues.push('主布局容器应该使用CSS Grid');
            }
        }

        // 检查侧边栏
        const sidebar = document.querySelector('.sidebar-right');
        if (sidebar) {
            const style = window.getComputedStyle(sidebar);
            if (window.innerWidth > 1440 && style.display === 'none') {
                issues.push('桌面端侧边栏不应该隐藏');
            }
        }

        return {
            name: '布局容器',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 25)
        };
    }

    /**
     * 验证CSS Grid实现
     */
    validateCSSGrid() {
        const issues = [];
        const mainLayout = document.querySelector('.main-layout-container');
        
        if (mainLayout) {
            const style = window.getComputedStyle(mainLayout);
            
            // 检查Grid模板
            if (!style.gridTemplateColumns.includes('fr')) {
                issues.push('Grid模板列应该使用fr单位');
            }
            
            // 检查Grid区域
            if (style.gridTemplateAreas === 'none') {
                issues.push('建议使用Grid模板区域');
            }
        } else {
            issues.push('未找到主布局容器');
        }

        return {
            name: 'CSS Grid',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 30)
        };
    }

    /**
     * 验证媒体查询
     */
    validateMediaQueries() {
        const issues = [];
        
        // 检查关键断点
        const breakpoints = [768, 1024, 1440];
        
        for (const bp of breakpoints) {
            const mediaQuery = window.matchMedia(`(max-width: ${bp}px)`);
            
            // 检查侧边栏在移动端的隐藏
            if (bp <= 1440) {
                const sidebar = document.querySelector('.sidebar-right');
                if (sidebar && mediaQuery.matches) {
                    const style = window.getComputedStyle(sidebar);
                    if (style.display !== 'none') {
                        issues.push(`${bp}px断点下侧边栏应该隐藏`);
                    }
                }
            }
        }

        return {
            name: '媒体查询',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20)
        };
    }

    /**
     * 验证侧边栏行为
     */
    validateSidebarBehavior() {
        const issues = [];
        const sidebar = document.querySelector('.sidebar-right');
        
        if (sidebar) {
            const style = window.getComputedStyle(sidebar);
            
            // 检查粘性定位
            if (window.innerWidth > 1440 && style.position !== 'sticky') {
                issues.push('桌面端侧边栏应该使用sticky定位');
            }
            
            // 检查top值
            if (style.position === 'sticky' && !style.top.includes('px')) {
                issues.push('sticky定位应该设置top值');
            }
        }

        return {
            name: '侧边栏行为',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 25)
        };
    }

    /**
     * 验证性能指标
     */
    async validatePerformanceMetrics() {
        console.log('⚡ 验证性能指标...');
        
        const performanceTests = [];
        
        // 等待一段时间让性能指标稳定
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 测试1: 检查页面加载时间
        performanceTests.push(this.validatePageLoadTime());
        
        // 测试2: 检查广告加载性能
        performanceTests.push(this.validateAdLoadPerformance());
        
        // 测试3: 检查资源加载
        performanceTests.push(this.validateResourceLoading());
        
        // 测试4: 检查内存使用
        performanceTests.push(this.validateMemoryUsage());

        this.testResults.performance = performanceTests;
        
        const passedTests = performanceTests.filter(t => t.passed).length;
        console.log(`✅ 性能指标验证完成: ${passedTests}/${performanceTests.length} 通过`);
    }

    /**
     * 验证页面加载时间
     */
    validatePageLoadTime() {
        const issues = [];
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.fetchStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            
            if (loadTime > 3000) {
                issues.push(`页面加载时间过长: ${loadTime.toFixed(0)}ms`);
            }
            
            if (domContentLoaded > 1500) {
                issues.push(`DOM加载时间过长: ${domContentLoaded.toFixed(0)}ms`);
            }
        } else {
            issues.push('无法获取导航时间数据');
        }

        return {
            name: '页面加载时间',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 30)
        };
    }

    /**
     * 验证广告加载性能
     */
    validateAdLoadPerformance() {
        const issues = [];
        
        // 检查广告加载统计
        if (window.adLoadingOptimizer) {
            const stats = window.adLoadingOptimizer.getLoadStats();
            
            if (stats.successRate < 80) {
                issues.push(`广告加载成功率过低: ${stats.successRate}`);
            }
            
            if (stats.failed > stats.loaded) {
                issues.push('失败的广告数量超过成功数量');
            }
        } else {
            issues.push('广告加载优化器未初始化');
        }

        return {
            name: '广告加载性能',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 25)
        };
    }

    /**
     * 验证资源加载
     */
    validateResourceLoading() {
        const issues = [];
        const resources = performance.getEntriesByType('resource');
        
        // 检查AdSense脚本加载
        const adsenseScript = resources.find(r => r.name.includes('googlesyndication'));
        if (adsenseScript) {
            if (adsenseScript.duration > 2000) {
                issues.push(`AdSense脚本加载时间过长: ${adsenseScript.duration.toFixed(0)}ms`);
            }
        } else {
            issues.push('未找到AdSense脚本加载记录');
        }

        // 检查CSS加载
        const cssResources = resources.filter(r => r.name.endsWith('.css'));
        const slowCSS = cssResources.filter(r => r.duration > 1000);
        if (slowCSS.length > 0) {
            issues.push(`${slowCSS.length}个CSS文件加载缓慢`);
        }

        return {
            name: '资源加载',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20)
        };
    }

    /**
     * 验证内存使用
     */
    validateMemoryUsage() {
        const issues = [];
        
        if ('memory' in performance) {
            const memory = performance.memory;
            const usedMB = memory.usedJSHeapSize / 1024 / 1024;
            const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
            
            if (usedMB > 50) {
                issues.push(`JavaScript内存使用过高: ${usedMB.toFixed(1)}MB`);
            }
            
            if (usedMB / limitMB > 0.8) {
                issues.push('内存使用接近限制');
            }
        } else {
            // 不是错误，只是浏览器不支持
        }

        return {
            name: '内存使用',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 15)
        };
    }

    /**
     * 验证CLS影响
     */
    async validateCLSImpact() {
        console.log('📏 验证CLS影响...');
        
        // 设置CLS观察器
        this.setupCLSObserver();
        
        // 等待一段时间收集CLS数据
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const clsTests = [];
        
        // 测试1: 检查总体CLS分数
        clsTests.push(this.validateOverallCLS());
        
        // 测试2: 检查广告相关的CLS
        clsTests.push(this.validateAdRelatedCLS());
        
        // 测试3: 检查预留空间效果
        clsTests.push(this.validateReservedSpace());

        this.testResults.cls = clsTests;
        
        const passedTests = clsTests.filter(t => t.passed).length;
        console.log(`✅ CLS影响验证完成: ${passedTests}/${clsTests.length} 通过`);
        
        // 清理观察器
        if (this.clsObserver) {
            this.clsObserver.disconnect();
        }
    }

    /**
     * 设置CLS观察器
     */
    setupCLSObserver() {
        if (!('LayoutShift' in window)) return;

        this.clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    this.initialCLS += entry.value;
                }
            }
        });

        this.clsObserver.observe({ type: 'layout-shift', buffered: true });
    }

    /**
     * 验证总体CLS分数
     */
    validateOverallCLS() {
        const issues = [];
        const cls = this.initialCLS;
        
        if (cls > 0.25) {
            issues.push(`CLS分数过高: ${cls.toFixed(4)} (差)`);
        } else if (cls > 0.1) {
            issues.push(`CLS分数需要改进: ${cls.toFixed(4)} (需要改进)`);
        }

        return {
            name: '总体CLS分数',
            passed: cls <= 0.1,
            issues,
            score: cls <= 0.1 ? 100 : (cls <= 0.25 ? 70 : 30),
            value: cls
        };
    }

    /**
     * 验证广告相关的CLS
     */
    validateAdRelatedCLS() {
        const issues = [];
        
        // 检查广告容器是否有预留空间
        const adContainers = document.querySelectorAll('.ad-container');
        let containersWithoutMinHeight = 0;
        
        for (const container of adContainers) {
            const style = window.getComputedStyle(container);
            const minHeight = parseInt(style.minHeight);
            
            if (minHeight < 50) {
                containersWithoutMinHeight++;
            }
        }
        
        if (containersWithoutMinHeight > 0) {
            issues.push(`${containersWithoutMinHeight}个广告容器缺少足够的预留空间`);
        }

        return {
            name: '广告相关CLS',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - containersWithoutMinHeight * 20)
        };
    }

    /**
     * 验证预留空间效果
     */
    validateReservedSpace() {
        const issues = [];
        const adContainers = document.querySelectorAll('.ad-container');
        
        for (const container of adContainers) {
            const adType = container.dataset.adType;
            const style = window.getComputedStyle(container);
            const minHeight = parseInt(style.minHeight);
            
            // 检查不同类型广告的最小高度
            switch (adType) {
                case 'banner-top':
                    if (minHeight < 70) {
                        issues.push('顶部横幅广告预留空间不足');
                    }
                    break;
                case 'rectangle-content':
                    if (minHeight < 200) {
                        issues.push('内容中广告预留空间不足');
                    }
                    break;
                case 'skyscraper-right':
                    if (minHeight < 500) {
                        issues.push('侧边栏广告预留空间不足');
                    }
                    break;
            }
        }

        return {
            name: '预留空间效果',
            passed: issues.length === 0,
            issues,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 25)
        };
    }

    /**
     * 生成最终报告
     */
    generateFinalReport() {
        const totalTime = performance.now() - this.startTime;
        
        // 计算总体分数
        const allTests = [
            ...this.testResults.components,
            ...this.testResults.layout,
            ...this.testResults.performance,
            ...this.testResults.cls
        ];
        
        const totalScore = allTests.reduce((sum, test) => sum + (test.score || 0), 0);
        const averageScore = allTests.length > 0 ? totalScore / allTests.length : 0;
        
        // 确定总体状态
        if (averageScore >= 90) {
            this.testResults.overall = 'excellent';
        } else if (averageScore >= 75) {
            this.testResults.overall = 'good';
        } else if (averageScore >= 60) {
            this.testResults.overall = 'needs-improvement';
        } else {
            this.testResults.overall = 'poor';
        }
        
        // 添加汇总信息
        this.testResults.summary = {
            totalTests: allTests.length,
            passedTests: allTests.filter(t => t.passed).length,
            averageScore: Math.round(averageScore),
            testDuration: Math.round(totalTime),
            clsScore: this.initialCLS,
            timestamp: new Date().toISOString()
        };
        
        // 输出报告
        console.group('📊 广告系统验证报告');
        console.log('总体状态:', this.testResults.overall);
        console.log('测试通过率:', `${this.testResults.summary.passedTests}/${this.testResults.summary.totalTests}`);
        console.log('平均分数:', this.testResults.summary.averageScore);
        console.log('CLS分数:', this.testResults.summary.clsScore.toFixed(4));
        console.log('测试耗时:', `${this.testResults.summary.testDuration}ms`);
        console.groupEnd();
    }

    /**
     * 获取详细报告
     */
    getDetailedReport() {
        return this.testResults;
    }

    /**
     * 导出报告为JSON
     */
    exportReport() {
        const report = {
            ...this.testResults,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            url: window.location.href
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ad-system-validation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📄 验证报告已导出');
    }
}

// 自动运行验证（仅在开发环境）
if (window.location.hostname === 'localhost' || window.location.search.includes('validate=true')) {
    let validator = null;
    
    // 等待页面加载完成后运行验证
    window.addEventListener('load', async () => {
        // 延迟一段时间确保广告系统初始化完成
        setTimeout(async () => {
            validator = new AdSystemValidator();
            const results = await validator.runFullValidation();
            
            // 暴露到全局作用域供调试使用
            window.adSystemValidator = validator;
            window.exportAdValidationReport = () => validator.exportReport();
            
        }, 3000);
    });
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdSystemValidator;
}