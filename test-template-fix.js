#!/usr/bin/env node

/**
 * 测试模板变量修复效果
 * 验证根目录页面不再显示 {{faq_structured_data}} 异常
 */

const fs = require('fs');
const path = require('path');

function testTemplateVariableFix() {
    console.log('🔍 测试模板变量修复效果...\n');
    
    const testFiles = [
        'multilang-build/index.html',
        'multilang-build/devices/compare.html',
        'multilang-build/devices/ppi-calculator.html',
        'multilang-build/devices/responsive-tester.html'
    ];
    
    let allPassed = true;
    
    for (const filePath of testFiles) {
        if (!fs.existsSync(filePath)) {
            console.log(`❌ 文件不存在: ${filePath}`);
            allPassed = false;
            continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否还有未处理的模板变量
        const unprocessedVariables = content.match(/\{\{[^}]+\}\}/g);
        
        if (unprocessedVariables) {
            console.log(`❌ ${filePath}: 发现未处理的模板变量:`);
            unprocessedVariables.forEach(variable => {
                console.log(`   - ${variable}`);
            });
            allPassed = false;
        } else {
            console.log(`✅ ${filePath}: 所有模板变量已正确处理`);
        }
        
        // 特别检查 faq_structured_data
        if (content.includes('{{faq_structured_data}}')) {
            console.log(`❌ ${filePath}: 仍然包含 {{faq_structured_data}}`);
            allPassed = false;
        }
        
        // 对于 responsive-tester 页面，检查是否包含FAQ结构化数据
        if (filePath.includes('responsive-tester')) {
            if (content.includes('"@type": "FAQPage"')) {
                console.log(`✅ ${filePath}: 正确包含FAQ结构化数据`);
            } else {
                console.log(`❌ ${filePath}: 缺少FAQ结构化数据`);
                allPassed = false;
            }
        }
    }
    
    console.log('\n📊 测试结果:');
    if (allPassed) {
        console.log('🎉 所有测试通过！模板变量修复成功。');
        console.log('✅ 根目录访问不再显示 {{faq_structured_data}} 异常');
        console.log('✅ 所有页面的模板变量都被正确处理');
        console.log('✅ responsive-tester页面正确包含FAQ结构化数据');
    } else {
        console.log('❌ 部分测试失败，需要进一步检查。');
    }
    
    return allPassed;
}

if (require.main === module) {
    testTemplateVariableFix();
}

module.exports = { testTemplateVariableFix };