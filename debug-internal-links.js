// 内链诊断脚本 - 在浏览器控制台运行

console.log('=== Internal Links 诊断开始 ===');

// 1. 检查DOM元素
console.log('\n1. 检查DOM元素:');
const container = document.getElementById('internal-links-container');
const template = document.getElementById('internal-link-template');
const loading = document.getElementById('internal-links-loading');

console.log('  - internal-links-container:', container ? '✅ 存在' : '❌ 不存在');
console.log('  - internal-link-template:', template ? '✅ 存在' : '❌ 不存在');
console.log('  - internal-links-loading:', loading ? '✅ 存在' : '❌ 不存在');

// 2. 检查JavaScript模块加载
console.log('\n2. 检查JavaScript模块:');
console.log('  - window.InternalLinksManager:', typeof window.InternalLinksManager);

// 3. 检查配置文件路径
console.log('\n3. 当前路径信息:');
console.log('  - pathname:', window.location.pathname);
console.log('  - href:', window.location.href);

// 4. 尝试加载配置文件
console.log('\n4. 测试配置文件加载:');
const testPaths = [
    'data/internal-links-config.json',
    '../data/internal-links-config.json',
    '/data/internal-links-config.json'
];

for (const path of testPaths) {
    fetch(path)
        .then(res => {
            console.log(`  - ${path}: ✅ ${res.status}`);
            return res.json();
        })
        .then(data => {
            console.log(`    配置版本: ${data.version}, 页面数: ${Object.keys(data.pages).length}`);
        })
        .catch(err => {
            console.log(`  - ${path}: ❌ ${err.message}`);
        });
}

// 5. 检查网络请求
console.log('\n5. 检查网络请求（打开Network标签查看）');
console.log('   查找: internal-links-config.json');

console.log('\n=== 诊断完成 ===');
console.log('请将以上输出截图发送给开发者');
