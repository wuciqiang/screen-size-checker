const fs = require('fs');
const path = require('path');

const MultiLangBuilder = require('../build/multilang-builder');
const { prepareGeneratedComponents } = require('./prepare-generated-components');

const ROOT = path.join(__dirname, '..');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'test-build', 'selected');
const STATIC_DIRECTORIES = ['css', 'js', 'locales', 'images'];
const STATIC_FILES = [
    'favicon.ico',
    'favicon.png',
    'ads.txt',
    'structured-data.json',
    'privacy-policy.html',
    'terms-of-service.html'
];

function parseArgs(args) {
    const options = {
        pages: [],
        languages: [],
        outputDir: DEFAULT_OUTPUT_DIR
    };

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (arg === '--page' && args[index + 1]) {
            options.pages.push(...args[index + 1].split(',').map(item => item.trim()).filter(Boolean));
            index += 1;
        } else if (arg.startsWith('--page=')) {
            options.pages.push(...arg.replace('--page=', '').split(',').map(item => item.trim()).filter(Boolean));
        } else if (arg === '--lang' && args[index + 1]) {
            options.languages.push(...args[index + 1].split(',').map(item => item.trim()).filter(Boolean));
            index += 1;
        } else if (arg.startsWith('--lang=')) {
            options.languages.push(...arg.replace('--lang=', '').split(',').map(item => item.trim()).filter(Boolean));
        } else if (arg === '--out-dir' && args[index + 1]) {
            options.outputDir = path.resolve(args[index + 1]);
            index += 1;
        } else if (arg.startsWith('--out-dir=')) {
            options.outputDir = path.resolve(arg.replace('--out-dir=', ''));
        }
    }

    return options;
}

function copyRecursive(sourcePath, targetPath) {
    if (!fs.existsSync(sourcePath)) return;

    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
        fs.mkdirSync(targetPath, { recursive: true });
        fs.readdirSync(sourcePath).forEach(entry => {
            copyRecursive(path.join(sourcePath, entry), path.join(targetPath, entry));
        });
        return;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
}

function ensurePreviewAssets(outputDir) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });

    STATIC_DIRECTORIES.forEach(dirName => {
        copyRecursive(path.join(ROOT, dirName), path.join(outputDir, dirName));
    });

    copyRecursive(
        path.join(ROOT, 'blog-content', 'images'),
        path.join(outputDir, 'blog-content', 'images')
    );

    STATIC_FILES.forEach(fileName => {
        copyRecursive(path.join(ROOT, fileName), path.join(outputDir, fileName));
    });
}

function loadPagesConfig() {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'pages-config.json'), 'utf8'));
}

function normalizePageKey(page) {
    return [
        page.name,
        page.output,
        page.output.replace(/\.html$/, '')
    ];
}

function selectPages(config, requestedPages) {
    if (!requestedPages || requestedPages.length === 0) {
        throw new Error('请通过 --page 指定至少一个页面名称，例如 --page compare');
    }

    const requested = new Set(requestedPages);
    const pages = config.pages.filter(page =>
        normalizePageKey(page).some(key => requested.has(key))
    );

    if (pages.length === 0) {
        throw new Error(`未找到页面: ${requestedPages.join(', ')}`);
    }

    return pages;
}

