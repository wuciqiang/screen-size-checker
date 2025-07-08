const fs = require('fs');
const path = require('path');
const ComponentBuilder = require('./component-builder');

class MultiLangBuilder extends ComponentBuilder {
    constructor() {
        super();
        this.supportedLanguages = ['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it'];
        this.defaultLanguage = 'en';
        this.translations = new Map();
        this.loadTranslations();
    }
    
    loadTranslations() {
        console.log('\n🌍 Loading translations...');
        
        this.supportedLanguages.forEach(lang => {
            try {
                const translationPath = path.join(this.rootPath, 'locales', lang, 'translation.json');
                if (fs.existsSync(translationPath)) {
                    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
                    this.translations.set(lang, translations);
                    console.log(`✅ Loaded ${lang} translations (${Object.keys(translations).length} keys)`);
                } else {
                    console.warn(`⚠️  Translation file not found: ${translationPath}`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${lang} translations:`, error.message);
            }
        });
    }
    
    // 处理翻译替换
    translateContent(content, translations) {
        if (!translations) return content;
        
        // 修复meta description标签的HTML结构错误
        let result = content;
        
        // 查找并修复破坏的meta description标签
        result = result.replace(/<meta\s+name="description"[^>]*content="([^"]*)"[^>]*>([^<]*?)<meta\s+name="keywords"/g, (match, contentValue, extraText) => {
            console.log('🔧 Fixing broken meta description tag');
            if (extraText.trim()) {
                console.log('📝 Removing extra text:', extraText.trim());
            }
            return `<meta name="description" data-i18n="description" content="${contentValue}">
<meta name="keywords"`;
        });
        
        // 替换 data-i18n 属性对应的文本内容（处理标签内容）
        result = result.replace(/data-i18n="([^"]+)"[^>]*>([^<]*)</g, (match, key, originalText) => {
            const translation = translations[key];
            if (translation) {
                // console.log(`🔄 Translating: "${key}" -> "${translation}"`); // 已注释减少构建日志输出
                return match.replace(originalText, translation);
            }
            return match;
        });
        
        // 替换模板变量如 {{t:key}}
        result = result.replace(/\{\{t:(\w+)\}\}/g, (match, key) => {
            return translations[key] || match;
        });
        
        return result;
    }
    
    // 生成多语言页面
    buildMultiLangPages() {
        console.log('\n🌐 Starting multi-language build...');
        
        try {
            // 读取页面配置
            const configPath = path.join(this.rootPath, 'build', 'pages-config.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // 创建多语言输出目录
            const multiLangDir = path.join(this.rootPath, 'multilang-build');
            if (fs.existsSync(multiLangDir)) {
                // 使用更兼容的删除方法
                try {
                    this.removeDirectoryRecursive(multiLangDir);
                } catch (error) {
                    console.warn('⚠️  Failed to remove existing directory, continuing...');
                }
            }
            fs.mkdirSync(multiLangDir, { recursive: true });
            
            // 复制静态资源文件
            this.copyStaticResources(multiLangDir);
            
            let totalPages = 0;
            let successPages = 0;
            
            // 为每种语言构建所有页面
            for (const lang of this.supportedLanguages) {
                console.log(`\n📁 Building ${lang.toUpperCase()} pages...`);
                
                const translations = this.translations.get(lang);
                if (!translations) {
                    console.warn(`⚠️  Skipping ${lang} - no translations available`);
                    continue;
                }
                
                // 创建语言目录
                const langDir = path.join(multiLangDir, lang);
                fs.mkdirSync(langDir, { recursive: true });
                
                // 创建设备子目录
                const devicesDir = path.join(langDir, 'devices');
                fs.mkdirSync(devicesDir, { recursive: true });
                
                // 构建该语言的所有页面
                for (const page of config.pages) {
                    totalPages++;
                    
                    try {
                        console.log(`  📄 Building ${lang}/${page.output}`);
                        
                        // 准备页面数据并调整路径
                        const pageData = {
                            lang: lang,
                            page_content: page.page_content,
                            ...page.config
                        };
                        
                        // 从翻译文件中获取页面特定的翻译值
                        if (pageData.page_title_key && translations[pageData.page_title_key]) {
                            pageData.page_title = translations[pageData.page_title_key];
                        }
                        if (pageData.page_heading_key && translations[pageData.page_heading_key]) {
                            pageData.page_heading = translations[pageData.page_heading_key];
                        }
                        if (pageData.page_intro_key && translations[pageData.page_intro_key]) {
                            pageData.page_intro = translations[pageData.page_intro_key];
                        }
                        // 修正description注入逻辑，优先用translations['description']，不被page_description_key覆盖：
                        if (translations['description']) {
                            pageData.description = translations['description'];
                        } else if (pageData.page_description_key && translations[pageData.page_description_key]) {
                            pageData.description = translations[pageData.page_description_key];
                        } else {
                            pageData.description = '';
                        }
                        
                        // 调整静态资源路径为相对于语言目录的路径
                        const depth = page.output.split('/').length - 1;
                        const prefix = '../'.repeat(depth + 1);
                        
                        // 更新路径变量 - 所有路径都需要相对于语言目录调整
                        console.log(`    🔧 Original paths: css=${pageData.css_path}, js=${pageData.js_path}, locales=${pageData.locales_path}`);
                        
                        if (pageData.css_path) {
                            const oldPath = pageData.css_path;
                            pageData.css_path = prefix + pageData.css_path.replace(/^\.\.\//, '');
                            console.log(`    🎨 CSS: ${oldPath} -> ${pageData.css_path}`);
                        }
                        if (pageData.js_path) {
                            const oldPath = pageData.js_path;
                            pageData.js_path = prefix + pageData.js_path.replace(/^\.\.\//, '');
                            console.log(`    📜 JS: ${oldPath} -> ${pageData.js_path}`);
                        }
                        if (pageData.locales_path) {
                            const oldPath = pageData.locales_path;
                            pageData.locales_path = prefix + pageData.locales_path.replace(/^\.\.\//, '');
                            console.log(`    🌍 Locales: ${oldPath} -> ${pageData.locales_path}`);
                        }
                        if (pageData.home_url) {
                            // 对于多语言版本，home_url应该指向当前语言的首页
                            if (page.output === 'index.html') {
                                // 如果是首页，home_url指向自身
                                pageData.home_url = 'index.html';
                            } else {
                                // 如果是子页面，home_url指向当前语言目录的首页
                                pageData.home_url = '../index.html';
                            }
                        }
                        if (pageData.privacy_policy_url) {
                            pageData.privacy_policy_url = pageData.privacy_policy_url.startsWith('../') 
                                ? '../'.repeat(depth + 1) + pageData.privacy_policy_url.substring(3)
                                : prefix + pageData.privacy_policy_url;
                        }
                        
                        // 更新语言相关的URL和路径
                        pageData.canonical_url = pageData.canonical_url.replace(
                            'https://screensizechecker.com/',
                            `https://screensizechecker.com/${lang}/`
                        );
                        
                        // 移除.html后缀以匹配Cloudflare Pages的URL格式
                        pageData.canonical_url = pageData.canonical_url.replace(/\.html$/, '');
                        pageData.og_url = pageData.canonical_url;
                        
                        // 构建HTML
                        let html = this.buildPage(page.template, pageData);
                        
                        // 应用翻译
                        html = this.translateContent(html, translations);
                        
                        // 修复HTML结构错误 - 移除meta标签后的重复文字
                        html = html.replace(/<meta name="description"[^>]*content="([^"]*)"[^>]*>([^<]*)<meta name="keywords"/g, (match, contentValue, extraText) => {
                            if (extraText && extraText.trim()) {
                                console.log('📝 Fixed meta description duplicate text');
                                return `<meta name="description" data-i18n="description" content="${contentValue}">
<meta name="keywords"`;
                            }
                            return match;
                        });
                        
                        // 更新HTML lang属性
                        html = html.replace('<html lang="en">', `<html lang="${lang}">`);
                        
                        // 静态资源路径已通过路径变量调整正确处理，不需要额外修复
                        // html = this.fixStaticResourcePaths(html, page.output);
                        
                        // 写入文件
                        const outputPath = path.join(langDir, page.output);
                        fs.writeFileSync(outputPath, html);
                        
                        successPages++;
                        console.log(`    ✅ ${lang}/${page.output}`);
                        
                    } catch (error) {
                        console.error(`    ❌ Failed to build ${lang}/${page.name}:`, error.message);
                    }
                }
            }
            
            // 生成语言索引页面
            this.generateLanguageIndex(multiLangDir);
            
            // 生成多语言网站地图
            this.generateMultiLanguageSitemap(multiLangDir);
            
            console.log(`\n📊 Multi-language build completed:`);
            console.log(`🌍 Languages: ${this.supportedLanguages.length}`);
            console.log(`📄 Total pages: ${totalPages}`);
            console.log(`✅ Successful: ${successPages}/${totalPages}`);
            console.log(`📁 Output directory: multilang-build/`);
            
            // 生成构建报告
            this.generateBuildReport(multiLangDir, successPages, totalPages);
            
            return successPages === totalPages;
            
        } catch (error) {
            console.error('❌ Multi-language build failed:', error.message);
            return false;
        }
    }
    
    // 递归删除目录（兼容性方法）
    removeDirectoryRecursive(dirPath) {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    this.removeDirectoryRecursive(filePath);
                } else {
                    fs.unlinkSync(filePath);
                }
            });
            
            fs.rmdirSync(dirPath);
        }
    }

    // 复制静态资源文件
    copyStaticResources(outputDir) {
        console.log('\n📦 Copying static resources...');
        
        const resourcesToCopy = [
            { source: 'css', dest: 'css' },
            { source: 'js', dest: 'js' },
            { source: 'locales', dest: 'locales' },
            { source: 'favicon.ico', dest: 'favicon.ico' },
            { source: 'favicon.png', dest: 'favicon.png' },
            { source: 'robots.txt', dest: 'robots.txt' },
            { source: 'ads.txt', dest: 'ads.txt' },
            { source: 'privacy-policy.html', dest: 'privacy-policy.html' },
            { source: 'structured-data.json', dest: 'structured-data.json' },
            { source: 'googlec786a02f43170c4d.html', dest: 'googlec786a02f43170c4d.html' },
            { source: '_redirects', dest: '_redirects' }
        ];
        
        resourcesToCopy.forEach(({ source, dest }) => {
            const sourcePath = path.join(this.rootPath, source);
            const destPath = path.join(outputDir, dest);
            
            if (fs.existsSync(sourcePath)) {
                try {
                    if (fs.statSync(sourcePath).isDirectory()) {
                        // 复制目录
                        this.copyDirectory(sourcePath, destPath);
                        console.log(`  ✅ Copied directory: ${source}`);
                    } else {
                        // 复制文件
                        fs.copyFileSync(sourcePath, destPath);
                        console.log(`  ✅ Copied file: ${source}`);
                    }
                } catch (error) {
                    console.warn(`  ⚠️  Failed to copy ${source}:`, error.message);
                }
            } else {
                console.warn(`  ⚠️  Resource not found: ${source}`);
            }
        });
        
        console.log('📦 Static resources copied successfully!');
    }
    
    // 递归复制目录
    copyDirectory(source, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const items = fs.readdirSync(source);
        
        items.forEach(item => {
            const sourcePath = path.join(source, item);
            const destPath = path.join(dest, item);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                this.copyDirectory(sourcePath, destPath);
            } else {
                fs.copyFileSync(sourcePath, destPath);
            }
        });
    }
    
    // 修复静态资源路径
    fixStaticResourcePaths(html, outputPath) {
        // 计算相对路径深度
        const depth = outputPath.split('/').length - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        
        // 修复CSS路径 - 只处理main.css
        html = html.replace(
            /href="css\/main\.css"/g,
            `href="${prefix}css/main.css"`
        );
        html = html.replace(
            /href="\.\.\/css\/main\.css"/g,
            `href="${prefix}css/main.css"`
        );
        
        // 修复JavaScript路径 - 保持模块化结构
        html = html.replace(
            /src="js\/app\.js"/g,
            `src="${prefix}js/app.js"`
        );
        html = html.replace(
            /src="\.\.\/js\/app\.js"/g,
            `src="${prefix}js/app.js"`
        );
        // Legacy script.js support (if any old references exist)
        html = html.replace(
            /src="script\.js"/g,
            `src="${prefix}script.js"`
        );
        html = html.replace(
            /src="\.\.\/script\.js"/g,
            `src="${prefix}script.js"`
        );
        
        // 修复翻译文件路径
        html = html.replace(
            /href="locales\/en\/translation\.json"/g,
            `href="${prefix}locales/en/translation.json"`
        );
        html = html.replace(
            /href="locales\/zh\/translation\.json"/g,
            `href="${prefix}locales/zh/translation.json"`
        );
        html = html.replace(
            /href="\.\.\/locales\/en\/translation\.json"/g,
            `href="${prefix}locales/en/translation.json"`
        );
        html = html.replace(
            /href="\.\.\/locales\/zh\/translation\.json"/g,
            `href="${prefix}locales/zh/translation.json"`
        );
        
        // 修复导航链接
        html = html.replace(
            /href="index\.html"/g,
            depth > 0 ? `href="../index.html"` : `href="index.html"`
        );
        html = html.replace(
            /href="\.\.\/index\.html"/g,
            depth > 1 ? `href="${'../'.repeat(depth-1)}index.html"` : `href="index.html"`
        );
        
        // 修复设备页面链接
        html = html.replace(
            /href="devices\//g,
            depth > 0 ? `href="../devices/` : `href="devices/`
        );
        
        // 修复隐私政策链接
        html = html.replace(
            /href="privacy-policy\.html"/g,
            depth > 0 ? `href="../privacy-policy.html"` : `href="privacy-policy.html"`
        );
        html = html.replace(
            /href="\.\.\/privacy-policy\.html"/g,
            depth > 1 ? `href="${'../'.repeat(depth-1)}privacy-policy.html"` : `href="privacy-policy.html"`
        );
        
        return html;
    }
    
    // 生成语言选择索引页面
    generateLanguageIndex(outputDir) {
        console.log('\n📋 Generating language selection and redirect pages...');
        
        // 定义已启用的语言（只有英文和中文）
        const enabledLanguages = ['en', 'zh'];
        
        // 1. 生成根目录重定向页面（直接跳转到英文）
        const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screen Size Checker - Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=/en/index.html">
    <link rel="canonical" href="/en/index.html">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            text-align: center;
            background-color: #f8f9fa;
        }
        .loading {
            color: #007bff;
            font-size: 1.2em;
            margin-top: 50px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .manual-link {
            margin-top: 30px;
        }
        .manual-link a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }
        .manual-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>🌍 Screen Size Checker</h1>
    <div class="loading">Redirecting to English version...</div>
    <div class="spinner"></div>
    <div class="manual-link">
        <p>If you are not redirected automatically, <a href="/en/index.html">click here for English</a> or <a href="/select-language.html">choose your language</a>.</p>
    </div>
    
    <script>
        // 立即重定向到英文页面
        window.location.href = '/en/index.html';
    </script>
