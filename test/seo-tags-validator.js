/**
 * SEO标签验证器
 * 验证canonical和hreflang标签的正确性
 */

const fs = require('fs');
const path = require('path');

class SEOTagsValidator {
    constructor() {
        this.buildDir = 'multilang-build';
        this.baseUrl = 'https://screensizechecker.com';
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
            pages: []
        };
    }

    /**
     * 运行SEO标签验证
     */
    runValidation() {
        console.log('🏷️ Starting SEO Tags Validation...');
        console.log('=' .repeat(50));

        // 验证主要页面
        this.validatePage('index.html', 'Root Home Page', '/');
        this.validatePage('blog/index.html', 'Blog Index', '/blog/');
        this.validatePage('devices/compare.html', 'Device Compare', '/devices/compare');
        
        // 验证博客文章
        this.validateBlogPosts();
        
        // 验证设备页面
        this.validateDevicePages();
        
        // 验证hreflang一致性
        this.validateHreflangConsistency();
        
        // 生成报告
        this.generateReport();
        
        return this.testResults;
    }

    /**
     * 验证单个页面的SEO标签
     */
    validatePage(relativePath, pageName, expectedCanonicalPath) {
        const filePath = path.join(this.buildDir, relativePath);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${pageName}: File not found - ${filePath}`);
            return;
        }

        console.log(`\\n📄 Validating: ${pageName}`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const pageResult = {
            pageName,
            filePath: relativePath,
            expectedCanonicalPath,
            tests: [],
            summary: { passed: 0, failed: 0, warnings: 0 }
        };

        // 验证基本SEO标签
        this.validateBasicSEOTags(content, pageResult);
        
        // 验证Canonical标签
        this.validateCanonicalTag(content, pageResult, expectedCanonicalPath);
        
        // 验证Hreflang标签
        this.validateHreflangTags(content, pageResult);
        
        // 验证Open Graph标签
        this.validateOpenGraphTags(content, pageResult);
        
        // 验证Twitter Card标签
        this.validateTwitterCardTags(content, pageResult);
        
        // 验证结构化数据
        this.validateStructuredData(content, pageResult);
        
        this.testResults.pages.push(pageResult);
        
        // 更新总体统计
        this.testResults.summary.passed += pageResult.summary.passed;
        this.testResults.summary.failed += pageResult.summary.failed;
        this.testResults.summary.warnings += pageResult.summary.warnings;
        this.testResults.summary.total += pageResult.tests.length;
        
        console.log(`   📊 ${pageName}: ${pageResult.summary.passed}/${pageResult.tests.length} passed`);
    }

    /**
     * 验证基本SEO标签
     */
    validateBasicSEOTags(content, pageResult) {
        // 验证Title标签
        const titleMatch = content.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
            const title = titleMatch[1].trim();
            if (title.length > 0 && title.length <= 60) {
                this.addResult(pageResult, 'Title Tag', 'passed', `Title: "${title}" (${title.length} chars)`);
            } else if (title.length > 60) {
                this.addResult(pageResult, 'Title Tag', 'warning', `Title too long: ${title.length} chars`);
            } else {
                this.addResult(pageResult, 'Title Tag', 'failed', 'Title is empty');
            }
        } else {
            this.addResult(pageResult, 'Title Tag', 'failed', 'Title tag missing');
        }

        // 验证Meta Description
        const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
        if (descMatch) {
            const description = descMatch[1].trim();
            if (description.length >= 120 && description.length <= 160) {
                this.addResult(pageResult, 'Meta Description', 'passed', `Description: ${description.length} chars`);
            } else if (description.length < 120) {
                this.addResult(pageResult, 'Meta Description', 'warning', `Description too short: ${description.length} chars`);
            } else {
                this.addResult(pageResult, 'Meta Description', 'warning', `Description too long: ${description.length} chars`);
            }
        } else {
            this.addResult(pageResult, 'Meta Description', 'failed', 'Meta description missing');
        }

        // 验证Language属性
        const langMatch = content.match(/<html[^>]+lang="([^"]+)"/);
        if (langMatch) {
            const lang = langMatch[1];
            if (lang === 'en' || lang === 'zh' || lang === 'zh-CN') {
                this.addResult(pageResult, 'HTML Lang Attribute', 'passed', `Language: ${lang}`);
            } else {
                this.addResult(pageResult, 'HTML Lang Attribute', 'warning', `Unexpected language: ${lang}`);
            }
        } else {
            this.addResult(pageResult, 'HTML Lang Attribute', 'failed', 'HTML lang attribute missing');
        }

        // 验证Viewport Meta标签
        if (content.includes('<meta name="viewport"')) {
            this.addResult(pageResult, 'Viewport Meta Tag', 'passed', 'Viewport meta tag found');
        } else {
            this.addResult(pageResult, 'Viewport Meta Tag', 'failed', 'Viewport meta tag missing');
        }
    }

    /**
     * 验证Canonical标签
     */
    validateCanonicalTag(content, pageResult, expectedPath) {
        const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/);
        
        if (canonicalMatch) {
            const canonicalUrl = canonicalMatch[1];
            const expectedUrl = this.baseUrl + expectedPath;
            
            if (canonicalUrl === expectedUrl) {
                this.addResult(pageResult, 'Canonical URL', 'passed', `Correct: ${canonicalUrl}`);
            } else {
                this.addResult(pageResult, 'Canonical URL', 'failed', `Expected: ${expectedUrl}, Found: ${canonicalUrl}`);
            }
            
            // 检查URL格式
            if (canonicalUrl.startsWith('https://')) {
                this.addResult(pageResult, 'Canonical HTTPS', 'passed', 'Uses HTTPS');
            } else {
                this.addResult(pageResult, 'Canonical HTTPS', 'failed', 'Not using HTTPS');
            }
            
            // 检查是否有尾随斜杠一致性
            const hasTrailingSlash = canonicalUrl.endsWith('/');
            const shouldHaveTrailingSlash = expectedPath.endsWith('/');
            
            if (hasTrailingSlash === shouldHaveTrailingSlash) {
                this.addResult(pageResult, 'Canonical Trailing Slash', 'passed', 'Trailing slash consistent');
            } else {
                this.addResult(pageResult, 'Canonical Trailing Slash', 'warning', 'Trailing slash inconsistent');
            }
        } else {
            this.addResult(pageResult, 'Canonical URL', 'failed', 'Canonical tag missing');
        }
    }

    /**
     * 验证Hreflang标签
     */
    validateHreflangTags(content, pageResult) {
        const hreflangPattern = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g;
        const hreflangTags = [];
        let match;
        
        while ((match = hreflangPattern.exec(content)) !== null) {
            hreflangTags.push({
                lang: match[1],
                href: match[2]
            });
        }
        
        if (hreflangTags.length > 0) {
            this.addResult(pageResult, 'Hreflang Tags Present', 'passed', `Found ${hreflangTags.length} hreflang tags`);
            
            // 检查必需的语言
            const requiredLangs = ['en', 'zh', 'x-default'];
            const foundLangs = hreflangTags.map(tag => tag.lang);
            
            for (const requiredLang of requiredLangs) {
                if (foundLangs.includes(requiredLang)) {
                    this.addResult(pageResult, `Hreflang ${requiredLang}`, 'passed', `${requiredLang} hreflang found`);
                } else {
                    this.addResult(pageResult, `Hreflang ${requiredLang}`, 'warning', `${requiredLang} hreflang missing`);
                }
            }
            
            // 检查URL格式
            let validUrls = 0;
            for (const tag of hreflangTags) {
                if (tag.href.startsWith('https://screensizechecker.com')) {
                    validUrls++;
                }
            }
            
            if (validUrls === hreflangTags.length) {
                this.addResult(pageResult, 'Hreflang URLs Valid', 'passed', 'All hreflang URLs are valid');
            } else {
                this.addResult(pageResult, 'Hreflang URLs Valid', 'warning', `${validUrls}/${hreflangTags.length} URLs are valid`);
            }
        } else {
            this.addResult(pageResult, 'Hreflang Tags Present', 'failed', 'No hreflang tags found');
        }
    }

    /**
     * 验证Open Graph标签
     */
    validateOpenGraphTags(content, pageResult) {
        const requiredOgTags = [
            { property: 'og:title', name: 'OG Title' },
            { property: 'og:description', name: 'OG Description' },
            { property: 'og:url', name: 'OG URL' },
            { property: 'og:type', name: 'OG Type' },
            { property: 'og:image', name: 'OG Image' }
        ];
        
        let foundOgTags = 0;
        
        for (const ogTag of requiredOgTags) {
            const pattern = new RegExp(`<meta property="${ogTag.property}" content="([^"]+)"`, 'i');
            const match = content.match(pattern);
            
            if (match) {
                foundOgTags++;
                const content_value = match[1];
                
                if (content_value.trim().length > 0) {
                    this.addResult(pageResult, ogTag.name, 'passed', `${ogTag.property} found`);
                } else {
                    this.addResult(pageResult, ogTag.name, 'warning', `${ogTag.property} empty`);
                }
            } else {
                this.addResult(pageResult, ogTag.name, 'warning', `${ogTag.property} missing`);
            }
        }
        
        // 总体OG标签评估
        if (foundOgTags >= 4) {
            this.addResult(pageResult, 'Open Graph Complete', 'passed', `${foundOgTags}/5 OG tags found`);
        } else {
            this.addResult(pageResult, 'Open Graph Complete', 'warning', `Only ${foundOgTags}/5 OG tags found`);
        }
    }

    /**
     * 验证Twitter Card标签
     */
    validateTwitterCardTags(content, pageResult) {
        const twitterTags = [
            'twitter:card',
            'twitter:title',
            'twitter:description'
        ];
        
        let foundTwitterTags = 0;
        
        for (const twitterTag of twitterTags) {
            const pattern = new RegExp(`<meta name="${twitterTag}" content="([^"]+)"`, 'i');
            if (pattern.test(content)) {
                foundTwitterTags++;
            }
        }
        
        if (foundTwitterTags >= 2) {
            this.addResult(pageResult, 'Twitter Cards', 'passed', `${foundTwitterTags}/3 Twitter tags found`);
        } else if (foundTwitterTags > 0) {
            this.addResult(pageResult, 'Twitter Cards', 'warning', `Only ${foundTwitterTags}/3 Twitter tags found`);
        } else {
            this.addResult(pageResult, 'Twitter Cards', 'warning', 'No Twitter Card tags found');
        }
    }

    /**
     * 验证结构化数据
     */
    validateStructuredData(content, pageResult) {
        // 检查JSON-LD结构化数据
        const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
        const jsonLdMatches = content.match(jsonLdPattern);
        
        if (jsonLdMatches && jsonLdMatches.length > 0) {
            this.addResult(pageResult, 'Structured Data', 'passed', `Found ${jsonLdMatches.length} JSON-LD blocks`);
            
            // 尝试解析JSON-LD
            let validJsonLd = 0;
            for (const jsonLdMatch of jsonLdMatches) {
                try {
                    const jsonContent = jsonLdMatch.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                    JSON.parse(jsonContent);
                    validJsonLd++;
                } catch (e) {
                    // JSON解析失败
                }
            }
            
            if (validJsonLd === jsonLdMatches.length) {
                this.addResult(pageResult, 'Structured Data Valid', 'passed', 'All JSON-LD blocks are valid');
            } else {
                this.addResult(pageResult, 'Structured Data Valid', 'warning', `${validJsonLd}/${jsonLdMatches.length} JSON-LD blocks are valid`);
            }
        } else {
            this.addResult(pageResult, 'Structured Data', 'warning', 'No structured data found');
        }
    }

    /**
     * 验证博客文章SEO标签
     */
    validateBlogPosts() {
        const blogDir = path.join(this.buildDir, 'blog');
        
        if (!fs.existsSync(blogDir)) {
            console.log('⚠️  Blog directory not found');
            return;
        }
        
        const blogFiles = fs.readdirSync(blogDir).filter(file => 
            file.endsWith('.html') && file !== 'index.html'
        );
        
        console.log(`\\n📝 Validating ${Math.min(blogFiles.length, 2)} blog posts...`);
        
        // 验证前2个博客文章
        for (const file of blogFiles.slice(0, 2)) {
            const relativePath = `blog/${file}`;
            const expectedCanonicalPath = `/blog/${file.replace('.html', '')}`;
            this.validatePage(relativePath, `Blog Post: ${file}`, expectedCanonicalPath);
        }
    }

    /**
     * 验证设备页面SEO标签
     */
    validateDevicePages() {
        const devicesDir = path.join(this.buildDir, 'devices');
        
        if (!fs.existsSync(devicesDir)) {
            console.log('⚠️  Devices directory not found');
            return;
        }
        
        const deviceFiles = fs.readdirSync(devicesDir).filter(file => 
            file.endsWith('.html')
        );
        
        console.log(`\\n📱 Validating ${Math.min(deviceFiles.length, 2)} device pages...`);
        
        // 验证前2个设备页面
        for (const file of deviceFiles.slice(0, 2)) {
            const relativePath = `devices/${file}`;
            const expectedCanonicalPath = `/devices/${file.replace('.html', '')}`;
            this.validatePage(relativePath, `Device Page: ${file}`, expectedCanonicalPath);
        }
    }

    /**
     * 验证Hreflang一致性
     */
    validateHreflangConsistency() {
        console.log('\\n🌐 Validating Hreflang Consistency...');
        
        const hreflangData = {};
        
        // 收集所有页面的hreflang数据
        for (const pageResult of this.testResults.pages) {
            const filePath = path.join(this.buildDir, pageResult.filePath);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const hreflangPattern = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g;
                let match;
                
                hreflangData[pageResult.pageName] = [];
                while ((match = hreflangPattern.exec(content)) !== null) {
                    hreflangData[pageResult.pageName].push({
                        lang: match[1],
                        href: match[2]
                    });
                }
            }
        }
        
        // 分析一致性
        const languages = new Set();
        for (const pageName in hreflangData) {
            for (const tag of hreflangData[pageName]) {
                languages.add(tag.lang);
            }
        }
        
        console.log(`   📊 Found ${languages.size} unique languages across all pages`);
        console.log(`   🔗 Languages: ${Array.from(languages).join(', ')}`);
        
        // 检查每个页面是否有一致的语言集合
        let consistentPages = 0;
        const expectedLangs = ['en', 'zh', 'x-default'];
        
        for (const pageName in hreflangData) {
            const pageLangs = hreflangData[pageName].map(tag => tag.lang);
            const hasAllExpected = expectedLangs.every(lang => pageLangs.includes(lang));
            
            if (hasAllExpected) {
                consistentPages++;
                console.log(`   ✅ ${pageName}: Has all expected languages`);
            } else {
                const missing = expectedLangs.filter(lang => !pageLangs.includes(lang));
                console.log(`   ⚠️  ${pageName}: Missing languages: ${missing.join(', ')}`);
            }
        }
        
        console.log(`   📈 Consistency: ${consistentPages}/${Object.keys(hreflangData).length} pages have consistent hreflang`);
    }

    /**
     * 添加测试结果
     */
    addResult(pageResult, test, status, message) {
        pageResult.tests.push({ test, status, message, timestamp: new Date().toISOString() });
        pageResult.summary[status]++;
        
        const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
        console.log(`   ${icon} ${test}: ${message}`);
    }

    /**
     * 生成报告
     */
    generateReport() {
        console.log('\\n' + '='.repeat(50));
        console.log('📊 SEO TAGS VALIDATION SUMMARY');
        console.log('='.repeat(50));
        
        const { total, passed, failed, warnings } = this.testResults.summary;
        
        console.log(`\\n📈 OVERALL SUMMARY:`);
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        console.log(`Success Rate: ${successRate}%`);
        
        // 页面级别报告
        console.log(`\\n📋 PAGE-LEVEL BREAKDOWN:`);
        for (const pageResult of this.testResults.pages) {
            const pageTotal = pageResult.tests.length;
            const pageSuccessRate = pageTotal > 0 ? ((pageResult.summary.passed / pageTotal) * 100).toFixed(1) : 0;
            
            console.log(`\\n   📄 ${pageResult.pageName}:`);
            console.log(`      Tests: ${pageTotal} | Passed: ${pageResult.summary.passed} | Failed: ${pageResult.summary.failed} | Warnings: ${pageResult.summary.warnings}`);
            console.log(`      Success Rate: ${pageSuccessRate}%`);
        }
        
        // 显示关键失败
        const criticalFailures = [];
        for (const pageResult of this.testResults.pages) {
            const failedTests = pageResult.tests.filter(test => test.status === 'failed');
            for (const test of failedTests) {
                if (this.isCriticalSEOTest(test.test)) {
                    criticalFailures.push({ page: pageResult.pageName, ...test });
                }
            }
        }
        
        if (criticalFailures.length > 0) {
            console.log(`\\n🚨 CRITICAL SEO FAILURES (${criticalFailures.length}):`);
            for (const failure of criticalFailures) {
                console.log(`   ❌ [${failure.page}] ${failure.test}: ${failure.message}`);
            }
        }
        
        // 保存报告
        const reportPath = path.join(this.buildDir, 'seo-tags-validation-report.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            console.log(`\\n📋 Report saved to: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️  Could not save report:', error.message);
        }
        
        console.log('\\n🎉 SEO Tags Validation Complete!');
        
        // 判断验证是否成功
        const isSuccess = successRate >= 75 && criticalFailures.length === 0;
        
        if (isSuccess) {
            console.log('\\n✅ SEO TAGS VALIDATION SUCCESSFUL!');
            console.log('   All critical SEO tags are properly configured.');
        } else {
            console.log('\\n⚠️  SEO tags validation issues detected.');
            console.log('   Please review the failed tests and warnings above.');
        }
        
        return isSuccess;
    }

    /**
     * 判断是否为关键SEO测试
     */
    isCriticalSEOTest(testName) {
        const criticalTests = [
            'Title Tag',
            'Meta Description',
            'Canonical URL',
            'HTML Lang Attribute',
            'Hreflang Tags Present'
        ];
        
        return criticalTests.some(critical => testName.includes(critical));
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const validator = new SEOTagsValidator();
    const success = validator.runValidation();
    process.exit(success ? 0 : 1);
}

module.exports = SEOTagsValidator;