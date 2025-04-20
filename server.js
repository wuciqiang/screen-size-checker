const express = require('express');
const path = require('path');
const app = express();

const supportedLanguages = ['en', 'zh', 'fr', 'de', 'ko', 'ja', 'es', 'ru', 'pt', 'it'];
const defaultLanguage = 'en';

// 静态文件服务
app.use(express.static(__dirname));

// 语言路由中间件
app.use('/:lang/*', (req, res, next) => {
    const lang = req.params.lang;
    if (!supportedLanguages.includes(lang)) {
        // 获取请求的文件名
        const fileName = req.path.split('/').pop();
        return res.redirect(`/${defaultLanguage}/${fileName}`);
    }
    next();
});

// 处理根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 处理带语言前缀的路由
app.get('/:lang/:page', (req, res) => {
    const { lang, page } = req.params;
    if (supportedLanguages.includes(lang)) {
        res.sendFile(path.join(__dirname, page));
    } else {
        res.sendFile(path.join(__dirname, page));
    }
});

// 处理无语言前缀的页面请求
app.get('/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, page));
});

// 处理隐私政策页面路由
app.get('/:lang/privacy-policy.html', (req, res) => {
    const lang = req.params.lang;
    if (supportedLanguages.includes(lang)) {
        res.sendFile(path.join(__dirname, 'privacy-policy.html'));
    } else {
        res.redirect(`/${defaultLanguage}/privacy-policy.html`);
    }
});

// 处理无语言前缀的隐私政策页面路由
app.get('/privacy-policy.html', (req, res) => {
    res.redirect(`/${defaultLanguage}/privacy-policy.html`);
});

// 404 错误处理
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 