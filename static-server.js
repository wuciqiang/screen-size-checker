const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// 模拟Cloudflare Pages的静态文件服务
const staticDir = path.join(__dirname, 'multilang-build');
console.log('🌐 Serving static files from:', staticDir);

// 静态文件中间件 - 完全模拟Cloudflare Pages
app.use(express.static(staticDir, {
    extensions: ['html'], // 自动处理.html扩展名
    index: ['index.html'] // 默认索引文件
}));

// 模拟Cloudflare Pages的URL重写规则（无.html后缀）
app.get('*', (req, res, next) => {
    // 如果请求路径不包含扩展名，尝试加上.html
    if (!path.extname(req.path) && req.path !== '/') {
        const htmlPath = path.join(staticDir, req.path + '.html');
        res.sendFile(htmlPath, (err) => {
            if (err) {
                next(); // 如果文件不存在，继续到下一个中间件
            }
        });
    } else {
        next();
    }
});

// 404处理
app.use((req, res) => {
    res.status(404).send(`
        <h1>404 - Page Not Found</h1>
        <p>Path: ${req.path}</p>
        <p>这完全模拟了Cloudflare Pages的行为</p>
        <a href="/">返回首页</a>
    `);
});

app.listen(PORT, () => {
    console.log(`\n🚀 静态服务器启动成功！`);
    console.log(`📁 服务目录: multilang-build/`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 对比页面: http://localhost:${PORT}/en/devices/compare`);
    console.log(`\n这个环境完全模拟Cloudflare Pages的行为：`);
    console.log(`  ✅ 静态文件服务`);
    console.log(`  ✅ 自动.html扩展名处理`);
    console.log(`  ✅ 目录索引文件`);
    console.log(`  ✅ URL重写规则`);
    console.log(`\n现在您可以直接测试线上问题了！🎯`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 静态服务器关闭');
    process.exit(0);
}); 