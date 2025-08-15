/**
 * 广告构建处理器
 * 处理构建时的广告配置注入、验证和优化
 */

const fs = require('fs');
const path = require('path');

class AdBuildProcessor {
    constructor() {
        this.adConfig = null;
        this.environment = process.env.NODE_ENV || 'production';
        this.buildStats = {
            processedPages: 0,
            adComponentsInjected: 0,
            configValidations: 0,
            errors: []
        };
        
        this.loadAdConfig();
    }

    /**
     * 加载广告配置
     */
    loadAdConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'data', 'ad-config.json');
            if (fs.existsSync(configPath)) {
                this.adConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                console.log(`🔧 广告配置已加载 (环境: ${this.environment})`);
            } else {
                console.warn('⚠️ 广告配置文件未找到，使用默认配置');
                this.loadDefaultConfig();
            }
        } catch (error) {
            console.error('❌ 加载广告配置失败:', error.message);
            this.loadDefaultConfig();
        }
    }

    /**
     * 加载默认配置
     */
    loadDefaultConfig() {
        this.adConfig = {
            environments: {
                development: {
                    enabled: false,
                    client: 'ca-pub-test',
                    slots: {
                        topBanner: 'TEST_TOP_BANNER',
                        inContentRectangle: 'TEST_IN_CONTENT',
                        skyscraperRight: 'TEST_SKYSCRAPER',
                        endOfContent: 'TEST_END_CONTENT'
                    }
                },
                production: {
                    enabled: true,
                    client: 'ca-pub-9212629010224868',
                    slots: {
                        topBanner: 'TOP_BANNER_SLOT_ID',
                        inContentRectangle: 'IN_CONTENT_RECTANGLE_SLOT_ID',
                        skyscraperRight: 'SKYSCRAPER_RIGHT_SLOT_ID',
                        endOfContent: 'END_OF_CONTENT_SLOT_ID'
                    }
                }
            }
        };
    }

    /**
     * 处理页面中的广告组件
     */
    processAdComponents(html, pageData = {}) {
        if (!this.adConfig) {
            console.warn('⚠️ 广告配置未加载，跳过广告处理');
            return html;
        }

        const envConfig = this.adConfig.environments[this.environment];
        if (!envConfig || !envConfig.enabled) {
            console.log('🚫 广告在当前环境中已禁用');
            return this.removeAdComponents(html);
        }

        let result = html;
        this.buildStats.processedPages++;

        // 处理广告组件占位符
        result = this.injectAdSlotIds(result, envConfig);
        result = this.injectClientId(result, envConfig);
        result = this.optimizeAdComponents(result, pageData);
        result = this.validateAdComponents(result);

        return result;
    }

    /**
     * 注入广告位 ID
     */
    injectAdSlotIds(html, envConfig) {
        let result = html;

        // 替换广告位 ID 占位符
        const slotMappings = {
            'TOP_BANNER_SLOT_ID': envConfig.slots.topBanner,
            'IN_CONTENT_RECTANGLE_SLOT_ID': envConfig.slots.inContentRectangle,
            'SKYSCRAPER_RIGHT_SLOT_ID': envConfig.slots.skyscraperRight,
            'END_OF_CONTENT_SLOT_ID': envConfig.slots.endOfContent
        };

        for (const [placeholder, actualSlotId] of Object.entries(slotMappings)) {
            const regex = new RegExp(placeholder, 'g');
            const matches = result.match(regex);
            if (matches) {
                result = result.replace(regex, actualSlotId);
                this.buildStats.adComponentsInjected += matches.length;
                console.log(`🔧 替换广告位 ID: ${placeholder} -> ${actualSlotId} (${matches.length}次)`);
            }
        }

        return result;
    }

    /**
     * 注入客户端 ID
     */
    injectClientId(html, envConfig) {
        let result = html;

        // 替换客户端 ID 占位符
        const clientIdRegex = /YOUR_AD_CLIENT_ID|ca-pub-9212629010224868/g;
        const matches = result.match(clientIdRegex);
        if (matches) {
            result = result.replace(clientIdRegex, envConfig.client);
            console.log(`🔧 替换客户端 ID: ${envConfig.client} (${matches.length}次)`);
        }

        return result;
    }

    /**
     * 优化广告组件
     */
    optimizeAdComponents(html, pageData) {
        let result = html;

        // 根据页面类型优化广告位置
        const pageType = this.detectPageType(pageData);
        
        if (pageType === 'mobile' || (pageData.deviceType && pageData.deviceType === 'mobile')) {
            // 移动端优化：移除侧边栏广告
            result = this.removeSidebarAds(result);
        }

        // 添加性能优化属性
        result = this.addPerformanceOptimizations(result);

        return result;
    }

    /**
     * 检测页面类型
     */
    detectPageType(pageData) {
        if (pageData.template && pageData.template.includes('blog')) {
            return 'blog';
        }
        if (pageData.path && pageData.path.includes('devices')) {
            return 'tool';
        }
        if (pageData.path === '' || pageData.path === '/') {
            return 'home';
        }
        return 'default';
    }

    /**
     * 移除侧边栏广告
     */
    removeSidebarAds(html) {
        // 移除侧边栏广告组件
        return html.replace(/{{component:ad-skyscraper-right}}/g, '<!-- 移动端已移除侧边栏广告 -->');
    }

    /**
     * 添加性能优化属性
     */
    addPerformanceOptimizations(html) {
        let result = html;

        // 为广告脚本添加性能优化属性
        result = result.replace(
            /\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);/g,
            '(adsbygoogle = window.adsbygoogle || []).push({});\n        // 性能优化：延迟执行已内置'
        );

        // 为广告容器添加加载优化类
        result = result.replace(
            /class="ad-container/g,
            'class="ad-container ad-build-optimized'
        );

        return result;
    }

    /**
     * 验证广告组件
     */
    validateAdComponents(html) {
        this.buildStats.configValidations++;
        const issues = [];

        // 检查必需的广告元素
        const adContainers = (html.match(/class="[^"]*ad-container[^"]*"/g) || []).length;
        const adsenseElements = (html.match(/class="[^"]*adsbygoogle[^"]*"/g) || []).length;
        
        if (adContainers !== adsenseElements) {
            issues.push(`广告容器数量(${adContainers})与AdSense元素数量(${adsenseElements})不匹配`);
        }

        // 检查客户端 ID 格式
        const clientIdMatches = html.match(/data-ad-client="([^"]+)"/g);
        if (clientIdMatches) {
            for (const match of clientIdMatches) {
                const clientId = match.match(/data-ad-client="([^"]+)"/)[1];
                if (!clientId.startsWith('ca-pub-')) {
                    issues.push(`无效的客户端 ID 格式: ${clientId}`);
                }
            }
        }

        // 检查广告位 ID
        const slotIdMatches = html.match(/data-ad-slot="([^"]+)"/g);
        if (slotIdMatches) {
            for (const match of slotIdMatches) {
                const slotId = match.match(/data-ad-slot="([^"]+)"/)[1];
                if (slotId.includes('SLOT_ID') || slotId.includes('TEST_')) {
                    issues.push(`未替换的广告位 ID: ${slotId}`);
                }
            }
        }

        // 记录问题
        if (issues.length > 0) {
            this.buildStats.errors.push(...issues);
            console.warn('⚠️ 广告组件验证发现问题:', issues);
        }

        return html;
    }

    /**
     * 移除广告组件（当广告被禁用时）
     */
    removeAdComponents(html) {
        let result = html;

        // 移除广告组件占位符
        result = result.replace(/{{component:ad-[^}]+}}/g, '<!-- 广告已禁用 -->');
        
        // 移除广告容器
        result = result.replace(/<div class="[^"]*ad-container[^"]*">[\s\S]*?<\/div>/g, '<!-- 广告已禁用 -->');

        console.log('🚫 已移除所有广告组件');
        return result;
    }

    /**
     * 生成广告构建报告
     */
    generateBuildReport() {
        const report = {
            environment: this.environment,
            timestamp: new Date().toISOString(),
            stats: this.buildStats,
            config: {
                enabled: this.adConfig?.environments[this.environment]?.enabled || false,
                client: this.adConfig?.environments[this.environment]?.client || 'unknown',
                slotsConfigured: Object.keys(this.adConfig?.environments[this.environment]?.slots || {}).length
            }
        };

        console.group('📊 广告构建报告');
        console.log('环境:', report.environment);
        console.log('处理页面数:', report.stats.processedPages);
        console.log('注入广告组件数:', report.stats.adComponentsInjected);
        console.log('配置验证次数:', report.stats.configValidations);
        console.log('错误数量:', report.stats.errors.length);
        
        if (report.stats.errors.length > 0) {
            console.log('错误详情:', report.stats.errors);
        }
        
        console.groupEnd();

        return report;
    }

    /**
     * 保存构建报告
     */
    saveBuildReport() {
        const report = this.generateBuildReport();
        const reportPath = path.join(__dirname, '..', 'build', `ad-build-report-${Date.now()}.json`);
        
        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`📄 广告构建报告已保存: ${reportPath}`);
        } catch (error) {
            console.error('❌ 保存构建报告失败:', error.message);
        }
    }

    /**
     * 验证广告配置完整性
     */
    validateAdConfig() {
        if (!this.adConfig) {
            throw new Error('广告配置未加载');
        }

        const envConfig = this.adConfig.environments[this.environment];
        if (!envConfig) {
            throw new Error(`未找到环境配置: ${this.environment}`);
        }

        const requiredFields = ['client', 'slots'];
        for (const field of requiredFields) {
            if (!envConfig[field]) {
                throw new Error(`环境配置缺少必需字段: ${field}`);
            }
        }

        const requiredSlots = ['topBanner', 'inContentRectangle', 'skyscraperRight', 'endOfContent'];
        for (const slot of requiredSlots) {
            if (!envConfig.slots[slot]) {
                console.warn(`⚠️ 缺少广告位配置: ${slot}`);
            }
        }

        console.log('✅ 广告配置验证通过');
        return true;
    }

    /**
     * 获取构建统计信息
     */
    getBuildStats() {
        return this.buildStats;
    }

    /**
     * 重置构建统计信息
     */
    resetBuildStats() {
        this.buildStats = {
            processedPages: 0,
            adComponentsInjected: 0,
            configValidations: 0,
            errors: []
        };
    }
}

module.exports = AdBuildProcessor;