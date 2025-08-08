/**
 * 根目录页面功能测试
 * 验证所有页面类型在根目录下正常工作
 */

const fs = require('fs');
const path = require('path');

class RootPagesFunctionalityTest {
    constructor() {
        this.buildDir = 'multilang-build';
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
            pageTypes: {
                homepage: { tests: [], passed: 0, failed: 0, warnings: 0 },
                devicePages: { tests: [], passed: 0, failed: 0, warnings: 0 },
                blogPages: { tests: [], passed: 0, failed: 0, warnings: 0 },
                toolPages: { tests: [], passed: 0, failed: 0, warnings: 0 }
            }
        };
    }

    /**
     * 运行根目录页面功能测试
     */
    runTests() {
        console.log('🏠 Starting Root Pages Functionality Test...');
        console.log('=' .repeat(60));

        // 1. 测试主页功能
        this.testHomepageFunctionality();
        
        // 2. 测试设备页面功能
        this.testDevicePagesFunctionality();
        
        // 3. 测试博客页面功能
        this.testBlogPagesFunctionality();
        
        // 4. 测试工具页面功能
        this.testToolPagesFunctionality();
        
        // 生成报告
        this.generateReport();
        
        return this.testResults;
    }

    /**
     * 测试主页功能
     */
    testHomepageFunctionality() {
        console.log('\\n🏠 Testing Homepage Functionality...');
        
        const category = 'homepage';
        const indexPath = path.join(this.buildDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addResult(category, 'Homepage Exists', 'failed', 'Root index.html not found');
            return;
        }
        
        this.addResult(category, 'Homepage Exists', 'passed', 'Root index.html exists');
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // 检查页面是否包含完整内容而不是重定向
        if (content.includes('window.location.href') || content.includes('location.replace')) {
            this.addResult(category, 'No Redirect Script', 'failed', 'Still contains redirect script');
        } else {
            this.addResult(category, 'No Redirect Script', 'passed', 'No redirect script found');
        }
        
        // 检查主要功能区域
        const functionalElements = [
            { pattern: /<main[^>]*>/, name: 'Main Content Area' },
            { pattern: /<header[^>]*>/, name: 'Header Navigation' },
            { pattern: /<footer[^>]*>/, name: 'Footer' },
            { pattern: /Screen Size Checker/i, name: 'Site Title' },
            { pattern: /devices.*compare/i, name: 'Device Comparison Link' },
            { pattern: /blog/i, name: 'Blog Link' }
        ];
        
        for (const element of functionalElements) {
            if (element.pattern.test(content)) {
                this.addResult(category, element.name, 'passed', `${element.name} found`);
            } else {
                this.addResult(category, element.name, 'warning', `${element.name} not clearly identified`);
            }
        }
        
        // 检查语言切换功能
        if (content.includes('language') && content.includes('modal')) {
            this.addResult(category, 'Language Switching', 'passed', 'Language switching functionality found');
        } else {
            this.addResult(category, 'Language Switching', 'warning', 'Language switching not clearly identified');
        }
        
        // 检查JavaScript功能
        if (content.includes('js/app.js')) {
            this.addResult(category, 'JavaScript Integration', 'passed', 'Main JavaScript file included');
        } else {
            this.addResult(category, 'JavaScript Integration', 'failed', 'Main JavaScript file missing');
        }
        
        console.log(`   📊 Homepage: ${this.testResults.pageTypes[category].passed}/${this.testResults.pageTypes[category].tests.length} passed`);
    }

    /**
     * 测试设备页面功能
     */
    testDevicePagesFunctionality() {
        console.log('\\n📱 Testing Device Pages Functionality...');
        
        const category = 'devicePages';
        const devicePages = [
            { file: 'devices/compare.html', name: 'Device Comparison' },
            { file: 'devices/iphone-viewport-sizes.html', name: 'iPhone Viewport Sizes' },
            { file: 'devices/ipad-viewport-sizes.html', name: 'iPad Viewport Sizes' },
            { file: 'devices/android-viewport-sizes.html', name: 'Android Viewport Sizes' },
            { file: 'devices/ppi-calculator.html', name: 'PPI Calculator' },
            { file: 'devices/aspect-ratio-calculator.html', name: 'Aspect Ratio Calculator' }
        ];
        
        for (const page of devicePages) {
            const pagePath = path.join(this.buildDir, page.file);
            
            if (!fs.existsSync(pagePath)) {
                this.addResult(category, `${page.name} Exists`, 'failed', `${page.file} not found`);
                continue;
            }
            
            this.addResult(category, `${page.name} Exists`, 'passed', `${page.file} exists`);
            
            const content = fs.readFileSync(pagePath, 'utf8');
            
            // 检查页面基本结构
            if (content.includes('<main') && content.includes('<header') && content.includes('<footer')) {
                this.addResult(category, `${page.name} Structure`, 'passed', 'Complete page structure');
            } else {
                this.addResult(category, `${page.name} Structure`, 'warning', 'Incomplete page structure');
            }
            
            // 检查导航链接
            if (content.includes('href="../index.html"') || content.includes('href="../"')) {
                this.addResult(category, `${page.name} Navigation`, 'passed', 'Navigation to home found');
            } else {
                this.addResult(category, `${page.name} Navigation`, 'warning', 'Navigation to home not found');
            }
            
            // 检查特定功能（针对工具页面）
            if (page.file.includes('calculator')) {
                if (content.includes('input') && content.includes('button')) {
                    this.addResult(category, `${page.name} Interactive Elements`, 'passed', 'Calculator inputs found');
                } else {
                    this.addResult(category, `${page.name} Interactive Elements`, 'warning', 'Calculator inputs not found');
                }
            }
            
            // 检查设备数据（针对设备信息页面）
            if (page.file.includes('viewport-sizes')) {
                if (content.includes('viewport') && (content.includes('iPhone') || content.includes('iPad') || content.includes('Android'))) {
                    this.addResult(category, `${page.name} Device Data`, 'passed', 'Device viewport data found');
                } else {
                    this.addResult(category, `${page.name} Device Data`, 'warning', 'Device viewport data not clearly identified');
                }
            }
        }
        
        console.log(`   📊 Device Pages: ${this.testResults.pageTypes[category].passed}/${this.testResults.pageTypes[category].tests.length} passed`);
    }

    /**
     * 测试博客页面功能
     */
    testBlogPagesFunctionality() {
        console.log('\\n📝 Testing Blog Pages Functionality...');
        
        const category = 'blogPages';
        
        // 测试博客首页
        const blogIndexPath = path.join(this.buildDir, 'blog', 'index.html');
        
        if (!fs.existsSync(blogIndexPath)) {
            this.addResult(category, 'Blog Index Exists', 'failed', 'Blog index not found');
        } else {
            this.addResult(category, 'Blog Index Exists', 'passed', 'Blog index exists');
            
            const content = fs.readFileSync(blogIndexPath, 'utf8');
            
            // 检查博客首页功能
            if (content.includes('blog') && content.includes('article')) {
                this.addResult(category, 'Blog Index Content', 'passed', 'Blog content structure found');
            } else {
                this.addResult(category, 'Blog Index Content', 'warning', 'Blog content structure unclear');
            }
            
            // 检查文章链接
            const articleLinks = content.match(/href="[^"]*\.html"/g);
            if (articleLinks && articleLinks.length > 0) {
                this.addResult(category, 'Blog Article Links', 'passed', `Found ${articleLinks.length} article links`);
            } else {
                this.addResult(category, 'Blog Article Links', 'warning', 'No article links found');
            }
            
            // 检查分类和标签
            if (content.includes('category') || content.includes('tag')) {
                this.addResult(category, 'Blog Categories/Tags', 'passed', 'Categories or tags found');
            } else {
                this.addResult(category, 'Blog Categories/Tags', 'warning', 'Categories or tags not found');
            }
        }
        
        // 测试博客文章
        const blogArticles = [
            'blog/average-laptop-screen-size-2025.html',
            'blog/device-pixel-ratio.html',
            'blog/media-queries-essentials.html',
            'blog/viewport-basics.html'
        ];
        
        let workingArticles = 0;
        
        for (const article of blogArticles) {
            const articlePath = path.join(this.buildDir, article);
            
            if (fs.existsSync(articlePath)) {
                workingArticles++;
                const content = fs.readFileSync(articlePath, 'utf8');
                
                // 检查文章结构
                if (content.includes('<article') || content.includes('<main')) {
                    this.addResult(category, `Article ${path.basename(article)} Structure`, 'passed', 'Article structure found');
                } else {
                    this.addResult(category, `Article ${path.basename(article)} Structure`, 'warning', 'Article structure unclear');
                }
                
                // 检查返回博客首页的链接
                if (content.includes('href="../index.html"') || content.includes('href="index.html"')) {
                    this.addResult(category, `Article ${path.basename(article)} Navigation`, 'passed', 'Navigation to blog index found');
                } else {
                    this.addResult(category, `Article ${path.basename(article)} Navigation`, 'warning', 'Navigation to blog index not found');
                }
            } else {
                this.addResult(category, `Article ${path.basename(article)} Exists`, 'failed', `${article} not found`);
            }
        }
        
        // 总体博客功能评估
        if (workingArticles >= 3) {
            this.addResult(category, 'Blog System Functional', 'passed', `${workingArticles}/4 articles working`);
        } else {
            this.addResult(category, 'Blog System Functional', 'warning', `Only ${workingArticles}/4 articles working`);
        }
        
        // 测试博客分类页面
        const categoryPages = [
            'blog/category/technical.html',
            'blog/category/css.html',
            'blog/category/basics.html'
        ];
        
        let workingCategories = 0;
        for (const categoryPage of categoryPages) {
            const categoryPath = path.join(this.buildDir, categoryPage);
            if (fs.existsSync(categoryPath)) {
                workingCategories++;
            }
        }
        
        if (workingCategories >= 2) {
            this.addResult(category, 'Blog Categories Functional', 'passed', `${workingCategories}/3 categories working`);
        } else {
            this.addResult(category, 'Blog Categories Functional', 'warning', `Only ${workingCategories}/3 categories working`);
        }
        
        console.log(`   📊 Blog Pages: ${this.testResults.pageTypes[category].passed}/${this.testResults.pageTypes[category].tests.length} passed`);
    }

    /**
     * 测试工具页面功能
     */
    testToolPagesFunctionality() {
        console.log('\\n🔧 Testing Tool Pages Functionality...');
        
        const category = 'toolPages';
        
        const toolPages = [
            { file: 'devices/ppi-calculator.html', name: 'PPI Calculator', expectedElements: ['input', 'calculate', 'ppi'] },
            { file: 'devices/aspect-ratio-calculator.html', name: 'Aspect Ratio Calculator', expectedElements: ['input', 'calculate', 'ratio'] },
            { file: 'devices/compare.html', name: 'Device Comparison Tool', expectedElements: ['compare', 'device', 'select'] }
        ];
        
        for (const tool of toolPages) {
            const toolPath = path.join(this.buildDir, tool.file);
            
            if (!fs.existsSync(toolPath)) {
                this.addResult(category, `${tool.name} Exists`, 'failed', `${tool.file} not found`);
                continue;
            }
            
            this.addResult(category, `${tool.name} Exists`, 'passed', `${tool.file} exists`);
            
            const content = fs.readFileSync(toolPath, 'utf8');
            
            // 检查工具特定元素
            let foundElements = 0;
            for (const element of tool.expectedElements) {
                if (content.toLowerCase().includes(element.toLowerCase())) {
                    foundElements++;
                }
            }
            
            if (foundElements >= tool.expectedElements.length - 1) {
                this.addResult(category, `${tool.name} Functionality`, 'passed', `${foundElements}/${tool.expectedElements.length} expected elements found`);
            } else {
                this.addResult(category, `${tool.name} Functionality`, 'warning', `Only ${foundElements}/${tool.expectedElements.length} expected elements found`);
            }
            
            // 检查JavaScript集成
            if (content.includes('.js')) {
                this.addResult(category, `${tool.name} JavaScript`, 'passed', 'JavaScript files included');
            } else {
                this.addResult(category, `${tool.name} JavaScript`, 'warning', 'No JavaScript files found');
            }
            
            // 检查表单元素（对于计算器）
            if (tool.file.includes('calculator')) {
                const inputCount = (content.match(/<input/g) || []).length;
                const buttonCount = (content.match(/<button/g) || []).length;
                
                if (inputCount > 0 && buttonCount > 0) {
                    this.addResult(category, `${tool.name} Interactive Elements`, 'passed', `${inputCount} inputs, ${buttonCount} buttons`);
                } else {
                    this.addResult(category, `${tool.name} Interactive Elements`, 'warning', 'Limited interactive elements');
                }
            }
        }
        
        console.log(`   📊 Tool Pages: ${this.testResults.pageTypes[category].passed}/${this.testResults.pageTypes[category].tests.length} passed`);
    }

    /**
     * 添加测试结果
     */
    addResult(category, test, status, message) {
        const result = { test, status, message, timestamp: new Date().toISOString() };
        
        this.testResults.pageTypes[category].tests.push(result);
        this.testResults.pageTypes[category][status]++;
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
        console.log('📊 ROOT PAGES FUNCTIONALITY TEST SUMMARY');
        console.log('='.repeat(60));
        
        const { total, passed, failed, warnings } = this.testResults.summary;
        
        console.log(`\\n📈 OVERALL SUMMARY:`);
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        console.log(`Success Rate: ${successRate}%`);
        
        // 页面类型详细报告
        console.log(`\\n📋 PAGE TYPES BREAKDOWN:`);
        for (const [pageType, data] of Object.entries(this.testResults.pageTypes)) {
            const typeTotal = data.tests.length;
            const typeSuccessRate = typeTotal > 0 ? ((data.passed / typeTotal) * 100).toFixed(1) : 0;
            
            console.log(`\\n   ${this.getPageTypeIcon(pageType)} ${this.getPageTypeName(pageType)}:`);
            console.log(`      Tests: ${typeTotal} | Passed: ${data.passed} | Failed: ${data.failed} | Warnings: ${data.warnings}`);
            console.log(`      Success Rate: ${typeSuccessRate}%`);
        }
        
        // 显示关键失败
        const criticalFailures = [];
        for (const [pageType, data] of Object.entries(this.testResults.pageTypes)) {
            const failedTests = data.tests.filter(test => test.status === 'failed');
            for (const test of failedTests) {
                if (this.isCriticalTest(test.test)) {
                    criticalFailures.push({ pageType, ...test });
                }
            }
        }
        
        if (criticalFailures.length > 0) {
            console.log(`\\n🚨 CRITICAL FAILURES (${criticalFailures.length}):`);
            for (const failure of criticalFailures) {
                console.log(`   ❌ [${this.getPageTypeName(failure.pageType)}] ${failure.test}: ${failure.message}`);
            }
        }
        
        // 保存报告
        const reportPath = path.join(this.buildDir, 'root-pages-functionality-report.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            console.log(`\\n📋 Report saved to: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️  Could not save report:', error.message);
        }
        
        console.log('\\n🎉 Root Pages Functionality Test Complete!');
        
        // 判断测试是否成功
        const isSuccess = successRate >= 80 && criticalFailures.length === 0;
        
        if (isSuccess) {
            console.log('\\n✅ ROOT PAGES FUNCTIONALITY VERIFIED!');
            console.log('   All page types are working correctly in the root domain.');
        } else {
            console.log('\\n⚠️  Root pages functionality issues detected.');
            console.log('   Please review the failed tests above.');
        }
        
        return isSuccess;
    }

    /**
     * 获取页面类型图标
     */
    getPageTypeIcon(pageType) {
        const icons = {
            homepage: '🏠',
            devicePages: '📱',
            blogPages: '📝',
            toolPages: '🔧'
        };
        return icons[pageType] || '📄';
    }

    /**
     * 获取页面类型名称
     */
    getPageTypeName(pageType) {
        const names = {
            homepage: 'Homepage',
            devicePages: 'Device Pages',
            blogPages: 'Blog Pages',
            toolPages: 'Tool Pages'
        };
        return names[pageType] || pageType;
    }

    /**
     * 判断是否为关键测试
     */
    isCriticalTest(testName) {
        const criticalTests = [
            'Homepage Exists',
            'No Redirect Script',
            'Blog Index Exists',
            'Blog System Functional'
        ];
        
        return criticalTests.some(critical => testName.includes(critical));
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const tester = new RootPagesFunctionalityTest();
    const success = tester.runTests();
    process.exit(success ? 0 : 1);
}

module.exports = RootPagesFunctionalityTest;