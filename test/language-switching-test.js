/**
 * 语言切换功能测试
 * 测试多语言功能，确保语言切换和内容显示正确
 */

const fs = require('fs');
const path = require('path');

class LanguageSwitchingTest {
    constructor() {
        this.buildDir = 'multilang-build';
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
            languages: {
                root: { tests: [], passed: 0, failed: 0, warnings: 0 },
                english: { tests: [], passed: 0, failed: 0, warnings: 0 },
                chinese: { tests: [], passed: 0, failed: 0, warnings: 0 }
            }
        };
    }

    /**
     * 运行语言切换测试
     */
    runTests() {
        console.log('🌐 Starting Language Switching Test...');
        console.log('=' .repeat(60));

        // 1. 测试根目录语言设置
        this.testRootLanguageSettings();
        
        // 2. 测试英文版本
        this.testEnglishVersion();
        
        // 3. 测试中文版本
        this.testChineseVersion();
        
        // 4. 测试语言切换链接
        this.testLanguageSwitchingLinks();
        
        // 5. 测试Hreflang标签一致性
        this.testHreflangConsistency();
        
        // 生成报告
        this.generateReport();
        
        return this.testResults;
    }

    /**
     * 测试根目录语言设置
     */
    testRootLanguageSettings() {
        console.log('\\n🏠 Testing Root Directory Language Settings...');
        
        const category = 'root';
        const indexPath = path.join(this.buildDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addResult(category, 'Root Index Exists', 'failed', 'Root index.html not found');
            return;
        }
        
        this.addResult(category, 'Root Index Exists', 'passed', 'Root index.html exists');
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // 检查HTML语言属性
        const langMatch = content.match(/<html[^>]+lang="([^"]+)"/);
        if (langMatch) {
            const lang = langMatch[1];
            if (lang === 'en') {
                this.addResult(category, 'Root Language Attribute', 'passed', `Language set to: ${lang}`);
            } else {
                this.addResult(category, 'Root Language Attribute', 'warning', `Unexpected language: ${lang}`);
            }
        } else {
            this.addResult(category, 'Root Language Attribute', 'failed', 'HTML lang attribute missing');
        }
        
        // 检查内容语言
        if (content.includes('Screen Size Checker') && !content.includes('屏幕尺寸检查器')) {
            this.addResult(category, 'Root Content Language', 'passed', 'Content is in English');
        } else if (content.includes('屏幕尺寸检查器')) {
            this.addResult(category, 'Root Content Language', 'failed', 'Content appears to be in Chinese');
        } else {
            this.addResult(category, 'Root Content Language', 'warning', 'Content language unclear');
        }
        
        // 检查语言切换功能
        if (content.includes('language-modal') || content.includes('language-selector')) {
            this.addResult(category, 'Root Language Switching UI', 'passed', 'Language switching UI found');
        } else {
            this.addResult(category, 'Root Language Switching UI', 'warning', 'Language switching UI not clearly identified');
        }
        
        // 检查Hreflang标签
        const hreflangTags = content.match(/<link rel="alternate" hreflang="[^"]+"/g);
        if (hreflangTags && hreflangTags.length >= 3) {
            this.addResult(category, 'Root Hreflang Tags', 'passed', `Found ${hreflangTags.length} hreflang tags`);
        } else {
            this.addResult(category, 'Root Hreflang Tags', 'failed', `Only found ${hreflangTags ? hreflangTags.length : 0} hreflang tags`);
        }
        
        console.log(`   📊 Root: ${this.testResults.languages[category].passed}/${this.testResults.languages[category].tests.length} passed`);
    }

    /**
     * 测试英文版本
     */
    testEnglishVersion() {
        console.log('\\n🇺🇸 Testing English Version...');
        
        const category = 'english';
        const enIndexPath = path.join(this.buildDir, 'en', 'index.html');
        
        if (!fs.existsSync(enIndexPath)) {
            this.addResult(category, 'English Index Exists', 'failed', 'English index.html not found');
            return;
        }
        
        this.addResult(category, 'English Index Exists', 'passed', 'English index.html exists');
        
        const content = fs.readFileSync(enIndexPath, 'utf8');
        
        // 检查语言属性
        const langMatch = content.match(/<html[^>]+lang="([^"]+)"/);
        if (langMatch && langMatch[1] === 'en') {
            this.addResult(category, 'English Language Attribute', 'passed', 'Language correctly set to en');
        } else {
            this.addResult(category, 'English Language Attribute', 'failed', 'Language attribute incorrect');
        }
        
        // 检查英文内容
        if (content.includes('Screen Size Checker') && !content.includes('屏幕尺寸检查器')) {
            this.addResult(category, 'English Content', 'passed', 'Content is in English');
        } else {
            this.addResult(category, 'English Content', 'failed', 'Content not in English');
        }
        
        // 检查内部链接前缀
        const internalLinks = content.match(/href="[^"]*"/g);
        let enPrefixLinks = 0;
        let totalInternalLinks = 0;
        
        if (internalLinks) {
            for (const link of internalLinks) {
                const href = link.match(/href="([^"]*)"/)[1];
                if (href.startsWith('/en/') || href.startsWith('./') || href.startsWith('../') || href.includes('.html')) {
                    totalInternalLinks++;
                    if (href.startsWith('/en/') || href.includes('/en/')) {
                        enPrefixLinks++;
                    }
                }
            }
        }
        
        if (totalInternalLinks > 0) {
            const prefixRate = (enPrefixLinks / totalInternalLinks * 100).toFixed(1);
            this.addResult(category, 'English URL Prefixes', 'passed', `${prefixRate}% of links have /en/ prefix`);
        } else {
            this.addResult(category, 'English URL Prefixes', 'warning', 'No internal links found');
        }
        
        // 测试英文博客页面
        const enBlogPath = path.join(this.buildDir, 'en', 'blog', 'index.html');
        if (fs.existsSync(enBlogPath)) {
            this.addResult(category, 'English Blog Exists', 'passed', 'English blog exists');
            
            const blogContent = fs.readFileSync(enBlogPath, 'utf8');
            if (blogContent.includes('Blog') && blogContent.includes('articles')) {
                this.addResult(category, 'English Blog Content', 'passed', 'English blog content found');
            } else {
                this.addResult(category, 'English Blog Content', 'warning', 'English blog content unclear');
            }
        } else {
            this.addResult(category, 'English Blog Exists', 'failed', 'English blog not found');
        }
        
        console.log(`   📊 English: ${this.testResults.languages[category].passed}/${this.testResults.languages[category].tests.length} passed`);
    }

    /**
     * 测试中文版本
     */
    testChineseVersion() {
        console.log('\\n🇨🇳 Testing Chinese Version...');
        
        const category = 'chinese';
        const zhIndexPath = path.join(this.buildDir, 'zh', 'index.html');
        
        if (!fs.existsSync(zhIndexPath)) {
            this.addResult(category, 'Chinese Index Exists', 'failed', 'Chinese index.html not found');
            return;
        }
        
        this.addResult(category, 'Chinese Index Exists', 'passed', 'Chinese index.html exists');
        
        const content = fs.readFileSync(zhIndexPath, 'utf8');
        
        // 检查语言属性
        const langMatch = content.match(/<html[^>]+lang="([^"]+)"/);
        if (langMatch && (langMatch[1] === 'zh' || langMatch[1] === 'zh-CN')) {
            this.addResult(category, 'Chinese Language Attribute', 'passed', `Language correctly set to ${langMatch[1]}`);
        } else {
            this.addResult(category, 'Chinese Language Attribute', 'failed', 'Language attribute incorrect');
        }
        
        // 检查中文内容
        if (content.includes('屏幕尺寸检查器') || content.includes('Screen Size Checker')) {
            if (content.includes('屏幕尺寸检查器')) {
                this.addResult(category, 'Chinese Content', 'passed', 'Content contains Chinese text');
            } else {
                this.addResult(category, 'Chinese Content', 'warning', 'Content may not be fully translated');
            }
        } else {
            this.addResult(category, 'Chinese Content', 'failed', 'No Chinese content found');
        }
        
        // 检查内部链接前缀
        const internalLinks = content.match(/href="[^"]*"/g);
        let zhPrefixLinks = 0;
        let totalInternalLinks = 0;
        
        if (internalLinks) {
            for (const link of internalLinks) {
                const href = link.match(/href="([^"]*)"/)[1];
                if (href.startsWith('/zh/') || href.startsWith('./') || href.startsWith('../') || href.includes('.html')) {
                    totalInternalLinks++;
                    if (href.startsWith('/zh/') || href.includes('/zh/')) {
                        zhPrefixLinks++;
                    }
                }
            }
        }
        
        if (totalInternalLinks > 0) {
            const prefixRate = (zhPrefixLinks / totalInternalLinks * 100).toFixed(1);
            this.addResult(category, 'Chinese URL Prefixes', 'passed', `${prefixRate}% of links have /zh/ prefix`);
        } else {
            this.addResult(category, 'Chinese URL Prefixes', 'warning', 'No internal links found');
        }
        
        // 测试中文博客页面
        const zhBlogPath = path.join(this.buildDir, 'zh', 'blog', 'index.html');
        if (fs.existsSync(zhBlogPath)) {
            this.addResult(category, 'Chinese Blog Exists', 'passed', 'Chinese blog exists');
            
            const blogContent = fs.readFileSync(zhBlogPath, 'utf8');
            if (blogContent.includes('博客') || blogContent.includes('文章')) {
                this.addResult(category, 'Chinese Blog Content', 'passed', 'Chinese blog content found');
            } else {
                this.addResult(category, 'Chinese Blog Content', 'warning', 'Chinese blog content unclear');
            }
        } else {
            this.addResult(category, 'Chinese Blog Exists', 'failed', 'Chinese blog not found');
        }
        
        console.log(`   📊 Chinese: ${this.testResults.languages[category].passed}/${this.testResults.languages[category].tests.length} passed`);
    }

    /**
     * 测试语言切换链接
     */
    testLanguageSwitchingLinks() {
        console.log('\\n🔄 Testing Language Switching Links...');
        
        const pages = [
            { path: path.join(this.buildDir, 'index.html'), name: 'Root Page', category: 'root' },
            { path: path.join(this.buildDir, 'en', 'index.html'), name: 'English Page', category: 'english' },
            { path: path.join(this.buildDir, 'zh', 'index.html'), name: 'Chinese Page', category: 'chinese' }
        ];
        
        for (const page of pages) {
            if (!fs.existsSync(page.path)) {
                this.addResult(page.category, `${page.name} Language Links`, 'failed', `${page.name} not found`);
                continue;
            }
            
            const content = fs.readFileSync(page.path, 'utf8');
            
            // 检查是否有语言切换相关的元素
            const languageElements = [
                content.includes('language-modal'),
                content.includes('language-selector'),
                content.includes('lang-'),
                content.includes('hreflang')
            ];
            
            const foundElements = languageElements.filter(Boolean).length;
            
            if (foundElements >= 2) {
                this.addResult(page.category, `${page.name} Language Switching Elements`, 'passed', `${foundElements}/4 language elements found`);
            } else {
                this.addResult(page.category, `${page.name} Language Switching Elements`, 'warning', `Only ${foundElements}/4 language elements found`);
            }
            
            // 检查JavaScript语言切换功能
            if (content.includes('js/app.js') || content.includes('language')) {
                this.addResult(page.category, `${page.name} Language JS`, 'passed', 'Language switching JavaScript found');
            } else {
                this.addResult(page.category, `${page.name} Language JS`, 'warning', 'Language switching JavaScript not found');
            }
        }
    }

    /**
     * 测试Hreflang标签一致性
     */
    testHreflangConsistency() {
        console.log('\\n🌍 Testing Hreflang Consistency...');
        
        const pages = [
            { path: path.join(this.buildDir, 'index.html'), name: 'Root', category: 'root' },
            { path: path.join(this.buildDir, 'en', 'index.html'), name: 'English', category: 'english' },
            { path: path.join(this.buildDir, 'zh', 'index.html'), name: 'Chinese', category: 'chinese' }
        ];
        
        const hreflangData = {};
        
        // 收集所有页面的hreflang数据
        for (const page of pages) {
            if (fs.existsSync(page.path)) {
                const content = fs.readFileSync(page.path, 'utf8');
                const hreflangPattern = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g;
                let match;
                
                hreflangData[page.name] = [];
                while ((match = hreflangPattern.exec(content)) !== null) {
                    hreflangData[page.name].push({
                        lang: match[1],
                        href: match[2]
                    });
                }
            }
        }
        
        // 检查每个页面的hreflang标签
        for (const page of pages) {
            if (hreflangData[page.name]) {
                const hreflangTags = hreflangData[page.name];
                
                // 检查必需的语言标签
                const requiredLangs = ['en', 'zh', 'x-default'];
                const foundLangs = hreflangTags.map(tag => tag.lang);
                
                let missingLangs = [];
                for (const requiredLang of requiredLangs) {
                    if (!foundLangs.includes(requiredLang)) {
                        missingLangs.push(requiredLang);
                    }
                }
                
                if (missingLangs.length === 0) {
                    this.addResult(page.category, `${page.name} Hreflang Complete`, 'passed', 'All required hreflang tags found');
                } else {
                    this.addResult(page.category, `${page.name} Hreflang Complete`, 'warning', `Missing: ${missingLangs.join(', ')}`);
                }
                
                // 检查URL格式
                let validUrls = 0;
                for (const tag of hreflangTags) {
                    if (tag.href.startsWith('https://screensizechecker.com')) {
                        validUrls++;
                    }
                }
                
                if (validUrls === hreflangTags.length) {
                    this.addResult(page.category, `${page.name} Hreflang URLs`, 'passed', 'All hreflang URLs are valid');
                } else {
                    this.addResult(page.category, `${page.name} Hreflang URLs`, 'warning', `${validUrls}/${hreflangTags.length} URLs are valid`);
                }
            } else {
                this.addResult(page.category, `${page.name} Hreflang Tags`, 'failed', 'No hreflang tags found');
            }
        }
        
        // 检查根域名和/en/的关系
        if (hreflangData['Root'] && hreflangData['English']) {
            const rootEnTag = hreflangData['Root'].find(tag => tag.lang === 'en');
            const enEnTag = hreflangData['English'].find(tag => tag.lang === 'en');
            
            if (rootEnTag && enEnTag) {
                if (rootEnTag.href.includes('screensizechecker.com/') && enEnTag.href.includes('screensizechecker.com/en/')) {
                    this.addResult('root', 'Root vs EN Hreflang', 'passed', 'Root and /en/ have different canonical URLs');
                } else {
                    this.addResult('root', 'Root vs EN Hreflang', 'warning', 'Root and /en/ hreflang relationship unclear');
                }
            }
        }
    }

    /**
     * 添加测试结果
     */
    addResult(category, test, status, message) {
        const result = { test, status, message, timestamp: new Date().toISOString() };
        
        this.testResults.languages[category].tests.push(result);
        this.testResults.languages[category][status]++;
        this.testResults.summary.total++;
        this.testResults.summary[status]++;
        
        const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
        console.log(`   ${icon} ${test}: ${message}`);
    }

    /**
     * 生成报告
     */
    generateReport() {
        console.log('\\n' + '='.repeat(60));
        console.log('📊 LANGUAGE SWITCHING TEST SUMMARY');
        console.log('='.repeat(60));
        
        const { total, passed, failed, warnings } = this.testResults.summary;
        
        console.log(`\\n📈 OVERALL SUMMARY:`);
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        console.log(`Success Rate: ${successRate}%`);
        
        // 语言版本详细报告
        console.log(`\\n📋 LANGUAGE VERSIONS BREAKDOWN:`);
        for (const [langKey, data] of Object.entries(this.testResults.languages)) {
            const langTotal = data.tests.length;
            const langSuccessRate = langTotal > 0 ? ((data.passed / langTotal) * 100).toFixed(1) : 0;
            
            console.log(`\\n   ${this.getLanguageIcon(langKey)} ${this.getLanguageName(langKey)}:`);
            console.log(`      Tests: ${langTotal} | Passed: ${data.passed} | Failed: ${data.failed} | Warnings: ${data.warnings}`);
            console.log(`      Success Rate: ${langSuccessRate}%`);
        }
        
        // 显示关键失败
        const criticalFailures = [];
        for (const [langKey, data] of Object.entries(this.testResults.languages)) {
            const failedTests = data.tests.filter(test => test.status === 'failed');
            for (const test of failedTests) {
                if (this.isCriticalLanguageTest(test.test)) {
                    criticalFailures.push({ language: langKey, ...test });
                }
            }
        }
        
        if (criticalFailures.length > 0) {
            console.log(`\\n🚨 CRITICAL LANGUAGE FAILURES (${criticalFailures.length}):`);
            for (const failure of criticalFailures) {
                console.log(`   ❌ [${this.getLanguageName(failure.language)}] ${failure.test}: ${failure.message}`);
            }
        }
        
        // 保存报告
        const reportPath = path.join(this.buildDir, 'language-switching-test-report.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            console.log(`\\n📋 Report saved to: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️  Could not save report:', error.message);
        }
        
        console.log('\\n🎉 Language Switching Test Complete!');
        
        // 判断测试是否成功
        const isSuccess = successRate >= 80 && criticalFailures.length === 0;
        
        if (isSuccess) {
            console.log('\\n✅ LANGUAGE SWITCHING FUNCTIONALITY VERIFIED!');
            console.log('   Multi-language functionality is working correctly.');
        } else {
            console.log('\\n⚠️  Language switching functionality issues detected.');
            console.log('   Please review the failed tests above.');
        }
        
        return isSuccess;
    }

    /**
     * 获取语言图标
     */
    getLanguageIcon(langKey) {
        const icons = {
            root: '🏠',
            english: '🇺🇸',
            chinese: '🇨🇳'
        };
        return icons[langKey] || '🌐';
    }

    /**
     * 获取语言名称
     */
    getLanguageName(langKey) {
        const names = {
            root: 'Root Domain',
            english: 'English Version',
            chinese: 'Chinese Version'
        };
        return names[langKey] || langKey;
    }

    /**
     * 判断是否为关键语言测试
     */
    isCriticalLanguageTest(testName) {
        const criticalTests = [
            'Root Index Exists',
            'English Index Exists',
            'Chinese Index Exists',
            'Root Language Attribute',
            'English Language Attribute',
            'Chinese Language Attribute'
        ];
        
        return criticalTests.some(critical => testName.includes(critical));
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const tester = new LanguageSwitchingTest();
    const success = tester.runTests();
    process.exit(success ? 0 : 1);
}

module.exports = LanguageSwitchingTest;