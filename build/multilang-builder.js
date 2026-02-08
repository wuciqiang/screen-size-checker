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
        this.enabledLanguages = ['en', 'zh', 'de', 'es']; // 褰撳墠鍚敤鐨勮瑷€锛氳嫳鏂囥€佷腑鏂囥€佸痉璇€佽タ鐝墮璇?
        this.translations = new Map();
        this.internalLinksProcessor = new InternalLinksProcessor();
        
        // 璇█鍚嶇О鏄犲皠
        this.languageNames = {
            'en': 'English',
            'zh': 'Chinese',
            'de': 'Deutsch',
            'es': 'Espanol',
            'fr': 'Francais',
            'it': 'Italiano',
            'ja': 'Japanese',
            'ko': 'Korean',
            'pt': 'Portugues',
            'ru': 'Russian'
        };
        
        // 璇█浠ｇ爜澶у啓鏄犲皠锛堢敤浜嶶I鏄剧ず锛?
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
        console.log('\n Loading translations...');
        
        this.supportedLanguages.forEach(lang => {
            try {
                const translationPath = path.join(this.rootPath, 'locales', lang, 'translation.json');
                if (fs.existsSync(translationPath)) {
                    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
                    this.translations.set(lang, translations);
                    console.log(`[OK] Loaded ${lang} translations (${Object.keys(translations).length} keys)`);
                } else {
                    console.warn(`  Translation file not found: ${translationPath}`);
                }
            } catch (error) {
                console.error(`[ERROR] Error loading ${lang} translations:`, error.message);
            }
        });
    }
    
    // 鑾峰彇宓屽鐨勭炕璇戝€硷紝鏀寔濡?"ppiCalculator.pageTitle" 杩欐牱鐨勯敭
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

    // 缁熶竴鐨勫崥瀹RL鐢熸垚鍑芥暟 - 涓€鍔虫案閫哥殑瑙ｅ喅鏂规
    generateBlogUrl(depth, lang, isRootPage = false) {
        console.log(` Generating blog URL: depth=${depth}, lang=${lang}, isRootPage=${isRootPage}`);

        // 鑻辨枃锛堥粯璁よ瑷€锛夊湪鏍硅矾寰勶紝鍏朵粬璇█鍦ㄨ瑷€瀛愮洰褰?
        const isDefaultLang = lang === this.defaultLanguage;

        if (depth === 0) {
            // 鍦ㄦ牴鐩綍鎴栬瑷€鏍圭洰褰?
            if (isDefaultLang) {
                return 'blog/';
            } else {
                return 'blog/';
            }
        } else {
            // 鍦ㄥ瓙鐩綍涓紝闇€瑕佸洖鍒版牴鐩綍
            const backToRoot = '../'.repeat(depth);
            if (isDefaultLang) {
                // 鑻辨枃锛氬洖鍒版牴璺緞鍚庤繘鍏?blog/
                return `${backToRoot}blog/`;
            } else {
                // 鍏朵粬璇█锛氬洖鍒版牴璺緞鍚庤繘鍏ヨ瑷€鐩綍鍐嶈繘鍏?blog/
                // 浣嗗疄闄呬笂鐜板湪宸茬粡鍦ㄨ瑷€瀛愮洰褰曚腑浜嗭紝鎵€浠ュ彧闇€瑕佸洖鍒拌瑷€鏍?
                return `${backToRoot}blog/`;
            }
        }
    }
    
    // 澶勭悊缈昏瘧鏇挎崲
    translateContent(content, translations) {
        if (!translations) return content;
        
        // 淇meta description鏍囩鐨凥TML缁撴瀯閿欒
        let result = content;
        
        // 鏌ユ壘骞朵慨澶嶇牬鍧忕殑meta description鏍囩
        result = result.replace(/<meta\s+name="description"[^>]*content="([^"]*)"[^>]*>([^<]*?)<meta\s+name="keywords"/g, (match, contentValue, extraText) => {
            console.log(' Fixing broken meta description tag');
            if (extraText.trim()) {
                console.log(' Removing extra text:', extraText.trim());
            }
            return `<meta name="description" content="${contentValue}">
<meta name="keywords"`;
        });
        
        // 鏇挎崲 data-i18n 灞炴€у搴旂殑鏂囨湰鍐呭锛堝鐞嗘爣绛惧唴瀹癸級
        result = result.replace(/data-i18n="([^"]+)"[^>]*>([^<]*)</g, (match, key, originalText) => {
            // 鐗规畩澶勭悊锛氬鏋滄槸title鏍囩锛屽畬鍏ㄨ烦杩囩炕璇戝鐞嗭紝淇濇寔椤甸潰鐗瑰畾鐨勬爣棰?
            if (key === 'title') {
                // 妫€鏌ユ槸鍚︽槸title鏍囩
                const beforeMatch = result.substring(0, result.indexOf(match));
                const lastTitleIndex = beforeMatch.lastIndexOf('<title');
                const lastCloseTitleIndex = beforeMatch.lastIndexOf('</title>');
                
                // 濡傛灉鏈€杩戠殑<title鏍囩鍦ㄦ渶杩戠殑</title>鏍囩涔嬪悗锛岃鏄庤繖鏄痶itle鏍囩鍐呭
                if (lastTitleIndex > lastCloseTitleIndex) {
                    console.log(`   Skipping title translation for: "${originalText}"`);
                    return match;
                }
            }
            
            const translation = this.getNestedTranslation(translations, key);
            if (translation) {
                return match.replace(originalText, translation);
            }
            return match;
        });
        
        // 鏇挎崲妯℃澘鍙橀噺濡?{{t:key}}
        result = result.replace(/\{\{t:(\w+)\}\}/g, (match, key) => {
            return this.getNestedTranslation(translations, key) || match;
        });
        
        return result;
    }
    
    // 杩愯缈昏瘧楠岃瘉
    async runTranslationValidation() {
        console.log('\n Validating translations...');
        
        try {
            const validator = new TranslationValidator();
            const result = await validator.runValidation({
                componentsDir: 'components',
                localesDir: 'locales',
                languages: ['en', 'zh'],
                outputPath: 'build/translation-validation-report.json'
            });
            
            if (!result.success) {
                console.error('[ERROR] Translation validation failed:', result.error);
                return { success: false, error: result.error };
            }
            
            if (result.hasErrors) {
                console.warn('  Translation validation found issues, but continuing build...');
                console.warn(`   Missing translations: ${result.report.summary.missingTranslations}`);
                console.warn(`   Inconsistent keys: ${result.report.summary.inconsistentKeys}`);
            } else {
                console.log('[OK] Translation validation passed');
            }
            
            return result;
            
        } catch (error) {
            console.error('[ERROR] Translation validation error:', error);
            return { success: false, error: error.message };
        }
    }

    // 鑾峰彇杈撳嚭璺緞锛堣嫳鏂囪緭鍑哄埌鏍圭洰褰曪紝鍏朵粬璇█杈撳嚭鍒板搴旂洰褰曪級
    getOutputPath(pageOutput, lang) {
        if (lang === this.defaultLanguage) {
            // 鑻辨枃杈撳嚭鍒版牴鐩綍
            return pageOutput;
        }
        // 鍏朵粬璇█杈撳嚭鍒拌瑷€瀛愮洰褰?
        return path.join(lang, pageOutput);
    }
    
    // 鑾峰彇URL璺緞锛堣嫳鏂囨棤鍓嶇紑锛屽叾浠栬瑷€鏈夊墠缂€锛?
    getUrlPath(pagePath, lang) {
        if (lang === this.defaultLanguage) {
            return `/${pagePath.replace('.html', '')}`;
        }
        return `/${lang}/${pagePath.replace('.html', '')}`;
    }
    
    // 鐢熸垚澶氳瑷€椤甸潰
    buildMultiLangPages() {
        console.log('\n Building multilingual pages...');
        console.log(' URL');
        
        // 澶勭悊鍐呴摼閰嶇疆
        const internalLinksResult = this.internalLinksProcessor.process(this.translations);
        if (!internalLinksResult.success) {
            console.error('[ERROR] Internal links processing failed, continuing with build...');
        }
        
        // 浣跨敤绫诲睘鎬т腑瀹氫箟鐨勫惎鐢ㄨ瑷€
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

        // 纭繚鏋勫缓鐩綍瀛樺湪 - 瀹屽叏娓呴櫎骞堕噸鏂板垱寤?
        const outputDir = 'multilang-build';
        if (fs.existsSync(outputDir)) {
            // 鍒犻櫎鏁翠釜鐩綍 - 浣跨敤閫掑綊鍒犻櫎
            try {
                fs.rmSync(outputDir, { recursive: true, force: true });
                console.log('[OK] Cleared existing build directory');
            } catch (error) {
                console.warn('  Warning: Could not remove existing directory:', error.message);
            }
        }
        fs.mkdirSync(outputDir, { recursive: true });

        // 涓烘瘡绉嶅惎鐢ㄧ殑璇█鏋勫缓椤甸潰
        for (const lang of enabledLanguages) {
            console.log(`\n Building pages for language: ${lang.toUpperCase()}`);
            
            // 鑻辨枃杈撳嚭鍒版牴鐩綍锛屽叾浠栬瑷€杈撳嚭鍒拌瑷€瀛愮洰褰?
            const langDir = lang === this.defaultLanguage ? outputDir : path.join(outputDir, lang);
            fs.mkdirSync(langDir, { recursive: true });
            
            if (lang === this.defaultLanguage) {
                console.log(`     English pages will be built at root directory`);
            } else {
                console.log(`     ${lang.toUpperCase()} pages will be built at /${lang}/ directory`);
            }

            // 鍔犺浇璇ヨ瑷€鐨勭炕璇戞枃浠?
            const translationPath = path.join('locales', lang, 'translation.json');
            let translations = {};
            
            try {
                translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
                console.log(`[OK] Loaded translations for ${lang}`);
            } catch (error) {
                console.warn(`    Warning: Could not load translations for ${lang}:`, error.message);
                continue; // 璺宠繃娌℃湁缈昏瘧鏂囦欢鐨勮瑷€
            }

            buildReport.pages[lang] = [];
            
            // 涓鸿璇█鍒涘缓蹇呰鐨勫瓙鐩綍
            const deviceDir = path.join(langDir, 'devices');
            fs.mkdirSync(deviceDir, { recursive: true });
            
            // 鏋勫缓璇ヨ瑷€鐨勬墍鏈夐〉闈?
            for (const page of config.pages) {
                // 妫€鏌ラ〉闈㈡槸鍚﹂檺鍒朵簡鐗瑰畾璇█
                if (page.enabled_languages && !page.enabled_languages.includes(lang)) {
                    continue; // 璺宠繃涓嶉€傜敤浜庡綋鍓嶈瑷€鐨勯〉闈?
                }
                
                totalPages++;
                
                try {
                    const outputPath = this.getOutputPath(page.output, lang);
                    console.log(`   Building ${outputPath}`);
                    
                    // 鍑嗗椤甸潰鏁版嵁骞惰皟鏁磋矾寰?
                    const pageData = {
                        lang: lang,
                        lang_prefix: lang === this.defaultLanguage ? '' : `/${lang}`,
                        lang_code: lang.toUpperCase(),
                        page_content: page.page_content,
                        ...page.config
                    };
                    
                    // 娣诲姞瀵艰埅鐘舵€佹爣璇?
                    const pagePath = page.path || page.config.path || outputPath || '';
                    
                    pageData.is_home = pagePath === 'index.html' || pagePath === '';
                    pageData.is_blog = pagePath.includes('blog/') || pagePath.startsWith('blog');
                    
                    // 濡傛灉椤甸潰閰嶇疆涓凡缁忚缃簡瀵艰埅鐘舵€侊紝浣跨敤閰嶇疆鐨勫€?
                    if (typeof page.config.is_gaming !== 'undefined') {
                        pageData.is_gaming = page.config.is_gaming;
                        pageData.is_tools = page.config.is_tools || false;
                        pageData.is_devices = page.config.is_devices || false;
                    } else {
                        // 鍖哄垎 Tools 鍜?Devices锛堟帓闄ub椤甸潰锛?
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
                    
                    // 浠庣炕璇戞枃浠朵腑鑾峰彇椤甸潰鐗瑰畾鐨勭炕璇戝€?
                    if (pageData.page_title_key) {
                        // 鏀寔宓屽鐨勭炕璇戦敭锛屽 "ppiCalculator.pageTitle"
                        const translationValue = this.getNestedTranslation(translations, pageData.page_title_key);
                        if (translationValue) {
                            pageData.page_title = translationValue;
                        } else {
                            // 濡傛灉娌℃湁鎵惧埌缈昏瘧锛屼娇鐢ㄩ粯璁ょ殑og_title
                            pageData.page_title = pageData.og_title || 'Screen Size Checker';
                        }
                    } else {
                        pageData.page_title = pageData.og_title || 'Screen Size Checker';
                    }
                    
                    // 纭繚title鍙橀噺涔熻璁剧疆锛堢敤浜巋ead.html缁勪欢锛?
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
                    // 淇description娉ㄥ叆閫昏緫锛屾敮鎸佸祵濂楃炕璇戦敭
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
                    
                    // 璋冩暣闈欐€佽祫婧愯矾寰?
                    const depth = page.output.split('/').length - 1;
                    // 瀹氫箟 prefix 鐢ㄤ簬鍚庣画璺緞璁＄畻
                    const prefix = depth > 0 ? '../'.repeat(depth) : '';
                    
                    if (lang === this.defaultLanguage) {
                        // 鑻辨枃鍦ㄦ牴鐩綍
                        if (depth === 0) {
                            // 鏍圭洰褰曚富椤?
                            pageData.css_path = 'css';
                            pageData.locales_path = 'locales';
                            pageData.js_path = 'js';
                        } else {
                            // 瀛愮洰褰曢〉闈?
                            pageData.css_path = prefix + 'css';
                            pageData.locales_path = prefix + 'locales';
                            pageData.js_path = prefix + 'js';
                        }
                    } else {
                        // 鍏朵粬璇█鍦ㄨ瑷€瀛愮洰褰?
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
                    
                    // 鏇存柊鐩稿閾炬帴璺緞
                    if (pageData.home_url) {
                        if (lang === this.defaultLanguage) {
                            // 鑻辨枃锛氬洖鍒版牴鐩綍
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        } else {
                            // 鍏朵粬璇█锛氬洖鍒拌瑷€鏍圭洰褰?
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        }
                    }
                    
                    if (pageData.device_links_base) {
                        pageData.device_links_base = pageData.device_links_base.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.device_links_base.substring(3)
                            : (depth > 0 ? prefix + pageData.device_links_base : pageData.device_links_base);
                    }
                    
                    // 淇鍗氬URL
                    if (pageData.blog_url) {
                        if (lang === this.defaultLanguage) {
                            // 鑻辨枃鍗氬鍦ㄦ牴鐩綍 /blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        } else {
                            // 鍏朵粬璇█鍗氬鍦ㄥ悇鑷殑璇█鐩綍涓?/zh/blog/, /de/blog/, /es/blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        }
                    }
                    
                    if (pageData.privacy_policy_url) {
                        pageData.privacy_policy_url = pageData.privacy_policy_url.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.privacy_policy_url.substring(3)
                            : prefix + pageData.privacy_policy_url;
                    }
                    
                    // 鏇存柊璇█鐩稿叧鐨刄RL鍜岃矾寰?
                    if (lang === this.defaultLanguage) {
                        // 鑻辨枃URL涓嶉渶瑕佽瑷€鍓嶇紑
                        // 纭繚涓嶅寘鍚?/en/ 鍓嶇紑
                        pageData.canonical_url = pageData.canonical_url.replace('/en/', '/');
                    } else {
                        // 鍏朵粬璇█闇€瑕佽瑷€鍓嶇紑
                        if (!pageData.canonical_url.includes(`/${lang}/`)) {
                            pageData.canonical_url = pageData.canonical_url.replace(
                                'https://screensizechecker.com/',
                                `https://screensizechecker.com/${lang}/`
                            );
                        }
                    }
                    
                    // 绉婚櫎.html鍚庣紑浠ュ尮閰岰loudflare Pages鐨刄RL鏍煎紡
                    pageData.canonical_url = pageData.canonical_url.replace(/\.html$/, '');
                    pageData.og_url = pageData.canonical_url;
                    
                    // 鏇存柊Open Graph鏁版嵁浠ヤ娇鐢ㄧ炕璇戝悗鐨勫唴瀹?
                    pageData.og_title = pageData.page_title || pageData.og_title;
                    pageData.og_description = pageData.description || pageData.og_description;

                    // 璁剧疆og:image - 浣跨敤椤甸潰鐗瑰畾鍥剧墖鎴栭粯璁ゅ垎浜浘
                    if (!pageData.og_image) {
                        pageData.og_image = 'https://screensizechecker.com/images/og-default.png';
                    }

                    // 璁剧疆og:locale
                    const localeMap = {
                        'en': 'en_US',
                        'zh': 'zh_CN',
                        'de': 'de_DE',
                        'es': 'es_ES'
                    };
                    pageData.og_locale = localeMap[lang] || 'en_US';
                    
                    // 娣诲姞hreflang鐩稿叧鏁版嵁
                    pageData.base_url = 'https://screensizechecker.com';
                    
                    // 璁＄畻椤甸潰璺緞锛堜笉鍖呭惈璇█鍓嶇紑锛?
                    if (lang === this.defaultLanguage) {
                        pageData.page_path = pageData.canonical_url.replace('https://screensizechecker.com', '');
                    } else {
                        pageData.page_path = pageData.canonical_url.replace(`https://screensizechecker.com/${lang}`, '');
                    }
                    if (!pageData.page_path) {
                        pageData.page_path = '/';
                    }
                    
                    // 涓篽reflang鏍囩璁剧疆姝ｇ‘鐨刄RL
                    // 濡傛灉椤甸潰閰嶇疆涓凡鏈塰reflang URL锛堝鍗氬鏍囩椤电殑璺ㄨ瑷€鏄犲皠锛夛紝鍒欎繚鐣?
                    // 鍚﹀垯鍩轰簬page_path璁＄畻
                    if (!pageData.hreflang_en_url) {
                        // x-default 鍜岃嫳鏂囩増鏈兘鎸囧悜鏍硅矾寰勶紙鏃?/en/ 鍓嶇紑锛?
                        pageData.hreflang_root_url = pageData.page_path === '/' ?
                            'https://screensizechecker.com/' :
                            `https://screensizechecker.com${pageData.page_path}`;

                        pageData.hreflang_en_url = pageData.hreflang_root_url;

                        // 涓枃鐗堟湰
                        pageData.hreflang_zh_url = `https://screensizechecker.com/zh${pageData.page_path}`;

                        // 寰疯鐗堟湰
                        pageData.hreflang_de_url = `https://screensizechecker.com/de${pageData.page_path}`;

                        // 瑗胯鐗堟湰
                        pageData.hreflang_es_url = `https://screensizechecker.com/es${pageData.page_path}`;
                    }
                    
                    // 娣诲姞缁撴瀯鍖栨暟鎹?
                    pageData.structured_data = this.generateStructuredData(pageData, lang);
                    
                    // 涓烘牳蹇冨伐鍏烽〉闈㈡敞鍏AQ缁撴瀯鍖栨暟鎹紝鎻愬崌SERP瀵岀粨鏋滄満浼?
                    pageData.faq_structured_data = this.generateFAQStructuredDataForPage(page.name, lang);
                    
                    // 鏋勫缓HTML
                    let html = this.buildPage(page.template, pageData);
                    
                    // 搴旂敤缈昏瘧
                    html = this.translateContent(html, translations);
                    
                    // 澶勭悊鍐呴摼
                    html = this.internalLinksProcessor.processPageLinks(html, page.name, lang);
                    
                    // 淇HTML缁撴瀯閿欒 - 绉婚櫎meta鏍囩鍚庣殑閲嶅鏂囧瓧
                    html = html.replace(/<meta name="description"[^>]*content="([^"]*)"[^>]*>([^<]*)<meta name="keywords"/g, (match, contentValue, extraText) => {
                        if (extraText && extraText.trim()) {
                            console.log(' Fixed meta description duplicate text');
                            return `<meta name="description" content="${contentValue}">
<meta name="keywords"`;
                        }
                        return match;
                    });
                    
                    // 鏇存柊HTML lang灞炴€?
                    html = html.replace('<html lang="en">', `<html lang="${lang}">`);
                    
                    // 淇闈欐€佽祫婧愯矾寰?
                    const fullOutputPath = lang === this.defaultLanguage ? page.output : path.join(lang, page.output);
                    html = this.fixStaticResourcePaths(html, fullOutputPath);
                    
                    // 鍐欏叆鏂囦欢
                    const finalOutputPath = path.join(langDir, page.output);
                    const outputDirPath = path.dirname(finalOutputPath);
                    
                    if (!fs.existsSync(outputDirPath)) {
                        fs.mkdirSync(outputDirPath, { recursive: true });
                    }
                    
                    fs.writeFileSync(finalOutputPath, html);
                    
                    const displayPath = lang === this.defaultLanguage ? page.output : `${lang}/${page.output}`;
                    console.log(`[OK] Built: ${displayPath}`);
                    successfulBuilds++;
                    
                    buildReport.pages[lang].push({
                        name: page.name,
                        output: page.output,
                        status: 'success',
                        canonical_url: pageData.canonical_url
                    });
                    
                } catch (error) {
                    console.error(`[ERROR] Failed to build ${lang}/${page.output}:`, error.message);
                    
                    buildReport.pages[lang].push({
                        name: page.name,
                        output: page.output,
                        status: 'failed',
                        error: error.message
                    });
                }
            }
        }

        // 鏇存柊 supportedLanguages 鍙寘鍚惎鐢ㄧ殑璇█
        this.supportedLanguages = enabledLanguages;

        buildReport.summary = {
            totalPages,
            successfulBuilds,
            languages: enabledLanguages.length,
            enabledOnly: true
        };

        console.log(`\n Build Summary:`);
        console.log(`   Languages: ${enabledLanguages.length} (enabled only)`);
        console.log(`    Total pages: ${totalPages}`);
        console.log(`[OK] Successful: ${successfulBuilds}/${totalPages}`);
        console.log(`[OK] Failed: ${totalPages - successfulBuilds}/${totalPages}`);

        // 淇濆瓨鏋勫缓鎶ュ憡
        fs.writeFileSync(
            path.join(outputDir, 'build-report.json'),
            JSON.stringify(buildReport, null, 2)
        );

        // 澶嶅埗闈欐€佽祫婧愶紙鍙鍒堕渶瑕佺殑鏂囦欢锛?
        this.copyRequiredStaticResources(outputDir);
        
        // 闆嗘垚鎬ц兘鐩戞帶绯荤粺
        this.integratePerformanceMonitoring(outputDir);
        
        // 鐢熸垚璇█閫夋嫨绱㈠紩椤甸潰
        this.generateLanguageIndex(outputDir);
        
        // 鐢熸垚澶氳瑷€缃戠珯鍦板浘锛堝彧鍖呭惈鍚敤鐨勮瑷€锛?
        this.generateMultiLanguageSitemap(outputDir);
        
        // 鎵ц鍐呭涓€鑷存€ф鏌?
        this.validateContentConsistency(outputDir);
        
        // 鎻愬彇骞跺唴鑱斿叧閿瓹SS (涓存椂绂佺敤浠ヤ慨澶岺TML缁撴瀯闂)
        // this.extractAndInlineCriticalCSS(outputDir);

        return buildReport;
    }
    
    // 閫掑綊鍒犻櫎鐩綍锛堝吋瀹规€ф柟娉曪級
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

    // 澶嶅埗闈欐€佽祫婧愭枃浠?
    copyStaticResources(outputDir) {
        console.log('\n Copying static resources...');
        
        const resourcesToCopy = [
            { source: 'css', dest: 'css' },
            { source: 'js', dest: 'js' },
            { source: 'locales', dest: 'locales' },
            { source: 'data', dest: 'data' },
            { source: 'favicon.ico', dest: 'favicon.ico' },
            { source: 'favicon.png', dest: 'favicon.png' },
            { source: 'robots.txt', dest: 'robots.txt' },
            { source: 'ads.txt', dest: 'ads.txt' },
            { source: 'privacy-policy.html', dest: 'privacy-policy.html' },
            { source: 'terms-of-service.html', dest: 'terms-of-service.html' },
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
                        // 澶嶅埗鐩綍
                        this.copyDirectory(sourcePath, destPath);
                        console.log(`[OK] Copied directory: ${source}`);
                    } else {
                        // 澶嶅埗鏂囦欢
                        fs.copyFileSync(sourcePath, destPath);
                        console.log(`[OK] Copied file: ${source}`);
                    }
                } catch (error) {
                    console.warn(`    Failed to copy ${source}:`, error.message);
                }
            } else {
                console.warn(`    Resource not found: ${source}`);
            }
        });
        
        console.log(' Static resources copied successfully!');
    }
    
    // 閫掑綊澶嶅埗鐩綍
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

    // 澶嶅埗蹇呰鐨勯潤鎬佽祫婧愶紙閬垮厤澶嶅埗鏈惎鐢ㄧ殑璇█鐩綍锛?
    copyRequiredStaticResources(outputDir) {
        console.log('\n Copying required static resources...');
        
        // 闇€瑕佺洿鎺ュ鍒剁殑璧勬簮锛堜笉鍖呮嫭robots.txt鍜宊redirects锛岃繖浜涘皢鍔ㄦ€佺敓鎴愶級
        const resourcesToCopy = [
            'css',
            'js',
            'locales',
            'data',
            'favicon.ico',
            'favicon.png',
            'ads.txt',
            'structured-data.json',
            'privacy-policy.html',
            'terms-of-service.html',
            'googlec786a02f43170c4d.html',
            '965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead.txt'
        ];
        
        // 鍗氬鍥剧墖璧勬簮锛堝崟鐙鐞嗭紝鍥犱负闇€瑕佸鍒跺埌鐗瑰畾浣嶇疆锛?
        const blogImagesSource = path.join(this.rootPath, 'blog-content', 'images');
        const blogImagesTarget = path.join(outputDir, 'images');
        
        if (fs.existsSync(blogImagesSource)) {
            try {
                this.copyDirectoryRecursive(blogImagesSource, blogImagesTarget);
                console.log('[OK] Copied blog images directory: blog-content/images -> images');
            } catch (error) {
                console.warn('    Warning: Could not copy blog images:', error.message);
            }
        } else {
            console.warn('    Warning: blog-content/images not found, skipping');
        }

        for (const resource of resourcesToCopy) {
            const sourcePath = path.join(this.rootPath, resource);
            const targetPath = path.join(outputDir, resource);
            
            if (fs.existsSync(sourcePath)) {
                try {
                    if (fs.statSync(sourcePath).isDirectory()) {
                        this.copyDirectoryRecursive(sourcePath, targetPath);
                        console.log(`[OK] Copied directory: ${resource}`);
                    } else {
                        fs.copyFileSync(sourcePath, targetPath);
                        console.log(`[OK] Copied file: ${resource}`);
                    }
                } catch (error) {
                    console.warn(`    Warning: Could not copy ${resource}:`, error.message);
                }
            } else {
                console.warn(`    Warning: ${resource} not found, skipping`);
            }
        }
        
        // 鐢熸垚浼樺寲鐨刜redirects鍜宺obots.txt鏂囦欢
        this.generateRedirectsFile(outputDir);
        this.generateRobotsFile(outputDir);
    }

    // 閫掑綊澶嶅埗鐩綍
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

    // 闆嗘垚鎬ц兘鐩戞帶绯荤粺
    integratePerformanceMonitoring(outputDir) {
        console.log('\n Integrating Performance Monitoring System...');
        
        try {
            // 1. 楠岃瘉鎬ц兘鐩戞帶鏂囦欢鏄惁瀛樺湪
            const performanceMonitorPath = path.join(outputDir, 'js', 'performance-monitor.js');
            const appJsPath = path.join(outputDir, 'js', 'app.js');
            
            if (!fs.existsSync(performanceMonitorPath)) {
                console.warn('    Warning: performance-monitor.js not found, skipping integration');
                return;
            }
            
            if (!fs.existsSync(appJsPath)) {
                console.warn('    Warning: app.js not found, skipping integration');
                return;
            }
            
            // 2. 楠岃瘉 app.js 鏄惁鍖呭惈鎬ц兘鐩戞帶瀵煎叆
            const appJsContent = fs.readFileSync(appJsPath, 'utf8');
            if (!appJsContent.includes("import { performanceMonitor } from './performance-monitor.js'")) {
                console.warn('    Warning: app.js does not import performance monitor');
            } else {
                console.log('[OK] app.js includes performance monitor import');
            }
            
            // 3. 鍒涘缓鎬ц兘鐩戞帶娴嬭瘯椤甸潰
            this.createPerformanceTestPage(outputDir);
            
            // 4. 鐢熸垚鎬ц兘鐩戞帶閮ㄧ讲鎶ュ憡
            this.generatePerformanceDeploymentReport(outputDir);
            
            // 5. 楠岃瘉鍏抽敭鏂囦欢
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
                    console.log(`[OK] ${file} (${this.formatFileSize(stats.size)})`);
                } else {
                    console.warn(`[WARN] Missing required file: ${file}`);
                    allFilesExist = false;
                }
            }
            
            if (allFilesExist) {
                console.log('[OK] Performance monitoring system integration completed successfully');
            } else {
                console.warn('    Performance monitoring system integration completed with warnings');
            }
            
        } catch (error) {
            console.error('[ERROR] Error integrating performance monitoring system:', error.message);
        }
    }

    // 鍒涘缓鎬ц兘鐩戞帶娴嬭瘯椤甸潰
    createPerformanceTestPage(outputDir) {
        const testPagePath = path.join(outputDir, 'performance-test-production.html');
        
        const testPageContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>鐢熶骇鐜鎬ц兘鐩戞帶娴嬭瘯</title>
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
        <h1>馃殌 鐢熶骇鐜鎬ц兘鐩戞帶娴嬭瘯</h1>
        <p>姝ら〉闈㈢敤浜庨獙璇佹€ц兘鐩戞帶绯荤粺鍦ㄧ敓浜х幆澧冧腑鏄惁姝ｅ父宸ヤ綔銆?/p>
        
        <div class="status-card">
            <h3>
                <span id="system-status" class="status-indicator error"></span>
                绯荤粺鐘舵€佹鏌?
            </h3>
            <div id="status-message">姝ｅ湪妫€鏌ョ郴缁熺姸鎬?..</div>
            <button onclick="checkSystemStatus()">馃攧 閲嶆柊妫€鏌?/button>
        </div>
        
        <div class="status-card">
            <h3>馃搳 Core Web Vitals 鐩戞帶</h3>
            <div id="cwv-status">姝ｅ湪鏀堕泦鎬ц兘鏁版嵁...</div>
            <div class="metrics-display" id="cwv-display">绛夊緟鏁版嵁...</div>
            <button onclick="refreshMetrics()">馃搱 鍒锋柊鎸囨爣</button>
            <button onclick="exportData()">馃摛 瀵煎嚭鏁版嵁</button>
        </div>
        
        <div class="status-card">
            <h3>馃И 鍔熻兘娴嬭瘯</h3>
            <p>杩愯浠ヤ笅娴嬭瘯鏉ラ獙璇佺洃鎺х郴缁熺殑鍚勯」鍔熻兘锛?/p>
            
            <button onclick="testLongTask()">鈴憋笍 娴嬭瘯闀夸换鍔＄洃鎺?/button>
            <button onclick="testLayoutShift()">馃搻 娴嬭瘯甯冨眬鍋忕Щ鐩戞帶</button>
            <button onclick="testResourceLoading()">馃摝 娴嬭瘯璧勬簮鐩戞帶</button>
            
            <div id="test-results" class="metrics-display" style="min-height: 150px;">
                娴嬭瘯缁撴灉灏嗘樉绀哄湪杩欓噷...
            </div>
        </div>
    </div>
    
    <script type="module">
        let testLog = [];
        let performanceMonitor = null;
        
        // 灏濊瘯瀵煎叆鎬ц兘鐩戞帶妯″潡
        async function initializeMonitoring() {
            try {
                const module = await import('./js/performance-monitor.js');
                performanceMonitor = module.performanceMonitor;
                
                if (performanceMonitor) {
                    addTestLog('鉁?鎬ц兘鐩戞帶妯″潡鍔犺浇鎴愬姛');
                    updateSystemStatus('good', '鎬ц兘鐩戞帶绯荤粺杩愯姝ｅ父');
                    return true;
                } else {
                    throw new Error('鎬ц兘鐩戞帶瀹炰緥鏈壘鍒?);
                }
            } catch (error) {
                addTestLog(\`鉂?鎬ц兘鐩戞帶妯″潡鍔犺浇澶辫触: \${error.message}\`);
                updateSystemStatus('error', \`绯荤粺鍔犺浇澶辫触: \${error.message}\`);
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
        
        // 鍏ㄥ眬鍑芥暟
        window.checkSystemStatus = async function() {
            addTestLog('馃攳 寮€濮嬬郴缁熺姸鎬佹鏌?..');
            
            const checks = [
                {
                    name: 'HTTPS 鐜',
                    test: () => location.protocol === 'https:' || location.hostname === 'localhost',
                    message: 'HTTPS 鐜妫€鏌?
                },
                {
                    name: 'PerformanceObserver 鏀寔',
                    test: () => 'PerformanceObserver' in window,
                    message: 'PerformanceObserver API 鏀寔'
                }
            ];
            
            let allPassed = true;
            
            for (const check of checks) {
                try {
                    const result = check.test();
                    if (result) {
                        addTestLog(\`鉁?\${check.message}: 閫氳繃\`);
                    } else {
                        addTestLog(\`鉂?\${check.message}: 澶辫触\`);
                        allPassed = false;
                    }
                } catch (error) {
                    addTestLog(\`鉂?\${check.message}: 閿欒 - \${error.message}\`);
                    allPassed = false;
                }
            }
            
            const monitoringOk = await initializeMonitoring();
            
            if (allPassed && monitoringOk) {
                updateSystemStatus('good', '鉁?鎵€鏈夌郴缁熸鏌ラ€氳繃锛屾€ц兘鐩戞帶姝ｅ父杩愯');
            } else {
                updateSystemStatus('error', '鉂?绯荤粺妫€鏌ュ彂鐜伴棶棰橈紝璇锋煡鐪嬫祴璇曟棩蹇?);
        };
        
        window.refreshMetrics = function() {
            if (!performanceMonitor) {
                addTestLog('鉂?鎬ц兘鐩戞帶绯荤粺鏈垵濮嬪寲');
                return;
            }
            
            try {
                const metrics = performanceMonitor.getMetrics();
                const cwv = metrics.coreWebVitals;
                
                let display = '馃搳 Core Web Vitals 褰撳墠鏁版嵁:\\n\\n';
                
                if (cwv.LCP.value !== null) {
                    const rating = cwv.LCP.rating;
                    const icon = rating === 'good' ? '鉁? : rating === 'needs-improvement' ? '鈿狅笍' : '鉂?;
                    display += \`\${icon} LCP: \${cwv.LCP.value.toFixed(0)}ms (\${rating})\\n\`;
                } else {
                    display += '鈴?LCP: 姝ｅ湪娴嬮噺...\\n';
                }
                
                if (cwv.FID.value !== null) {
                    const rating = cwv.FID.rating;
                    const icon = rating === 'good' ? '鉁? : rating === 'needs-improvement' ? '鈿狅笍' : '鉂?;
                    display += \`\${icon} FID: \${cwv.FID.value.toFixed(0)}ms (\${rating})\\n\`;
                } else {
                    display += '鈴?FID: 绛夊緟鐢ㄦ埛浜や簰...\\n';
                }
                
                if (cwv.CLS.value !== null) {
                    const rating = cwv.CLS.rating;
                    const icon = rating === 'good' ? '鉁? : rating === 'needs-improvement' ? '鈿狅笍' : '鉂?;
                    display += \`\${icon} CLS: \${cwv.CLS.value.toFixed(3)} (\${rating})\\n\`;
                } else {
                    display += '鈴?CLS: 姝ｅ湪鐩戞帶...\\n';
                }
                
                display += \`\\n馃搱 缁煎悎鎬ц兘璇勫垎: \${metrics.performanceScore}/100\\n\`;
                display += \`馃搳 闀夸换鍔℃暟閲? \${metrics.longTasksCount}\\n\`;
                display += \`馃摝 璧勬簮鐩戞帶鏁伴噺: \${metrics.resourceTimingsCount}\`;
                
                document.getElementById('cwv-display').textContent = display;
                document.getElementById('cwv-status').innerHTML = 
                    \`<div class="alert alert-success">鉁?鎬ц兘鏁版嵁鏀堕泦姝ｅ父锛岃瘎鍒? \${metrics.performanceScore}/100</div>\`;
                
                addTestLog('馃搳 鎬ц兘鎸囨爣宸插埛鏂?);
                
            } catch (error) {
                addTestLog(\`鉂?鍒锋柊鎸囨爣澶辫触: \${error.message}\`);
        };
        
        window.testLongTask = function() {
            addTestLog('鈴憋笍 寮€濮嬮暱浠诲姟娴嬭瘯...');
            
            const start = performance.now();
            while (performance.now() - start < 100) {
                // 闃诲涓荤嚎绋?
            }
            
            setTimeout(() => {
                if (performanceMonitor) {
                    const metrics = performanceMonitor.getMetrics();
                    addTestLog(\`鉁?闀夸换鍔℃祴璇曞畬鎴愶紝妫€娴嬪埌 \${metrics.longTasksCount} 涓暱浠诲姟\`);
                }
            }, 500);
        };
        
        window.testLayoutShift = function() {
            addTestLog('馃搻 寮€濮嬪竷灞€鍋忕Щ娴嬭瘯...');
            
            const testDiv = document.createElement('div');
            testDiv.style.cssText = \`
                height: 100px;
                background: #ffeb3b;
                margin: 10px 0;
                padding: 20px;
                border-radius: 5px;
            \`;
            testDiv.textContent = '杩欐槸娴嬭瘯甯冨眬鍋忕Щ鐨勫姩鎬佸唴瀹?;
            
            document.body.appendChild(testDiv);
            
            setTimeout(() => {
                testDiv.remove();
                if (performanceMonitor) {
                    const cls = performanceMonitor.getMetric('CLS');
                    addTestLog(\`鉁?甯冨眬鍋忕Щ娴嬭瘯瀹屾垚锛屽綋鍓?CLS: \${cls !== null ? cls.toFixed(3) : '鏈祴閲?}\`);
                }
            }, 2000);
        };
        
        window.testResourceLoading = function() {
            addTestLog('馃摝 寮€濮嬭祫婧愬姞杞芥祴璇?..');
            
            const img = new Image();
            img.onload = () => {
                addTestLog('鉁?娴嬭瘯鍥剧墖鍔犺浇瀹屾垚');
                if (performanceMonitor) {
                    const metrics = performanceMonitor.getMetrics();
                    addTestLog(\`馃搳 褰撳墠鐩戞帶璧勬簮鏁伴噺: \${metrics.resourceTimingsCount}\`);
                }
            };
            img.onerror = () => {
                addTestLog('鉂?娴嬭瘯鍥剧墖鍔犺浇澶辫触');
            };
            img.src = \`data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2NiYSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=\`;
        };
        
        window.exportData = function() {
            if (!performanceMonitor) {
                addTestLog('鉂?鎬ц兘鐩戞帶绯荤粺鏈垵濮嬪寲锛屾棤娉曞鍑烘暟鎹?);
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
                
                console.log('[DATA] Export data:', exportData);
                addTestLog('馃摛 鎬ц兘鏁版嵁宸插鍑哄埌鎺у埗鍙?);
                
            } catch (error) {
                addTestLog(\`鉂?鏁版嵁瀵煎嚭澶辫触: \${error.message}\`);
        };
        
        // 鍒濆鍖?
        setTimeout(async () => {
            addTestLog('馃殌 鐢熶骇鐜鎬ц兘鐩戞帶娴嬭瘯椤甸潰宸插姞杞?);
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
        
        console.log('Performance monitor test page loaded');
    </script>
</body>
</html>`;
        
        fs.writeFileSync(testPagePath, testPageContent);
        console.log('[OK] Created performance test page: performance-test-production.html');
    }

    // 鐢熸垚鎬ц兘鐩戞帶閮ㄧ讲鎶ュ憡
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
                step1: 'Ensure your server supports HTTPS for performance APIs',
                step2: 'Set correct MIME types for JavaScript assets',
                step3: 'Enable Gzip or Brotli compression to reduce transfer size',
                step4: 'After deployment, open /performance-test-production.html to verify',
                step5: 'Run performanceMonitor.getMetrics() in the browser console'
            },
            expectedBehavior: {
                autoStart: 'The monitoring script starts automatically on page load',
                dataCollection: 'Core Web Vitals and related metrics are collected automatically',
                reporting: 'A performance report is generated every 10 seconds',
                storage: 'Debug data is cached in sessionStorage'
            }
        };
        
        const reportPath = path.join(outputDir, 'performance-monitor-deployment-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log('[OK] Generated deployment report: performance-monitor-deployment-report.json');
    }

    // 鑾峰彇鏂囦欢澶у皬
    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    // 鏍煎紡鍖栨枃浠跺ぇ灏?
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // 鎻愬彇骞跺唴鑱斿叧閿瓹SS
    extractAndInlineCriticalCSS(outputDir) {
        console.log('\n Extracting and inlining critical CSS...');
        
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
            
            // 杩愯鍏抽敭CSS鎻愬彇娴佺▼
            const result = extractor.run();
            
            if (result.success) {
                console.log('[OK] Critical CSS extraction completed successfully');
                console.log(`   - Critical rules extracted: ${result.stats.criticalRules}`);
                console.log(`   - Extracted size: ${this.formatFileSize(result.stats.extractedSize)}`);
                console.log(`   - HTML files processed: ${result.processedFiles.length}`);
            } else {
                console.warn(' Critical CSS extraction failed:', result.error);
            }
            
            return result;
        } catch (error) {
            console.error('[ERROR] Error during critical CSS extraction:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    // 鐢熸垚缁撴瀯鍖栨暟鎹?
    generateStructuredData(pageData, lang) {
        // 濡傛灉椤甸潰鏁版嵁涓凡缁忓寘鍚粨鏋勫寲鏁版嵁閰嶇疆锛屼紭鍏堜娇鐢?
        if (pageData.structured_data && typeof pageData.structured_data === 'object') {
            // 鏇存柊鍔ㄦ€佸瓧娈?
            const configStructuredData = { ...pageData.structured_data };
            configStructuredData.url = pageData.canonical_url || configStructuredData.url;
            configStructuredData.name = pageData.page_title || configStructuredData.name;
            configStructuredData.description = pageData.description || configStructuredData.description;
            configStructuredData.inLanguage = lang;

            // 鏇存柊鏃ユ湡涓哄綋鍓嶆棩鏈?
            configStructuredData.dateModified = new Date().toISOString().split('T')[0];

            return this.buildStructuredDataPayload(configStructuredData, pageData, lang);
        }

        // 鍥為€€鍒板熀鏈粨鏋勫寲鏁版嵁
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
            "softwareVersion": "2.3.0",
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

        // 濡傛灉鏄崥瀹㈤〉闈紝娣诲姞鍗氬鐗瑰畾鐨勭粨鏋勫寲鏁版嵁
        if (pageData.canonical_url.includes('/blog/') && !pageData.canonical_url.includes('/blog/category/') && !pageData.canonical_url.includes('/blog/tag/')) {
            // 杩欐槸涓€涓叿浣撶殑鍗氬鏂囩珷
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
            return this.buildStructuredDataPayload(blogStructuredData, pageData, lang);
        }

        // 濡傛灉鏄崥瀹㈢储寮曢〉闈?
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
            return this.buildStructuredDataPayload(blogIndexStructuredData, pageData, lang);
        }

        return this.buildStructuredDataPayload(baseStructuredData, pageData, lang);
    }

    // 涓轰富缁撴瀯鍖栨暟鎹檮鍔燘readcrumb锛屾彁鍗囨悳绱㈢粨鏋滃彲璇绘€?
    buildStructuredDataPayload(mainStructuredData, pageData, lang) {
        const breadcrumbStructuredData = this.generateBreadcrumbStructuredData(pageData, lang);
        if (!breadcrumbStructuredData) {
            return JSON.stringify(mainStructuredData, null, 2);
        }

        const normalizedMain = { ...mainStructuredData };
        delete normalizedMain['@context'];

        return JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [normalizedMain, breadcrumbStructuredData]
        }, null, 2);
    }

    // 鐢熸垚闈㈠寘灞戠粨鏋勫寲鏁版嵁
    generateBreadcrumbStructuredData(pageData, lang) {
        if (!pageData || !pageData.canonical_url) {
            return null;
        }

        let parsed;
        try {
            parsed = new URL(pageData.canonical_url);
        } catch (error) {
            return null;
        }

        const rawSegments = parsed.pathname.split('/').filter(Boolean);
        if (rawSegments.length === 0) {
            return null;
        }

        const supportedLangs = ['en', 'zh', 'de', 'es'];
        const hasLangPrefix = supportedLangs.includes(rawSegments[0]);
        const langPrefix = hasLangPrefix ? `/${rawSegments[0]}` : '';
        const segments = hasLangPrefix ? rawSegments.slice(1) : rawSegments;

        if (segments.length === 0) {
            return null;
        }

        const topLevelLabels = {
            devices: 'Tools',
            blog: 'Blog',
            hub: 'Gaming Hub'
        };

        const homeUrl = langPrefix ? `${parsed.origin}${langPrefix}` : `${parsed.origin}/`;
        const items = [
            {
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@id": homeUrl,
                    "name": 'Home'
                }
            }
        ];

        let accumulatedPath = '';
        let position = 2;

        segments.forEach((segment, index) => {
            accumulatedPath += `/${segment}`;
            const isLast = index === segments.length - 1;
            const label = isLast
                ? (pageData.page_title || this.humanizeSegment(segment))
                : ((index === 0 && topLevelLabels[segment])
                    ? topLevelLabels[segment]
                    : this.humanizeSegment(segment));

            const url = isLast
                ? pageData.canonical_url
                : `${parsed.origin}${langPrefix}${accumulatedPath}`;

            items.push({
                "@type": "ListItem",
                "position": position,
                "item": {
                    "@id": url,
                    "name": label
                }
            });
            position += 1;
        });

        if (items.length < 2) {
            return null;
        }

        return {
            "@type": "BreadcrumbList",
            "itemListElement": items
        };
    }

    // URL鐗囨杞彲璇绘爣棰?
    humanizeSegment(segment) {
        return String(segment || '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    }

    // 鎸夐〉闈㈢敓鎴怓AQ缁撴瀯鍖栨暟鎹?
    generateFAQStructuredDataForPage(pageName, lang) {
        const qaMap = {
            'responsive-tester': [
                ['faq_q1', 'faq_a1'],
                ['faq_q2', 'faq_a2'],
                ['faq_q3', 'faq_a3']
            ],
            'compare': [
                ['faq_measure_question', 'faq_measure_answer'],
                ['faq_difference_question', 'faq_difference_answer'],
                ['faq_area_question', 'faq_area_answer'],
                ['faq_different_question', 'faq_different_answer'],
                ['faq_aspect_question', 'faq_aspect_answer']
            ],
            'iphone-viewport-sizes': [
                ['device_faq_q1', 'device_faq_a1'],
                ['device_faq_q2', 'device_faq_a2'],
                ['device_faq_q3', 'device_faq_a3'],
                ['device_faq_q4', 'device_faq_a4'],
                ['device_faq_q5', 'device_faq_a5']
            ],
            'ipad-viewport-sizes': [
                ['device_faq_q1', 'device_faq_a1'],
                ['device_faq_q2', 'device_faq_a2'],
                ['device_faq_q3', 'device_faq_a3'],
                ['device_faq_q4', 'device_faq_a4'],
                ['device_faq_q5', 'device_faq_a5']
            ],
            'android-viewport-sizes': [
                ['device_faq_q1', 'device_faq_a1'],
                ['device_faq_q2', 'device_faq_a2'],
                ['device_faq_q3', 'device_faq_a3'],
                ['device_faq_q4', 'device_faq_a4'],
                ['device_faq_q5', 'device_faq_a5']
            ],
            'projection-calculator': [
                ['projectionCalculator.faq1q', 'projectionCalculator.faq1a'],
                ['projectionCalculator.faq2q', 'projectionCalculator.faq2a'],
                ['projectionCalculator.faq3q', 'projectionCalculator.faq3a'],
                ['projectionCalculator.faq4q', 'projectionCalculator.faq4a'],
                ['projectionCalculator.faq5q', 'projectionCalculator.faq5a']
            ],
            'lcd-screen-tester': [
                ['lcdTester.faq1q', 'lcdTester.faq1a'],
                ['lcdTester.faq2q', 'lcdTester.faq2a'],
                ['lcdTester.faq3q', 'lcdTester.faq3a'],
                ['lcdTester.faq4q', 'lcdTester.faq4a']
            ]
        };

        const pairs = qaMap[pageName];
        if (!pairs) {
            return '';
        }

        return this.generateFAQStructuredDataFromPairs(lang, pairs);
    }

    // 鏍规嵁闂瓟閿鐢熸垚FAQ JSON-LD
    generateFAQStructuredDataFromPairs(lang, qaKeyPairs) {
        const translations = this.translations.get(lang);
        if (!translations || !Array.isArray(qaKeyPairs) || qaKeyPairs.length === 0) {
            return '';
        }

        const mainEntity = qaKeyPairs
            .map(([qKey, aKey]) => {
                const question = this.getNestedTranslation(translations, qKey) || translations[qKey];
                const answer = this.getNestedTranslation(translations, aKey) || translations[aKey];

                if (!question || !answer) {
                    return null;
                }

                return {
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                };
            })
            .filter(Boolean);

        if (mainEntity.length < 2) {
            return '';
        }

        const faqStructuredData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": mainEntity
        };

        return '<script type="application/ld+json">\n' + JSON.stringify(faqStructuredData, null, 2) + '\n</script>';
    }

    // 淇闈欐€佽祫婧愯矾寰?
    fixStaticResourcePaths(html, outputPath) {
        // 璁＄畻鐩稿璺緞娣卞害 - 鏍囧噯鍖栬矾寰勫垎闅旂涓烘鏂滄潬
        const normalizedPath = outputPath.replace(/\\/g, '/');
        const depth = normalizedPath.split('/').length - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        
        // 娉ㄦ剰锛氭垜浠凡缁忓湪鏋勫缓杩囩▼涓缃簡姝ｇ‘鐨勮矾寰勫彉閲忥紝
        // 杩欓噷鍙慨澶嶉偅浜涘彲鑳介仐婕忕殑纭紪鐮佽矾寰?
        
        // 淇浠讳綍閬楃暀鐨勭‖缂栫爜CSS璺緞
        html = html.replace(
            /href="css\/main\.css"/g,
            `href="${prefix}css/main.css"`
        );
        
        // 淇浠讳綍閬楃暀鐨勭‖缂栫爜JavaScript璺緞  
        html = html.replace(
            /src="js\/app\.js"/g,
            `src="${prefix}js/app.js"`
        );
        
        // 淇浠讳綍閬楃暀鐨勭炕璇戞枃浠惰矾寰?
        html = html.replace(
            /href="locales\/en\/translation\.json"/g,
            `href="${prefix}locales/en/translation.json"`
        );
        html = html.replace(
            /href="locales\/zh\/translation\.json"/g,
            `href="${prefix}locales/zh/translation.json"`
        );
        
        // 淇鍗氬鍐呭涓殑鍥剧墖璺緞锛堥噸瑕侊細淇鍥剧墖鏄剧ず闂锛?
        // 灏?../images/ 淇涓烘纭殑鐩稿璺緞
        html = html.replace(
            /src="\.\.\/(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );
        
        // 淇鍗氬鏂囩珷涓殑鍥剧墖璺緞锛堢洿鎺?images/ 鍒版纭殑鐩稿璺緞锛?
        // 鍗氬鏂囩珷閫氬父鍦?zh/blog/ 鐩綍涓嬶紝闇€瑕?../../images/
        html = html.replace(
            /src="(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );
        
        return html;
    }
    
    // 鐢熸垚鏍圭洰褰曞崥瀹㈠唴瀹癸紙鑻辨枃鐗堟湰锛?
    generateRootBlogContent(outputDir, config, englishTranslations) {
        console.log(' Generating root directory blog content...');
        
        // 鍒涘缓鏍圭洰褰曞崥瀹㈢洰褰?
        const rootBlogDir = path.join(outputDir, 'blog');
        fs.mkdirSync(rootBlogDir, { recursive: true });
        
        // 鍒涘缓鍗氬瀛愮洰褰?
        const blogSubDirs = ['category', 'tag'];
        blogSubDirs.forEach(subDir => {
            fs.mkdirSync(path.join(rootBlogDir, subDir), { recursive: true });
        });
        
        // 鑾峰彇鎵€鏈夊崥瀹㈢浉鍏抽〉闈?
        const blogPages = config.pages.filter(page => 
            page.output.startsWith('blog/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`   Found ${blogPages.length} blog pages to generate at root level`);
        
        // 涓烘瘡涓崥瀹㈤〉闈㈢敓鎴愭牴鐩綍鐗堟湰
        for (const page of blogPages) {
            try {
                // 鍑嗗鏍圭洰褰曞崥瀹㈤〉闈㈡暟鎹?
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                
                // 璋冩暣鏍圭洰褰曞崥瀹㈤〉闈㈢殑璺緞
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                
                // 鏇存柊canonical URL涓烘牴鐩綍鐗堟湰
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/blog/', '/blog/');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 璁剧疆hreflang鏁版嵁
                rootPageData.base_url = 'https://screensizechecker.com';
                const blogPath = page.output.replace('blog/', '/blog/');
                rootPageData.page_path = blogPath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                
                // 澶勭悊缈昏瘧
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
                
                // 娣诲姞缁撴瀯鍖栨暟鎹?
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');
                
                // 鏋勫缓HTML
                let html = this.buildPage(page.template, rootPageData);
                
                // 搴旂敤鑻辨枃缈昏瘧
                html = this.translateContent(html, englishTranslations);
                
                // 澶勭悊鍐呴摼
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 淇闈欐€佽祫婧愯矾寰?
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 鍐欏叆鏂囦欢
                const outputPath = path.join(outputDir, page.output);
                const outputDirPath = path.dirname(outputPath);
                
                if (!fs.existsSync(outputDirPath)) {
                    fs.mkdirSync(outputDirPath, { recursive: true });
                }
                
                fs.writeFileSync(outputPath, html);
                console.log(`[OK] Generated root blog page: ${page.output}`);
                
            } catch (error) {
                console.error(`[ERROR] Failed to generate root blog page ${page.output}:`, error.message);
            }
        }
        
        console.log('[OK] Root directory blog content generated');
    }
    
    // 鐢熸垚鏍圭洰褰曡澶囬〉闈紙鑻辨枃鐗堟湰锛?
    generateRootDevicePages(outputDir, config, englishTranslations) {
        console.log(' Generating root directory device pages...');
        
        // 鍒涘缓鏍圭洰褰曡澶囩洰褰?
        const rootDevicesDir = path.join(outputDir, 'devices');
        fs.mkdirSync(rootDevicesDir, { recursive: true });
        
        // 鑾峰彇鎵€鏈夎澶囬〉闈?
        const devicePages = config.pages.filter(page => 
            page.output.startsWith('devices/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`   Found ${devicePages.length} device pages to generate at root level`);
        
        // 涓烘瘡涓澶囬〉闈㈢敓鎴愭牴鐩綍鐗堟湰
        for (const page of devicePages) {
            try {
                // 鍑嗗鏍圭洰褰曡澶囬〉闈㈡暟鎹?
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                
                // 璋冩暣鏍圭洰褰曡澶囬〉闈㈢殑璺緞
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(1, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                rootPageData.device_links_base = '';
                
                // 鏇存柊canonical URL涓烘牴鐩綍鐗堟湰
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/devices/', '/devices/').replace('.html', '');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 璁剧疆hreflang鏁版嵁
                rootPageData.base_url = 'https://screensizechecker.com';
                const devicePath = page.output.replace('devices/', '/devices/');
                rootPageData.page_path = devicePath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                
                // 澶勭悊缈昏瘧
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

                // 璁剧疆og:image鍜宱g:locale
                rootPageData.og_image = 'https://screensizechecker.com/images/og-default.png';
                rootPageData.og_locale = 'en_US';

                // 娣诲姞缁撴瀯鍖栨暟鎹?
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');

                // 娣诲姞瀵艰埅鐘舵€佹爣璇?
                const pagePath = page.output || '';
                rootPageData.is_home = pagePath === 'index.html' || pagePath === '';
                rootPageData.is_blog = false;
                const isToolPage = pagePath.includes('calculator') || pagePath.includes('compare') || pagePath.includes('tester') || pagePath.includes('resolution');
                const isDevicePage = pagePath.includes('iphone') || pagePath.includes('android') || pagePath.includes('ipad');
                rootPageData.is_tools = isToolPage;
                rootPageData.is_devices = isDevicePage;
                
                // 涓烘牳蹇冨伐鍏烽〉闈㈡敞鍏AQ缁撴瀯鍖栨暟鎹紝鎻愬崌SERP瀵岀粨鏋滄満浼?
                rootPageData.faq_structured_data = this.generateFAQStructuredDataForPage(page.name, 'en');
                
                // 鏋勫缓HTML
                let html = this.buildPage(page.template, rootPageData);
                
                // 搴旂敤鑻辨枃缈昏瘧
                html = this.translateContent(html, englishTranslations);
                
                // 澶勭悊鍐呴摼
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 淇闈欐€佽祫婧愯矾寰?
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 鍐欏叆鏂囦欢
                const outputPath = path.join(outputDir, page.output);
                fs.writeFileSync(outputPath, html);
                console.log(`[OK] Generated root device page: ${page.output}`);
                
            } catch (error) {
                console.error(`[ERROR] Failed to generate root device page ${page.output}:`, error.message);
            }
        }
        
        console.log('[OK] Root directory device pages generated');
    }

    // 鐢熸垚璇█閫夋嫨绱㈠紩椤甸潰
    generateLanguageIndex(outputDir) {
        console.log('\n Generating root English page and language selection...');
        
        // 瀹氫箟宸插惎鐢ㄧ殑璇█锛堝彧鏈夎嫳鏂囧拰涓枃锛?
        const enabledLanguages = ['en', 'zh'];
        
        // 1. 鐢熸垚鏍圭洰褰曡嫳鏂囦富椤靛唴瀹癸紙涓嶅啀閲嶅畾鍚戯級
        console.log(' Generating root directory English homepage...');
        
        // 鑾峰彇鑻辨枃缈昏瘧
        const englishTranslations = this.translations.get('en') || {};
        
        // 閰嶇疆鏍圭洰褰曢〉闈㈡暟鎹紝鍩轰簬pages-config.json涓殑index椤甸潰閰嶇疆
        const config = JSON.parse(fs.readFileSync('build/pages-config.json', 'utf8'));
        const indexPageConfig = config.pages.find(page => page.name === 'index');
        
        if (!indexPageConfig) {
            throw new Error('Index page configuration not found in pages-config.json');
        }
        
        // 鍑嗗鏍圭洰褰曢〉闈㈡暟鎹?
        const rootPageData = {
            lang: 'en',
            lang_prefix: '',
            lang_code: 'EN',
            page_content: indexPageConfig.page_content,
            ...indexPageConfig.config
        };
        
        // 璁剧疆鏍圭洰褰曠壒瀹氱殑璺緞鍜孶RL
        rootPageData.canonical_url = 'https://screensizechecker.com/';
        rootPageData.og_url = 'https://screensizechecker.com/';
        rootPageData.css_path = 'css';
        rootPageData.locales_path = 'locales';
        rootPageData.js_path = 'js';
        rootPageData.home_url = 'index.html';
        rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
        rootPageData.privacy_policy_url = 'privacy-policy.html';
        rootPageData.device_links_base = 'devices/';
        
        // 璁剧疆鏍圭洰褰曢〉闈㈢殑hreflang鏁版嵁
        rootPageData.base_url = 'https://screensizechecker.com';
        rootPageData.page_path = '/';
        rootPageData.hreflang_root_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_en_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_zh_url = 'https://screensizechecker.com/zh/';
        rootPageData.hreflang_de_url = 'https://screensizechecker.com/de/';
        rootPageData.hreflang_es_url = 'https://screensizechecker.com/es/';
        
        // 浠庣炕璇戞枃浠朵腑鑾峰彇椤甸潰鐗瑰畾鐨勭炕璇戝€?
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
        
        // 纭繚title鍙橀噺涔熻璁剧疆
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
        
        // 璁剧疆og:image鍜宱g:locale
        rootPageData.og_image = 'https://screensizechecker.com/images/og-default.png';
        rootPageData.og_locale = 'en_US';

        // 娣诲姞缁撴瀯鍖栨暟鎹?
        rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');

        // 娣诲姞瀵艰埅鐘舵€佹爣璇?
        rootPageData.is_home = true;
        rootPageData.is_blog = false;
        rootPageData.is_tools = false;
        rootPageData.is_devices = false;
        
        // 涓烘牳蹇冨伐鍏烽〉闈㈡敞鍏AQ缁撴瀯鍖栨暟鎹紝鎻愬崌SERP瀵岀粨鏋滄満浼?
        rootPageData.faq_structured_data = this.generateFAQStructuredDataForPage(indexPageConfig.name, 'en');
        
        // 鏋勫缓鏍圭洰褰旽TML椤甸潰
        let rootHtml = this.buildPage(indexPageConfig.template, rootPageData);
        
        // 搴旂敤鑻辨枃缈昏瘧
        rootHtml = this.translateContent(rootHtml, englishTranslations);
        
        // 澶勭悊鍐呴摼锛堟牴鐩綍椤甸潰浣跨敤鐗规畩鐨勯〉闈D锛?
        rootHtml = this.internalLinksProcessor.processPageLinks(rootHtml, 'index-root', 'en');
        
        // 鏇存柊HTML lang灞炴€?
        rootHtml = rootHtml.replace('<html lang="en">', '<html lang="en">');
        
        // 淇闈欐€佽祫婧愯矾寰勶紙鏍圭洰褰曚笉闇€瑕侀澶栫殑璺緞鍓嶇紑锛?
        rootHtml = this.fixStaticResourcePaths(rootHtml, 'index.html');
        
        // 鍐欏叆鏍圭洰褰昳ndex.html
        fs.writeFileSync(path.join(outputDir, 'index.html'), rootHtml);
        console.log('[OK] Root English homepage created (no redirect)');
        
        // 1.5. 璺宠繃鏍圭洰褰曞崥瀹㈠唴瀹圭敓鎴愶紝鍗氬閾炬帴灏嗘寚鍚?/en/blog/
        console.log(' Skipping root directory blog content generation - blog links will point to /en/blog/');
        
        // 1.6. 鐢熸垚鏍圭洰褰曡澶囬〉闈紙鑻辨枃鐗堟湰锛?
        this.generateRootDevicePages(outputDir, config, englishTranslations);
        
        // 2. 鐢熸垚璇█閫夋嫨椤甸潰鍒?select-language.html
        // 璇█閰嶇疆
        const languageConfigs = [
            { code: 'en', name: 'English', flag: 'EN' },
            { code: 'zh', name: 'Chinese', flag: 'ZH' },
            { code: 'fr', name: 'Francais', flag: 'FR' },
            { code: 'de', name: 'Deutsch', flag: 'DE' },
            { code: 'es', name: 'Espanol', flag: 'ES' },
            { code: 'ja', name: 'Japanese', flag: 'JA' },
            { code: 'ko', name: 'Korean', flag: 'KO' },
            { code: 'ru', name: 'Russian', flag: 'RU' },
            { code: 'pt', name: 'Portugues', flag: 'PT' },
            { code: 'it', name: 'Italiano', flag: 'IT' }
        ];
        
        // 鐢熸垚璇█鍗＄墖HTML
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
            content: "鍗冲皢鎺ㄥ嚭";
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
    <h1>馃實 Screen Size Checker</h1>
    <p class="subtitle">Choose your language / 閫夋嫨鎮ㄧ殑璇█</p>
    
    <div class="language-grid">
${languageCards}
    </div>
    
    <p class="note">馃挕 鍏朵粬璇█鐗堟湰姝ｅ湪缈昏瘧涓紝鏁鏈熷緟锛?br>Other language versions are being translated, stay tuned!</p>
    
    <script>
        // 鑷姩璇█妫€娴嬪拰閲嶅畾鍚戯紙浠呴檺宸插惎鐢ㄧ殑璇█锛?
        function detectAndRedirect() {
            const userLang = navigator.language || navigator.userLanguage;
            const langCode = userLang.split('-')[0];
            const availableLangs = ${JSON.stringify(enabledLanguages)}; // 浠呭凡鍚敤鐨勮瑷€
            
            if (availableLangs.includes(langCode)) {
                const targetUrl = langCode + '/index.html';
                console.log('Auto-redirecting to:', targetUrl);
                // window.location.href = targetUrl; // 鍙栨秷娉ㄩ噴浠ュ惎鐢ㄨ嚜鍔ㄩ噸瀹氬悜
            } else {
                // 濡傛灉鐢ㄦ埛璇█涓嶅湪鍙敤鍒楄〃涓紝榛樿璺宠浆鍒拌嫳鏂?
                console.log('Language not available, defaulting to English');
                // window.location.href = 'en/index.html'; // 鍙栨秷娉ㄩ噴浠ュ惎鐢ㄨ嚜鍔ㄩ噸瀹氬悜
            }
        }
        
        // detectAndRedirect(); // 鍙栨秷娉ㄩ噴浠ュ惎鐢ㄨ嚜鍔ㄨ瑷€妫€娴?
    </script>
</body>
</html>`;
        
        fs.writeFileSync(path.join(outputDir, 'select-language.html'), languageSelectionHtml);
        console.log('[OK] Language selection page created at select-language.html');
    }

    // 鐢熸垚澶氳瑷€缃戠珯鍦板浘锛堝彧鍖呭惈鍚敤鐨勮瑷€锛?
    generateMultiLanguageSitemap(outputDir) {
        console.log('\n[OK] Generating multilingual sitemap (enabled languages only)...');
        
        const currentDate = new Date().toISOString().split('T')[0];
        const baseUrl = 'https://screensizechecker.com';
        const enabledLanguages = ['en', 'zh', 'de', 'es']; // 鍙寘鍚惎鐢ㄧ殑璇█
        
        // 瀹氫箟椤甸潰缁撴瀯锛堟棤.html鍚庣紑锛屽尮閰岰loudflare Pages鐨刄RL鏍煎紡锛?
        const pages = [
            { path: '', priority: '1.0', changefreq: 'weekly' },
            { path: '/devices/iphone-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/ipad-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/android-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/compare', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/standard-resolutions', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/responsive-tester', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/ppi-calculator', priority: '0.8', changefreq: 'monthly' },
            { path: '/devices/projection-calculator', priority: '0.8', changefreq: 'monthly' },
            { path: '/devices/lcd-screen-tester', priority: '0.8', changefreq: 'monthly' }
        ];
        
        // 瀹氫箟鍗氬椤甸潰缁撴瀯
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
        
        // 涓枃鐗规湁鐨勬爣绛鹃〉闈?
        const zhBlogPages = [
            { path: '/blog/tag/pixel-density', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/responsive-design', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/media-queries', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/breakpoints', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/retina-display', priority: '0.6', changefreq: 'monthly' }
        ];
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        
        // 娣诲姞鏍硅矾寰勶紙鑻辨枃鐗堟湰鐨勪富瑕佸叆鍙ｏ級
        sitemapContent += `
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>`;
        
        // 娣诲姞鏍圭洰褰曠殑璁惧椤甸潰锛堣嫳鏂囦富瑕佺増鏈級
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
        
        // 娣诲姞鏍圭洰褰曠殑鍗氬椤甸潰锛堣嫳鏂囦富瑕佺増鏈級
        blogPages.forEach(page => {
            sitemapContent += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
        });
        
        // 娣诲姞鏍圭洰褰曠殑Hub椤甸潰锛堣嫳鏂囦富瑕佺増鏈級
        // 浠巔ages-config.json璇诲彇Hub椤甸潰
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
        
        // 娣诲姞璇█閫夋嫨椤甸潰
        sitemapContent += `
    <url>
        <loc>${baseUrl}/select-language</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        
        // 鍙负闈炶嫳鏂囩殑鍚敤璇█鐢熸垚URL锛堣嫳鏂囧凡鍦ㄦ牴鐩綍锛?
        enabledLanguages.forEach(lang => {
            // 璺宠繃鑻辨枃锛屽洜涓鸿嫳鏂囩増鏈凡缁忓湪鏍圭洰褰?
            if (lang === 'en') {
                return;
            }
            
            // 娣诲姞鍩虹椤甸潰
            pages.forEach(page => {
                if (page.path === '') {
                    // 璇█棣栭〉
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                } else {
                    // 鍏朵粬椤甸潰
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                }
            });
            
            // 娣诲姞鍗氬椤甸潰
            blogPages.forEach(page => {
                sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
            });
            
            // 娣诲姞Hub椤甸潰
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
            
            // 涓轰腑鏂囨坊鍔犵壒鏈夌殑鏍囩椤甸潰
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
        
        // 娣诲姞闅愮鏀跨瓥椤甸潰
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
        
        // 璁＄畻鎬籙RL鏁伴噺锛?
        // 1涓牴鐩綍 + 鏍圭洰褰曠殑璁惧椤甸潰 + 鏍圭洰褰曠殑鍗氬椤甸潰 + Hub椤甸潰 + 1涓瑷€閫夋嫨椤甸潰 + 1涓殣绉佹斂绛栭〉闈?
        // + 璇█鐗堟湰椤甸潰 + 涓枃鐗规湁椤甸潰
        const hubPagesCount = pagesConfig.pages.filter(p => p.template === 'hub-page').length;
        const rootUrls = 1 + (pages.length - 1) + blogPages.length + hubPagesEn.length; // 鏍圭洰褰曠浉鍏砋RL
        const languageUrls = enabledLanguages.length * (pages.length + blogPages.length); // 璇█鐗堟湰URL
        const hubUrls = hubPagesCount; // Hub椤甸潰锛堟墍鏈夎瑷€锛?
        const otherUrls = 2; // 璇█閫夋嫨椤甸潰 + 闅愮鏀跨瓥椤甸潰
        const totalUrls = rootUrls + languageUrls + hubUrls + zhBlogPages.length + otherUrls;
        
        console.log('[OK] Multilingual sitemap generated with optimized structure');
        console.log(`    Total URLs: ${totalUrls}`);
        console.log(`    Root domain URLs: ${rootUrls} (priority 1.0-0.9)`);
        console.log(`    Language versions: ${languageUrls} (adjusted priorities)`);
        console.log(`    Gaming Hub pages: ${hubUrls} (4 languages)`);
        console.log(`    Chinese-specific: ${zhBlogPages.length}`);
        console.log(`    Other pages: ${otherUrls}`);
    }
    
    // 鐢熸垚鏋勫缓鎶ュ憡
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
        
        // 鏀堕泦姣忕璇█鐨勯〉闈俊鎭?
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
        
        console.log(' Build report saved: multilang-build/build-report.json');
    }
    
    // 閫掑綊鑾峰彇鐩綍涓嬫墍鏈夋枃浠?
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
    
    // 鐢熸垚浼樺寲鐨刜redirects鏂囦欢
    generateRedirectsFile(outputDir) {
        console.log('\n Generating optimized _redirects file...');
        
        const redirectsContent = `# Cloudflare Pages 閲嶅畾鍚戦厤缃枃浠?
# URL 缁撴瀯杩佺Щ锛氳嫳鏂囧唴瀹逛粠 /en/* 杩佺Щ鍒版牴璺緞 /*

# ===== 閲嶈锛氭棫鑻辨枃璺緞 鈫?鏂版牴璺緞 =====
# 杩欎簺瑙勫垯纭繚鏃х殑 /en/* URL 姝ｇ‘閲嶅畾鍚戝埌鏂扮殑鏍硅矾寰?

# 鑻辨枃涓婚〉閲嶅畾鍚?
/en/                  /                   301
/en/index.html        /                   301

# 鑻辨枃鍗氬閲嶅畾鍚戯紙鏃ц矾寰?鈫?鏂拌矾寰勶級
/en/blog              /blog               301
/en/blog/             /blog/              301
/en/blog/*            /blog/:splat        301

# 鑻辨枃璁惧椤甸潰閲嶅畾鍚戯紙鏃ц矾寰?鈫?鏂拌矾寰勶級
/en/devices/*         /devices/:splat     301

# 鑻辨枃宸ュ叿椤甸潰閲嶅畾鍚戯紙濡傛灉瀛樺湪锛?
/en/tools/*           /tools/:splat       301

# 閫氱敤瑙勫垯锛氭墍鏈夊墿浣欑殑 /en/* 璺緞閲嶅畾鍚戝埌鏍硅矾寰?
/en/*                 /:splat             301

# ===== .html 鍚庣紑閲嶅畾鍚戯紙鏍硅矾寰勮嫳鏂囩増鏈級=====
/devices/iphone-viewport-sizes.html       /devices/iphone-viewport-sizes      301
/devices/ipad-viewport-sizes.html         /devices/ipad-viewport-sizes        301
/devices/android-viewport-sizes.html      /devices/android-viewport-sizes     301
/devices/compare.html                     /devices/compare                    301
/devices/standard-resolutions.html        /devices/standard-resolutions       301
/devices/responsive-tester.html           /devices/responsive-tester          301
/devices/ppi-calculator.html              /devices/ppi-calculator             301
/devices/aspect-ratio-calculator.html     /devices/aspect-ratio-calculator    301
/devices/projection-calculator.html       /devices/projection-calculator      301
/devices/lcd-screen-tester.html           /devices/lcd-screen-tester          301

# ===== .html 鍚庣紑閲嶅畾鍚戯紙涓枃鐗堟湰锛?====
/zh/devices/iphone-viewport-sizes.html    /zh/devices/iphone-viewport-sizes   301
/zh/devices/ipad-viewport-sizes.html      /zh/devices/ipad-viewport-sizes     301
/zh/devices/android-viewport-sizes.html   /zh/devices/android-viewport-sizes  301
/zh/devices/compare.html                  /zh/devices/compare                 301
/zh/devices/standard-resolutions.html     /zh/devices/standard-resolutions    301
/zh/devices/responsive-tester.html        /zh/devices/responsive-tester       301
/zh/devices/ppi-calculator.html           /zh/devices/ppi-calculator          301
/zh/devices/aspect-ratio-calculator.html  /zh/devices/aspect-ratio-calculator 301
/zh/devices/projection-calculator.html    /zh/devices/projection-calculator   301
/zh/devices/lcd-screen-tester.html        /zh/devices/lcd-screen-tester       301

# ===== .html 鍚庣紑閲嶅畾鍚戯紙寰疯鐗堟湰锛?====
/de/devices/iphone-viewport-sizes.html    /de/devices/iphone-viewport-sizes   301
/de/devices/ipad-viewport-sizes.html      /de/devices/ipad-viewport-sizes     301
/de/devices/android-viewport-sizes.html   /de/devices/android-viewport-sizes  301
/de/devices/compare.html                  /de/devices/compare                 301
/de/devices/standard-resolutions.html     /de/devices/standard-resolutions    301
/de/devices/responsive-tester.html        /de/devices/responsive-tester       301
/de/devices/ppi-calculator.html           /de/devices/ppi-calculator          301
/de/devices/aspect-ratio-calculator.html  /de/devices/aspect-ratio-calculator 301
/de/devices/projection-calculator.html    /de/devices/projection-calculator   301
/de/devices/lcd-screen-tester.html        /de/devices/lcd-screen-tester       301

# ===== .html 鍚庣紑閲嶅畾鍚戯紙瑗跨彮鐗欒鐗堟湰锛?====
/es/devices/iphone-viewport-sizes.html    /es/devices/iphone-viewport-sizes   301
/es/devices/ipad-viewport-sizes.html      /es/devices/ipad-viewport-sizes     301
/es/devices/android-viewport-sizes.html   /es/devices/android-viewport-sizes  301
/es/devices/compare.html                  /es/devices/compare                 301
/es/devices/standard-resolutions.html     /es/devices/standard-resolutions    301
/es/devices/responsive-tester.html        /es/devices/responsive-tester       301
/es/devices/ppi-calculator.html           /es/devices/ppi-calculator          301
/es/devices/aspect-ratio-calculator.html  /es/devices/aspect-ratio-calculator 301
/es/devices/projection-calculator.html    /es/devices/projection-calculator   301
/es/devices/lcd-screen-tester.html        /es/devices/lcd-screen-tester       301

# ===== 鍗氬 .html 鍚庣紑閲嶅畾鍚?=====
/blog/index.html                          /blog                               301
/zh/blog/index.html                       /zh/blog                            301
/de/blog/index.html                       /de/blog                            301
/es/blog/index.html                       /es/blog                            301
/blog/*.html                              /blog/:splat                        301
/zh/blog/*.html                           /zh/blog/:splat                     301
/de/blog/*.html                           /de/blog/:splat                     301
/es/blog/*.html                           /es/blog/:splat                     301

# ===== 璇█鐗堟湰 index.html 閲嶅畾鍚?=====
/zh/index.html                            /zh/                                301
/de/index.html                            /de/                                301
/es/index.html                            /es/                                301

# ===== 鍏朵粬椤甸潰閲嶅畾鍚?=====
/privacy-policy.html                      /privacy-policy                     301
/terms-of-service.html                    /terms-of-service                  301


# ===== 渚挎嵎璁块棶閲嶅畾鍚?=====
/devices/                                 /devices/iphone-viewport-sizes      301
/devices                                  /devices/iphone-viewport-sizes      301`;

        fs.writeFileSync(path.join(outputDir, '_redirects'), redirectsContent);
        console.log('[OK] Generated simplified _redirects file');
    }
    
    // 鐢熸垚浼樺寲鐨剅obots.txt鏂囦欢
    // 鍐呭涓€鑷存€ф鏌ワ細纭繚鑻辨枃鐗堟湰锛堟牴鐩綍锛夊拰涓枃鐗堟湰锛?zh/锛夋纭敓鎴?
    validateContentConsistency(outputDir) {
        console.log('\n Validating content consistency between English (root) and Chinese (/zh/) versions...');
        
        const inconsistencies = [];
        const rootDir = outputDir; // 鑻辨枃鐗堟湰鍦ㄦ牴鐩綍
        const zhDir = path.join(outputDir, 'zh'); // 涓枃鐗堟湰鍦?/zh/ 鐩綍
        
        // 闇€瑕佹鏌ョ殑椤甸潰鍒楄〃
        const pagesToCheck = [
            'index.html',
            'devices/iphone-viewport-sizes.html',
            'devices/ipad-viewport-sizes.html',
            'devices/android-viewport-sizes.html',
            'devices/compare.html',
            'devices/standard-resolutions.html',
            'devices/responsive-tester.html',
            'devices/ppi-calculator.html',
            'devices/aspect-ratio-calculator.html',
            'devices/projection-calculator.html',
            'devices/lcd-screen-tester.html'
        ];
        
        let checkedPages = 0;
        let consistentPages = 0;
        
        pagesToCheck.forEach(pagePath => {
            const rootPagePath = path.join(rootDir, pagePath); // 鑻辨枃鐗堟湰
            const zhPagePath = path.join(zhDir, pagePath); // 涓枃鐗堟湰
            
            // 妫€鏌ユ枃浠舵槸鍚﹀瓨鍦?
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
                // 璇诲彇鏂囦欢鍐呭
                const rootContent = fs.readFileSync(rootPagePath, 'utf8');
                const zhContent = fs.readFileSync(zhPagePath, 'utf8');
                
                checkedPages++;
                
                // 妫€鏌ュ叧閿甋EO鍏冪礌鐨勪竴鑷存€?
                const seoChecks = [
                    { name: 'Title', regex: /<title[^>]*>(.*?)<\/title>/is },
                    { name: 'Meta Description', regex: /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i },
                    { name: 'H1 Tag', regex: /<h1[^>]*>([\s\S]*?)<\/h1>/i }
                ];
                
                let pageConsistent = true;
                
                seoChecks.forEach(check => {
                    const rootMatch = rootContent.match(check.regex);
                    const zhMatch = zhContent.match(check.regex);
                    
                    if (rootMatch && zhMatch) {
                        const rootValue = rootMatch[1].trim();
                        const zhValue = zhMatch[1].trim();
                        
                        // 鑻辨枃鍜屼腑鏂囩増鏈殑鍐呭搴旇鏄炕璇戝叧绯伙紝涓嶅簲璇ョ浉鍚?
                        // 杩欓噷鍙鏌ヤ袱鑰呴兘瀛樺湪鍗冲彲锛屼笉姣旇緝鍐呭
                        // 濡傛灉闇€瑕侊紝鍙互鍦ㄨ繖閲屾坊鍔犳洿澶嶆潅鐨勭炕璇戦獙璇侀€昏緫
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
                
                // 妫€鏌anonical URL鐨勬纭€?
                const rootCanonical = rootContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                const zhCanonical = zhContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                
                if (rootCanonical && zhCanonical) {
                    const rootCanonicalUrl = rootCanonical[1];
                    const zhCanonicalUrl = zhCanonical[1];
                    
                    // 楠岃瘉canonical URL鐨勬纭€?
                    // 鑻辨枃鐗堟湰锛堟牴鐩綍锛変笉搴旇鍖呭惈 /en/
                    if (rootCanonicalUrl.includes('/en/')) {
                        inconsistencies.push({
                            page: pagePath,
                            issue: `English version has incorrect canonical URL (contains /en/): ${rootCanonicalUrl}`,
                            severity: 'error'
                        });
                        pageConsistent = false;
                    }
                    
                    // 涓枃鐗堟湰搴旇鍖呭惈 /zh/
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
        
        // 鐢熸垚楠岃瘉鎶ュ憡
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
        
        // 淇濆瓨楠岃瘉鎶ュ憡
        fs.writeFileSync(
            path.join(outputDir, 'content-consistency-report.json'),
            JSON.stringify(validationReport, null, 2)
        );
        
        // 杈撳嚭缁撴灉
        console.log(` Content consistency validation completed:`);
        console.log(`    Pages checked: ${checkedPages}/${pagesToCheck.length}`);
        console.log(`[OK] Consistent pages: ${consistentPages}`);
        console.log(`     Issues found: ${inconsistencies.length}`);
        
        if (inconsistencies.length > 0) {
            console.log('\n  Content consistency issues:');
            inconsistencies.slice(0, 5).forEach(issue => {
                const icon = issue.severity === 'error' ? 'X' : '!';
                console.log(`   ${icon} ${issue.page}: ${issue.issue}`);
            });
            
            if (inconsistencies.length > 5) {
                console.log(`   ... and ${inconsistencies.length - 5} more issues`);
            }
            console.log(`    Full report saved to: content-consistency-report.json`);
        }
        
        return validationReport;
    }
    
    generateRobotsFile(outputDir) {
        console.log('\n Generating optimized robots.txt file...');

        // Dynamically generate Allow/Disallow based on enabledLanguages
        const enabledLangs = this.enabledLanguages; // ['en', 'zh', 'de', 'es']
        const disabledLangs = this.supportedLanguages.filter(l => !enabledLangs.includes(l));

        // Generate Allow rules for enabled languages
        const allowLangRules = enabledLangs.map(l => `Allow: /${l}/`).join('\n');
        const allowBlogRules = enabledLangs.map(l => `Allow: /${l}/blog/`).join('\n');
        const allowDeviceRules = enabledLangs.map(l => `Allow: /${l}/devices/`).join('\n');
        const allowHubRules = enabledLangs.map(l => `Allow: /${l}/hub/`).join('\n');

        // Generate Disallow rules for disabled languages
        const disallowLangRules = disabledLangs.map(l => `Disallow: /${l}/`).join('\n');

        const robotsContent = `# robots.txt for screensizechecker.com
# Last updated: ${new Date().toISOString().split('T')[0]}
# Optimized for SEO redirect architecture
# Enabled languages: ${enabledLangs.join(', ')}

# Allow all crawlers to access main content
User-agent: *
Allow: /

# Explicitly allow enabled language versions
${allowLangRules}

# Allow static resources
Allow: /css/
Allow: /js/
Allow: /locales/

# Allow important pages
Allow: /privacy-policy
Allow: /select-language

# Allow blog content for all enabled languages
Allow: /blog/
${allowBlogRules}

# Allow device pages for all enabled languages
Allow: /devices/
${allowDeviceRules}

# Allow hub pages for all enabled languages
Allow: /hub/
${allowHubRules}

# Disallow disabled language versions
${disallowLangRules}

# Disallow build directories and temp files
Disallow: /build/
Disallow: /multilang-build/
Disallow: /node_modules/
Disallow: /.git/
Disallow: /.vscode/
Disallow: /.cursor/
Disallow: /.kiro/

# Disallow temp and test files
Disallow: /*test*
Disallow: /*debug*
Disallow: /*.json$
Disallow: /*.md$

# Sitemap
Sitemap: https://screensizechecker.com/sitemap.xml

# Crawler-specific rules
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

# Default crawl delay
User-agent: *
Crawl-delay: 5`;

        fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsContent);
        console.log('[OK] Generated optimized robots.txt file');
        console.log(`   Enabled languages: ${enabledLangs.join(', ')}`);
        console.log(`   Disabled languages: ${disabledLangs.join(', ')}`);
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

// 濡傛灉鐩存帴杩愯姝よ剼鏈紝鎵ц澶氳瑷€鏋勫缓
if (require.main === module) {
    (async () => {
        const builder = new MultiLangBuilder();
        
        console.log(' Starting integrated build process...');
        
        // Step 0: 杩愯缈昏瘧楠岃瘉
        console.log('\n Step 0: Validating translations...');
        const validationResult = await builder.runTranslationValidation();
        
        if (!validationResult.success) {
            console.error('[ERROR] Build failed due to translation validation errors');
            process.exit(1);
        }
        
        // 棣栧厛杩愯鍗氬鏋勫缓鍣?
        console.log('\n Step 1: Building blog system...');
        
        try {
            const blogBuilder = new BlogBuilder();
            blogBuilder.build();
            console.log('[OK] Blog system build completed successfully!');
            
            // Build Hub system
            console.log('\n Building Gaming Hub system...');
            const hubBuilder = new HubBuilder();
            hubBuilder.build();
            console.log('[OK] Gaming Hub system build completed successfully!');
            
            // 閲嶆柊鍔犺浇缁勪欢锛屽寘鎷柊鐢熸垚鐨勫崥瀹㈢粍浠?
            console.log(' Reloading components after blog build...');
            builder.loadComponents();
            console.log('[OK] Components reloaded successfully!');
        } catch (error) {
            console.error('[ERROR] Blog build failed:', error.message);
            console.log('  Continuing with main build process...');
        }
        
        console.log('\n Step 2: Building multilingual pages...');
        if (builder.validateComponents()) {
            builder.buildMultiLangPages();
        }
    })().catch(error => {
        console.error('[ERROR] Build process failed:', error);
        process.exit(1);
    });
}

module.exports = MultiLangBuilder; 





