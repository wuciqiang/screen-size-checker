const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const supportedLanguages = ['en', 'zh', 'fr', 'de', 'ko', 'ja', 'es', 'ru', 'pt', 'it'];
const defaultLanguage = 'en';

const buildDir = path.join(__dirname, 'multilang-build');

// 处理根路由 - 默认显示英文版本（必须在静态文件服务之前）
app.get('/', (req, res) => {
    const indexPath = path.join(buildDir, 'en', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.redirect('/en/');
    }
});

// 静态文件服务 - 提供multilang-build目录中的文件（放在特定路由后面）
app.use(express.static(buildDir));

// 处理语言选择页面请求
app.get('/select-language', (req, res) => {
    const languagePagePath = path.join(buildDir, 'index.html');
    if (fs.existsSync(languagePagePath)) {
        res.sendFile(languagePagePath);
    } else {
        res.redirect('/en/');
    }
});

// 语言选择页面路由
app.get('/languages', (req, res) => {
    const indexPath = path.join(buildDir, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.redirect('/en/');
    }
});

// 处理语言首页路由 /:lang/
app.get('/:lang/', (req, res) => {
    const lang = req.params.lang;
    if (supportedLanguages.includes(lang)) {
        const filePath = path.join(buildDir, lang, 'index.html');
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.redirect(`/${defaultLanguage}/`);
        }
    } else {
        res.redirect(`/${defaultLanguage}/`);
    }
});

// 处理语言首页路由 /:lang (无尾部斜杠)
app.get('/:lang', (req, res) => {
    const lang = req.params.lang;
    if (supportedLanguages.includes(lang)) {
        res.redirect(`/${lang}/`);
    } else {
        res.sendFile(path.join(buildDir, req.params.lang));
    }
});

// 处理旧的设备页面路由重定向 /devices/:page -> /en/devices/:page
app.get('/devices/:page', (req, res) => {
    const { page } = req.params;
    res.redirect(`/${defaultLanguage}/devices/${page}`);
});

// 处理设备页面路由 /:lang/devices/:page
app.get('/:lang/devices/:page', (req, res) => {
    const { lang, page } = req.params;
    if (supportedLanguages.includes(lang)) {
        const filePath = path.join(buildDir, lang, 'devices', page);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.redirect(`/${defaultLanguage}/devices/${page}`);
        }
    } else {
        res.status(404).send('Page not found');
    }
});

// 处理其他语言页面路由 /:lang/:page
app.get('/:lang/:page', (req, res) => {
    const { lang, page } = req.params;
    if (supportedLanguages.includes(lang)) {
        const filePath = path.join(buildDir, lang, page);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            // 如果多语言文件不存在，回退到根目录文件
            const rootFilePath = path.join(buildDir, page);
            if (fs.existsSync(rootFilePath)) {
                res.sendFile(rootFilePath);
            } else {
                res.redirect(`/${defaultLanguage}/${page}`);
            }
        }
    } else {
        // 如果不是支持的语言，尝试作为普通页面处理
        const filePath = path.join(buildDir, req.params.page);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('Page not found');
        }
    }
});

// 处理无语言前缀的页面请求
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(buildDir, page);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

// 404 错误处理
app.use((req, res) => {
    res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving files from: ${buildDir}`);
    console.log(`Supported languages: ${supportedLanguages.join(', ')}`);
    console.log(`Default language: ${defaultLanguage}`);
}); 