</body>
</html>`;
        
        fs.writeFileSync(path.join(outputDir, 'index.html'), redirectHtml);
        console.log('✅ Root redirect page created (redirects to English)');
        
        // 2. 生成语言选择页面到 select-language.html
        // 语言配置
        const languageConfigs = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'zh', name: '中文', flag: '🇨🇳' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺' },
            { code: 'pt', name: 'Português', flag: '🇵🇹' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹' }
        ];
        
        // 生成语言卡片HTML
        const languageCards = languageConfigs.map(lang => {
            const isEnabled = enabledLanguages.includes(lang.code);
            
            if (isEnabled) {
                return `        <a href="${lang.code}/index.html" class="language-card">
            <div class="flag">${lang.flag}</div>
            <div class="lang-name">${lang.name}</div>
            <div class="lang-code">${lang.code}</div>
        </a>`;
            } else {
                return `        <div class="language-card disabled">
            <div class="flag">${lang.flag}</div>
            <div class="lang-name">${lang.name}</div>
            <div class="lang-code">${lang.code}</div>
        </div>`;
            }
        }).join('\n');
        
        const languageSelectionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screen Size Checker - Language Selection</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .language-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px; }
        .language-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; text-decoration: none; color: #333; transition: all 0.3s; position: relative; }
        .language-card:hover { border-color: #007bff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,123,255,0.15); }
        .language-card.disabled { 
            background-color: #f8f9fa; 
            color: #6c757d; 
            border-color: #e9ecef; 
            cursor: not-allowed; 
            opacity: 0.6;
        }
        .language-card.disabled:hover { 
            border-color: #e9ecef; 
            transform: none; 
            box-shadow: none; 
        }
        .language-card.disabled .flag { opacity: 0.5; }
        .language-card.disabled::after {
            content: "即将推出";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(108, 117, 125, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            white-space: nowrap;
        }
        .flag { font-size: 2em; margin-bottom: 10px; }
        .lang-name { font-weight: bold; margin-bottom: 5px; }
        .lang-code { color: #666; font-size: 0.9em; }
        h1 { text-align: center; color: #333; }
        .subtitle { text-align: center; color: #666; margin-bottom: 40px; }
        .note { text-align: center; color: #6c757d; margin-top: 30px; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>🌍 Screen Size Checker</h1>
    <p class="subtitle">Choose your language / 选择您的语言</p>
    
    <div class="language-grid">
${languageCards}
    </div>
    
    <p class="note">💡 其他语言版本正在翻译中，敬请期待！<br>Other language versions are being translated, stay tuned!</p>
    
    <script>
        // 自动语言检测和重定向（仅限已启用的语言）
        function detectAndRedirect() {
            const userLang = navigator.language || navigator.userLanguage;
            const langCode = userLang.split('-')[0];
            const availableLangs = ${JSON.stringify(enabledLanguages)}; // 仅已启用的语言
            
            if (availableLangs.includes(langCode)) {
                const targetUrl = langCode + '/index.html';
                console.log('Auto-redirecting to:', targetUrl);
                // window.location.href = targetUrl; // 取消注释以启用自动重定向
            } else {
                // 如果用户语言不在可用列表中，默认跳转到英文
                console.log('Language not available, defaulting to English');
                // window.location.href = 'en/index.html'; // 取消注释以启用自动重定向
            }
        }
        
        // detectAndRedirect(); // 取消注释以启用自动语言检测
    </script>
</body>
</html>`;
        
        fs.writeFileSync(path.join(outputDir, 'select-language.html'), languageSelectionHtml);
        console.log('✅ Language selection page created at select-language.html');
    }

    // 生成多语言网站地图
    generateMultiLanguageSitemap(outputDir) {
        console.log('\n🗺️ Generating multilingual sitemap...');
        
        const currentDate = new Date().toISOString().split('T')[0];
        const baseUrl = 'https://screensizechecker.com';
        
        // 定义页面结构（无.html后缀，匹配Cloudflare Pages的URL格式）
        const pages = [
            { path: '', priority: '1.0', changefreq: 'weekly' },
            { path: '/devices/iphone-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/ipad-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/android-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/compare', priority: '0.9', changefreq: 'monthly' }
        ];
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        
        // 添加根路径（重定向到英文）
        sitemapContent += `
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>`;
        
        // 添加语言选择页面
        sitemapContent += `
    <url>
        <loc>${baseUrl}/select-language</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        
        // 为每种语言生成URL
        this.supportedLanguages.forEach(lang => {
            pages.forEach(page => {
                if (page.path === '') {
                    // 语言首页
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                } else {
                    // 其他页面
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                }
            });
        });
        
        // 添加隐私政策页面
        sitemapContent += `
    <url>
        <loc>${baseUrl}/privacy-policy</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        
        sitemapContent += `
</urlset>`;
        
        fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapContent);
        console.log('✅ Multilingual sitemap generated');
        console.log(`   📄 Total URLs: ${this.supportedLanguages.length * pages.length + 2}`);
    }
    
    // 生成构建报告
    generateBuildReport(outputDir, successPages, totalPages) {
        const report = {
            buildTime: new Date().toISOString(),
            languages: this.supportedLanguages.length,
            totalPages: totalPages,
            successfulPages: successPages,
            successRate: ((successPages / totalPages) * 100).toFixed(2) + '%',
            outputDirectory: 'multilang-build/',
            languageStructure: {}
        };
        
        // 收集每种语言的页面信息
        this.supportedLanguages.forEach(lang => {
            const langDir = path.join(outputDir, lang);
            if (fs.existsSync(langDir)) {
                const files = this.getAllFiles(langDir);
                report.languageStructure[lang] = {
                    pages: files.length,
                    files: files.map(f => path.relative(langDir, f))
                };
            }
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'build-report.json'), 
            JSON.stringify(report, null, 2)
        );
        
        console.log('📋 Build report saved: multilang-build/build-report.json');
    }
    
    // 递归获取目录下所有文件
    getAllFiles(dirPath) {
        const files = [];
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...this.getAllFiles(fullPath));
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        });
        
        return files;
    }
}

