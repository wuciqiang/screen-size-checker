/**
 * 简化的SEO重定向优化验证脚本
 */

const fs = require('fs');
const path = require('path');

function validateTask7() {
    console.log('🧪 Validating Task 7: 更新构建配置和页面配置');
    console.log('=' .repeat(50));

    let passed = 0;
    let total = 0;

    // 1. 验证根目录页面存在
    total++;
    const rootPagePath = 'multilang-build/index.html';
    if (fs.existsSync(rootPagePath)) {
        console.log('✅ Root directory page exists');
        passed++;
        
        // 检查根目录页面内容
        const content = fs.readFileSync(rootPagePath, 'utf8');
        
        // 验证语言属性
        total++;
        if (content.includes('lang="en"')) {
            console.log('✅ Root page has correct language attribute (en)');
            passed++;
        } else {
            console.log('❌ Root page language attribute incorrect');
        }
        
        // 验证英文内容
        total++;
        if (content.includes('Screen Size Checker') && content.includes('Detect')) {
            console.log('✅ Root page contains English content');
            passed++;
        } else {
            console.log('❌ Root page does not contain expected English content');
        }
        
        // 验证canonical URL
        total++;
        if (content.includes('canonical" href="https://screensizechecker.com/"')) {
            console.log('✅ Root page has correct canonical URL');
            passed++;
        } else {
            console.log('❌ Root page canonical URL incorrect');
        }
        
    } else {
        console.log('❌ Root directory page does not exist');
    }

    // 2. 验证pages-config.json配置
    total++;
    const configPath = 'build/pages-config.json';
    if (fs.existsSync(configPath)) {
        console.log('✅ pages-config.json exists');
        passed++;
        
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const indexConfig = config.pages.find(page => page.name === 'index');
            
            total++;
            if (indexConfig && indexConfig.config.canonical_url === 'https://screensizechecker.com/') {
                console.log('✅ Index page configuration has correct canonical URL');
                passed++;
            } else {
                console.log('❌ Index page configuration canonical URL incorrect');
            }
            
        } catch (error) {
            console.log('❌ Failed to parse pages-config.json');
        }
    } else {
        console.log('❌ pages-config.json does not exist');
    }

    // 3. 验证构建系统默认语言
    total++;
    const builderPath = 'build/multilang-builder.js';
    if (fs.existsSync(builderPath)) {
        const builderContent = fs.readFileSync(builderPath, 'utf8');
        if (builderContent.includes('this.defaultLanguage = \'en\'')) {
            console.log('✅ Build system has correct default language (en)');
            passed++;
        } else {
            console.log('❌ Build system default language not set correctly');
        }
    } else {
        console.log('❌ Build system file not found');
    }

    // 4. 验证重定向文件
    total++;
    const redirectsPath = 'multilang-build/_redirects';
    if (fs.existsSync(redirectsPath)) {
        const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
        // 检查是否没有活跃的根目录重定向（不是注释）
        const hasActiveRootRedirect = redirectsContent.split('\n').some(line => 
            line.trim().startsWith('/ /en/') && !line.trim().startsWith('#')
        );
        if (!hasActiveRootRedirect) {
            console.log('✅ Root redirect has been removed from _redirects');
            passed++;
        } else {
            console.log('❌ Root redirect still exists in _redirects');
        }
    } else {
        console.log('❌ _redirects file not found');
    }

    console.log('\\n' + '='.repeat(50));
    console.log('📊 TASK 7 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${total - passed}`);
    
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    console.log(`Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
        console.log('\\n🎉 Task 7 validation PASSED!');
        return true;
    } else {
        console.log('\\n❌ Task 7 validation FAILED!');
        return false;
    }
}

// 运行验证
if (require.main === module) {
    const success = validateTask7();
    process.exit(success ? 0 : 1);
}

module.exports = validateTask7;