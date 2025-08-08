/**
 * 构建验证和测试脚本
 * 验证SEO重定向优化构建结果的正确性
 * 
 * 功能包括：
 * 1. 检查根目录页面的生成是否正确
 * 2. 验证所有链接在根目录下的可访问性
 * 3. 添加SEO标签验证，确保canonical和hreflang标签正确
 * 4. 创建重定向规则测试，验证所有重定向行为符合预期
 */

const fs = require('fs');
const path = require('path');

class BuildValidationTest {
    constructor() {
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
            categories: {
                rootPageGeneration: { tests: [], passed: 0, failed: 0, warnings: 0 },
                internalLinks: { tests: [], passed: 0, failed: 0, warnings: 0 },
                seoTags: { tests: [], passed: 0, failed: 0, warnings: 0 },
                redirectRules: { tests: [], passed: 0, failed: 0, warnings: 0 }
            }
        };
        this.buildDir = 'multilang-build';
    }

    /**
     * 运行完整的构建验证测试
     */
    runTests() {
        console.log('🔍 Starting Build Validation Tests...');
        console.log('=' .repeat(60));

        // 1. 检查根目录页面生成
        this.testRootPageGeneration();
        
        // 2. 验证内部链接可访问性
        this.testInternalLinksAccessibility();
        
        // 3. 验证SEO标签
        this.testSEOTags();
        
        // 4. 验证重定向规则
        this.testRedirectRules();
        
        // 生成综合报告
        this.generateComprehensiveReport();
        
        return this.testResults;
    }

    /**
     * 测试根目录页面生成
     */
    testRootPageGeneration() {
        console.log('\n📄 Testing Root Page Generation...');
        
        const category = 'rootPageGeneration';
        
        // 检查根目录主页
        this.testRootHomePage(category);
        
        // 检查根目录博客页面
        this.testRootBlogPages(category);
        
        // 检查根目录设备页面
        this.testRootDevicePages(category);
        
        // 检查根目录工具页面
        this.testRootToolPages(category);
        
        console.log(`   📊 Root Page Generation: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 测试根目录主页
     */
    testRootHomePage(category) {
        const indexPath = path.join(this.buildDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addResult(category, 'Root Index Page Exists', 'failed', 'Root index.html not found');
            return;
        }
        
        this.addResult(category, 'Root Index Page Exists', 'passed', 'Root index.html exists');
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // 检查是否包含完整的英文内容而不是重定向脚本
        if (content.includes('window.location.href') || content.includes('location.replace')) {
            this.addResult(category, 'Root Index Content Type', 'failed', 'Still contains redirect script');
        } else if (content.includes('Screen Size Checker') && content.includes('lang="en"')) {
            this.addResult(category, 'Root Index Content Type', 'passed', 'Contains full English content');
        } else {
            this.addResult(category, 'Root Index Content Type', 'warning', 'Content type unclear');
        }
        
        // 检查页面结构完整性
        const requiredElements = [
            { pattern: /<title>.*Screen Size Checker.*<\/title>/, name: 'Title Tag' },
            { pattern: /<meta name="description"/, name: 'Meta Description' },
            { pattern: /<header/, name: 'Header Element' },
            { pattern: /<main/, name: 'Main Content' },
            { pattern: /<footer/, name: 'Footer Element' }
        ];
        
        for (const element of requiredElements) {
            if (element.pattern.test(content)) {
                this.addResult(category, `Root Index ${element.name}`, 'passed', `${element.name} found`);
            } else {
                this.addResult(category, `Root Index ${element.name}`, 'failed', `${element.name} missing`);
            }
        }
    }

    /**
     * 测试根目录博客页面
     */
    testRootBlogPages(category) {
        const blogDir = path.join(this.buildDir, 'blog');
        
        if (!fs.existsSync(blogDir)) {
            this.addResult(category, 'Root Blog Directory', 'failed', 'Blog directory not found');
            return;
        }
        
        this.addResult(category, 'Root Blog Directory', 'passed', 'Blog directory exists');
        
        // 检查博客首页
        const blogIndexPath = path.join(blogDir, 'index.html');
        if (fs.existsSync(blogIndexPath)) {
            this.addResult(category, 'Root Blog Index', 'passed', 'Blog index page exists');
            
            const content = fs.readFileSync(blogIndexPath, 'utf8');
            if (content.includes('lang="en"') && content.includes('Blog')) {
                this.addResult(category, 'Root Blog Index Content', 'passed', 'Blog index has English content');
            } else {
                this.addResult(category, 'Root Blog Index Content', 'failed', 'Blog index content incorrect');
            }
        } else {
            this.addResult(category, 'Root Blog Index', 'failed', 'Blog index page missing');
        }
        
        // 检查博客文章
        const expectedPosts = [
            'average-laptop-screen-size-2025.html',
            'device-pixel-ratio.html',
            'media-queries-essentials.html',
            'viewport-basics.html'
        ];
        
        let foundPosts = 0;
        for (const post of expectedPosts) {
            const postPath = path.join(blogDir, post);
            if (fs.existsSync(postPath)) {
                foundPosts++;
                this.addResult(category, `Root Blog Post: ${post}`, 'passed', 'Blog post exists');
            } else {
                this.addResult(category, `Root Blog Post: ${post}`, 'failed', 'Blog post missing');
            }
        }
        
        // 检查博客分类和标签页面
        const categoryDir = path.join(blogDir, 'category');
        const tagDir = path.join(blogDir, 'tag');
        
        if (fs.existsSync(categoryDir)) {
            this.addResult(category, 'Root Blog Categories', 'passed', 'Blog category directory exists');
        } else {
            this.addResult(category, 'Root Blog Categories', 'warning', 'Blog category directory missing');
        }
        
        if (fs.existsSync(tagDir)) {
            this.addResult(category, 'Root Blog Tags', 'passed', 'Blog tag directory exists');
        } else {
            this.addResult(category, 'Root Blog Tags', 'warning', 'Blog tag directory missing');
        }
    }

    /**
     * 测试根目录设备页面
     */
    testRootDevicePages(category) {
        const devicesDir = path.join(this.buildDir, 'devices');
        
        if (!fs.existsSync(devicesDir)) {
            this.addResult(category, 'Root Devices Directory', 'failed', 'Devices directory not found');
            return;
        }
        
        this.addResult(category, 'Root Devices Directory', 'passed', 'Devices directory exists');
        
        const expectedDevicePages = [
            'compare.html',
            'iphone-viewport-sizes.html',
            'ipad-viewport-sizes.html',
            'android-viewport-sizes.html'
        ];
        
        for (const page of expectedDevicePages) {
            const pagePath = path.join(devicesDir, page);
            if (fs.existsSync(pagePath)) {
                this.addResult(category, `Root Device Page: ${page}`, 'passed', 'Device page exists');
                
                // 检查页面内容
                const content = fs.readFileSync(pagePath, 'utf8');
                if (content.includes('lang="en"')) {
                    this.addResult(category, `Root Device Page Language: ${page}`, 'passed', 'Device page has English language');
                } else {
                    this.addResult(category, `Root Device Page Language: ${page}`, 'failed', 'Device page language incorrect');
                }
            } else {
                this.addResult(category, `Root Device Page: ${page}`, 'failed', 'Device page missing');
            }
        }
    }

    /**
     * 测试根目录工具页面
     */
    testRootToolPages(category) {
        const expectedToolPages = [
            'ppi-calculator.html',
            'aspect-ratio-calculator.html',
            'simulator.html'
        ];
        
        for (const page of expectedToolPages) {
            const pagePath = path.join(this.buildDir, page);
            if (fs.existsSync(pagePath)) {
                this.addResult(category, `Root Tool Page: ${page}`, 'passed', 'Tool page exists');
            } else {
                this.addResult(category, `Root Tool Page: ${page}`, 'warning', 'Tool page missing (may be in devices directory)');
            }
        }
        
        // 检查工具页面是否在devices目录中
        const devicesDir = path.join(this.buildDir, 'devices');
        if (fs.existsSync(devicesDir)) {
            for (const page of expectedToolPages) {
                const pagePath = path.join(devicesDir, page);
                if (fs.existsSync(pagePath)) {
                    this.addResult(category, `Root Tool Page in Devices: ${page}`, 'passed', 'Tool page found in devices directory');
                }
            }
        }
    }

    /**
     * 测试内部链接可访问性
     */
    testInternalLinksAccessibility() {
        console.log('\n🔗 Testing Internal Links Accessibility...');
        
        const category = 'internalLinks';
        
        // 测试主页内部链接
        this.testHomePageLinks(category);
        
        // 测试博客页面内部链接
        this.testBlogPageLinks(category);
        
        // 测试设备页面内部链接
        this.testDevicePageLinks(category);
        
        // 测试资源文件路径
        this.testResourcePaths(category);
        
        console.log(`   📊 Internal Links: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 测试主页内部链接
     */
    testHomePageLinks(category) {
        const indexPath = path.join(this.buildDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addResult(category, 'Home Page Links Test', 'failed', 'Root index.html not found');
            return;
        }
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // 检查导航链接
        const expectedLinks = [
            { pattern: /href="[^"]*devices\/compare[^"]*"/, name: 'Compare Devices Link' },
            { pattern: /href="[^"]*blog[^"]*"/, name: 'Blog Link' },
            { pattern: /href="[^"]*ppi-calculator[^"]*"/, name: 'PPI Calculator Link' },
            { pattern: /href="[^"]*aspect-ratio-calculator[^"]*"/, name: 'Aspect Ratio Calculator Link' }
        ];
        
        for (const link of expectedLinks) {
            if (link.pattern.test(content)) {
                this.addResult(category, `Home Page ${link.name}`, 'passed', `${link.name} found`);
            } else {
                this.addResult(category, `Home Page ${link.name}`, 'warning', `${link.name} not found or different format`);
            }
        }
        
        // 检查是否有绝对路径链接（应该避免）
        const absolutePathPattern = /href="\/en\//g;
        const absolutePaths = content.match(absolutePathPattern);
        if (absolutePaths && absolutePaths.length > 0) {
            this.addResult(category, 'Home Page Absolute Paths', 'warning', `Found ${absolutePaths.length} absolute /en/ paths`);
        } else {
            this.addResult(category, 'Home Page Absolute Paths', 'passed', 'No problematic absolute paths found');
        }
    }

    /**
     * 测试博客页面内部链接
     */
    testBlogPageLinks(category) {
        const blogIndexPath = path.join(this.buildDir, 'blog', 'index.html');
        
        if (!fs.existsSync(blogIndexPath)) {
            this.addResult(category, 'Blog Page Links Test', 'failed', 'Blog index.html not found');
            return;
        }
        
        const content = fs.readFileSync(blogIndexPath, 'utf8');
        
        // 检查返回主页的链接
        if (content.includes('href="../index.html"') || content.includes('href="../"') || content.includes('href="/"')) {
            this.addResult(category, 'Blog Home Link', 'passed', 'Blog has link back to home');
        } else {
            this.addResult(category, 'Blog Home Link', 'warning', 'Blog home link not clearly identified');
        }
        
        // 检查博客文章链接
        const postLinkPattern = /href="[^"]*\.html"/g;
        const postLinks = content.match(postLinkPattern);
        if (postLinks && postLinks.length > 0) {
            this.addResult(category, 'Blog Post Links', 'passed', `Found ${postLinks.length} blog post links`);
        } else {
            this.addResult(category, 'Blog Post Links', 'warning', 'No blog post links found');
        }
        
        // 检查分类和标签链接
        if (content.includes('category/') || content.includes('tag/')) {
            this.addResult(category, 'Blog Category/Tag Links', 'passed', 'Category or tag links found');
        } else {
            this.addResult(category, 'Blog Category/Tag Links', 'warning', 'No category or tag links found');
        }
    }

    /**
     * 测试设备页面内部链接
     */
    testDevicePageLinks(category) {
        const comparePage = path.join(this.buildDir, 'devices', 'compare.html');
        
        if (!fs.existsSync(comparePage)) {
            this.addResult(category, 'Device Page Links Test', 'failed', 'Device compare page not found');
            return;
        }
        
        const content = fs.readFileSync(comparePage, 'utf8');
        
        // 检查返回主页的链接
        if (content.includes('href="../index.html"') || content.includes('href="../"')) {
            this.addResult(category, 'Device Home Link', 'passed', 'Device page has link back to home');
        } else {
            this.addResult(category, 'Device Home Link', 'warning', 'Device home link not clearly identified');
        }
        
        // 检查其他设备页面链接
        const deviceLinkPattern = /href="[^"]*\.html"/g;
        const deviceLinks = content.match(deviceLinkPattern);
        if (deviceLinks && deviceLinks.length > 0) {
            this.addResult(category, 'Device Internal Links', 'passed', `Found ${deviceLinks.length} internal links`);
        } else {
            this.addResult(category, 'Device Internal Links', 'warning', 'No internal links found');
        }
    }

    /**
     * 测试资源文件路径
     */
    testResourcePaths(category) {
        const indexPath = path.join(this.buildDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addResult(category, 'Resource Paths Test', 'failed', 'Root index.html not found');
            return;
        }
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // 检查CSS路径
        const cssPattern = /href="[^"]*\.css"/g;
        const cssLinks = content.match(cssPattern);
        if (cssLinks && cssLinks.length > 0) {
            this.addResult(category, 'CSS Resource Paths', 'passed', `Found ${cssLinks.length} CSS links`);
            
            // 检查CSS文件是否存在
            let validCssCount = 0;
            for (const cssLink of cssLinks) {
                const cssPath = cssLink.match(/href="([^"]*)"/)[1];
                const fullCssPath = path.join(this.buildDir, cssPath);
                if (fs.existsSync(fullCssPath)) {
                    validCssCount++;
                }
            }
            
            if (validCssCount === cssLinks.length) {
                this.addResult(category, 'CSS Files Exist', 'passed', 'All CSS files exist');
            } else {
                this.addResult(category, 'CSS Files Exist', 'warning', `${validCssCount}/${cssLinks.length} CSS files exist`);
            }
        } else {
            this.addResult(category, 'CSS Resource Paths', 'failed', 'No CSS links found');
        }
        
        // 检查JS路径
        const jsPattern = /src="[^"]*\.js"/g;
        const jsLinks = content.match(jsPattern);
        if (jsLinks && jsLinks.length > 0) {
            this.addResult(category, 'JS Resource Paths', 'passed', `Found ${jsLinks.length} JS links`);
        } else {
            this.addResult(category, 'JS Resource Paths', 'warning', 'No JS links found');
        }
    }

    /**
     * 测试SEO标签
     */
    testSEOTags() {
        console.log('\n🏷️ Testing SEO Tags...');
        
        const category = 'seoTags';
        
        // 测试根目录页面SEO标签
        this.testRootPageSEO(category);
        
        // 测试博客页面SEO标签
        this.testBlogPageSEO(category);
        
        // 测试设备页面SEO标签
        this.testDevicePageSEO(category);
        
        // 测试Hreflang标签一致性
        this.testHreflangConsistency(category);
        
        console.log(`   📊 SEO Tags: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 测试根目录页面SEO标签
     */
    testRootPageSEO(category) {
        const indexPath = path.join(this.buildDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addResult(category, 'Root Page SEO Test', 'failed', 'Root index.html not found');
            return;
        }
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // 检查Canonical URL
        const canonicalPattern = /<link rel="canonical" href="https:\/\/screensizechecker\.com\/"[^>]*>/;
        if (canonicalPattern.test(content)) {
            this.addResult(category, 'Root Canonical URL', 'passed', 'Correct canonical URL for root domain');
        } else {
            this.addResult(category, 'Root Canonical URL', 'failed', 'Canonical URL incorrect or missing');
        }
        
        // 检查Meta Description
        const metaDescPattern = /<meta name="description" content="[^"]+"/;
        if (metaDescPattern.test(content)) {
            this.addResult(category, 'Root Meta Description', 'passed', 'Meta description found');
        } else {
            this.addResult(category, 'Root Meta Description', 'failed', 'Meta description missing');
        }
        
        // 检查Title标签
        const titlePattern = /<title>[^<]+Screen Size Checker[^<]*<\/title>/;
        if (titlePattern.test(content)) {
            this.addResult(category, 'Root Title Tag', 'passed', 'Title tag contains site name');
        } else {
            this.addResult(category, 'Root Title Tag', 'failed', 'Title tag incorrect or missing');
        }
        
        // 检查Hreflang标签
        const hreflangPattern = /<link rel="alternate" hreflang="[^"]+"/g;
        const hreflangTags = content.match(hreflangPattern);
        if (hreflangTags && hreflangTags.length >= 3) {
            this.addResult(category, 'Root Hreflang Tags', 'passed', `Found ${hreflangTags.length} hreflang tags`);
        } else {
            this.addResult(category, 'Root Hreflang Tags', 'failed', `Only found ${hreflangTags ? hreflangTags.length : 0} hreflang tags`);
        }
        
        // 检查Open Graph标签
        const ogTags = ['og:title', 'og:description', 'og:url', 'og:type'];
        let foundOgTags = 0;
        for (const ogTag of ogTags) {
            if (content.includes(`property="${ogTag}"`)) {
                foundOgTags++;
            }
        }
        
        if (foundOgTags === ogTags.length) {
            this.addResult(category, 'Root Open Graph Tags', 'passed', 'All essential OG tags found');
        } else {
            this.addResult(category, 'Root Open Graph Tags', 'warning', `${foundOgTags}/${ogTags.length} OG tags found`);
        }
    }

    /**
     * 测试博客页面SEO标签
     */
    testBlogPageSEO(category) {
        const blogIndexPath = path.join(this.buildDir, 'blog', 'index.html');
        
        if (!fs.existsSync(blogIndexPath)) {
            this.addResult(category, 'Blog SEO Test', 'failed', 'Blog index.html not found');
            return;
        }
        
        const content = fs.readFileSync(blogIndexPath, 'utf8');
        
        // 检查博客Canonical URL
        const canonicalPattern = /<link rel="canonical" href="https:\/\/screensizechecker\.com\/blog\/"[^>]*>/;
        if (canonicalPattern.test(content)) {
            this.addResult(category, 'Blog Canonical URL', 'passed', 'Correct canonical URL for blog');
        } else {
            this.addResult(category, 'Blog Canonical URL', 'failed', 'Blog canonical URL incorrect or missing');
        }
        
        // 检查博客特定的Meta Description
        if (content.includes('meta name="description"') && (content.includes('blog') || content.includes('articles'))) {
            this.addResult(category, 'Blog Meta Description', 'passed', 'Blog-specific meta description found');
        } else {
            this.addResult(category, 'Blog Meta Description', 'warning', 'Blog meta description may not be specific');
        }
        
        // 检查博客Hreflang标签
        const hreflangPattern = /<link rel="alternate" hreflang="[^"]+"/g;
        const hreflangTags = content.match(hreflangPattern);
        if (hreflangTags && hreflangTags.length >= 3) {
            this.addResult(category, 'Blog Hreflang Tags', 'passed', `Found ${hreflangTags.length} hreflang tags`);
        } else {
            this.addResult(category, 'Blog Hreflang Tags', 'warning', `Only found ${hreflangTags ? hreflangTags.length : 0} hreflang tags`);
        }
    }

    /**
     * 测试设备页面SEO标签
     */
    testDevicePageSEO(category) {
        const comparePage = path.join(this.buildDir, 'devices', 'compare.html');
        
        if (!fs.existsSync(comparePage)) {
            this.addResult(category, 'Device SEO Test', 'failed', 'Device compare page not found');
            return;
        }
        
        const content = fs.readFileSync(comparePage, 'utf8');
        
        // 检查设备页面Canonical URL
        const canonicalPattern = /<link rel="canonical" href="https:\/\/screensizechecker\.com\/devices\/compare"[^>]*>/;
        if (canonicalPattern.test(content)) {
            this.addResult(category, 'Device Canonical URL', 'passed', 'Correct canonical URL for device page');
        } else {
            this.addResult(category, 'Device Canonical URL', 'failed', 'Device canonical URL incorrect or missing');
        }
        
        // 检查设备页面特定的Title
        if (content.includes('<title>') && content.includes('Compare')) {
            this.addResult(category, 'Device Page Title', 'passed', 'Device-specific title found');
        } else {
            this.addResult(category, 'Device Page Title', 'warning', 'Device title may not be specific');
        }
    }

    /**
     * 测试Hreflang标签一致性
     */
    testHreflangConsistency(category) {
        const pages = [
            { path: path.join(this.buildDir, 'index.html'), name: 'Root Page' },
            { path: path.join(this.buildDir, 'blog', 'index.html'), name: 'Blog Page' },
            { path: path.join(this.buildDir, 'devices', 'compare.html'), name: 'Device Page' }
        ];
        
        const hreflangData = {};
        
        for (const page of pages) {
            if (fs.existsSync(page.path)) {
                const content = fs.readFileSync(page.path, 'utf8');
                const hreflangPattern = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g;
                let match;
                hreflangData[page.name] = [];
                
                while ((match = hreflangPattern.exec(content)) !== null) {
                    hreflangData[page.name].push({ lang: match[1], href: match[2] });
                }
            }
        }
        
        // 检查是否所有页面都有基本的hreflang标签
        let pagesWithHreflang = 0;
        for (const pageName in hreflangData) {
            if (hreflangData[pageName].length > 0) {
                pagesWithHreflang++;
            }
        }
        
        if (pagesWithHreflang === Object.keys(hreflangData).length) {
            this.addResult(category, 'Hreflang Consistency', 'passed', 'All pages have hreflang tags');
        } else {
            this.addResult(category, 'Hreflang Consistency', 'warning', `${pagesWithHreflang}/${Object.keys(hreflangData).length} pages have hreflang tags`);
        }
        
        // 检查是否包含x-default标签
        let pagesWithDefault = 0;
        for (const pageName in hreflangData) {
            const hasDefault = hreflangData[pageName].some(tag => tag.lang === 'x-default');
            if (hasDefault) {
                pagesWithDefault++;
            }
        }
        
        if (pagesWithDefault > 0) {
            this.addResult(category, 'Hreflang X-Default', 'passed', `${pagesWithDefault} pages have x-default hreflang`);
        } else {
            this.addResult(category, 'Hreflang X-Default', 'warning', 'No pages have x-default hreflang');
        }
    }

    /**
     * 测试重定向规则
     */
    testRedirectRules() {
        console.log('\n↩️ Testing Redirect Rules...');
        
        const category = 'redirectRules';
        
        // 测试_redirects文件
        this.testRedirectsFile(category);
        
        // 测试重定向规则内容
        this.testRedirectRulesContent(category);
        
        // 测试是否移除了根目录重定向
        this.testRootRedirectRemoval(category);
        
        console.log(`   📊 Redirect Rules: ${this.testResults.categories[category].passed}/${this.testResults.categories[category].tests.length} passed`);
    }

    /**
     * 测试_redirects文件
     */
    testRedirectsFile(category) {
        const redirectsPath = path.join(this.buildDir, '_redirects');
        
        if (!fs.existsSync(redirectsPath)) {
            this.addResult(category, 'Redirects File Exists', 'failed', '_redirects file not found');
            return;
        }
        
        this.addResult(category, 'Redirects File Exists', 'passed', '_redirects file exists');
        
        const content = fs.readFileSync(redirectsPath, 'utf8');
        
        // 检查文件不为空
        if (content.trim().length > 0) {
            this.addResult(category, 'Redirects File Content', 'passed', '_redirects file has content');
        } else {
            this.addResult(category, 'Redirects File Content', 'warning', '_redirects file is empty');
        }
    }

    /**
     * 测试重定向规则内容
     */
    testRedirectRulesContent(category) {
        const redirectsPath = path.join(this.buildDir, '_redirects');
        
        if (!fs.existsSync(redirectsPath)) {
            this.addResult(category, 'Redirect Rules Content Test', 'failed', '_redirects file not found');
            return;
        }
        
        const content = fs.readFileSync(redirectsPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        // 检查是否有重定向规则
        if (lines.length > 0) {
            this.addResult(category, 'Redirect Rules Present', 'passed', `Found ${lines.length} redirect rules`);
        } else {
            this.addResult(category, 'Redirect Rules Present', 'warning', 'No redirect rules found');
        }
        
        // 检查常见的重定向规则
        const expectedRules = [
            { pattern: /\.html\s+/, name: 'HTML Extension Redirects' },
            { pattern: /\/en\/index\.html\s+\/en\/\s+/, name: 'EN Index Redirect' },
            { pattern: /\/zh\/index\.html\s+\/zh\/\s+/, name: 'ZH Index Redirect' }
        ];
        
        for (const rule of expectedRules) {
            if (rule.pattern.test(content)) {
                this.addResult(category, rule.name, 'passed', `${rule.name} found`);
            } else {
                this.addResult(category, rule.name, 'warning', `${rule.name} not found`);
            }
        }
    }

    /**
     * 测试是否移除了根目录重定向
     */
    testRootRedirectRemoval(category) {
        const redirectsPath = path.join(this.buildDir, '_redirects');
        
        if (!fs.existsSync(redirectsPath)) {
            this.addResult(category, 'Root Redirect Removal Test', 'failed', '_redirects file not found');
            return;
        }
        
        const content = fs.readFileSync(redirectsPath, 'utf8');
        
        // 检查是否还有根目录重定向规则
        const rootRedirectPatterns = [
            /^\s*\/\s+\/en\/\s+30[12]\s*$/m,
            /^\s*\/\s+\/en\/\s*$/m,
            /^\s*\/\s+https:\/\/[^\/]+\/en\/\s+30[12]\s*$/m
        ];
        
        let foundRootRedirect = false;
        for (const pattern of rootRedirectPatterns) {
            if (pattern.test(content)) {
                foundRootRedirect = true;
                break;
            }
        }
        
        if (!foundRootRedirect) {
            this.addResult(category, 'Root Redirect Removed', 'passed', 'Root directory redirect rule removed');
        } else {
            this.addResult(category, 'Root Redirect Removed', 'failed', 'Root directory redirect rule still exists');
        }
        
        // 检查是否有其他可能的根目录重定向
        const suspiciousPatterns = [
            /^\s*\/\s+.*\/en/m,
            /^\s*\/index\.html\s+.*\/en/m
        ];
        
        let foundSuspiciousRedirect = false;
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(content)) {
                foundSuspiciousRedirect = true;
                break;
            }
        }
        
        if (!foundSuspiciousRedirect) {
            this.addResult(category, 'No Suspicious Root Redirects', 'passed', 'No suspicious root redirects found');
        } else {
            this.addResult(category, 'No Suspicious Root Redirects', 'warning', 'Potentially problematic root redirects found');
        }
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
     * 生成综合报告
     */
    generateComprehensiveReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 BUILD VALIDATION TEST COMPREHENSIVE REPORT');
        console.log('='.repeat(60));
        
        const { total, passed, failed, warnings } = this.testResults.summary;
        
        console.log(`\n📈 OVERALL SUMMARY:`);
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        console.log(`Success Rate: ${successRate}%`);
        
        // 分类报告
        console.log(`\n📋 CATEGORY BREAKDOWN:`);
        for (const [categoryName, categoryData] of Object.entries(this.testResults.categories)) {
            const categoryTotal = categoryData.tests.length;
            const categorySuccessRate = categoryTotal > 0 ? ((categoryData.passed / categoryTotal) * 100).toFixed(1) : 0;
            
            console.log(`\n${this.getCategoryIcon(categoryName)} ${this.getCategoryName(categoryName)}:`);
            console.log(`   Tests: ${categoryTotal} | Passed: ${categoryData.passed} | Failed: ${categoryData.failed} | Warnings: ${categoryData.warnings}`);
            console.log(`   Success Rate: ${categorySuccessRate}%`);
        }
        
        // 保存详细报告
        const reportPath = path.join(this.buildDir, 'build-validation-report.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            console.log(`\n📋 Detailed report saved to: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️  Could not save detailed report:', error.message);
        }
        
        // 显示关键失败
        this.showCriticalFailures();
        
        // 显示建议
        this.showRecommendations();
        
        // 最终判断
        const isSuccess = this.evaluateOverallSuccess();
        
        console.log('\n' + '='.repeat(60));
        if (isSuccess) {
            console.log('🎉 BUILD VALIDATION SUCCESSFUL!');
            console.log('   The SEO redirect optimization build appears to be working correctly.');
        } else {
            console.log('⚠️  BUILD VALIDATION ISSUES DETECTED');
            console.log('   Please review the failed tests and warnings above.');
        }
        console.log('='.repeat(60));
        
        return isSuccess;
    }

    /**
     * 获取分类图标
     */
    getCategoryIcon(category) {
        const icons = {
            rootPageGeneration: '📄',
            internalLinks: '🔗',
            seoTags: '🏷️',
            redirectRules: '↩️'
        };
        return icons[category] || '📊';
    }

    /**
     * 获取分类名称
     */
    getCategoryName(category) {
        const names = {
            rootPageGeneration: 'Root Page Generation',
            internalLinks: 'Internal Links Accessibility',
            seoTags: 'SEO Tags Validation',
            redirectRules: 'Redirect Rules Testing'
        };
        return names[category] || category;
    }

    /**
     * 显示关键失败
     */
    showCriticalFailures() {
        const criticalFailures = [];
        
        for (const [categoryName, categoryData] of Object.entries(this.testResults.categories)) {
            const failedTests = categoryData.tests.filter(test => test.status === 'failed');
            for (const test of failedTests) {
                if (this.isCriticalTest(test.test)) {
                    criticalFailures.push({ category: categoryName, ...test });
                }
            }
        }
        
        if (criticalFailures.length > 0) {
            console.log(`\n🚨 CRITICAL FAILURES (${criticalFailures.length}):`);
            for (const failure of criticalFailures) {
                console.log(`   ❌ [${this.getCategoryName(failure.category)}] ${failure.test}: ${failure.message}`);
            }
        }
    }

    /**
     * 判断是否为关键测试
     */
    isCriticalTest(testName) {
        const criticalTests = [
            'Root Index Page Exists',
            'Root Index Content Type',
            'Root Canonical URL',
            'Root Redirect Removed',
            'Redirects File Exists'
        ];
        
        return criticalTests.some(critical => testName.includes(critical));
    }

    /**
     * 显示建议
     */
    showRecommendations() {
        const recommendations = [];
        
        // 基于测试结果生成建议
        for (const [categoryName, categoryData] of Object.entries(this.testResults.categories)) {
            const failedTests = categoryData.tests.filter(test => test.status === 'failed');
            const warningTests = categoryData.tests.filter(test => test.status === 'warning');
            
            if (failedTests.length > 0) {
                recommendations.push(`Fix ${failedTests.length} failed tests in ${this.getCategoryName(categoryName)}`);
            }
            
            if (warningTests.length > 2) {
                recommendations.push(`Review ${warningTests.length} warnings in ${this.getCategoryName(categoryName)}`);
            }
        }
        
        if (recommendations.length > 0) {
            console.log(`\n💡 RECOMMENDATIONS:`);
            for (let i = 0; i < recommendations.length; i++) {
                console.log(`   ${i + 1}. ${recommendations[i]}`);
            }
        }
    }

    /**
     * 评估整体成功
     */
    evaluateOverallSuccess() {
        const { total, passed, failed } = this.testResults.summary;
        
        // 检查关键测试是否通过
        const criticalTests = [
            'Root Index Page Exists',
            'Root Index Content Type',
            'Root Canonical URL',
            'Root Redirect Removed'
        ];
        
        let criticalTestsPassed = 0;
        for (const [categoryName, categoryData] of Object.entries(this.testResults.categories)) {
            for (const test of categoryData.tests) {
                if (criticalTests.some(critical => test.test.includes(critical)) && test.status === 'passed') {
                    criticalTestsPassed++;
                }
            }
        }
        
        // 成功条件：
        // 1. 总体成功率 >= 80%
        // 2. 关键测试通过率 >= 75%
        // 3. 失败测试数量 <= 总数的20%
        
        const successRate = total > 0 ? (passed / total) : 0;
        const criticalSuccessRate = criticalTests.length > 0 ? (criticalTestsPassed / criticalTests.length) : 1;
        const failureRate = total > 0 ? (failed / total) : 0;
        
        return successRate >= 0.8 && criticalSuccessRate >= 0.75 && failureRate <= 0.2;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const validator = new BuildValidationTest();
    const success = validator.runTests();
    process.exit(success ? 0 : 1);
}

module.exports = BuildValidationTest;