// Helper function to get correct relative path for static resources
function getStaticResourcePath(targetPath, resourcePath) {
    const depth = targetPath.split('/').filter(p => p !== '').length - 1;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    return prefix + resourcePath;
}

// Updated processTemplate function to handle static resource paths
function processTemplate(templatePath, config, lang) {
    let content = fs.readFileSync(templatePath, 'utf8');
    
    // Replace static resource paths based on page depth
    const staticResourcePaths = {
        'css/main.css': getStaticResourcePath(config.path, 'css/main.css'),
        'js/app.js': getStaticResourcePath(config.path, 'js/app.js'), // Use modular js/app.js
        'locales/en/translation.json': getStaticResourcePath(config.path, 'locales/en/translation.json'),
        'locales/zh/translation.json': getStaticResourcePath(config.path, 'locales/zh/translation.json'),
    };
    
    // Replace static resource paths in the content
    for (const [oldPath, newPath] of Object.entries(staticResourcePaths)) {
        content = content.replace(new RegExp(oldPath, 'g'), newPath);
    }
    
    // ... existing code ...
}

// 如果直接运行此脚本，执行多语言构建
if (require.main === module) {
    const builder = new MultiLangBuilder();
    
    if (builder.validateComponents()) {
        builder.buildMultiLangPages();
    }
}

module.exports = MultiLangBuilder; 