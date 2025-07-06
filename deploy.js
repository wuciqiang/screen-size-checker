#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署准备...');

// 1. 运行多语言构建
console.log('📦 构建多语言页面...');
require('./build/multilang-builder.js');

// 2. 复制必要的静态文件
console.log('📁 复制静态资源...');
const staticFiles = [
    'style.css',
    'script.js',
    'favicon.ico',
    'favicon.png',
    'robots.txt',
    'sitemap.xml',
    'structured-data.json',
    'privacy-policy.html',
    'ads.txt',
    'googlec786a02f43170c4d.html'
];

staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join('multilang-build', file));
        console.log(`  ✅ 复制 ${file}`);
    }
});

// 3. 复制CSS和JS目录
const copyDir = (src, dest) => {
    if (fs.existsSync(src)) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            if (fs.statSync(srcPath).isDirectory()) {
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
};

copyDir('css', 'multilang-build/css');
copyDir('js', 'multilang-build/js');
copyDir('locales', 'multilang-build/locales');

// 4. 复制重定向文件
if (fs.existsSync('_redirects')) {
    fs.copyFileSync('_redirects', 'multilang-build/_redirects');
    console.log('  ✅ 复制 _redirects');
}

console.log('🎉 部署准备完成！');
console.log('📁 上传 multilang-build/ 目录到 Cloudflare Pages');
console.log('🌐 部署后访问：');
console.log('  - 中文: https://your-domain.com/zh/');
console.log('  - 英文: https://your-domain.com/en/'); 