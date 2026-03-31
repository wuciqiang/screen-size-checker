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
        this.enabledLanguages = ['en', 'zh', 'de', 'es', 'pt']; // 闂佽崵鍠愮划搴㈡櫠濡ゅ懎绠伴柛娑橈攻濞呯娀鏌ｅΟ娆惧殭閻熸瑱闄勯妵鍕冀閵娧呯厑闂佸搫妫楃换姗€寮婚敐澶娢╅柕澶堝労娴煎倸顪冮妶鍡樼８闁搞劌顭烽獮濠傗槈閵忕姷鍔﹀銈嗗笒鐎氼參寮查浣瑰弿婵☆垰鎼弳杈ㄣ亜韫囧骸宓嗛柡宀嬬節瀹曟帒顫濋鐐蹭憾闂備線鈧偛鑻崢鍛婁繆閻愭潙娴柟铏懇楠炲鏁冮埀顒€螞濮椻偓閺屾盯濡烽敐鍛闂佺顑嗛幐濠氬箯閸涙潙浼犻柕澶涘瘜濡嫰姊洪懡銈呅㈡繛鏉戝€垮畷銏ｃ亹閹烘垹鍔﹀銈嗗灦鐎笛呯矈娴煎瓨鐓忛柛顐ｇ箖閸嬨儵鏌熼鐐毈妞ゃ垺锕㈤幃鈺侇啅椤旀垝姘﹂梻?
        this.translations = new Map();
        this.internalLinksProcessor = new InternalLinksProcessor();
        
        // 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€鈪甸悗瑙勬磸閸庨亶顢樻總绋跨倞闁糕剝鐟ユ禒杈┾偓娈垮枙閸楁娊骞冮埡鍛殤妞ゆ帊绶￠崯?
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
        
        // 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€顤€缂備礁鍊圭敮锟犲极閹版澘鐐婇柍杞拌兌娴狀垰鈹戦悩顔肩仼闁绘牓鍨藉畷姗€濡搁敂绛嬩户闂傚倷绀侀幖顐も偓姘煎枟閹便劑骞橀钘夊壄闂佺粯顭囩划顖炲疾椤掑嫭鐓曟い鎰Т閻忣亪鏌￠崱妤冪闂囧绻濇繝鍌氭殲濠殿喖婀滈梻鍌欑閹碱偆鈧凹鍓氶弲鑸电鐎ｎ€附鎱ㄥΟ鍝勨挃缂?
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
    
    // 闂傚倷绀侀崥瀣磿閹惰棄搴婇柤鑹扮堪娴滃綊鏌涢妷鎴濇噺濞堝ジ鏌ｈ箛鏇炰户闁烩剝鏌ㄩ埢鎾村鐎涙鍘介梺闈涱焾閸庨亶顢旈锔界厽闁归偊鍘界粈鍫ユ煙妞嬪骸鈻堟鐐差儏閳规垿宕橀妸銈咁棜缂備胶铏庨崣鍐夐幘鍓佺焼濠㈣埖鍔栭悡娑㈡煃瑜滈崜鐔笺€佸☉妯锋婵☆垰鍚嬪暩婵?"ppiCalculator.pageTitle" 闂備礁鎼ˇ顐﹀疾濠婂牊鍋￠柨鏇炲€归崑瀣⒑椤掆偓缁夌敻宕曞澶嬬厱闁哄洢鍔岄悘锟犳煛?
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

    // 缂傚倸鍊搁崐鐑芥嚄閸洖绐楃€广儱娲ㄩ崡姘舵煙缂併垹鏋熼柛搴＄Ч閺屾盯寮撮妸銉ょ盎闁荤喐鐟辩粻鎾诲箖濡ゅ啯瀚氶柍鈺佸暞濮ｅ冻L闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鎸庣【缂佲偓閸曨垱鐓犻柟顓熷笒閸旀粍绻?- 婵犵數鍋為崹鍫曞箰閹绢喖纾婚柟鍓х帛閻撴洟鏌￠崘銊﹀闁绘繍浜濇穱濠偽旈埀顒勬偋閹捐钃熼柛娑欐綑娴肩娀鏌曟径娑橆洭闁哄棛濞€閺岋綁鎮㈤崫銉﹀殏缂備浇寮撶划娆忕暦娴兼潙宸濋柡澶嬪灦椤ユ繈鏌ｉ悢鍝ユ噧閻庢氨鍏樺?
    generateBlogUrl(depth, lang, isRootPage = false) {
        console.log(` Generating blog URL: depth=${depth}, lang=${lang}, isRootPage=${isRootPage}`);

        // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋熼柡鍜佸墴閺屾盯顢曢悩鎻掑Б闁汇埄鍨遍惄顖炲箖鐟欏嫭濯撮梻鍫熺▓閸嬫挸鈽夐姀鈺傛櫔闂侀潧绻堥崹娲吹婵犲洦鐓冪憸婊堝礈閻旂厧鏋佺€广儱妫楃欢鐐测攽閻樻彃鏆㈤柛姘煎亰濮婃椽宕崟顓夈倖銇勯姀鐙呰含闁诡垰鐭傞獮鍡氼檨闁搞倖顨婇弻娑㈠即閻愬樊鏆㈢紓浣插亾濠㈣埖鍔栭悡鏇㈢叓閸ャ劍鈷愰柡瀣缁辨帡顢氶崨顓烆潾闂佸綊顥撴繛鈧い銏★耿閸╋箓鍩€椤掑嫬鍑犻柛娑樼摠閻撴洟鏌ㄩ弬鎸庢儓濠殿喒鍋撴俊鐐€栧ú蹇涘垂婵犳艾绠犳繛鎴欏灩閻掑灚銇勯幒鎴濃偓鐢稿磻閹炬枼妲堟繛鍡楃箰椤骸鈹戦悙鎻掔骇濠殿垯绮欐俊?
        const isDefaultLang = lang === this.defaultLanguage;

        if (depth === 0) {
            // 闂傚倷绶氬鑽ゆ嫻閻旂厧绀夌€广儱顦伴崑瀣煙缂併垹鏋熼柛搴″閵囧嫰寮崶褌姹楃紓浣割槸濞硷繝寮婚悢琛″亾濞戞瑯鐒藉褑娅曢妵鍕即濡櫣浼勯梺纭呮珪閻╊垶宕洪埀顒併亜閹烘垵顏╅柛鎰ㄥ亾闂備線娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸?
            if (isDefaultLang) {
                return 'blog/';
            } else {
                return 'blog/';
            }
        } else {
            // 闂傚倷绶氬鑽ゆ嫻閻旂厧绀夌€光偓閸曨剙浠卞┑鐐叉閹稿宕曟惔顫簻闁哄啫娲ゆ禍鍦磼婢跺﹦浠㈤柍钘夘樀楠炴瑩宕橀妸銉ょ礋缂傚倷娴囨ご鍝ユ崲閸惊娑欑瑹閳ь剟宕洪埀顒併亜閹烘垵鈧綊宕崫鍔藉綊鏁愰崨顔兼殘缂備讲鍋撻柍褜鍓熷娲川婵犲倻顑傛繝鈷€鍕垫疁闁诡啫鍥х妞ゆ棁妫勯崜顔碱渻閵堝棙顥嗛柛瀣姉缁?
            const backToRoot = '../'.repeat(depth);
            if (isDefaultLang) {
                // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋熼柡鍜佸墯閹便劌顫滈崱妤€顫紓浣插亾闁逞屽墴濮婃椽宕ㄦ繝鍌滎儌婵犫拃鍕垫疁闁诡啫鍛亾闂堟稒鍟炵€规洖顦伴妵鍕冀閵婏妇娈ょ紓浣瑰姉閸嬨倝寮诲☉姗嗘僵妞ゆ帊绀侀弨顓犵磽娴ｈ櫣甯涢柨鏇樺灩閻?blog/
                return `${backToRoot}blog/`;
            } else {
                // 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒鎴濃偓鍦偓姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囬柡灞诲妼閳藉鈻庨幒鎴婵犵數鍋涘鍫曟偋閻樿尙鏆︽慨妯垮煐閸嬪鏌涢鐘茬仼妞ゃ儲鍨块弻锝夋偐鏉堫偒鍔呴梺鎼炲妽婢瑰棗鈻庨姀銈嗗€烽柛婵嗗琚濋梺鐟板悑閻ｎ亪宕愬Δ鍐笉濠电姵纰嶉悡鏇㈢叓閸パ屽剰闁告柣鍎查妵鍕即濡櫣浼勯梺纭呮珪閻╊垶宕洪埀顒併亜閹烘垵顏柛搴″閵囧嫰寮崶褌姹楃紓浣割槸濞硷繝寮诲☉銏犵疀妞ゆ帒鍊愰妷褏纾肩紓浣癸公閼拌法鈧?blog/
                // 婵犵數鍋犻幓顏嗗緤閽樺）娑樜旈崨顔间痪闂佸憡娲﹂崹閬嶅煕閺冨牊鐓曟繛鎴濆船婢т即鏌ｉ悢绋垮闁哄矉绲介…銊╁礋椤掑倸鍤掓繝鐢靛Л閸嬫挻銇勮箛鎾愁伌闁哥喎鎳橀弻銈囧枈閸楃偛顫梺姹囧劚閹虫﹢寮诲☉銏℃櫆闁告繂瀚～鍛渻閵堝棙纾搁柛銊ヮ煼楠炲﹤鈽夐姀鐘靛姦濡炪倖甯掗崐鐢稿磻閹炬枼妲堟繛鍡楃箰椤骸鈹戦悙鎻掔骇濠殿垯绮欐俊鐢稿箛閺夊灝宓嗗┑顔矫崯鍧楃嵁閳ь剙鈹戦悙鑼憼缂侇喖鑻灋閻庨潧鎲￠～鏇熺節闂堟侗鍎忕紒鐘劦閺屽秷顧侀柛鎾存皑缁骞掑Δ鈧敮闂侀潧顦崕鏌ユ煥椤撱垺鈷掗柛灞剧缁€宀勬煕鐎ｎ偅宕岄柟顔惧厴瀵潙顫濇鏍ㄐ滄繝鐢靛仜瀵爼鎮ч悩鑼殾婵娉涚粻顖溾偓鍏夊亾濠电姴鍊归楣冩⒑閼姐倕鏋庨柣銊︾箞瀹曟垿骞樼紒妯煎幐?
                return `${backToRoot}blog/`;
            }
        }
    }
    
    // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪礋椤撶媭妲遍梻浣告惈鐎氼剛鎹㈤幒鎳筹綁顢涢悙瀵稿幐闂佹悶鍎崝宀勵敋濠婂應鍋?
    translateContent(content, translations) {
        if (!translations) return content;
        
        // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒佸剶闁诲骸杞 description闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈤梺缁樺灱婵倝宕曞澶嬬厱闁规惌鍘介悵鎻桳缂傚倸鍊搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽顐沪闁绘挶鍎茬换娑㈠幢濡桨鍒婇梺?
        let result = content;
        
        // 闂傚倷绀侀幖顐ゆ偖椤愶箑纾块柛娆忣槺閻濊埖鎱ㄥ璇蹭壕闂佺粯渚楅崳锝咁嚕閻㈢鍨傛い鎰╁灩娴煎骸鈹戦悩顔肩伇婵炲绋撶划鏃堝醇閺囩喎浜卞銈嗗笒鐎氼剟鏌ㄩ妶澶屽彄闁搞儯鍔嶇粈鍐煟閿濆洦绠ta description闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅?
        result = result.replace(/<meta\s+name="description"[^>]*content="([^"]*)"[^>]*>([^<]*?)<meta\s+name="keywords"/g, (match, contentValue, extraText) => {
            console.log(' Fixing broken meta description tag');
            if (extraText.trim()) {
                console.log(' Removing extra text:', extraText.trim());
            }
            return `<meta name="description" content="${contentValue}">
<meta name="keywords"`;
        });
        
        // 闂傚倷绀侀幖顐⒚洪敂閿亾缁楁稑鍟伴弳?data-i18n 闂備浇顕х换鎺楀磻閻旂厧纾婚柣鎰惈閻掑灚銇勯幋顓炲闁哥姵宀稿畷鐢告偐鐠囪尙顔愰柣搴㈢⊕钃遍柍閿嬪笚缁绘盯宕奸悢椋庝紝閻庢鍣崜鐔风暦閸洖惟闁挎棁妫勯浼存⒒娴ｅ憡鍟為柛鏃€娲熼獮濠冩償椤垶鏅╅梺瑙勫婢ф寮查鍕厱妞ゆ劧绲跨粻銉︿繆閺屻儰鎲鹃柡宀嬬秮閹瑩宕ｆ径妯伙紒闂備胶绮悧顓犲緤鐠恒劌鍨濋柣銏㈩焾缁犳氨鎲稿澶婃瀬闁割偅娲橀崐鐢告煕閿旇骞楁い蹇曞枔缁?
        result = result.replace(/data-i18n="([^"]+)"[^>]*>([^<]*)</g, (match, key, originalText) => {
            // 闂傚倷鑳剁划顖炪€冩径鎰剁稏濠㈣埖鍔栭崑鈺呮煃閸濆嫬鈧摜娆㈤悙鐑樼厱闁哄洢鍔岄獮妤呮煕婵犲嫬浠遍柡灞诲妼閳藉鈻庨幒鎴婵＄偑鍊愰弫顏堝炊瑜嶉崵鎴濃攽閻樿宸ラ悗姘煎幘閻燁満itle闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈤梺缁樺灱婵倝寮查鍕€堕柣鎰仛濞呮洟鏌￠崱妯哄摵闁哄本绋栫粻娑氣偓锝庝簻椤懘姊虹紒妯虹厐闂傚嫬瀚…鍥ㄧ節濮橆剛鍊為梺鍐叉惈閸燁偊鍩€椤掍礁鈻曢柟顔肩秺瀹曞爼濡搁妷褌娣俊鐐€ч懙褰掑疾閻樿绠栭柛顐ｆ礀楠炪垺銇勯幘璺盒ユい锔诲枟缁绘盯鏁愰崨顔碱槱缂備浇顕ч崯浼村焵椤掆偓閻忔艾顫忚ぐ鎺懳﹂柛鏇ㄥ灡閸嬨劑鏌涘☉姗堟敾闁靛棗鍟村铏圭磼濮楀棙鐣奸梺纭呮珪閹瑰洭骞冮悙顑惧亝闁告劏鏅涢崜顓㈡⒑閸涘﹥澶勯柛鎾寸洴瀹曞綊鎮￠獮?
            if (key === 'title') {
                // 濠电姷顣藉Σ鍛村磻閳ь剟鏌涚€ｎ偅宕岄柡宀嬬磿娴狅妇鎷犻幓鎺戭潥婵犵鈧啿绾ч柟顔煎€搁悾鐑藉Ψ閳哄倹娅嗛梺鍏间航閸庢盯銆呭锕杔e闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅?
                const beforeMatch = result.substring(0, result.indexOf(match));
                const lastTitleIndex = beforeMatch.lastIndexOf('<title');
                const lastCloseTitleIndex = beforeMatch.lastIndexOf('</title>');
                
                // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞闁归偊鍓欓悵姗€姊洪柅鐐茶嫰婢ь垱绻涢悡搴吋妤犵偛顑夐幃鈺佺暦閸ャ劍顔?title闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈤梺缁樺灱濡嫰骞戦崼鏇熺厪濠电姴绻樺顔济归悩绛硅€跨€殿喖鐖奸崺锟犲磼濮樺彉鎮ｆ繝?/title>闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈤梻浣哥仢椤戝洭鍩㈤弴銏″€甸柨婵嗙凹缁ㄥジ鏌涙繝鍕毈闁哄被鍔岄埥澶娢熼懖鈺佸О婵＄偑鍊栧ú宥夊疾閻樺樊鍤曢柣妤€鐗婇崕鐔兼煏閸繃宸濇い鏃€鍔欏娲传閸曨偒浼€濠碉紕鍋橀崼鐚糽e闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈤梺缁樺灱濡嫮绮堥崘顔界厱婵炴垵宕楣冩煕?
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
        
        // 闂傚倷绀侀幖顐⒚洪敂閿亾缁楁稑鍟伴弳锕傛煙缂佹ê鍨傞柣鏃傚帶閻掓椽鏌涢幇銊︽珖闁告埊绻濆娲川婵犲嫭鍣梺鎸庢磸閸ㄨ棄鐣烽幎鑺ュ€绘俊顖氭贡缁?{{t:key}}
        result = result.replace(/\{\{t:(\w+)\}\}/g, (match, key) => {
            return this.getNestedTranslation(translations, key) || match;
        });
        
        return result;
    }
    
    // 闂備礁鎼ˇ顐﹀疾濠婂牆绀夋慨妞诲亾闁靛棔绶氶獮瀣偐閻㈡妲遍梻浣告惈鐎氼剛鎹㈤幒鎳筹綁顢涘В鍏兼閹晠鎳犻鍌氬О闂?
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

    // 闂傚倷绀侀崥瀣磿閹惰棄搴婇柤鑹扮堪娴滃綊鏌涢妷锝呭缂傚秴娲弻鐔煎箚瑜嶉弳杈ㄦ叏閿濆拋妯€闁诡喛顫夌粭鐔碱敍濮樺彉鍝楃紓鍌欑婢у酣宕戦妶澶婃瀬鐎广儱顦柋鍥煥濠靛棙濯煎ù鐓庢濮婃椽宕崟顐熷亾缁嬫５娲煛閸愨晩鍋ㄥ銈嗘尪閸ㄥ湱绮堥崟顖涚厱婵犻潧妫楅鈺呮煟閹惧啿鈧潡寮婚垾鎰佸悑闁告侗鍠涚涵鈧繝鐢靛仜瀵埖鍒婃禒瀣﹂柟鐗堟緲閸楄櫕銇勮箛鎾搭棤妞わ富鍣ｅ铏圭矙鐠恒劎顔夊┑鐘亾闁革富鍘奸崹婵囥亜閹烘垵鈧湱鈧碍纰嶉妵鍕箻椤栨侗鈧棝鏌＄€ｎ亝鍤囩€殿喖鐖煎畷濂告偄缁嬭法顣查梻浣规偠閸娿倝宕ｉ崘銊ф殾婵娉涚痪褎绻涢崱妯哄姢婵炲牊鎮傞弻鐔兼偂鎼达絾鎲煎┑顔硷龚椤曆呭弲闂佺懓鍢茬悮顐ｇ瑜版帗鐓涢柛銉︽构缁ㄧ晫绱掗埀?
    getOutputPath(pageOutput, lang) {
        if (lang === this.defaultLanguage) {
            // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹般劍娅嗙紓宥呮喘閺岀喖骞嗚閺嗚鲸鎱ㄩ敐鍜佹█闁哄本鐩獮鎺楀棘濞嗙偓姣夐梻浣虹帛椤ㄥ棝骞愰幎钘夌畾闁告洦鍨奸弫濠囨煠濞村娅囬崡?
            return pageOutput;
        }
        // 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒鎴濃偓鍦偓姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囩€殿喖鐖煎畷濂告偄缁嬭法顣查梻浣规偠閸娿倝宕ｉ崘銊ф殾婵娉涚粻顖溾偓鍏夊亾濠电姴鍊归楣冩⒑閼姐倕鏋庨柣銊︾箞瀹曟垿骞樼紒妯衡偓鍨箾閹寸偟鎳冨┑顔碱槹缁绘盯宕ｆ径濠庘偓婊堟煏?
        return path.join(lang, pageOutput);
    }
    
    // 闂傚倷绀侀崥瀣磿閹惰棄搴婇柤鑹扮堪娴滃綊鏌涢姀鈺傜檪L闂備浇宕垫慨宕囨媰閿曞倸鍨傞柟娈垮枟椤愪粙鏌ｉ幇顔煎妺闁哄拋鍓熼弻娑㈩敃椤掑倸鍩屽銈呯箣閸楁娊寮婚敓鐘茬＜婵﹩鍘奸ˇ鈺佲攽閳藉棗浜栭柛濠冪箓閻ｅ嘲顭ㄩ崘鎯ф倯闂佹悶鍎弲婵嬫晬濞戙垺鈷戦柟绋挎捣閳藉鏌ゅú璇茬仸鐎规洩缍侀幃娆擃敆閸屻倖绁梻浣告惈缁嬩線宕滈敃鍌氬惞闁哄啫鐗婇崑锟犳倶韫囧海顦﹀ù婊堢畺濮婃椽宕崟顓烆暫濡炪倧瀵岄崹閬嶅疾閸洘鍋愰柣銏㈡暩閿涙繈姊洪柅鐐茶嫰婢у墽绱?
    getUrlPath(pagePath, lang) {
        if (lang === this.defaultLanguage) {
            return `/${pagePath.replace('.html', '')}`;
        }
        return `/${lang}/${pagePath.replace('.html', '')}`;
    }
    
    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥ鍡楀箹缂佸墎鍋為幈銊ノ熺拠鎻掝潽闂佹悶鍊栧Λ鍐箖妞嬪簼鐒婂ù锝夋櫜婢规洖鈹戦敍鍕杭闁稿﹥顨婂顐ゆ嫚瀹割喚鍔?
    buildMultiLangPages() {
        console.log('\n Building multilingual pages...');
        console.log(' URL');
        
        // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪炊瑜忛ˇ銊╂⒑閸涘﹦鈽夐柣掳鍔戦獮濠囨偐缂佹ǚ鎷洪梺鍝勵槼濞夋洝鍊撮梻?
        const internalLinksResult = this.internalLinksProcessor.process(this.translations);
        if (!internalLinksResult.success) {
            console.error('[ERROR] Internal links processing failed, continuing with build...');
        }
        
        // 婵犵數鍋犻幓顏嗙礊閳ь剚绻涙径瀣鐎殿噮鍋婃俊鍫曞炊閳轰焦娈梺鑽ゅТ濞测晝浜稿▎蹇ｇ劷闁挎繂顦伴悡娆愩亜閹搭厼澧柛濠佺矙瀹曘垽顢楅崟顒€鈧敻鎮峰▎蹇擃伀闁绘搩鍨崇槐鎺楁偐闂堟稒鐏堥梺璇″灠閸熸潙鐣烽悢纰辨晝闁挎繂鎳庢竟鏃堟⒒娴ｈ銇熸繛鐓庢健瀹曟繆绠涘☉杈ㄦ櫔闂侀潧绻堥崹娲吹婵犲洦鐓?
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

        // 缂傚倷鑳堕搹搴ㄥ矗鎼淬劌绐楅柡鍥╁У瀹曞弶鎱ㄥΟ鎸庣【闁告垹濞€閺屾盯寮撮妸銉ょ敖缂備焦鍞荤粻鎾诲蓟閿濆鐓涘┑鐘插€归悘鍫㈢磽閸屾氨孝缂佸鐖奸崺鈧い鎺嶈兌閳洟鏌ㄥ顓犵瘈闁?- 闂備浇顕уù鐑藉箠閹剧粯鍤愭い鏍仜閻鐓崶銊﹀蔼闁逞屽墯鐢€崇暦閵娧€鍋撳☉娆樼劷鐟滅増鍨佃灃闁绘﹢娼ф禒婊堟煟閺嵮佸仮鐎规洘濞婇獮鏍ㄦ媴閸涘妫熼梻浣告惈椤︻垶鎮樺┑瀣€堕柨娑樺閸?
        const outputDir = 'multilang-build';
        if (fs.existsSync(outputDir)) {
            // 闂傚倷绀侀幉锛勬暜閻愬绠鹃柍褜鍓氱换娑㈠川椤撱垹寮伴悗娈垮櫘閸嬪棛妲愬▎鎾村亹閻犲洤寮堕悿鍌炴⒒娴ｅ搫鍔﹂柡鍛櫊瀹曚即寮介銈囶槸?- 婵犵數鍋犻幓顏嗙礊閳ь剚绻涙径瀣鐎殿噮鍋婃俊鑸靛緞鐎ｎ剙濮烽梻浣告贡閸庛倝宕归崷顓犵煋婵炲樊浜濋悡鏇㈡煙閻戞ɑ鐓ラ柍璇茬墛缁?
            try {
                fs.rmSync(outputDir, { recursive: true, force: true });
                console.log('[OK] Cleared existing build directory');
            } catch (error) {
                console.warn('  Warning: Could not remove existing directory:', error.message);
            }
        }
        fs.mkdirSync(outputDir, { recursive: true });

        // 婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸庡﹪鏌ㄥ☉妯侯伀闁活厽鎸鹃埀顒€绠嶉崕閬嶅箠韫囨稑纾挎繛鍡樻尰閻撶喐銇勯顐㈠濠碘剝瀵х换娑㈠醇閻旈浠奸梺褰掝棑婵炩偓妞ゃ垺锕㈤崺锕傚焵椤掑嫬鍑犻柛娑樼摠閻撴盯鎮楅敐搴濈盎妞ゅ繆鏅濈槐鎾诲磼濞戞瑥闉嶉梺闈涙搐鐎氫即骞冩禒瀣窛濠电姴鍟ㄩ埀?
        for (const lang of enabledLanguages) {
            console.log(`\n Building pages for language: ${lang.toUpperCase()}`);
            
            // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹般劍娅嗙紓宥呮喘閺岀喖骞嗚閺嗚鲸鎱ㄩ敐鍜佹█闁哄本鐩獮鎺楀棘濞嗙偓姣夐梻浣虹帛椤ㄥ棝骞愰幎钘夌畾闁告洦鍨奸弫濠囨煠濞村娅囬崡蹇涙⒒娴ｇ懓顕滅紒瀣灴閹崇喖顢涢悙鑼厬闂佺粯鍔﹂崜娑€呴悜鑺ョ厸鐎广儱楠告晶濠氭煕閵堝棙顥堥柟顕€顥撴禍鍛婃媴闂€鎰棜闂備礁鎼ˇ顖炴偋婵犲洤绠伴柟闂寸閸氳銇勯幘鍗炵仼缂佲偓閸℃稒鐓欑€瑰嫭澹嗛悞楣冩煕閵堝棙顥堥柟顕€顥撴禍鍛婃媴闂€鎰棜闂備浇顕х€涒晝绮欓幒妤€绀夋俊銈傚亾閻撱倝鏌熷畡鎷岊潶濞?
            const langDir = lang === this.defaultLanguage ? outputDir : path.join(outputDir, lang);
            fs.mkdirSync(langDir, { recursive: true });
            
            if (lang === this.defaultLanguage) {
                console.log(`     English pages will be built at root directory`);
            } else {
                console.log(`     ${lang.toUpperCase()} pages will be built at /${lang}/ directory`);
            }

            // 闂傚倷绀侀幉鈥愁潖缂佹ɑ鍙忛柟顖ｇ亹瑜版帒鐐婇柍鍝勫€搁悵浼存⒑闂堟侗妯堥柣鎾崇墦瀹曠敻寮崼鐔蜂画闁诲繐绻嬬粈浣圭妤ｅ啯鈷戞慨鐟版搐婵″ジ鎮楀鐓庢珝闁诡喗鐟╁鎾偐閸愯尙褰撮梻浣烘嚀椤曨參宕戦悙鐑樺€垫い鏃€绁?
            const translationPath = path.join('locales', lang, 'translation.json');
            let translations = {};
            
            try {
                translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
                console.log(`[OK] Loaded translations for ${lang}`);
            } catch (error) {
                console.warn(`    Warning: Could not load translations for ${lang}:`, error.message);
                continue; // 闂備浇宕垫慨鎾箹椤愶附鍋柛銉㈡櫆瀹曟煡鏌涢幇鈺佸Ψ闁哄矉绠撻弻宥夊煛娴ｅ憡娈茬紓浣哄У鐢偟妲愰幘璇查唶闁绘柨澹婂锟犳⒑楠炲奔绀佸ú銈呂涘鈧弻娑㈠Ψ椤栫偞顎嶅銈嗗姃缁瑩寮婚敐澶娢╅柕澶堝労娴煎倸顪冮妶鍡樼８闁搞劌顭烽獮濠傗槈閵忕姷鍔?
            }

            buildReport.pages[lang] = [];
            
            // 婵犵數鍋為崹鍫曞箲閸モ晝纾芥慨姗€顤傞弫瀣叏濡潡鍝洪悗姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囬柡灞剧洴楠炴帡骞橀崹娑欘潔缂傚倸鍊搁崐褰掑箲娴ｈ櫣涓嶆繛鎴欏灩瀹告繈姊洪銊╂闁活厽顨婂鍝勑ч崶褍顬堥柣搴㈠嚬閸撶喖骞冮崫鍕ㄦ瀻闁圭偓娼欓崜顔碱渻閵堝棙顥嗛柛瀣姉缁?
            const deviceDir = path.join(langDir, 'devices');
            fs.mkdirSync(deviceDir, { recursive: true });
            
            // 闂傚倷绀侀幖顐︻敄閸涱垪鍋撳鐓庡缂佽鲸鎹囬獮姗€鎳滈棃娑氬酱闂備線娼чˇ浠嬫偂閸儱鍚归柡鍐ㄧ墛閸嬶繝鎮樿箛搴ｎ槮濞存粓绠栧鍝勑ч崶褍顬堥柣搴㈠嚬閸樹粙寮茬捄渚悑濠㈣泛锕ら悵妯荤節閵忥絽鐓愰柛鏃€鍨块崺鈧い鎺嗗亾妞わ箓娼ц灋?
            for (const page of config.pages) {
                // 濠电姷顣藉Σ鍛村磻閳ь剟鏌涚€ｎ偅宕岄柡宀嬬磿娴狅妇鎷犻幓鎺懶曢梻渚€娼уΛ妤吽囬棃娴虫盯宕橀纰辨綂闂佹枼鏅涢崬顓㈡晝閸屾稓鍘卞┑顔矫晶浠嬫偩閸偂绻嗛柣鎰靛墯閵囨繄鈧娲樺畝绋款嚕閻㈠憡鍋ㄩ梻鍫熺⊕濞呮捇姊绘担铏瑰笡妞ゃ劌鐗撻獮濠囧箻缂佹ê浠奸梺鍛婃寙閸曨偆褰存俊鐐€栭幐鏉戭瀶瑜斿?
                if (page.enabled_languages && !page.enabled_languages.includes(lang)) {
                    continue; // 闂備浇宕垫慨鎾箹椤愶附鍋柛銉㈡櫆瀹曟煡鏌涢幇銊︽珖闁崇粯姊婚埀顒€绠嶉崕閬嵥囬锕€纾婚柟鎹愵嚙绾惧吋绻濇繝鍌氼仾婵炲牄鍨虹换娑氣偓娑欘焽閻﹤螖閻樺弶鎲哥紒杈╁仧閳ь剨缍嗛崰鏍矆閸懇鍋撻獮鍨姎闁绘绮撳畷鐢稿籍閸喎浠柣蹇撶箣缁€浣圭妤ｅ啯鈷戞慨鐟版搐婵″ジ鎮楀顐㈠祮濠碘€崇摠瀵板嫰骞囬褎顥?
                }
                
                totalPages++;
                
                try {
                    const outputPath = this.getOutputPath(page.output, lang);
                    console.log(`   Building ${outputPath}`);
                    
                    // 闂傚倷绀侀幉锟犲垂闂堟党娑樜旈崥钘夋喘椤㈡鎷呴崗鍝ョ泿闂備焦鐪归崹褰掑箟閳ユ剚娴栭柕濞炬櫆閻撴稑霉閿濆懏鎯堟い锝堝亹閳ь剝顫夐幐椋庢濮樿埖鍋樻い鏇楀亾妤犵偛妫濋獮宥夘敊缁涘鏅欓梻鍌欐祰濡椼劑鎳楅崼鏇€澶愬箛閻楀牆鍓归梺璇″瀻鐏炶姤顔?
                    const pageData = {
                        lang: lang,
                        lang_prefix: lang === this.defaultLanguage ? '' : `/${lang}`,
                        lang_code: lang.toUpperCase(),
                        page_content: page.page_content,
                        ...page.config
                    };
                    
                    // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顕呮毌闁稿鎸婚幏鍛村礃椤垶顥嶉梻浣虹《閺呮盯骞婂鈧獮鍐煛閸涱喖娈濈紒鍓у閿氬ù婊勫劤闇夐柨婵嗘噺鐠愶繝鏌涢妸銉ｅ仮闁?
                    const pagePath = page.path || page.config.path || outputPath || '';
                    
                    pageData.is_home = pagePath === 'index.html' || pagePath === '';
                    pageData.is_blog = pagePath.includes('blog/') || pagePath.startsWith('blog');
                    
                    // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞閻庯絻鍔嬬花濠氭⒑濮瑰洤鐏╅柟娴嬧偓鎰佹禆闁靛ň鏅滈埛鎴︽煛婢跺孩纭堕懖鏍⒑濮瑰洤鈧洖螞濞嗘垹鐭欏鑸靛姦閺佸洭鏌ｉ幇顓炵祷婵炲牄鍎崇槐鎾诲磼濞嗘埈妲紓浣虹帛椤ㄥ﹪銆佸▎鎾冲嵆闁绘鏁搁敍鐐差渻閵堝棙顥嗙€规洜鏁诲畷顖涚節閸ャ劌鈧潧霉閿濆懎鏆欐い銉ョЧ閺屾盯鍩℃担鐟版畻闂佽鍠掗弲鐘诲箠濠婂懎鏋堟俊顖濇〃婢规洘绻涢幘纾嬪闁挎洩濡囩划鍫熷緞婵炴帒缍婇弫鎰板醇閻旀亽鈧﹪姊烘潪浼存闁稿﹥绻堝缁樼節閸屻倕鎮戦梺鎼炲劗閺呮粓鎮楅銏♀拺婵懓娲ゆ俊濂告倵濮樼厧澧撮柛鈹惧亾?
                    if (typeof page.config.is_gaming !== 'undefined') {
                        pageData.is_gaming = page.config.is_gaming;
                        pageData.is_tools = page.config.is_tools || false;
                        pageData.is_devices = page.config.is_devices || false;
                    } else {
                        // 闂傚倷绀侀幉锟犳偋閺囥垹绠规い鎰剁畱閸?Tools 闂?Devices闂傚倷鐒︾€笛呯矙閹达附鍋嬪┑鐘插閺嗘粓鏌熼崜褏甯涢柍閿嬫⒐閵囧嫰鏁冮埀顒傜玻閹婚潧鈹戦敍鍕杭闁稿﹥顨婂顐ゆ嫚瀹割喚鍔烽柣銏╁灱閸犳氨绮?
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
                    
                    // 婵犵數鍋涢顓熸叏閺夋嚚褰掓倻閼恒儱鈧兘鏌￠崶鈺佇ｉ悗姘哺閺岀喓鈧數顭堟禒锕傛煟鎼搭喖鏋涢棁澶愭煟濡寧鐝柡瀣閺屻倝宕归銏紝闂佸湱鍋ㄩ崹褰掓偩閿熺姴绾ч悹鎭掑妽閸嬔冣攽閿涘嫬浜奸柛濠冾殜瀵偆鎷犲顔惧姺婵炲鍘ч悺銊╁磻鐎ｎ喗鐓熼柣鏃傤焾椤ュ鏌￠崱鏇炲祮闁哄矉缍佹俊鎼佸Ψ閵夘喕绱戦梻浣虹帛閸旀牕煤濠婂牆绠柣妯款嚙缁狅絾绻濋棃娑樻殭濞?
                    if (pageData.page_title_key) {
                        // 闂傚倷娴囬妴鈧柛瀣尰閵囧嫰寮介妸褉妲堥梺浼欏瘜閸犳岸鍩€椤掑喚娼愰柟鍛婃倐閹崇喖顢涢悙顏佸亾閸愵煈鐓ラ柛顐ゅ枎閸擃參姊洪崨濠冨闁告﹢绠栧畷鎰板箮閼恒儱浠梺鎼炲劘閸斿矂鎮橀幘顔界厸濞撴艾娲ゅ顕€鏌℃担鍝バゅù鐙呭缁數鈧綆鍋呴幃?"ppiCalculator.pageTitle"
                        const translationValue = this.getNestedTranslation(translations, pageData.page_title_key);
                        if (translationValue) {
                            pageData.page_title = translationValue;
                        } else {
                            // 濠电姷顣介埀顒€鍟块埀顒€缍婇幃妯诲緞婵炵偓鐓㈤梺鏂ユ櫅閸燁垳绮婚幒妤佺厵闁割煈鍋勯崝銈夋煕閳轰胶鐏辩紒杈ㄧ懇瀵媽绠涢弴鐔滄繈姊洪幐搴ｂ槈濠靛倹姊圭换娑㈠炊椤掍礁浠洪梺闈浥堥弲婵堟暜濞戙垺鍋ｅù锝夋涧閳ь剚顨呴埢鎾诲箟閸嶎煢title
                            pageData.page_title = pageData.og_title || 'Screen Size Checker';
                        }
                    } else {
                        pageData.page_title = pageData.og_title || 'Screen Size Checker';
                    }
                    
                    // 缂傚倷鑳堕搹搴ㄥ矗鎼淬劌绐楅柡鍥╁У瀹曞弶鎱ㄥ┑鍫涗虎tle闂傚倷绀侀幉锟犳偡閿曞倹鏅濋柕蹇嬪€曢梻顖炴煟閹寸儐鐒介柍缁樻礋閺岋綁寮埀顒€顪冮崹顕呯劷闁割偅娲橀崑锝吤归敐鍥剁劸闁抽攱妫冮弻锝夊Χ閸涱噮妫﹂梺杞扮缁夌懓鐣锋總绋款潊闁斥晛鍟鐟扳攽閻愯尙鎽犵紒顔肩灱缁氨鐚鹃妶娌?html缂傚倸鍊搁崐椋庣矆娴ｈ　鍋撳闂寸盎闁宠閰ｉ敐鐐侯敊閸撗呭炊
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
                    // 婵犵數鍎戠徊钘壝归崒鐐茬獥婵°倕鎷嬮弫鍡樼箾閹惧啿鐏硈cription濠电姷鏁搁崑娑⑺囬銏犵鐎光偓閸曨偆鐓戦梺绯曞墲缁嬫帡鎮炴繝姘厸闁告洦鍋嗙粻鎶芥偨椤栨碍顥㈤柡灞诲妼閳藉螣缂佹ɑ瀚抽梻浣芥〃缁讹繝宕抽敐澶屽祦闁归偊鍘芥刊鎾煕濠靛嫬鍔橀柛瀣枑缁绘繈妫冨☉妯峰亾瑜版帇鈧啴宕奸妷锕€鈧兘鏌￠崶鈺佇ｉ悗姘哺閺岀喐娼忔ィ鍐╊€嶉梺?
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
                    
                    // 闂備浇宕垫慨鎾敄閸涙潙鐤い鏍仜濮规煡鏌ㄥ┑鍡╂Ч妞ゃ儱鐗婄换娑㈠幢濡搫顫呴梺绋款儐閹稿骞忛崨瀛樺仼閻忕偠顕ф禍鑺ョ節閻㈤潧顫掗柛鏇ㄥ亜椤垿姊哄ú璇插箺闁稿孩濞婇、?
                    const depth = page.output.split('/').length - 1;
                    // 闂備浇顕у锕傦綖婢舵劖鍎楁い鏂垮⒔娑?prefix 闂傚倷鐒﹀鍨焽閸ф绀夐悗锝庡墲婵櫕銇勯幒鎴濐仼閻熸瑱绠撻獮鏍ㄦ綇閸撗勫仹闂佽桨绶氱粻鏍箖鐟欏嫮鐟规い鏍ㄦ皑娴犫晝绱撴担绋款暢闁稿鍠栭獮蹇曗偓锝庡枟閺咁剟鏌涢弴銊ュ箺婵?
                    const prefix = depth > 0 ? '../'.repeat(depth) : '';
                    
                    if (lang === this.defaultLanguage) {
                        // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋涢柟鐟扮埣閺屾洘绻濊箛鎿冩喘婵犮垻鎳撻惌鍌炲蓟閿濆鐓涘┑鐘插€归悘鍫㈢磽?
                        if (depth === 0) {
                            // 闂傚倷绀侀幖顐ょ矓閺夋埊鑰块柛妤冧紳濞差亜绠悘鐐额唺濮规姊洪崫鍕闁煎綊绠栭幆浣割煥閸愮偓瀵?
                            pageData.css_path = 'css';
                            pageData.locales_path = 'locales';
                            pageData.js_path = 'js';
                        } else {
                            // 闂備浇顕х€涒晝绮欓幒妤€绀夋俊銈傚亾閻撱倝鏌熷畡鎷岊潶濞存粌缍婇弻锟犲炊閼搁潧鈻忛梺閫炲苯澧い锕傛涧铻?
                            pageData.css_path = prefix + 'css';
                            pageData.locales_path = prefix + 'locales';
                            pageData.js_path = prefix + 'js';
                        }
                    } else {
                        // 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒鎴濃偓鍦偓姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囬柡灞剧洴閺佸倿宕崟顐綂婵＄偑鍊栧ú蹇涘垂婵犳艾绠犳繛鎴欏灩閻掑灚銇勯幒鎴濃偓鐢稿磻閹炬枼妲堟繛鍡楃箰椤骸鈹戦悙鎻掔骇濠殿垯绮欐俊?
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
                    
                    // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閻樺弶澶勯柛搴℃捣缁辨帞鈧綆鍋掗崕銉╂煕閵堝洤鈻堟慨濠冩そ瀹曟粏顦插ù婊堢畺閹粙顢涘鐓庢闂佸湱鎳撶€氫即銆佸☉姗嗘僵閺夊牃鏅濆畵?
                    if (pageData.home_url) {
                        if (lang === this.defaultLanguage) {
                            // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋熼柡鍜佸墯閹便劌顫滈崱妤€顫紓浣插亾闁逞屽墴濮婃椽宕ㄦ繝鍌滎儌婵犫拃鍕垫疁闁诡啫鍥х妞ゆ棁妫勯崜顔碱渻閵堝棙顥嗛柛瀣姉缁?
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        } else {
                            // 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒鎴濃偓鍦偓姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囬柡灞诲妼閳藉鈻庨幒鎴婵犵數鍋涘鍫曟偋閻樿尙鏆︽慨妯挎硾缁狀垳鈧厜鍋撳┑鐘插€归楣冩⒑閼姐倕鏋庨柣銊︾箞瀹曟垿骞樼紒妯煎幐閻庡箍鍎遍幊蹇曟嫻閳╁啰绠鹃柛娆忣槸椤庢粓鏌?
                            pageData.home_url = depth === 0 ? 'index.html' : '../'.repeat(depth) + 'index.html';
                        }
                    }
                    
                    if (pageData.device_links_base) {
                        pageData.device_links_base = pageData.device_links_base.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.device_links_base.substring(3)
                            : (depth > 0 ? prefix + pageData.device_links_base : pageData.device_links_base);
                    }
                    
                    // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶堝劤椤㈠懎鈹戦鏂や緵闁告搫绠撳畷銉︾┍閸㈩搾
                    if (pageData.blog_url) {
                        if (lang === this.defaultLanguage) {
                            // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋涚痪顓涘亾婵犳鍠楅敃鈺呭礈閿曞倸瑙﹂柛宀€鍋為悡鏇㈡煥閺傛寧鎯堝┑鈥茬矙閺岋絽螖娴ｇ懓鍞夐梺璇″灠鐎氫即銆佸▎鎾村殐闁冲搫鍞?/blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        } else {
                            // 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒鎴濃偓鍦偓姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囬柡灞剧☉铻栧ù锝堟椤ユ繂顪冮妶鍡樺碍缂傚秴锕ら悾鐑芥倻閽樺）鈺呮煏婢舵稓鐣遍柍褜鍓氶〃濠囧蓟閵堝棛闄勫璺侯槺閺佹牕鈹戦悙鑼闁搞劌缍婇獮蹇涙偐濞茬粯鏅ｉ梺鎶芥暜閸嬫捇鏌＄€ｎ亝鍤囬柡宀嬬秮閸┾剝绻濋崒娑氫邯缂傚倸鍊哥粔瀵哥矓閻㈢數鐭?/zh/blog/, /de/blog/, /es/blog/
                            pageData.blog_url = depth === 0 ? 'blog/' : '../'.repeat(depth) + 'blog/';
                        }
                    }
                    
                    if (pageData.privacy_policy_url) {
                        pageData.privacy_policy_url = pageData.privacy_policy_url.startsWith('../') 
                            ? '../'.repeat(depth + 1) + pageData.privacy_policy_url.substring(3)
                            : prefix + pageData.privacy_policy_url;
                    }
                    
                    // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閻樻彃顏悗姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囬柡宀嬬秮閸╋繝宕橀崜褍濮奸梻浣告啞椤忔悂宕堕妸銉ュ闂備礁鎲＄敮鎺楀吹椤帡姊绘担鍛婂暈缂侇喖鐭傞幆灞剧瑹閳ь剟骞嗗畝鍕畾鐟滄粓宕?
                    if (lang === this.defaultLanguage) {
                        // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕瀹ュ棗缍匧婵犵數鍋為崹鍫曞箰閸濄儳鐭撻柣鐔诲焽閳ь剚甯″畷婊勬媴閻熺増姣囧┑鐐舵彧缁插潡鎮洪弮鍫濆惞闁哄啫鐗婇崑锟犳倶韫囧海顦﹀ù婊堢畺濮婃椽宕ㄦ繝鍐ㄧ缂備礁顦晶搴∥?
                        // 缂傚倷鑳堕搹搴ㄥ矗鎼淬劌绐楅柡鍥╁У瀹曞弶鎱ㄥ鍡楀箻闁崇粯姊婚埀顒€绠嶉崕閬嶅箠鎼淬劍鍎婇柛顐ｆ礃閻?/en/ 闂傚倷绀侀幉锟犲箰閸濄儳鐭撻柛鎾茬劍椤?
                        pageData.canonical_url = pageData.canonical_url.replace('/en/', '/');
                    } else {
                        // 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒鎴濃偓鍦偓姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囨慨濠傤煼瀹曞爼鏁愰崨顒€顥氶梻浣藉吹閸犳劕煤閹存緷褰掑炊椤掑鏅梺闈涚箞閸ㄦ椽宕垫繝鍥ㄧ厓鐟滄粓宕滈悢椋庢殾婵犲﹤鍠氶崥瀣煕閵夈垺娅囬柨?
                        if (!pageData.canonical_url.includes(`/${lang}/`)) {
                            pageData.canonical_url = pageData.canonical_url.replace(
                                'https://screensizechecker.com/',
                                `https://screensizechecker.com/${lang}/`
                            );
                        }
                    }
                    
                    // 缂傚倸鍊风粈渚€藝椤栫偐鈧箑鐣￠幍铏€?html闂傚倷绀侀幉锟犳嚌閹灐瑙勵槹鎼淬埄娼熼梺鐟邦嚟閸嬬喖銆呴悜鑺ョ厪濠㈣泛鐗嗛崝姘舵煟閺嶎厺鎲炬慨濠冩そ瀵爼鎳楅姘卞幀loudflare Pages闂傚倷鐒﹂惇褰掑礉瀹€鍕瀭濠靛倻鍎鹃梻鍌欑閹碱偆绮旈崼鏇炲偍鐟滃繐危?
                    pageData.canonical_url = pageData.canonical_url.replace(/\.html$/, '');
                    pageData.og_url = pageData.canonical_url;
                    
                    // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閸屾稓顐糴n Graph闂傚倷娴囧銊╂嚄閼稿灚娅犳俊銈傚亾闁伙絽鐏氶幏鍛村捶椤撗勭カ闂備線娼чˇ顓㈠磹閺囥垹鐓濋煫鍥ㄧ⊕閻撶喐銇勯顐㈠濠碘€虫健閺岋綁骞囬鐔侯槶闂佸綊顥撴繛鈧鐐差儏閳规垿宕惰閸嬫捇鎮介崨濠勫幗闂侀潧顭堥崕閬嶎敂閳哄懏鐓曢柣鎰▕閸ょ喖鏌?
                    pageData.og_title = pageData.page_title || pageData.og_title;
                    pageData.og_description = pageData.description || pageData.og_description;

                    // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢悙鑼攽:image - 婵犵數鍋犻幓顏嗙礊閳ь剚绻涙径瀣鐎殿噮鍋婃俊鍫曞幢閹邦亞鐩庨梻浣圭湽閸ㄥ綊骞夐垾鎰佹禆闁靛ň鏅滈悡鐔镐繆閵堝懎鏆為柛銈傚亾闂備椒绱紞浣虹不閺嵮呮殾闁割偅娲栫粈鍫㈡喐瀹ュ鈧倹绻濆顓犲幍闁诲孩绋掗…鍥ㄦ櫠閻㈢數纾兼い鏇炴噹閻忥綁鏌熷畡閭﹀剶濠碘€崇埣瀹曘劑顢橀悩顐壕閻犲洩顥嗛悷閭︾叆閹肩补鈧尙鐩庢繝?
                    if (!pageData.og_image) {
                        pageData.og_image = 'https://screensizechecker.com/images/og-default.png';
                    }

                    // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢悙鑼攽:locale
                    const localeMap = {
                        'en': 'en_US',
                        'zh': 'zh_CN',
                        'de': 'de_DE',
                        'es': 'es_ES',
                        'pt': 'pt_BR'
                    };
                    pageData.og_locale = localeMap[lang] || 'en_US';
                    
                    // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｆ惔顫埛eflang闂傚倷鑳堕崕鐢稿疾濠靛鈧箓宕奸妷銉х厬閻熸粍鏌ㄩ锝夘敃閿旇棄浜遍梺鍓插亝缁诲嫰濡?
                    pageData.base_url = 'https://screensizechecker.com';
                    
                    // 闂備浇宕垫慨宕囨閵堝洦顫曢柡鍥ュ灪閸嬧晝绱撴担楠ㄦ粍绂嶅鍫熺厽闁靛繒濮甸崯鐐翠繆濡炵厧濮傞柟顔款潐缁楃喖顢涘鍙樺摋缂傚倷绀佹晶搴ㄥ磻閵堝鏋佺€广儱顦柋鍥ㄧ節婵犲倹鍣介柟鎻掔秺濮婃椽宕ㄦ繝鍕吂闂佺懓鍟块柊锝夌嵁閸℃稑閱囬柕蹇娾偓宕囧酱婵＄偑鍊栭幐鏉戭瀶瑜斿鎼佸川鐎涙鍘遍梺瑙勫劤绾绢叀鍊寸紓鍌欐祰妞存悂宕烘繝鍕潟?
                    if (lang === this.defaultLanguage) {
                        pageData.page_path = pageData.canonical_url.replace('https://screensizechecker.com', '');
                    } else {
                        pageData.page_path = pageData.canonical_url.replace(`https://screensizechecker.com/${lang}`, '');
                    }
                    if (!pageData.page_path) {
                        pageData.page_path = '/';
                    }
                    
                    // 婵犵數鍋為崹鍫曞箰妤ｅ喚鏁嬮柣顑芥殝flang闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈡俊鐐差儏鐎涒晜鍒婃總鍛婄厱闁圭偓顨呴幊蹇涙倵椤撶偐鏀芥い鏃傛櫕缁犳壆绱掗幓鎺撳仴闁搞劍鍎抽～婊堝焵椤掑嫬绠氶柛鎰靛枛缁€鍡涙煕閹寸媭鏆?
                    // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞閻庯絻鍔嬬花濠氭⒑濮瑰洤鐏╅柟娴嬧偓鎰佹禆闁靛ň鏅滈埛鎴︽煛婢跺孩纭堕懖鏍⒑濮瑰洤鈧洖螞濞嗘垹鐭欏鑸靛姦閺佸洭鏌ｉ幇顓炵祷婵炲牄鍎靛娲传閸曨厼顣洪梺鐐藉劜缁楊湯flang URL闂傚倷鐒︾€笛呯矙閹达附鍋嬮柛鈩冪◤閳ь剙鎳撻ˇ鍦偓瑙勬磵閳ь剚鍓氬鈺傘亜閹烘埈妲搁柟顔兼嚇濮婃椽宕崟顓夈垺绻涚仦鍌氬妞ゃ垺顨婇弻銊р偓锝冨妺缁ㄥ姊哄Ч鍥х仼闁诲繑宀搁幃楣冩焼瀹ュ棗浠梺璇″幗鐢帗鎱ㄩ埀顒€顪冮妶鍡樼８闁搞劌顭烽獮濠傗槈閵忕姷鍔﹀銈嗗笒鐎氼剟宕ｆ繝鍥ㄧ厽婵☆垰鐏濋惃鐑樼箾閸喐鍊愰柡灞诲妼閳藉顫滈崱姗嗏偓鍡欑磽娴ｄ粙鍝虹紒璇茬墕閻ｅ嘲顫濋鑺ョ€婚柟鑹版彧缁插潡顢欓弮鍫熲拺?
                    // 闂傚倷绀侀幉锟犳偄椤掑倻涓嶉柟杈剧畱閸ㄥ倹銇勯弽顐粶闁哄嫨鍎靛鍫曟倷閺夋埈妫嗛梺鐓庢贡缁岀饱ge_path闂備浇宕垫慨宕囨閵堝洦顫曢柡鍥ュ灪閸?
                    if (!pageData.hreflang_en_url) {
                        // x-default 闂傚倷绀侀幉锛勫垝瀹€鍕剹濞达綀銆€閸嬫挸顫濋鐐╂灆閻庢鍣崜鐔风暦閸洖鐓涘〒姘处濮ｅ姊绘担鍛婃儓闁绘绮撳畷婊堟偄閻撳海顦у┑顔姐仜閸嬫挻顨ラ悙鏉戝鐎规洘鍎奸ˇ鎶芥煕婵犲偆鐓奸柡灞糕偓鎰佸悑闁搞儴鍩栭弫顖炴⒑濞茶骞楅柛搴㈠▕椤㈡岸濡烽埡浣侯槹闂佸憡鎸烽懗鍫曀囬埡鍛拺?/en/ 闂傚倷绀侀幉锟犲箰閸濄儳鐭撻柛鎾茬劍椤洟鏌熼幖顓炵仯缂?
                        pageData.hreflang_root_url = pageData.page_path === '/' ?
                            'https://screensizechecker.com/' :
                            `https://screensizechecker.com${pageData.page_path}`;

                        pageData.hreflang_en_url = pageData.hreflang_root_url;

                        // 婵犵數鍋為崹鍫曞箹閳哄懎鍌ㄥù鐘差儏閸戠娀鏌涢幇闈涙灍闁稿顑夐弻娑㈩敃閵堝懏鐎鹃梺?
                        pageData.hreflang_zh_url = `https://screensizechecker.com/zh${pageData.page_path}`;

                        // 闂佽楠搁悘姘珶閸℃稑钃熷鑸靛姦閺佸鏌曡箛瀣偓鏍磻鐎ｎ喗鐓曟い鎰╁€曢弸鎴︽煙?
                        pageData.hreflang_de_url = `https://screensizechecker.com/de${pageData.page_path}`;

                        // 闂備浇宕甸崰鎰般€冩径鎰？濠电姵鍑归弫瀣煏韫囧鈧牠宕戠€ｎ喗鐓曟い鎰╁€曢弸鎴︽煙?
                        pageData.hreflang_es_url = `https://screensizechecker.com/es${pageData.page_path}`;

                        pageData.hreflang_pt_url = `https://screensizechecker.com/pt${pageData.page_path}`;
                    }

                    if (!pageData.hreflang_root_url) {
                        pageData.hreflang_root_url = pageData.page_path === '/' ?
                            'https://screensizechecker.com/' :
                            `https://screensizechecker.com${pageData.page_path}`;
                    }
                    if (!pageData.hreflang_en_url) {
                        pageData.hreflang_en_url = pageData.hreflang_root_url;
                    }
                    if (!pageData.hreflang_zh_url) {
                        pageData.hreflang_zh_url = `https://screensizechecker.com/zh${pageData.page_path}`;
                    }
                    if (!pageData.hreflang_de_url) {
                        pageData.hreflang_de_url = `https://screensizechecker.com/de${pageData.page_path}`;
                    }
                    if (!pageData.hreflang_es_url) {
                        pageData.hreflang_es_url = `https://screensizechecker.com/es${pageData.page_path}`;
                    }
                    if (!pageData.hreflang_pt_url) {
                        pageData.hreflang_pt_url = `https://screensizechecker.com/pt${pageData.page_path}`;
                    }
                    
                    // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顔芥毄缁炬儳銈搁弻鐔煎箚瑜滈崵鐔兼煃瑜滈崜锕傚垂鐠鸿櫣鏆﹂柣妯款嚙閸愨偓闂侀潧顭梽鍕敊瀹ュ鈷?
                    pageData.structured_data = this.generateStructuredData(pageData, lang);
                    
                    // 婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸嬪鎮楅崷顓炐ラ柣銈傚亾闂備礁鎲￠崝鎴﹀礉鐎ｎ剚顫曢柨婵嗩槹閻撴洟鐓崶銊︾闁告ɑ鎸抽弻鏇㈠幢濡ゅ﹥鈻堝┑鈽嗗亜閸熷瓨鎱ㄩ埀顒勬煃閳轰礁鏆炴繛鍫燂耿濮婅櫣绮欓幐搴ｎ洶濠碘€冲⒔椤╃瓐缂傚倸鍊搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽顐粶缂佲偓瀹€鍕厸鐎广儱鍟俊鑺ョ箾閸繄鍩ｉ柡宀€鍠撻幏鐘诲灳閾忣偆褰茬紓鍌欐祰妞村摜鎹㈤崼銉у祦闁规崘顕х粻娑欍亜閹哄棗浜剧紒鎯у⒔閻栴棲RP闂備浇顕ч柊锝咁焽瑜旈幆澶愭嚃閳轰礁鐏婇梺闈浥堥弲娑㈠礄閻樺磭绡€濠电姴鍊搁顏嗙磼閵婏箒澹橀棁?
                    pageData.faq_structured_data = this.generateFAQStructuredDataForPage(page.name, lang);
                    
                    // 闂傚倷绀侀幖顐︻敄閸涱垪鍋撳鐓庡缂佽鲸鎹囬獮鎾垛偓娑氼杺L
                    let html = this.buildPage(page.template, pageData);
                    
                    // 闂備礁婀遍崢褔鎮洪妸銉綎濠电姵鑹鹃弸渚€鏌曢崼婵囧窛缂佲偓閸曨垱鐓涢柛鏇ㄥ亞缁犺櫕淇?
                    html = this.translateContent(html, translations);
                    
                    // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪炊瑜忛ˇ銊╂⒑閸涘﹦鈽夐柣掳鍔戦獮?
                    html = this.internalLinksProcessor.processPageLinks(html, page.name, lang);
                    
                    // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒佸創闁荤姵銆塋缂傚倸鍊搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽顐沪闁绘挶鍎茬换娑㈠幢濡桨鍒婇梺?- 缂傚倸鍊风粈渚€藝椤栫偐鈧箑鐣￠幍铏€洪悗鐟版啞閸氬€€a闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈤梺缁樺灱濡嫮鎲撮敃鍌氱閺夊牆澧界粙濠氭煟閿濆鎲炬慨濠冩そ楠炴捇骞掗弬婵勫灪閵囧嫰鏁傞悾灞藉绩閻庢鍣崜鐔风暦閹偊妲鹃梺?
                    html = html.replace(/<meta name="description"[^>]*content="([^"]*)"[^>]*>([^<]*)<meta name="keywords"/g, (match, contentValue, extraText) => {
                        if (extraText && extraText.trim()) {
                            console.log(' Fixed meta description duplicate text');
                            return `<meta name="description" content="${contentValue}">
<meta name="keywords"`;
                        }
                        return match;
                    });
                    
                    // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閸屾凹鍔朚L lang闂備浇顕х换鎺楀磻閻旂厧纾婚柣鎰惈閻?
                    html = html.replace('<html lang="en">', `<html lang="${lang}">`);
                    
                    // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶涘瘜濡啫鈹戦悙鍙夘棡闁告柨绻樺畷鎴﹀箻鐎涙ê顎撻梺浼欑到鐞氼偊宕戦幒鎴旀斀闁绘ɑ鐟ョ€氼剚鎱ㄥ畝鍕厽妞ゆ挾鍠庨崝銈嗐亜?
                    const fullOutputPath = lang === this.defaultLanguage ? page.output : path.join(lang, page.output);
                    html = this.fixStaticResourcePaths(html, fullOutputPath);
                    
                    // 闂傚倷绀侀幉锟犲礉閺嶎厽鍋￠柕澶嗘櫅閻鏌涢埄鍐槈婵☆偅锕㈤弻娑㈠Ψ椤栫偞顎嶅?
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

        // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑?supportedLanguages 闂傚倷绀侀幉锟犳偡椤栨稓顩叉繝濠傛噳閸嬫捇宕归顒冣偓璺ㄢ偓瑙勬磸閸庣敻銆侀弴銏狀潊闁炽儱鍟挎竟鏃堟⒒娴ｈ銇熸繛鐓庢健瀹曟繃鎯旈埦鈧弸鏃堟煙鐎电校閻庢碍纰嶉妵鍕箻椤栨侗鈧棝鏌?
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

        // 婵犵數鍎戠徊钘壝洪敂鐐床闁稿瞼鍋為崑銈夋煏婵炵偓娅呴柛鎴犲█閺屾盯寮撮妸銉ょ敖缂備焦鍞荤粻鎾诲蓟閻旇偐鍙曢柟缁樺笒婵酣姊?
        fs.writeFileSync(
            path.join(outputDir, 'build-report.json'),
            JSON.stringify(buildReport, null, 2)
        );

        // 婵犵數濮伴崹鐓庘枖濞戞氨鐭撻柟缁㈠枛閺勩儲淇婇妶鍛櫤妞ゃ儱鐗婄换娑㈠幢濡搫顫呴梺绋款儐閹稿骞忛崨瀛樺仼閻忕偠顕ф禍鑺ョ節閻㈤潧顫掗柛鏇ㄥ亜琛肩紓鍌欐祰妞存悂鎮烽埡浣烘殾闁挎繂顦介弫鍌炴煕閺囩偟浠涙禍娑㈡⒒娴ｅ憡鍟為悽顖涘浮閹儵鎮℃惔娑掑亾閹烘绀堝ù锝囨嚀閺嗩偅绻涙潏鍓ф偧闁稿簺鍊濋幃楣冩焼瀹ュ棛鍘搁梺绋挎湰绾板秹鎯屽Δ浣虹闁糕檧鏅滅欢娑氱磼?
        this.copyRequiredStaticResources(outputDir);
        
        // 闂傚倸鍊搁崐绋课涘Δ鈧灋婵炲棙鎸搁崹鍌涙叏濡寧纭剧紒鐘冲灩閹叉悂骞嬮敃鈧粈鍌涙叏濡炶浜鹃梺璇″灠鐎氫即鐛€ｎ喗鍊烽棅顐幘鐢稓绱撻崒娆戣窗闁搞劑娼ч悾鐑芥偨闂堟稑鐏?
        this.integratePerformanceMonitoring(outputDir);
        
        // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鍧楀摵閻庢碍纰嶉妵鍕箻椤栨侗鈧棝鏌＄€ｎ亝鍤囨慨濠冩そ椤㈡洟濮€閳哄倐褔鏌ｆ惔銏犳惛闁告柨楠稿嵄闁圭増婢橀～鍛存煟濡吋鏆╅柍瑙勭⊕娣囧﹪鎮欓鍕ㄥ亾濡ゅ懎鏋侀悹鍥ф▕閻?
        this.generateLanguageIndex(outputDir);
        
        // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥ鍡楀箹缂佸墎鍋為幈銊ノ熺拠鎻掝潽闂佹悶鍊栧Λ鍐箖妞嬪簼鐒婂ù锝夋櫜婢规洜绱撻崒姘偓鎼佸疮椤栫偛鍨傜憸鐗堝笚閸嬬喐銇勯弽顐粶闁圭懓鐖奸弻鈩冨緞鐎ｎ亶鍤嬬紓浣稿€搁悧鎾诲蓟閵娿儮妲堟俊顖滃帶椤ｆ椽鎮峰鍕╅柛銉戝拋妲洪梻浣告啞娓氭宕㈡禒瀣？闁瑰墽绮悡鏇熸叏濡厧甯堕柣蹇ョ秮閺屸剝鎷呴棃娑掑亾濠靛绠氶柛鎰靛枛缁€瀣亜閺囩偞鍣规繛鍫佸洦鐓熼柣鏃堫棑濞堥亶鏌涚€ｎ偅宕岄柡?
        this.generateMultiLanguageSitemap(outputDir);
        
        // 闂傚倷绀佸﹢閬嶆偡閹惰棄骞㈤柍鍝勫€归弶鎼佹⒒娴ｅ憡鍟為柛鏃€娲熼獮濠冩償椤垶鏅╅梺褰掑亰閸橀箖鍩㈤弮鍫熺厓鐟滄粓宕滈悢鐓庣疇婵炴垶鍩冮崑鎾斥槈濞呰鲸宀稿畷鎴﹀箻鐠団剝歇婵＄偑鍊戦崕閬嶅箠濡警鍤?
        this.validateContentConsistency(outputDir);
        
        // 闂傚倷绀佸﹢杈╁垝椤栫偛绀夐柡鍤堕姹楅梺鎼炲労閸撴稑鐣垫笟鈧幃褰掑传閸曨剚鍎撻梺杞扮閻栧ジ寮婚妶鍡樼秶闁靛濡囬崣鍡涙⒑閸涘浼曢柛銉ｅ妿閸欏棝姊烘导娆戠？闁烩剝婀?(婵犵數鍋為崹鍫曞箰閹间焦鍋ら柕濞垮労濞撳鏌涚仦鍓х煂闁活厼顦湁闁挎繂娲ら崝瀣煛閸℃绠伴棁澶愭煟濮楀棗鏋涢柛鏃€鐟╅弻鐔哥瑹閸喖顬夐悗鍨緲鐎氼剟鎮惧┑鍫濆К妞ゃ垻鐔佺紓鍌氬€搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽顐沪闁抽攱甯楅妵鍕即濡も偓娴滄儳顪?
        // this.extractAndInlineCriticalCSS(outputDir);

        return buildReport;
    }
    
    // 闂傚倸鍊风欢锟犲磻閸涱垱鏆滈柟鐑樻⒒缁€濠傗攽閻樺弶鎼愮紒鈧崱娑欑厽婵☆垵鍋愮敮娑㈡煟濠靛牆鏋涢柡宀嬬秮閸┾剝绻濋崒娑氫邯缂傚倸鍊哥粔瀵哥矓瑜版帒鏋佺€广儱顦柋鍥ㄧ節闂堟稒顥為柛濠庡灦閺岋絾鎯旈敐搴㈡暞濡炪値鍋勯ˇ鐢稿春閳ь剚銇勯幋顓炲閻庢凹鍙冮幃鈥斥枎閹邦喚顔曟繝銏ｆ硾椤戝棛绮氱捄銊х＜?
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

    // 婵犵數濮伴崹鐓庘枖濞戞氨鐭撻柟缁㈠枛閺勩儲淇婇妶鍛櫤妞ゃ儱鐗婄换娑㈠幢濡搫顫呴梺绋款儐閹稿骞忛崨瀛樺仼閻忕偠顕ф禍鑺ョ節閻㈤潧顫掗柛鏇ㄥ亜椤秹姊洪崫鍕靛剰闁哥噥鍨崇划?
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
                        // 婵犵數濮伴崹鐓庘枖濞戞氨鐭撻柟缁㈠枛閺勩儲淇婇妶鍛櫤闁稿骸瀛╅妵鍕籍閸パ傛睏缂?
                        this.copyDirectory(sourcePath, destPath);
                        console.log(`[OK] Copied directory: ${source}`);
                    } else {
                        // 婵犵數濮伴崹鐓庘枖濞戞氨鐭撻柟缁㈠枛閺勩儲淇婇妶鍛櫣婵☆偅锕㈤弻娑㈠Ψ椤栫偞顎嶅?
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
    
    // 闂傚倸鍊风欢锟犲磻閸涱垱鏆滈柟鐑樻⒒缁€濠傗攽閻樻彃鏆欑紒鍓佸仧閳ь剙绠嶉崕閬嶅箠鎼淬劍鍋傞柟杈鹃檮閻撶喖鏌嶉崫鍕跺伐闁哄绋撶槐?
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

    // 婵犵數濮伴崹鐓庘枖濞戞氨鐭撻柟缁㈠枛閺勩儲淇婇妶鍛伀闁汇倐鍋撻梻浣告啞閻╊垶宕戞繝鍋椽鏁愭径瀣幗闂侀潧顭堥崕閬嶎敂椤撶喓绠剧紒妤€鎼埀顒佺箞閻涱噣鍩€椤掆偓闇夐柨婵嗘处濞呮洟鏌曢崼顐簼缂佺粯绻嗛ˇ鎶芥煕閺傜偛鎳忛～鏇熺箾閸℃ɑ灏伴柣鎺戙偢閺屾盯鈥﹂幋婵囩亪闁汇埄鍨伴崯鍧椻€︾捄銊﹀磯闁惧繐澧ｉ姀銈嗙厱闁冲搫鍋嗗▓婊呪偓娈垮枤閺佸銆侀弮鍫濈妞ゆ巻鍋撻柛鎾愁煼濮婂搫煤缂佹ê鈻忛梺鍛婃煥妤犳悂鍩㈤幘璇茬闁绘ê鍟块悵鏉款渻閵堝棙灏ㄦ俊鐙欏洤鍑犻柛娑樼摠閻撶喖鏌嶉崫鍕跺伐闁哄绋撶槐鎾愁吋閸涱垪鏋岀紓?
    copyRequiredStaticResources(outputDir) {
        console.log('\n Copying required static resources...');
        
        // 闂傚倸鍊搁崐绋棵洪悩璇茬；闁瑰墽绮崑锟犳煛閸ャ劋浜㈤柛蹇撴湰缁绘盯骞撻幒鎾充淮濡ょ姷鍋炵敮鈩冧繆閻戣棄唯妞ゆ柨褰ㄩ埡鍛拺闁告稑锕ょ粭鎺戭熆瑜嶆鎼佸煝閹捐绠ｉ柣妯哄暱閻偊姊洪崨濠冨闁告挻鐩幃銉╂焼瀹ュ棛鍙嗗┑鐐村灦椤洦鏅堕弮鍌滅＜婵°倐鍋撴い锕傛涧閻ｇ兘鎮╃拠鎻掔獩濡炪倖姊婚埛鍫熺缁跺朝bots.txt闂傚倷绀侀幉锛勫垝瀹€鍕仼闁挎洘鏀╠irects闂傚倷鐒︾€笛呯矙閹达附鍎楀ù锝囧劋瀹曟煡鏌″鍐ㄥ妞も晛寮剁换娑㈠箣閻戝棛鍔峰┑鐐茬墛濡炰粙寮诲☉銏犳閻犲洦褰冮‖澶愭⒑闁偛鑻崢鎼佹煠閸愯尙鍩ｇ€殿噮鍋婇獮妯兼嫚閼碱剦鍚呴梻浣筋潐濠㈡ɑ鏅舵惔锝囩焼?
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
        
        // 闂傚倷绀侀幉锟犮€冮崱娑欏殞濡わ絽鍠氶弫鍥╂喐閻楀牆绗掗柣鎰躬閺屾盯骞樺Δ鈧崰姘跺汲椤掑嫭鐓熼柣妯荤懃閸燁偊顢旈鍡欑＜妞ゎ厽鍨靛▍宥夋煛娴ｅ摜效鐎规洜鍘ч埞鎴﹀幢濞嗘ɑ效闂傚倷鑳剁划顖炴偡椤栫偛绀堟繛鍡樻嫴閸ヮ剙鐓涢柛娑卞枛娴犫晠姊虹化鏇燁潑闁告ê澧界划鍫熷緞閹邦厾鍘遍梺闈涳紡閸愬喛绻濋幃褰掑箛椤斿吋鐏堝┑鈽嗗亗缁舵岸宕洪埀顒併亜閹烘垵鈧綊宕崫鍔藉綊鏁愰崨顓ф濠碘剝褰冮…鐑藉蓟濞戙垹绠抽柡鍥╁枔閵嗘劙姊虹化鏇熸珔闁活厼鍊块獮鍐樄闁诡喚鍏橀獮宥夘敊閼恒儳妲ユ繝鐢靛仩閹活亞寰婇悾宀€鐭撻柛顐ｆ礃閸嬵亪鏌涢埥鍡楀箻缂?
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
        
        // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥ鍡楀箹妞ゆ洝椴告穱濠囶敍濮橆厽鍎撳銈嗘肠閸ャ劎鍘介梺闈涱焾閸庨亶鎮橀·绔恉irects闂傚倷绀侀幉锛勫垝瀹€鍕垫晩闁规彃鍎畂ts.txt闂傚倷绀侀幖顐﹀磹缁嬫５娲晲閸涱亝鐎?
        this.generateRedirectsFile(outputDir);
        this.generateRobotsFile(outputDir);
    }

    // 闂傚倸鍊风欢锟犲磻閸涱垱鏆滈柟鐑樻⒒缁€濠傗攽閻樻彃鏆欑紒鍓佸仧閳ь剙绠嶉崕閬嶅箠鎼淬劍鍋傞柟杈鹃檮閻撶喖鏌嶉崫鍕跺伐闁哄绋撶槐?
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

    // 闂傚倸鍊搁崐绋课涘Δ鈧灋婵炲棙鎸搁崹鍌涙叏濡寧纭剧紒鐘冲灩閹叉悂骞嬮敃鈧粈鍌涙叏濡炶浜鹃梺璇″灠鐎氫即鐛€ｎ喗鍊烽棅顐幘鐢稓绱撻崒娆戣窗闁搞劑娼ч悾鐑芥偨闂堟稑鐏?
    integratePerformanceMonitoring(outputDir) {
        console.log('\n Integrating Performance Monitoring System...');
        
        try {
            // 1. 婵犲痉鏉库偓妤佹叏閹绢喗鍎楀〒姘ｅ亾闁诡垯鐒﹀鍕箛椤掑倻鏆犻柣鐔哥矋閸ㄥ灝鐣峰Δ鈧～婊堝焵椤掑嫬绠氶柛鏇ㄥ灠缁狅綁鏌ｉ幇顖氱处缂侇噮鍨跺娲传閸曨偀鍋撶粙妫垫椽鏁愰崨顏呯€婚梺闈涚箞閸婃洟宕ｆ繝鍐︿簻闁哄秲鍔庨。鏌ユ煕鎼粹槄韬柟顔筋殔閳藉鈻嶉褌绨婚柨?
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
            
            // 2. 婵犲痉鏉库偓妤佹叏閹绢喗鍎楀〒姘ｅ亾闁?app.js 闂傚倷绀侀幖顐も偓姘卞厴瀹曡瀵奸弶鎴犵暰婵炴挻鍩冮崑鎾垛偓瑙勬礈婵炩偓鐎规洏鍔戦、姗€鎮㈠畡鏉款棐闂傚倷娴囬鏍磿閹间礁骞㈡俊銈傚亾妤犵偛顑夊娲倻閳哄倹鐝曢梺鎼炲妼婢у酣寮鈧畷婊勬媴閹绘帊澹曢梺姹囧灲濞佳呮暜閸洘鐓?
            const appJsContent = fs.readFileSync(appJsPath, 'utf8');
            if (!appJsContent.includes("import { performanceMonitor } from './performance-monitor.js'")) {
                console.warn('    Warning: app.js does not import performance monitor');
            } else {
                console.log('[OK] app.js includes performance monitor import');
            }
            
            // 3. 闂傚倷绀侀幉锛勬暜濡ゅ啰鐭欓柟瀵稿Х绾句粙鏌熼幑鎰靛殭缂佺姵鍨归幉鎼佸箣閿曗偓缁€鍌涙叏濡炶浜鹃梺璇″灠鐎氫即鐛€ｎ喗鍊烽棅顐幘鐢稒绻濋悽闈涗沪婵炲吋鐟╅、鏍醇閵夛箑鍓ㄥ銈嗙墬缁嬪繑绂嶅鍫熺厽闁靛繒濮甸崯鐐翠繆?
            this.createPerformanceTestPage(outputDir);
            
            // 4. 闂備焦鐪归崹濠氬窗閹版澘鍨傛慨妯挎硾缁犳垹鎲搁幋锕€绀傛慨妞诲亾闁诡垰瀚伴獮瀣倷闊厾甯涢梻鍌欑贰閸犳捇宕濇惔锝嗗闁哄被鍎辩粻顕€鏌曟径鍫濆姕闁?
            this.generatePerformanceDeploymentReport(outputDir);
            
            // 5. 婵犲痉鏉库偓妤佹叏閹绢喗鍎楀〒姘ｅ亾闁诡垯鐒﹀鍕箛椤掑偆妲梻浣筋潐閸庡吋鎱ㄩ妶澶婃辈婵炴垯鍨洪悡娑㈡煕鐏炲墽顣查柣顓燁殕缁?
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

    // 闂傚倷绀侀幉锛勬暜濡ゅ啰鐭欓柟瀵稿Х绾句粙鏌熼幑鎰靛殭缂佺姵鍨归幉鎼佸箣閿曗偓缁€鍌涙叏濡炶浜鹃梺璇″灠鐎氫即鐛€ｎ喗鍊烽棅顐幘鐢稒绻濋悽闈涗沪婵炲吋鐟╅、鏍醇閵夛箑鍓ㄥ銈嗙墬缁嬪繑绂嶅鍫熺厽闁靛繒濮甸崯鐐翠繆?
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
            '                addTestLog("闁?Performance monitor module loaded successfully");',
            '                updateSystemStatus("good", "Monitoring system is available");',
            '                return true;',
            '            } catch (error) {',
            '                addTestLog("闁?Failed to load performance monitor: " + error.message);',
            '                updateSystemStatus("error", "Initialization failed: " + error.message);',
            '                return false;',
            '            }',
            '        }',
            '        window.checkSystemStatus = async function() {',
            '            addTestLog("妫ｅ啯鏁?Checking monitor status...");',
            '            const ok = await initializeMonitoring();',
            '            updateSystemStatus(ok ? "good" : "error", ok ? "System healthy and ready" : "System check failed");',
            '        };',
            '        window.refreshMetrics = function() {',
            '            if (!performanceMonitor) {',
            '                addTestLog("闁?Monitor not initialized. Please run check status first.");',
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
            '                    if (score >= 90) cwvStatus.innerHTML = "<div class=\"alert alert-success\">闁?Good performance score: " + score + "/100</div>";',
            '                    else if (score >= 70) cwvStatus.innerHTML = "<div class=\"alert alert-warning\">闁宠法濯寸粭?Needs improvement: " + score + "/100</div>";',
            '                    else cwvStatus.innerHTML = "<div class=\"alert alert-danger\">闁?Poor performance score: " + score + "/100</div>";',
            '                }',
            '                addTestLog("妫ｅ啯鎯?Metrics refreshed successfully");',
            '            } catch (error) {',
            '                addTestLog("闁?Failed to refresh metrics: " + error.message);',
            '            }',
            '        };',
            '        window.testLongTask = function() {',
            '            addTestLog("妫ｅ唭?Running long task simulation...");',
            '            const start = performance.now();',
            '            while (performance.now() - start < 100) {}',
            '            setTimeout(() => {',
            '                if (performanceMonitor) {',
            '                    const metrics = performanceMonitor.getMetrics();',
            '                    addTestLog("闁?Long tasks detected: " + metrics.longTasksCount);',
            '                }',
            '            }, 500);',
            '        };',
            '        window.testLayoutShift = function() {',
            '            addTestLog("妫ｅ唭?Running layout shift simulation...");',
            '            const testDiv = document.createElement("div");',
            '            testDiv.style.cssText = "height:100px;background:#ffeb3b;margin:10px 0;padding:20px;border-radius:5px;";',
            '            testDiv.textContent = "Temporary block to trigger layout shift";',
            '            document.body.appendChild(testDiv);',
            '            setTimeout(() => {',
            '                testDiv.remove();',
            '                if (performanceMonitor) {',
            '                    const cls = performanceMonitor.getMetric("CLS");',
            '                    addTestLog("闁?Layout shift test complete. CLS: " + (cls !== null ? cls.toFixed(3) : "N/A"));',
            '                }',
            '            }, 1500);',
            '        };',
            '        window.testResourceLoading = function() {',
            '            addTestLog("妫ｅ唭?Running resource loading simulation...");',
            '            const img = new Image();',
            '            img.onload = () => {',
            '                addTestLog("闁?Resource loading test completed");',
            '                if (performanceMonitor) {',
            '                    const metrics = performanceMonitor.getMetrics();',
            '                    addTestLog("闁斥晝娅㈢粭?Resource timings count: " + metrics.resourceTimingsCount);',
            '                }',
            '            };',
            '            img.onerror = () => addTestLog("闁?Resource loading test failed");',
            '            img.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2NiYSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=";',
            '        };',
            '        window.exportData = function() {',
            '            if (!performanceMonitor) {',
            '                addTestLog("闁?Monitor not initialized. Please run check status first.");',
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
            '                addTestLog("妫ｅ啯鎲?Export data has been printed to the browser console");',
            '            } catch (error) {',
            '                addTestLog("闁?Export failed: " + error.message);',
            '            }',
            '        };',
            '        setTimeout(async () => {',
            '            addTestLog("妫ｅ啯鐣?Performance monitor test page loaded");',
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

    // 闂傚倷绀侀崥瀣磿閹惰棄搴婇柤鑹扮堪娴滃綊鏌涢妷顔煎婵☆偅锕㈤弻娑㈠Ψ椤栫偞顎嶅銈嗗姌濡嫰鈥﹂崸妤€閱囬柛鈩冾殔閺嗙喐鎱?
    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    // 闂傚倷绀侀幖顐ょ矓閸洖鍌ㄧ憸蹇撐ｉ幇鐗堟櫢闁绘灏欓ˇ閬嶆⒑閸濆嫮袪闁告柨绉归幃妤咁敊濞村骸缍婇幃鈺呮倻濡鈧劙姊洪棃娑欐悙婵炲眰鍔嶇粋?
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // 闂傚倷绀佸﹢杈╁垝椤栫偛绀夐柡鍤堕姹楅梺鎼炲労閸撴稑鐣垫笟鈧幃褰掑传閸曨剚鍎撻梺杞扮閻栧ジ寮婚妶鍡樼秶闁靛濡囬崣鍡涙⒑閸涘浼曢柛銉ｅ妿閸欏棝姊烘导娆戠？闁烩剝婀?
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
            
            // 闂備礁鎼ˇ顐﹀疾濠婂牆绀夋慨妞诲亾闁靛棔绶氶獮瀣晝閳ь剛绮堥崒鐐寸厵闁诡垱婢樿闂佸搫妫欐穱婕嘢闂傚倷绀佸﹢杈╁垝椤栫偛绀夐柡鍤堕姹楅梺鎼炲労閻忔劗鎲撮崟顒€顎撻柣鐐寸▓閸撴繈鎮?
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
    
    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ澶稿惈缁炬儳銈搁弻鐔煎箚瑜滈崵鐔兼煃瑜滈崜锕傚垂鐠鸿櫣鏆﹂柣妯款嚙閸愨偓闂侀潧顭梽鍕敊瀹ュ鈷?
    generateStructuredData(pageData, lang) {
        // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞閻庯絻鍔嬬花濠氭⒑濮瑰洤鐏╅柟娴嬧偓鎰佹禆闁靛ň鏅滈悡娑樏归敐鍛儓妞わ綀鍋愰埀顒冾潐閹哥兘鎮為敂鍓х煓濠㈣埖鍔﹂弫鍥煟閹邦厼绲绘繛鍫涘劤缁辨捇宕掑▎鎴М缂備胶绮崝妤呭焵椤掆偓閻忔岸鏁冮姀鐘垫殾闁靛鏅╅弫鍐煏閸繃澶勯悘蹇旂箞濮婃椽宕崟闈涘壈闁诲孩鍑归崜娑㈠焵椤掆偓閻忔岸鎮￠垾鎰佸殨妞ゆ劧闄勯崑瀣煕椤愶絿绠橀柕鍫畵濮婄粯鎷呯憴鍕嚒缂備礁顦悥濂稿箖閸ф骞㈡繛鎴炵懄濞呮牠鏌ｈ箛鏇炰哗闁稿鍔欏畷鏉款潨閳ь剟寮诲☉婊呯杸闁规崘娉涢。瑙勭節閻㈤潧浠滄繛宸弮楠?
        if (pageData.structured_data && typeof pageData.structured_data === 'object') {
            // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閻樺弶鎼愮紒鈧径鎰厪濠电姴绻楅崥鍌炴煕鐎ｎ偅灏伴柟宄版嚇瀹曨偊濡烽敂钘夋灆濠?
            const configStructuredData = { ...pageData.structured_data };
            configStructuredData.url = pageData.canonical_url || configStructuredData.url;
            configStructuredData.name = pageData.page_title || configStructuredData.name;
            configStructuredData.description = pageData.description || configStructuredData.description;
            configStructuredData.inLanguage = lang;

            // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閻樺弶鎼愮紒顐㈢Ч閺屾洘寰勫☉銏☆€嶉梺绯曟櫅閸婃悂鍩ユ径鎰闁惧浚鍋呴崕鎾剁磽閸屾氨孝妞ゆ垵顦悾宄邦煥閸愭儳鎮戦梺绯曞墲閿曨偆妲愬鑸碘拺?
            configStructuredData.dateModified = new Date().toISOString().split('T')[0];

            return this.buildStructuredDataPayload(configStructuredData, pageData, lang);
        }

        // 闂傚倷鐒﹂幃鍫曞磿閹惰棄纾婚柕鍫濐槸閻掑灚銇勯幋锝嗩棄濞存粓绠栧娲川婵犲倻鐟插┑鐘灪閿曘垽骞冮姀銈呯劦妞ゆ帒瀚悡娑㈡煕椤愵偄浜滃褎澹嗙槐鎺楊敊閸濆嫬顫囬悗娈垮枟閹倸鐣烽悢纰辨晝闁靛繆鏅涘▓顓㈡⒒娴ｈ姤銆冮柤瀹犲煐閺呰泛螖閳ь剟鎮?
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

        // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞闁归偊鍓欏宄邦渻閵堝棛澧柤鐟板⒔閹叉挳鏁冮崒娑樷偓鍨殽閻愯尙浠㈤柣蹇旂叀閺屾洟宕卞Δ濠冣枅濠碘槅鍋勯崯鎾晲閻愪警鏁婇柛鎾楀本啸濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒佹儓缁绢厸鍋撴繝娈垮枟閿曗晠宕滈敃鍌氳Е闁稿瞼鍋為悡鐔镐繆閵堝懎鏆為柛銈傚亾闂備椒绱紞浣虹不閺嶎厼绠氶柛鎰靛枛缁€瀣亜閹捐泛校閻忓繑绻堝娲传閸曢潧鍓伴柣搴㈠嚬閸撴盯鍩€椤掆偓閻忔岸鎮￠垾鎰佸殨妞ゆ劧闄勯崑瀣煕椤愶絿绠橀柕?
        if (pageData.canonical_url.includes('/blog/') && !pageData.canonical_url.includes('/blog/category/') && !pageData.canonical_url.includes('/blog/tag/')) {
            // 闂備礁鎼ˇ顐﹀疾濠婂牊鍋￠柨鏇楀亾閸楅亶鏌涘☉姗堝姛闁崇粯妫冮弻宥堫檨闁告挻姘ㄧ划娆愬緞閹板灚鏅滈梺鍛婃处閸嬪嫮娆㈤鐣岀閺夊牆澧界粙濠氭煙閸涘﹤鍔ら柍缁樻崌楠炲鏁冮埀顒傛兜閳ь剙鈹戦鏂や緵闁告搫绠撳畷銉╁磼閻愬鍘搁梺绋挎湰绾板秴顔忓┑瀣厽?
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

        // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞闁归偊鍓欏宄邦渻閵堝棛澧柤鐟板⒔閹叉挳鏁冮崒娑樷偓鍨殽閻愯尙浠㈤柣蹇ｅ櫍閺屾稓浠︾拠鎻掝瀳濡炪倖娲╃紞浣割嚕閹绢噯缍栨い鎴ｆ娴滄儳顭块懜闈涘妞?
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

    // 婵犵數鍋為崹鍫曞箲娴ｅ壊娴栭柕濞р偓閸嬫捇妫冨☉姘变紘缂備浇椴哥敮锟犵嵁濡皷鍋撻悽鐢点€婇柛瀣崌椤㈡盯鎮欓懠顒夋Ш闂備礁鎼粔鏌ュ礉瀹ュ應鏋旈柛顐ｆ礃閻撴瑩鎮归崶锝傚亾閾忣偆褰庢繝纰夌磿閾忓酣宕抽敐鍛殾婵犻潧顑嗛崑鍡樻叏閹烘梹鍎揳dcrumb闂傚倷鐒︾€笛呯矙閹达箑瀚夋い鎺戝暔娴滅懓銆掑锝呬壕閻庤娲╃换婵嗙暦閸洖惟闁挎洍鍋撳ù鐘灮缁辨挻鎷呮搴樻晙闂佹悶鍔忓畷鐢稿礆閹烘惟闁宠桨绀侀崵鎴濃攽閻樿宸ラ柛鐕佸亞閹峰寮婚妷锕€浠梺鎼炲劗閺呮繄鏁☉銏＄厓?
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

    // 闂備焦鐪归崹濠氬窗閹版澘鍨傛慨妯垮煐椤ュ牓鏌曡箛鏇炐㈤柣锕€鐖奸幃姗€鎮欓弶鎴犱患缂備緡鍠撻崝鎴濐嚕閹间礁绀嬫い鎰╁焺閸ゆ瑩姊烘潪鎷屽厡濠⒀勵殔閻?
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

    // URL闂傚倷鑳剁划顖炪€冮崨顒兼椽鏁冮崒銈嗘櫓闁诲繒鍋熼崑鎾存叏濠婂嫨浜滈柟鍝勬娴滈箖鎮峰鍕€滈悘蹇旂懇楠炲繘鎮╅悽鐢碉紲濠碘槅鍨抽崢褔鎮樻潏銊ょ箚?
    humanizeSegment(segment) {
        return String(segment || '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    }

    // 闂傚倷绀佸﹢閬嶁€﹂崼銉嬪洭鎮界粙璇俱儱顭块懜闈涘妞ゃ儱鐗撻弻鏇＄疀鐎ｎ亞浠鹃梺鍝勬噺閹倿寮婚悢琛″亾濞戞姘跺磻閹捐绠靛ǎ鍥ｅ亾缂傚倸鍊搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽顐粶缂佲偓瀹€鍕厸鐎广儱鍟俊鑺ョ箾閸繄鍩ｉ柡?
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

    // 闂傚倷绀侀幖顐ょ矓閻戞枻缍栧璺猴功閺嗐倕銆掑锝呬壕濠殿喖锕ら…鐑姐€佸▎鎾崇鐟滃酣骞夋导瀛樷拻濞达綀顕栭崕銉╂煕閻樺磭澧垫い銏″哺椤㈡岸鍩€椤掑嫬绠栧ù鐘差儐閸嬪嫮绱掔€ｎ厽纭跺ù婊庢瀸AQ JSON-LD
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

    // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶涘瘜濡啫鈹戦悙鍙夘棡闁告柨绻樺畷鎴﹀箻鐎涙ê顎撻梺浼欑到鐞氼偊宕戦幒鎴旀斀闁绘ɑ鐟ョ€氼剚鎱ㄥ畝鍕厽妞ゆ挾鍠庨崝銈嗐亜?
    fixStaticResourcePaths(html, outputPath) {
        // 闂備浇宕垫慨宕囨閵堝洦顫曢柡鍥ュ灪閸嬧晛鈹戦悩宕囶暡闁稿骸娴风槐鎺斺偓锝庡亽閸庛儵鏌涢妶鍥р枅闁诡喛顫夌粭鐔碱敍濮樺彉鍝楃紓鍌欑婢у酣宕戝☉婊冪倒闂備礁鎲￠〃鍫ュ磻濞戙埄鏁?- 闂傚倷绀侀幖顐ょ矓閺夋嚚娲Χ婢跺﹪妫峰銈嗙墱閸嬫稓绮堝畝鍕厸鐎广儱楠告晶浼存煟閺傛寧鍣介柍褜鍓欓悘姘熆濡皷鍋撳鐓庡⒋鐎规洝顫夐幆鏃堝Ω閿旇瀵楅梻浣告惈閸燁偊宕戦崱娑樼？濠电姴鍊靛Σ鍫ユ煙閹规劖纭鹃柛鏂款儐閵囧嫰骞掗幘鍓佺厜閻庢鍣崜娆撯€﹂妸鈺佺妞ゆ帊鑳堕妶?
        const normalizedPath = outputPath.replace(/\\/g, '/');
        const depth = normalizedPath.split('/').length - 1;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        
        // 濠电姷鏁搁崑娑⑺囬銏犵鐎广儱顦粈鍫澝归悡搴ｆ憼闁哄拋鍓氶幈銊ヮ潨閸℃绠归梺璇茬箰椤︻垶婀侀梺缁樼憿閸嬫捇鏌涢幘瀵告噰鐎规洘鐟╅弫宥夊礋椤撶媴绱查梻濠庡亜濞诧箓骞愭繝姘卞彆妞ゆ帒瀚悡娑㈡倵閿濆簼绨绘い蹇婃櫇缁辨捇宕掑☉娆忛瀺濠电偟鍘ч…宄扮暦閸洖鐓橀柣鎰靛墰閸樻儳鈹戦悙鏉戠仸闁瑰皷鏅犲畷锝夊焵椤掍降浜滈柡鍐ｅ亾婵炲弶绮庡Σ鎰板籍閸偅鏅╅梺鐓庮潟閸婃洟寮查埡浣叉斀妞ゆ梻鏅粻鎵磼閹绘帗鍋ラ柛銊﹀劤椤粓鍩€椤掑嫬绠氶柛鎰靛枛缁€瀣亜閺傚灝鈷旈柛鐐存尦閹宕归锝囧嚒闁诲孩鍑归崜婵嬪Φ閹邦厼绶為柟閭﹀幘閸樻帡妫呴銏″偍闁稿骸纾划?
        // 闂備礁鎼ˇ顐﹀疾濠婂牊鍋￠柍鍝勬噹闂傤垶鏌ｉ幋锝嗩棄闁活厽顨嗛妵鍕疀閹捐櫕娈查梺鍛婄懃缁绘劙鈥︾捄銊﹀磯闁惧繐澧ｈ閺屾稓鈧綆浜濋崳铏圭磼閸屾氨孝闁宠棄顦灒濡わ附顑欓崬褰掓⒒娴ｅ搫甯堕柛妯荤墱閸掓帒鈻庨幇顕呮祫闂佸綊鍋婇崜锕傛偂閸洜鍙撻柛銉ｅ妽缁€鍐煟閿濆牅鍚柣銉邯椤㈡顦插褎澹嗙槐鎺擃潙閺嶏箓鍋楅梺璇″灠缁夌敻骞忛崨瀛樺仼鐎光偓閳ь剟宕幘顔藉€?
        
        // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€鐭楀璺虹焾濞村嫰鏌ｉ悩杈╊槮缁剧虎鍘剧划鏃堝锤濡や讲鎷哄銈嗗笂缁垛€斥枔濮椻偓閺岋繝宕辫箛鎾插闂傚倷鐒﹂惇褰掑礉瀹€鈧埀顒佸嚬閸ｏ綁宕规ィ鍐ㄥ唨妞ゆ劑鍊楅敍婵嬫⒑閸濆嫮鈻夐柛瀣瀹曞綊鎯岄悿鐠栭梻浣藉吹婵磭鎷冮敃鍌氬瀭闁规鍠楅?
        html = html.replace(
            /href="css\/main\.css"/g,
            `href="${prefix}css/main.css"`
        );
        
        // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€鐭楀璺虹焾濞村嫰鏌ｉ悩杈╊槮缁剧虎鍘剧划鏃堝锤濡や讲鎷哄銈嗗笂缁垛€斥枔濮椻偓閺岋繝宕辫箛鎾插闂傚倷鐒﹂惇褰掑礉瀹€鈧埀顒佸嚬閸ｏ綁宕规ィ鍐ㄥ唨妞ゆ劑鍊楅敍婵嬫⒑閸濆嫮鈻夐柛瀣瀹曞綊鎯岀粵顪糰Script闂備浇宕垫慨宕囨媰閿曞倸鍨傞柟娈垮枟椤? 
        html = html.replace(
            /src="js\/app\.js"/g,
            `src="${prefix}js/app.js"`
        );
        
        // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€鐭楀璺虹焾濞村嫰鏌ｉ悩杈╊槮缁剧虎鍘剧划鏃堝锤濡や讲鎷哄銈嗗笂缁垛€斥枔濮椻偓閺岋繝宕辫箛鎾插闂傚倷鐒﹂惇褰掑礉瀹€鈧埀顒佸嚬閸ｏ綁骞冨▎鎾冲嵆闁绘ê鍟块悵浼存⒑閻熼偊鍤熼柛瀣仱閹顢欏ù搴＄秺閹晠宕橀幓鎺懶﹂梻浣规た閸樹粙宕曢幎绛嬫晪?
        html = html.replace(
            /href="locales\/en\/translation\.json"/g,
            `href="${prefix}locales/en/translation.json"`
        );
        html = html.replace(
            /href="locales\/zh\/translation\.json"/g,
            `href="${prefix}locales/zh/translation.json"`
        );
        
        // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶堝劤椤㈠懎鈹戦鏂や緵闁告搫绠撳畷銉╁磼閻愬鍘遍梺褰掑亰閸撴岸宕崇憴鍕╀簻闁哄啠鍋撻柛鏃€鐗滅划娆愬緞閹板灚鏅ｉ梺缁樏壕顓㈠汲閻樼粯鈷戦柟鑲╁仜閸旀艾顭胯婵倝寮查崼鏇炲唨妞ゆ劧绲界壕顖氼渻閵堝棛澧慨妯稿妿缁綁鎮欓悜妯煎弳濠电偞鍨堕…鍥ㄦ櫠閿曞倹鐓曢柨婵嗘噺閹叉悂鏌熼懠顒€顣肩紒妤冨枑缁绘繈宕熼鐘茬倞婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶堝劤閸婄偤姊洪崨濠冨瘷闁告劗鍋撳В鍫ユ⒒娴ｅ憡鎯堥悗姘煎墯閺呰埖绂掔€ｎ€附鎱ㄥΟ鍨厫闁抽攱甯楅妵鍕即濡も偓娴滄儳顪冮妶蹇曠ɑ闁哄宕靛Σ?
        // 闂?../images/ 婵犵數鍎戠徊钘壝归崒鐐茬獥婵°倕鎷嬮弫鍡樼節婵犲倸顏柍缁樻閺岋綁骞嬮悜鍥︾返闂佸憡鏌￠崑鎾剁磽娴ｉ缚妾搁柛娆忛叄瀹曟澘顫濋鑺ョ亖闂佺鎻梽鍕磿鎼达絿纾奸悗锝庡亽閸庛儵鏌涢妶鍥р枅闁诡喛顫夌粭鐔碱敍濮樺彉鍝楃紓?
        html = html.replace(
            /src="\.\.\/(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );
        
        // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶堝劤椤㈠懎鈹戦鏂や緵闁告搫绠撳畷銉╁磼閻愬鍘搁梺绋挎湰绾板秴顔忓┑瀣厽婵犻潧顑嗛弫杈╃磼鐎ｎ亶妯€妞ゃ垺锕㈤幃鈺佺暦閸ャ劍顔忛梻鍌欑劍閹爼宕曟潏銊︽珷闁兼亽鍎插▍鐘绘煛瀹ュ骸浜濈€规洖顦伴妵鍕冀閵婏妇娈ょ紓浣瑰姉閸嬨倝寮婚妸銉㈡婵☆垳鍘ч埅鍗炩攽閻愭潙绲绘繛纭风節閻?images/ 闂傚倷绀侀幉锛勬暜閻愬瓨娅犳俊銈呮媼閺佸棙绻濇繝鍌涘櫤闁稿繑绮嶉妵鍕籍閸屾矮澹曢梺浼欑秮娴滃爼寮婚敐澶婄厸闁告劕澧介崝绋款渻閵堝棙澶勯柛鐘冲哺楠炴垿宕熼锝嗘櫖濠殿喗顭堟禍顒勬偘椤曗偓閺?
        // 闂傚倷绀侀幉锟犮€冮崱娑欏殞濡わ絽鍠氶弫鍥╂喐閻楀牆绗掓俊顐ｏ耿閺屾盯濡烽姀鈩冪彇閻熸粍婢樺鈥愁潖濞差亶鏁冮柨婵嗙墕椤ユ繈姊虹紒妯煎ⅹ闁绘牜鍘ч悾?zh/blog/ 闂傚倷鑳堕崕鐢稿疾閳哄懎绐楅柡宥庡亞缁€濠勨偓骞垮劚濡盯鍩㈤弮鍫熷€甸柨婵嗘噹椤ｅ磭绱掗埀顒佸緞閹邦厸鎷婚梺鎼炲劵缁茶姤绂嶆ィ鍐╃厽?../../images/
        html = html.replace(
            /src="(images\/[^"]+)"/g,
            `src="${prefix}$1"`
        );

        return this.normalizeInternalAnchorHrefs(html);
    }
    
    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鎸庣【闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閳ь剟鎮楃憴鍕８闁稿孩濞婇崺鈧い鎺嗗亾缂佺姴绉瑰畷纭呫亹閹烘垼鍩為柣搴ｆ暩绾爼宕戦幘璇叉嵍妞ゆ挾鍣ユ禒褏绱撴担浠嬪摵闁荤啿鏅犻獮濠囨偄閸涘﹦绉堕梺闈涱煭婵″洭鍩€椤掑娅嶉柡宀嬬到铻栭柍褜鍓熼幃褎绻濋崒锕佲偓鍧楁偨椤栵絽鏋ょ紒?
    generateRootBlogContent(outputDir, config, englishTranslations) {
        console.log(' Generating root directory blog content...');
        
        // 闂傚倷绀侀幉锛勬暜濡ゅ啰鐭欓柟瀵稿Х绾句粙鏌熼幑鎰靛殭闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閳ь剟鎮楃憴鍕８闁稿孩濞婇崺鈧い鎺嗗亾缂佺姴绉瑰畷鍦嫚鐟佷焦妞介獮蹇曚沪鐠佽櫕鐫?
        const rootBlogDir = path.join(outputDir, 'blog');
        fs.mkdirSync(rootBlogDir, { recursive: true });
        
        // 闂傚倷绀侀幉锛勬暜濡ゅ啰鐭欓柟瀵稿Х绾句粙鏌熼幑鎰靛殭缁绢厸鍋撴繝娈垮枟閿曗晠宕滈敃鍌氳Е闁稿瞼鍋為崐鍨箾閹寸偟鎳冨┑顔碱槹缁绘盯宕ｆ径濠庘偓婊堟煏?
        const blogSubDirs = ['category', 'tag'];
        blogSubDirs.forEach(subDir => {
            fs.mkdirSync(path.join(rootBlogDir, subDir), { recursive: true });
        });
        
        // 闂傚倷绀侀崥瀣磿閹惰棄搴婇柤鑹扮堪娴滃綊鏌涢妷顔煎缂佺姰鍎甸弻宥堫檨闁告挾鍠庨锝夊垂椤愩垻绐炴繝鐢靛Т閸婂€燁杺闂備浇顕ф鍝ョ不瀹ュ鍨傞悹鍥梿鐟欏嫬绶為柟閭﹀墰椤ρ囨⒑绾懏纭炬い顐ｆ礋閸┾偓妞ゆ巻鍋撴い锕傛涧铻?
        const blogPages = config.pages.filter(page => 
            page.output.startsWith('blog/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`   Found ${blogPages.length} blog pages to generate at root level`);
        
        // 婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸庡﹪鏌嶉埡浣告殶闁崇粯姊归妵鍕疀閹炬剚浠奸柣鐔哥懕缁犳捇骞冨Δ鍛祦闁割煈鍠氭导鍫ユ⒑闂堟稒顥滄い锕傛涧铻為柛鎰靛枛椤懘鏌曡箛濠傚⒉婵炲懌鍨藉娲偡閹殿喗鎲奸梺鍛婃⒐閻楃娀骞冭楠炴﹢顢欓挊澶婂婵＄偑鍊栧Λ渚€宕戦幇顔剧煋闁秆勵殕閻撶喐淇婇妶鍌氫壕闂佺粯顨呴敃銈夋晝?
        for (const page of blogPages) {
            try {
                // 闂傚倷绀侀幉锟犲垂闂堟党娑樜旈崥钘夋喘椤㈡宕熼銏犳暏闂備線娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閳ь剟鎮楃憴鍕８闁稿孩濞婇崺鈧い鎺嗗亾缂佺姴绉瑰畷瑙勭鐎ｎ€儱顭块懜闈涘妞ゃ儱鐗撻弻鏇＄疀婵犲倸鈷夊┑鐐茬墕閻栧ジ寮?
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                rootPageData.current_key = rootPageData.current_key || '';
                rootPageData.current_name = rootPageData.current_name || '';
                
                // 闂備浇宕垫慨鎾敄閸涙潙鐤い鏍仜濮规煡鏌ㄥ┑鍡╂Ц闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閳ь剟鎮楃憴鍕８闁稿孩濞婇崺鈧い鎺嗗亾缂佺姴绉瑰畷瑙勭鐎ｎ€儱顭块懜闈涘妞ゃ儱鐗撻弻鏇＄疀鐎ｎ亞浠鹃梺浼欑秮娴滃爼骞冪憴鍕懝妞ゆ牗姘ㄦ禒鈺冪磽?
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                
                // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閸屾嚎浜糿onical URL婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸嬪鏌熺紒銏犳灍闁稿骸瀛╅妵鍕籍閸パ傛睏缂備礁顦锟犲蓟閿濆憘鏃堝焵椤掑嫭鍋嬪┑鐘插亰閼?
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/blog/', '/blog/');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢悙鎻掝暪eflang闂傚倷娴囧銊╂嚄閼稿灚娅犳俊銈傚亾闁?
                rootPageData.base_url = 'https://screensizechecker.com';
                const blogPath = page.output.replace('blog/', '/blog/');
                rootPageData.page_path = blogPath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                rootPageData.hreflang_pt_url = `https://screensizechecker.com/pt${rootPageData.page_path}`;
                
                // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪礋椤撶媭妲遍梻浣告惈鐎氼剛鎹㈤幒鎳?
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
                
                // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顔芥毄缁炬儳銈搁弻鐔煎箚瑜滈崵鐔兼煃瑜滈崜锕傚垂鐠鸿櫣鏆﹂柣妯款嚙閸愨偓闂侀潧顭梽鍕敊瀹ュ鈷?
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');
                
                // 闂傚倷绀侀幖顐︻敄閸涱垪鍋撳鐓庡缂佽鲸鎹囬獮鎾垛偓娑氼杺L
                let html = this.buildPage(page.template, rootPageData);
                
                // 闂備礁婀遍崢褔鎮洪妸銉綎濠电姵鑹鹃弸渚€鏌曢崼婵愭Ч闁搞倖鍔欏鍫曞醇濞戞ê顬夐梺璇插瘨閸犳氨妲愰幘璇查唶闁绘柨澹婂锟犳⒑?
                html = this.translateContent(html, englishTranslations);
                
                // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪炊瑜忛ˇ銊╂⒑閸涘﹦鈽夐柣掳鍔戦獮?
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶涘瘜濡啫鈹戦悙鍙夘棡闁告柨绻樺畷鎴﹀箻鐎涙ê顎撻梺浼欑到鐞氼偊宕戦幒鎴旀斀闁绘ɑ鐟ョ€氼剚鎱ㄥ畝鍕厽妞ゆ挾鍠庨崝銈嗐亜?
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 闂傚倷绀侀幉锟犲礉閺嶎厽鍋￠柕澶嗘櫅閻鏌涢埄鍐槈婵☆偅锕㈤弻娑㈠Ψ椤栫偞顎嶅?
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
    
    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鎸庣【闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆婢跺浜滈柡鍐ｅ亾婵炲弶锚椤曘儵宕熼姘卞€炲銈嗗灴閺侇噣宕戦幘鏉戠窞闁归偊鍙庡Λ鍐渻閵堝骸浜介柛鐘虫皑缁牓宕熼娑氬幘闂佸搫瀚换姗€宕ú顏呯厸閻庯綆浜滈弳锝夋煙椤斻劌娲ら柋鍥煟閺傛寧鍟為悗姘▕閺?
    generateRootDevicePages(outputDir, config, englishTranslations) {
        console.log(' Generating root directory device pages...');
        
        // 闂傚倷绀侀幉锛勬暜濡ゅ啰鐭欓柟瀵稿Х绾句粙鏌熼幑鎰靛殭闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆婢跺浜滈柡鍐ｅ亾婵炲弶锚椤曘儵宕熼姘卞€為梺鍐叉惈閸婂鎮伴妷鈺傚仭?
        const rootDevicesDir = path.join(outputDir, 'devices');
        fs.mkdirSync(rootDevicesDir, { recursive: true });
        
        // 闂傚倷绀侀崥瀣磿閹惰棄搴婇柤鑹扮堪娴滃綊鏌涢妷顔煎缂佺姰鍎甸弻宥堫檨闁告挾鍠庨锝夊垂椤愩垻绐為柟鍏兼儗閸犳牠寮查鐔虹瘈闁靛骏绲剧涵鐐箾瀹割喖寮┑鈥崇摠瀵板嫰骞囬褎顥?
        const devicePages = config.pages.filter(page => 
            page.output.startsWith('devices/') && 
            (!page.enabled_languages || page.enabled_languages.includes('en'))
        );
        
        console.log(`   Found ${devicePages.length} device pages to generate at root level`);
        
        // 婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸庡﹪鏌嶉埡浣告殶闁崇粯姊归妵鍕疀閹惧銈╅梺鍝ュ枎妤犳悂鈥︾捄銊﹀磯闁绘垶锚閺嬬娀姊洪棃娑欘棞妞わ箓娼ц灋闁告劦鍠栭～鍛存煏韫囧﹤澧叉繛鍛灲濮婃椽鎮烽幍顔芥喖闂佸憡姊归悧鐘诲箖瑜旈獮姗€顢欓挊澶婂婵＄偑鍊栧Λ渚€宕戦幇顔剧煋闁秆勵殕閻撶喐淇婇妶鍌氫壕闂佺粯顨呴敃銈夋晝?
        for (const page of devicePages) {
            try {
                // 闂傚倷绀侀幉锟犲垂闂堟党娑樜旈崥钘夋喘椤㈡宕熼銏犳暏闂備線娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆婢跺浜滈柡鍐ｅ亾婵炲弶锚椤曘儵宕熼姘卞€炲銈嗗灴閺侇噣宕戦幘鏉戠窞闁归偊鍙庡Λ鍐⒑闂堟稓绠氶柛鎾寸箓閳绘捇宕奸弴鐔哄幍?
                const rootPageData = {
                    lang: 'en',
                    lang_prefix: '',
                    lang_code: 'EN',
                    page_content: page.page_content,
                    ...page.config
                };
                rootPageData.current_key = rootPageData.current_key || '';
                rootPageData.current_name = rootPageData.current_name || '';
                
                // 闂備浇宕垫慨鎾敄閸涙潙鐤い鏍仜濮规煡鏌ㄥ┑鍡╂Ц闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆婢跺浜滈柡鍐ｅ亾婵炲弶锚椤曘儵宕熼姘卞€炲銈嗗灴閺侇噣宕戦幘鏉戠窞闁归偊鍙庡Λ鍐⒑闂堟稓绠為柛銊︽そ閹箖鏌嗗鍡椾化婵炴挻鍑归崹浼存倶閻樼數纾?
                rootPageData.css_path = '../css';
                rootPageData.locales_path = '../locales';
                rootPageData.js_path = '../js';
                rootPageData.home_url = '../index.html';
                rootPageData.blog_url = this.generateBlogUrl(1, 'en', true);
                rootPageData.privacy_policy_url = '../privacy-policy.html';
                rootPageData.device_links_base = '';
                
                // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閸屾嚎浜糿onical URL婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸嬪鏌熺紒銏犳灍闁稿骸瀛╅妵鍕籍閸パ傛睏缂備礁顦锟犲蓟閿濆憘鏃堝焵椤掑嫭鍋嬪┑鐘插亰閼?
                if (rootPageData.canonical_url) {
                    rootPageData.canonical_url = rootPageData.canonical_url.replace('/en/devices/', '/devices/').replace('.html', '');
                    rootPageData.og_url = rootPageData.canonical_url;
                }
                
                // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢悙鎻掝暪eflang闂傚倷娴囧銊╂嚄閼稿灚娅犳俊銈傚亾闁?
                rootPageData.base_url = 'https://screensizechecker.com';
                const devicePath = page.output.replace('devices/', '/devices/');
                rootPageData.page_path = devicePath.replace('.html', '');
                rootPageData.hreflang_root_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_en_url = `https://screensizechecker.com${rootPageData.page_path}`;
                rootPageData.hreflang_zh_url = `https://screensizechecker.com/zh${rootPageData.page_path}`;
                rootPageData.hreflang_de_url = `https://screensizechecker.com/de${rootPageData.page_path}`;
                rootPageData.hreflang_es_url = `https://screensizechecker.com/es${rootPageData.page_path}`;
                rootPageData.hreflang_pt_url = `https://screensizechecker.com/pt${rootPageData.page_path}`;
                
                // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪礋椤撶媭妲遍梻浣告惈鐎氼剛鎹㈤幒鎳?
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

                // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢悙鑼攽:image闂傚倷绀侀幉锛勫垝瀹€鍕垫晩闁?locale
                rootPageData.og_image = 'https://screensizechecker.com/images/og-default.png';
                rootPageData.og_locale = 'en_US';

                // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顔芥毄缁炬儳銈搁弻鐔煎箚瑜滈崵鐔兼煃瑜滈崜锕傚垂鐠鸿櫣鏆﹂柣妯款嚙閸愨偓闂侀潧顭梽鍕敊瀹ュ鈷?
                rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');

                // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顕呮毌闁稿鎸婚幏鍛村礃椤垶顥嶉梻浣虹《閺呮盯骞婂鈧獮鍐煛閸涱喖娈濈紒鍓у閿氬ù婊勫劤闇夐柨婵嗘噺鐠愶繝鏌涢妸銉ｅ仮闁?
                const pagePath = page.output || '';
                rootPageData.is_home = pagePath === 'index.html' || pagePath === '';
                rootPageData.is_blog = false;
                const isToolPage = pagePath.includes('calculator') || pagePath.includes('compare') || pagePath.includes('tester') || pagePath.includes('resolution');
                const isDevicePage = pagePath.includes('iphone') || pagePath.includes('android') || pagePath.includes('ipad');
                rootPageData.is_tools = isToolPage;
                rootPageData.is_devices = isDevicePage;
                
                // 婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸嬪鎮楅崷顓炐ラ柣銈傚亾闂備礁鎲￠崝鎴﹀礉鐎ｎ剚顫曢柨婵嗩槹閻撴洟鐓崶銊︾闁告ɑ鎸抽弻鏇㈠幢濡ゅ﹥鈻堝┑鈽嗗亜閸熷瓨鎱ㄩ埀顒勬煃閳轰礁鏆炴繛鍫燂耿濮婅櫣绮欓幐搴ｎ洶濠碘€冲⒔椤╃瓐缂傚倸鍊搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽顐粶缂佲偓瀹€鍕厸鐎广儱鍟俊鑺ョ箾閸繄鍩ｉ柡宀€鍠撻幏鐘诲灳閾忣偆褰茬紓鍌欐祰妞村摜鎹㈤崼銉у祦闁规崘顕х粻娑欍亜閹哄棗浜剧紒鎯у⒔閻栴棲RP闂備浇顕ч柊锝咁焽瑜旈幆澶愭嚃閳轰礁鐏婇梺闈浥堥弲娑㈠礄閻樺磭绡€濠电姴鍊搁顏嗙磼閵婏箒澹橀棁?
                rootPageData.faq_structured_data = this.generateFAQStructuredDataForPage(page.name, 'en');
                
                // 闂傚倷绀侀幖顐︻敄閸涱垪鍋撳鐓庡缂佽鲸鎹囬獮鎾垛偓娑氼杺L
                let html = this.buildPage(page.template, rootPageData);
                
                // 闂備礁婀遍崢褔鎮洪妸銉綎濠电姵鑹鹃弸渚€鏌曢崼婵愭Ч闁搞倖鍔欏鍫曞醇濞戞ê顬夐梺璇插瘨閸犳氨妲愰幘璇查唶闁绘柨澹婂锟犳⒑?
                html = this.translateContent(html, englishTranslations);
                
                // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪炊瑜忛ˇ銊╂⒑閸涘﹦鈽夐柣掳鍔戦獮?
                html = this.internalLinksProcessor.processPageLinks(html, page.name, 'en');
                
                // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶涘瘜濡啫鈹戦悙鍙夘棡闁告柨绻樺畷鎴﹀箻鐎涙ê顎撻梺浼欑到鐞氼偊宕戦幒鎴旀斀闁绘ɑ鐟ョ€氼剚鎱ㄥ畝鍕厽妞ゆ挾鍠庨崝銈嗐亜?
                html = this.fixStaticResourcePaths(html, page.output);
                
                // 闂傚倷绀侀幉锟犲礉閺嶎厽鍋￠柕澶嗘櫅閻鏌涢埄鍐槈婵☆偅锕㈤弻娑㈠Ψ椤栫偞顎嶅?
                const outputPath = path.join(outputDir, page.output);
                fs.writeFileSync(outputPath, html);
                console.log(`[OK] Generated root device page: ${page.output}`);
                
            } catch (error) {
                console.error(`[ERROR] Failed to generate root device page ${page.output}:`, error.message);
            }
        }
        
        console.log('[OK] Root directory device pages generated');
    }

    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鍧楀摵閻庢碍纰嶉妵鍕箻椤栨侗鈧棝鏌＄€ｎ亝鍤囨慨濠冩そ椤㈡洟濮€閳哄倐褔鏌ｆ惔銏犳惛闁告柨楠稿嵄闁圭増婢橀～鍛存煟濡吋鏆╅柍瑙勭⊕娣囧﹪鎮欓鍕ㄥ亾濡ゅ懎鏋侀悹鍥ф▕閻?
    generateLanguageIndex(outputDir) {
        console.log('\n Generating root English page and language selection...');
        
        // 闂備浇顕у锕傦綖婢舵劖鍎楁い鏂垮⒔娑撳秹鏌ｉ弬娆炬疇闁哥喎鎳橀弻鐔虹磼濡櫣鐟查梺绋垮閻熲晠寮婚敐澶涚稏妞ゆ巻鍋撳┑鈩冨缁绘盯宕奸悢椋庝患闂佸綊顥撴繛鈧い銏★耿閸╋箓鍩€椤掑嫬鍑犻柛娑樼摠閻撱儲绻涢幋鐑嗙劷濠⒀勬礈閹叉悂骞庢繝鍌涙悙閻庢艾顦…璺ㄦ崉濞差亶鈧銇勮箛搴″祮闁哄矉绻濆畷鎺戭潩椤撶喐鍊烽梻浣哥秺椤ユ挻鏅跺Δ鍐煓濠㈣埖鍔﹂弫鍥煟閺傛寧鎲搁柍褜鍓﹂崳锝夊极?
        const enabledLanguages = ['en', 'zh'];
        
        // 1. 闂備焦鐪归崹濠氬窗閹版澘鍨傛慨妯挎硾閸愨偓闂侀潻瀵岄崢鐣岀玻濡ゅ啯鍠愰柣妤€鐗婄粈澶愭倵濮橆厼鈻曠€殿噮鍓熷畷鍫曟晝閳ь剟鎯佸鍐炬富闁靛牆顦板☉褔鏌涢悙宸殶闁逞屽墮濠€鍗炩枍閵忋垺顫曟繛鍡樺姉閳绘梻鈧箍鍎遍幊搴ㄥ疾濞嗘挻鈷戦柟缁樺笧瀛濋梺浼欑秮缁犳牕鐣烽妷鈺佺妞ゆ牗绮庨ˇ?
        console.log(' Generating root directory English homepage...');
        
        // 闂傚倷绀侀崥瀣磿閹惰棄搴婇柤鑹扮堪娴滃綊鏌涢妷顔煎闁搞倖鍔欏鍫曞醇濞戞ê顬夐梺璇插瘨閸犳氨妲愰幘璇查唶闁绘柨澹婂锟犳⒑?
        const englishTranslations = this.translations.get('en') || {};
        
        // 闂傚倸鍊烽悞锕€顭垮Ο鑲╃煋闁割偅娲橀崑顏堟煕閳╁啰鈽夐柛鎰ㄥ亾闂備線娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆鐎ｎ喗鐓忛柛鈩冾殢濡偓濠碘槅鍋勯崯瀛樻叏閳ь剟鏌嶉埡浣告殲妞ゆ柨绉瑰铏规兜閸滀礁娈愰梺闈╃秵閸ㄥ啿危閹邦兘鏀介悗锝庝簼濡差剟鏌℃径灞戒沪濠㈢懓妫濋幊婵堟婵獞es-config.json婵犵數鍋為崹鍫曞箹閳哄懎鍌ㄩ柟顖嗏偓閺嬫棃鏌熸潏鈺佸礋dex婵犵绱曢崑鎴﹀磹濡ゅ懎鏋侀悹鍥ф▕閻掕棄霉閻撳海鎽犻柣鎾亾闁诲骸绠嶉崕鍗灻洪妸鈺佸嚑?
        const config = JSON.parse(fs.readFileSync('build/pages-config.json', 'utf8'));
        const indexPageConfig = config.pages.find(page => page.name === 'index');
        
        if (!indexPageConfig) {
            throw new Error('Index page configuration not found in pages-config.json');
        }
        
        // 闂傚倷绀侀幉锟犲垂闂堟党娑樜旈崥钘夋喘椤㈡宕熼銏犳暏闂備線娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆鐎ｎ喗鐓忛柛鈩冾殢濡偓濠碘槅鍋勯崯瀛樻叏閳ь剟鏌嶉埡浣告殲妞ゆ柨绉瑰?
        const rootPageData = {
            lang: 'en',
            lang_prefix: '',
            lang_code: 'EN',
            page_content: indexPageConfig.page_content,
            ...indexPageConfig.config
        };
        rootPageData.current_key = rootPageData.current_key || '';
        rootPageData.current_name = rootPageData.current_name || '';
        
        // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢埄鍐槈闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閸繍鐔嗛悷娆忓缁椦囨煃瑜滈崜婵嬶綖婢跺娼╅柕濞垮劗閺嬫棃鏌熺€电校鐎规洖顦伴妵鍕冀閵婏妇娈ょ紓浣瑰姉閸嬨倝寮诲☉姗嗙叆闁告劖鍎虫慨瀛疞
        rootPageData.canonical_url = 'https://screensizechecker.com/';
        rootPageData.og_url = 'https://screensizechecker.com/';
        rootPageData.css_path = 'css';
        rootPageData.locales_path = 'locales';
        rootPageData.js_path = 'js';
        rootPageData.home_url = 'index.html';
        rootPageData.blog_url = this.generateBlogUrl(0, 'en', true);
        rootPageData.privacy_policy_url = 'privacy-policy.html';
        rootPageData.device_links_base = 'devices/';
        
        // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢埄鍐槈闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆鐎ｎ喗鐓忛柛鈩冾殢濡偓濠碘槅鍋勯崯瀛樻叏閳ь剟鏌曡箛銉х？闁哄棛鍨塺eflang闂傚倷娴囧銊╂嚄閼稿灚娅犳俊銈傚亾闁?
        rootPageData.base_url = 'https://screensizechecker.com';
        rootPageData.page_path = '/';
        rootPageData.hreflang_root_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_en_url = 'https://screensizechecker.com/';
        rootPageData.hreflang_zh_url = 'https://screensizechecker.com/zh/';
        rootPageData.hreflang_de_url = 'https://screensizechecker.com/de/';
        rootPageData.hreflang_es_url = 'https://screensizechecker.com/es/';
        rootPageData.hreflang_pt_url = 'https://screensizechecker.com/pt/';
        
        // 婵犵數鍋涢顓熸叏閺夋嚚褰掓倻閼恒儱鈧兘鏌￠崶鈺佇ｉ悗姘哺閺岀喓鈧數顭堟禒锕傛煟鎼搭喖鏋涢棁澶愭煟濡寧鐝柡瀣閺屻倝宕归銏紝闂佸湱鍋ㄩ崹褰掓偩閿熺姴绾ч悹鎭掑妽閸嬔冣攽閿涘嫬浜奸柛濠冾殜瀵偆鎷犲顔惧姺婵炲鍘ч悺銊╁磻鐎ｎ喗鐓熼柣鏃傤焾椤ュ鏌￠崱鏇炲祮闁哄矉缍佹俊鎼佸Ψ閵夘喕绱戦梻浣虹帛閸旀牕煤濠婂牆绠柣妯款嚙缁狅絾绻濋棃娑樻殭濞?
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
        
        // 缂傚倷鑳堕搹搴ㄥ矗鎼淬劌绐楅柡鍥╁У瀹曞弶鎱ㄥ┑鍫涗虎tle闂傚倷绀侀幉锟犳偡閿曞倹鏅濋柕蹇嬪€曢梻顖炴煟閹寸儐鐒介柍缁樻礋閺岋綁寮埀顒€顪冮崹顕呯劷闁割偅娲橀崑锝吤归敐鍥剁劸闁抽攱妫冮弻?
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
        
        // 闂備浇宕垫慨宕囩矆娴ｈ娅犲ù鐘差儐閸嬵亪鏌涢悙鑼攽:image闂傚倷绀侀幉锛勫垝瀹€鍕垫晩闁?locale
        rootPageData.og_image = 'https://screensizechecker.com/images/og-default.png';
        rootPageData.og_locale = 'en_US';

        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顔芥毄缁炬儳銈搁弻鐔煎箚瑜滈崵鐔兼煃瑜滈崜锕傚垂鐠鸿櫣鏆﹂柣妯款嚙閸愨偓闂侀潧顭梽鍕敊瀹ュ鈷?
        rootPageData.structured_data = this.generateStructuredData(rootPageData, 'en');

        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顕呮毌闁稿鎸婚幏鍛村礃椤垶顥嶉梻浣虹《閺呮盯骞婂鈧獮鍐煛閸涱喖娈濈紒鍓у閿氬ù婊勫劤闇夐柨婵嗘噺鐠愶繝鏌涢妸銉ｅ仮闁?
        rootPageData.is_home = true;
        rootPageData.is_blog = false;
        rootPageData.is_tools = false;
        rootPageData.is_devices = false;
        
        // 婵犵數鍋為崹鍫曞箰妤ｅ啫纾块柕鍫濐槹閸嬪鎮楅崷顓炐ラ柣銈傚亾闂備礁鎲￠崝鎴﹀礉鐎ｎ剚顫曢柨婵嗩槹閻撴洟鐓崶銊︾闁告ɑ鎸抽弻鏇㈠幢濡ゅ﹥鈻堝┑鈽嗗亜閸熷瓨鎱ㄩ埀顒勬煃閳轰礁鏆炴繛鍫燂耿濮婅櫣绮欓幐搴ｎ洶濠碘€冲⒔椤╃瓐缂傚倸鍊搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽顐粶缂佲偓瀹€鍕厸鐎广儱鍟俊鑺ョ箾閸繄鍩ｉ柡宀€鍠撻幏鐘诲灳閾忣偆褰茬紓鍌欐祰妞村摜鎹㈤崼銉у祦闁规崘顕х粻娑欍亜閹哄棗浜剧紒鎯у⒔閻栴棲RP闂備浇顕ч柊锝咁焽瑜旈幆澶愭嚃閳轰礁鐏婇梺闈浥堥弲娑㈠礄閻樺磭绡€濠电姴鍊搁顏嗙磼閵婏箒澹橀棁?
        rootPageData.faq_structured_data = this.generateFAQStructuredDataForPage(indexPageConfig.name, 'en');
        
        // 闂傚倷绀侀幖顐︻敄閸涱垪鍋撳鐓庡缂佽鲸鎹囬獮妯兼嫚閹绘帒鏁ら梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠囁囬悿绂婵犵绱曢崑鎴﹀磹濡ゅ懎鏋侀悹鍥ф▕閻?
        let rootHtml = this.buildPage(indexPageConfig.template, rootPageData);
        
        // 闂備礁婀遍崢褔鎮洪妸銉綎濠电姵鑹鹃弸渚€鏌曢崼婵愭Ч闁搞倖鍔欏鍫曞醇濞戞ê顬夐梺璇插瘨閸犳氨妲愰幘璇查唶闁绘柨澹婂锟犳⒑?
        rootHtml = this.translateContent(rootHtml, englishTranslations);
        
        // 婵犵數濮伴崹鐓庘枖濞戞埃鍋撳鐓庢珝妤犵偛鍟换婵嬪炊瑜忛ˇ銊╂⒑閸涘﹦鈽夐柣掳鍔戦獮濠囨偐缂佹鍙嗗┑鐐村灦椤洦鏅跺☉銏＄厽婵°倓鐒︾亸锕傛煙椤栨艾顏い銏＄懇閹虫牠鍩￠崘鍐惧幗娣囧﹪鎮欓鍕ㄥ亾濡ゅ懎鏋侀悹鍥ф▕閻掍粙鏌ｅΔ鈧悧濠冨垔閹绢喗鍋ｉ柟顓熷笒婵′粙鏌￠崱妤冪闁哄矉绲借灃闁告洖鐏氱紞鍫ユ⒑娴兼瑧宀涢柡鍛█楠炲棝宕橀鑲╊槹濡炪倖鐗楄彜闁稿鎸诲鍕箛椤撗勵棃婵＄偑鍊戦崹濠氬几瀹ュ鐓?
        rootHtml = this.internalLinksProcessor.processPageLinks(rootHtml, 'index-root', 'en');
        
        // 闂傚倷绀侀幖顐⒚洪妶澶嬪仱闁靛ň鏅涢拑鐔封攽閸屾凹鍔朚L lang闂備浇顕х换鎺楀磻閻旂厧纾婚柣鎰惈閻?
        rootHtml = rootHtml.replace('<html lang="en">', '<html lang="en">');
        
        // 婵犵數鍎戠徊钘壝归崒鐐茬獥闁哄稁鍘旈崶顒€钃熼柕澶涘瘜濡啫鈹戦悙鍙夘棡闁告柨绻樺畷鎴﹀箻鐎涙ê顎撻梺浼欑到鐞氼偊宕戦幒鎴旀斀闁绘ɑ鐟ョ€氼剚鎱ㄥ畝鍕厽妞ゆ挾鍠庨崝銈嗐亜閺囨ê鍔︾€规洜鍠栧畷婊勬媴娓氼垱袩闂傚倷绀侀幖顐ょ矓閺夋埊鑰块柛妤冧紳濞差亜绠悘鐐额唺濮规姊洪崫鍕婵ǜ鍔戦幃宄扳攽鐎ｎ偀鎷婚梺鎼炲劵缁茶姤绂嶆ィ鍐╃厽闁绘柨鎲＄壕鑽ょ磼閼搁潧鍝虹捄顖炴煕鐏炲墽鈽夌紒鍓佸仱閺屸€愁吋鎼粹€茬凹闂佷紮缍佹禍鍫曞箖鐟欏嫮鐟规い鏍ㄦ皑娴犫晝绱撴担绋款暢闁稿鍊曢悾宄邦煥閸愭儳鎮戦梺鎼炲劗閺呮繈鏁嶅☉銏＄叆?
        rootHtml = this.fixStaticResourcePaths(rootHtml, 'index.html');
        
        // 闂傚倷绀侀幉锟犲礉閺嶎厽鍋￠柕澶嗘櫅閻鏌涢埄鍐槈闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠冪搹ndex.html
        fs.writeFileSync(path.join(outputDir, 'index.html'), rootHtml);
        console.log('[OK] Root English homepage created (no redirect)');
        
        // 1.5. 闂備浇宕垫慨鎾箹椤愶附鍋柛銉㈡櫆瀹曟煡鏌涢幇闈涙灈闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閳ь剟鎮楃憴鍕８闁稿孩濞婇崺鈧い鎺嗗亾缂佺姴绉瑰畷纭呫亹閹烘垼鍩為柣搴ｆ暩绾爼宕戦幘缁樺仭闁绘鐗愮涵鈧梻浣芥〃閻掞箓骞戦崶顒傚祦閻庯綆鍠栫粻娑㈡煕閹捐尪鍏屾い锔诲櫍濮婃椽宕ㄦ繝搴㈢暦闂佺厧缍婄粻鏍€佸Ο瑁や汗闁圭儤鎸鹃崣鍕⒑缂佹ê濮﹂柛鎾寸懄瀵板嫬顓兼径瀣偓鍫曠叓閸ャ劍灏版い銉у仱閹宕归銏犳懙閻?/en/blog/
        console.log(' Skipping root directory blog content generation - blog links will point to /en/blog/');
        
        // 1.6. 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鎸庣【闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆婢跺浜滈柡鍐ｅ亾婵炲弶锚椤曘儵宕熼姘卞€炲銈嗗灴閺侇噣宕戦幘鏉戠窞闁归偊鍙庡Λ鍐渻閵堝骸浜介柛鐘虫皑缁牓宕熼娑氬幘闂佸搫瀚换姗€宕ú顏呯厸閻庯綆浜滈弳锝夋煙椤斻劌娲ら柋鍥煟閺傛寧鍟為悗姘▕閺?
        this.generateRootDevicePages(outputDir, config, englishTranslations);
        
        // 2. 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鍧楀摵閻庢碍纰嶉妵鍕箻椤栨侗鈧棝鏌＄€ｎ亝鍤囨慨濠冩そ椤㈡洟濮€閳哄倐褔鏌ｆ惔銏犳惛闁告柨绉规俊鐢稿礋椤栨稑浠洪梺鍛婄☉閿曘儵濡撮崘顔解拺?select-language.html
        // 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€鈪甸梺鍝勮嫰閿曘倝顢樻總绋跨倞闁冲搫鍊婚埀?
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
        
        // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鍧楀摵閻庢碍纰嶉妵鍕箻椤栨侗鈧棝鏌＄€ｎ亝鍤囬柡灞剧☉铻栭悗锝庡墰閿涚喐绻濋埛鈧崟顒傤吇TML
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
            content: "闂備礁鎲￠〃鍛村疮閸ф鍎嶉柕蹇嬪€曠粻鎶芥煏婵炲灝鍔氭慨?;
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
    <h1>婵☆偓绲介崯顐︻敋?Screen Size Checker</h1>
    <p class="subtitle">Choose your language / 闂傚倸鍊风欢锟犲磻閸曨垁鍥箥椤旂懓浜炬慨妯稿劚婵倹顨ラ悙鎻掓殻濠碘剝鐡曢ˇ鎶芥煟閿濆鎲鹃柟顔肩秺瀹曞墎鎹勯崫鍕摋闂?/p>
    
    <div class="language-grid">
${languageCards}
    </div>
    
    <p class="note">婵☆偓绲介崯顖溾偓?闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒鎴濃偓鍦偓姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍤囬柡宀嬬到铻栭柍褜鍓熼幃褎绻濋崒锕佲偓鍧楁煛婢跺鍎ユ繛闂村嵆閺屻劌鈹戦崱妯烘闂傚鍓﹂崜娑氭閹捐閱囬柣鏂垮濞硷繝姊洪獮灞肩鐎氼噣鍩㈤弮鈧妵鍕箻閸楃偛顬嬬紓浣插亾濠㈣埖鍔栭悡娑樸€掑顒佹悙濠⒀冨级閵囧嫰寮撮妸銉モ拫閻庢鍠氶弫濠氬箖閵忊槅妲归幖杈剧秵閳ь兘鍋撻梻浣瑰缁嬫帡鎮洪悷鈧?Other language versions are being translated, stay tuned!</p>
    
    <script>
        // 闂傚倷鑳堕崢褔銆冩惔銏㈩洸婵犲﹤瀚崣蹇涙煃閸濆嫬鏆為悗姘閵囧嫰骞橀娑扁偓鍡涙煛鐎ｎ亝鍣哄ǎ鍥э躬椤㈡洟鎮㈤摎鍌氼棜濠电姷鏁搁崑鐐差焽濞嗘搩鏁勯柛娑欐綑缁狀垰霉閻撳海鎽犻柣鎾冲€婚埀顒€绠嶉崕閬嶅箠閹版澘姹插ù鐓庣摠閻撴洘鎱ㄥ鍡楀箹闁绘挴鍋撶紓鍌欐祰妞存悂鎮烽敂鍓х焿闁圭儤顨呭婵嬫倵濞戞瑱渚涢柍褜鍓氶悷褔鍩€椤掑倹鍤€闁圭寽銈冧汗闁告劦鍠栫粻姘跺箹濞ｎ剙濡介柛瀣ㄥ姂閺屾洘绻涜鐎氼噣寮抽悩缁樼厽闁绘ê寮剁粊鈺呮煕濞嗗苯浜鹃梻浣哥枃椤曆囨偋閻愬灚顫?
        function detectAndRedirect() {
            const userLang = navigator.language || navigator.userLanguage;
            const langCode = userLang.split('-')[0];
            const availableLangs = ${JSON.stringify(enabledLanguages)}; // 婵犵數鍋涢顓熸叏閹绢喖绠犻幖娣妼缁€鍕煥閻斿搫孝閻熸瑱闄勯妵鍕冀閵娧呯厑闂佸搫妫楃换姗€寮婚敐澶娢╅柕澶堝労娴煎倸顪冮妶鍡樼８闁搞劌顭烽獮濠傗槈閵忕姷鍔?
            
            if (availableLangs.includes(langCode)) {
                const targetUrl = langCode + '/index.html';
                console.log('Auto-redirecting to:', targetUrl);
                // window.location.href = targetUrl; // 闂備礁鎲￠悷锕傛偋濡ゅ啰鐭撶€瑰嫭澹嬮弸鏍煏婵炵偓娅呮繛鍛仜闇夐柣姗嗗枛閸旀岸鏌熼姘跺弰闁诡喕绮欐俊鎼佸Ω閵夛富鍞堕梻浣告啞閺岋綁宕濋幋锕€闂柛婵勫劗閸嬫挾鎲撮崟顔碱棟闂?
            } else {
                // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞闁归偊鍘兼禒娲⒑闂堟侗鐓紒鐘冲灴閹繝寮撮姀鈥充化闂佹悶鍎村▔娑橆嚕閵娾晜鐓冮悹鍥皺婢ф稓绱掔€ｎ亶妲告い鎾炽偢瀹曘劑顢欓崹顔藉創闂傚倷绀侀幉锟犳偡椤栫偛鍨傞柟鎯版閺嬩線鏌曢崼婵愭Ц缂佲偓閸℃ü绻嗛柕鍫濇噹椤忋儵鏌嶈閸撴瑩宕婊呯煓濠㈣埖鍔﹂弫鍥煏婵炑冩媼濡插嘲鈹戦钘夌瑲缂佸甯￠垾锕傚醇閵夘喗鏅ｉ梺鐓庮潟閸婃牕鐣锋径鎰€甸柛锔诲幖鏍＄紓浣风贰閸ｏ綁寮诲☉銏犵闁圭偓鍓氶埀顒佺矒閹顫濋鐐╂灆閻?
                console.log('Language not available, defaulting to English');
                // window.location.href = 'en/index.html'; // 闂備礁鎲￠悷锕傛偋濡ゅ啰鐭撶€瑰嫭澹嬮弸鏍煏婵炵偓娅呮繛鍛仜闇夐柣姗嗗枛閸旀岸鏌熼姘跺弰闁诡喕绮欐俊鎼佸Ω閵夛富鍞堕梻浣告啞閺岋綁宕濋幋锕€闂柛婵勫劗閸嬫挾鎲撮崟顔碱棟闂?
            }
        }
        
        // detectAndRedirect(); // 闂傚倷绀侀幉锟犳偡閿曞倹鍋嬫俊銈呭暟閻挾鈧懓瀚竟瀣几閺嶎厽鐓忓┑鐐靛亾濞呭懏绻涢崨顖氫粶闂囧鏌ｅ鍡楁灈闁告梹宀搁弻鐔碱敍濮樿泛寮伴梺璇″枙缁瑦淇婇幖浣肝╅柕澶涘瘜閸炲爼姊绘担鍛婂暈闁哄矉缍佸畷婵婄疀濞戣鲸鏅梺闈涚箞閸ㄦ椽宕垫繝鍥ㄧ厓鐟滄粓宕滃▎鎺斾罕闂備線鈧偛鑻晶顕€妫?
    </script>
</body>
</html>`;

        const normalizedLanguageSelectionHtml = this.normalizeInternalAnchorHrefs(languageSelectionHtml);
        
        fs.writeFileSync(path.join(outputDir, 'select-language.html'), normalizedLanguageSelectionHtml);
        console.log('[OK] Language selection page created at select-language.html');
    }

    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥ鍡楀箹缂佸墎鍋為幈銊ノ熺拠鎻掝潽闂佹悶鍊栧Λ鍐箖妞嬪簼鐒婂ù锝夋櫜婢规洜绱撻崒姘偓鎼佸疮椤栫偛鍨傜憸鐗堝笚閸嬬喐銇勯弽顐粶闁圭懓鐖奸弻鈩冨緞鐎ｎ亶鍤嬬紓浣稿€搁悧鎾诲蓟閵娿儮妲堟俊顖滃帶椤ｆ椽鎮峰鍕╅柛銉戝拋妲洪梻浣告啞娓氭宕㈡禒瀣？闁瑰墽绮悡鏇熸叏濡厧甯堕柣蹇ョ秮閺屸剝鎷呴棃娑掑亾濠靛绠氶柛鎰靛枛缁€瀣亜閺囩偞鍣规繛鍫佸洦鐓熼柣鏃堫棑濞堥亶鏌涚€ｎ偅宕岄柡?
    generateMultiLanguageSitemap(outputDir) {
        console.log('\n[OK] Generating multilingual sitemap (enabled languages only)...');
        
        const currentDate = new Date().toISOString().split('T')[0];
        const baseUrl = 'https://screensizechecker.com';
        const enabledLanguages = ['en', 'zh', 'de', 'es', 'pt']; // 闂傚倷绀侀幉锟犳偡椤栨稓顩叉繝濠傛噳閸嬫捇宕归顒冣偓璺ㄢ偓瑙勬磸閸庣敻銆侀弴銏狀潊闁炽儱鍟挎竟鏃堟⒒娴ｈ銇熸繛鐓庢健瀹曟繃鎯旈埦鈧弸鏃堟煙鐎电校閻庢碍纰嶉妵鍕箻椤栨侗鈧棝鏌?
        
        // 闂備浇顕у锕傦綖婢舵劖鍎楁い鏂垮⒔娑撳秹鏌ｉ弮鈧幃鑸电濠婂牊鐓熼柕蹇曞У閸熺偞淇婂鐓庡缂佽鲸鎸婚幏鍛喆閸曨偊鐎洪梻浣筋嚙鐎垫帡宕归崼鏇炴瀬鐎广儱顦柋鍥煟閺冨牊浜ゅΔ?html闂傚倷绀侀幉锟犳嚌閹灐瑙勵槹鎼淬埄娼熼梺纭呮彧闂勫嫰寮查鍕€堕柣鎰煐椤ュ鏌ｉ弽顓濇喚婵﹥妞藉鍫曟嚄椤栨氨鍘琹oudflare Pages闂傚倷鐒﹂惇褰掑礉瀹€鍕瀭濠靛倻鍎鹃梻鍌欑閹碱偆绮旈崼鏇炲偍鐟滃繐危閹版澘鐓￠柛娑卞灣閻?
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
        
        // 闂備浇顕у锕傦綖婢舵劖鍎楁い鏂垮⒔娑撳秹鏌ｉ弮鍌氬付缁绢厸鍋撴繝娈垮枟閿曗晠宕滈敃鍌氳Е闁稿本鍑瑰〒濠氭煏閸繃澶勯柡鍡╁墯缁绘盯宕楅悡搴缂備浇椴哥敮锟犵嵁濡皷鍋撻悽鐢点€婇柛?
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
        
        // 婵犵數鍋為崹鍫曞箹閳哄懎鍌ㄥù鐘差儏閸戠娀鏌涢幇闈涙灍闁稿顑夐幃宄扳枎韫囨搩浠剧紓浣哄У鐢繝寮婚敐澶娢╅柕澶堝労娴犻箖姊虹紒妯煎缂佽尪娉曢崚鎺楀垂椤愮姴浜濋梺鍛婂姧閼靛綊宕戦幘鏉戠窞闁归偊鍙庡Λ?
        const zhBlogPages = [
            { path: '/blog/tag/pixel-density', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/responsive-design', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/media-queries', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/breakpoints', priority: '0.6', changefreq: 'monthly' },
            { path: '/blog/tag/retina-display', priority: '0.6', changefreq: 'monthly' }
        ];
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        
        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒佹儓闁告劏鍋撶紓浣鸿檸閸樺ジ骞婇幇鐗堝亜闁告侗鍨崑鎾诲垂椤愶絿鍑￠柣搴㈣壘閹芥粌危閹邦兘鏋庨柟鐐綑濞堬綁鏌℃径濠勫闁告柨绉归幃妤咁敋閳ь剟寮婚敐鍛傛棃鍩€椤掑嫭鍋嬪┑鐘插亰閼板灝霉閻撳海鎽犻柛搴＄Ч閺屾盯寮撮妸銈囩泿闂佷紮闄勭划鎾诲箖閻戣棄鍗虫慨姗€纭稿Σ顕€姊洪崨濠勬噧婵☆偅绻傞悾鐑芥晲婢跺娅滈棅顐㈡处濞叉粓藝?
        sitemapContent += `
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>`;
        
        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒佹儓闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閸喓绠鹃柛顐ゅ枎閻忊晠鏌熷畡閭﹀剶妤犵偛妫滈¨浣逛繆閺屻儲娑фい顏勫暣婵″爼宕堕妸锔界槗婵犵數鍋ゅΛ鍧楀础閹惰棄鏋佺€广儱顦柋鍥煥濠靛棙濯煎ù鐓庢濮婃椽宕崟顐熷亾缁嬫５娲晲閸ワ絽浜鹃梻鍫熺〒閻忛亶鏌熼懠顒€顣奸柟宄版嚇瀹曨偊宕熼崹顐ｇ様闂傚倷绀侀幖顐︽偋濠婂牆绀堥柕濞у嫷娼?
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
        
        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒佹儓闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閸喓绠鹃柛顐ゅ枎閻忓鈧娲嶉埀顒佸墯濞尖晜銇勯幒鎴Ц闁诡喖鎳忔穱濠囨倷椤忓嫧鍋撳Δ鍛瀬閻犲洤妯婇悞钘壝归悡搴ｆ憼闁哄拋鍓熼弻娑㈩敃椤掑倸鍩屽銈呯箣閸楁娊寮婚敓鐘茬＜婵﹩鍘鹃悡鎴︽煟鎼淬劍娑ч柣顒€銈搁獮澶愭偋閸喎顎撻梺鍛婄箓鐎氱兘寮抽銏♀拺闁告繂瀚晶閬嶆煕閹惧崬濡挎俊?
        blogPages.forEach(page => {
            sitemapContent += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
        });
        
        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒佹儓闁告劏鍋撻梻渚€娼荤€靛矂宕㈤悾宀€鐜绘俊銈呭暞閸犳劙鏌ｅΔ鈧悧濠勭矆閸喓绠鹃柛顐ゅ枎楠炲檽b婵犵绱曢崑鎴﹀磹濡ゅ懎鏋侀悹鍥ф▕閻掕棄霉閻撳海鎽犻柡鍜佸墴閺屾盯顢曢鍌氬煂濡炪倕绻嬮崡鎶藉蓟閿熺姴纾兼慨姗嗗幘閻撴垿鏌ｆ惔銊︽锭闁活剙銈搁獮澶愭偋閸喎顎撻梺鍛婄箓鐎氱兘寮抽銏♀拺闁告繂瀚晶閬嶆煕閹惧崬濡挎俊?
        // 婵犵數鍋涢顓熸叏鐎靛摜鐜诲┑顖氱崬es-config.json闂備浇宕垫慨鏉懨洪埡鍜佹晪鐟滄垿濡甸幇鏉垮簥闁瑰吋婧囨繝纰夌磿閸嬫垿宕愬Δ鍛瀬閻犲洤妯婇悞?
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
        
        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒備粵閻庢碍纰嶉妵鍕箻椤栨侗鈧棝鏌＄€ｎ亝鍤囨慨濠冩そ椤㈡洟濮€閳哄倐褔鏌ｆ惔銏犳惛闁告柨绉规俊鐢稿礋椤栨稑浠洪梺鍛婄☉閿曘儵濡?
        sitemapContent += `
    <url>
        <loc>${baseUrl}/select-language</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        
        // 闂傚倷绀侀幉锟犳偡椤栨稓顩叉繛鍡樺灦鐎氬鏌ｉ弬鍨倯妞ゃ儱鐗撻弻锝夊箛椤栨稓銆愬銈呯箣閸楁娊寮婚敓鐘茬＜婵﹩鍘肩粣娑樷攽閻愯尙澧涢柛銊ョ仢閻ｇ兘濡烽埡濠冩櫖濠电姴锕ょ€氼厼鈻撻姀銈嗙厽闁绘ê寮剁粊鈺呮煕濞嗗苯浜鹃梻浣哥枃椤曆囨偋閹捐绠栧ù鐘差儐閸嬪嫮绱掔€ｎ厽纭跺ù婊庢灕RL闂傚倷鐒︾€笛呯矙閹达附鍋嬮柟閭﹀枓閸嬫挸顫濋鐐╂灆閻庢鍣崜鐔风暦閹偊妲婚梺鎼炲€栫敮锟犲蓟濞戙垺鏅滈柛婵嗗椤姊虹紒姗嗘畷闁瑰憡濞婇獮鍡涘礋椤栵絾鏅╅梺鍏肩ゴ閺呮繂宕楅梻?
        enabledLanguages.forEach(lang => {
            // 闂備浇宕垫慨鎾箹椤愶附鍋柛銉㈡櫆瀹曟煡鏌涢幇闈涙灍闁搞倖鍔欏鍫曞醇濞戞ê顬夐梺璇插瘨閸ｏ綁寮婚妸銉㈡婵☆垰鐏濋顓炩攽閻愭彃绾х紒顔肩Ф缁瑦寰勭€ｃ劌浜伴梺鍓茬厛閸ｎ喗瀵奸崱娑欌拺闁告繂瀚埀顒傤焾鐓ら柕濠忛檮濞呯姵淇婇妶鍛櫣閻庢艾顦伴妵鍕箳閸℃ぞ澹曢梻浣告啞閸╁﹦妲愰弴鐘愁潟闁圭儤娲滈悿鈧梺鐟板⒔椤ユ劙宕ラ锔解拺闁告繂瀚瓭濠电姭鍋撻柛妤冧紳濞差亜绠悘鐐额唺濮?
            if (lang === 'en') {
                return;
            }
            
            // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒佹儓闁哄嫨鍎甸弻褑绠涘鐓庢異闂佽　鍋撻柕濞垮労濞撳鏌曢崼婵囧闁哄棭鍓氱换?
            pages.forEach(page => {
                if (page.path === '') {
                    // 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€顤€闂佹寧绋戦崯鏉戭嚕娴犲鏁囨繝褎鍎虫禍?
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                } else {
                    // 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒宥夋濞存粍绮撻弻锝夊閻樺啿鏆堝┑?
                    sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
                }
            });
            
            // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顒佹儓缁绢厸鍋撴繝娈垮枟閿曗晠宕滈敃鍌氳Е闁稿本鍑瑰〒濠氭煏閸繃澶勯柡鍡╁墯缁?
            blogPages.forEach(page => {
                sitemapContent += `
    <url>
        <loc>${baseUrl}/${lang}${page.path}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
            });
            
            // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繑绻濋悽鍨枀b婵犵绱曢崑鎴﹀磹濡ゅ懎鏋侀悹鍥ф▕閻?
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
            
            // 婵犵數鍋為崹鍫曞箲娴ｅ壊娴栭柕濞炬櫆閸ゅ牓鏌熸潏鍓х暠婵☆偅锕㈤弻娑㈠Ψ閿濆懎顬堝┑鐐插悑閸ㄥ潡寮诲☉銏犵睄闁稿本顕撮妷銉唵閻熸瑥瀚ù顔锯偓娈垮枛閻忔艾顕ラ崟顓濇勃闁告挆鍕啅闂傚倷绀侀幖顐ょ矓閺夋嚚娲Ω閳哄﹥鏅㈤梻浣哥仢椤戝啯绂嶅鍫熺厽闁靛繒濮甸崯鐐翠繆?
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
        
        // 濠电姷鏁搁崕鎴犵礊閳ь剚銇勯弴鍡楀閸欏繘鏌ｉ幇顔煎妺闁抽攱娲熼弻鐔兼焽閿曗偓濞呮ɑ绻涢悡搴ｇ劯闁哄矉绻濋崺鈧い鎺戝€瑰畷澶愭煏婵炑冨閸犳劕鈹戦敍鍕杭闁稿﹥顨婂顐ゆ嫚瀹割喚鍔?
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
        
        // 闂備浇宕垫慨宕囨閵堝洦顫曢柡鍥ュ灪閸嬧晛鈹戦悩瀹犲缂佺姵鍨圭槐鎺楊敃閿濆倹鏁矻闂傚倷娴囧銊ヮ渻閹烘纭€闁规儼妫勯梻顖炴煟濮橆剦鍤熺紒?
        // 1婵犵數鍋為崹鍫曞箹閳哄倻顩叉繝闈涱儐閸嬪鏌熺紒銏犳灍闁稿骸瀛╅妵鍕籍閸パ傛睏缂?+ 闂傚倷绀侀幖顐ょ矓閺夋埊鑰块柛妤冧紳濞差亜绠悘鐐额唺濮规姊洪崫鍕窛濠殿喚鏁婚幃楣冩焼瀹ュ棗浠繛杈剧悼閹虫捇宕濋妶鍡愪簻闁挎棁顕ф晶顖炴煏閸パ冾伃闁诡喕绮欏畷銊︾節閸愶腹鍋?+ 闂傚倷绀侀幖顐ょ矓閺夋埊鑰块柛妤冧紳濞差亜绠悘鐐额唺濮规姊洪崫鍕窛濠殿喚鏁婚幃楣冩焼瀹ュ棛鍘卞┑掳鍊撳ù鍥ㄧ珶濡眹浜滈柟鎹愵嚃濞兼劙鏌曢崶褍顏柟顔荤矙瀹曘劍绻濋崘锔瑰亾?+ Hub婵犵绱曢崑鎴﹀磹濡ゅ懎鏋侀悹鍥ф▕閻?+ 1婵犵數鍋為崹鍫曞箹閳哄倻顩查柨婵嗩樈閺佸鏌曡箛瀣仾闁搞倕锕弻宥堫檨闁告挾鍠栧濠氬川椤旇偐绐為柣搴秵娴滆埖绂掔€涙ü绻嗛柣鎰典簻閳ь剚顨婂顐ゆ嫚瀹割喚鍔?+ 1婵犵數鍋為崹鍫曞箹閳哄倻顩叉い蹇撳閺嬫棃鏌ㄥ┑鍡樺窛闁活厽鎸搁湁闁挎繂鐗滃鎰版煛婢跺孩顏犵紒杈ㄥ笒閳藉鈻庨幋婵冩嫲闂備線娼уΛ妤吽囬棃娴?
        // + 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€鈪甸梺璇″暙閸パ囧敹闂佺粯鏌ㄩ幉锛勨偓姘虫珪娣囧﹪鎮欓鍕ㄥ亾濡ゅ懎鏋侀悹鍥ф▕閻?+ 婵犵數鍋為崹鍫曞箹閳哄懎鍌ㄥù鐘差儏閸戠娀鏌涢幇闈涙灍闁稿顑夐幃宄扳枎韫囨搩浠剧紓浣哄У鐢帡鈥旈崘顔嘉ч柛銉ｅ妽濮ｅ牆鈹?
        const hubPagesCount = pagesConfig.pages.filter(p => p.template === 'hub-page').length;
        const rootUrls = 1 + (pages.length - 1) + blogPages.length + hubPagesEn.length; // 闂傚倷绀侀幖顐ょ矓閺夋埊鑰块柛妤冧紳濞差亜绠悘鐐额唺濮规姊洪崫鍕窛濠殿喚鏁哥划濠囧蓟閵夛妇鍘遍棅顐㈡处濞叉粓宕洪埀鐞慙
        const languageUrls = enabledLanguages.length * (pages.length + blogPages.length); // 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€鈪甸梺璇″暙閸パ囧敹闂佺粯鏌ㄩ幉锛勨偓姘辩埀RL
        const hubUrls = hubPagesCount; // Hub婵犵绱曢崑鎴﹀磹濡ゅ懎鏋侀悹鍥ф▕閻掕棄霉閻撳海鎽犻柡鍜佸墴閺屾盯顢曢妶鍛€诲銈忕稻閻擄繝寮婚敓鐘查唶婵犲灚鍔栨瓏婵＄偑鍊栧ú蹇涘垂婵犳艾绠犳繛鎴欏灩閻掑灚銇勯幒鎴姛缂?
        const otherUrls = 2; // 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€鈪甸梺鍝勮嫰閹冲繐顕ラ崟顓涘亾閿濆簼鎲惧ù鐘茬摠娣囧﹪鎮欓鍕ㄥ亾濡ゅ懎鏋侀悹鍥ф▕閻?+ 闂傚倸鍊搁崐鎼佸箠韫囨稑绀夋俊銈呮嫅缂嶆牠鏌涢埄鍐槈缂備讲鏅犻幃褰掑箒閹烘垵顬嬮梺纭呭Г缁矂鈥旈崘顔嘉ч柛銉ｅ妽濮ｅ牆鈹?
        const totalUrls = rootUrls + languageUrls + hubUrls + zhBlogPages.length + otherUrls;
        
        console.log('[OK] Multilingual sitemap generated with optimized structure');
        console.log(`    Total URLs: ${totalUrls}`);
        console.log(`    Root domain URLs: ${rootUrls} (priority 1.0-0.9)`);
        console.log(`    Language versions: ${languageUrls} (adjusted priorities)`);
        console.log(`    Gaming Hub pages: ${hubUrls} (4 languages)`);
        console.log(`    Chinese-specific: ${zhBlogPages.length}`);
        console.log(`    Other pages: ${otherUrls}`);
    }
    
    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥΟ鎸庣【闁告垹濞€閺屾盯寮撮妸銉ょ敖缂備焦鍞荤粻鎾诲蓟閻旇偐鍙曢柟缁樺笒婵酣姊?
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
        
        // 闂傚倷娴囬妴鈧柛瀣崌閺屾盯顢曢敐鍡欘槰闂佽壈灏欐慨鐢稿箞閵娾晜鏅查柛娑卞灣椤斿﹤顪冮妶搴′簼閻㈩垳鍋ら獮蹇涙偐濞茬粯鏅ｉ梺鎶芥暜閸嬫捇鏌＄€ｎ亝鍤囬柡宀嬬秮婵℃悂濡烽妷顔荤磾闂備線娼уΛ妤吽囬棃娴虫盯宕橀鍡欑◤濡炪倖鎸荤换鍕不濮樿埖鈷?
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
    
    // 闂傚倸鍊风欢锟犲磻閸涱垱鏆滈柟鐑樻⒒缁€濠傗攽閻樺弶澶勯柛銈嗘⒒閳ь剛鎳撶€氼厼顭垮Ο鐓庣筏闁秆勵殕閻撶喖鏌嶉崫鍕跺伐闁哄绋撶槐鎾愁吋閸涱垍锝囩磼鐎ｎ亶妲洪柍褜鍓ㄧ紞鍡涘磻閸曨垬鈧倿寮婚妷锔惧幐闂佸壊鍋呯换宥呂ｈぐ鎺撶厸閻庯綆浜滈弳鐐电磼?
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
    
    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥ鍡楀箹妞ゆ洝椴告穱濠囶敍濮橆厽鍎撳銈嗘肠閸ャ劎鍘介梺闈涱焾閸庨亶鎮橀·绔恉irects闂傚倷绀侀幖顐﹀磹缁嬫５娲晲閸涱亝鐎?
    generateRedirectsFile(outputDir) {
        console.log('\n Generating optimized _redirects file...');
        
        const redirectsContent = `# Cloudflare Pages 闂傚倸鍊烽悞锕併亹閸愵亞鐭撻柟缁㈠枟閸嬧晛螖閿濆懎鏆欓悷娆欑畵閺岀喐娼忛崜褏鏆犻柣銏╁灠绾绢厾妲愰幘璇茬闁诡垎鍕憾闂備礁鎼鍛村疮椤栨粎鐭?
# URL 缂傚倸鍊搁崐鐑芥倿閿曞倸绠板┑鐘崇閸婂灚銇勯弽銊р姇濞存嚎鍊曢湁闁挎繂娲︾壕顏堟煃閸濆嫭鍣洪柡鍜佸墯閹便劌螣閸濆嫭姣愬銈呯箣閸楁娊寮婚敓鐘茬＜婵﹩鍘介幃娆撴⒑閸濄儱浠滄い鏇ㄥ弮閸┾偓妞ゆ巻鍋撶紓宥咃躬閸┾偓妞ゆ帊鑳堕妴鎺楁煟?/en/* 闂備礁鎼ˇ顐﹀疾濞嗘挻鍤勯柡鍫㈡暩閺勫倿姊绘担鍛婂暈閻㈩垳鍋為弲璺何旈崨顔间罕闁诲酣娼ч幉鈥崇暦婢跺浜滈柡宥冨妽閻ㄦ垹绱?/*

# ===== 闂傚倸鍊烽悞锕併亹閸愵亞鐭撻柣鎴濐潟閳ь剙鎳橀弫鍐磼濞戞瑦鐝繝娈垮枟閿曗晠宕㈡禒瀣櫖閻庯綆鍠楅悡鐘绘煛閸曨偆绠婚柛婵囨そ閺岋紕鈧綆浜滈弳鐔兼煙閻熸澘顏い銏＄☉椤繃娼忛埡鍐ㄧウ 闂?闂傚倷绀侀幖顐﹀磹缂佹ɑ娅犳俊銈呮噺閸嬪鎮楅棃娑欏暈鐎规洖顦伴妵鍕冀閵婏妇娈ょ紓?=====
# 闂備礁鎼ˇ顐﹀疾濠婂牊鍋￠柕鍫濇穿婵娊鏌ц箛姘兼綈闁哥姴妫濋弻娑㈠即閵娿儰绨婚梺璇茬箳閸犳捇鎯€椤忓牜鏁囩憸宥夊几濞嗘垹纾肩紓浣姑崫铏光偓娈垮櫘閸犳盯藝鐎涙绠?/en/* URL 濠电姵顔栭崰妤冩崲閹邦喖绶ら柛褎顨呴悘铏叏濡炶浜鹃梺鍝勮嫰閼活垶顢樻總绋垮窛妞ゆ牗绋掗惁鐐烘⒒娴ｅ憡鍟炵痪鏉跨Ч瀹曞綊鎮界粙鎸庢К閻庡厜鍋撻柛鏇ㄥ亝椤ユ繈姊虹憴鍕靛晱闁哥姵顨婇幃楣冩焼瀹ュ棛鍘搁悗骞垮劚濞村倿寮ㄦ导瀛樼厽妞ゆ挾鍠庨崝銈嗐亜?

# 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹般劍娅囬柍缁樻煥閳规垿鎮╅崘鍙夋儧闂侀€炲苯澧い锔炬暬瀵崵浠︾粵瀣倯闂佸憡渚楅崹鍗炐掓惔銊︹拺?
/en/                  /                   301
/en/index.html        /                   301

# 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋涚痪顓涘亾婵犳鍠楅敃鈺呭礈閿曞倸瑙﹂柛宀€鍋為埛鎴︽煙缂佹ê绗х€涙繈姊烘导娆戠М缂佺姵鐗曢悾鐑藉Ψ閳轰胶顓哄銈嗙墬缁酣藝閳哄懏鈷戦柛婵嗗閺佹娊鏌涢埄鍐噮闁哥偞鎸抽幃?闂?闂傚倷绀侀幖顐﹀磹鐟欏嫬鍨斿ù鐘差儐閸庢鏌熼鍡楄嫰濞堫偊姊洪崨濠冪濠⒀冩捣缁?
/en/blog              /blog               301
/en/blog/             /blog/              301
/en/blog/*            /blog/:splat        301

# 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹板吀绨煎┑顖氥偢閺岀喖顢涢崱妤佹拱閺嶁€斥攽閿涘嫬浜奸柛濠冾殜瀵偆鎷犲顔惧姺婵炲鍘ч悺銊╂偂閸屾壕鍋撻獮鍨姎闁硅櫕鍔欏铏鐎涙鍘卞┑顔斤供閸樺ジ鎮￠埀顒傜磽娴ｄ粙鍝洪柣鐔叉櫅椤曪綁顢欏▎鐐枆闂備焦妞块崢浠嬪磿閹剁瓔鏁?闂?闂傚倷绀侀幖顐﹀磹鐟欏嫬鍨斿ù鐘差儐閸庢鏌熼鍡楄嫰濞堫偊姊洪崨濠冪濠⒀冩捣缁?
/en/devices/*         /devices/:splat     301

# 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹扮數鍘涢柛鐔锋嚇閺屾洘寰勯崼婵嗗閻庣數澧楅弻銊┾€旈崘顔嘉ч柛銉ｅ妽濮ｅ牆鈹戦悙鐑橈紵闁告濞婂鑽や沪缁涘鎮戦梺鍛婁緱閸ㄥ崬袙鎼淬劍鈷戦柛娑橈功椤ｆ煡鏌涢埡渚婂姛婵″弶鍔曢埢搴ㄥ箛椤忓棛鐣鹃梻浣侯焾閺堫剛绮欓幘瀵割洸妞ゆ牜鍋為崐鍨箾閹寸儐浠炬い蹇撳閼版寧銇勮箛鎾存崳缂?
/en/tools/*           /tools/:splat       301

# 闂傚倸鍊风欢锟犲磻閸涱収娼╅柕濞炬櫅閺嬩線鏌曢崼婵囧闁哥姴妫濋弻娑㈠即閵娿儰绨婚梺璇茬箳閸犳牠寮婚妸銉㈡婵炲棙鍩堥弳鈩冪節閳封偓閸愵€呪偓娈垮枛閻忔艾顕ラ崟顒傜瘈闁稿本顨嗙€垫ê鈹戦悙鑸靛涧缂佹煡绠栭幃鐤槻闁?/en/* 闂備浇宕垫慨宕囨媰閿曞倸鍨傞柟娈垮枟椤愪粙鏌ｉ幇顔煎妺闁绘挸鍊婚埀顒€绠嶉崕閬嶅箠閹版澘姹插ù鐓庣摠閻撴洘鎱ㄥ鍡楀箹闁诲繈鍎甸弻娑㈠煛娴ｈ櫣鍔悗娈垮枤閺咁偄鈽夐悽绋垮窛妞ゆ牗绮岄弫鍫曟煟?
/en/*                 /:splat             301

# ===== .html 闂傚倷绀侀幉锟犳嚌閹灐瑙勵槹鎼淬埄娼熼梺纭呮彧闂勫嫰鎮￠崒婧惧亾楠炲灝鍔氶柟铏姍瀵櫕瀵肩€涙鍘卞┑顔斤供閸樺ジ鎮￠埀顒傜磽娴ｄ粙鍝洪柣鐔叉櫅椤曪綁鎮剧仦鎯у幑闂佸憡渚楅崹鎶藉船閹绢喗鍊甸柛顭戝亝缁舵煡鎮楀鐓庣仯闁逞屽墯绾板秵绻涙繝鍌ゅ殨妞ゆ帒瀚悙濠囨煃鏉炴壆璐伴柡鍡╁弮濮婃椽宕崟顓炩拡闂佸憡鎸堕崝搴∥?====
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

# ===== .html 闂傚倷绀侀幉锟犳嚌閹灐瑙勵槹鎼淬埄娼熼梺纭呮彧闂勫嫰鎮￠崒婧惧亾楠炲灝鍔氶柟铏姍瀵櫕瀵肩€涙鍘卞┑顔斤供閸樺ジ鎮￠埀顒傜磽娴ｄ粙鍝洪柣鐕傚缁瑦寰勯幇鍨櫍闂佺粯鏌ㄩ幗婊堝焵椤掑娅嶉柡宀嬬到铻栭柍褜鍓熼幃褎绻濋崒锕佲偓鍧楁偨椤栵絽鏋ょ紒?===
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

# ===== .html 闂傚倷绀侀幉锟犳嚌閹灐瑙勵槹鎼淬埄娼熼梺纭呮彧闂勫嫰鎮￠崒婧惧亾楠炲灝鍔氶柟铏姍瀵櫕瀵肩€涙鍘卞┑顔斤供閸樺ジ鎮￠埀顒傜磽娴ｄ粙鍝洪柣鐔村劦椤㈡岸濡烽埡鍌氫痪濡炪倖鐗徊钘夆枔瑜斿铏圭磼濮楀棙鐣堕梺缁橆殔閿曘倝鏁冮姀銏℃殰妞ゆ柨澧介悰?===
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

# ===== .html 闂傚倷绀侀幉锟犳嚌閹灐瑙勵槹鎼淬埄娼熼梺纭呮彧闂勫嫰鎮￠崒婧惧亾楠炲灝鍔氶柟铏姍瀵櫕瀵肩€涙鍘卞┑顔斤供閸樺ジ鎮￠埀顒傜磽娴ｄ粙鍝洪柣鐔濆洤绠熼柤纰卞墯瀹曞鏌曟繛鍨姢闁哄鍊垮铏圭磼濮楀棙鐣烽梺鑽ゅ枂閸旀垿銆佸璺侯潊闁靛牆妫楁禍閬嶆⒑閸撴彃浜為柛鐘冲姍楠炲繘鏌嗗鍡樻珫?===
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

# ===== 闂傚倷绀侀幉锟犮€冮崱娑欏殞濡わ絽鍠氶弫?.html 闂傚倷绀侀幉锟犳嚌閹灐瑙勵槹鎼淬埄娼熼梺纭呮彧闂勫嫰鎮￠崒婧惧亾楠炲灝鍔氶柟铏姍瀵櫕瀵肩€涙鍘?=====
/blog/index.html                          /blog                               301
/zh/blog/index.html                       /zh/blog                            301
/de/blog/index.html                       /de/blog                            301
/es/blog/index.html                       /es/blog                            301
/blog/*.html                              /blog/:splat                        301
/zh/blog/*.html                           /zh/blog/:splat                     301
/de/blog/*.html                           /de/blog/:splat                     301
/es/blog/*.html                           /es/blog/:splat                     301

# ===== 闂備浇宕垫慨鏉懨归崒鐐茬煑闁逞屽墴閺屽秶鎷犻懠顒€鈪甸梺璇″暙閸パ囧敹闂佺粯鏌ㄩ幉锛勨偓?index.html 闂傚倸鍊烽悞锕併亹閸愵亞鐭撻柟缁㈠枟閸嬧晛螖閿濆懎鏆欓悷?=====
/zh/index.html                            /zh/                                301
/de/index.html                            /de/                                301
/es/index.html                            /es/                                301
/pt/index.html                            /pt/                                301

# ===== 闂傚倷鑳堕…鍫㈡崲閹存繐鑰块柛锔诲幖閸ㄦ繃銇勯幒宥夋濞存粍绮撻弻锝夊閻樺啿鏆堝┑鈩冦仠閸旀垵顫忓ú顏勭闁圭儤鏋姀銈嗙厽闁挎繂顦遍悾铏光偓?=====
/privacy-policy.html                      /privacy-policy                     301
/terms-of-service.html                    /terms-of-service                  301


# ===== 婵犵數鍋為幐鑽ゅ枈瀹ュ洠鍋撶粭娑樺暟閺嗐倝骞栨潏鍓хɑ濠殿垰銈搁弻娑滎槼妞ゃ劌妫濋弫宥夊冀椤撶啿鎷洪梺鍦帛鐢偛鐡梻浣风串缂嶄胶绮婚弽褏鏆?=====
/devices/                                 /devices/iphone-viewport-sizes      301
/devices                                  /devices/iphone-viewport-sizes      301`;

        fs.writeFileSync(path.join(outputDir, '_redirects'), redirectsContent);
        console.log('[OK] Generated simplified _redirects file');
    }
    
    // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥ鍡楀箹妞ゆ洝椴告穱濠囶敍濮橆厽鍎撳銈嗘肠閸ャ劎鍘介梺闈涱焾閸庨亶銆傜粵绯眔ts.txt闂傚倷绀侀幖顐﹀磹缁嬫５娲晲閸涱亝鐎?
    // 闂傚倷绀侀幉锟犲礉閺囥垹绠犻幖鎼厛閺佸﹪鏌熼柇锕€骞橀柍缁樻閺屽秷顧侀柛鎾跺枛楠炲﹤鈽夊锝呬壕婵炴垶顏璺虹；闁规崘顕栧Σ鐓庮渻閵堝啫鍔氶柟铏锝嗙節濮橆儵銊︺亜閺嶃劎鐭岄柣娑栧劤缁辨帞绱掗姀鐘插闂佸摜濮靛ú婊堝箲閵忕媭娼╅柤鎼佹涧濞堬綁鏌℃径濠勫闁告柨绉归幃妤咁敋閳ь剟寮婚敐鍛傛棃鍩€椤掑嫭鍋嬪┑鐘插亰閼板灝霉閻撳海鎽犻柡鍜佸墴閺屾盯顢曢妶鍛亖婵犮垻鎳撻惌鍌炲蓟閿濆鐓涘┑鐘插€归悘鍫㈢磽閸屾氨孝缂佸缍婂顐㈩吋閸℃绐炴繝鐢靛Т閸燁偊顢旈娑氱闁瑰鍋為幆鍕煕濡湱鐭欑€殿喗鎮傚畷姗€顢欓挊澶夌綍闂備礁澹婇崑鍡涘窗閹版澘绠梺顒€绉甸弲顒佹叏濠靛牏鈹?闂傚倷鐒︾€笛呯矙閹次诲洦瀵奸幖顓熸櫌濠电姴锕ら幊蹇涘礂濠婂嫨浜滈柡鍐ㄥ€告禍楣冩煛閸涱喗鍊愰柡?
    validateContentConsistency(outputDir) {
        console.log('\n Validating content consistency between English (root) and Chinese (/zh/) versions...');
        
        const inconsistencies = [];
        const rootDir = outputDir; // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋熼柛瀣儔閺屾盯顢曢妶鍛€鹃梺鍦厴娴滃爼寮诲☉銏℃櫆闁告繂瀚‖澶愭⒑缂佹﹩娈曢柟鍛婂▕楠炲棝宕熼锝嗘櫓闂佸吋绁撮弲婵嗗礂
        const zhDir = path.join(outputDir, 'zh'); // 婵犵數鍋為崹鍫曞箹閳哄懎鍌ㄥù鐘差儏閸戠娀鏌涢幇闈涙灍闁稿顑夐弻娑㈩敃閵堝懏鐎鹃梺鍦厴娴滃爼寮?/zh/ 闂傚倷鑳堕崕鐢稿疾閳哄懎绐楅柡宥庡亞缁€?
        
        // 闂傚倸鍊搁崐绋棵洪悩璇茬；闁瑰墽绮崑锟犳煛閸ャ劍鐨戦柛鏂跨У閵囧嫰濡烽妷锕€娈楅悗娈垮枛椤攱淇婇悿顖ｆЪ闂佷紮绲藉畷顒勨€旈崘顔嘉ч柛銉ｅ妽濮ｅ牆鈹戦悙鐑橈紵闁告鍟块悾宄邦潩椤戔晜妫冨畷鐔煎煘閹傚?
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
            const rootPagePath = path.join(rootDir, pagePath); // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋熼柛瀣儔閺屾盯顢曢妶鍛€鹃梺?
            const zhPagePath = path.join(zhDir, pagePath); // 婵犵數鍋為崹鍫曞箹閳哄懎鍌ㄥù鐘差儏閸戠娀鏌涢幇闈涙灍闁稿顑夐弻娑㈩敃閵堝懏鐎鹃梺?
            
            // 濠电姷顣藉Σ鍛村磻閳ь剟鏌涚€ｎ偅宕岄柡宀嬬磿娴狅妇鎷犻幓鎺戭潥闂備礁鎼鍛村疮椤栨粎鐭夐柟鐑橆殕閸ゅ鏌涢…鎴濃偓锝夋晝閸屾稓鍘卞┑顔矫晶浠嬫偩闁秵鐓熼幒鎶藉礉閹存繄鏆?
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
                // 闂備浇宕垫慨鏉懨洪埡鍜佹晪鐟滄垿濡甸幇鏉跨倞妞ゆ巻鍋撴俊顐ｏ耿閺屾盯濡烽鐐搭€嶅銈嗗姃缁瑩寮诲☉銏犵疀妞ゆ帊绀佸▍锝咁渻?
                const rootContent = fs.readFileSync(rootPagePath, 'utf8');
                const zhContent = fs.readFileSync(zhPagePath, 'utf8');
                
                checkedPages++;
                
                // 濠电姷顣藉Σ鍛村磻閳ь剟鏌涚€ｎ偅宕岄柡宀嬬磿娴狅妇鎷犻幓鎺戭潛闂備礁鎲￠鎼佸炊閵娧冨汲闂備焦鐪归崹褰掑煘閸戭噣姊绘担渚劸缂佺粯鍔欏畷顖炲箥椤斿墽鐒奸悗鍏夊亾闁告洦鍓欓崜顓㈡⒑閸涘﹥澶勫ù婊呭仱椤㈡棃鏌嗗鍡欏幘閻庣懓瀚竟鍡涘箺閻樼粯鐓?
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
                        
                        // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋涙俊鐐扮矙閹﹢鎮欑捄渚闂佸憡锕╅崜鐔煎蓟閿熺姴纾兼慨姗嗗幖缁愭稒绻濋埛鈧崟鍨杹閻庢鍠氶弫濠氥€佸Δ鍛＜婵炴垶纰嶅▓鎼佹⒒娴ｅ憡鍟為柛鏃€娲熼獮濠冩償椤垶鏅╅梺褰掑亰閸樹粙宕曢悢鍏肩厸闁告劑鍔嶇粊鈺呮煕閵堝拋妯€闁哄矉绻濆畷鐔兼濞戞矮鍖栭梻浣虹帛閸旀牕煤濠婂牆绠柣妯款嚙缁狅絾绻濋棃娑欘棞缂傚秵顭囩槐鎾寸瑹閸パ呬户缂備線纭搁崰姘ｉ幇顑芥斀闁搞儮鏂侀弸鏍倵楠炲灝鍔氶柟铏姉閳ь剛鎳撻ˇ鐢稿箖瑜版帒鐐婇柕澶堝劚婵垹鈹戦悙瀛樼稇妞わ箓娼ч悾?
                        // 闂備礁鎼ˇ顐﹀疾濠婂牊鍋￠柍鍝勬噹闂傤垶鏌ｉ幋锝嗩棄闁活厽顨嗛妵鍕疀閹炬潙顎涘┑顔硷躬缁犳牠寮婚敍鍕勃閻犲洦褰冩慨宥夋煟閻愭潙鍝哄ù婊冪埣楠炲﹪骞樼拠鎻掔獩闂佸搫顦伴崹鐢哥嵁鐎ｎ喗鐓熼幖娣灮閳洟鏌ㄥ顓犵瘈闁逞屽墴椤㈡棃宕煎┑鍫敤闂備礁鎲￠崝鏍亹閸愵亝濯奸柡灞诲劜閻撱儲绻涢幋鐏活亪銆冨▎鎴犵＜婵°倐鍋撴い锔诲灥椤ｉ箖姊洪崫鍕殭婵炲眰鍔庣划锝呪槈閵忥紕鍘遍梺褰掑亰閸撴岸宕崇憴鍕╀簻?
                        // 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞闁归偊鍙庡鍧楁⒑闁偛鑻晶浼存煙閼碱剙顣肩紒妤冨枑缁绘繈宕熼褎啸闂傚倷绀侀幉锟犳偡椤栫偛鍨傛い鏍ㄧ〒椤╂煡鏌熼悜姗嗘當闁圭懓鐖奸弻鏇熺箾閸喖顬嬬紓浣哄Т缂嶅﹤顫忓ú顏勭闁圭儤鎸婚幏閬嶆⒑缁夊棗鍠涢煬顒傗偓瑙勬礃缁诲牓骞冮埡鍛優妞ゆ劑鍊曢崵鍗炩攽閻橆喖鐏辨繛澶嬬〒缁棃妫冨☉杈╁姺闂佸憡绋戦悺銊╁磿瀹ュ鐓曢柡鍥ュ妼楠炴﹢鏌涙繝鍐ㄢ枙闁诡喖缍婂畷鍫曞Ω閵壯傜礉闂備胶绮粙鎺楁偡瑜旈獮蹇涙偐瀹曞洨鎳濋梺閫炲苯澧撮柛鈹惧亾濡炪倖甯婇悞锕傦綖濡ゅ啰纾?
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
                
                // 濠电姷顣藉Σ鍛村磻閳ь剟鏌涚€ｎ偅宕岄柡灞糕偓宕囨殕濠电姴鍟拌ぐ鐒宯onical URL闂傚倷鐒﹂惇褰掑礉瀹€鈧埀顒佸嚬閸欏啴銆佸Δ鈧…銊╁川椤旂厧骞戞俊鐐€栧Λ浣筋暰闂?
                const rootCanonical = rootContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                const zhCanonical = zhContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
                
                if (rootCanonical && zhCanonical) {
                    const rootCanonicalUrl = rootCanonical[1];
                    const zhCanonicalUrl = zhCanonical[1];
                    
                    // 婵犲痉鏉库偓妤佹叏閹绢喗鍎楀〒姘ｅ亾闁诡垯鐒︾换鍛村Χ濞岀nical URL闂傚倷鐒﹂惇褰掑礉瀹€鈧埀顒佸嚬閸欏啴銆佸Δ鈧…銊╁川椤旂厧骞戞俊鐐€栧Λ浣筋暰闂?
                    // 闂傚倷绀侀崥瀣ｉ幒鎾变粓闁归棿绀侀崙鐘绘煕閹伴潧鏋熼柛瀣儔閺屾盯顢曢妶鍛€鹃梺鍦厴娴滃爼寮婚妸銉㈡婵☆垳鍘ч·鈧梻浣虹帛椤ㄥ棝骞愰幎钘夌畾闁告洦鍨奸弫濠囨煠濞村娅囬崡蹇涙⒒娴ｇ懓顕滅紒瀣灴钘濇い鏂垮⒔缁犳柨顭跨捄渚剱闁稿海鍠栭弻锟犲礃閵婏妇銈╅梺鎼炲€曢ˇ鐢稿蓟濞戙垹鍐€鐟滃酣宕宠ぐ鎺撶厵?/en/
                    if (rootCanonicalUrl.includes('/en/')) {
                        inconsistencies.push({
                            page: pagePath,
                            issue: `English version has incorrect canonical URL (contains /en/): ${rootCanonicalUrl}`,
                            severity: 'error'
                        });
                        pageConsistent = false;
                    }
                    
                    // 婵犵數鍋為崹鍫曞箹閳哄懎鍌ㄥù鐘差儏閸戠娀鏌涢幇闈涙灍闁稿顑夐弻娑㈩敃閵堝懏鐎鹃梺鍦厴娴滃爼鐛弽顐熷亾濞戞鎴λ夐崱妯镐簻闁哄洨鍠庨崫铏光偓瑙勬礈婵炩偓鐎规洏鍔戦、姗€鎮㈠畡鏉款棐 /zh/
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
        
        // 闂傚倷鐒﹂惇褰掑垂婵犳艾绐楅柟鐗堟緲閸ㄥ倹鎱ㄥ鍡楀季婵炲牏鏅埀顒€鍘滈崑鎾绘煕閹板吀绨兼い顐㈢Ч濮婅櫣娑甸崨顖氱墯闂佺閰ｆ禍鍫曠嵁?
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
        
        // 婵犵數鍎戠徊钘壝洪敂鐐床闁稿瞼鍋為崑銈夋煏婵犲繐鐦滄繛鍫㈡櫕閳ь剙鍘滈崑鎾绘煕閹板吀绨兼い顐㈢Ч濮婅櫣娑甸崨顖氱墯闂佺閰ｆ禍鍫曠嵁?
        fs.writeFileSync(
            path.join(outputDir, 'content-consistency-report.json'),
            JSON.stringify(validationReport, null, 2)
        );
        
        // 闂備礁鎼ˇ顖炴偋婵犲洤绠伴柟闂寸閸氳銇勯幘璺盒ョ痪鎯с偢閺岀喖骞嗚閸ょ喎霉?
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

// 婵犵數濮烽。浠嬪焵椤掆偓閸熷潡鍩€椤掆偓缂嶅﹪骞冨Ο璇茬窞闁归偊鍘奸崜顕€鏌ｆ惔銏⑩姇闁挎艾顭跨捄铏剐х€殿喖鐖奸崺锟犲磼濮橆剦娼欐俊鐐€戦崹娲垂閻㈤潻缍栭柕蹇嬪€曞洿闂佸壊鍋呯换鍌炈夊☉銏♀拺闁告繂瀚晶閬嶆煕閹惧崬濡挎俊鍙夊姇閳规垹鈧綆浜為濂告偡濠婂嫬鐏撮柕鍡曠窔楠炲鎮欓懠顒傜嵁婵犳鍠楄摫闁告挻宀稿畷鐢稿籍閸喎浠柣蹇撶箣缁€浣圭妤ｅ啯鈷戦柛婵嗗閸庡繘鎮楀鐓庡缂?
if (require.main === module) {
    (async () => {
        const builder = new MultiLangBuilder();
        
        console.log(' Starting integrated build process...');
        
        // Step 0: 闂備礁鎼ˇ顐﹀疾濠婂牆绀夋慨妞诲亾闁靛棔绶氶獮瀣偐閻㈡妲遍梻浣告惈鐎氼剛鎹㈤幒鎳筹綁顢涘В鍏兼閹晠鎳犻鍌氬О闂?
        console.log('\n Step 0: Validating translations...');
        const validationResult = await builder.runTranslationValidation();
        
        if (!validationResult.success) {
            console.error('[ERROR] Build failed due to translation validation errors');
            process.exit(1);
        }
        
        // 婵犵妲呴崑鎾跺緤妤ｅ啯鍋嬮柡鍥ュ灩閸屻劍绻涢幋鐐垫噭濞存嚎鍊濋弻鐔兼焽閿曗偓閻忛亶鏌￠埀顒佺鐎ｎ偆鍘卞┑掳鍊撳ù鍥ㄧ珶濡眹浜滈柟鎯х－缁夎櫣鈧鍠楅幃鍌氱暦閻旂⒈鏁冮柕鍫濇搐椤︹晠姊?
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
            
            // 闂傚倸鍊烽悞锕併亹閸愵亞鐭撻柣銏㈩焾閽冪喎鈹戦悩鍙夋悙缂佲偓婢舵劖鐓熸俊顖滃帶閸斿绱掓担鐟邦棆缂佽鲸鎸婚幏鍛矙濞嗗彞杩樻繝鐢靛仜濡酣宕规禒瀣瀬鐎广儱娲ｅ▽顏堟煢濡警妲烘俊顖欑窔濮婃椽鎮烽柇锔界枃闂佸憡鎸诲畝绋款嚕缂佹绡€闁搞儯鍔屾禒娲⒑缂佹ɑ鈷掓い顓炵墦閹﹢宕堕浣哄幗闂侀潧顭堥崕閬嶎敂閳哄啠鍋撶憴鍕８闁稿孩濞婇崺鈧い鎺嗗亾缂佺姴绉瑰畷褰掓嚒閵堝懎鐏婇悗骞垮劚濡盯銆?
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





