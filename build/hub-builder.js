const fs = require('fs');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');
const hljs = require('highlight.js');

/**
 * Hub构建器 - 处理Gaming Hub等专题内容
 * 参考BlogBuilder架构，但针对Hub内容优化
 */
class HubBuilder {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.hubContentPath = path.join(this.rootPath, 'hub-content');
        this.hubOutputPath = path.join(this.rootPath, 'components', 'generated', 'hub');
        this.languages = ['en', 'zh', 'de', 'es', 'pt', 'fr']; // 支持的语言
        this.hubPages = new Map(); // 存储所有Hub页面
        this.categories = new Map(); // 按分类存储页面
        
        // 配置 Marked 使用 highlight.js
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            headerIds: true,
            gfm: true
        });
        
        // 初始化目录
        this.ensureDirectories();
    }
    
    /**
     * 确保必要的目录存在
     */
    ensureDirectories() {
        // 清理并重建专用生成目录
        fs.rmSync(this.hubOutputPath, { recursive: true, force: true });
        fs.mkdirSync(this.hubOutputPath, { recursive: true });
        
        // 确保hub-content目录存在
        if (!fs.existsSync(this.hubContentPath)) {
            fs.mkdirSync(this.hubContentPath, { recursive: true });
            console.log(' Created hub-content directory');
        }
    }
    
    /**
     * 从hub-content目录加载所有内容
     */
    loadHubPages() {
        console.log('\n Loading Hub pages...');
        
        // 重置集合
        this.hubPages.clear();
        this.categories.clear();
        
        // 如果目录不存在，返回
        if (!fs.existsSync(this.hubContentPath)) {
            console.warn(' hub-content directory not found.');
            return;
        }
        
        // 获取所有Markdown文件（支持多语言文件名，如 file.en.md, file.zh.md）
        const allFiles = fs.readdirSync(this.hubContentPath)
            .filter(file => file.endsWith('.md'))
            .filter(file => !['CLAUDE.md', 'README.md'].includes(file));
        
        console.log(` Found ${allFiles.length} Hub content files.`);
        
        // 按语言分组处理
        this.languages.forEach(lang => {
            const langFiles = allFiles.filter(file => {
                // 支持 file.zh.md 格式，或者没有语言后缀的默认为英文
                if (file.includes(`.${lang}.md`)) return true;
                if (lang === 'en' && !allFiles.some(f => f === file.replace('.md', '.en.md')) && file.endsWith('.md')) {
                    // 如果没有.en.md版本，且文件是.md结尾，默认为英文
                    return !file.match(/\.(zh|de|es|pt|fr)\.md$/);
                }
                return false;
            });
            
            console.log(`   Processing ${langFiles.length} files for ${lang}`);
            
            langFiles.forEach(file => {
                const filePath = path.join(this.hubContentPath, file);
                try {
                    // 解析Markdown和前置元数据
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const { data, content } = matter(fileContent);
                    
                    // 检查必要的元数据
                    if (!data.title || !data.slug) {
                        console.warn(` Hub page ${file} missing required metadata (title or slug).`);
                        return;
                    }
                    
                    // 生成唯一ID
                    const slug = data.slug;
                    const id = `${slug}-${lang}`;
                    
                    // 解析Markdown内容
                    let htmlContent = marked.parse(content);
                    
                    // 将Markdown中的H1标签转换为H2，避免多个H1
                    htmlContent = htmlContent.replace(/<h1/g, '<h2').replace(/<\/h1>/g, '</h2>');
                    
                    // 替换 {{lang_prefix}} 变量为正确的路径
                    // 对于英文，lang_prefix 是 ..（因为hub在根目录下的hub文件夹）
                    // 对于其他语言，lang_prefix 是 ../..（因为在/zh/hub/下）
                    const langPrefix = lang === 'en' ? '..' : '../..';
                    // 替换原始的 {{lang_prefix}}
                    htmlContent = htmlContent.replace(/\{\{lang_prefix\}\}/g, langPrefix);
                    // 替换URL编码的版本 %7B%7Blang_prefix%7D%7D
                    htmlContent = htmlContent.replace(/%7B%7Blang_prefix%7D%7D/g, langPrefix);
                    
                    // 计算阅读时间（每分钟200字）
                    const wordCount = content.split(/\s+/).length;
                    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
                    
                    // 创建Hub页面对象
                    const hubPage = {
                        id,
                        slug,
                        lang,
                        sourceFile: path.relative(this.rootPath, filePath).replace(/\\/g, '/'),
                        title: data.title,
                        description: data.description || '',
                        keywords: data.keywords || '',
                        content: htmlContent,
                        rawContent: content,
                        category: data.category || 'general',
                        tags: Array.isArray(data.tags) ? data.tags : [],
                        date: this.resolvePageDate(filePath, data.date),
                        author: data.author || 'Screen Size Checker Team',
                        featuredImage: data.featuredImage || '',
                        readingTime,
                        metadata: data
                    };
                    
                    // 存储到Map
                    this.hubPages.set(id, hubPage);
                    
                    // 按分类存储
                    const category = hubPage.category;
                    if (!this.categories.has(category)) {
                        this.categories.set(category, []);
                    }
                    this.categories.get(category).push(hubPage);
                    
                    console.log(`   Loaded: ${slug} (${lang})`);
                    
                } catch (error) {
                    console.error(`   Error processing ${file}:`, error.message);
                }
            });
        });
        
        console.log(`\n Total Hub pages loaded: ${this.hubPages.size}`);
    }

    resolvePageDate(filePath, frontMatterDate) {
        if (frontMatterDate) {
            return frontMatterDate;
        }

        return fs.statSync(filePath).mtime.toISOString().split('T')[0];
    }
    
    /**
     * 生成Hub页面组件（类似博客文章组件）
     */
    generateHubComponents() {
        console.log('\n  Generating Hub page components...');
        
        let generated = 0;
        
        this.hubPages.forEach(page => {
            try {
                // 生成组件HTML
                const componentHtml = this.generateHubPageHtml(page);
                
                // 确定输出文件名
                const filename = `hub-${page.slug}-${page.lang}.html`;
                const outputPath = path.join(this.hubOutputPath, filename);
                
                // 写入文件
                this.writeGeneratedComponent(outputPath, componentHtml, page.sourceFile);
                
                generated++;
                
            } catch (error) {
                console.error(`   Error generating component for ${page.id}:`, error.message);
            }
        });
        
        console.log(` Generated ${generated} Hub page components`);
    }

    writeGeneratedComponent(filePath, content, sourceLabel) {
        const header = [
            '<!-- @generated by build/hub-builder.js -->',
            `<!-- source: ${sourceLabel} -->`,
            '<!-- do not edit directly; edit hub-content markdown or the builder instead -->',
            ''
        ].join('\n');

        fs.writeFileSync(filePath, `${header}${content}`, 'utf8');
    }
    
    /**
     * 生成Hub页面的HTML内容
     */
    generateHubPageHtml(page) {
        // 生成Schema markup
        // 生成相关内容推荐
        const relatedContent = this.generateRelatedContent(page);
        
        // Hub页面模板（不包含面包屑，由模板处理）
        return `<!-- Hub Page Component: ${page.title} -->
<article class="hub-page" data-category="${page.category}">
    <!-- Hero Section -->
    <header class="hub-hero">
        <div class="hub-hero-content">
            <h1 class="hub-title">${page.title}</h1>
            <p class="hub-description">${page.description}</p>
            <div class="hub-meta">
                <span class="hub-date">${this.formatDate(page.date, page.lang)}</span>
                <span class="hub-reading-time">${page.readingTime} min read</span>
                <span class="hub-category">${this.formatCategory(page.category)}</span>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <div class="hub-content">
        ${page.content}
    </div>
    
    <!-- Tags -->
    ${page.tags.length > 0 ? `
    <div class="hub-tags">
        ${page.tags.map(tag => `<span class="hub-tag">${tag}</span>`).join('')}
    </div>
    ` : ''}
    
    <!-- Related Content -->
    ${relatedContent}
</article>`;
    }
    
    /**
     * 生成面包屑导航
     */
    generateBreadcrumb(page) {
        const langPrefix = page.lang === 'en' ? '' : `/${page.lang}`;
        
        return `<nav class="breadcrumb" aria-label="Breadcrumb">
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="${langPrefix}/">
                <span itemprop="name">Home</span>
            </a>
            <meta itemprop="position" content="1" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="${langPrefix}/hub/">
                <span itemprop="name">Hub</span>
            </a>
            <meta itemprop="position" content="2" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${page.title}</span>
            <meta itemprop="position" content="3" />
        </li>
    </ol>
</nav>`;
    }
    
    /**
     * 生成Schema.org结构化数据
     */
    generateSchema(page) {
        const langPrefix = page.lang === 'en' ? '' : `/${page.lang}`;
        const url = `https://screensizechecker.com${langPrefix}/hub/${page.slug}`;
        
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": page.title,
            "description": page.description,
            "url": url,
            "datePublished": page.date,
            "dateModified": new Date().toISOString().split('T')[0],
            "author": {
                "@type": "Person",
                "name": page.author,
                "url": `https://screensizechecker.com${langPrefix}/about`
            },
            "publisher": {
                "@type": "Organization",
                "name": "Screen Size Checker",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://screensizechecker.com/favicon.png"
                }
            },
            "image": page.featuredImage ? `https://screensizechecker.com/images/${page.featuredImage}` : "https://screensizechecker.com/favicon.png",
            "keywords": page.keywords,
            "articleSection": page.category,
            "inLanguage": page.lang
        };
    }

    generateFaqSchemaScript(page) {
        const faqItems = this.extractFaqItems(page.rawContent);
        if (faqItems.length < 2) {
            return '';
        }

        const faqStructuredData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        };

        return '<script type="application/ld+json">\n' + JSON.stringify(faqStructuredData, null, 2) + '\n</script>';
    }

    extractFaqItems(rawContent) {
        if (!rawContent) {
            return [];
        }

        const faqStartMatch = rawContent.match(/^##\s+(Frequently Asked Questions|Questions Fréquentes|Preguntas Frecuentes|Preguntas frecuentes|Häufig gestellte Fragen|Perguntas Frequentes|常见问题)\s*$/im);
        if (!faqStartMatch) {
            return [];
        }

        const faqContent = rawContent.slice(faqStartMatch.index + faqStartMatch[0].length);
        const nextSectionMatch = faqContent.match(/\n##\s+(?!#)/);
        const sectionContent = nextSectionMatch ? faqContent.slice(0, nextSectionMatch.index) : faqContent;
        const questionMatches = Array.from(sectionContent.matchAll(/^###\s+(.+?)\s*$/gm));

        return questionMatches.map((match, index) => {
            const answerStart = match.index + match[0].length;
            const answerEnd = index + 1 < questionMatches.length ? questionMatches[index + 1].index : sectionContent.length;
            const answer = sectionContent.slice(answerStart, answerEnd)
                .replace(/```[\s\S]*?```/g, ' ')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/(Related Gaming Resources|Ressources Gaming|Recursos de Gaming|Recursos de Jogos Relacionados|Verwandte Gaming-Ressourcen|相关游戏资源)[\s\S]*$/i, ' ')
                .replace(/(Last Updated|Dernière mise à jour|Última actualización|Última Atualização|Zuletzt aktualisiert|最后更新)[\s\S]*$/i, ' ')
                .replace(/[*_`>#-]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            return {
                question: match[1].trim(),
                answer
            };
        }).filter(item => item.question && item.answer);
    }
    
    /**
     * 生成相关内容推荐
     */
    generateRelatedContent(page) {
        // 查找同分类的其他页面（最多3个）
        const relatedPages = [];
        const categoryPages = this.categories.get(page.category) || [];
        
        for (const p of categoryPages) {
            if (p.id !== page.id && p.lang === page.lang && relatedPages.length < 3) {
                relatedPages.push(p);
            }
        }
        
        if (relatedPages.length === 0) return '';
        
        const langPrefix = page.lang === 'en' ? '' : `/${page.lang}`;
        
        return `<aside class="hub-related">
    <h2>Related Content</h2>
    <div class="hub-related-grid">
        ${relatedPages.map(p => `
        <a href="${langPrefix}/hub/${p.slug}" class="hub-related-card">
            <h3>${p.title}</h3>
            <p>${p.description.substring(0, 120)}...</p>
            <span class="hub-related-cta">Read More →</span>
        </a>
        `).join('')}
    </div>
</aside>`;
    }
    
    /**
     * 格式化日期
     */
    formatDate(dateString, lang) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        const locales = {
            'en': 'en-US',
            'zh': 'zh-CN',
            'de': 'de-DE',
            'es': 'es-ES',
            'pt': 'pt-BR'
        };
        
        return date.toLocaleDateString(locales[lang] || 'en-US', options);
    }
    
    /**
     * 格式化分类名称
     */
    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
    
    /**
     * 更新pages-config.json以包含Hub页面配置
     */
    updatePagesConfig() {
        console.log('\n Updating pages configuration with Hub pages...');
        
        try {
            const configPath = path.join(__dirname, 'pages-config.json');
            
            // 读取现有配置
            let config = { pages: [] };
            let originalConfigText = '';
            let originalConfig = { pages: [] };
            if (fs.existsSync(configPath)) {
                originalConfigText = fs.readFileSync(configPath, 'utf8');
                originalConfig = JSON.parse(originalConfigText);
                config = JSON.parse(originalConfigText);
            }
            const firstHubPageIndex = config.pages.findIndex(
                page => typeof page?.name === 'string' && page.name.startsWith('hub-')
            );
            const existingHubPagesByName = new Map(
                config.pages
                    .filter(page => typeof page?.name === 'string' && page.name.startsWith('hub-'))
                    .map(page => [page.name, page])
            );
            
            // 移除旧的Hub页面配置
            config.pages = config.pages.filter(page => !page.name.startsWith('hub-'));
            const generatedPages = [];
            
            // 为每个Hub页面添加配置
            this.languages.forEach(lang => {
                const langPrefix = lang === 'en' ? '' : `/${lang}`;
                const langPrefixFile = lang === 'en' ? '' : lang + '/';
                
                // 获取该语言的Hub页面
                const hubPages = Array.from(this.hubPages.values())
                    .filter(page => page.lang === lang);
                
                hubPages.forEach(page => {
                    const pageName = `hub-${page.slug}-${lang}`;
                    const existingPage = existingHubPagesByName.get(pageName);
                    const existingHubDate = existingPage?.config?.hub_date;

                    generatedPages.push({
                        name: pageName,
                        template: 'hub-page',
                        output: `hub/${page.slug}.html`,
                        page_content: `hub-${page.slug}-${lang}`,
                        enabled_languages: [lang],
                        config: {
                            page_title: page.title,
                            page_description: page.description,
                            page_keywords: page.keywords,
                            canonical_url: `https://screensizechecker.com${langPrefix}/hub/${page.slug}`,
                            og_title: page.title,
                            og_description: page.description,
                            og_type: 'article',
                            og_url: `https://screensizechecker.com${langPrefix}/hub/${page.slug}`,
                            og_image: page.featuredImage ? `https://screensizechecker.com/images/${page.featuredImage}` : 'https://screensizechecker.com/favicon.png',
                            css_path: lang === 'en' ? '../css' : '../../css',
                            locales_path: lang === 'en' ? '../locales' : '../../locales',
                            js_path: lang === 'en' ? '../js' : '../../js',
                            home_url: lang === 'en' ? '../index.html' : '../../index.html',
                            blog_url: lang === 'en' ? '../blog/index.html' : '../../blog/index.html',
                            privacy_policy_url: lang === 'en' ? '../privacy-policy.html' : '../../privacy-policy.html',
                            show_breadcrumb: true,
                            current_key: page.slug,
                            current_name: page.title,
                            parent_url: '../index.html',
                            parent_key: 'hub',
                            parent_name: 'Hub',
                            hub_category: page.category,
                            hub_tags: page.tags,
                            hub_date: existingHubDate || page.date,
                            hub_reading_time: page.readingTime,
                            hub_author: page.author,
                            structured_data: this.generateSchema(page),
                            faq_structured_data: this.generateFaqSchemaScript(page),
                            // 导航状态标识
                            is_home: false,
                            is_blog: false,
                            is_tools: false,
                            is_devices: false,
                            is_gaming: true
                        }
                    });
                });
            });

            if (generatedPages.length > 0) {
                const insertIndex = firstHubPageIndex === -1
                    ? config.pages.length
                    : Math.min(firstHubPageIndex, config.pages.length);
                config.pages.splice(insertIndex, 0, ...generatedPages);
            }
            
            // 保存更新后的配置
            const nextConfigText = `${JSON.stringify(config, null, 2)}\n`;
            if (JSON.stringify(config) === JSON.stringify(originalConfig)) {
                console.log(' Pages configuration unchanged.');
            } else {
                fs.writeFileSync(configPath, nextConfigText, 'utf8');
                console.log(' Pages configuration updated with Hub pages successfully!');
            }
            
            return true;
        } catch (error) {
            console.error(' Error updating pages configuration:', error.message);
            return false;
        }
    }
    
    /**
     * 构建整个Hub系统
     */
    build() {
        console.log('\n Starting Hub Builder...\n');
        
        try {
            // 1. 加载Hub页面
            this.loadHubPages();
            
            // 2. 生成组件
            this.generateHubComponents();
            
            // 3. 更新pages配置
            this.updatePagesConfig();
            
            console.log('\n Hub system build completed successfully!\n');
            
            return {
                success: true,
                pagesGenerated: this.hubPages.size
            };
            
        } catch (error) {
            console.error('\n Hub build failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 如果直接运行此脚本，执行构建
if (require.main === module) {
    const hubBuilder = new HubBuilder();
    hubBuilder.build();
}

module.exports = HubBuilder;
