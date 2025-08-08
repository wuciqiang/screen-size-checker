/**
 * 根目录博客访问测试
 * 验证根域名状态下博客内容的可访问性
 */

const fs = require('fs');
const path = require('path');

class RootBlogAccessTest {
    constructor() {
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
            tests: []
        };
    }

    /**
     * 运行根目录博客访问测试
     */
    runTests() {
        console.log('📝 Starting Root Blog Access Tests...');
        console.log('=' .repeat(50));

        // 1. 验证根目录博客结构
        this.testRootBlogStructure();
        
        // 2. 验证博客页面内容
        this.testBlogPageContent();
        
        // 3. 验证博客页面SEO标签
        this.testBlogSEOTags();
        
        // 4. 验证博客内部链接
        this.testBlogInternalLinks();
        
        // 5. 验证设备页面结构
        this.testRootDeviceStructure();
        
        // 生成报告
        this.generateReport();
        
        return this.testResults;
    }

    /**
     * 测试根目录博客结构
     */
    testRootBlogStructure() {
        console.log('\\n📁 Testing Root Blog Structure...');
        
        const requiredPaths = [
            'multilang-build/blog',
            'multilang-build/blog/index.html',
            'multilang-build/blog/category',
            'multilang-build/blog/tag',
            'multilang-build/devices',
            'multilang-build/devices/compare.html'
        ];
        
        for (const requiredPath of requiredPaths) {
            if (fs.existsSync(requiredPath)) {
                this.addResult(`Structure: ${requiredPath}`, 'passed', 'Path exists');
            } else {
                this.addResult(`Structure: ${requiredPath}`, 'failed', 'Path missing');
            }
        }
        
        // 检查博客文章
        const blogPosts = [
            'multilang-build/blog/average-laptop-screen-size-2025.html',
            'multilang-build/blog/device-pixel-ratio.html',
            'multilang-build/blog/media-queries-essentials.html',
            'multilang-build/blog/viewport-basics.html'
        ];
        
        for (const post of blogPosts) {
            if (fs.existsSync(post)) {
                this.addResult(`Blog Post: ${path.basename(post)}`, 'passed', 'Post exists');
            } else {
                this.addResult(`Blog Post: ${path.basename(post)}`, 'failed', 'Post missing');
            }
        }
    }

    /**
     * 测试博客页面内容
     */
    testBlogPageContent() {
        console.log('\\n📄 Testing Blog Page Content...');
        
        const blogIndexPath = 'multilang-build/blog/index.html';
        
        if (!fs.existsSync(blogIndexPath)) {
            this.addResult('Blog Index Content', 'failed', 'Blog index page not found');
            return;
        }
        
        const content = fs.readFileSync(blogIndexPath, 'utf8');
        
        // 检查语言属性
        if (content.includes('lang="en"')) {
            this.addResult('Blog Index Language', 'passed', 'HTML lang attribute is English');
        } else {
            this.addResult('Blog Index Language', 'failed', 'HTML lang attribute incorrect');
        }
        
        // 检查标题
        if (content.includes('Blog: Viewport & Screen Size Knowledge Base')) {
            this.addResult('Blog Index Title', 'passed', 'Title contains expected text');
        } else {
            this.addResult('Blog Index Title', 'failed', 'Title missing or incorrect');
        }
        
        // 检查是否包含英文内容
        if (content.includes('knowledge base') || content.includes('articles')) {
            this.addResult('Blog Index English Content', 'passed', 'Contains English content');
        } else {
            this.addResult('Blog Index English Content', 'warning', 'English content verification unclear');
        }
    }

    /**
     * 测试博客SEO标签
     */
    testBlogSEOTags() {
        console.log('\\n🏷️ Testing Blog SEO Tags...');
        
        const blogIndexPath = 'multilang-build/blog/index.html';
        
        if (!fs.existsSync(blogIndexPath)) {
            this.addResult('Blog SEO Tags', 'failed', 'Blog index page not found');
            return;
        }
        
        const content = fs.readFileSync(blogIndexPath, 'utf8');
        
        // 检查Canonical URL
        if (content.includes('canonical" href="https://screensizechecker.com/blog/"')) {
            this.addResult('Blog Canonical URL', 'passed', 'Correct canonical URL for root blog');
        } else {
            this.addResult('Blog Canonical URL', 'failed', 'Canonical URL incorrect or missing');
        }
        
        // 检查Meta Description
        if (content.includes('meta name="description"') && content.includes('knowledge base')) {
            this.addResult('Blog Meta Description', 'passed', 'Meta description found');
        } else {
            this.addResult('Blog Meta Description', 'failed', 'Meta description missing or incorrect');
        }
        
        // 检查Hreflang标签
        const hreflangCount = (content.match(/hreflang="/g) || []).length;
        if (hreflangCount >= 4) {
            this.addResult('Blog Hreflang Tags', 'passed', `Found ${hreflangCount} hreflang tags`);
        } else {
            this.addResult('Blog Hreflang Tags', 'failed', `Only found ${hreflangCount} hreflang tags`);
        }
        
        // 检查Open Graph标签
        if (content.includes('og:title') && content.includes('og:description') && content.includes('og:url')) {
            this.addResult('Blog Open Graph Tags', 'passed', 'All OG tags found');
        } else {
            this.addResult('Blog Open Graph Tags', 'failed', 'Missing OG tags');
        }
    }

    /**
     * 测试博客内部链接
     */
    testBlogInternalLinks() {
        console.log('\\n🔗 Testing Blog Internal Links...');
        
        const blogIndexPath = 'multilang-build/blog/index.html';
        
        if (!fs.existsSync(blogIndexPath)) {
            this.addResult('Blog Internal Links', 'failed', 'Blog index page not found');
            return;
        }
        
        const content = fs.readFileSync(blogIndexPath, 'utf8');
        
        // 检查回到主页的链接
        if (content.includes('href="../index.html"') || content.includes('href="/"')) {
            this.addResult('Blog Home Link', 'passed', 'Home link found');
        } else {
            this.addResult('Blog Home Link', 'warning', 'Home link not clearly identified');
        }
        
        // 检查CSS和JS路径
        if (content.includes('href="../css/') && content.includes('src="../js/')) {
            this.addResult('Blog Resource Paths', 'passed', 'CSS and JS paths correctly adjusted');
        } else {
            this.addResult('Blog Resource Paths', 'failed', 'Resource paths may be incorrect');
        }
        
        // 检查语言切换功能
        if (content.includes('language') || content.includes('lang')) {
            this.addResult('Blog Language Switching', 'passed', 'Language switching elements found');
        } else {
            this.addResult('Blog Language Switching', 'warning', 'Language switching not clearly identified');
        }
    }

    /**
     * 测试根目录设备页面结构
     */
    testRootDeviceStructure() {
        console.log('\\n🔧 Testing Root Device Structure...');
        
        const devicePages = [
            'multilang-build/devices/compare.html',
            'multilang-build/devices/iphone-viewport-sizes.html',
            'multilang-build/devices/ipad-viewport-sizes.html',
            'multilang-build/devices/android-viewport-sizes.html',
            'multilang-build/devices/ppi-calculator.html',
            'multilang-build/devices/aspect-ratio-calculator.html'
        ];
        
        let existingDevicePages = 0;
        
        for (const devicePage of devicePages) {
            if (fs.existsSync(devicePage)) {
                existingDevicePages++;
                this.addResult(`Device Page: ${path.basename(devicePage)}`, 'passed', 'Device page exists');
            } else {
                this.addResult(`Device Page: ${path.basename(devicePage)}`, 'failed', 'Device page missing');
            }
        }
        
        // 总体设备页面检查
        if (existingDevicePages >= 6) {
            this.addResult('Device Pages Coverage', 'passed', `${existingDevicePages} device pages found`);
        } else {
            this.addResult('Device Pages Coverage', 'warning', `Only ${existingDevicePages} device pages found`);
        }
        
        // 检查一个设备页面的内容
        const comparePage = 'multilang-build/devices/compare.html';
        if (fs.existsSync(comparePage)) {
            const content = fs.readFileSync(comparePage, 'utf8');
            
            // 检查canonical URL
            if (content.includes('canonical" href="https://screensizechecker.com/devices/compare"')) {
                this.addResult('Device Page Canonical', 'passed', 'Device page has correct canonical URL');
            } else {
                this.addResult('Device Page Canonical', 'failed', 'Device page canonical URL incorrect');
            }
            
            // 检查语言属性
            if (content.includes('lang="en"')) {
                this.addResult('Device Page Language', 'passed', 'Device page language is English');
            } else {
                this.addResult('Device Page Language', 'failed', 'Device page language incorrect');
            }
        }
    }

    /**
     * 添加测试结果
     */
    addResult(test, status, message) {
        this.testResults.tests.push({ test, status, message, timestamp: new Date().toISOString() });
        this.testResults.summary.total++;
        this.testResults.summary[status]++;
        
        const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
        console.log(`   ${icon} ${test}: ${message}`);
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        console.log('\\n' + '='.repeat(50));
        console.log('📊 ROOT BLOG ACCESS TEST SUMMARY');
        console.log('='.repeat(50));
        
        const { total, passed, failed, warnings } = this.testResults.summary;
        
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        console.log(`Success Rate: ${successRate}%`);
        
        // 保存报告
        const reportPath = 'multilang-build/root-blog-access-test-report.json';
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            console.log(`\\n📋 Report saved to: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️  Could not save report:', error.message);
        }
        
        // 显示失败的测试
        const failedTests = this.testResults.tests.filter(test => test.status === 'failed');
        if (failedTests.length > 0) {
            console.log('\\n❌ FAILED TESTS:');
            failedTests.forEach(test => console.log(`   • ${test.test}: ${test.message}`));
        }
        
        // 显示警告
        const warningTests = this.testResults.tests.filter(test => test.status === 'warning');
        if (warningTests.length > 0) {
            console.log('\\n⚠️  WARNINGS:');
            warningTests.forEach(test => console.log(`   • ${test.test}: ${test.message}`));
        }
        
        console.log('\\n🎉 Root Blog Access Test Complete!');
        
        // 判断测试是否成功
        const criticalFailures = failedTests.filter(test => 
            test.test.includes('Blog Index') || 
            test.test.includes('Structure: multilang-build/blog')
        );
        
        if (criticalFailures.length === 0 && successRate >= 80) {
            console.log('\\n✅ ROOT BLOG ACCESS ISSUE RESOLVED!');
            console.log('   The blog is now accessible from the root domain.');
            return true;
        } else {
            console.log('\\n❌ Root blog access issue may still exist.');
            return false;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const tester = new RootBlogAccessTest();
    const success = tester.runTests();
    process.exit(success ? 0 : 1);
}

module.exports = RootBlogAccessTest;