function buildPageData(builder, page, lang, translations) {
    const pageData = {
        lang,
        lang_prefix: lang === builder.defaultLanguage ? '' : `/${lang}`,
        lang_code: lang.toUpperCase(),
        page_content: page.page_content,
        ...page.config
    };

    const outputPath = builder.getOutputPath(page.output, lang);
    const pagePath = page.path || page.config.path || outputPath || '';

    pageData.is_home = pagePath === 'index.html' || pagePath === '';
    pageData.is_blog = pagePath.includes('blog/') || pagePath.startsWith('blog');

    if (typeof page.config.is_gaming !== 'undefined') {
        pageData.is_gaming = page.config.is_gaming;
        pageData.is_tools = page.config.is_tools || false;
        pageData.is_devices = page.config.is_devices || false;
    } else {
        const isHubPage = pagePath.includes('hub/');
        const isToolPage = !isHubPage && (
            pagePath.includes('calculator') ||
            pagePath.includes('compare') ||
            pagePath.includes('tester') ||
            pagePath.includes('resolution')
        );
        const isDevicePage = pagePath.includes('iphone') ||
            pagePath.includes('android') ||
            pagePath.includes('ipad');

        pageData.is_tools = isToolPage;
        pageData.is_devices = isDevicePage;
        pageData.is_gaming = false;
    }

    if (pageData.page_title_key) {
        const translationValue = builder.getNestedTranslation(translations, pageData.page_title_key);
        pageData.page_title = translationValue || pageData.og_title || 'Screen Size Checker';
    } else {
        pageData.page_title = pageData.og_title || 'Screen Size Checker';
    }

    pageData.title = pageData.page_title;

    if (pageData.page_heading_key) {
        const headingValue = builder.getNestedTranslation(translations, pageData.page_heading_key);
        if (headingValue) pageData.page_heading = headingValue;
    }

    if (pageData.page_intro_key) {
        const introValue = builder.getNestedTranslation(translations, pageData.page_intro_key);
        if (introValue) pageData.page_intro = introValue;
    }

    if (translations.description) {
        pageData.description = translations.description;
    } else if (pageData.page_description_key) {
        const descriptionValue = builder.getNestedTranslation(translations, pageData.page_description_key);
        pageData.description = descriptionValue || pageData.og_description || '';
    } else {
        pageData.description = pageData.og_description || '';
    }

    const depth = page.output.split('/').length - 1;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    if (lang === builder.defaultLanguage) {
        if (depth === 0) {
            pageData.css_path = 'css';
            pageData.locales_path = 'locales';
            pageData.js_path = 'js';
        } else {
            pageData.css_path = `${prefix}css`;
            pageData.locales_path = `${prefix}locales`;
            pageData.js_path = `${prefix}js`;
        }
    } else if (depth === 0) {
        pageData.css_path = '../css';
        pageData.locales_path = '../locales';
        pageData.js_path = '../js';
    } else {
        const pathPrefix = '../'.repeat(depth + 1);
        pageData.css_path = `${pathPrefix}css`;
        pageData.locales_path = `${pathPrefix}locales`;
        pageData.js_path = `${pathPrefix}js`;
    }

    if (pageData.home_url) {
        pageData.home_url = depth === 0 ? 'index.html' : `${'../'.repeat(depth)}index.html`;
    }

    if (pageData.device_links_base) {
        pageData.device_links_base = pageData.device_links_base.startsWith('../')
            ? `${'../'.repeat(depth + 1)}${pageData.device_links_base.substring(3)}`
            : (depth > 0 ? `${prefix}${pageData.device_links_base}` : pageData.device_links_base);
    }

    if (pageData.blog_url) {
        pageData.blog_url = depth === 0 ? 'blog/' : `${'../'.repeat(depth)}blog/`;
    }

    if (pageData.privacy_policy_url) {
        pageData.privacy_policy_url = pageData.privacy_policy_url.startsWith('../')
            ? `${'../'.repeat(depth + 1)}${pageData.privacy_policy_url.substring(3)}`
            : `${prefix}${pageData.privacy_policy_url}`;
    }

    if (lang === builder.defaultLanguage) {
        pageData.canonical_url = pageData.canonical_url.replace('/en/', '/');
    } else if (!pageData.canonical_url.includes(`/${lang}/`)) {
        pageData.canonical_url = pageData.canonical_url.replace(
            'https://screensizechecker.com/',
            `https://screensizechecker.com/${lang}/`
        );
    }

    pageData.canonical_url = pageData.canonical_url.replace(/\.html$/, '');
    pageData.og_url = pageData.canonical_url;
    pageData.og_title = pageData.page_title || pageData.og_title;
    pageData.og_description = pageData.description || pageData.og_description;

    if (!pageData.og_image) {
        pageData.og_image = 'https://screensizechecker.com/images/og-default.png';
    }

    const localeMap = {
        en: 'en_US',
        zh: 'zh_CN',
        de: 'de_DE',
        es: 'es_ES',
        pt: 'pt_BR'
    };
    pageData.og_locale = localeMap[lang] || 'en_US';
    pageData.base_url = 'https://screensizechecker.com';

    if (lang === builder.defaultLanguage) {
        pageData.page_path = pageData.canonical_url.replace('https://screensizechecker.com', '');
    } else {
        pageData.page_path = pageData.canonical_url.replace(`https://screensizechecker.com/${lang}`, '');
    }
    if (!pageData.page_path) {
        pageData.page_path = '/';
    }

    if (!pageData.hreflang_en_url) {
        pageData.hreflang_root_url = pageData.page_path === '/'
            ? 'https://screensizechecker.com/'
            : `https://screensizechecker.com${pageData.page_path}`;
        pageData.hreflang_en_url = pageData.hreflang_root_url;
        pageData.hreflang_zh_url = `https://screensizechecker.com/zh${pageData.page_path}`;
        pageData.hreflang_de_url = `https://screensizechecker.com/de${pageData.page_path}`;
        pageData.hreflang_es_url = `https://screensizechecker.com/es${pageData.page_path}`;
        pageData.hreflang_pt_url = `https://screensizechecker.com/pt${pageData.page_path}`;
    }

    pageData.structured_data = builder.generateStructuredData(pageData, lang);
    pageData.faq_structured_data = builder.generateFAQStructuredDataForPage(page.name, lang);

    return { pageData, outputPath };
}

