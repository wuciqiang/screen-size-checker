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
        this.enabledLanguages = ['en', 'zh', 'de', 'es', 'pt', 'fr']; // 鐟滅増鎸告晶鐘诲触椤栨粍鏆忛柣銊ュ椤曘垻鎳涢埀顒勬晬濮樺啿顏伴柡鍌氭储閳ь兛妞掗懙鎴﹀棘閸ャ儮鍋撴担鍝ユ閻犲浂鍘归埀顑挎祰閵堝潡鎮甸鐘差潻閻?
        this.translations = new Map();
        this.internalLinksProcessor = new InternalLinksProcessor();
        
        // 閻犲浂鍙€閳诲牓宕ュ鍥嗙偤寮伴悩鑼
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
        
        // 閻犲浂鍙€閳诲牊绂掗敐鍥╁灣濠㈠爢鍐ㄦ櫢闁哄嫮濮撮惃鐘绘晬閸垺鏆忓ù婊冩姈I闁哄嫬澧介妵姘剧窗
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
    
    // 闁兼儳鍢茶ぐ鍥х暤鐏炵瓔娈伴柣銊ュ閻愭洜鎷犻幋婵冨亾绾绀夐柡鈧娑樼槷濠?"ppiCalculator.pageTitle" 閺夆晜鐟﹂悧閬嶆儍閸曨垱鏆?
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

    // 缂備胶鍠嶇粩鎾儍閸曨偄瑙﹂悗璇℃暰RL闁汇垻鍠愰崹姘跺礄閼恒儲娈?- 濞戞挴鍋撻柛鏃囨珪濡楀牓鏌呴崫銉︾暠閻熸瑱绲介崰鍛村棘鐟欏嫷鏀?
    generateBlogUrl(depth, lang, isRootPage = false) {
        console.log(` Generating blog URL: depth=${depth}, lang=${lang}, isRootPage=${isRootPage}`);

        // 闁兼槒椴搁弸鍐晬閸儳甯涢悹浣靛€涢銏㈡嚊閳ь剟鏁嶆径濠冭含闁哄秶顢婇惌鎯ь嚗閸曞墎绀夐柛蹇旀构缁剛鎷犻鈾€鏋呴柛锔哄姀椤曘垻鎳涢埀顒傗偓娑欏姉濞叉媽銇?
        const isDefaultLang = lang === this.defaultLanguage;

        if (depth === 0) {
            // 闁革负鍔嶉悧鎾儎椤旇偐绉块柟瀛樼墳椤曘垻鎳涢埀顒勫冀閸︻厽绐楃憸?
            if (isDefaultLang) {
                return 'blog/';
            } else {
                return 'blog/';
            }
        } else {
            // 闁革负鍔岄悺娆撴儎椤旇偐绉垮☉鎿冨弿缁辨繈妫侀埀顒傛啺娴ｅ憡绀€闁告帞澧楅悧鎾儎椤旇偐绉?
            const backToRoot = '../'.repeat(depth);
            if (isDefaultLang) {
                // 闁兼槒椴搁弸鍐晬濮橆剚绀€闁告帞澧楅悧瀵告崉椤栨氨绐為柛姘唉缁绘﹢宕?blog/
                return `${backToRoot}blog/`;
            } else {
                // 闁稿繑婀圭划顒傛嫚椤撯檧鏋呴柨娑欒壘濞叉牠宕氶悧鍫㈠閻犱警鍨扮欢鐐哄触鎼淬倗绠婚柛蹇嬪劥椤曘垻鎳涢埀顒勬儎椤旇偐绉块柛鎰Х缁绘﹢宕?blog/
                // 濞达絽妫楅悿鍕⒔閸涱剛鐟愰柣婊勬緲濠€顏勵啅閼碱剛鐥呴柛锔哄姀椤曘垻鎳涢埀顒傗偓娑欏姉濞叉媽銇愰弴姘冲幀濞存粌妫寸槐婵嬪箥閳ь剚绂掗妷銉ユ锭闂傚洠鍋撻悷鏇氱濞叉牠宕氶幏宀婂殧閻熷皝鍋撻柡?
                return `${backToRoot}blog/`;
            }
        }
    }
    
    // 濠㈣泛瀚幃濠勭礄閺勫繒妲柡鍥ㄥ瀹?
    translateContent(content, translations) {
        if (!translations) return content;
        
        // 濞ｅ浂鍠栭ˇ鐬瀍ta description闁哄秴娲ㄩ鐑芥儍閸戭櫄ML缂備焦鎸婚悗顖炴煥濞嗘帩鍤?
        let result = content;
        
        // 闁哄被鍎叉竟姗€鐛張鍨弿濠㈣泛绉堕悧顒勫锤韫囨洘鐣眒eta description闁哄秴娲ㄩ?
        result = result.replace(/<meta\s+name="description"[^>]*content="([^"]*)"[^>]*>([^<]*?)<meta\s+name="keywords"/g, (match, contentValue, extraText) => {
            console.log(' Fixing broken meta description tag');
            if (extraText.trim()) {
                console.log(' Removing extra text:', extraText.trim());
            }
            return `<meta name="description" content="${contentValue}">
<meta name="keywords"`;
        });
        
        // 闁哄洦瀵у畷?data-i18n 閻忕偟鍋為埀顑喚鍤犻幖瀛樻⒒濞堟垿寮崶銊︽嫳闁告劕鎳庨鎰版晬閸繍妲遍柣鐐叉閻栵絿绮甸幆褍鏁堕悗鍦缁?
        result = result.replace(/data-i18n="([^"]+)"[^>]*>([^<]*)</g, (match, key, originalText) => {
            // 闁绘顫夐悾鈺傚緞閸曨厽鍊為柨娑欒壘椤┭囧几濠婂嫭笑title闁哄秴娲ㄩ鐑芥晬鐏炵晫鏆氶柛蹇嬪姀閻戯附娼婚崶鈺冨€抽悹鍥ㄥ灥椤︹晠鎮堕崱顓犵濞ｅ洦绻冪€垫梹銇勯悽鍛婃〃闁绘鎳撻悾楣冩儍閸曨剛鍨煎Λ?
            if (key === 'title') {
                // 婵☆偀鍋撻柡灞诲劜濡叉悂宕ラ敂鑺バitle闁哄秴娲ㄩ?
                const beforeMatch = result.substring(0, result.indexOf(match));
                const lastTitleIndex = beforeMatch.lastIndexOf('<title');
                const lastCloseTitleIndex = beforeMatch.lastIndexOf('</title>');
                
                // 濠碘€冲€归悘澶愬嫉閳ь剚娼婚幋鐘崇暠<title闁哄秴娲ㄩ鐑藉捶閵婏附浠橀弶鈺傚灩濞?/title>闁哄秴娲ㄩ閿嬬▕鐎ｎ亝鍊甸柨娑樼焷椤曗晠寮版惔銈囩闁哄嫮妞俰tle闁哄秴娲ㄩ鐑藉礃閸涱収鍟?
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
        
        // 闁哄洦瀵у畷鎻捨熼埄鍐╃凡闁告瑦锕㈤崳鐑樹繆?{{t:key}}
        result = result.replace(/\{\{t:(\w+)\}\}/g, (match, key) => {
            return this.getNestedTranslation(translations, key) || match;
        });
        
        return result;
    }
    
    // 閺夆晜鍔橀、鎴犵礄閺勫繒妲Δ鐘茬焷閻?
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

    // 闁兼儳鍢茶ぐ鍥ㄦ綇閹惧啿姣夐悹渚灠缁剁偤鏁嶉崼锝咁伆闁哄倸娲╃欢顓㈠礄閸濆嫬鐓傞柡宥呮贡濞叉媽銇愰弴顏嗙闁稿繑婀圭划顒傛嫚椤撯檧鏋呴弶鍫熸尭閸ゎ參宕氶弶娆惧殸閹煎瓨姊诲ú鎷屻亹閺囶亞绀?
    getOutputPath(pageOutput, lang) {
        if (lang === this.defaultLanguage) {
            // 闁兼槒椴搁弸鍐╂綇閹惧啿姣夐柛鎺斿閻楁挳鎯勯鑲╃Э
            return pageOutput;
        }
        // 闁稿繑婀圭划顒傛嫚椤撯檧鏋呴弶鍫熸尭閸ゎ參宕氶幏宀婂殧閻熷皝鍋撻悗娑欏姉濞叉媽銇?
        return path.join(lang, pageOutput);
    }
    
    // 闁兼儳鍢茶ぐ鍢L閻犱警鍨扮欢鐐烘晬閸絽顏伴柡鍌氭处濡倝宕滃鍥╃；闁挎稑鑻崣鐐閺嶎剦鍤旈悷灏佸亾闁哄牆顦晶鐘电磽閳ь剨绱?
    getUrlPath(pagePath, lang) {
        if (lang === this.defaultLanguage) {
            return `/${pagePath.replace('.html', '')}`;
        }
        return `/${lang}/${pagePath.replace('.html', '')}`;
    }
    
    // 闁汇垻鍠愰崹姘緞濮樻剚鍤旈悷灏佸亾濡炪倗鏁诲?
    buildMultiLangPages() {
        console.log('\n Building multilingual pages...');
        console.log(' URL');
        
        // 濠㈣泛瀚幃濠囧礃閸涘瓨鎳犻梺鏉跨Ф閻?
        const internalLinksResult = this.internalLinksProcessor.process(this.translations);
        if (!internalLinksResult.success) {
            console.error('[ERROR] Internal links processing failed, continuing with build...');
        }
        
        // 濞达綀娉曢弫銈囩尵鐠囪尙娼ｉ柟顑倽鍘悗瑙勭煯缁犵喖鎯冮崟顐ｅ剻闁活潿鍔忛銏㈡嚊閳?
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

        // 缁绢収鍠曠换姘跺几閸曨偆绱﹂柣鈺婂枛缂嶅秶鈧稒锚濠€?- 閻庣懓鑻崣蹇撱€掗崨瀛樼彑妤犵偛鐖奸崳鎼佸棘閺夊灝鐏＄€?
        const outputDir = 'multilang-build';
        if (fs.existsSync(outputDir)) {
            // 闁告帞濞€濞呭酣寮紙鐘诲殝闁烩晩鍠栫紞?- 濞达綀娉曢弫銈夋焻閹烘垹绉洪柛鎺斿█濞?
            try {
                fs.rmSync(outputDir, { recursive: true, force: true });
                console.log('[OK] Cleared existing build directory');
            } catch (error) {
                console.warn('  Warning: Could not remove existing directory:', error.message);
            }
        }
        fs.mkdirSync(outputDir, { recursive: true });

        // 濞戞挾鍎ら惁锛勭矓瀹ュ懏鍎欓柣顫妿濞堟垹鎷犻鈾€鏋呴柡瀣缂傛挻銇勯悽鍛婃〃
        for (const lang of enabledLanguages) {
            console.log(`\n Building pages for language: ${lang.toUpperCase()}`);
            
            // 闁兼槒椴搁弸鍐╂綇閹惧啿姣夐柛鎺斿閻楁挳鎯勯鑲╃Э闁挎稑鑻崣鐐閺嶎剦鍤旈悷灏佸亾閺夊牊鎸搁崵顓㈠礆閹峰矈鍤旈悷灏佸亾閻庢稒鍔楀ú鎷屻亹?
            const langDir = lang === this.defaultLanguage ? outputDir : path.join(outputDir, lang);
            fs.mkdirSync(langDir, { recursive: true });
            
            if (lang === this.defaultLanguage) {
                console.log(`     English pages will be built at root directory`);
            } else {
                console.log(`     ${lang.toUpperCase()} pages will be built at /${lang}/ directory`);
            }

            // 闁告梻濮惧ù鍥╂嫚閵夘煈鍤旈悷灏佸亾闁汇劌瀚悙鏇犳嫚閹寸偞鐎ù?
            const translationPath = path.join('locales', lang, 'translation.json');
            let translations = {};
            
            try {
                translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
                console.log(`[OK] Loaded translations for ${lang}`);
            } catch (error) {
                console.warn(`    Warning: Could not load translations for ${lang}:`, error.message);
                continue; // 閻犲搫鐤囩换鍐ㄢ柦閳╁啯绠掔紓鍫熸閻ρ囧棘閸ワ附顐介柣銊ュ椤曘垻鎳涢埀?
            }

            buildReport.pages[lang] = [];
            
            // 濞戞捇缂氶姘辨嫚椤撯檧鏋呴柛鎺撶☉缂傛捁绠涢崨閭︽矗闁汇劌瀚悺娆撴儎椤旇偐绉?
            const deviceDir = path.join(langDir, 'devices');
            fs.mkdirSync(deviceDir, { recursive: true });
            
            // 闁哄瀚紓鎾舵嫚閵夘煈鍤旈悷灏佸亾闁汇劌瀚晶宥夊嫉婢舵劑鈧妫?
            for (const page of config.pages) {
                // 婵☆偀鍋撻柡灞诲劦閵嗗妫冮姀鈩冃﹂柛姘剧畵濡炬椽宕氶張鐢靛晩闁绘鎳撻悾鍓ф嫚椤撯檧鏋?
                if (page.enabled_languages && !page.enabled_languages.includes(lang)) {
                    continue; // 閻犲搫鐤囩换鍐╃▔瀹ュ鍋撻崒婊勬殢濞存粌楠哥紞瀣礈瀹ュ牜鍤旈悷灏佸亾闁汇劌瀚伴妴澶愭?
                }
                
                totalPages++;
                
                try {
                    const outputPath = this.getOutputPath(page.output, lang);
                    console.log(`   Building ${outputPath}`);
                    
                    // 闁告垵妫楅ˇ顒併亜閻㈠憡妗ㄩ柡浣哄瀹撲線鐛幆鎵闁轰胶顥愰惌鎯ь嚗?
                    const pageData = {
                        lang: lang,
                        lang_prefix: lang === this.defaultLanguage ? '' : `/${lang}`,
                        lang_code: lang.toUpperCase(),
                        page_content: page.page_content,
                        ...page.config
                    };
                    
                    // 婵烇綀顕ф慨鐐碘偓浣冨閸╁懘鎮╅懜纰樺亾娴ｅ湱鍨奸悹?
                    const pagePath = page.path || page.config.path || outputPath || '';
                    
                    pageData.is_home = pagePath === 'index.html' || pagePath === '';
                    pageData.is_blog = pagePath.includes('blog/') || pagePath.startsWith('blog');
                    
                    // 濠碘€冲€归悘澶嬨亜閻㈠憡妗ㄩ梺鏉跨Ф閻ゅ棙绋夐鐐插殥缂備礁绻楅鏇犵磾椤旇崵鍟婇悗浣冨閸╁懘鎮╅懜纰樺亾娓氬﹦绀夊ù锝堟硶閺併倝鏌婂鍥╂瀭闁汇劌瀚埀?
                    if (typeof page.config.is_gaming !== 'undefined') {
                        pageData.is_gaming = page.config.is_gaming;
                        pageData.is_tools = page.config.is_tools || false;
                        pageData.is_devices = page.config.is_devices || false;
                    } else {
                        // 闁告牕鎼崹?Tools 闁?Devices闁挎稑鐗婄敮鎾绘⒔椤﹀窓b濡炪倗鏁诲甯窗
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
                    
                    // 濞寸姴娴烽悙鏇犳嫚閹寸偞鐎ù鐘虫构閼垫垿鎳㈠畡鏉跨悼濡炪倗鏁诲浼存偋閻熸壆鏆伴柣銊ュ閻愭洜鎷犻幋婵冨亾?
                    if (pageData.page_title_key) {
                        // 闁衡偓椤栨稑鐦€规挸鑻〃婊堟儍閸曨厾鍊抽悹鍥ㄥ灴閺侇參鏁嶇仦绛嬫搐 "ppiCalculator.pageTitle"
                        const translationValue = this.getNestedTranslation(translations, pageData.page_title_key);
                        if (translationValue) {
                            pageData.page_title = translationValue;
                        } else {
                            // 婵″倹鐏夊▽鈩冩箒閹垫儳鍩岀紙鏄忕槯閿涘奔濞囬悽銊╃帛鐠併倗娈憃g_title
                            pageData.page_title = pageData.og_title || 'Screen Size Checker';
                        }
                    } else {
                        pageData.page_title = pageData.og_title || 'Screen Size Checker';
                    }
                    
                    // 缁绢収鍠曠换姝礽tle闁告瑦锕㈤崳鐑樼▕閻旀椿娼堕悹浣稿⒔閻ゅ棝鏁嶉崼銏℃殢濞存粌绌籩ad.html缂備礁瀚▎顫窗
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
                    // 濞ｅ浂鍠楅娓別scription婵炲鍔岄崣鍡涙焻閺勫繒甯嗛柨娑樻湰閺侇噣骞愭担鍝ャ偟濠靛倹顨堥悙鏇犳嫚閹达附鏆?
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
                    
                    // 閻犲鍟弳锝夋濞嗘劏鍋撴担鐣屻偒婵犙勫姌閻儳顕?
                    const depth = page.output.split('/').length - 1;
                    // 閻庤鐭粻?prefix 闁活潿鍔嬬花顒勫触鎼达絿鏁鹃悹渚灠缁剁偟鎷嬮敍鍕毈
                    const prefix = depth > 0 ? '../'.repeat(depth) : '';
                    
                    if (lang === this.defaultLanguage) {
                        // 闁兼槒椴搁弸鍐捶閵婏妇澹岄柣鈺婂枛缂?
                        if (depth === 0) {
                            // 闁哄秴婀卞ú鎷屻亹閺囨艾鐦滃?
                            pageData.css_path = 'css';
                            pageData.locales_path = 'locales';
                            pageData.js_path = 'js';
                        } else {
                            // 閻庢稒鍔楀ú鎷屻亹閺囶潿鈧妫?
                            pageData.css_path = prefix + 'css';
                            pageData.locales_path = prefix + 'locales';
                            pageData.js_path = prefix + 'js';
                        }
                    } else {
                        // 闁稿繑婀圭划顒傛嫚椤撯檧鏋呴柛锔哄姀椤曘垻鎳涢埀顒傗偓娑欏姉濞叉媽銇?
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
                    
                    // 闁哄洤鐡ㄩ弻濠囨儎缁嬫鍤犻梺鍓у亾鐢鎹勯姘辩獮
                    if (pageData.home_url) {
                        if (lang === this.defaultLanguage) {
                            // 闁兼槒椴搁弸鍐晬濮橆剚绀€闁告帞澧楅悧鎾儎椤旇偐绉?
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        } else {
                            // 闁稿繑婀圭划顒傛嫚椤撯檧鏋呴柨娑欒壘濞叉牠宕氶幏宀婂殧閻熷皝鍋撻柡宥呮贡濞叉媽銇?
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        }
                    }
                    
                    if (pageData.device_links_base) {
                        pageData.device_links_base = pageData.device_links_base.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.device_links_base.substring(3)
                            : (depth > 0 ? prefix + pageData.device_links_base : pageData.device_links_base);
                    }
                    
                    // 濞ｅ浂鍠栭ˇ鏌ュ础濮橆剦鍚俇RL
                    if (pageData.blog_url) {
                        if (lang === this.defaultLanguage) {
                            // 闁兼槒椴搁弸鍐础濮橆剦鍚傞柛锔哄妽閻楁挳鎯勯鑲╃Э /blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        } else {
                            // 闁稿繑婀圭划顒傛嫚椤撯檧鏋呴柛妤佽壘椤撳綊宕烽妸銉﹀€楅柤濂変簽濞堟垹鎷犻鈾€鏋呴柣鈺婂枛缂嶅秵绋?/zh/blog/, /de/blog/, /es/blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        }
                    }
                    
                    if (pageData.privacy_policy_url) {
                        pageData.privacy_policy_url = pageData.privacy_policy_url.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.privacy_policy_url.substring(3)
                            : prefix + pageData.privacy_policy_url;
                    }
                    
                    // 闁哄洤鐡ㄩ弻濠勬嫚椤撯檧鏋呴柣鈺冾焾閸櫻囨儍閸掑嚧L闁告粌鐭侀惌鎯ь嚗?
                    if (lang === this.defaultLanguage) {
                        // 闁兼槒椴搁弸鍍揜L濞戞挸绉瑰〒鍓佹啺娴ｇ瓔鍤旈悷灏佸亾闁告挸绉剁槐?
                        // 缁绢収鍠曠换姘▔瀹ュ懎鐦堕柛?/en/ 闁告挸绉剁槐?
                        pageData.canonical_url = pageData.canonical_url.replace('/en/', '/');
                    } else {
                        // 闁稿繑婀圭划顒傛嫚椤撯檧鏋呴梻鍥ｅ亾閻熸洑娴囬銏㈡嚊閳ь剟宕滃鍥╃；
                        if (!pageData.canonical_url.includes(`/${lang}/`)) {
                            pageData.canonical_url = pageData.canonical_url.replace(
                                'https://screensizechecker.com/',
                                `https://screensizechecker.com/${lang}/`
                            );
                        }
                    }
                    
                    // 缂佸顭峰▍?html闁告艾娴风槐鎴炵閵夈儱鐖遍梺鏉胯埗loudflare Pages闁汇劌鍨奟L闁哄秶鍘х槐?
                    pageData.canonical_url = pageData.canonical_url.replace(/\.html$/, '');
                    pageData.og_url = pageData.canonical_url;

                    if (pageData.canonical_url.includes('/blog/tag/') || pageData.canonical_url.includes('/blog/category/')) {
                        pageData.robots_directives = 'noindex,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
                    } else {
                        pageData.robots_directives = pageData.robots_directives || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
                    }
                    
                    // 闁哄洤鐡ㄩ弻濂減en Graph闁轰胶澧楀畵浣圭閵夈倕鈻忛柣顫妿閻愭洜鎷犻幋婵囧€甸柣銊ュ閸炲鈧?
                    pageData.og_title = pageData.page_title || pageData.og_title;
                    pageData.og_description = pageData.description || pageData.og_description;

                    // 閻犱礁澧介悿鍞巊:image - 濞达綀娉曢弫銈嗐亜閻㈠憡妗ㄩ柣妤冩嚀閻ｉ箖宕堕崜褍顣婚柟瀛樼墵缁垳鎷嬮妶鍛€诲ù婊庡亜濞?
                    if (!pageData.og_image) {
                        pageData.og_image = 'https://screensizechecker.com/images/og-default.png';
                    }

                    // 閻犱礁澧介悿鍞巊:locale
                    const localeMap = {
                        'en': 'en_US',
                        'zh': 'zh_CN',
                        'de': 'de_DE',
                        'es': 'es_ES',
                        'fr': 'fr_FR',
                        'pt': 'pt_BR'
                    };
                    pageData.og_locale = localeMap[lang] || 'en_US';
                    
                    // 婵烇綀顕ф慨鐎恟eflang闁烩晝顭堥崣褔寮悧鍫濈ウ
                    pageData.base_url = 'https://screensizechecker.com';
                    
                    // 閻犱緤绱曢悾缁樸亜閻㈠憡妗ㄩ悹渚灠缁剁偤鏁嶉崼婊呯憹闁告牕鎳庨幆鍫㈡嫚椤撯檧鏋呴柛鎾崇Ф缁辨埊绱?
                    if (lang === this.defaultLanguage) {
                        pageData.page_path = pageData.canonical_url.replace('https://screensizechecker.com', '');
                    } else {
                        pageData.page_path = pageData.canonical_url.replace(`https://screensizechecker.com/${lang}`, '');
                    }
                    if (!pageData.page_path) {
                        pageData.page_path = '/';
                    }
                    
                    // 濞戞挾顕瞨eflang闁哄秴娲ㄩ椋庢媼閸撗呮瀭婵繐绲块垾姗€鎯冮崚鍑碙
                    // 濠碘€冲€归悘澶嬨亜閻㈠憡妗ㄩ梺鏉跨Ф閻ゅ棙绋夐鐐插殥闁哄牆鈥渞eflang URL闁挎稑鐗嗛々褔宕″顒夊悅闁哄秴娲ㄩ閿嬨亜閻㈠灚鐣遍悹鎭掑姀椤曘垻鎳涢埀顒勫及閻樿尙娈搁柨娑橆檧缁辨繈宕氬▎搴ｇ闁?
                    // 闁告熬绠戦崹顖炲春鏉炴壆鑹緋age_path閻犱緤绱曢悾?
                    if (!pageData.hreflang_en_url) {
                        // x-default 闁告粌鐭佺€氭娊寮崶鈺侇暭闁哄牜鍓熼崗姗€骞愰崶褎鍊婚柡宥囶攰閻儳顕ラ崟鍓佺闁?/en/ 闁告挸绉剁槐鎴窗
                        pageData.hreflang_root_url = pageData.page_path === '/' ?
                            'https://screensizechecker.com/' :
                            `https://screensizechecker.com${pageData.page_path}`;

                        pageData.hreflang_en_url = pageData.hreflang_root_url;

                        // 濞戞搩鍘介弸鍐偋閸喐鎷?
                        pageData.hreflang_zh_url = `https://screensizechecker.com/zh${pageData.page_path}`;

                        // 鐎垫壆鏌夐銏ゆ偋閸喐鎷?
                        pageData.hreflang_de_url = `https://screensizechecker.com/de${pageData.page_path}`;

                        // 閻熸鍎婚銏ゆ偋閸喐鎷?
                        pageData.hreflang_es_url = `https://screensizechecker.com/es${pageData.page_path}`;

                        pageData.hreflang_fr_url = `https://screensizechecker.com/fr${pageData.page_path}`;

                        pageData.hreflang_pt_url = `https://screensizechecker.com/pt${pageData.page_path}`;
                    }
                    
                    // 婵烇綀顕ф慨鐐电磼閹惧鈧垶宕犻弽銊︽闁?
                    pageData.structured_data = this.generateStructuredData(pageData, lang);
                    
                    // 濞戞挾鍎ら悧瀹犵疀閸愩劋绱ｉ柛蹇曞厴閵嗗妫冮姀鈩冩殘闁稿浚妾禔Q缂備焦鎸婚悗顖炲礌閺嶃劍娈堕柟璇″櫙缁辨繈骞撻幇顒€纾砈ERP閻庨潧鐬肩划銊╁几濠婂嫭绨氬ù?
                    pageData.faq_structured_data = pageData.faq_structured_data || this.generateFAQStructuredDataForPage(page.name, lang);
                    
                    // 闁哄瀚紓鎻孴ML
                    let html = this.buildPage(page.template, pageData);
                    
                    // 閹煎瓨姊婚弫銈囩礄閺勫繒妲?
                    html = this.translateContent(html, translations);
                    
                    // 濠㈣泛瀚幃濠囧礃閸涘瓨鎳?
                    html = this.internalLinksProcessor.processPageLinks(html, page.name, lang);
                    
                    // 濞ｅ浂鍠栭ˇ鐫璗ML缂備焦鎸婚悗顖炴煥濞嗘帩鍤?- 缂佸顭峰▍宸慹ta闁哄秴娲ㄩ鐑藉触鎼达絾鐣遍梺鎻掔Т椤︽煡寮崶褏鎽?
                    html = html.replace(/<meta name="description"[^>]*content="([^"]*)"[^>]*>([^<]*)<meta name="keywords"/g, (match, contentValue, extraText) => {
                        if (extraText && extraText.trim()) {
                            console.log(' Fixed meta description duplicate text');
                            return `<meta name="description" content="${contentValue}">
<meta name="keywords"`;
                        }
                        return match;
                    });
                    
                    // 闁哄洤鐡ㄩ弻濂孴ML lang閻忕偟鍋為埀?
                    html = html.replace('<html lang="en">', `<html lang="${lang}">`);
                    
                    // 濞ｅ浂鍠栭ˇ鏌ユ濞嗘劏鍋撴担鐣屻偒婵犙勫姌閻儳顕?
                    const fullOutputPath = lang === this.defaultLanguage ? page.output : path.join(lang, page.output);
                    html = this.fixStaticResourcePaths(html, fullOutputPath);
                    
                    // 闁告劖鐟ラ崣鍡涘棘閸ワ附顐?
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

        // 闁哄洤鐡ㄩ弻?supportedLanguages 闁告瑯浜滅€垫﹢宕ラ銏″剻闁活潿鍔庡▓鎴犳嫚椤撯檧鏋?
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

        // 濞ｅ洦绻傞悺銊╁几閸曨偆绱﹂柟韬插劚閹?
        fs.writeFileSync(
            path.join(outputDir, 'build-report.json'),
            JSON.stringify(buildReport, null, 2)
        );

        // 濠㈣泛绉撮崺妤呮濞嗘劏鍋撴担鐣屻偒婵犙勫姧缁辨瑩宕ｉ鍕垫Щ闁告帒鐖煎〒鍓佹啺娴ｇ儤鐣遍柡鍌氭矗濞嗩澁绱?
        this.copyRequiredStaticResources(outputDir);
        
        // 闂傚棗妫欓崹姘跺箑瑜戦崗姗€鎯勯幋鐐蹭粯缂侇垵宕电划?
        this.integratePerformanceMonitoring(outputDir);
        
        // 闁汇垻鍠愰崹姘辨嫚椤撯檧鏋呴梺顐㈩槹鐎氥劎妲愰姀鐘电┛濡炪倗鏁诲?
        this.generateLanguageIndex(outputDir);
        
        // 闁汇垻鍠愰崹姘緞濮樻剚鍤旈悷灏佸亾缂傚啯鍨归悵顖炲捶閺夋寧绂堥柨娑樼墕瑜把囧礌閸涱厽鍎撻柛姘煎灣閺併倝鎯冮崟顕呭殧閻熷皝鍋撻敍?
        this.generateMultiLanguageSitemap(outputDir);
        
        // 闁圭瑳鍡╂斀闁告劕鎳庨鎰▔閳ь剟鎳涚€涙ǚ鍋撹椤ュ懘寮?
        this.validateContentConsistency(outputDir);
        
        // 闁圭粯鍔曡ぐ鍥嵁鐠哄搫鏁堕柤杈ㄦ煥閸櫻囨煥閻＄瓖S (濞戞挸鐡ㄥ鍌滅矉娴ｇ儤鏆忓ù鐘劙閹便劍寰勫畝绡L缂備焦鎸婚悗顖炴⒒椤曗偓椤?
        // this.extractAndInlineCriticalCSS(outputDir);

        return buildReport;
    }
    
    // 闂侇偅甯掔紞濠囧礆閻樼粯鐝熼柣鈺婂枛缂嶅秹鏁嶉崼婵嗘倯閻庣顫夐埀顑嫭鐓欐繛澶嬫穿缁?
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

    // 濠㈣泛绉撮崺妤呮濞嗘劏鍋撴担鐣屻偒婵犙勫姈閺嬪啯绂?
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
            { source: '_redirects', dest: '_redirects' },
            { source: 'public', dest: '.' }
        ];
        
        resourcesToCopy.forEach(({ source, dest }) => {
            const sourcePath = path.join(this.rootPath, source);
            const destPath = path.join(outputDir, dest);
            
            if (fs.existsSync(sourcePath)) {
                try {
                    if (fs.statSync(sourcePath).isDirectory()) {
                        // 濠㈣泛绉撮崺妤呮儎椤旇偐绉?
                        this.copyDirectory(sourcePath, destPath);
                        console.log(`[OK] Copied directory: ${source}`);
                    } else {
                        // 濠㈣泛绉撮崺妤呭棘閸ワ附顐?
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
    
    // 闂侇偅甯掔紞濠冨緞瀹ュ懎鐓戦柣鈺婂枛缂?
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

    // 濠㈣泛绉撮崺妤勭疀閸涢偊娲ｉ柣銊ュ濞笺倝骞€娴ｇ晫銈繝褎鍔х槐娆撴焼閸喖甯冲璺虹Т閸╂寮甸鍕剻闁活潿鍔庡▓鎴犳嫚椤撯檧鏋呴柣鈺婂枛缂嶅稄绱?
    copyRequiredStaticResources(outputDir) {
        console.log('\n Copying required static resources...');
        
        // 闂傚洠鍋撻悷鏇氳兌濞插潡骞掗妷銉Щ闁告帒澧庡▓鎴犳導閸曨剛鐖遍柨娑樼墔缁楀宕犻崨顔碱仾robots.txt闁告粌鐣﹔edirects闁挎稑鐭佺换鏍ㄧ濞戞娈洪柛鏂诲妽閳ь兛鑳堕弫鎾诲箣閹板墎绀?
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
        
        // 闁告鑹鹃褰掑炊閸撗冾暬閻犙冨缁噣鏁嶉崼婵嗙闁绘瑯鍓欓ˇ鈺呮偠閸☆厾绀夐柛銉уС鐠愮喖妫侀埀顒傛啺娴ｅ壊妲婚柛鎺曟硾閸╁矂鎮ч悷鎵毎濞达絽绉堕悿鍡窗
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

        const publicAssetsSource = path.join(this.rootPath, 'public');
        if (fs.existsSync(publicAssetsSource)) {
            try {
                this.copyDirectoryRecursive(publicAssetsSource, outputDir);
                console.log('[OK] Copied public assets to site root');
            } catch (error) {
                console.warn('    Warning: Could not copy public assets:', error.message);
            }
        }
        
        // 闁汇垻鍠愰崹姘濡搫顕ч柣銊ュ灣redirects闁告粌顔憃bots.txt闁哄倸娲ｅ▎?
        this.generateRedirectsFile(outputDir);
        this.generateRobotsFile(outputDir);
    }

    // 闂侇偅甯掔紞濠冨緞瀹ュ懎鐓戦柣鈺婂枛缂?
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

    // 闂傚棗妫欓崹姘跺箑瑜戦崗姗€鎯勯幋鐐蹭粯缂侇垵宕电划?
    integratePerformanceMonitoring(outputDir) {
        console.log('\n Integrating Performance Monitoring System...');
        
        try {
            // 1. 濡ょ姴鐭侀惁澶愬箑瑜戦崗姗€鎯勯幋鐐蹭粯闁哄倸娲ｅ▎銏ゅ及椤栨碍鍎婇悗娑櫭﹢?
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
            
            // 2. 濡ょ姴鐭侀惁?app.js 闁哄嫷鍨伴幆渚€宕犻崨顓熷創闁诡儸鍡楀幋闁烩晜鍨剁敮鍓佲偓鐢靛帶閸?
            const appJsContent = fs.readFileSync(appJsPath, 'utf8');
            if (!appJsContent.includes("import { performanceMonitor } from './performance-monitor.js'")) {
                console.warn('    Warning: app.js does not import performance monitor');
            } else {
                console.log('[OK] app.js includes performance monitor import');
            }
            
            // 3. 闁告帗绋戠紓鎾诲箑瑜戦崗姗€鎯勯幋鐐蹭粯婵炴潙顑堥惁顖涖亜閻㈠憡妗?
            this.createPerformanceTestPage(outputDir);
            
            // 4. 閻㈢喐鍨氶幀褑鍏橀惄鎴炲付闁劎璁查幎銉ユ啞
            this.generatePerformanceDeploymentReport(outputDir);
            
            // 5. 濡ょ姴鐭侀惁澶愬礂閹惰姤鏆涢柡鍌氭矗濞?
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

    // 闁告帗绋戠紓鎾诲箑瑜戦崗姗€鎯勯幋鐐蹭粯婵炴潙顑堥惁顖涖亜閻㈠憡妗?
    createPerformanceTestPage(outputDir) {
        const testPagePath = path.join(outputDir, 'performance-test-production.html');

        const testPageContent = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '    <title>Performance Monitor Test Page</title>',
            '    <style>',
            '        body { font-family: Arial, sans-serif; max-width: 880px; margin: 0 auto; padding: 20px; line-height: 1.6; background: #f8f9fa; }',
            '        .container { background: #fff; padding: 24px; border-radius: 10px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }',
            '        .status-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px; margin: 14px 0; }',
            '        .status-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }',
            '        .status-indicator.good { background: #28a745; }',
            '        .status-indicator.warning { background: #ffc107; }',
            '        .status-indicator.error { background: #dc3545; }',
            '        .metrics-display { background: #1f2937; color: #e5e7eb; padding: 12px; border-radius: 6px; font-family: Consolas, monospace; font-size: 12px; margin-top: 12px; max-height: 280px; overflow-y: auto; white-space: pre-wrap; }',
            '        button { background: #007bff; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; margin-right: 8px; margin-top: 8px; }',
            '        button:hover { background: #0056b3; }',
            '        .alert { padding: 10px 12px; border-radius: 6px; margin-top: 12px; }',
            '        .alert-success { background: #d1e7dd; color: #0f5132; border: 1px solid #badbcc; }',
            '        .alert-warning { background: #fff3cd; color: #664d03; border: 1px solid #ffecb5; }',
            '        .alert-danger { background: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }',
            '    </style>',
            '</head>',
            '<body>',
            '    <div class="container">',
            '        <h1>Performance Monitor Test</h1>',
            '        <p>Use this page to validate the production performance monitor integration.</p>',
            '        <div class="status-card">',
            '            <h3><span id="system-status" class="status-indicator error"></span>Monitoring system status</h3>',
            '            <div id="status-message">Waiting for initialization...</div>',
            '            <button onclick="checkSystemStatus()">Check status</button>',
            '        </div>',
            '        <div class="status-card">',
            '            <h3>Core Web Vitals</h3>',
            '            <div id="cwv-status">No metrics loaded yet.</div>',
            '            <div id="cwv-display" class="metrics-display">Metrics will appear here.</div>',
            '            <button onclick="refreshMetrics()">Refresh metrics</button>',
            '            <button onclick="exportData()">Export data</button>',
            '        </div>',
            '        <div class="status-card">',
            '            <h3>Manual test actions</h3>',
            '            <p>Run synthetic checks to verify long task, layout shift, and resource tracking.</p>',
            '            <button onclick="testLongTask()">Test long task</button>',
            '            <button onclick="testLayoutShift()">Test layout shift</button>',
            '            <button onclick="testResourceLoading()">Test resource loading</button>',
            '            <div id="test-results" class="metrics-display" style="min-height: 140px;">Test logs will appear here.</div>',
            '        </div>',
            '    </div>',
            '    <script type="module">',
            '        let testLog = [];',
            '        let performanceMonitor = null;',
            '        function addTestLog(message) {',
            '            const timestamp = new Date().toLocaleTimeString();',
            '            const entry = "[" + timestamp + "] " + message;',
            '            testLog.push(entry);',
            '            if (testLog.length > 40) testLog = testLog.slice(-40);',
            '            const resultsDiv = document.getElementById("test-results");',
            '            if (resultsDiv) {',
            '                resultsDiv.textContent = testLog.join(\"\n\");',
            '                resultsDiv.scrollTop = resultsDiv.scrollHeight;',
            '            }',
            '        }',
            '        function updateSystemStatus(status, message) {',
            '            const dot = document.getElementById("system-status");',
            '            const msg = document.getElementById("status-message");',
            '            if (dot) dot.className = "status-indicator " + status;',
            '            if (msg) msg.textContent = message;',
            '        }',
            '        async function initializeMonitoring() {',
            '            try {',
            '                const module = await import("./js/performance-monitor.js");',
            '                performanceMonitor = module.performanceMonitor;',
            '                if (!performanceMonitor) throw new Error("performanceMonitor export is missing");',
            '                addTestLog("✅ Performance monitor module loaded successfully");',
            '                updateSystemStatus("good", "Monitoring system is available");',
            '                return true;',
            '            } catch (error) {',
            '                addTestLog("❌ Failed to load performance monitor: " + error.message);',
            '                updateSystemStatus("error", "Initialization failed: " + error.message);',
            '                return false;',
            '            }',
            '        }',
            '        window.checkSystemStatus = async function() {',
            '            addTestLog("🔍 Checking monitor status...");',
            '            const ok = await initializeMonitoring();',
            '            updateSystemStatus(ok ? "good" : "error", ok ? "System healthy and ready" : "System check failed");',
            '        };',
            '        window.refreshMetrics = function() {',
            '            if (!performanceMonitor) {',
            '                addTestLog("❌ Monitor not initialized. Please run check status first.");',
            '                return;',
            '            }',
            '            try {',
            '                const metrics = performanceMonitor.getMetrics();',
            '                const lcp = metrics.lcp && metrics.lcp.value !== null ? metrics.lcp.value.toFixed(1) + "ms" : "N/A";',
            '                const fid = metrics.fid && metrics.fid.value !== null ? metrics.fid.value.toFixed(1) + "ms" : "N/A";',
            '                const cls = metrics.cls && metrics.cls.value !== null ? metrics.cls.value.toFixed(3) : "N/A";',
            '                const cwvDisplay = document.getElementById("cwv-display");',
            '                if (cwvDisplay) cwvDisplay.textContent = \"Core Web Vitals Metrics\n\nLCP: \" + lcp + \"\nFID: \" + fid + \"\nCLS: \" + cls;',
            '                const cwvStatus = document.getElementById("cwv-status");',
            '                if (cwvStatus) {',
            '                    const score = metrics.performanceScore;',
            '                    if (score >= 90) cwvStatus.innerHTML = "<div class=\"alert alert-success\">✅ Good performance score: " + score + "/100</div>";',
            '                    else if (score >= 70) cwvStatus.innerHTML = "<div class=\"alert alert-warning\">⚠️ Needs improvement: " + score + "/100</div>";',
            '                    else cwvStatus.innerHTML = "<div class=\"alert alert-danger\">❌ Poor performance score: " + score + "/100</div>";',
            '                }',
            '                addTestLog("📈 Metrics refreshed successfully");',
            '            } catch (error) {',
            '                addTestLog("❌ Failed to refresh metrics: " + error.message);',
            '            }',
            '        };',
            '        window.testLongTask = function() {',
            '            addTestLog("🧪 Running long task simulation...");',
            '            const start = performance.now();',
            '            while (performance.now() - start < 100) {}',
            '            setTimeout(() => {',
            '                if (performanceMonitor) {',
            '                    const metrics = performanceMonitor.getMetrics();',
            '                    addTestLog("✅ Long tasks detected: " + metrics.longTasksCount);',
            '                }',
            '            }, 500);',
            '        };',
            '        window.testLayoutShift = function() {',
            '            addTestLog("🧪 Running layout shift simulation...");',
            '            const testDiv = document.createElement("div");',
            '            testDiv.style.cssText = "height:100px;background:#ffeb3b;margin:10px 0;padding:20px;border-radius:5px;";',
            '            testDiv.textContent = "Temporary block to trigger layout shift";',
            '            document.body.appendChild(testDiv);',
            '            setTimeout(() => {',
            '                testDiv.remove();',
            '                if (performanceMonitor) {',
            '                    const cls = performanceMonitor.getMetric("CLS");',
            '                    addTestLog("✅ Layout shift test complete. CLS: " + (cls !== null ? cls.toFixed(3) : "N/A"));',
            '                }',
            '            }, 1500);',
            '        };',
            '        window.testResourceLoading = function() {',
            '            addTestLog("🧪 Running resource loading simulation...");',
            '            const img = new Image();',
            '            img.onload = () => {',
            '                addTestLog("✅ Resource loading test completed");',
            '                if (performanceMonitor) {',
            '                    const metrics = performanceMonitor.getMetrics();',
            '                    addTestLog("ℹ️ Resource timings count: " + metrics.resourceTimingsCount);',
            '                }',
            '            };',
            '            img.onerror = () => addTestLog("❌ Resource loading test failed");',
            '            img.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2NiYSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=";',
            '        };',
            '        window.exportData = function() {',
            '            if (!performanceMonitor) {',
            '                addTestLog("❌ Monitor not initialized. Please run check status first.");',
            '                return;',
            '            }',
            '            try {',
            '                const exported = {',
            '                    timestamp: new Date().toISOString(),',
            '                    url: window.location.href,',
            '                    userAgent: navigator.userAgent,',
            '                    metrics: performanceMonitor.getMetrics(),',
            '                    testLog: testLog',
            '                };',
            '                console.log("[DATA] Export data:", exported);',
            '                addTestLog("📤 Export data has been printed to the browser console");',
            '            } catch (error) {',
            '                addTestLog("❌ Export failed: " + error.message);',
            '            }',
            '        };',
            '        setTimeout(async () => {',
            '            addTestLog("🚀 Performance monitor test page loaded");',
            '            await checkSystemStatus();',
            '            setTimeout(() => refreshMetrics(), 1500);',
            '        }, 500);',
            '        setInterval(() => {',
            '            if (document.visibilityState === "visible" && performanceMonitor) refreshMetrics();',
            '        }, 10000);',
            '    </script>',
            '</body>',
            '</html>'
        ].join('\n');

        fs.writeFileSync(testPagePath, testPageContent);
        console.log('[OK] Created performance test page: performance-test-production.html');
    }

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

    // 闁兼儳鍢茶ぐ鍥棘閸ワ附顐藉鍫嗗啰姣?
    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    // 闁哄秶鍘х槐锟犲礌閺嶃劍鐎ù鐘烘硾閵囧洨浜?
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // 闁圭粯鍔曡ぐ鍥嵁鐠哄搫鏁堕柤杈ㄦ煥閸櫻囨煥閻＄瓖S
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
            
            // 閺夆晜鍔橀、鎴﹀礂閹惰姤鏆汣SS闁圭粯鍔曡ぐ鍥规担琛℃煠
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
    
    // 闁汇垻鍠愰崹姘辩磼閹惧鈧垶宕犻弽銊︽闁?
    generateStructuredData(pageData, lang) {
        // 濠碘€冲€归悘澶嬨亜閻㈠憡妗ㄩ柡浣哄瀹撲焦绋夐鐐插殥缂備礁绻愮€垫﹢宕ラ銈囨尝闁哄瀚€垫煡寮悧鍫濈ウ闂佹澘绉堕悿鍡涙晬鐏炶偐鍠橀柛蹇撶墔婵炲洭鎮?
        if (pageData.structured_data && typeof pageData.structured_data === 'object') {
            // 闁哄洤鐡ㄩ弻濠囧礉閵婏腹鍋撴担鍝ユ憻婵?
            const configStructuredData = { ...pageData.structured_data };
            configStructuredData.url = pageData.canonical_url || configStructuredData.url;
            configStructuredData.name = pageData.page_title || configStructuredData.name;
            configStructuredData.description = pageData.description || configStructuredData.description;
            configStructuredData.inLanguage = lang;

            // 闁哄洤鐡ㄩ弻濠囧籍閵夛附鍩傚☉鎾虫惈缂嶅宕滃鍡橈級闁?
            configStructuredData.dateModified = new Date().toISOString().split('T')[0];

            return this.buildStructuredDataPayload(configStructuredData, pageData, lang);
        }

        // 闁搞儳鍋ら埀顑藉亾闁告帗婢橀悢鈧柡鍫墰缁劑寮搁崟顐㈩嚙闁轰胶澧楀畵?
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

        // 濠碘€冲€归悘澶愬及椤栨艾瑙﹂悗骞垮灲閵嗗妫冮～顔剧婵烇綀顕ф慨鐐哄础濮橆剦鍚傞柣妤冩嚀閻ｉ箖鎯冮崟顓犳尝闁哄瀚€垫煡寮悧鍫濈ウ
        if (pageData.canonical_url.includes('/blog/') && !pageData.canonical_url.includes('/blog/category/') && !pageData.canonical_url.includes('/blog/tag/')) {
            // 閺夆晜鐟﹀Σ鍛婄▔閳ь剚绋夐鍕緮濞达絾鎸惧▓鎴﹀础濮橆剦鍚傞柡鍌氭川閻?
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
                        "url": "https://screensizechecker.com/logo-mark.png"
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

        // 濠碘€冲€归悘澶愬及椤栨艾瑙﹂悗骞垮灮閸屻劌顕ｉ弴顫偓澶愭?
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

    // 濞戞捁妗ㄧ€靛瞼绱掗幘瀵糕偓顖炲礌閺嶃劍娈堕柟璇″櫍濡绢噣宕濋悤姒琫adcrumb闁挎稑鏈ぐ渚€宕￠崶銊﹀仢缂佷究鍨荤划銊╁几濠婂啫璁查悹鍥╃帛閳?
    buildStructuredDataPayload(mainStructuredData, pageData, lang) {
        const breadcrumbStructuredData = this.generateBreadcrumbStructuredData(pageData, lang);
        const additionalStructuredData = Array.isArray(pageData.additional_structured_data)
            ? pageData.additional_structured_data
            : [];

        if (!breadcrumbStructuredData && additionalStructuredData.length === 0) {
            return JSON.stringify(mainStructuredData, null, 2);
        }

        const normalizedMain = { ...mainStructuredData };
        delete normalizedMain['@context'];

        const graph = [normalizedMain];
        additionalStructuredData.forEach(item => {
            if (item && typeof item === 'object') {
                const normalizedItem = { ...item };
                delete normalizedItem['@context'];
                if (!normalizedItem.inLanguage) {
                    normalizedItem.inLanguage = lang;
                }
                graph.push(normalizedItem);
            }
        });

        if (breadcrumbStructuredData) {
            graph.push(breadcrumbStructuredData);
        }

        return JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graph
        }, null, 2);
    }

    // 閻㈢喐鍨氶棃銏犲瘶鐏炴垹绮ㄩ弸鍕閺佺増宓?
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

    // URL闁绘娲﹂灞炬姜椤掆偓瑜拌尙鎷犵紒妯煎灱濡?
    humanizeSegment(segment) {
        return String(segment || '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    }

    // 闁圭顦甸妴澶愭閵忋垺鏅搁柟瀛樷偓鎻俀缂備焦鎸婚悗顖炲礌閺嶃劍娈堕柟?
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
            'standard-resolutions': [
                ['standard_seo_faq_gaming_q', 'standard_seo_faq_gaming_a'],
                ['standard_seo_faq_1080p_q', 'standard_seo_faq_1080p_a'],
                ['standard_seo_faq_1440p_q', 'standard_seo_faq_1440p_a'],
                ['standard_seo_faq_viewport_q', 'standard_seo_faq_viewport_a'],
                ['standard_seo_faq_streaming_q', 'standard_seo_faq_streaming_a'],
                ['standard_seo_faq_check_q', 'standard_seo_faq_check_a_schema']
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

    // 闁哄秷顫夊畵渚€姊婚鍓ф憰闂佹鍠栭顕€鎮介悢绋跨亣FAQ JSON-LD
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

    normalizeInternalAnchorHref(href) {
        if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) {
            return href;
        }

        const sameSiteMatch = href.match(/^(https?:\/\/screensizechecker\.com)(\/[^?#]*)?([?#].*)?$/i);
        if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !sameSiteMatch) {
            return href;
        }

        let origin = '';
        let rawPath = href;
        let suffix = '';

        if (sameSiteMatch) {
            origin = sameSiteMatch[1];
            rawPath = sameSiteMatch[2] || '/';
            suffix = sameSiteMatch[3] || '';
        } else {
            const parts = href.match(/^([^?#]*)([?#].*)?$/);
            if (!parts) {
                return href;
            }

            rawPath = parts[1];
            suffix = parts[2] || '';
        }

        const isCanonicalCandidate =
            rawPath === '' ||
            rawPath === '/' ||
            /(^|\/)en(?:\/|$)/.test(rawPath) ||
            /(^|\/)index\.html$/i.test(rawPath) ||
            /\.html$/i.test(rawPath);

        if (!isCanonicalCandidate) {
            return href;
        }

        const isRootRelative = rawPath.startsWith('/');
        let normalizedPath = rawPath;

        if (isRootRelative) {
            if (normalizedPath === '/en' || normalizedPath === '/en/') {
                normalizedPath = '/';
            } else {
                normalizedPath = normalizedPath.replace(/^\/en(?=\/|$)/, '');
                if (!normalizedPath) {
                    normalizedPath = '/';
                }
            }

            if (normalizedPath === '/index.html') {
                normalizedPath = '/';
            } else if (normalizedPath.endsWith('/index.html')) {
                normalizedPath = normalizedPath.replace(/\/index\.html$/i, '/');
            } else {
                normalizedPath = normalizedPath.replace(/\.html$/i, '');
            }

            if (!normalizedPath) {
                normalizedPath = '/';
            }
        } else {
            let relativePrefix = '';

            while (normalizedPath.startsWith('../')) {
                relativePrefix += '../';
                normalizedPath = normalizedPath.slice(3);
            }

            if (normalizedPath.startsWith('./')) {
                relativePrefix += './';
                normalizedPath = normalizedPath.slice(2);
            }

            if (normalizedPath === 'en' || normalizedPath === 'en/') {
                normalizedPath = '';
            } else if (normalizedPath.startsWith('en/')) {
                normalizedPath = normalizedPath.slice(3);
            }

            if (normalizedPath === 'index.html') {
                normalizedPath = '';
            } else if (normalizedPath.endsWith('/index.html')) {
                normalizedPath = normalizedPath.replace(/\/index\.html$/i, '/');
            } else {
                normalizedPath = normalizedPath.replace(/\.html$/i, '');
            }

            if (!normalizedPath) {
                normalizedPath = relativePrefix || './';
            } else {
                normalizedPath = relativePrefix + normalizedPath;
            }
        }

        return `${origin}${normalizedPath}${suffix}`;
    }

    normalizeInternalAnchorHrefs(html) {
        return html.replace(/<a\b([^>]*?)\bhref=(["'])(.*?)\2([^>]*)>/gi, (match, before, quote, href, after) => {
            const normalizedHref = this.normalizeInternalAnchorHref(href);

            if (normalizedHref === href) {
                return match;
            }

            return `<a${before}href=${quote}${normalizedHref}${quote}${after}>`;
        });
    }

    // 濞ｅ浂鍠栭ˇ鏌ユ濞嗘劏鍋撴担鐣屻偒婵犙勫姌閻儳顕?
    fixStaticResourcePaths(html, outputPath) {
        // 閻犱緤绱曢悾濠氭儎缁嬫鍤犻悹渚灠缁剁偛菐閸楃偛顔?- 闁哄秴娲ら崳顖炲礌閺嶎剛鐔呯€垫澘瀚崹搴ㄦ⒕閺冨偆鍎婂☉鎾跺劋椤掓粓寮鍕祮
        const normalizedPath = outputPath.replace(/\\/g, '/');
        const depth = normalizedPath.split('/').length - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        
        // 婵炲鍔嶉崜浼存晬濮橆厼鐏夊ù鐙€鍓欓崙锛勭磼韫囨挻韬柡瀣缂傛挻娼婚崶鈹炬煠濞戞搩鍙€椤旀洜绱旈鑽ゅ晩婵繐绲块垾姗€鎯冮崟顔剧唴鐎垫澘瀚ぐ澶愭煂韫囥儳绀?
        // 閺夆晜鐟╅崳鐑藉矗椤忓啯鍙忓璺虹Ч閸嬪懏绂嶅☉妯鸿闁煎厖绮欐禒鎰煶韫囨洘鐣辩痪顓у墰缁鳖亪鎯嶆担鐣岀唴鐎?
        
        // 濞ｅ浂鍠栭ˇ鍙夌鐠佸磭绉块梺顒侇殘閺嗏偓闁汇劌瀚垾鏍磽閺嶎偆鍨矯SS閻犱警鍨扮欢?
        html = html.replace(
            /href="css\/main\.css"/g,
            `href="${prefix}css/main.css"`
        );
        
        // 濞ｅ浂鍠栭ˇ鍙夌鐠佸磭绉块梺顒侇殘閺嗏偓闁汇劌瀚垾鏍磽閺嶎偆鍨矹avaScript閻犱警鍨扮欢? 
        html = html.replace(
            /src="js\/app\.js"/g,
            `src="${prefix}js/app.js"`
        );
        
        // 濞ｅ浂鍠栭ˇ鍙夌鐠佸磭绉块梺顒侇殘閺嗏偓闁汇劌瀚悙鏇犳嫚閹寸偞鐎ù鐘冲劶閻儳顕?
        html = html.replace(
            /href="locales\/en\/translation\.json"/g,
            `href="${prefix}locales/en/translation.json"`
        );
        html = html.replace(
            /href="locales\/zh\/translation\.json"/g,
            `href="${prefix}locales/zh/translation.json"`
        );
        
        // 濞ｅ浂鍠栭ˇ鏌ュ础濮橆剦鍚傞柛鎰噹椤旀劖绋夐鐘崇暠闁搞儱澧芥晶鏍崉椤栨氨绐為柨娑樼墦閸ｅ摜鎲版笟濠勭獥濞ｅ浂鍠栭ˇ鏌ュ炊閸撗冾暬闁哄嫬澧介妵姘舵⒒椤曗偓椤ｆ枻绱?
        // 閻?../images/ 濞ｅ浂鍠楅婊勭▔閻戞﹩鍔€缁绢収鍠氬▓鎴︽儎缁嬫鍤犻悹渚灠缁?
        html = html.replace(
            /src="\.\.\/(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );
        
        // 濞ｅ浂鍠栭ˇ鏌ュ础濮橆剦鍚傞柡鍌氭川閻濋攱绋夐鐘崇暠闁搞儱澧芥晶鏍崉椤栨氨绐為柨娑樼墢濞插潡骞?images/ 闁告帞澧楅婊呮兜椤旂偓鐣遍柣鈺冾焾椤曨喚鎹勯姘辩獮閿?
        // 闁告鑹鹃褰掑棘閸モ晝褰块梺顐ｈ壘閻栧爼宕?zh/blog/ 闁烩晩鍠栫紞宥嗙▔鐎ｅ墎绀夐梻鍥ｅ亾閻?../../images/
        html = html.replace(
            /src="(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );

        return this.normalizeInternalAnchorHrefs(html);
    }
    
    // 闁汇垻鍠愰崹姘跺冀閸︻厽绐楃憸鐗堟礀瀹曘儳鈧箍鍨归崬瀵糕偓鍦缁辨瑩鎳熸潏銊︾€柣妤€鐗婂﹢甯窗
    generateRootBlogContent(outputDir, config, englishTranslations) {
        console.log(' Generating root directory blog content...');
        
        // 闁告帗绋戠紓鎾诲冀閸︻厽绐楃憸鐗堟礀瀹曘儳鈧箍鍨诲ú鎷屻亹?
        const rootBlogDir = path.join(outputDir, 'blog');
        fs.mkdirSync(rootBlogDir, { recursive: true });
        
        // 闁告帗绋戠紓鎾诲础濮橆剦鍚傞悗娑欏姉濞叉媽銇?
        const blogSubDirs = ['category', 'tag'];
        blogSubDirs.forEach(subDir => {
            fs.mkdirSync(path.join(rootBlogDir, subDir), { recursive: true });
        });
        
        // 闁兼儳鍢茶ぐ鍥箥閳ь剟寮垫径濠傝Е閻庡箍鍨诲ù澶愬礂閹跺鈧妫?
        const blogPages = config.pages.filter(page => 
            page.output.startsWith('blog/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`   Found ${blogPages.length} blog pages to generate at root level`);
        
        // 濞戞挾鍎ら惁鈩冪▔椤忓嫬瑙﹂悗骞垮灲閵嗗妫冮姀銏℃櫢闁瑰瓨鍔栭悧鎾儎椤旇偐绉块柣妤€鐗婂﹢?
        for (const page of blogPages) {
            try {
                // 闁告垵妫楅ˇ顒勫冀閸︻厽绐楃憸鐗堟礀瀹曘儳鈧箍鍨介妴澶愭閵忊剝娈堕柟?
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                
                // 閻犲鍟弳锝夊冀閸︻厽绐楃憸鐗堟礀瀹曘儳鈧箍鍨介妴澶愭閵忋垺鐣遍悹渚灠缁?
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                
                // 闁哄洤鐡ㄩ弻濂礱nonical URL濞戞挾鍎ら悧鎾儎椤旇偐绉块柣妤€鐗婂﹢?
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/blog/', '/blog/');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 閻犱礁澧介悿鍞剅eflang闁轰胶澧楀畵?
                rootPageData.base_url = 'https://screensizechecker.com';
                const blogPath = page.output.replace('blog/', '/blog/');
                rootPageData.page_path = blogPath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                rootPageData.hreflang_fr_url = `https://screensizechecker.com/fr${rootPageData.page_path}`;
                rootPageData.hreflang_pt_url = `https://screensizechecker.com/pt${rootPageData.page_path}`;
                
                // 濠㈣泛瀚幃濠勭礄閺勫繒妲?
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
                
                // 婵烇綀顕ф慨鐐电磼閹惧鈧垶宕犻弽銊︽闁?
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');
                
                // 闁哄瀚紓鎻孴ML
                let html = this.buildPage(page.template, rootPageData);
                
                // 閹煎瓨姊婚弫銈夋嚐鏉堛劍鐎紓鍫熸閻?
                html = this.translateContent(html, englishTranslations);
                
                // 濠㈣泛瀚幃濠囧礃閸涘瓨鎳?
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 濞ｅ浂鍠栭ˇ鏌ユ濞嗘劏鍋撴担鐣屻偒婵犙勫姌閻儳顕?
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 闁告劖鐟ラ崣鍡涘棘閸ワ附顐?
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
    
    // 闁汇垻鍠愰崹姘跺冀閸︻厽绐楃憸鐗堟礉椤旀洘寰勯崶顑锯偓澶愭椤喚绀勯柤鏄忛哺閺嬪啴鎮ч崼鐔告嫳閿?
    generateRootDevicePages(outputDir, config, englishTranslations) {
        console.log(' Generating root directory device pages...');
        
        // 闁告帗绋戠紓鎾诲冀閸︻厽绐楃憸鐗堟礉椤旀洘寰勯崶鈺傜獥鐟?
        const rootDevicesDir = path.join(outputDir, 'devices');
        fs.mkdirSync(rootDevicesDir, { recursive: true });
        
        // 闁兼儳鍢茶ぐ鍥箥閳ь剟寮垫径搴晭濠㈣泛娲妴澶愭?
        const devicePages = config.pages.filter(page => 
            page.output.startsWith('devices/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`   Found ${devicePages.length} device pages to generate at root level`);
        
        // 濞戞挾鍎ら惁鈩冪▔椤忓浂鍟庡璺烘喘閵嗗妫冮姀銏℃櫢闁瑰瓨鍔栭悧鎾儎椤旇偐绉块柣妤€鐗婂﹢?
        for (const page of devicePages) {
            try {
                // 闁告垵妫楅ˇ顒勫冀閸︻厽绐楃憸鐗堟礉椤旀洘寰勯崶顑锯偓澶愭閵忊剝娈堕柟?
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                
                // 閻犲鍟弳锝夊冀閸︻厽绐楃憸鐗堟礉椤旀洘寰勯崶顑锯偓澶愭閵忋垺鐣遍悹渚灠缁?
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(1, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                rootPageData.device_links_base = '';
                
                // 闁哄洤鐡ㄩ弻濂礱nonical URL濞戞挾鍎ら悧鎾儎椤旇偐绉块柣妤€鐗婂﹢?
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/devices/', '/devices/').replace('.html', '');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 閻犱礁澧介悿鍞剅eflang闁轰胶澧楀畵?
                rootPageData.base_url = 'https://screensizechecker.com';
                const devicePath = page.output.replace('devices/', '/devices/');
                rootPageData.page_path = devicePath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                rootPageData.hreflang_fr_url = `https://screensizechecker.com/fr${rootPageData.page_path}`;
                rootPageData.hreflang_pt_url = `https://screensizechecker.com/pt${rootPageData.page_path}`;
                
                // 濠㈣泛瀚幃濠勭礄閺勫繒妲?
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

                // 閻犱礁澧介悿鍞巊:image闁告粌顔坓:locale
                rootPageData.og_image = 'https://screensizechecker.com/images/og-default.png';
                rootPageData.og_locale = 'en_US';

                // 婵烇綀顕ф慨鐐电磼閹惧鈧垶宕犻弽銊︽闁?
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');

                // 婵烇綀顕ф慨鐐碘偓浣冨閸╁懘鎮╅懜纰樺亾娴ｅ湱鍨奸悹?
                const pagePath = page.output || '';
                rootPageData.is_home = pagePath === 'index.html' || pagePath === '';
                rootPageData.is_blog = false;
                const isToolPage = pagePath.includes('calculator') || pagePath.includes('compare') || pagePath.includes('tester') || pagePath.includes('resolution');
                const isDevicePage = pagePath.includes('iphone') || pagePath.includes('android') || pagePath.includes('ipad');
                rootPageData.is_tools = isToolPage;
                rootPageData.is_devices = isDevicePage;
                
                // 濞戞挾鍎ら悧瀹犵疀閸愩劋绱ｉ柛蹇曞厴閵嗗妫冮姀鈩冩殘闁稿浚妾禔Q缂備焦鎸婚悗顖炲礌閺嶃劍娈堕柟璇″櫙缁辨繈骞撻幇顒€纾砈ERP閻庨潧鐬肩划銊╁几濠婂嫭绨氬ù?
                rootPageData.faq_structured_data = this.generateFAQStructuredDataForPage(page.name, 'en');
                
                // 闁哄瀚紓鎻孴ML
                let html = this.buildPage(page.template, rootPageData);
                
                // 閹煎瓨姊婚弫銈夋嚐鏉堛劍鐎紓鍫熸閻?
                html = this.translateContent(html, englishTranslations);
                
                // 濠㈣泛瀚幃濠囧礃閸涘瓨鎳?
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 濞ｅ浂鍠栭ˇ鏌ユ濞嗘劏鍋撴担鐣屻偒婵犙勫姌閻儳顕?
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 闁告劖鐟ラ崣鍡涘棘閸ワ附顐?
                const outputPath = path.join(outputDir, page.output);
                fs.writeFileSync(outputPath, html);
                console.log(`[OK] Generated root device page: ${page.output}`);
                
            } catch (error) {
                console.error(`[ERROR] Failed to generate root device page ${page.output}:`, error.message);
            }
        }
        
        console.log('[OK] Root directory device pages generated');
    }

    // 闁汇垻鍠愰崹姘辨嫚椤撯檧鏋呴梺顐㈩槹鐎氥劎妲愰姀鐘电┛濡炪倗鏁诲?
    generateLanguageIndex(outputDir) {
        console.log('\n Generating root English page and language selection...');
        
        // 閻庤鐭粻鐔奉啅閹绘帗鍎欓柣顫妿濞堟垹鎷犻鈾€鏋呴柨娑樼墕瑜把囧嫉婢跺骸顏伴柡鍌氭搐閹风増绋夐鐔哥€敍?
        const enabledLanguages = ['en', 'zh'];
        
        // 1. 閻㈢喐鍨氶弽鍦窗瑜版洝瀚抽弬鍥﹀瘜妞ら潧鍞寸€圭櫢绱欐稉宥呭晙闁插秴鐣鹃崥鎴礆
        console.log(' Generating root directory English homepage...');
        
        // 闁兼儳鍢茶ぐ鍥嚐鏉堛劍鐎紓鍫熸閻?
        const englishTranslations = this.translations.get('en') || {};
        
        // 闂佹澘绉堕悿鍡涘冀閸︻厽绐楃憸鐗堟礋閵嗗妫冮姀鈩冩闁硅鍣槐婵嬪春鏉炴壆鑹緋ages-config.json濞戞搩鍘惧▓鎱絥dex濡炪倗鏁诲浼存煀瀹ュ洨鏋?
        const config = JSON.parse(fs.readFileSync('build/pages-config.json', 'utf8'));
        const indexPageConfig = config.pages.find(page => page.name === 'index');
        
        if (!indexPageConfig) {
            throw new Error('Index page configuration not found in pages-config.json');
        }
        
        // 闁告垵妫楅ˇ顒勫冀閸︻厽绐楃憸鐗堟礋閵嗗妫冮姀鈩冩闁?
        const rootPageData = {
            lang: 'en',
            lang_prefix: '',
            lang_code: 'EN',
            page_content: indexPageConfig.page_content,
            ...indexPageConfig.config
        };
        
        // 閻犱礁澧介悿鍡涘冀閸︻厽绐楃憸鐗堟礈婢规帞鈧姘ㄥ▓鎴犳崉椤栨氨绐為柛婊冾劘RL
        rootPageData.canonical_url = 'https://screensizechecker.com/';
        rootPageData.og_url = 'https://screensizechecker.com/';
        rootPageData.css_path = 'css';
        rootPageData.locales_path = 'locales';
        rootPageData.js_path = 'js';
        rootPageData.home_url = 'index.html';
        rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
        rootPageData.privacy_policy_url = 'privacy-policy.html';
        rootPageData.device_links_base = 'devices/';
        
        // 閻犱礁澧介悿鍡涘冀閸︻厽绐楃憸鐗堟礋閵嗗妫冮姀銏＄暠hreflang闁轰胶澧楀畵?
        rootPageData.base_url = 'https://screensizechecker.com';
        rootPageData.page_path = '/';
        rootPageData.hreflang_root_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_en_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_zh_url = 'https://screensizechecker.com/zh/';
        rootPageData.hreflang_de_url = 'https://screensizechecker.com/de/';
        rootPageData.hreflang_es_url = 'https://screensizechecker.com/es/';
        rootPageData.hreflang_fr_url = 'https://screensizechecker.com/fr/';
        rootPageData.hreflang_pt_url = 'https://screensizechecker.com/pt/';
        
        // 濞寸姴娴烽悙鏇犳嫚閹寸偞鐎ù鐘虫构閼垫垿鎳㈠畡鏉跨悼濡炪倗鏁诲浼存偋閻熸壆鏆伴柣銊ュ閻愭洜鎷犻幋婵冨亾?
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
        
        // 缁绢収鍠曠换姝礽tle闁告瑦锕㈤崳鐑樼▕閻旀椿娼堕悹浣稿⒔閻?
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
        
        // 閻犱礁澧介悿鍞巊:image闁告粌顔坓:locale
        rootPageData.og_image = 'https://screensizechecker.com/images/og-default.png';
        rootPageData.og_locale = 'en_US';

        // 婵烇綀顕ф慨鐐电磼閹惧鈧垶宕犻弽銊︽闁?
        rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');

        // 婵烇綀顕ф慨鐐碘偓浣冨閸╁懘鎮╅懜纰樺亾娴ｅ湱鍨奸悹?
        rootPageData.is_home = true;
        rootPageData.is_blog = false;
        rootPageData.is_tools = false;
        rootPageData.is_devices = false;
        
        // 濞戞挾鍎ら悧瀹犵疀閸愩劋绱ｉ柛蹇曞厴閵嗗妫冮姀鈩冩殘闁稿浚妾禔Q缂備焦鎸婚悗顖炲礌閺嶃劍娈堕柟璇″櫙缁辨繈骞撻幇顒€纾砈ERP閻庨潧鐬肩划銊╁几濠婂嫭绨氬ù?
        rootPageData.faq_structured_data = this.generateFAQStructuredDataForPage(indexPageConfig.name, 'en');
        
        // 闁哄瀚紓鎾诲冀閸︻厽绐楃憸鐗堟TML濡炪倗鏁诲?
        let rootHtml = this.buildPage(indexPageConfig.template, rootPageData);
        
        // 閹煎瓨姊婚弫銈夋嚐鏉堛劍鐎紓鍫熸閻?
        rootHtml = this.translateContent(rootHtml, englishTranslations);
        
        // 濠㈣泛瀚幃濠囧礃閸涘瓨鎳犻柨娑樼墛閻楁挳鎯勯鑲╃Э濡炪倗鏁诲鐗堟媴鐠恒劍鏆忛柣妤勵潐閻ｂ晠鎯冮崟顖樷偓澶愭椤㈢枍閿?
        rootHtml = this.internalLinksProcessor.processPageLinks(rootHtml, 'index-root', 'en');
        
        // 闁哄洤鐡ㄩ弻濂孴ML lang閻忕偟鍋為埀?
        rootHtml = rootHtml.replace('<html lang="en">', '<html lang="en">');
        
        // 濞ｅ浂鍠栭ˇ鏌ユ濞嗘劏鍋撴担鐣屻偒婵犙勫姌閻儳顕ラ崟鍓佺闁哄秴婀卞ú鎷屻亹閺囨氨鐟濋梻鍥ｅ亾閻熸洑绶氶·鍌涘緞閺嶎偅鐣遍悹渚灠缁剁偤宕滃鍥╃；閿?
        rootHtml = this.fixStaticResourcePaths(rootHtml, 'index.html');
        
        // 闁告劖鐟ラ崣鍡涘冀閸︻厽绐楃憸鐗堟Ъndex.html
        fs.writeFileSync(path.join(outputDir, 'index.html'), rootHtml);
        console.log('[OK] Root English homepage created (no redirect)');
        
        // 1.5. 閻犲搫鐤囩换鍐冀閸︻厽绐楃憸鐗堟礀瀹曘儳鈧箍鍨归崬瀵糕偓鐟版贡閺佹捇骞嬮幇鍓佺闁告鑹鹃褰掓煣閻愵剙澶嶉悘蹇撴鐎垫岸宕?/en/blog/
        console.log(' Skipping root directory blog content generation - blog links will point to /en/blog/');
        
        // 1.6. 闁汇垻鍠愰崹姘跺冀閸︻厽绐楃憸鐗堟礉椤旀洘寰勯崶顑锯偓澶愭椤喚绀勯柤鏄忛哺閺嬪啴鎮ч崼鐔告嫳閿?
        this.generateRootDevicePages(outputDir, config, englishTranslations);
        
        // 2. 闁汇垻鍠愰崹姘辨嫚椤撯檧鏋呴梺顐㈩槹鐎氥劍銇勯悽鍛婃〃闁?select-language.html
        // 閻犲浂鍙€閳诲牓鏌婂鍥╂瀭
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
        
        // 闁汇垻鍠愰崹姘辨嫚椤撯檧鏋呴柛妤嬬磿婢ф湌TML
        const languageCards = languageConfigs.map(lang => {
            const isEnabled = enabledLanguages.includes(lang.code);
            
            if (isEnabled) {
                const href = lang.code === 'en' ? './' : `${lang.code}/`;
                return `        <a href="${href}" class="language-card">
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
            content: "閸楀啿鐨㈤幒銊ュ毉";
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
    <h1>棣冨 Screen Size Checker</h1>
    <p class="subtitle">Choose your language / 闂侇偄顦扮€氥劑骞冮妸褎鐣遍悹鍥跺弨閳?/p>
    
    <div class="language-grid">
${languageCards}
    </div>
    
    <p class="note">棣冩寱 闁稿繑婀圭划顒傛嫚椤撯檧鏋呴柣妤€鐗婂﹢鏉款潰閿濆懏韬紓鍫熸閻ρ勭▔椤撱劎绀夐柡渚囧墲椤曨剟寮甸悢椋庣閿涙瓬r>Other language versions are being translated, stay tuned!</p>
    
    <script>
        // 闁煎浜滄慨鈺冩嫚椤撯檧鏋呮俊顐熷亾婵炴潙顑呴幏浼存煂瀹ュ懐鏆伴柛姘煀缁辨瑦绂掗崨瀛橆€欑€瑰憡褰冮幆搴ㄦ偨閵娧勭暠閻犲浂鍙€閳诲牞绱?
        function detectAndRedirect() {
            const userLang = navigator.language || navigator.userLanguage;
            const langCode = userLang.split('-')[0];
            const availableLangs = ${JSON.stringify(enabledLanguages)}; // 濞寸姴鎳庨崙锟犲触椤栨粍鏆忛柣銊ュ椤曘垻鎳涢埀?
            
            if (availableLangs.includes(langCode)) {
                const targetUrl = langCode + '/index.html';
                console.log('Auto-redirecting to:', targetUrl);
                // window.location.href = targetUrl; // 閸欐牗绉峰▔銊╁櫞娴犮儱鎯庨悽銊ㄥ殰閸斻劑鍣哥€规艾鎮?
            } else {
                // 濠碘€冲€归悘澶愭偨閵婏箑鐓曢悹鍥跺弨閳诲牊绋夊鍛含闁告瑯鍨抽弫銈夊礆濡ゅ嫨鈧啯绋夐銊х濮掓稒顭堥鑽ゆ崉鐎圭姵绁柛鎺撳鐎氭娊寮?
                console.log('Language not available, defaulting to English');
                // window.location.href = 'en/index.html'; // 閸欐牗绉峰▔銊╁櫞娴犮儱鎯庨悽銊ㄥ殰閸斻劑鍣哥€规艾鎮?
            }
        }
        
        // detectAndRedirect(); // 闁告瑦鐗楃粔宄扳枖閵娾晛娅炲ù鐘劚閹酣鎮介妸銊ユ闁告柣鍔忛銏㈡嚊閳ь剙螞閳ь剙霉?
    </script>
</body>
</html>`;

        const normalizedLanguageSelectionHtml = this.normalizeInternalAnchorHrefs(languageSelectionHtml);
        
        fs.writeFileSync(path.join(outputDir, 'select-language.html'), normalizedLanguageSelectionHtml);
        console.log('[OK] Language selection page created at select-language.html');
    }

    // 闁汇垻鍠愰崹姘緞濮樻剚鍤旈悷灏佸亾缂傚啯鍨归悵顖炲捶閺夋寧绂堥柨娑樼墕瑜把囧礌閸涱厽鍎撻柛姘煎灣閺併倝鎯冮崟顕呭殧閻熷皝鍋撻敍?
    generateMultiLanguageSitemap(outputDir) {
        console.log('\n[OK] Generating multilingual sitemap (enabled languages only)...');
        
        const currentDate = new Date().toISOString().split('T')[0];
        const baseUrl = 'https://screensizechecker.com';
        const enabledLanguages = ['en', 'zh', 'de', 'es', 'pt', 'fr']; // 闁告瑯浜滅€垫﹢宕ラ銏″剻闁活潿鍔庡▓鎴犳嫚椤撯檧鏋?
        
        // 閻庤鐭粻鐔搞亜閻㈠憡妗ㄧ紓浣规尰閻庮垶鏁嶉崼鐔革骏.html闁告艾娴风槐鎴︽晬鐏炶棄鐖遍梺鏉胯埗loudflare Pages闁汇劌鍨奟L闁哄秶鍘х槐鈽呯窗
        const pages = [
            { path: '', priority: '1.0', changefreq: 'weekly' },
            { path: '/devices/iphone-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/ipad-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/android-viewport-sizes', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/compare', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/standard-resolutions', priority: '0.9', changefreq: 'monthly' },
            { path: '/devices/responsive-tester', priority: '0.9', changefreq: 'monthly' },
            { path: '/resolution-test', priority: '0.8', changefreq: 'monthly' },
            { path: '/devices/ppi-calculator', priority: '0.8', changefreq: 'monthly' },
            { path: '/devices/aspect-ratio-calculator', priority: '0.8', changefreq: 'monthly' },
            { path: '/devices/projection-calculator', priority: '0.8', changefreq: 'monthly' },
            { path: '/devices/lcd-screen-tester', priority: '0.8', changefreq: 'monthly' }
        ];
        
        // 閻庤鐭粻鐔煎础濮橆剦鍚傚銈囨暬濞兼壆绱掗幘瀵糕偓?
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
            { path: '/blog/screen-dimensions-cheat-sheet', priority: '0.8', changefreq: 'monthly' }
        ];
        
        // 濞戞搩鍘介弸鍐偋鐟欏嫭绠掗柣銊ュ閻栵絿绮垫ィ鍐︹偓澶愭?
        const zhBlogPages = [];
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        
        // 婵烇綀顕ф慨鐐哄冀绾懐鐔呯€垫澘瀚哥槐娆撴嚐鏉堛劍鐎柣妤€鐗婂﹢浼存儍閸曨亜鐦滈悷鏇氱閸欏棝宕ｉ敐蹇曠
        sitemapContent += `
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>`;
        
        // 婵烇綀顕ф慨鐐哄冀閸︻厽绐楃憸鐗堟礈濞堟垹鎷嬮幆褜妲靛銈囨暬濞间即鏁嶉崼锝咁伆闁哄倸娲ｇ€靛瞼鎲版担鍝勵暭闁哄牜鍓ㄧ槐?
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

        // 婵烇綀顕ф慨鐐哄冀閸︻厽绐楃憸鐗堟礈濞堟垿宕″顒夊悅濡炪倗鏁诲浼存晬閸絽顏伴柡鍌氭矗鐎靛瞼鎲版担鍝勵暭闁哄牜鍓ㄧ槐?
        blogPages.forEach(page => {
            sitemapContent += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
        });
        
        // 婵烇綀顕ф慨鐐哄冀閸︻厽绐楃憸鐗堟礈濞堟厰ub濡炪倗鏁诲浼存晬閸絽顏伴柡鍌氭矗鐎靛瞼鎲版担鍝勵暭闁哄牜鍓ㄧ槐?
        // 濞寸姴绐媋ges-config.json閻犲洩顕цぐ鍢搖b濡炪倗鏁诲?
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
        
        // 婵烇綀顕ф慨鐐垫嫚椤撯檧鏋呴梺顐㈩槹鐎氥劍銇勯悽鍛婃〃
        sitemapContent += `
    <url>
        <loc>${baseUrl}/select-language</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        
        // 闁告瑯浜欑拹鐔兼閻愯泛顏伴柡鍌氭川濞堟垿宕ラ婊勬殢閻犲浂鍙€閳诲牓鎮介悢绋跨亣URL闁挎稑鐗愮€氭娊寮崶褍鍤掗柛锔哄妽閻楁挳鎯勯鑲╃Э閿?
        enabledLanguages.forEach(lang => {
            // 閻犲搫鐤囩换鍐嚐鏉堛劍鐎柨娑樿嫰濞叉粍绋夋ウ鍨伆闁哄倸娲ㄦ晶妤呭嫉椤掆偓閸戯紕绱掕箛鎾磋含闁哄秴婀卞ú鎷屻亹?
            if (lang === 'en') {
                return;
            }
            
            // 婵烇綀顕ф慨鐐哄春閾忚鏀ㄥ銈囨暬濞?
            pages.forEach(page => {
                if (page.path === '') {
                    // 閻犲浂鍙€閳诲牊锛冮弽顓溾偓?
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                } else {
                    // 闁稿繑婀圭划顒併亜閻㈠憡妗?
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                }
            });
            
            // 婵烇綀顕ф慨鐐哄础濮橆剦鍚傚銈囨暬濞?
            blogPages.forEach(page => {
                sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
            });
            
            // 婵烇綀顕ф慨婵皍b濡炪倗鏁诲?
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
            
            // 濞戞捁妗ㄩ懙鎴﹀棘閸ャ劌娼戦柛鏃傚Х婢规帡寮垫径灞剧暠闁哄秴娲ㄩ閿嬨亜閻㈠憡妗?
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
        
        // 婵烇綀顕ф慨鐐烘⒕閹邦噮娼岄柡鈧捄銊ф憸濡炪倗鏁诲?
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
        
        // 閻犱緤绱曢悾濠氬箑缁┌L闁轰椒鍗抽崳鐚寸窗
        // 1濞戞搩浜濋悧鎾儎椤旇偐绉?+ 闁哄秴婀卞ú鎷屻亹閺囩姵鐣遍悹浣瑰劤椤︻剚銇勯悽鍛婃〃 + 闁哄秴婀卞ú鎷屻亹閺囩姵鐣遍柛妤佽壘椤撹銇勯悽鍛婃〃 + Hub濡炪倗鏁诲?+ 1濞戞搩浜ｉ銏㈡嚊閳ь剟鏌呮径瀣仴濡炪倗鏁诲?+ 1濞戞搩浜▓锝囩矓娴ｈ鏉虹紒娑欑墵閵嗗妫?
        // + 閻犲浂鍙€閳诲牓鎮ч崼鐔告嫳濡炪倗鏁诲?+ 濞戞搩鍘介弸鍐偋鐟欏嫭绠掑銈囨暬濞?
        const hubPagesCount = pagesConfig.pages.filter(p => p.template === 'hub-page').length;
        const rootUrls = 1 + (pages.length - 1) + blogPages.length + hubPagesEn.length; // 闁哄秴婀卞ú鎷屻亹閺囩姵绁查柛蹇曠埀RL
        const languageUrls = enabledLanguages.length * (pages.length + blogPages.length); // 閻犲浂鍙€閳诲牓鎮ч崼鐔告嫳URL
        const hubUrls = hubPagesCount; // Hub濡炪倗鏁诲浼存晬閸喎顣查柡鍫濐槼椤曘垻鎳涢埀顒婄窗
        const otherUrls = 2; // 閻犲浂鍙€閳诲牓鏌呮径瀣仴濡炪倗鏁诲?+ 闂傚懏鍔楅～鍡涘绩鐠恒劎鎽滃銈囨暬濞?
        const totalUrls = rootUrls + languageUrls + hubUrls + zhBlogPages.length + otherUrls;
        
        console.log('[OK] Multilingual sitemap generated with optimized structure');
        console.log(`    Total URLs: ${totalUrls}`);
        console.log(`    Root domain URLs: ${rootUrls} (priority 1.0-0.9)`);
        console.log(`    Language versions: ${languageUrls} (adjusted priorities)`);
        console.log(`    Gaming Hub pages: ${hubUrls} (4 languages)`);
        console.log(`    Chinese-specific: ${zhBlogPages.length}`);
        console.log(`    Other pages: ${otherUrls}`);
    }
    
    // 闁汇垻鍠愰崹姘跺几閸曨偆绱﹂柟韬插劚閹?
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
        
        // 闁衡偓閸洘鑲犳慨锝呯箳椤帞鎷犻鈾€鏋呴柣銊ュ閵嗗妫冮～顓濈箚闁?
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
    
    // 闂侇偅甯掔紞濠囨嚔瀹勬澘绲块柣鈺婂枛缂嶅秵绋夌€ｎ偄顣查柡鍫濐槹閺嬪啯绂?
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
    
    // 闁汇垻鍠愰崹姘濡搫顕ч柣銊ュ灣redirects闁哄倸娲ｅ▎?
    generateRedirectsFile(outputDir) {
        console.log('\n Generating optimized _redirects file...');
        
        const redirectsContent = `# Cloudflare Pages 闂佹彃绉撮悾楣冨触閹达箑甯崇紓鍐惧枟閺嬪啯绂?
# URL 缂備焦鎸婚悗顖涙交娴ｇ洅鈺呮晬濮樺啿顏伴柡鍌氭搐閸炲鈧綊鈧稓鐭?/en/* 閺夆晙鑳朵簺闁告帞澧楅悧瀵告崉椤栨氨绐?/*

# ===== 闂佹彃绉烽々锕傛晬濮橆厽锛嬮柤鏄忛哺閺嬪啰鎹勯姘辩獮 闁?闁哄倻澧楅悧瀵告崉椤栨氨绐?=====
# 閺夆晜鐟ょ花铏规喆閸曨偄鐏熺痪顓у枙缁绘岸寮濞?/en/* URL 婵繐绲块垾姗€鏌屽鍛毎闁告碍鍨甸崺宀勫棘閹殿喗鐣遍柡宥囶攰閻儳顕?

# 闁兼槒椴搁弸鍐╃▔婵犳哎鈧鏌屽鍛毎闁?
/en/                  /                   301
/en/index.html        /                   301

# 闁兼槒椴搁弸鍐础濮橆剦鍚傞梺鎻掔Т閻ｉ箖宕ラ幋顖滅闁哄唲鍡欑唴鐎?闁?闁哄倹濯介惌鎯ь嚗閸曞墎绀?
/en/blog              /blog               301
/en/blog/             /blog/              301
/en/blog/*            /blog/:splat        301

# 闁兼槒椴搁弸鍐媼閹屾У濡炪倗鏁诲浼存煂瀹ュ懐鏆伴柛姘煀缁辨瑩寮閻儳顕?闁?闁哄倹濯介惌鎯ь嚗閸曞墎绀?
/en/devices/*         /devices/:splat     301

# 闁兼槒椴搁弸鍐啅閵夈儱寰斿銈囨暬濞间即鏌屽鍛毎闁告碍鍩婄槐娆愪繆閸屾稓浜悗娑櫭﹢顏庣窗
/en/tools/*           /tools/:splat       301

# 闂侇偅姘ㄩ弫銈囨喆閸曨偄鐏熼柨娑欑婢у秹寮垫径濠傗挅濞达絾鐟у▓?/en/* 閻犱警鍨扮欢鐐烘煂瀹ュ懐鏆伴柛姘灥閸╁矂寮界涵鍛唴鐎?
/en/*                 /:splat             301

# ===== .html 闁告艾娴风槐鎴︽煂瀹ュ懐鏆伴柛姘煀缁辨瑩寮界涵鍛唴鐎垫澘瀚€氭娊寮崶鈺侇暭闁哄牜鍓ㄧ槐?====
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
/resolution-test.html                     /resolution-test                    301

# ===== .html 闁告艾娴风槐鎴︽煂瀹ュ懐鏆伴柛姘煀缁辨瑦绋夐鐔哥€柣妤€鐗婂﹢甯窗====
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

# ===== .html 闁告艾娴风槐鎴︽煂瀹ュ懐鏆伴柛姘煀缁辨瑥顕ラ悿顖ｅ殧闁绘鐗婂﹢甯窗====
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

# ===== .html 闁告艾娴风槐鎴︽煂瀹ュ懐鏆伴柛姘煀缁辨瑧鎲茬捄銊ョ枂闁绘鐟ㄩ銏ゆ偋閸喐鎷遍敍?===
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

# ===== .html redirects for Portuguese pages =====
/pt/devices/iphone-viewport-sizes.html    /pt/devices/iphone-viewport-sizes   301
/pt/devices/ipad-viewport-sizes.html      /pt/devices/ipad-viewport-sizes     301
/pt/devices/android-viewport-sizes.html   /pt/devices/android-viewport-sizes  301
/pt/devices/compare.html                  /pt/devices/compare                 301
/pt/devices/standard-resolutions.html     /pt/devices/standard-resolutions    301
/pt/devices/responsive-tester.html        /pt/devices/responsive-tester       301
/pt/devices/ppi-calculator.html           /pt/devices/ppi-calculator          301
/pt/devices/aspect-ratio-calculator.html  /pt/devices/aspect-ratio-calculator 301
/pt/devices/projection-calculator.html    /pt/devices/projection-calculator   301
/pt/devices/lcd-screen-tester.html        /pt/devices/lcd-screen-tester       301

# ===== Blog redirects for Portuguese (Temporary, fallback to English) =====
/pt/blog/*                                /blog/:splat                        302

# ===== 闁告鑹鹃?.html 闁告艾娴风槐鎴︽煂瀹ュ懐鏆伴柛?=====
/blog/index.html                          /blog                               301
/zh/blog/index.html                       /zh/blog                            301
/de/blog/index.html                       /de/blog                            301
/es/blog/index.html                       /es/blog                            301
/blog/*.html                              /blog/:splat                        301
/zh/blog/*.html                           /zh/blog/:splat                     301
/de/blog/*.html                           /de/blog/:splat                     301
/es/blog/*.html                           /es/blog/:splat                     301

# ===== 閻犲浂鍙€閳诲牓鎮ч崼鐔告嫳 index.html 闂佹彃绉撮悾楣冨触?=====
/zh/index.html                            /zh/                                301
/de/index.html                            /de/                                301
/es/index.html                            /es/                                301
/pt/index.html                            /pt/                                301

# ===== 闁稿繑婀圭划顒併亜閻㈠憡妗ㄩ梺鎻掔Т閻ｉ箖宕?=====
/privacy-policy.html                      /privacy-policy                     301
/terms-of-service.html                    /terms-of-service                  301


# ===== 濞撴碍瀵у畵搴ｆ媼閸ф锛栭梺鎻掔Т閻ｉ箖宕?=====
/devices/                                 /devices/iphone-viewport-sizes      301
/devices                                  /devices/iphone-viewport-sizes      301`;

        fs.writeFileSync(path.join(outputDir, '_redirects'), redirectsContent);
        console.log('[OK] Generated simplified _redirects file');
    }
    
    // 闁汇垻鍠愰崹姘濡搫顕ч柣銊ュobots.txt闁哄倸娲ｅ▎?
    // 闁告劕鎳庨鎰▔閳ь剟鎳涚€涙ǚ鍋撹椤ュ懘寮婚妷顖滅獥缁绢収鍠曠换姘舵嚐鏉堛劍鐎柣妤€鐗婂﹢浼存晬閸喓澹岄柣鈺婂枛缂嶅秹鏁嶆径濠冨濞戞搩鍘介弸鍐偋閸喐鎷遍敍姝緃/闁挎稑顦伴婊呮兜椤旂偓鏅搁柟?
    validateContentConsistency(outputDir) {
        console.log('\n Validating content consistency between English (root) and Chinese (/zh/) versions...');
        
        const inconsistencies = [];
        const rootDir = outputDir; // 闁兼槒椴搁弸鍐偋閸喐鎷遍柛锔哄妽閻楁挳鎯勯鑲╃Э
        const zhDir = path.join(outputDir, 'zh'); // 濞戞搩鍘介弸鍐偋閸喐鎷遍柛?/zh/ 闁烩晩鍠栫紞?
        
        // 闂傚洠鍋撻悷鏇氱劍椤ュ懘寮婚妷褎鐣卞銈囨暬濞间即宕氬Δ鍕┾偓?
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
            const rootPagePath = path.join(rootDir, pagePath); // 闁兼槒椴搁弸鍐偋閸喐鎷?
            const zhPagePath = path.join(zhDir, pagePath); // 濞戞搩鍘介弸鍐偋閸喐鎷?
            
            // 婵☆偀鍋撻柡灞诲劜閺嬪啯绂掗懜鍨﹂柛姘剧畱閻°劑宕?
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
                // 閻犲洩顕цぐ鍥棘閸ワ附顐介柛鎰噹椤?
                const rootContent = fs.readFileSync(rootPagePath, 'utf8');
                const zhContent = fs.readFileSync(zhPagePath, 'utf8');
                
                checkedPages++;
                
                // 婵☆偀鍋撻柡灞诲劚閸櫻囨煥閻㈠┄O闁稿繐鍟扮粈宀勬儍閸曨亞顏遍柤宄扮摠閳?
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
                        
                        // 闁兼槒椴搁弸鍐椽鐏炶壈鍘柡鍌氭川婢ф寮甸鍌涚暠闁告劕鎳庨鎰償閺冨浂鍤夐柡鍕靛灣閻愭洜鎷犻幋婵嗗綘缂侇垯绱槐婵囩▔瀹ュ懐瀹夐悹鍥ュ劤濞村宕?
                        // 閺夆晜鐟╅崳鐑藉矗椤忓拋姊鹃柡灞诲劙鐞氶亶鎳撻崨鏉戝幋閻庢稒锚濠€顏堝础閸愭彃璁查柨娑樺缁楀袙閺冨洨绐涢柛鎰噹椤?
                        // 濠碘€冲€归悘澶愭閳ь剛鎲版笟濠勭闁告瑯鍨禍鎺楀捶閵娿劎绠归梺鎻掓湰閸у﹪宕濋悩铏函濠㈣泛绉靛鍛存儍閸曨厾鍊抽悹鍥ㄥ灴閻涙瑧鎷犳笟鈧埀顒佹缁?
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
                
                // 婵☆偀鍋撻柡宀婃珦anonical URL闁汇劌瀚婊呮兜椤旇В鍋?
                const rootCanonical = rootContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                const zhCanonical = zhContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                
                if (rootCanonical && zhCanonical) {
                    const rootCanonicalUrl = rootCanonical[1];
                    const zhCanonicalUrl = zhCanonical[1];
                    
                    // 濡ょ姴鐭侀惁濉゛nonical URL闁汇劌瀚婊呮兜椤旇В鍋?
                    // 闁兼槒椴搁弸鍐偋閸喐鎷遍柨娑樼墛閻楁挳鎯勯鑲╃Э闁挎稑顦粭澶嬫償閺冨浂鍤夐柛鏍ф噹閹?/en/
                    if (rootCanonicalUrl.includes('/en/')) {
                        inconsistencies.push({
                            page: pagePath,
                            issue: `English version has incorrect canonical URL (contains /en/): ${rootCanonicalUrl}`,
                            severity: 'error'
                        });
                        pageConsistent = false;
                    }
                    
                    // 濞戞搩鍘介弸鍐偋閸喐鎷遍幖瀛樻椤曟岸宕犻崨顓熷創 /zh/
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
        
        // 闁汇垻鍠愰崹姘殽瀹€鍐闁硅翰鍎遍幉?
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
        
        // 濞ｅ洦绻傞悺銊︻殽瀹€鍐闁硅翰鍎遍幉?
        fs.writeFileSync(
            path.join(outputDir, 'content-consistency-report.json'),
            JSON.stringify(validationReport, null, 2)
        );
        
        // 閺夊牊鎸搁崵顓犵磼閹惧浜?
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

# Disallow temp and debug files
Disallow: /performance-test-production.html
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

// 濠碘€冲€归悘澶愭儎鐎涙ê澶嶉弶鈺傚姌椤㈡垵顫㈤妶鍫濆闁哄牜鍓ㄧ槐婵嬪箥瑜戦、鎴炲緞濮樻剚鍤旈悷灏佸亾闁哄瀚紓?
if (require.main === module) {
    (async () => {
        const builder = new MultiLangBuilder();
        
        console.log(' Starting integrated build process...');
        
        // Step 0: 閺夆晜鍔橀、鎴犵礄閺勫繒妲Δ鐘茬焷閻?
        console.log('\n Step 0: Validating translations...');
        const validationResult = await builder.runTranslationValidation();
        
        if (!validationResult.success) {
            console.error('[ERROR] Build failed due to translation validation errors');
            process.exit(1);
        }
        
        // 濡絾鐗曢崢娑欐交閹邦垼鏀介柛妤佽壘椤撳綊寮搁崟顐ょ处闁?
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
            
            // 闂佹彃绉甸弻濠囧礉閻樼儤绁扮紓浣稿濞嗐垽鏁嶇仦钘夌樁闁瑰鍓氶弻濠囨偨閻旂鐏囬柣銊ュ瀹曘儳鈧箍鍨荤划宥嗙?
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
