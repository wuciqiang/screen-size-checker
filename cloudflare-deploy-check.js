#!/usr/bin/env node

/**
 * Cloudflare 部署前检查脚本
 * 确保性能监控系统在 Cloudflare Pages 部署中正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Cloudflare Pages 部署前检查...\n');

// 检查构建目录
const buildDir = 'multilang-build';
if (!fs.existsSync(buildDir)) {
    console.error('❌ 构建目录不存在，请先运行: npm run build');
    process.exit(1);
}

console.log('✅ 构建目录存在');

// 检查关键文件
const criticalFiles = [
    'js/performance-monitor.js',
    'js/app.js',
    'js/utils.js',
    'performance-test-production.html',
    'performance-monitor-deployment-report.json'
];

let allFilesExist = true;
console.log('\n📋 检查关键文件:');

criticalFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`  ✅ ${file} (${size} KB)`);
    } else {
        console.log(`  ❌ ${file} - 文件缺失`);
        allFilesExist = false;
    }
});

// 检查 app.js 是否包含性能监控导入
const appJsPath = path.join(buildDir, 'js/app.js');
if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    if (appJsContent.includes("import { performanceMonitor } from './performance-monitor.js'")) {
        console.log('  ✅ app.js 包含性能监控导入');
    } else {
        console.log('  ❌ app.js 缺少性能监控导入');
        allFilesExist = false;
    }
}

// 检查页面文件
const pageFiles = [
    'en/index.html',
    'zh/index.html'
];

console.log('\n🌐 检查页面文件:');
pageFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('js/app.js')) {
            console.log(`  ✅ ${file} - 包含 app.js 引用`);
        } else {
            console.log(`  ⚠️  ${file} - 未找到 app.js 引用`);
        }
    } else {
        console.log(`  ❌ ${file} - 文件不存在`);
        allFilesExist = false;
    }
});

// 生成 Cloudflare 部署配置建议
console.log('\n🔧 Cloudflare Pages 配置建议:');
console.log('');
console.log('构建设置:');
console.log('  构建命令: npm run build');
console.log('  构建输出目录: multilang-build');
console.log('  Node.js 版本: 18 或更高');
console.log('');
console.log('环境变量 (可选):');
console.log('  NODE_ENV=production');
console.log('');
console.log('Headers 配置 (_headers 文件):');
console.log('  /js/*');
console.log('    Content-Type: application/javascript');
console.log('    Cache-Control: public, max-age=31536000, immutable');
console.log('');
console.log('  /performance-test-production.html');
console.log('    X-Robots-Tag: noindex');
console.log('');

// 创建 _headers 文件
const headersContent = `# Cloudflare Pages Headers Configuration
# 性能监控系统优化配置

# JavaScript 文件优化
/js/*
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# CSS 文件优化  
/css/*
  Content-Type: text/css
  Cache-Control: public, max-age=31536000, immutable

# 性能测试页面 (防止搜索引擎索引)
/performance-test-production.html
  X-Robots-Tag: noindex, nofollow

# 安全头
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`;

fs.writeFileSync(path.join(buildDir, '_headers'), headersContent);
console.log('✅ 已生成 _headers 文件');

// 最终检查结果
console.log('\n📊 部署检查结果:');
if (allFilesExist) {
    console.log('✅ 所有检查通过！可以部署到 Cloudflare Pages');
    console.log('');
    console.log('部署后验证步骤:');
    console.log('1. 访问您的网站，打开浏览器开发者工具');
    console.log('2. 检查控制台是否有性能监控日志');
    console.log('3. 访问 /performance-test-production.html 进行功能测试');
    console.log('4. 在控制台运行: performanceMonitor.getMetrics()');
    console.log('');
    process.exit(0);
} else {
    console.log('❌ 检查发现问题，请修复后重新构建');
    process.exit(1);
}