// translation-validator.js - 翻译验证系统

const fs = require('fs');
const path = require('path');

/**
 * 翻译验证器类
 * 用于扫描组件文件中的翻译键并验证翻译文件的完整性
 */
class TranslationValidator {
    constructor() {
        this.translationKeys = new Set();
        this.componentKeys = new Map(); // 组件 -> 使用的键
        this.translationFiles = new Map(); // 语言 -> 翻译数据
        this.missingKeys = new Map(); // 语言 -> 缺失的键
        this.validationReport = {
            validationDate: new Date().toISOString(),
            languages: [],
            summary: {
                totalKeys: 0,
                missingTranslations: 0,
                inconsistentKeys: 0
            },
            missingKeys: {},
            inconsistentKeys: []
        };
    }

    /**
     * 扫描组件文件中的翻译键
     * @param {string} componentsDir - 组件目录路径
     */
    scanComponentTranslationKeys(componentsDir = 'components') {
        console.log('🔍 扫描组件翻译键...');
        
        const componentFiles = fs.readdirSync(componentsDir)
            .filter(file => file.endsWith('.html'));

        for (const file of componentFiles) {
            const filePath = path.join(componentsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const keys = this.extractTranslationKeys(content);
            
            if (keys.length > 0) {
                this.componentKeys.set(file, keys);
                keys.forEach(key => this.translationKeys.add(key));
                console.log(`  📄 ${file}: 找到 ${keys.length} 个翻译键`);
            }
        }

        console.log(`✅ 总共找到 ${this.translationKeys.size} 个唯一翻译键`);
        return Array.from(this.translationKeys);
    }

    /**
     * 从内容中提取翻译键
     * @param {string} content - 文件内容
     * @returns {string[]} - 翻译键数组
     */
    extractTranslationKeys(content) {
        const keys = [];
        
        // 匹配 {{t 'key'}} 格式
        const buildTimeMatches = content.match(/{{t\s+['"]([^'"]+)['"]/g);
        if (buildTimeMatches) {
            buildTimeMatches.forEach(match => {
                const key = match.match(/{{t\s+['"]([^'"]+)['"]/)[1];
                keys.push(key);
            });
        }

        // 匹配 data-i18n="key" 格式
        const runtimeMatches = content.match(/data-i18n=["']([^"']+)["']/g);
        if (runtimeMatches) {
            runtimeMatches.forEach(match => {
                const key = match.match(/data-i18n=["']([^"']+)["']/)[1];
                // 跳过模板变量（如 data-i18n="{{parent_key}}"），避免误报
                if (!key.includes('{{') && !key.includes('}}')) {
                    keys.push(key);
                }
            });
        }

        // 匹配 data-i18n-placeholder="key" 格式
        const placeholderMatches = content.match(/data-i18n-placeholder=["']([^"']+)["']/g);
        if (placeholderMatches) {
            placeholderMatches.forEach(match => {
                const key = match.match(/data-i18n-placeholder=["']([^"']+)["']/)[1];
                if (!key.includes('{{') && !key.includes('}}')) {
                    keys.push(key);
                }
            });
        }

        return [...new Set(keys)]; // 去重
    }

    /**
     * 加载翻译文件
     * @param {string[]} languages - 支持的语言列表
     * @param {string} localesDir - 翻译文件目录
     */
    loadTranslationFiles(languages = ['en', 'zh'], localesDir = 'locales') {
        console.log('📚 加载翻译文件...');
        
        for (const lang of languages) {
            const translationPath = path.join(localesDir, lang, 'translation.json');
            
            if (fs.existsSync(translationPath)) {
                try {
                    const content = fs.readFileSync(translationPath, 'utf8');
                    const translations = JSON.parse(content);
                    this.translationFiles.set(lang, translations);
                    console.log(`  🌍 ${lang}: 加载成功`);
                } catch (error) {
                    console.error(`  ❌ ${lang}: 加载失败 - ${error.message}`);
                }
            } else {
                console.warn(`  ⚠️  ${lang}: 翻译文件不存在`);
            }
        }

        this.validationReport.languages = Array.from(this.translationFiles.keys());
    }

    /**
     * 验证翻译完整性
     */
    validateTranslationCompleteness() {
        console.log('🔍 验证翻译完整性...');
        
        const allKeys = Array.from(this.translationKeys);
        this.validationReport.summary.totalKeys = allKeys.length;

        for (const [language, translations] of this.translationFiles) {
            const missingKeys = [];
            
            for (const key of allKeys) {
                if (!this.hasNestedKey(translations, key)) {
                    missingKeys.push(key);
                }
            }

            if (missingKeys.length > 0) {
                this.missingKeys.set(language, missingKeys);
                this.validationReport.missingKeys[language] = missingKeys;
                console.log(`  ❌ ${language}: 缺失 ${missingKeys.length} 个翻译键`);
            } else {
                console.log(`  ✅ ${language}: 翻译完整`);
            }
        }

        this.validationReport.summary.missingTranslations = 
            Object.values(this.validationReport.missingKeys)
                .reduce((total, keys) => total + keys.length, 0);
    }

    /**
     * 检查嵌套键是否存在
     * @param {object} obj - 翻译对象
     * @param {string} key - 键路径（如 'ppiCalculator.title'）
     * @returns {boolean} - 键是否存在
     */
    hasNestedKey(obj, key) {
        const keys = key.split('.');
        let current = obj;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return false;
            }
        }
        
        return current !== undefined;
    }

    /**
     * 检查不一致的翻译键
     */
    findInconsistentKeys() {
        console.log('🔍 检查翻译键一致性...');
        
        for (const [component, keys] of this.componentKeys) {
            for (const key of keys) {
                let foundInAnyLanguage = false;
                
                for (const [language, translations] of this.translationFiles) {
                    if (this.hasNestedKey(translations, key)) {
                        foundInAnyLanguage = true;
                        break;
                    }
                }
                
                if (!foundInAnyLanguage) {
                    this.validationReport.inconsistentKeys.push({
                        component,
                        issue: '翻译键在所有语言文件中都不存在',
                        key
                    });
                }
            }
        }

        this.validationReport.summary.inconsistentKeys = 
            this.validationReport.inconsistentKeys.length;
    }

    /**
     * 生成验证报告
     * @param {string} outputPath - 报告输出路径
     */
    generateValidationReport(outputPath = 'build/translation-validation-report.json') {
        console.log('📊 生成验证报告...');
        
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 写入报告文件
        fs.writeFileSync(outputPath, JSON.stringify(this.validationReport, null, 2), 'utf8');
        console.log(`✅ 验证报告已生成: ${outputPath}`);

        // 打印摘要
        this.printValidationSummary();
        
        return this.validationReport;
    }

    /**
     * 打印验证摘要
     */
    printValidationSummary() {
        const { summary } = this.validationReport;
        
        console.log('\n📋 翻译验证摘要:');
        console.log(`  📊 总翻译键数: ${summary.totalKeys}`);
        console.log(`  ❌ 缺失翻译数: ${summary.missingTranslations}`);
        console.log(`  ⚠️  不一致键数: ${summary.inconsistentKeys}`);
        
        if (summary.missingTranslations > 0) {
            console.log('\n❌ 缺失的翻译键:');
            for (const [language, keys] of Object.entries(this.validationReport.missingKeys)) {
                console.log(`  ${language}:`);
                keys.forEach(key => console.log(`    - ${key}`));
            }
        }
        
        if (summary.inconsistentKeys > 0) {
            console.log('\n⚠️  不一致的翻译键:');
            this.validationReport.inconsistentKeys.forEach(item => {
                console.log(`  ${item.component}: ${item.key} - ${item.issue}`);
            });
        }
    }

    /**
     * 运行完整的验证流程
     * @param {object} options - 验证选项
     */
    async runValidation(options = {}) {
        const {
            componentsDir = 'components',
            localesDir = 'locales',
            languages = ['en', 'zh'],
            outputPath = 'build/translation-validation-report.json'
        } = options;

        console.log('🚀 开始翻译验证...');
        
        try {
            // 1. 扫描组件翻译键
            this.scanComponentTranslationKeys(componentsDir);
            
            // 2. 加载翻译文件
            this.loadTranslationFiles(languages, localesDir);
            
            // 3. 验证翻译完整性
            this.validateTranslationCompleteness();
            
            // 4. 检查不一致的键
            this.findInconsistentKeys();
            
            // 5. 生成验证报告
            const report = this.generateValidationReport(outputPath);
            
            console.log('✅ 翻译验证完成');
            
            return {
                success: true,
                report,
                hasErrors: report.summary.missingTranslations > 0 || report.summary.inconsistentKeys > 0
            };
            
        } catch (error) {
            console.error('❌ 翻译验证失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = { TranslationValidator };

// 如果直接运行此脚本，执行验证
if (require.main === module) {
    const validator = new TranslationValidator();
    validator.runValidation().then(result => {
        if (!result.success) {
            process.exit(1);
        }
        if (result.hasErrors) {
            console.log('\n⚠️  发现翻译问题，请检查上述报告');
            process.exit(1);
        }
    });
}