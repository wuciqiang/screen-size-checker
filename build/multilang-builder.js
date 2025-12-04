const fs = require('fs');
const path = require('path');
const ComponentBuilder = require('./component-builder');
const BlogBuilder = require('./blog-builder');
const HubBuilder = require('./hub-builder');
const { TranslationValidator } = require('./translation-validator');
const InternalLinksProcessor = require('./internal-links-processor');
const CriticalCSSExtractor = require('./critical-css-extractor');

class MultiLangBuilder extends ComponentBuilder {
    constructor() {
        super();
        this.supportedLanguages = ['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it'];
        this.defaultLanguage = 'en';
        this.enabledLanguages = ['en', 'zh', 'de', 'es']; // 当前启用的语言：英文、中文、德语、西班牙语
        this.translations = new Map();
        this.internalLinksProcessor = new InternalLinksProcessor();
        
        // 语言名称映射
        this.languageNames = {
            'en': 'English',
            'zh': '中文',
            'de': 'Deutsch',
            'es': 'Español',
            'fr': 'Français',
            'it': 'Italiano',
            'ja': '日本語',
            'ko': '한국어',
            'pt': 'Português',
            'ru': 'Русский'
        };
        
        // 语言代码大写映射（用于UI显示）
        this.languageCodes = {
            'en': 'EN',
            'zh': 'ZH',
            'de': 'DE',
            'es': 'ES',
            'fr': 'FR',
            'it': 'IT',
            'ja': 'JA',
            'ko': 'KO',
            'pt': 'PT',
            'ru': 'RU'
        };
        
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

    // 统一的博客URL生成函数 - 一劳永逸的解决方案
    generateBlogUrl(depth, lang, isRootPage = false) {
        console.log(`🔗 Generating blog URL: depth=${depth}, lang=${lang}, isRootPage=${isRootPage}`);

        // 英文（默认语言）在根路径，其他语言在语言子目录
        const isDefaultLang = lang === this.defaultLanguage;

        if (depth === 0) {
            // 在根目录或语言根目录
            if (isDefaultLang) {
                return 'blog/';
            } else {
                return 'blog/';
            }
        } else {
            // 在子目录中，需要回到根目录
            const backToRoot = '../'.repeat(depth);
            if (isDefaultLang) {
                // 英文：回到根路径后进入 blog/
                return `${backToRoot}blog/`;
            } else {
                // 其他语言：回到根路径后进入语言目录再进入 blog/
                // 但实际上现在已经在语言子目录中了，所以只需要回到语言根
                return `${backToRoot}blog/`;
            }
        }
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

    // 获取输出路径（英文输出到根目录，其他语言输出到对应目录）
    getOutputPath(pageOutput, lang) {
        if (lang === this.defaultLanguage) {
            // 英文输出到根目录
            return pageOutput;
        }
        // 其他语言输出到语言子目录
        return path.join(lang, pageOutput);
    }
    
    // 获取URL路径（英文无前缀，其他语言有前缀）
    getUrlPath(pagePath, lang) {
        if (lang === this.defaultLanguage) {
            return `/${pagePath.replace('.html', '')}`;
        }
        return `/${lang}/${pagePath.replace('.html', '')}`;
    }
    
    // 生成多语言页面
    buildMultiLangPages() {
        console.log('\n🌐 Building multilingual pages...');
        console.log('📝 URL结构变更：英文输出到根目录，其他语言保持语言前缀');
        
        // 处理内链配置
        const internalLinksResult = this.internalLinksProcessor.process(this.translations);
        if (!internalLinksResult.success) {
            console.error('❌ Internal links processing failed, continuing with build...');
        }
        
        // 使用类属性中定义的启用语言
        const enabledLanguages = this.enabledLanguages;
        
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
            
            // 英文输出到根目录，其他语言输出到语言子目录
            const langDir = lang === this.defaultLanguage ? outputDir : path.join(outputDir, lang);
            fs.mkdirSync(langDir, { recursive: true });
            
            if (lang === this.defaultLanguage) {
                console.log(`   ℹ️  English pages will be built at root directory`);
            } else {
                console.log(`   ℹ️  ${lang.toUpperCase()} pages will be built at /${lang}/ directory`);
            }

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
                    const outputPath = this.getOutputPath(page.output, lang);
                    console.log(`  📄 Building ${outputPath}`);
                    
                    // 准备页面数据并调整路径
                    const pageData = {
                        lang: lang,
                        lang_prefix: lang === this.defaultLanguage ? '' : `/${lang}`,
                        lang_code: lang.toUpperCase(),
                        page_content: page.page_content,
                        ...page.config
                    };
                    
                    // 添加导航状态标识
                    const pagePath = page.path || page.config.path || outputPath || '';
                    
                    pageData.is_home = pagePath === 'index.html' || pagePath === '';
                    pageData.is_blog = pagePath.includes('blog/') || pagePath.startsWith('blog');
                    
                    // 如果页面配置中已经设置了导航状态，使用配置的值
                    if (typeof page.config.is_gaming !== 'undefined') {
                        pageData.is_gaming = page.config.is_gaming;
                        pageData.is_tools = page.config.is_tools || false;
                        pageData.is_devices = page.config.is_devices || false;
                    } else {
                        // 区分 Tools 和 Devices（排除hub页面）
                        const isHubPage = pagePath.includes('hub/');
                        const isToolPage = !isHubPage && (pagePath.includes('calculator') || 
                            pagePath.includes('compare') || 
                            pagePath.includes('tester') || 
                            pagePath.includes('resolution'));
                        const isDevicePage = pagePath.includes('iphone') || 
                            pagePath.includes('android') || 
                            pagePath.includes('ipad');
                        
                        pageData.is_tools = isToolPage;
                        pageData.is_devices = isDevicePage;
                        pageData.is_gaming = false;
                    }
                    
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
                    
                    // 调整静态资源路径
                    const depth = page.output.split('/').length - 1;
                    // 定义 prefix 用于后续路径计算
                    const prefix = depth > 0 ? '../'.repeat(depth) : '';
                    
                    if (lang === this.defaultLanguage) {
                        // 英文在根目录
                        if (depth === 0) {
                            // 根目录主页
                            pageData.css_path = 'css';
                            pageData.locales_path = 'locales';
                            pageData.js_path = 'js';
                        } else {
                            // 子目录页面
                            pageData.css_path = prefix + 'css';
                            pageData.locales_path = prefix + 'locales';
                            pageData.js_path = prefix + 'js';
                        }
                    } else {
                        // 其他语言在语言子目录
                        if (depth === 0) {
                            pageData.css_path = '../css';
                            pageData.locales_path = '../locales';
                            pageData.js_path = '../js';
                        } else {
                            const pathPrefix = '../'.repeat(depth + 1);
                            pageData.css_path = pathPrefix + 'css';
                            pageData.locales_path = pathPrefix + 'locales';
                            pageData.js_path = pathPrefix + 'js';
                        }
                    }
                    
                    // 更新相对链接路径
                    if (pageData.home_url) {
                        if (lang === this.defaultLanguage) {
                            // 英文：回到根目录
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        } else {
                            // 其他语言：回到语言根目录
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        }
                    }
                    
                    if (pageData.device_links_base) {
                        pageData.device_links_base = pageData.device_links_base.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.device_links_base.substring(3)
                            : (depth > 0 ? prefix + pageData.device_links_base : pageData.device_links_base);
                    }
                    
                    // 修复博客URL
                    if (pageData.blog_url) {
                        if (lang === this.defaultLanguage) {
                            // 英文博客在根目录 /blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        } else {
                            // 其他语言博客在各自的语言目录下 /zh/blog/, /de/blog/, /es/blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        }
                    }
                    
                    if (pageData.privacy_policy_url) {
                        pageData.privacy_policy_url = pageData.privacy_policy_url.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.privacy_policy_url.substring(3)
                            : prefix + pageData.privacy_policy_url;
                    }
                    
                    // 更新语言相关的URL和路径
                    if (lang === this.defaultLanguage) {
                        // 英文URL不需要语言前缀
                        // 确保不包含 /en/ 前缀
                        pageData.canonical_url = pageData.canonical_url.replace('/en/', '/');
                    } else {
                        // 其他语言需要语言前缀
                        if (!pageData.canonical_url.includes(`/${lang}/`)) {
                            pageData.canonical_url = pageData.canonical_url.replace(
                                'https://screensizechecker.com/',
                                `https://screensizechecker.com/${lang}/`
                            );
                        }
                    }
                    
                    // 移除.html后缀以匹配Cloudflare Pages的URL格式
                    pageData.canonical_url = pageData.canonical_url.replace(/\.html$/, '');
                    pageData.og_url = pageData.canonical_url;
                    
                    // 更新Open Graph数据以使用翻译后的内容
                    pageData.og_title = pageData.page_title || pageData.og_title;
                    pageData.og_description = pageData.description || pageData.og_description;
                    
                    // 添加hreflang相关数据
                    pageData.base_url = 'https://screensizechecker.com';
                    
                    // 计算页面路径（不包含语言前缀）
                    if (lang === this.defaultLanguage) {
                        pageData.page_path = pageData.canonical_url.replace('https://screensizechecker.com', '');
                    } else {
                        pageData.page_path = pageData.canonical_url.replace(`https://screensizechecker.com/${lang}`, '');
                    }
                    if (!pageData.page_path) {
                        pageData.page_path = '/';
                    }
                    
                    // 为hreflang标签设置正确的URL
                    // x-default 和英文版本都指向根路径（无 /en/ 前缀）
                    pageData.hreflang_root_url = pageData.page_path === '/' ? 
                        'https://screensizechecker.com/' : 
                        `https://screensizechecker.com${pageData.page_path}`;
                    
                    pageData.hreflang_en_url = pageData.hreflang_root_url;
                    
                    // 中文版本
                    pageData.hreflang_zh_url = `https://screensizechecker.com/zh${pageData.page_path}`;
                    
                    // 德语版本
                    pageData.hreflang_de_url = `https://screensizechecker.com/de${pageData.page_path}`;
                    
                    // 西语版本
                    pageData.hreflang_es_url = `https://screensizechecker.com/es${pageData.page_path}`;
                    
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
                    
                    // 修复静态资源路径
                    const fullOutputPath = lang === this.defaultLanguage ? page.output : path.join(lang, page.output);
                    html = this.fixStaticResourcePaths(html, fullOutputPath);
                    
                    // 写入文件
                    const finalOutputPath = path.join(langDir, page.output);
                    const outputDirPath = path.dirname(finalOutputPath);
                    
                    if (!fs.existsSync(outputDirPath)) {
                        fs.mkdirSync(outputDirPath, { recursive: true });
                    }
                    
                    fs.writeFileSync(finalOutputPath, html);
                    
                    const displayPath = lang === this.defaultLanguage ? page.output : `${lang}/${page.output}`;
                    console.log(`  ✅ Built: ${displayPath}`);
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
        
        // 集成性能监控系统
        this.integratePerformanceMonitoring(outputDir);
        
        // 生成语言选择索引页面
        this.generateLanguageIndex(outputDir);
        
        // 生成多语言网站地图（只包含启用的语言）
        this.generateMultiLanguageSitemap(outputDir);
        
        // 执行内容一致性检查
        this.validateContentConsistency(outputDir);
        
        // 提取并内联关键CSS (临时禁用以修复HTML结构问题)
        // this.extractAndInlineCriticalCSS(outputDir);

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
        
        // 博客图片资源（单独处理，因为需要复制到特定位置）
        const blogImagesSource = path.join(this.rootPath, 'blog-content', 'images');
        const blogImagesTarget = path.join(outputDir, 'images');
        
        if (fs.existsSync(blogImagesSource)) {
            try {
                this.copyDirectoryRecursive(blogImagesSource, blogImagesTarget);
                console.log('  ✅ Copied blog images directory: blog-content/images -> images');
            } catch (error) {
                console.warn('  ⚠️  Warning: Could not copy blog images:', error.message);
            }
        } else {
            console.warn('  ⚠️  Warning: blog-content/images not found, skipping');
        }

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

    // 集成性能监控系统
    integratePerformanceMonitoring(outputDir) {
        console.log('\n📊 Integrating Performance Monitoring System...');
        
        try {
            // 1. 验证性能监控文件是否存在
            const performanceMonitorPath = path.join(outputDir, 'js', 'performance-monitor.js');
            const appJsPath = path.join(outputDir, 'js', 'app.js');
            
            if (!fs.existsSync(performanceMonitorPath)) {
                console.warn('  ⚠️  Warning: performance-monitor.js not found, skipping integration');
                return;
            }
            
            if (!fs.existsSync(appJsPath)) {
                console.warn('  ⚠️  Warning: app.js not found, skipping integration');
                return;
            }
            
            // 2. 验证 app.js 是否包含性能监控导入
            const appJsContent = fs.readFileSync(appJsPath, 'utf8');
            if (!appJsContent.includes("import { performanceMonitor } from './performance-monitor.js'")) {
                console.warn('  ⚠️  Warning: app.js does not import performance monitor');
            } else {
                console.log('  ✅ app.js includes performance monitor import');
            }
            
            // 3. 创建性能监控测试页面
            this.createPerformanceTestPage(outputDir);
            
            // 4. 生成性能监控部署报告
            this.generatePerformanceDeploymentReport(outputDir);
            
            // 5. 验证关键文件
            const requiredFiles = [
                'js/performance-monitor.js',
                'js/app.js',
                'js/utils.js'
            ];
            
            let allFilesExist = true;
            for (const file of requiredFiles) {
                const filePath = path.join(outputDir, file);
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    console.log(`  ✅ ${file} (${this.formatFileSize(stats.size)})`);
                } else {
                    console.warn(`  ❌ Missing required file: ${file}`);
                    allFilesExist = false;
                }
            }
            
            if (allFilesExist) {
                console.log('  ✅ Performance monitoring system integration completed successfully');
            } else {
                console.warn('  ⚠️  Performance monitoring system integration completed with warnings');
            }
            
        } catch (error) {
            console.error('  ❌ Error integrating performance monitoring system:', error.message);
        }
    }

    // 创建性能监控测试页面
    createPerformanceTestPage(outputDir) {
        const testPagePath = path.join(outputDir, 'performance-test-production.html');
        
        const testPageContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生产环境性能监控测试</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background: #f8f9fa;
        }
        
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .status-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-indicator.good { background: #28a745; }
        .status-indicator.warning { background: #ffc107; }
        .status-indicator.error { background: #dc3545; }
        
        .metrics-display {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Consolas', monospace;
            font-size: 12px;
            margin: 15px 0;
            max-height: 300px;
            overflow-y: auto;
        }
        
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        
        button:hover { background: #0056b3; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        
        .alert {
            padding: 12px 16px;
            border-radius: 6px;
            margin: 15px 0;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .alert-danger {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 生产环境性能监控测试</h1>
        <p>此页面用于验证性能监控系统在生产环境中是否正常工作。</p>
        
        <div class="status-card">
            <h3>
                <span id="system-status" class="status-indicator error"></span>
                系统状态检查
            </h3>
            <div id="status-message">正在检查系统状态...</div>
            <button onclick="checkSystemStatus()">🔄 重新检查</button>
        </div>
        
        <div class="status-card">
            <h3>📊 Core Web Vitals 监控</h3>
            <div id="cwv-status">正在收集性能数据...</div>
            <div class="metrics-display" id="cwv-display">等待数据...</div>
            <button onclick="refreshMetrics()">📈 刷新指标</button>
            <button onclick="exportData()">📤 导出数据</button>
        </div>
        
        <div class="status-card">
            <h3>🧪 功能测试</h3>
            <p>运行以下测试来验证监控系统的各项功能：</p>
            
            <button onclick="testLongTask()">⏱️ 测试长任务监控</button>
            <button onclick="testLayoutShift()">📐 测试布局偏移监控</button>
            <button onclick="testResourceLoading()">📦 测试资源监控</button>
            
            <div id="test-results" class="metrics-display" style="min-height: 150px;">
                测试结果将显示在这里...
            </div>
        </div>
    </div>
    
    <script type="module">
        let testLog = [];
        let performanceMonitor = null;
        
        // 尝试导入性能监控模块
        async function initializeMonitoring() {
            try {
                const module = await import('./js/performance-monitor.js');
                performanceMonitor = module.performanceMonitor;
                
                if (performanceMonitor) {
                    addTestLog('✅ 性能监控模块加载成功');
                    updateSystemStatus('good', '性能监控系统运行正常');
                    return true;
                } else {
                    throw new Error('性能监控实例未找到');
                }
            } catch (error) {
                addTestLog(\`❌ 性能监控模块加载失败: \${error.message}\`);
                updateSystemStatus('error', \`系统加载失败: \${error.message}\`);
                return false;
            }
        }
        
        function addTestLog(message) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = \`[\${timestamp}] \${message}\`;
            testLog.push(logEntry);
            
            if (testLog.length > 20) {
                testLog = testLog.slice(-20);
            }
            
            updateTestResults();
        }
        
        function updateTestResults() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.textContent = testLog.join('\\n');
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
        }
        
        function updateSystemStatus(status, message) {
            const statusIndicator = document.getElementById('system-status');
            const statusMessage = document.getElementById('status-message');
            
            statusIndicator.className = \`status-indicator \${status}\`;
            statusMessage.innerHTML = message;
        }
        
        // 全局函数
        window.checkSystemStatus = async function() {
            addTestLog('🔍 开始系统状态检查...');
            
            const checks = [
                {
                    name: 'HTTPS 环境',
                    test: () => location.protocol === 'https:' || location.hostname === 'localhost',
                    message: 'HTTPS 环境检查'
                },
                {
                    name: 'PerformanceObserver 支持',
                    test: () => 'PerformanceObserver' in window,
                    message: 'PerformanceObserver API 支持'
                }
            ];
            
            let allPassed = true;
            
            for (const check of checks) {
                try {
                    const result = check.test();
                    if (result) {
                        addTestLog(\`✅ \${check.message}: 通过\`);
                    } else {
                        addTestLog(\`❌ \${check.message}: 失败\`);
                        allPassed = false;
                    }
                } catch (error) {
                    addTestLog(\`❌ \${check.message}: 错误 - \${error.message}\`);
                    allPassed = false;
                }
            }
            
            const monitoringOk = await initializeMonitoring();
            
            if (allPassed && monitoringOk) {
                updateSystemStatus('good', '✅ 所有系统检查通过，性能监控正常运行');
            } else {
                updateSystemStatus('error', '❌ 系统检查发现问题，请查看测试日志');
            }
        };
        
        window.refreshMetrics = function() {
            if (!performanceMonitor) {
                addTestLog('❌ 性能监控系统未初始化');
                return;
            }
            
            try {
                const metrics = performanceMonitor.getMetrics();
                const cwv = metrics.coreWebVitals;
                
                let display = '📊 Core Web Vitals 当前数据:\\n\\n';
                
                if (cwv.LCP.value !== null) {
                    const rating = cwv.LCP.rating;
                    const icon = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
                    display += \`\${icon} LCP: \${cwv.LCP.value.toFixed(0)}ms (\${rating})\\n\`;
                } else {
                    display += '⏳ LCP: 正在测量...\\n';
                }
                
                if (cwv.FID.value !== null) {
                    const rating = cwv.FID.rating;
                    const icon = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
                    display += \`\${icon} FID: \${cwv.FID.value.toFixed(0)}ms (\${rating})\\n\`;
                } else {
                    display += '⏳ FID: 等待用户交互...\\n';
                }
                
                if (cwv.CLS.value !== null) {
                    const rating = cwv.CLS.rating;
                    const icon = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
                    display += \`\${icon} CLS: \${cwv.CLS.value.toFixed(3)} (\${rating})\\n\`;
                } else {
                    display += '⏳ CLS: 正在监控...\\n';
                }
                
                display += \`\\n📈 综合性能评分: \${metrics.performanceScore}/100\\n\`;
                display += \`📊 长任务数量: \${metrics.longTasksCount}\\n\`;
                display += \`📦 资源监控数量: \${metrics.resourceTimingsCount}\`;
                
                document.getElementById('cwv-display').textContent = display;
                document.getElementById('cwv-status').innerHTML = 
                    \`<div class="alert alert-success">✅ 性能数据收集正常，评分: \${metrics.performanceScore}/100</div>\`;
                
                addTestLog('📊 性能指标已刷新');
                
            } catch (error) {
                addTestLog(\`❌ 刷新指标失败: \${error.message}\`);
            }
        };
        
        window.testLongTask = function() {
            addTestLog('⏱️ 开始长任务测试...');
            
            const start = performance.now();
            while (performance.now() - start < 100) {
                // 阻塞主线程
            }
            
            setTimeout(() => {
                if (performanceMonitor) {
                    const metrics = performanceMonitor.getMetrics();
                    addTestLog(\`✅ 长任务测试完成，检测到 \${metrics.longTasksCount} 个长任务\`);
                }
            }, 500);
        };
        
        window.testLayoutShift = function() {
            addTestLog('📐 开始布局偏移测试...');
            
            const testDiv = document.createElement('div');
            testDiv.style.cssText = \`
                height: 100px;
                background: #ffeb3b;
                margin: 10px 0;
                padding: 20px;
                border-radius: 5px;
            \`;
            testDiv.textContent = '这是测试布局偏移的动态内容';
            
            document.body.appendChild(testDiv);
            
            setTimeout(() => {
                testDiv.remove();
                if (performanceMonitor) {
                    const cls = performanceMonitor.getMetric('CLS');
                    addTestLog(\`✅ 布局偏移测试完成，当前 CLS: \${cls !== null ? cls.toFixed(3) : '未测量'}\`);
                }
            }, 2000);
        };
        
        window.testResourceLoading = function() {
            addTestLog('📦 开始资源加载测试...');
            
            const img = new Image();
            img.onload = () => {
                addTestLog('✅ 测试图片加载完成');
                if (performanceMonitor) {
                    const metrics = performanceMonitor.getMetrics();
                    addTestLog(\`📊 当前监控资源数量: \${metrics.resourceTimingsCount}\`);
                }
            };
            img.onerror = () => {
                addTestLog('❌ 测试图片加载失败');
            };
            img.src = \`data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2NiYSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=\`;
        };
        
        window.exportData = function() {
            if (!performanceMonitor) {
                addTestLog('❌ 性能监控系统未初始化，无法导出数据');
                return;
            }
            
            try {
                const metrics = performanceMonitor.getMetrics();
                const exportData = {
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    metrics: metrics,
                    testLog: testLog
                };
                
                console.log('📤 性能监控数据导出:', exportData);
                addTestLog('📤 性能数据已导出到控制台');
                
            } catch (error) {
                addTestLog(\`❌ 数据导出失败: \${error.message}\`);
            }
        };
        
        // 初始化
        setTimeout(async () => {
            addTestLog('🚀 生产环境性能监控测试页面已加载');
            await checkSystemStatus();
            
            setTimeout(() => {
                refreshMetrics();
            }, 3000);
        }, 1000);
        
        setInterval(() => {
            if (document.visibilityState === 'visible' && performanceMonitor) {
                refreshMetrics();
            }
        }, 10000);
        
        console.log('🎯 生产环境性能监控测试页面已准备就绪');
    </script>
</body>
</html>`;
        
        fs.writeFileSync(testPagePath, testPageContent);
        console.log('  ✅ Created performance test page: performance-test-production.html');
    }

    // 生成性能监控部署报告
    generatePerformanceDeploymentReport(outputDir) {
        const report = {
            timestamp: new Date().toISOString(),
            buildDirectory: outputDir,
            performanceMonitoring: {
                enabled: true,
                version: '1.0.0',
                features: [
                    'Core Web Vitals monitoring (LCP, FID, CLS, FCP, TTI)',
                    'Long task detection (>50ms)',
                    'Resource timing monitoring',
                    'Performance budget checking',
                    'Real User Monitoring (RUM)',
                    'Automatic reporting and alerting'
                ]
            },
            verificationResults: {
                requiredFiles: [
                    'js/performance-monitor.js',
                    'js/app.js',
                    'js/utils.js'
                ].map(file => ({
                    file,
                    exists: fs.existsSync(path.join(outputDir, file)),
                    size: this.getFileSize(path.join(outputDir, file))
                })),
                testPage: {
                    created: fs.existsSync(path.join(outputDir, 'performance-test-production.html')),
                    path: 'performance-test-production.html'
                }
            },
            deploymentInstructions: {
                step1: '确保服务器支持 HTTPS (性能监控 API 需要安全上下文)',
                step2: '配置正确的 MIME 类型 (.js → application/javascript)',
                step3: '启用 Gzip/Brotli 压缩以减少传输大小',
                step4: '部署后访问 /performance-test-production.html 验证功能',
                step5: '在浏览器控制台运行 performanceMonitor.getMetrics() 检查数据'
            },
            expectedBehavior: {
                autoStart: '性能监控系统会在页面加载时自动启动',
                dataCollection: '系统会自动收集 Core Web Vitals 和其他性能指标',
                reporting: '每30秒生成一次性能报告',
                storage: '数据存储在浏览器 sessionStorage 中供调试使用'
            }
        };
        
        const reportPath = path.join(outputDir, 'performance-monitor-deployment-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log('  ✅ Generated deployment report: performance-monitor-deployment-report.json');
    }

    // 获取文件大小
    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // 提取并内联关键CSS
    extractAndInlineCriticalCSS(outputDir) {
        console.log('\n🎨 Extracting and inlining critical CSS...');
        
        try {
            const extractor = new CriticalCSSExtractor({
                criticalCSSFiles: [
                    path.join(outputDir, 'css/main.css'),
                    path.join(outputDir, 'css/base.css')
                ],
                outputDir: outputDir,
                enableMinification: true,
                inlineThreshold: 50 * 1024 // 50KB
            });
            
            // 运行关键CSS提取流程
            const result = extractor.run();
            
            if (result.success) {
                console.log('✅ Critical CSS extraction completed successfully');
                console.log(`   - Critical rules extracted: ${result.stats.criticalRules}`);
                console.log(`   - Extracted size: ${this.formatFileSize(result.stats.extractedSize)}`);
                console.log(`   - HTML files processed: ${result.processedFiles.length}`);
            } else {
                console.warn('⚠️ Critical CSS extraction failed:', result.error);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error during critical CSS extraction:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    // 生成结构化数据
    generateStructuredData(pageData, lang) {
        // 如果页面数据中已经包含结构化数据配置，优先使用
        if (pageData.structured_data && typeof pageData.structured_data === 'object') {
            // 更新动态字段
            const configStructuredData = { ...pageData.structured_data };
            configStructuredData.url = pageData.canonical_url || configStructuredData.url;
            configStructuredData.name = pageData.page_title || configStructuredData.name;
            configStructuredData.description = pageData.description || configStructuredData.description;
            configStructuredData.inLanguage = lang;

            // 更新日期为当前日期
            configStructuredData.dateModified = new Date().toISOString().split('T')[0];

            return JSON.stringify(configStructuredData, null, 2);
        }

        // 回退到基本结构化数据
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
            ],
            "dateModified": new Date().toISOString().split('T')[0]
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
        // 计算相对路径深度 - 标准化路径分隔符为正斜杠
        const normalizedPath = outputPath.replace(/\\/g, '/');
        const depth = normalizedPath.split('/').length - 1;
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
        
        // 修复博客内容中的图片路径（重要：修复图片显示问题）
        // 将 ../images/ 修正为正确的相对路径
        html = html.replace(
            /src="\.\.\/(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );
        
        // 修复博客文章中的图片路径（直接 images/ 到正确的相对路径）
        // 博客文章通常在 zh/blog/ 目录下，需要 ../../images/
        html = html.replace(
            /src="(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );
        
        return html;
    }
    
    // 生成根目录博客内容（英文版本）
    generateRootBlogContent(outputDir, config, englishTranslations) {
        console.log('📝 Generating root directory blog content...');
        
        // 创建根目录博客目录
        const rootBlogDir = path.join(outputDir, 'blog');
        fs.mkdirSync(rootBlogDir, { recursive: true });
        
        // 创建博客子目录
        const blogSubDirs = ['category', 'tag'];
        blogSubDirs.forEach(subDir => {
            fs.mkdirSync(path.join(rootBlogDir, subDir), { recursive: true });
        });
        
        // 获取所有博客相关页面
        const blogPages = config.pages.filter(page => 
            page.output.startsWith('blog/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`  📄 Found ${blogPages.length} blog pages to generate at root level`);
        
        // 为每个博客页面生成根目录版本
        for (const page of blogPages) {
            try {
                // 准备根目录博客页面数据
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                
                // 调整根目录博客页面的路径
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                
                // 更新canonical URL为根目录版本
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/blog/', '/blog/');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 设置hreflang数据
                rootPageData.base_url = 'https://screensizechecker.com';
                const blogPath = page.output.replace('blog/', '/blog/');
                rootPageData.page_path = blogPath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                
                // 处理翻译
                if (rootPageData.page_title_key) {
                    const translationValue = this.getNestedTranslation(englishTranslations, rootPageData.page_title_key);
                    if (translationValue) {
                        rootPageData.page_title = translationValue;
                    } else {
                        rootPageData.page_title = rootPageData.og_title || page.name;
                    }
                } else {
                    rootPageData.page_title = rootPageData.og_title || page.name;
                }
                
                rootPageData.title = rootPageData.page_title;
                
                if (rootPageData.page_description_key) {
                    const descriptionValue = this.getNestedTranslation(englishTranslations, rootPageData.page_description_key);
                    if (descriptionValue) {
                        rootPageData.description = descriptionValue;
                    } else {
                        rootPageData.description = rootPageData.og_description || '';
                    }
                } else {
                    rootPageData.description = rootPageData.og_description || '';
                }
                
                // 添加结构化数据
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');
                
                // 构建HTML
                let html = this.buildPage(page.template, rootPageData);
                
                // 应用英文翻译
                html = this.translateContent(html, englishTranslations);
                
                // 处理内链
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 修复静态资源路径
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 写入文件
                const outputPath = path.join(outputDir, page.output);
                const outputDirPath = path.dirname(outputPath);
                
                if (!fs.existsSync(outputDirPath)) {
                    fs.mkdirSync(outputDirPath, { recursive: true });
                }
                
                fs.writeFileSync(outputPath, html);
                console.log(`  ✅ Generated root blog page: ${page.output}`);
                
            } catch (error) {
                console.error(`  ❌ Failed to generate root blog page ${page.output}:`, error.message);
            }
        }
        
        console.log('✅ Root directory blog content generated');
    }
    
    // 生成根目录设备页面（英文版本）
    generateRootDevicePages(outputDir, config, englishTranslations) {
        console.log('🔧 Generating root directory device pages...');
        
        // 创建根目录设备目录
        const rootDevicesDir = path.join(outputDir, 'devices');
        fs.mkdirSync(rootDevicesDir, { recursive: true });
        
        // 获取所有设备页面
        const devicePages = config.pages.filter(page => 
            page.output.startsWith('devices/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`  🔧 Found ${devicePages.length} device pages to generate at root level`);
        
        // 为每个设备页面生成根目录版本
        for (const page of devicePages) {
            try {
                // 准备根目录设备页面数据
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                
                // 调整根目录设备页面的路径
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(1, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                rootPageData.device_links_base = '';
                
                // 更新canonical URL为根目录版本
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/devices/', '/devices/').replace('.html', '');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 设置hreflang数据
                rootPageData.base_url = 'https://screensizechecker.com';
                const devicePath = page.output.replace('devices/', '/devices/');
                rootPageData.page_path = devicePath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                
                // 处理翻译
                if (rootPageData.page_title_key) {
                    const translationValue = this.getNestedTranslation(englishTranslations, rootPageData.page_title_key);
                    if (translationValue) {
                        rootPageData.page_title = translationValue;
                    } else {
                        rootPageData.page_title = rootPageData.og_title || page.name;
                    }
                } else {
                    rootPageData.page_title = rootPageData.og_title || page.name;
                }
                
                rootPageData.title = rootPageData.page_title;
                
                if (rootPageData.page_description_key) {
                    const descriptionValue = this.getNestedTranslation(englishTranslations, rootPageData.page_description_key);
                    if (descriptionValue) {
                        rootPageData.description = descriptionValue;
                    } else {
                        rootPageData.description = rootPageData.og_description || '';
                    }
                } else {
                    rootPageData.description = rootPageData.og_description || '';
                }
                
                // 添加结构化数据
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');
                
                // 添加导航状态标识
                const pagePath = page.output || '';
                rootPageData.is_home = pagePath === 'index.html' || pagePath === '';
                rootPageData.is_blog = false;
                const isToolPage = pagePath.includes('calculator') || pagePath.includes('compare') || pagePath.includes('tester') || pagePath.includes('resolution');
                const isDevicePage = pagePath.includes('iphone') || pagePath.includes('android') || pagePath.includes('ipad');
                rootPageData.is_tools = isToolPage;
                rootPageData.is_devices = isDevicePage;
                
                // 为responsive-tester页面添加FAQ结构化数据
                if (page.name === 'responsive-tester') {
                    rootPageData.faq_structured_data = this.generateFAQStructuredData('en');
                } else {
                    rootPageData.faq_structured_data = '';
                }
                
                // 构建HTML
                let html = this.buildPage(page.template, rootPageData);
                
                // 应用英文翻译
                html = this.translateContent(html, englishTranslations);
                
                // 处理内链
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 修复静态资源路径
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 写入文件
                const outputPath = path.join(outputDir, page.output);
                fs.writeFileSync(outputPath, html);
                console.log(`  ✅ Generated root device page: ${page.output}`);
                
            } catch (error) {
                console.error(`  ❌ Failed to generate root device page ${page.output}:`, error.message);
            }
        }
        
        console.log('✅ Root directory device pages generated');
    }

    // 生成语言选择索引页面
    generateLanguageIndex(outputDir) {
        console.log('\n📋 Generating root English page and language selection...');
        
        // 定义已启用的语言（只有英文和中文）
        const enabledLanguages = ['en', 'zh'];
        
        // 1. 生成根目录英文主页内容（不再重定向）
        console.log('🏠 Generating root directory English homepage...');
        
        // 获取英文翻译
        const englishTranslations = this.translations.get('en') || {};
        
        // 配置根目录页面数据，基于pages-config.json中的index页面配置
        const config = JSON.parse(fs.readFileSync('build/pages-config.json', 'utf8'));
        const indexPageConfig = config.pages.find(page => page.name === 'index');
        
        if (!indexPageConfig) {
            throw new Error('Index page configuration not found in pages-config.json');
        }
        
        // 准备根目录页面数据
        const rootPageData = {
            lang: 'en',
            lang_prefix: '',
            lang_code: 'EN',
            page_content: indexPageConfig.page_content,
            ...indexPageConfig.config
        };
        
        // 设置根目录特定的路径和URL
        rootPageData.canonical_url = 'https://screensizechecker.com/';
        rootPageData.og_url = 'https://screensizechecker.com/';
        rootPageData.css_path = 'css';
        rootPageData.locales_path = 'locales';
        rootPageData.js_path = 'js';
        rootPageData.home_url = 'index.html';
        rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
        rootPageData.privacy_policy_url = 'privacy-policy.html';
        rootPageData.device_links_base = 'devices/';
        
        // 设置根目录页面的hreflang数据
        rootPageData.base_url = 'https://screensizechecker.com';
        rootPageData.page_path = '/';
        rootPageData.hreflang_root_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_en_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_zh_url = 'https://screensizechecker.com/zh/';
        rootPageData.hreflang_de_url = 'https://screensizechecker.com/de/';
        rootPageData.hreflang_es_url = 'https://screensizechecker.com/es/';
        
        // 从翻译文件中获取页面特定的翻译值
        if (rootPageData.page_title_key) {
            const translationValue = this.getNestedTranslation(englishTranslations, rootPageData.page_title_key);
            if (translationValue) {
                rootPageData.page_title = translationValue;
            } else {
                rootPageData.page_title = rootPageData.og_title || 'Screen Size Checker';
            }
        } else {
            rootPageData.page_title = rootPageData.og_title || 'Screen Size Checker';
        }
        
        // 确保title变量也被设置
        rootPageData.title = rootPageData.page_title;
        
        if (rootPageData.page_description_key) {
            const descriptionValue = this.getNestedTranslation(englishTranslations, rootPageData.page_description_key);
            if (descriptionValue) {
                rootPageData.description = descriptionValue;
            } else {
                rootPageData.description = rootPageData.og_description || '';
            }
        } else {
            rootPageData.description = rootPageData.og_description || '';
        }
        
        // 添加结构化数据
        rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');
        
        // 添加导航状态标识
        rootPageData.is_home = true;
        rootPageData.is_blog = false;
        rootPageData.is_tools = false;
        rootPageData.is_devices = false;
        
        // 为responsive-tester页面添加FAQ结构化数据
        if (indexPageConfig.name === 'responsive-tester') {
            rootPageData.faq_structured_data = this.generateFAQStructuredData('en');
        } else {
            rootPageData.faq_structured_data = '';
        }
        
        // 构建根目录HTML页面
        let rootHtml = this.buildPage(indexPageConfig.template, rootPageData);
        
        // 应用英文翻译
        rootHtml = this.translateContent(rootHtml, englishTranslations);
        
        // 处理内链（根目录页面使用特殊的页面ID）
        rootHtml = this.internalLinksProcessor.processPageLinks(rootHtml, 'index-root', 'en');
        
        // 更新HTML lang属性
        rootHtml = rootHtml.replace('<html lang="en">', '<html lang="en">');
        
        // 修复静态资源路径（根目录不需要额外的路径前缀）
        rootHtml = this.fixStaticResourcePaths(rootHtml, 'index.html');
        
        // 写入根目录index.html
        fs.writeFileSync(path.join(outputDir, 'index.html'), rootHtml);
        console.log('✅ Root English homepage created (no redirect)');
        
        // 1.5. 跳过根目录博客内容生成，博客链接将指向 /en/blog/
        console.log('📝 Skipping root directory blog content generation - blog links will point to /en/blog/');
        
        // 1.6. 生成根目录设备页面（英文版本）
        this.generateRootDevicePages(outputDir, config, englishTranslations);
        
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
        const enabledLanguages = ['en', 'zh', 'de', 'es']; // 只包含启用的语言
        
        // 定义页面结构（无.html后缀，匹配Cloudflare Pages的URL格式）
        const pages = [
            { path: '', priority: '1.0', changefreq: 'weekly' },
            { path: '/devices/iphone-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/ipad-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/android-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/compare', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/standard-resolutions', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/responsive-tester', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/ppi-calculator', priority: '0.8', changefreq: 'monthly' }
        ];
        
        // 定义博客页面结构
        const blogPages = [
            { path: '/blog', priority: '0.9', changefreq: 'weekly' },
            { path: '/blog/device-pixel-ratio', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/media-queries-essentials', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/viewport-basics', priority: '0.8', changefreq: 'monthly' },
            // How-to Guide Series (High Priority)
            { path: '/blog/how-to-measure-monitor-size', priority: '0.9', changefreq: 'monthly' },
            { path: '/blog/how-to-measure-laptop-screen', priority: '0.9', changefreq: 'monthly' },
            { path: '/blog/how-to-check-screen-resolution', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/monitor-buying-guide-2025', priority: '0.9', changefreq: 'monthly' },
            { path: '/blog/gaming-monitor-setup-guide', priority: '0.9', changefreq: 'monthly' },
            // Other Articles
            { path: '/blog/average-laptop-screen-size-2025', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/black_myth_guide', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/container-queries-guide', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/responsive-debugging-checklist', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog/screen-dimensions-cheat-sheet', priority: '0.8', changefreq: 'monthly' },
            // Categories
            { path: '/blog/category/technical', priority: '0.7', changefreq: 'monthly' },
            { path: '/blog/category/css', priority: '0.7', changefreq: 'monthly' },
            { path: '/blog/category/basics', priority: '0.7', changefreq: 'monthly' },
            { path: '/blog/category/guides', priority: '0.7', changefreq: 'monthly' },
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
        
        // 添加根路径（英文版本的主要入口）
        sitemapContent += `
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>`;
        
        // 添加根目录的设备页面（英文主要版本）
        pages.forEach(page => {
            if (page.path !== '') {
                sitemapContent += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
            }
        });
        
        // 添加根目录的博客页面（英文主要版本）
        blogPages.forEach(page => {
            sitemapContent += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
        });
        
        // 添加根目录的Hub页面（英文主要版本）
        // 从pages-config.json读取Hub页面
        const configPath = path.join(__dirname, 'pages-config.json');
        const pagesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const hubPagesEn = pagesConfig.pages.filter(p => 
            p.template === 'hub-page' && 
            p.enabled_languages && 
            p.enabled_languages.includes('en')
        );
        hubPagesEn.forEach(page => {
            const hubPath = page.output.startsWith('hub/') ? `/${page.output}` : page.output;
            sitemapContent += `
    <url>
        <loc>${baseUrl}${hubPath}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`;
        });
        
        // 添加语言选择页面
        sitemapContent += `
    <url>
        <loc>${baseUrl}/select-language</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        
        // 只为非英文的启用语言生成URL（英文已在根目录）
        enabledLanguages.forEach(lang => {
            // 跳过英文，因为英文版本已经在根目录
            if (lang === 'en') {
                return;
            }
            
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
            
            // 添加Hub页面
            const hubPagesLang = pagesConfig.pages.filter(p => 
                p.template === 'hub-page' && 
                p.enabled_languages && 
                p.enabled_languages.includes(lang)
            );
            hubPagesLang.forEach(page => {
                const hubPath = page.output.startsWith('hub/') ? `/${page.output}` : page.output;
                sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${hubPath}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
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
        
        // 计算总URL数量：
        // 1个根目录 + 根目录的设备页面 + 根目录的博客页面 + Hub页面 + 1个语言选择页面 + 1个隐私政策页面
        // + 语言版本页面 + 中文特有页面
        const hubPagesCount = pagesConfig.pages.filter(p => p.template === 'hub-page').length;
        const rootUrls = 1 + (pages.length - 1) + blogPages.length + hubPagesEn.length; // 根目录相关URL
        const languageUrls = enabledLanguages.length * (pages.length + blogPages.length); // 语言版本URL
        const hubUrls = hubPagesCount; // Hub页面（所有语言）
        const otherUrls = 2; // 语言选择页面 + 隐私政策页面
        const totalUrls = rootUrls + languageUrls + hubUrls + zhBlogPages.length + otherUrls;
        
        console.log('✅ Multilingual sitemap generated with optimized structure');
        console.log(`   📄 Total URLs: ${totalUrls}`);
        console.log(`   🏠 Root domain URLs: ${rootUrls} (priority 1.0-0.9)`);
        console.log(`   🌍 Language versions: ${languageUrls} (adjusted priorities)`);
        console.log(`   🎮 Gaming Hub pages: ${hubUrls} (4 languages)`);
        console.log(`   🇨🇳 Chinese-specific: ${zhBlogPages.length}`);
        console.log(`   📝 Other pages: ${otherUrls}`);
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
# URL 结构迁移：英文内容从 /en/* 迁移到根路径 /*

# ===== 重要：旧英文路径 → 新根路径 =====
# 这些规则确保旧的 /en/* URL 正确重定向到新的根路径

# 英文主页重定向
/en/                  /                   301
/en/index.html        /                   301

# 英文博客重定向（旧路径 → 新路径）
/en/blog              /blog               301
/en/blog/             /blog/              301
/en/blog/*            /blog/:splat        301

# 英文设备页面重定向（旧路径 → 新路径）
/en/devices/*         /devices/:splat     301

# 英文工具页面重定向（如果存在）
/en/tools/*           /tools/:splat       301

# 通用规则：所有剩余的 /en/* 路径重定向到根路径
/en/*                 /:splat             301

# ===== .html 后缀重定向（根路径英文版本）=====
/devices/iphone-viewport-sizes.html       /devices/iphone-viewport-sizes      301
/devices/ipad-viewport-sizes.html         /devices/ipad-viewport-sizes        301
/devices/android-viewport-sizes.html      /devices/android-viewport-sizes     301
/devices/compare.html                     /devices/compare                    301
/devices/standard-resolutions.html        /devices/standard-resolutions       301
/devices/responsive-tester.html           /devices/responsive-tester          301
/devices/ppi-calculator.html              /devices/ppi-calculator             301
/devices/aspect-ratio-calculator.html     /devices/aspect-ratio-calculator    301

# ===== .html 后缀重定向（中文版本）=====
/zh/devices/iphone-viewport-sizes.html    /zh/devices/iphone-viewport-sizes   301
/zh/devices/ipad-viewport-sizes.html      /zh/devices/ipad-viewport-sizes     301
/zh/devices/android-viewport-sizes.html   /zh/devices/android-viewport-sizes  301
/zh/devices/compare.html                  /zh/devices/compare                 301
/zh/devices/standard-resolutions.html     /zh/devices/standard-resolutions    301
/zh/devices/responsive-tester.html        /zh/devices/responsive-tester       301
/zh/devices/ppi-calculator.html           /zh/devices/ppi-calculator          301
/zh/devices/aspect-ratio-calculator.html  /zh/devices/aspect-ratio-calculator 301

# ===== .html 后缀重定向（德语版本）=====
/de/devices/iphone-viewport-sizes.html    /de/devices/iphone-viewport-sizes   301
/de/devices/ipad-viewport-sizes.html      /de/devices/ipad-viewport-sizes     301
/de/devices/android-viewport-sizes.html   /de/devices/android-viewport-sizes  301
/de/devices/compare.html                  /de/devices/compare                 301
/de/devices/standard-resolutions.html     /de/devices/standard-resolutions    301
/de/devices/responsive-tester.html        /de/devices/responsive-tester       301
/de/devices/ppi-calculator.html           /de/devices/ppi-calculator          301
/de/devices/aspect-ratio-calculator.html  /de/devices/aspect-ratio-calculator 301

# ===== .html 后缀重定向（西班牙语版本）=====
/es/devices/iphone-viewport-sizes.html    /es/devices/iphone-viewport-sizes   301
/es/devices/ipad-viewport-sizes.html      /es/devices/ipad-viewport-sizes     301
/es/devices/android-viewport-sizes.html   /es/devices/android-viewport-sizes  301
/es/devices/compare.html                  /es/devices/compare                 301
/es/devices/standard-resolutions.html     /es/devices/standard-resolutions    301
/es/devices/responsive-tester.html        /es/devices/responsive-tester       301
/es/devices/ppi-calculator.html           /es/devices/ppi-calculator          301
/es/devices/aspect-ratio-calculator.html  /es/devices/aspect-ratio-calculator 301

# ===== 博客 .html 后缀重定向 =====
/blog/index.html                          /blog                               301
/zh/blog/index.html                       /zh/blog                            301
/de/blog/index.html                       /de/blog                            301
/es/blog/index.html                       /es/blog                            301
/blog/*.html                              /blog/:splat                        301
/zh/blog/*.html                           /zh/blog/:splat                     301
/de/blog/*.html                           /de/blog/:splat                     301
/es/blog/*.html                           /es/blog/:splat                     301

# ===== 语言版本 index.html 重定向 =====
/zh/index.html                            /zh/                                301
/de/index.html                            /de/                                301
/es/index.html                            /es/                                301

# ===== 其他页面重定向 =====
/privacy-policy.html                      /privacy-policy                     301
/terms-of-service.html                    /privacy-policy                     301
/terms-of-service                         /privacy-policy                     301

# ===== 便捷访问重定向 =====
/devices/                                 /devices/iphone-viewport-sizes      301
/devices                                  /devices/iphone-viewport-sizes      301`;

        fs.writeFileSync(path.join(outputDir, '_redirects'), redirectsContent);
        console.log('✅ Generated simplified _redirects file');
    }
    
    // 生成优化的robots.txt文件
    // 内容一致性检查：确保英文版本（根目录）和中文版本（/zh/）正确生成
    validateContentConsistency(outputDir) {
        console.log('\n🔍 Validating content consistency between English (root) and Chinese (/zh/) versions...');
        
        const inconsistencies = [];
        const rootDir = outputDir; // 英文版本在根目录
        const zhDir = path.join(outputDir, 'zh'); // 中文版本在 /zh/ 目录
        
        // 需要检查的页面列表
        const pagesToCheck = [
            'index.html',
            'devices/iphone-viewport-sizes.html',
            'devices/ipad-viewport-sizes.html',
            'devices/android-viewport-sizes.html',
            'devices/compare.html',
            'devices/standard-resolutions.html',
            'devices/responsive-tester.html',
            'devices/ppi-calculator.html',
            'devices/aspect-ratio-calculator.html'
        ];
        
        let checkedPages = 0;
        let consistentPages = 0;
        
        pagesToCheck.forEach(pagePath => {
            const rootPagePath = path.join(rootDir, pagePath); // 英文版本
            const zhPagePath = path.join(zhDir, pagePath); // 中文版本
            
            // 检查文件是否存在
            if (!fs.existsSync(rootPagePath)) {
                inconsistencies.push({
                    page: pagePath,
                    issue: 'English version (root) missing',
                    severity: 'error'
                });
                return;
            }
            
            if (!fs.existsSync(zhPagePath)) {
                inconsistencies.push({
                    page: pagePath,
                    issue: 'Chinese version (/zh/) missing',
                    severity: 'error'
                });
                return;
            }
            
            try {
                // 读取文件内容
                const rootContent = fs.readFileSync(rootPagePath, 'utf8');
                const zhContent = fs.readFileSync(zhPagePath, 'utf8');
                
                checkedPages++;
                
                // 检查关键SEO元素的一致性
                const seoChecks = [
                    { name: 'Title', regex: /<title[^>]*>(.*?)<\/title>/i },
                    { name: 'Meta Description', regex: /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i },
                    { name: 'H1 Tag', regex: /<h1[^>]*>(.*?)<\/h1>/i }
                ];
                
                let pageConsistent = true;
                
                seoChecks.forEach(check => {
                    const rootMatch = rootContent.match(check.regex);
                    const zhMatch = zhContent.match(check.regex);
                    
                    if (rootMatch && zhMatch) {
                        const rootValue = rootMatch[1].trim();
                        const zhValue = zhMatch[1].trim();
                        
                        // 英文和中文版本的内容应该是翻译关系，不应该相同
                        // 这里只检查两者都存在即可，不比较内容
                        // 如果需要，可以在这里添加更复杂的翻译验证逻辑
                    } else if (!rootMatch) {
                        inconsistencies.push({
                            page: pagePath,
                            issue: `${check.name} missing in English version`,
                            severity: 'warning'
                        });
                        pageConsistent = false;
                    } else if (!zhMatch) {
                        inconsistencies.push({
                            page: pagePath,
                            issue: `${check.name} missing in Chinese version`,
                            severity: 'warning'
                        });
                        pageConsistent = false;
                    }
                });
                
                // 检查canonical URL的正确性
                const rootCanonical = rootContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                const zhCanonical = zhContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                
                if (rootCanonical && zhCanonical) {
                    const rootCanonicalUrl = rootCanonical[1];
                    const zhCanonicalUrl = zhCanonical[1];
                    
                    // 验证canonical URL的正确性
                    // 英文版本（根目录）不应该包含 /en/
                    if (rootCanonicalUrl.includes('/en/')) {
                        inconsistencies.push({
                            page: pagePath,
                            issue: `English version has incorrect canonical URL (contains /en/): ${rootCanonicalUrl}`,
                            severity: 'error'
                        });
                        pageConsistent = false;
                    }
                    
                    // 中文版本应该包含 /zh/
                    if (!zhCanonicalUrl.includes('/zh/')) {
                        inconsistencies.push({
                            page: pagePath,
                            issue: `Chinese version has incorrect canonical URL (missing /zh/): ${zhCanonicalUrl}`,
                            severity: 'error'
                        });
                        pageConsistent = false;
                    }
                }
                
                if (pageConsistent) {
                    consistentPages++;
                }
                
            } catch (error) {
                inconsistencies.push({
                    page: pagePath,
                    issue: `Error reading files: ${error.message}`,
                    severity: 'error'
                });
            }
        });
        
        // 生成验证报告
        const validationReport = {
            timestamp: new Date().toISOString(),
            summary: {
                totalPages: pagesToCheck.length,
                checkedPages,
                consistentPages,
                inconsistencies: inconsistencies.length
            },
            issues: inconsistencies
        };
        
        // 保存验证报告
        fs.writeFileSync(
            path.join(outputDir, 'content-consistency-report.json'),
            JSON.stringify(validationReport, null, 2)
        );
        
        // 输出结果
        console.log(`📊 Content consistency validation completed:`);
        console.log(`   📄 Pages checked: ${checkedPages}/${pagesToCheck.length}`);
        console.log(`   ✅ Consistent pages: ${consistentPages}`);
        console.log(`   ⚠️  Issues found: ${inconsistencies.length}`);
        
        if (inconsistencies.length > 0) {
            console.log('\n⚠️  Content consistency issues:');
            inconsistencies.slice(0, 5).forEach(issue => {
                const icon = issue.severity === 'error' ? '❌' : '⚠️';
                console.log(`   ${icon} ${issue.page}: ${issue.issue}`);
            });
            
            if (inconsistencies.length > 5) {
                console.log(`   ... and ${inconsistencies.length - 5} more issues`);
            }
            console.log(`   📋 Full report saved to: content-consistency-report.json`);
        }
        
        return validationReport;
    }
    
    generateRobotsFile(outputDir) {
        console.log('\n🤖 Generating optimized robots.txt file...');
        
        const robotsContent = `# robots.txt for screensizechecker.com
# Last updated: ${new Date().toISOString().split('T')[0]}
# Optimized for SEO redirect architecture

# Allow all crawlers to access main content
User-agent: *
Allow: /

# Explicitly allow language versions
Allow: /en/
Allow: /zh/

# Allow static resources
Allow: /css/
Allow: /js/
Allow: /locales/

# Allow important pages
Allow: /privacy-policy
Allow: /select-language

# Allow blog content for all enabled languages
Allow: /blog/
Allow: /en/blog/
Allow: /zh/blog/

# Allow device pages for all enabled languages
Allow: /devices/
Allow: /en/devices/
Allow: /zh/devices/

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
Disallow: /.kiro/

# 禁止抓取临时和测试文件
Disallow: /*test*
Disallow: /*debug*
Disallow: /*.json$
Disallow: /*.md$

# 网站地图
Sitemap: https://screensizechecker.com/sitemap.xml

# 针对不同爬虫的特殊规则
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

# 其他爬虫的通用延迟
User-agent: *
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
            
            // Build Hub system
            console.log('\n🎮 Building Gaming Hub system...');
            const hubBuilder = new HubBuilder();
            hubBuilder.build();
            console.log('✅ Gaming Hub system build completed successfully!');
            
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