function buildPageHtml(builder, page, lang, translations) {
    const { pageData, outputPath } = buildPageData(builder, page, lang, translations);

    let html = builder.buildPage(page.template, pageData);
    html = builder.translateContent(html, translations);
    html = builder.internalLinksProcessor.processPageLinks(html, page.name, lang);
    html = html.replace('<html lang="en">', `<html lang="${lang}">`);
    html = builder.fixStaticResourcePaths(html, outputPath);

    return { html, outputPath };
}

function runBuildPage(args = process.argv.slice(2)) {
    const options = parseArgs(args);

    prepareGeneratedComponents();

    const builder = new MultiLangBuilder();
    const config = loadPagesConfig();
    const pages = selectPages(config, options.pages);
    const languages = options.languages.length > 0 ? options.languages : [builder.defaultLanguage];

    languages.forEach(lang => {
        if (!builder.enabledLanguages.includes(lang)) {
            throw new Error(`不支持的语言: ${lang}`);
        }
    });

    ensurePreviewAssets(options.outputDir);
    builder.internalLinksProcessor.process(builder.translations);

    let builtPages = 0;

    languages.forEach(lang => {
        const translations = builder.translations.get(lang);
        if (!translations) {
            throw new Error(`缺少语言 ${lang} 的翻译资源`);
        }

        pages.forEach(page => {
            if (page.enabled_languages && !page.enabled_languages.includes(lang)) {
                return;
            }

            const { html, outputPath } = buildPageHtml(builder, page, lang, translations);
            const finalOutputPath = path.join(options.outputDir, outputPath);
            fs.mkdirSync(path.dirname(finalOutputPath), { recursive: true });
            fs.writeFileSync(finalOutputPath, html, 'utf8');
            console.log(`[build:page] Built ${outputPath}`);
            builtPages += 1;
        });
    });

    console.log(`\n[build:page] 完成，输出目录：${path.relative(ROOT, options.outputDir)}，共生成 ${builtPages} 个页面。`);
}

if (require.main === module) {
    try {
        runBuildPage();
    } catch (error) {
        console.error('\n[build:page] Failed:', error.message);
        process.exit(1);
    }
}

module.exports = { runBuildPage };
