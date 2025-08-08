/**
 * SEO语言兼容性测试
 * 验证根域名的SEO标签和结构，确保多语言SEO配置正确
 */

const fs = require('fs');
const path = require('path');

class SEOLanguageCompatibilityTest {
    constructor() {
        this.buildDir = 'multilang-build';
        this.baseUrl = 'https://screensizechecker.com';
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
            categories: {
                rootSEO: { tests: [], passed: 0, failed: 0, warnings: 0 },
                languageConsistency: { tests: [], passed: 0, failed: 0, warnings: 0 },
                sitemapValidation: { tests: [], passed: 0, failed: 0, warnings: 0 },
                redirectsValidation: { tests: [], passed: 0, failed: 0, warnings: 0 }
            }
        };
    }

    /**
     * 运行SEO语言兼容性测试
     */
    runTests() {
        console.log('🔍 Starting SEO Language Compatibility Test...');
        console.log('=' .repeat(60));

        // 1. 验证根域名SEO配置
        this.testRootDomainSEO();
        
        // 2. 验证语言版本一致性
        this.testLanguageConsistency();
        
        // 3. 验证Sitemap配置
        this.testSitemapValidation();
        
        // 4. 验证重定向规则
        this.testRedirectsValidation();
        
        // 生成报告
        this.generateReport();
        
        return this.testResults;
    }

    /**
     * 测试根域名SEO配置
     */
    testRootDomainSEO() {
        console.log('\\n🏠 Testing Root Domain SEO Configuration...');
        
        const category = 'rootSEO';
        const indexPath = path.join(this.buildDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addResult(category, 'Root Page Exists', 'failed', 'Root index.html not found');
            return;
        }
        
        this.addResult(category, 'Root Page Exists', 'passed', 'Root index.html exists');
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // 检查基本SEO标签
        this.validateBasicSEOTags(content, category, 'Root');
        
        // 检查多语言SEO标签
        this.validateMultilingualSEOTags(content, category, 'Root');
        
        // 检查结构化数据
        this.validateStructuredData(content, category, 'Root');
        
        console.log(`   📊 Root SEO: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 验证基本SEO标签
     */
    validateBasicSEOTags(content, category, pageName) {
        // Title标签
        const titleMatch = content.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
            const title = titleMatch[1].trim();
            if (title.length > 0 && title.length <= 60 && title.includes('Screen Size Checker')) {
                this.addResult(category, `${pageName} Title Tag`, 'passed', `Title: "${title}" (${title.length} chars)`);
            } else if (title.length > 60) {
                this.addResult(category, `${pageName} Title Tag`, 'warning', `Title too long: ${title.length} chars`);
            } else {
                this.addResult(category, `${pageName} Title Tag`, 'failed', 'Title missing or incorrect');
            }
        } else {
            this.addResult(category, `${pageName} Title Tag`, 'failed', 'Title tag missing');
        }

        // Meta Description
        const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
        if (descMatch) {
            const description = descMatch[1].trim();
            if (description.length >= 120 && description.length <= 160) {
                this.addResult(category, `${pageName} Meta Description`, 'passed', `Description: ${description.length} chars`);
            } else if (description.length < 120) {
                this.addResult(category, `${pageName} Meta Description`, 'warning', `Description too short: ${description.length} chars`);
            } else {
                this.addResult(category, `${pageName} Meta Description`, 'warning', `Description too long: ${description.length} chars`);
            }
        } else {
            this.addResult(category, `${pageName} Meta Description`, 'failed', 'Meta description missing');
        }

        // Canonical URL
        const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/);
        if (canonicalMatch) {
            const canonicalUrl = canonicalMatch[1];
            const expectedUrl = pageName === 'Root' ? this.baseUrl + '/' : this.baseUrl + '/en/';
            
            if (canonicalUrl === expectedUrl) {
                this.addResult(category, `${pageName} Canonical URL`, 'passed', `Correct: ${canonicalUrl}`);
            } else {
                this.addResult(category, `${pageName} Canonical URL`, 'failed', `Expected: ${expectedUrl}, Found: ${canonicalUrl}`);
            }
        } else {
            this.addResult(category, `${pageName} Canonical URL`, 'failed', 'Canonical tag missing');
        }
    }

    /**
     * 验证多语言SEO标签
     */
    validateMultilingualSEOTags(content, category, pageName) {
        // Hreflang标签
        const hreflangPattern = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g;
        const hreflangTags = [];
        let match;
        
        while ((match = hreflangPattern.exec(content)) !== null) {
            hreflangTags.push({
                lang: match[1],
                href: match[2]
            });
        }
        
        if (hreflangTags.length >= 3) {
            this.addResult(category, `${pageName} Hreflang Tags Count`, 'passed', `Found ${hreflangTags.length} hreflang tags`);
        } else {
            this.addResult(category, `${pageName} Hreflang Tags Count`, 'failed', `Only found ${hreflangTags.length} hreflang tags`);
        }
        
        // 检查必需的语言标签
        const requiredLangs = ['en', 'zh', 'x-default'];
        const foundLangs = hreflangTags.map(tag => tag.lang);
        
        for (const requiredLang of requiredLangs) {
            if (foundLangs.includes(requiredLang)) {
                this.addResult(category, `${pageName} Hreflang ${requiredLang}`, 'passed', `${requiredLang} hreflang found`);
            } else {
                this.addResult(category, `${pageName} Hreflang ${requiredLang}`, 'failed', `${requiredLang} hreflang missing`);
            }
        }
        
        // 验证Hreflang URL格式
        let validHreflangUrls = 0;
        for (const tag of hreflangTags) {
            if (tag.href.startsWith(this.baseUrl)) {
                validHreflangUrls++;
            }
        }
        
        if (validHreflangUrls === hreflangTags.length) {
            this.addResult(category, `${pageName} Hreflang URLs Valid`, 'passed', 'All hreflang URLs are valid');
        } else {
            this.addResult(category, `${pageName} Hreflang URLs Valid`, 'warning', `${validHreflangUrls}/${hreflangTags.length} URLs are valid`);
        }
        
        // 检查根域名的特殊hreflang配置
        if (pageName === 'Root') {
            const enHreflang = hreflangTags.find(tag => tag.lang === 'en');
            const defaultHreflang = hreflangTags.find(tag => tag.lang === 'x-default');
            
            if (enHreflang && enHreflang.href === this.baseUrl + '/') {
                this.addResult(category, `${pageName} EN Hreflang Points to Root`, 'passed', 'EN hreflang correctly points to root');
            } else {
                this.addResult(category, `${pageName} EN Hreflang Points to Root`, 'warning', 'EN hreflang may not point to root');
            }
            
            if (defaultHreflang && defaultHreflang.href === this.baseUrl + '/') {
                this.addResult(category, `${pageName} Default Hreflang Points to Root`, 'passed', 'x-default hreflang correctly points to root');
            } else {
                this.addResult(category, `${pageName} Default Hreflang Points to Root`, 'warning', 'x-default hreflang may not point to root');
            }
        }
    }

    /**
     * 验证结构化数据
     */
    validateStructuredData(content, category, pageName) {
        // 检查JSON-LD结构化数据
        const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
        const jsonLdMatches = content.match(jsonLdPattern);
        
        if (jsonLdMatches && jsonLdMatches.length > 0) {
            this.addResult(category, `${pageName} Structured Data`, 'passed', `Found ${jsonLdMatches.length} JSON-LD blocks`);
            
            // 尝试解析JSON-LD
            let validJsonLd = 0;
            for (const jsonLdMatch of jsonLdMatches) {
                try {
                    const jsonContent = jsonLdMatch.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                    const parsedData = JSON.parse(jsonContent);
                    
                    // 检查是否包含多语言信息
                    if (parsedData['@context'] && parsedData['@type']) {
                        validJsonLd++;
                        
                        // 检查是否有语言相关的属性
                        if (parsedData.inLanguage || parsedData.availableLanguage) {
                            this.addResult(category, `${pageName} Structured Data Language`, 'passed', 'Language information found in structured data');
                        } else {
                            this.addResult(category, `${pageName} Structured Data Language`, 'warning', 'No language information in structured data');
                        }
                    }
                } catch (e) {
                    // JSON解析失败
                }
            }
            
            if (validJsonLd === jsonLdMatches.length) {
                this.addResult(category, `${pageName} Structured Data Valid`, 'passed', 'All JSON-LD blocks are valid');
            } else {
                this.addResult(category, `${pageName} Structured Data Valid`, 'warning', `${validJsonLd}/${jsonLdMatches.length} JSON-LD blocks are valid`);
            }
        } else {
            this.addResult(category, `${pageName} Structured Data`, 'warning', 'No structured data found');
        }
    }

    /**
     * 测试语言版本一致性
     */
    testLanguageConsistency() {
        console.log('\\n🌐 Testing Language Version Consistency...');
        
        const category = 'languageConsistency';
        
        const pages = [
            { path: path.join(this.buildDir, 'index.html'), name: 'Root', expectedLang: 'en' },
            { path: path.join(this.buildDir, 'en', 'index.html'), name: 'English', expectedLang: 'en' },
            { path: path.join(this.buildDir, 'zh', 'index.html'), name: 'Chinese', expectedLang: 'zh' }
        ];
        
        const pageData = {};
        
        // 收集所有页面的数据
        for (const page of pages) {
            if (fs.existsSync(page.path)) {
                const content = fs.readFileSync(page.path, 'utf8');
                
                pageData[page.name] = {
                    exists: true,
                    lang: this.extractLanguage(content),
                    title: this.extractTitle(content),
                    description: this.extractDescription(content),
                    hreflangTags: this.extractHreflangTags(content)
                };
            } else {
                pageData[page.name] = { exists: false };
            }
        }
        
        // 验证页面存在性
        for (const page of pages) {
            if (pageData[page.name].exists) {
                this.addResult(category, `${page.name} Page Exists`, 'passed', `${page.name} page exists`);
            } else {
                this.addResult(category, `${page.name} Page Exists`, 'failed', `${page.name} page missing`);
            }
        }
        
        // 验证语言属性一致性
        for (const page of pages) {
            if (pageData[page.name].exists) {
                if (pageData[page.name].lang === page.expectedLang) {
                    this.addResult(category, `${page.name} Language Attribute`, 'passed', `Language correctly set to ${page.expectedLang}`);
                } else {
                    this.addResult(category, `${page.name} Language Attribute`, 'failed', `Expected ${page.expectedLang}, found ${pageData[page.name].lang}`);
                }
            }
        }
        
        // 验证Hreflang一致性
        if (pageData['Root'].exists && pageData['English'].exists && pageData['Chinese'].exists) {
            const rootHreflang = pageData['Root'].hreflangTags;
            const enHreflang = pageData['English'].hreflangTags;
            const zhHreflang = pageData['Chinese'].hreflangTags;
            
            // 检查所有页面是否有相同的语言集合
            const rootLangs = new Set(rootHreflang.map(tag => tag.lang));
            const enLangs = new Set(enHreflang.map(tag => tag.lang));
            const zhLangs = new Set(zhHreflang.map(tag => tag.lang));
            
            if (rootLangs.size === enLangs.size && rootLangs.size === zhLangs.size) {
                let consistent = true;
                for (const lang of rootLangs) {
                    if (!enLangs.has(lang) || !zhLangs.has(lang)) {
                        consistent = false;
                        break;
                    }
                }
                
                if (consistent) {
                    this.addResult(category, 'Hreflang Consistency Across Pages', 'passed', 'All pages have consistent hreflang tags');
                } else {
                    this.addResult(category, 'Hreflang Consistency Across Pages', 'warning', 'Hreflang tags are not consistent across pages');
                }
            } else {
                this.addResult(category, 'Hreflang Consistency Across Pages', 'warning', 'Different number of hreflang tags across pages');
            }
        }
        
        console.log(`   📊 Language Consistency: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 测试Sitemap验证
     */
    testSitemapValidation() {
        console.log('\\n🗺️ Testing Sitemap Validation...');
        
        const category = 'sitemapValidation';
        const sitemapPath = path.join(this.buildDir, 'sitemap.xml');
        
        if (!fs.existsSync(sitemapPath)) {
            this.addResult(category, 'Sitemap Exists', 'failed', 'sitemap.xml not found');
            return;
        }
        
        this.addResult(category, 'Sitemap Exists', 'passed', 'sitemap.xml exists');
        
        const content = fs.readFileSync(sitemapPath, 'utf8');
        
        // 检查XML格式
        if (content.includes('<?xml') && content.includes('<urlset')) {
            this.addResult(category, 'Sitemap XML Format', 'passed', 'Valid XML format');
        } else {
            this.addResult(category, 'Sitemap XML Format', 'failed', 'Invalid XML format');
        }
        
        // 检查根域名URL
        if (content.includes(`<loc>${this.baseUrl}/</loc>`)) {
            this.addResult(category, 'Sitemap Root URL', 'passed', 'Root domain URL found in sitemap');
        } else {
            this.addResult(category, 'Sitemap Root URL', 'failed', 'Root domain URL missing from sitemap');
        }
        
        // 检查语言版本URL
        if (content.includes(`<loc>${this.baseUrl}/en/</loc>`)) {
            this.addResult(category, 'Sitemap English URL', 'passed', 'English version URL found in sitemap');
        } else {
            this.addResult(category, 'Sitemap English URL', 'warning', 'English version URL missing from sitemap');
        }
        
        if (content.includes(`<loc>${this.baseUrl}/zh/</loc>`)) {
            this.addResult(category, 'Sitemap Chinese URL', 'passed', 'Chinese version URL found in sitemap');
        } else {
            this.addResult(category, 'Sitemap Chinese URL', 'warning', 'Chinese version URL missing from sitemap');
        }
        
        // 检查博客URL
        if (content.includes(`<loc>${this.baseUrl}/blog/</loc>`)) {
            this.addResult(category, 'Sitemap Root Blog URL', 'passed', 'Root blog URL found in sitemap');
        } else {
            this.addResult(category, 'Sitemap Root Blog URL', 'warning', 'Root blog URL missing from sitemap');
        }
        
        // 统计URL数量
        const urlCount = (content.match(/<loc>/g) || []).length;
        if (urlCount > 50) {
            this.addResult(category, 'Sitemap URL Count', 'passed', `Found ${urlCount} URLs in sitemap`);
        } else {
            this.addResult(category, 'Sitemap URL Count', 'warning', `Only ${urlCount} URLs in sitemap`);
        }
        
        console.log(`   📊 Sitemap: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 测试重定向规则验证
     */
    testRedirectsValidation() {
        console.log('\\n↩️ Testing Redirects Validation...');
        
        const category = 'redirectsValidation';
        const redirectsPath = path.join(this.buildDir, '_redirects');
        
        if (!fs.existsSync(redirectsPath)) {
            this.addResult(category, 'Redirects File Exists', 'failed', '_redirects file not found');
            return;
        }
        
        this.addResult(category, 'Redirects File Exists', 'passed', '_redirects file exists');
        
        const content = fs.readFileSync(redirectsPath, 'utf8');
        const lines = content.split('\\n').filter(line => line.trim() && !line.startsWith('#'));
        
        // 检查是否移除了根目录重定向
        const rootRedirectPattern = /^\s*\/\s+\/en\/\s+30[12]\s*$/;
        const hasRootRedirect = lines.some(line => rootRedirectPattern.test(line));
        
        if (!hasRootRedirect) {
            this.addResult(category, 'Root Redirect Removed', 'passed', 'Root directory redirect successfully removed');
        } else {
            this.addResult(category, 'Root Redirect Removed', 'failed', 'Root directory redirect still exists');
        }
        
        // 检查语言版本重定向
        const enIndexRedirect = lines.some(line => line.includes('/en/index.html') && line.includes('/en/'));
        if (enIndexRedirect) {
            this.addResult(category, 'EN Index Redirect', 'passed', 'English index redirect found');
        } else {
            this.addResult(category, 'EN Index Redirect', 'warning', 'English index redirect not found');
        }
        
        const zhIndexRedirect = lines.some(line => line.includes('/zh/index.html') && line.includes('/zh/'));
        if (zhIndexRedirect) {
            this.addResult(category, 'ZH Index Redirect', 'passed', 'Chinese index redirect found');
        } else {
            this.addResult(category, 'ZH Index Redirect', 'warning', 'Chinese index redirect not found');
        }
        
        // 检查HTML扩展名重定向
        const htmlRedirects = lines.filter(line => line.includes('.html'));
        if (htmlRedirects.length > 0) {
            this.addResult(category, 'HTML Extension Redirects', 'passed', `Found ${htmlRedirects.length} HTML extension redirects`);
        } else {
            this.addResult(category, 'HTML Extension Redirects', 'warning', 'No HTML extension redirects found');
        }
        
        // 检查重定向规则总数
        if (lines.length > 10) {
            this.addResult(category, 'Redirect Rules Count', 'passed', `Found ${lines.length} redirect rules`);
        } else {
            this.addResult(category, 'Redirect Rules Count', 'warning', `Only ${lines.length} redirect rules found`);
        }
        
        console.log(`   📊 Redirects: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 辅助方法：提取语言
     */
    extractLanguage(content) {
        const langMatch = content.match(/<html[^>]+lang="([^"]+)"/);
        return langMatch ? langMatch[1] : null;
    }

    /**
     * 辅助方法：提取标题
     */
    extractTitle(content) {
        const titleMatch = content.match(/<title>([^<]+)<\/title>/);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    /**
     * 辅助方法：提取描述
     */
    extractDescription(content) {
        const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
        return descMatch ? descMatch[1].trim() : null;
    }

    /**
     * 辅助方法：提取Hreflang标签
     */
    extractHreflangTags(content) {
        const hreflangPattern = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g;
        const tags = [];
        let match;
        
        while ((match = hreflangPattern.exec(content)) !== null) {
            tags.push({
                lang: match[1],
                href: match[2]
            });
        }
        
        return tags;
    }

    /**
     * 添加测试结果
     */
    addResult(category, test, status, message) {
        const result = { test, status, message, timestamp: new Date().toISOString() };
        
        this.testResults.categories[category].tests.push(result);
        this.testResults.categories[category][status]++;
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
        console.log('📊 SEO LANGUAGE COMPATIBILITY TEST SUMMARY');
        console.log('='.repeat(60));
        
        const { total, passed, failed, warnings } = this.testResults.summary;
        
        console.log(`\\n📈 OVERALL SUMMARY:`);
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        console.log(`Success Rate: ${successRate}%`);
        
        // 分类详细报告
        console.log(`\\n📋 CATEGORY BREAKDOWN:`);
        for (const [categoryName, categoryData] of Object.entries(this.testResults.categories)) {
            const categoryTotal = categoryData.tests.length;
            const categorySuccessRate = categoryTotal > 0 ? ((categoryData.passed / categoryTotal) * 100).toFixed(1) : 0;
            
            console.log(`\\n   ${this.getCategoryIcon(categoryName)} ${this.getCategoryName(categoryName)}:`);
            console.log(`      Tests: ${categoryTotal} | Passed: ${categoryData.passed} | Failed: ${categoryData.failed} | Warnings: ${categoryData.warnings}`);
            console.log(`      Success Rate: ${categorySuccessRate}%`);
        }
        
        // 保存报告
        const reportPath = path.join(this.buildDir, 'seo-language-compatibility-report.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            console.log(`\\n📋 Report saved to: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️  Could not save report:', error.message);
        }
        
        console.log('\\n🎉 SEO Language Compatibility Test Complete!');
        
        // 判断测试是否成功
        const isSuccess = successRate >= 80 && failed <= 3;
        
        if (isSuccess) {
            console.log('\\n✅ SEO LANGUAGE COMPATIBILITY VERIFIED!');
            console.log('   Root domain SEO configuration is optimized for search engines.');
        } else {
            console.log('\\n⚠️  SEO language compatibility issues detected.');
            console.log('   Please review the failed tests above.');
        }
        
        return isSuccess;
    }

    /**
     * 获取分类图标
     */
    getCategoryIcon(category) {
        const icons = {
            rootSEO: '🏠',
            languageConsistency: '🌐',
            sitemapValidation: '🗺️',
            redirectsValidation: '↩️'
        };
        return icons[category] || '📊';
    }

    /**
     * 获取分类名称
     */
    getCategoryName(category) {
        const names = {
            rootSEO: 'Root Domain SEO',
            languageConsistency: 'Language Consistency',
            sitemapValidation: 'Sitemap Validation',
            redirectsValidation: 'Redirects Validation'
        };
        return names[category] || category;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const tester = new SEOLanguageCompatibilityTest();
    const success = tester.runTests();
    process.exit(success ? 0 : 1);
}

module.exports = SEOLanguageCompatibilityTest;