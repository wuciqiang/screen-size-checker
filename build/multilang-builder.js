const fs = require('fs');
const path = require('path');
const ComponentBuilder = require('./component-builder');
const BlogBuilder = require('./blog-builder');
const { TranslationValidator } = require('./translation-validator');
const InternalLinksProcessor = require('./internal-links-processor');

class MultiLangBuilder extends ComponentBuilder {
    constructor() {
        super();
        this.supportedLanguages = ['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it'];
        this.defaultLanguage = 'en';
        this.translations = new Map();
        this.internalLinksProcessor = new InternalLinksProcessor();
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
    
    // 获取嵌套的翻译值，支持如 "ppiCalculator.pageTitle" 这样的键
    getNestedTranslation(translations, key) {
        if (!key || !translations) return null;
        
        const keys = key.split('.');
        let current = translations;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && current.hasOwnProperty(k)) {
                current = current[k];
            } else {
                return null;
            }
        }
        
        return typeof current === 'string' ? current : null;
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
            // 特殊处理：如果是title标签，完全跳过翻译处理，保持页面特定的标题
            if (key === 'title') {
                // 检查是否是title标签
                const beforeMatch = result.substring(0, result.indexOf(match));
                const lastTitleIndex = beforeMatch.lastIndexOf('<title');
                const lastCloseTitleIndex = beforeMatch.lastIndexOf('</title>');
                
                // 如果最近的<title标签在最近的</title>标签之后，说明这是title标签内容
                if (lastTitleIndex > lastCloseTitleIndex) {
                    console.log(`  🚫 Skipping title translation for: "${originalText}"`);
                    return match;
                }
            }
            
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                return match.replace(originalText, translation);
            }
            return match;
        });
        
        // 替换模板变量如 {{t:key}}
        result = result.replace(/\{\{t:(\w+)\}\}/g, (match, key) => {
            return this.getNestedTranslation(translations, key) || match;
        });
        
        return result;
    }
    
    // 运行翻译验证
    async runTranslationValidation() {
        console.log('\n🔍 Validating translations...');
        
        try {
            const validator = new TranslationValidator();
            const result = await validator.runValidation({
                componentsDir: 'components',
                localesDir: 'locales',
                languages: ['en', 'zh'],
                outputPath: 'build/translation-validation-report.json'
            });
            
            if (!result.success) {
                console.error('❌ Translation validation failed:', result.error);
                return { success: false, error: result.error };
            }
            
            if (result.hasErrors) {
                console.warn('⚠️  Translation validation found issues, but continuing build...');
                console.warn(`   Missing translations: ${result.report.summary.missingTranslations}`);
                console.warn(`   Inconsistent keys: ${result.report.summary.inconsistentKeys}`);
            } else {
                console.log('✅ Translation validation passed');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Translation validation error:', error);
            return { success: false, error: error.message };
        }
    }

    // 生成多语言页面
    buildMultiLangPages() {
        console.log('\n🌐 Building multilingual pages...');
        
        // 处理内链配置
        const internalLinksResult = this.internalLinksProcessor.process(this.translations);
        if (!internalLinksResult.success) {
            console.error('❌ Internal links processing failed, continuing with build...');
        }
        
        // 只构建已启用的语言（英语和中文）
        const enabledLanguages = ['en', 'zh'];
        
        const config = JSON.parse(fs.readFileSync('build/pages-config.json', 'utf8'));
        let totalPages = 0;
        let successfulBuilds = 0;
        
        const buildReport = {
            timestamp: new Date().toISOString(),
            languages: enabledLanguages,
            pages: {},
            summary: {}
        };

        // 确保构建目录存在 - 完全清除并重新创建
        const outputDir = 'multilang-build';
        if (fs.existsSync(outputDir)) {
            // 删除整个目录 - 使用递归删除
            try {
                fs.rmSync(outputDir, { recursive: true, force: true });
                console.log('✅ Cleared existing build directory');
            } catch (error) {
                console.warn('⚠️  Warning: Could not remove existing directory:', error.message);
            }
        }
        fs.mkdirSync(outputDir, { recursive: true });

        // 为每种启用的语言构建页面
        for (const lang of enabledLanguages) {
            console.log(`\n📝 Building pages for language: ${lang.toUpperCase()}`);
            
            const langDir = path.join(outputDir, lang);
            fs.mkdirSync(langDir, { recursive: true });

            // 加载该语言的翻译文件
            const translationPath = path.join('locales', lang, 'translation.json');
            let translations = {};
            
            try {
                translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
                console.log(`  ✅ Loaded translations for ${lang}`);
            } catch (error) {
                console.warn(`  ⚠️  Warning: Could not load translations for ${lang}:`, error.message);
                continue; // 跳过没有翻译文件的语言
            }

            buildReport.pages[lang] = [];
            
            // 为该语言创建必要的子目录
            const deviceDir = path.join(langDir, 'devices');
            fs.mkdirSync(deviceDir, { recursive: true });
            
            // 构建该语言的所有页面
            for (const page of config.pages) {
                // 检查页面是否限制了特定语言
                if (page.enabled_languages && !page.enabled_languages.includes(lang)) {
                    continue; // 跳过不适用于当前语言的页面
                }
                
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
                    if (pageData.page_title_key) {
                        // 支持嵌套的翻译键，如 "ppiCalculator.pageTitle"
                        const translationValue = this.getNestedTranslation(translations, pageData.page_title_key);
                        if (translationValue) {
                            pageData.page_title = translationValue;
                        } else {
                            // 如果没有找到翻译，使用默认的og_title
                            pageData.page_title = pageData.og_title || 'Screen Size Checker';
                        }
                    } else {
                        pageData.page_title = pageData.og_title || 'Screen Size Checker';
                    }
                    
                    // 确保title变量也被设置（用于head.html组件）
                    pageData.title = pageData.page_title;
                    if (pageData.page_heading_key) {
                        const headingValue = this.getNestedTranslation(translations, pageData.page_heading_key);
                        if (headingValue) {
                            pageData.page_heading = headingValue;
                        }
                    }
                    if (pageData.page_intro_key) {
                        const introValue = this.getNestedTranslation(translations, pageData.page_intro_key);
                        if (introValue) {
                            pageData.page_intro = introValue;
                        }
                    }
                    // 修正description注入逻辑，支持嵌套翻译键
                    if (translations['description']) {
                        pageData.description = translations['description'];
                    } else if (pageData.page_description_key) {
                        const descriptionValue = this.getNestedTranslation(translations, pageData.page_description_key);
                        if (descriptionValue) {
                            pageData.description = descriptionValue;
                        } else {
                            pageData.description = pageData.og_description || '';
                        }
                    } else {
                        pageData.description = pageData.og_description || '';
                    }
                    
                    // 调整静态资源路径为相对于语言目录的路径
                    const depth = page.output.split('/').length - 1;
                    const prefix = depth > 0 ? '../'.repeat(depth) : '';
                    
                    // 正确更新资源路径 - 根据深度重新计算
                    if (depth === 0) {
                        // 主页 (index.html) - 在语言目录下
                        pageData.css_path = '../css';
                        pageData.locales_path = '../locales';
                        pageData.js_path = '../js';
                    } else {
                        // 子页面 - 根据实际深度计算路径
                        const pathPrefix = '../'.repeat(depth + 1);
                        pageData.css_path = pathPrefix + 'css';
                        pageData.locales_path = pathPrefix + 'locales';  
                        pageData.js_path = pathPrefix + 'js';
                    }
                    
                    // 更新相对链接路径 - 修复语言保持问题
                    if (pageData.home_url) {
                        // 计算回到当前语言根目录的路径
                        if (depth === 0) {
                            // 在语言根目录下，指向当前目录的index.html
                            pageData.home_url = 'index.html';
                        } else {
                            // 在子目录下，回到语言根目录
                            pageData.home_url = '../'.repeat(depth) + 'index.html';
                        }
                    }
                    
                    if (pageData.device_links_base) {
                        pageData.device_links_base = pageData.device_links_base.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.device_links_base.substring(3)
                            : (depth > 0 ? prefix + pageData.device_links_base : pageData.device_links_base);
                    }
                    
                    // 修复博客URL，确保指向当前语言的博客页面
                    if (pageData.blog_url) {
                        if (depth === 0) {
                            // 在语言根目录下，指向当前目录的blog
                            pageData.blog_url = 'blog/index.html';
                        } else {
                            // 在子目录下，回到语言根目录的blog
                            pageData.blog_url = '../'.repeat(depth) + 'blog/index.html';
                        }
                    }
                    
                    if (pageData.privacy_policy_url) {
                        pageData.privacy_policy_url = pageData.privacy_policy_url.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.privacy_policy_url.substring(3)
                            : prefix + pageData.privacy_policy_url;
                    }
                    
                    // 更新语言相关的URL和路径
                    // 检查URL是否已经包含语言路径，避免重复添加
                    if (!pageData.canonical_url.includes(`/${lang}/`)) {
                        pageData.canonical_url = pageData.canonical_url.replace(
                            'https://screensizechecker.com/',
                            `https://screensizechecker.com/${lang}/`
                        );
                    }
                    
                    // 移除.html后缀以匹配Cloudflare Pages的URL格式
                    pageData.canonical_url = pageData.canonical_url.replace(/\.html$/, '');
                    pageData.og_url = pageData.canonical_url;
                    
                    // 更新Open Graph数据以使用翻译后的内容
                    pageData.og_title = pageData.page_title || pageData.og_title;
                    pageData.og_description = pageData.description || pageData.og_description;
                    
                    // 添加hreflang相关数据
                    pageData.base_url = 'https://screensizechecker.com';
                    pageData.page_path = pageData.canonical_url.replace('https://screensizechecker.com/' + lang, '');
                    if (!pageData.page_path) {
                        pageData.page_path = '/';
                    }
                    
                    // 添加结构化数据
                    pageData.structured_data = this.generateStructuredData(pageData, lang);
                    
                    // 为responsive-tester页面添加FAQ结构化数据
                    if (page.name === 'responsive-tester') {
                        pageData.faq_structured_data = this.generateFAQStructuredData(lang);
                    } else {
                        pageData.faq_structured_data = '';
                    }
                    
                    // 构建HTML
                    let html = this.buildPage(page.template, pageData);
                    
                    // 应用翻译
                    html = this.translateContent(html, translations);
                    
                    // 处理内链
                    html = this.internalLinksProcessor.processPageLinks(html, page.name, lang);
                    
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
                    
                    // 修复静态资源路径 - 传递完整路径包含语言目录
                    const fullOutputPath = path.join(lang, page.output);
                    html = this.fixStaticResourcePaths(html, fullOutputPath);
                    
                    // 写入文件
                    const outputPath = path.join(langDir, page.output);
                    const outputDirPath = path.dirname(outputPath);
                    
                    if (!fs.existsSync(outputDirPath)) {
                        fs.mkdirSync(outputDirPath, { recursive: true });
                    }
                    
                    fs.writeFileSync(outputPath, html);
                    
                    console.log(`  ✅ Built: ${lang}/${page.output}`);
                    successfulBuilds++;
                    
                    buildReport.pages[lang].push({
                        name: page.name,
                        output: page.output,
                        status: 'success',
                        canonical_url: pageData.canonical_url
                    });
                    
                } catch (error) {
                    console.error(`  ❌ Failed to build ${lang}/${page.output}:`, error.message);
                    
                    buildReport.pages[lang].push({
                        name: page.name,
                        output: page.output,
                        status: 'failed',
                        error: error.message
                    });
                }
            }
        }

        // 更新 supportedLanguages 只包含启用的语言
        this.supportedLanguages = enabledLanguages;

        buildReport.summary = {
            totalPages,
            successfulBuilds,
            languages: enabledLanguages.length,
            enabledOnly: true
        };

        console.log(`\n📊 Build Summary:`);
        console.log(`   Languages: ${enabledLanguages.length} (enabled only)`);
        console.log(`   📄 Total pages: ${totalPages}`);
        console.log(`   ✅ Successful: ${successfulBuilds}/${totalPages}`);
        console.log(`   ❌ Failed: ${totalPages - successfulBuilds}/${totalPages}`);

        // 保存构建报告
        fs.writeFileSync(
            path.join(outputDir, 'build-report.json'),
            JSON.stringify(buildReport, null, 2)
        );

        // 复制静态资源（只复制需要的文件）
        this.copyRequiredStaticResources(outputDir);
        
        // 生成语言选择索引页面
        this.generateLanguageIndex(outputDir);
        
        // 生成多语言网站地图（只包含启用的语言）
        this.generateMultiLanguageSitemap(outputDir);

        return buildReport;
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

    // 复制必要的静态资源（避免复制未启用的语言目录）
    copyRequiredStaticResources(outputDir) {
        console.log('\n📦 Copying required static resources...');
        
        // 需要直接复制的资源（不包括robots.txt和_redirects，这些将动态生成）
        const resourcesToCopy = [
            'css',
            'js', 
            'locales',
            'favicon.ico',
            'favicon.png',
            'ads.txt',
            'structured-data.json',
            'privacy-policy.html',
            'googlec786a02f43170c4d.html'
        ];

        for (const resource of resourcesToCopy) {
            const sourcePath = path.join(this.rootPath, resource);
            const targetPath = path.join(outputDir, resource);
            
            if (fs.existsSync(sourcePath)) {
                try {
                    if (fs.statSync(sourcePath).isDirectory()) {
                        this.copyDirectoryRecursive(sourcePath, targetPath);
                        console.log(`  ✅ Copied directory: ${resource}`);
                    } else {
                        fs.copyFileSync(sourcePath, targetPath);
                        console.log(`  ✅ Copied file: ${resource}`);
                    }
                } catch (error) {
                    console.warn(`  ⚠️  Warning: Could not copy ${resource}:`, error.message);
                }
            } else {
                console.warn(`  ⚠️  Warning: ${resource} not found, skipping`);
            }
        }
        
        // 生成优化的_redirects和robots.txt文件
        this.generateRedirectsFile(outputDir);
        this.generateRobotsFile(outputDir);
    }

    // 递归复制目录
    copyDirectoryRecursive(source, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const items = fs.readdirSync(source);
        
        items.forEach(item => {
            const sourcePath = path.join(source, item);
            const destPath = path.join(dest, item);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                this.copyDirectoryRecursive(sourcePath, destPath);
            } else {
                fs.copyFileSync(sourcePath, destPath);
            }
        });
    }
    
    // 生成结构化数据
    generateStructuredData(pageData, lang) {
        const baseStructuredData = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": pageData.page_title || "Screen Size Checker",
            "url": pageData.canonical_url,
            "description": pageData.description || "Free online tool to check screen resolution, viewport size, device pixel ratio (DPR), operating system, browser version, and more.",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "inLanguage": lang,
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "author": {
                "@type": "Organization",
                "name": "Screen Size Checker",
                "url": "https://screensizechecker.com"
            },
            "browserRequirements": "Requires JavaScript. Requires HTML5.",
            "softwareVersion": "2.0.0",
            "featureList": [
                "Screen Resolution Detection",
                "Viewport Size Measurement", 
                "Device Pixel Ratio (DPR) Check",
                "Operating System Detection",
                "Browser Version Information",
                "Touch Support Detection",
                "User Agent String Display"
            ]
        };

        // 如果是博客页面，添加博客特定的结构化数据
        if (pageData.canonical_url.includes('/blog/') && !pageData.canonical_url.includes('/blog/category/') && !pageData.canonical_url.includes('/blog/tag/')) {
            // 这是一个具体的博客文章
            const blogStructuredData = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": pageData.page_title,
                "description": pageData.description,
                "url": pageData.canonical_url,
                "datePublished": "2025-07-19T00:00:00Z",
                "dateModified": "2025-07-19T00:00:00Z",
                "author": {
                    "@type": "Organization",
                    "name": "Screen Size Checker",
                    "url": "https://screensizechecker.com"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Screen Size Checker",
                    "url": "https://screensizechecker.com",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://screensizechecker.com/favicon.png"
                    }
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": pageData.canonical_url
                },
                "inLanguage": lang
            };
            return JSON.stringify(blogStructuredData, null, 2);
        }

        // 如果是博客索引页面
        if (pageData.canonical_url.includes('/blog') && !pageData.canonical_url.includes('/blog/')) {
            const blogIndexStructuredData = {
                "@context": "https://schema.org",
                "@type": "Blog",
                "name": pageData.page_title,
                "description": pageData.description,
                "url": pageData.canonical_url,
                "author": {
                    "@type": "Organization",
                    "name": "Screen Size Checker",
                    "url": "https://screensizechecker.com"
                },
                "publisher": {
                    "@type": "Organization", 
                    "name": "Screen Size Checker",
                    "url": "https://screensizechecker.com"
                },
                "inLanguage": lang
            };
            return JSON.stringify(blogIndexStructuredData, null, 2);
        }

        return JSON.stringify(baseStructuredData, null, 2);
    }

    // 生成FAQ结构化数据
    generateFAQStructuredData(lang) {
        const translations = this.translations.get(lang);
        if (!translations) return '';

        const faqStructuredData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": translations.faq_q1 || "Why can't some websites load in the tester?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": translations.faq_a1 || "Many websites set X-Frame-Options or Content-Security-Policy headers for security reasons, which prevent them from being loaded in iframes. This is a security measure to prevent clickjacking and other attacks. For these websites, you may need to use browser developer tools or other methods for testing."
                    }
                },
                {
                    "@type": "Question",
                    "name": translations.faq_q2 || "How does the website in the tester differ from real devices?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": translations.faq_a2 || "This tester primarily simulates different screen sizes but cannot fully replicate all features of real devices, such as touch interactions, device pixel ratios, or specific browser behaviors. For final testing, it's recommended to verify your designs on actual devices."
                    }
                },
                {
                    "@type": "Question",
                    "name": translations.faq_q3 || "How can I test specific media query breakpoints?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": translations.faq_a3 || "Use the custom size feature to input your media query breakpoint values. For example, if you have a breakpoint at 768px width, you can input 767px and 768px to test layouts on both sides of the breakpoint."
                    }
                }
            ]
        };

        return `<script type="application/ld+json">
${JSON.stringify(faqStructuredData, null, 2)}
</script>`;
    }

    // 修复静态资源路径
    fixStaticResourcePaths(html, outputPath) {
        // 计算相对路径深度
        const depth = outputPath.split('/').length - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        
        // 注意：我们已经在构建过程中设置了正确的路径变量，
        // 这里只修复那些可能遗漏的硬编码路径
        
        // 修复任何遗留的硬编码CSS路径
        html = html.replace(
            /href="css\/main\.css"/g,
            `href="${prefix}css/main.css"`
        );
        
        // 修复任何遗留的硬编码JavaScript路径  
        html = html.replace(
            /src="js\/app\.js"/g,
            `src="${prefix}js/app.js"`
        );
        
        // 修复任何遗留的翻译文件路径
        html = html.replace(
            /href="locales\/en\/translation\.json"/g,
            `href="${prefix}locales/en/translation.json"`
        );
        html = html.replace(
            /href="locales\/zh\/translation\.json"/g,
            `href="${prefix}locales/zh/translation.json"`
        );
        
        return html;
    }
    
    // 生成语言选择索引页面
    generateLanguageIndex(outputDir) {
        console.log('\n📋 Generating language selection and redirect pages...');
        
        // 定义已启用的语言（只有英文和中文）
        const enabledLanguages = ['en', 'zh'];
        
        // 1. 生成根目录重定向页面（默认重定向到英文）
        const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screen Size Checker - Redirecting to English</title>
    <link rel="canonical" href="https://screensizechecker.com/en/">
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
        .language-options {
            margin-top: 30px;
        }
        .language-options a {
            display: inline-block;
            margin: 10px;
            padding: 10px 20px;
            color: #007bff;
            text-decoration: none;
            border: 2px solid #007bff;
            border-radius: 5px;
            font-weight: bold;
        }
        .language-options a:hover {
            background-color: #007bff;
            color: white;
        }
    </style>
</head>
<body>
    <h1>🌍 Screen Size Checker</h1>
    <div class="loading">Redirecting to English version...</div>
    <div class="spinner"></div>
    <div class="language-options">
        <p>If you are not redirected automatically:</p>
        <a href="/en/">English (Default)</a>
        <a href="/zh/">中文</a>
        <a href="/select-language.html">More Languages</a>
    </div>
    
    <script>
        // 默认重定向到英文页面
        function redirectToEnglish() {
            // 直接重定向到英文页面，不进行语言检测
            window.location.href = '/en/';
        }
        
        // 页面加载后立即重定向到英文
        window.addEventListener('load', redirectToEnglish);
        
        // 备用重定向（防止JavaScript被禁用）
        setTimeout(redirectToEnglish, 500);
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

    // 生成多语言网站地图（只包含启用的语言）
    generateMultiLanguageSitemap(outputDir) {
        console.log('\n🗺️ Generating multilingual sitemap (enabled languages only)...');
        
        const currentDate = new Date().toISOString().split('T')[0];
        const baseUrl = 'https://screensizechecker.com';
        const enabledLanguages = ['en', 'zh']; // 只包含启用的语言
        
        // 定义页面结构（无.html后缀，匹配Cloudflare Pages的URL格式）
        const pages = [
            { path: '', priority: '1.0', changefreq: 'weekly' },
            { path: '/devices/iphone-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/ipad-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/android-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/compare', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/standard-resolutions', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/responsive-tester', priority: '0.9', changefreq: 'monthly' }
        ];
        
        // 定义博客页面结构
        const blogPages = [
            { path: '/blog', priority: '0.9', changefreq: 'weekly' },
            { path: '/blog/device-pixel-ratio', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/media-queries-essentials', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/viewport-basics', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/category/technical', priority: '0.7', changefreq: 'monthly' },
            { path: '/blog/category/css', priority: '0.7', changefreq: 'monthly' },
            { path: '/blog/category/basics', priority: '0.7', changefreq: 'monthly' },
            { path: '/blog/tag/dpr', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/pixel-density', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/retina-display', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/responsive-design', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/media-queries', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/css', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/breakpoints', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/viewport', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/web-development', priority: '0.6', changefreq: 'monthly' }
        ];
        
        // 中文特有的标签页面
        const zhBlogPages = [
            { path: '/blog/tag/像素密度', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/响应式设计', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/媒体查询', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/断点', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/视网膜显示', priority: '0.6', changefreq: 'monthly' }
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
        
        // 只为启用的语言生成URL
        enabledLanguages.forEach(lang => {
            // 添加基础页面
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
            
            // 添加博客页面
            blogPages.forEach(page => {
                sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
            });
            
            // 为中文添加特有的标签页面
            if (lang === 'zh') {
                zhBlogPages.forEach(page => {
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                });
            }
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
        
        const totalUrls = 3 + (enabledLanguages.length * (pages.length + blogPages.length)) + zhBlogPages.length;
        console.log('✅ Multilingual sitemap generated (enabled languages only)');
        console.log(`   📄 Total URLs: ${totalUrls}`);
        console.log(`   🌍 Languages included: ${enabledLanguages.join(', ')}`);
        console.log(`   📝 Blog pages included: ${blogPages.length} common + ${zhBlogPages.length} Chinese-specific`);
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
    
    // 生成优化的_redirects文件
    generateRedirectsFile(outputDir) {
        console.log('\n🔄 Generating optimized _redirects file...');
        
        const redirectsContent = `# Cloudflare Pages 重定向配置文件
# 简化版本 - 避免重定向循环

# ===== 根目录重定向 =====
/ /en/ 302
/index.html /en/ 301

# ===== 旧URL重定向到新URL（带.html后缀的重定向到无后缀）=====
/devices/iphone-viewport-sizes.html /en/devices/iphone-viewport-sizes 301
/devices/ipad-viewport-sizes.html /en/devices/ipad-viewport-sizes 301
/devices/android-viewport-sizes.html /en/devices/android-viewport-sizes 301
/devices/compare.html /en/devices/compare 301
/devices/standard-resolutions.html /en/devices/standard-resolutions 301
/devices/responsive-tester.html /en/devices/responsive-tester 301

/en/devices/iphone-viewport-sizes.html /en/devices/iphone-viewport-sizes 301
/en/devices/ipad-viewport-sizes.html /en/devices/ipad-viewport-sizes 301
/en/devices/android-viewport-sizes.html /en/devices/android-viewport-sizes 301
/en/devices/compare.html /en/devices/compare 301
/en/devices/standard-resolutions.html /en/devices/standard-resolutions 301
/en/devices/responsive-tester.html /en/devices/responsive-tester 301

/zh/devices/iphone-viewport-sizes.html /zh/devices/iphone-viewport-sizes 301
/zh/devices/ipad-viewport-sizes.html /zh/devices/ipad-viewport-sizes 301
/zh/devices/android-viewport-sizes.html /zh/devices/android-viewport-sizes 301
/zh/devices/compare.html /zh/devices/compare 301
/zh/devices/standard-resolutions.html /zh/devices/standard-resolutions 301
/zh/devices/responsive-tester.html /zh/devices/responsive-tester 301

# ===== 博客页面重定向 =====
/en/blog/index.html /en/blog 301
/zh/blog/index.html /zh/blog 301
/en/blog/device-pixel-ratio.html /en/blog/device-pixel-ratio 301
/en/blog/media-queries-essentials.html /en/blog/media-queries-essentials 301
/en/blog/viewport-basics.html /en/blog/viewport-basics 301
/zh/blog/device-pixel-ratio.html /zh/blog/device-pixel-ratio 301
/zh/blog/media-queries-essentials.html /zh/blog/media-queries-essentials 301
/zh/blog/viewport-basics.html /zh/blog/viewport-basics 301

# ===== 语言版本重定向 =====
/en/index.html /en/ 301
/zh/index.html /zh/ 301

# ===== 其他页面重定向 =====
/privacy-policy.html /privacy-policy 301
/terms-of-service.html /privacy-policy 301
/terms-of-service /privacy-policy 301

# ===== 旧路径重定向 =====
/devices/ /en/devices/compare 301
/devices /en/devices/compare 301`;

        fs.writeFileSync(path.join(outputDir, '_redirects'), redirectsContent);
        console.log('✅ Generated simplified _redirects file');
    }
    
    // 生成优化的robots.txt文件
    generateRobotsFile(outputDir) {
        console.log('\n🤖 Generating optimized robots.txt file...');
        
        const robotsContent = `# robots.txt for screensizechecker.com
# Last updated: ${new Date().toISOString().split('T')[0]}

# Allow all crawlers
User-agent: *
Allow: /
Allow: /en/
Allow: /zh/
Allow: /css/
Allow: /js/
Allow: /locales/
Allow: /privacy-policy
Allow: /select-language

# Allow blog content
Allow: /en/blog/
Allow: /zh/blog/

# 禁止抓取未启用的语言版本
Disallow: /de/
Disallow: /es/
Disallow: /fr/
Disallow: /it/
Disallow: /ja/
Disallow: /ko/
Disallow: /pt/
Disallow: /ru/

# 禁止抓取构建目录和临时文件
Disallow: /build/
Disallow: /multilang-build/
Disallow: /node_modules/
Disallow: /.git/
Disallow: /.vscode/
Disallow: /.cursor/

# 网站地图
Sitemap: https://screensizechecker.com/sitemap.xml

# Crawl-delay for all bots
Crawl-delay: 5`;

        fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsContent);
        console.log('✅ Generated optimized robots.txt file');
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
    (async () => {
        const builder = new MultiLangBuilder();
        
        console.log('🚀 Starting integrated build process...');
        
        // Step 0: 运行翻译验证
        console.log('\n🔍 Step 0: Validating translations...');
        const validationResult = await builder.runTranslationValidation();
        
        if (!validationResult.success) {
            console.error('❌ Build failed due to translation validation errors');
            process.exit(1);
        }
        
        // 首先运行博客构建器
        console.log('\n📝 Step 1: Building blog system...');
        
        try {
            const blogBuilder = new BlogBuilder();
            blogBuilder.build();
            console.log('✅ Blog system build completed successfully!');
            
            // 重新加载组件，包括新生成的博客组件
            console.log('🔄 Reloading components after blog build...');
            builder.loadComponents();
            console.log('✅ Components reloaded successfully!');
        } catch (error) {
            console.error('❌ Blog build failed:', error.message);
            console.log('⚠️  Continuing with main build process...');
        }
        
        console.log('\n🌐 Step 2: Building multilingual pages...');
        if (builder.validateComponents()) {
            builder.buildMultiLangPages();
        }
    })().catch(error => {
        console.error('❌ Build process failed:', error);
        process.exit(1);
    });
}

module.exports = MultiLangBuilder; 