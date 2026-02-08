const fs = require('fs');
const path = require('path');

/**
 * 内链处理器 - 在构建时处理内链配置和验证
 */
class InternalLinksProcessor {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.configPath = path.join(this.rootPath, 'data', 'internal-links-config.json');
        this.config = null;
        this.loadConfig();
    }

    /**
     * 加载内链配置
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configContent = fs.readFileSync(this.configPath, 'utf8');
                this.config = JSON.parse(configContent);
                console.log(' Internal links config loaded');
            } else {
                console.warn('  Internal links config not found:', this.configPath);
                this.config = null;
            }
        } catch (error) {
            console.error(' Error loading internal links config:', error.message);
            this.config = null;
        }
    }

    /**
     * 验证内链配置
     */
    validateConfig() {
        if (!this.config) {
            return { valid: false, errors: ['Config not loaded'] };
        }

        const errors = [];
        const warnings = [];

        // 验证基本结构
        if (!this.config.pages || typeof this.config.pages !== 'object') {
            errors.push('Missing or invalid pages configuration');
        }

        if (!this.config.categories || typeof this.config.categories !== 'object') {
            errors.push('Missing or invalid categories configuration');
        }

        // 验证页面配置
        if (this.config.pages) {
            Object.entries(this.config.pages).forEach(([pageId, pageConfig]) => {
                // 验证必需字段
                if (!pageConfig.id) {
                    errors.push(`Page ${pageId}: missing id field`);
                }

                if (!pageConfig.category) {
                    errors.push(`Page ${pageId}: missing category field`);
                }

                if (!pageConfig.urls || typeof pageConfig.urls !== 'object') {
                    errors.push(`Page ${pageId}: missing or invalid urls field`);
                } else {
                    // 验证URL配置
                    const requiredLanguages = ['en', 'zh'];
                    requiredLanguages.forEach(lang => {
                        if (!pageConfig.urls[lang]) {
                            warnings.push(`Page ${pageId}: missing URL for language ${lang}`);
                        }
                    });
                }

                if (!pageConfig.titleKey) {
                    warnings.push(`Page ${pageId}: missing titleKey field`);
                }

                if (!pageConfig.descriptionKey) {
                    warnings.push(`Page ${pageId}: missing descriptionKey field`);
                }

                // 验证分类是否存在
                if (pageConfig.category && this.config.categories && !this.config.categories[pageConfig.category]) {
                    warnings.push(`Page ${pageId}: category '${pageConfig.category}' not defined in categories`);
                }
            });
        }

        // 验证分类配置
        if (this.config.categories) {
            Object.entries(this.config.categories).forEach(([categoryId, categoryConfig]) => {
                if (typeof categoryConfig.priority !== 'number') {
                    warnings.push(`Category ${categoryId}: priority should be a number`);
                }

                if (typeof categoryConfig.maxItems !== 'number') {
                    warnings.push(`Category ${categoryId}: maxItems should be a number`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 验证翻译键是否存在
     */
    validateTranslationKeys(translations) {
        if (!this.config || !this.config.pages) {
            return { valid: true, missingKeys: [] };
        }

        const missingKeys = [];
        const allKeys = new Set();

        // 收集所有使用的翻译键
        Object.values(this.config.pages).forEach(page => {
            if (page.titleKey) allKeys.add(page.titleKey);
            if (page.descriptionKey) allKeys.add(page.descriptionKey);
        });

        // 检查每种语言的翻译
        ['en', 'zh'].forEach(lang => {
            const langTranslations = translations.get(lang);
            if (!langTranslations) {
                missingKeys.push(`Missing translations for language: ${lang}`);
                return;
            }

            allKeys.forEach(key => {
                if (!this.getNestedTranslation(langTranslations, key)) {
                    missingKeys.push(`Missing translation for key '${key}' in language '${lang}'`);
                }
            });
        });

        return {
            valid: missingKeys.length === 0,
            missingKeys
        };
    }

    /**
     * 获取嵌套的翻译值
     */
    getNestedTranslation(translations, key) {
        if (!key || !translations) return null;
        
        const keys = key.split('.');
        let current = translations;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && current.hasOwnProperty(k)) {
                current = current[k];
            } else {
                return null;
            }
        }
        
        return typeof current === 'string' ? current : null;
    }

    /**
     * 处理页面内链注入
     */
    processPageLinks(html, pageId, language = 'zh') {
        if (!this.config) {
            console.warn('  Internal links config not available, skipping link processing');
            return html;
        }

        // 检查页面是否包含内链组件占位符
        const hasInternalLinksComponent = html.includes('{{component:internal-links}}') || 
                                        html.includes('id="internal-links-container"');

        if (!hasInternalLinksComponent) {
            // 如果页面没有内链组件，不需要处理
            return html;
        }

        // 注入内链配置到页面中（用于JavaScript运行时使用）
        const configScript = `
<script>
// 内链配置注入（构建时生成）
window.INTERNAL_LINKS_CONFIG = ${JSON.stringify(this.config)};
window.CURRENT_PAGE_ID = '${pageId}';
window.CURRENT_LANGUAGE = '${language}';
</script>`;

        // 在</head>标签前插入配置脚本
        if (html.includes('</head>')) {
            html = html.replace('</head>', `${configScript}\n</head>`);
        } else {
            // 如果没有</head>标签，在<body>标签后插入
            html = html.replace('<body>', `<body>\n${configScript}`);
        }

        console.log(` Processed internal links for page: ${pageId} (${language})`);
        return html;
    }

    /**
     * 生成内链统计报告
     */
    generateReport() {
        if (!this.config) {
            return null;
        }

        const report = {
            timestamp: new Date().toISOString(),
            totalPages: Object.keys(this.config.pages).length,
            totalCategories: Object.keys(this.config.categories).length,
            pagesByCategory: {},
            languageSupport: {}
        };

        // 按分类统计页面
        Object.values(this.config.pages).forEach(page => {
            const category = page.category || 'uncategorized';
            if (!report.pagesByCategory[category]) {
                report.pagesByCategory[category] = 0;
            }
            report.pagesByCategory[category]++;
        });

        // 统计语言支持
        const languages = ['en', 'zh'];
        languages.forEach(lang => {
            report.languageSupport[lang] = {
                totalPages: 0,
                missingUrls: []
            };

            Object.entries(this.config.pages).forEach(([pageId, page]) => {
                if (page.urls && page.urls[lang]) {
                    report.languageSupport[lang].totalPages++;
                } else {
                    report.languageSupport[lang].missingUrls.push(pageId);
                }
            });
        });

        return report;
    }

    /**
     * 运行完整的内链处理流程
     */
    process(translations) {
        console.log('\n Processing internal links...');

        // 验证配置
        const configValidation = this.validateConfig();
        if (!configValidation.valid) {
            console.error(' Internal links config validation failed:');
            configValidation.errors.forEach(error => console.error(`   - ${error}`));
            return { success: false, errors: configValidation.errors };
        }

        if (configValidation.warnings.length > 0) {
            console.warn('  Internal links config warnings:');
            configValidation.warnings.forEach(warning => console.warn(`   - ${warning}`));
        }

        // 验证翻译键
        if (translations) {
            const translationValidation = this.validateTranslationKeys(translations);
            if (!translationValidation.valid) {
                console.warn('  Internal links translation validation warnings:');
                translationValidation.missingKeys.forEach(key => console.warn(`   - ${key}`));
            }
        }

        // 生成报告
        const report = this.generateReport();
        if (report) {
            const reportPath = path.join(this.rootPath, 'build', 'internal-links-report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(` Internal links report saved to: ${reportPath}`);
        }

        console.log(' Internal links processing completed');
        return { success: true, report };
    }
}

module.exports = InternalLinksProcessor;
