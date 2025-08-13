const fs = require('fs');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');
const hljs = require('highlight.js');

/**
 * 博客构建器 - 扩展现有构建系统处理博客内容
 */
class BlogBuilder {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.blogContentPath = path.join(this.rootPath, 'blog-content');
        this.blogOutputPath = path.join(this.rootPath, 'components'); // 直接输出到components目录，而非子目录
        this.languages = ['en', 'zh']; // 支持的语言
        this.blogPosts = new Map(); // 存储所有博客文章
        this.categories = new Map(); // 按分类存储文章
        this.tags = new Map(); // 按标签存储文章
        
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
     * 为文章 HTML 内容中的 <img> 标签补齐性能属性
     * - 默认为所有图片添加 loading="lazy" 和 decoding="async"
     * - 若 URL 查询参数包含 width/height，且元素未声明，则补齐 width/height
     * - 可选：为首张图片设置 fetchpriority="high" 和 loading="eager"（用于未来首图场景）
     */
    enhanceImages(html, options = {}) {
        const { firstImageHighPriority = false } = options;
        let firstImgProcessed = false;
        
        return html.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (match, preAttrs, src, postAttrs) => {
            let attributes = (preAttrs + ' ' + postAttrs).trim();
            const hasLoading = /\bloading\s*=\s*(["'])(.*?)\1/i.test(attributes);
            const hasDecoding = /\bdecoding\s*=\s*(["'])(.*?)\1/i.test(attributes);
            const hasWidth = /\bwidth\s*=\s*(["'])(.*?)\1/i.test(attributes);
            const hasHeight = /\bheight\s*=\s*(["'])(.*?)\1/i.test(attributes);
            const hasFetchPriority = /\bfetchpriority\s*=\s*(["'])(.*?)\1/i.test(attributes);
            
            // 从 URL 尝试解析宽高（如 quickchart 的 width/height 参数）
            let widthParam = null;
            let heightParam = null;
            try {
                const urlObj = new URL(src);
                const sp = urlObj.searchParams;
                if (sp.has('width')) widthParam = sp.get('width');
                if (sp.has('height')) heightParam = sp.get('height');
            } catch (e) {
                // 相对路径或无效 URL，忽略
            }
            
            // 拼接需要新增的属性
            const additions = [];
            if (!hasLoading) additions.push(firstImageHighPriority && !firstImgProcessed ? 'loading="eager"' : 'loading="lazy"');
            if (!hasDecoding) additions.push('decoding="async"');
            if (!hasWidth && widthParam) additions.push(`width="${widthParam}"`);
            if (!hasHeight && heightParam) additions.push(`height="${heightParam}"`);
            if (firstImageHighPriority && !firstImgProcessed && !hasFetchPriority) additions.push('fetchpriority="high"');
            
            // 生成新的 <img> 标签
            const newTag = `<img src="${src}"${attributes ? ' ' + attributes.trim() : ''}${additions.length ? ' ' + additions.join(' ') : ''}>`;
            if (firstImageHighPriority && !firstImgProcessed) firstImgProcessed = true;
            return newTag;
        });
    }
    
    /**
     * 确保必要的目录存在
     */
    ensureDirectories() {
        // 确保输出目录存在
        if (!fs.existsSync(this.blogOutputPath)) {
            fs.mkdirSync(this.blogOutputPath, { recursive: true });
        }
        
        // 确保每种语言的内容目录存在
        this.languages.forEach(lang => {
            const langPath = path.join(this.blogContentPath, lang);
            if (!fs.existsSync(langPath)) {
                fs.mkdirSync(langPath, { recursive: true });
            }
        });
    }
    
    /**
     * 从博客内容目录加载所有Markdown文件
     */
    loadBlogPosts() {
        console.log('\n🔍 Loading blog posts...');
        
        // 重置集合
        this.blogPosts.clear();
        this.categories.clear();
        this.tags.clear();
        
        // 遍历每种语言目录
        this.languages.forEach(lang => {
            const langPath = path.join(this.blogContentPath, lang);
            
            // 如果目录不存在，跳过
            if (!fs.existsSync(langPath)) {
                console.warn(`⚠️ Blog content directory for language ${lang} not found.`);
                return;
            }
            
            // 获取该语言下的所有Markdown文件
            const files = fs.readdirSync(langPath)
                .filter(file => file.endsWith('.md'));
            
            console.log(`📑 Found ${files.length} blog posts in ${lang} language.`);
            
            // 处理每个文件
            files.forEach(file => {
                const filePath = path.join(langPath, file);
                try {
                    // 解析Markdown和前置元数据
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const { data, content } = matter(fileContent);
                    
                    // 检查必要的元数据
                    if (!data.title) {
                        console.warn(`⚠️ Blog post ${file} missing title metadata.`);
                        return;
                    }
                    
                    // 生成唯一ID（使用文件名）
                    const id = path.basename(file, '.md');
                    const slug = id; // 使用文件名作为URL slug
                    
                    // 解析Markdown内容
                    const htmlContent = marked.parse(content);
                    
                    // 提取阅读时间（假设每分钟200字）
                    const wordCount = content.split(/\s+/).length;
                    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
                    
                    // 保存文章数据
                    const post = {
                        id,
                        slug,
                        lang,
                        title: data.title,
                        description: data.description || '',
                        date: data.date ? new Date(data.date) : new Date(),
                        author: data.author || 'Screen Size Checker Team',
                        category: data.category || 'uncategorized',
                        tags: data.tags || [],
                        featuredImage: data.featuredImage || '',
                        content: htmlContent,
                        readingTime
                    };
                    
                    // 使用语言+ID作为唯一键，便于后续处理
                    const postKey = `${lang}:${id}`;
                    this.blogPosts.set(postKey, post);
                    
                    // 按分类存储文章引用
                    if (!this.categories.has(lang)) {
                        this.categories.set(lang, new Map());
                    }
                    
                    const langCategories = this.categories.get(lang);
                    if (!langCategories.has(post.category)) {
                        langCategories.set(post.category, []);
                    }
                    
                    langCategories.get(post.category).push(postKey);
                    
                    // 按标签存储文章引用
                    if (!this.tags.has(lang)) {
                        this.tags.set(lang, new Map());
                    }
                    
                    const langTags = this.tags.get(lang);
                    post.tags.forEach(tag => {
                        if (!langTags.has(tag)) {
                            langTags.set(tag, []);
                        }
                        langTags.get(tag).push(postKey);
                    });
                    
                    console.log(`✅ Loaded: ${lang}/${file} (${post.title})`);
                    
                } catch (error) {
                    console.error(`❌ Error processing ${file}:`, error.message);
                }
            });
        });
        
        console.log(`📊 Total blog posts loaded: ${this.blogPosts.size}`);
    }
    
    /**
     * 生成博客文章组件
     */
    generateBlogComponents() {
        console.log('\n🔨 Generating blog components...');
        
        // 遍历每种语言的文章
        this.languages.forEach(lang => {
            console.log(`\n📝 Generating components for ${lang}...`);
            
            // 筛选该语言的文章
            const langPosts = Array.from(this.blogPosts.entries())
                .filter(([key]) => key.startsWith(`${lang}:`))
                .map(([_, post]) => post)
                .sort((a, b) => b.date - a.date); // 按日期倒序排序
            
            // 1. 生成博客文章组件
            langPosts.forEach(post => {
                const componentName = `blog-post-${post.id}-${lang}`;
                const componentContent = this.generatePostComponent(post);
                const componentPath = path.join(this.blogOutputPath, `${componentName}.html`);
                
                fs.writeFileSync(componentPath, componentContent, 'utf8');
                console.log(`✅ Generated component: ${componentName}.html`);
            });
            
            // 2. 生成博客首页组件
            const indexComponentName = `blog-index-${lang}`;
            const indexComponentContent = this.generateIndexComponent(langPosts, lang);
            const indexComponentPath = path.join(this.blogOutputPath, `${indexComponentName}.html`);
            
            fs.writeFileSync(indexComponentPath, indexComponentContent, 'utf8');
            console.log(`✅ Generated blog index component: ${indexComponentName}.html`);
            
            // 3. 生成分类页面组件
            if (this.categories.has(lang)) {
                const langCategories = this.categories.get(lang);
                
                langCategories.forEach((postKeys, category) => {
                    // 获取该分类下的所有文章
                    const categoryPosts = postKeys
                        .map(key => this.blogPosts.get(key))
                        .sort((a, b) => b.date - a.date); // 按日期倒序排序
                    
                    const categoryComponentName = `blog-category-${category}-${lang}`;
                    const categoryComponentContent = this.generateCategoryComponent(categoryPosts, category, lang);
                    const categoryComponentPath = path.join(this.blogOutputPath, `${categoryComponentName}.html`);
                    
                    fs.writeFileSync(categoryComponentPath, categoryComponentContent, 'utf8');
                    console.log(`✅ Generated category component: ${categoryComponentName}.html`);
                });
            }
            
            // 4. 生成标签页面组件
            if (this.tags.has(lang)) {
                const langTags = this.tags.get(lang);
                
                langTags.forEach((postKeys, tag) => {
                    // 获取该标签下的所有文章
                    const tagPosts = postKeys
                        .map(key => this.blogPosts.get(key))
                        .sort((a, b) => b.date - a.date); // 按日期倒序排序
                    
                    const tagComponentName = `blog-tag-${tag}-${lang}`;
                    const tagComponentContent = this.generateTagComponent(tagPosts, tag, lang);
                    const tagComponentPath = path.join(this.blogOutputPath, `${tagComponentName}.html`);
                    
                    fs.writeFileSync(tagComponentPath, tagComponentContent, 'utf8');
                    console.log(`✅ Generated tag component: ${tagComponentName}.html`);
                });
            }
        });
        
        // 4. 生成博客侧边栏组件（每种语言一个）
        this.languages.forEach(lang => {
            // 为博客首页生成侧边栏（相对路径不需要 ../）
            const sidebarComponentName = `blog-sidebar-${lang}`;
            const sidebarComponentContent = this.generateSidebarComponent(lang, false);
            const sidebarComponentPath = path.join(this.blogOutputPath, `${sidebarComponentName}.html`);
            
            fs.writeFileSync(sidebarComponentPath, sidebarComponentContent, 'utf8');
            console.log(`✅ Generated sidebar component: ${sidebarComponentName}.html`);
            
            // 为子页面（标签页面、分类页面）生成侧边栏（需要 ../）
            const sidebarSubComponentName = `blog-sidebar-sub-${lang}`;
            const sidebarSubComponentContent = this.generateSidebarComponent(lang, true);
            const sidebarSubComponentPath = path.join(this.blogOutputPath, `${sidebarSubComponentName}.html`);
            
            fs.writeFileSync(sidebarSubComponentPath, sidebarSubComponentContent, 'utf8');
            console.log(`✅ Generated sub-page sidebar component: ${sidebarSubComponentName}.html`);
        });
        
        console.log('\n✅ All blog components generated successfully!');
    }
    
    /**
     * 生成单篇博客文章组件
     */
    generatePostComponent(post) {
        // 增强文章内容中的图片标签（补齐性能属性）
        const enhancedContent = this.enhanceImages(post.content, { firstImageHighPriority: !!post.featuredImage });
        
        return `<!-- Blog Post: ${post.title} -->
<article class="blog-post">
    <header class="blog-post-header">
        <h1 class="blog-post-title">${post.title}</h1>
        <div class="blog-post-meta">
            <span class="blog-post-date">${post.date.toLocaleDateString(post.lang === 'zh' ? 'zh-CN' : 'en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</span>
            <span class="blog-post-author">${post.author}</span>
            <span class="blog-post-reading-time">${post.readingTime} ${post.lang === 'zh' ? '分钟阅读' : 'min read'}</span>
        </div>
        <!-- Featured image temporarily disabled until images are created -->
    </header>
    
    <div class="blog-post-content">
        ${enhancedContent}
    </div>
    
    <footer class="blog-post-footer">
        <div class="blog-post-tags">
            ${post.tags.map(tag => `<a href="tag/${tag}.html" class="tag-link">#${tag}</a>`).join(' ')}
        </div>
        <div class="blog-post-share">
            <span>${post.lang === 'zh' ? '分享' : 'Share'}: </span>
            <button class="share-btn share-twitter" data-url="/${post.lang}/blog/${post.slug}" data-title="${post.title}">Twitter</button>
            <button class="share-btn share-facebook" data-url="/${post.lang}/blog/${post.slug}" data-title="${post.title}">Facebook</button>
            <button class="share-btn share-linkedin" data-url="/${post.lang}/blog/${post.slug}" data-title="${post.title}">LinkedIn</button>
            <button class="share-btn share-copy" data-url="/${post.lang}/blog/${post.slug}">${post.lang === 'zh' ? '复制链接' : 'Copy Link'}</button>
        </div>
    </footer>
    
    <div class="blog-post-related">
        <h3>${post.lang === 'zh' ? '相关文章' : 'Related Articles'}</h3>
        <div class="blog-post-related-container">
            <!-- 相关文章将通过JS动态加载 -->
            <div class="related-posts-placeholder" data-post-id="${post.id}" data-post-lang="${post.lang}"></div>
        </div>
    </div>
</article>`;
    }
    
    /**
     * 生成博客首页组件
     */
    generateIndexComponent(posts, lang) {
        // 语言相关文本
        const texts = lang === 'zh' ? {
            title: '博客',
            subtitle: '探索屏幕尺寸与响应式设计的知识库',
            latest: '最新文章',
            readMore: '阅读全文',
            allCategories: '所有分类',
            viewAll: '查看全部'
        } : {
            title: 'Blog',
            subtitle: 'Explore our knowledge base on screen sizes and responsive design',
            latest: 'Latest Articles',
            readMore: 'Read More',
            allCategories: 'All Categories',
            viewAll: 'View All'
        };
        
        // 获取最新的5篇文章
        const featuredPosts = posts.slice(0, 5);
        
        // 获取所有分类
        const categories = this.categories.has(lang) ? 
            Array.from(this.categories.get(lang).keys()) : [];
        
        return `<!-- Blog Index Page -->
<section class="blog-hero">
    <div class="blog-hero-content">
        <h1 class="blog-hero-title" data-i18n="blog_title">${texts.title}</h1>
        <p class="blog-hero-subtitle" data-i18n="blog_subtitle">${texts.subtitle}</p>
    </div>
</section>

<section class="blog-featured">
    <div class="section-container">
        <h2 class="section-title" data-i18n="latest_articles">${texts.latest}</h2>
        
        <div class="blog-grid">
            ${featuredPosts.map((post, index) => `
            <div class="blog-card ${index === 0 ? 'blog-card-featured' : ''}">
                <!-- Card image temporarily disabled until images are created -->
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span class="blog-card-date">${post.date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                        <span class="blog-card-reading-time">${post.readingTime} ${lang === 'zh' ? '分钟阅读' : 'min read'}</span>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.description}</p>
                    <a href="${post.slug}.html" class="blog-card-link" data-i18n="read_more">${texts.readMore}</a>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>

<section class="blog-categories">
    <div class="section-container">
        <h2 class="section-title" data-i18n="all_categories">${texts.allCategories}</h2>
        
        <div class="categories-grid">
            ${categories.map(category => {
                const categoryPosts = this.categories.get(lang).get(category).length;
                return `
                <a href="category/${category}.html" class="category-card">
                    <h3 class="category-title">${category}</h3>
                    <p class="category-count">${categoryPosts} ${lang === 'zh' ? '篇文章' : 'articles'}</p>
                    <span class="category-link" data-i18n="view_all">${texts.viewAll} →</span>
                </a>
                `;
            }).join('')}
        </div>
    </div>
</section>`;
    }
    
    /**
     * 生成分类页面组件
     */
    generateCategoryComponent(posts, category, lang) {
        // 语言相关文本
        const texts = lang === 'zh' ? {
            title: `分类：${category}`,
            subtitle: '探索这个分类下的所有文章',
            readMore: '阅读全文',
            backToAll: '返回所有分类'
        } : {
            title: `Category: ${category}`,
            subtitle: 'Explore all articles in this category',
            readMore: 'Read More',
            backToAll: 'Back to all categories'
        };
        
        return `<!-- Blog Category Page: ${category} -->
<section class="blog-hero blog-hero-small">
    <div class="blog-hero-content">
        <h1 class="blog-hero-title" data-i18n="category_title">${texts.title}</h1>
        <p class="blog-hero-subtitle" data-i18n="category_subtitle">${texts.subtitle}</p>
        <a href="../index.html" class="blog-back-link" data-i18n="back_to_all">${texts.backToAll}</a>
    </div>
</section>

<section class="blog-listing">
    <div class="section-container">
        <div class="blog-grid blog-grid-list">
            ${posts.map(post => `
            <div class="blog-card blog-card-horizontal">
                <!-- Card image temporarily disabled until images are created -->
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span class="blog-card-date">${post.date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                        <span class="blog-card-reading-time">${post.readingTime} ${lang === 'zh' ? '分钟阅读' : 'min read'}</span>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.description}</p>
                    <a href="../${post.slug}.html" class="blog-card-link" data-i18n="read_more">${texts.readMore}</a>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>`;
    }
    
    /**
     * 生成标签页面组件
     */
    generateTagComponent(posts, tag, lang) {
        // 语言相关文本
        const texts = lang === 'zh' ? {
            title: `标签：${tag}`,
            subtitle: '探索这个标签下的所有文章',
            readMore: '阅读全文',
            backToAll: '返回所有标签'
        } : {
            title: `Tag: ${tag}`,
            subtitle: 'Explore all articles with this tag',
            readMore: 'Read More',
            backToAll: 'Back to all tags'
        };
        
        return `<!-- Blog Tag Page: ${tag} -->
<section class="blog-hero blog-hero-small">
    <div class="blog-hero-content">
        <h1 class="blog-hero-title" data-i18n="tag_title">${texts.title}</h1>
        <p class="blog-hero-subtitle" data-i18n="tag_subtitle">${texts.subtitle}</p>
        <a href="../index.html" class="blog-back-link" data-i18n="back_to_all">${texts.backToAll}</a>
    </div>
</section>

<section class="blog-listing">
    <div class="section-container">
        <div class="blog-grid blog-grid-list">
            ${posts.map(post => `
            <div class="blog-card blog-card-horizontal">
                <!-- Card image temporarily disabled until images are created -->
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span class="blog-card-date">${post.date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                        <span class="blog-card-reading-time">${post.readingTime} ${lang === 'zh' ? '分钟阅读' : 'min read'}</span>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.description}</p>
                    <div class="blog-card-tags">
                        ${post.tags.map(postTag => `<span class="tag ${postTag === tag ? 'tag-current' : ''}">#${postTag}</span>`).join(' ')}
                    </div>
                    <a href="../${post.slug}.html" class="blog-card-link" data-i18n="read_more">${texts.readMore}</a>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>`;
    }

    /**
     * 生成博客侧边栏组件
     */
    generateSidebarComponent(lang, isSubPage = false) {
        // 语言相关文本
        const texts = lang === 'zh' ? {
            categories: '分类',
            recentPosts: '最近文章',
            tags: '标签',
            readMore: '阅读全文'
        } : {
            categories: 'Categories',
            recentPosts: 'Recent Posts',
            tags: 'Tags',
            readMore: 'Read More'
        };
        
        // 获取最新的5篇文章
        const recentPosts = Array.from(this.blogPosts.entries())
            .filter(([key]) => key.startsWith(`${lang}:`))
            .map(([_, post]) => post)
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);
        
        // 获取所有分类
        const categories = this.categories.has(lang) ? 
            Array.from(this.categories.get(lang).entries()).map(([category, posts]) => {
                return { name: category, count: posts.length };
            }) : [];
        
        // 收集所有标签
        const tags = new Map();
        Array.from(this.blogPosts.entries())
            .filter(([key]) => key.startsWith(`${lang}:`))
            .forEach(([_, post]) => {
                post.tags.forEach(tag => {
                    tags.set(tag, (tags.get(tag) || 0) + 1);
                });
            });
        
        // 根据是否为子页面决定路径前缀
        const pathPrefix = isSubPage ? '../' : '';
        
        return `<!-- Blog Sidebar -->
<aside class="blog-sidebar">
    <div class="sidebar-section">
        <h3 class="sidebar-title" data-i18n="categories">${texts.categories}</h3>
        <ul class="sidebar-categories">
            ${categories.map(category => `
            <li>
                <a href="${pathPrefix}category/${category.name}.html" class="sidebar-category-link">
                    ${category.name} <span class="category-count">(${category.count})</span>
                </a>
            </li>
            `).join('')}
        </ul>
    </div>
    
    <div class="sidebar-section">
        <h3 class="sidebar-title" data-i18n="recent_posts">${texts.recentPosts}</h3>
        <ul class="sidebar-posts">
            ${recentPosts.map(post => `
            <li>
                <a href="${pathPrefix}${post.slug}.html" class="sidebar-post-link">
                    <span class="post-title">${post.title}</span>
                    <span class="post-date">${post.date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })}</span>
                </a>
            </li>
            `).join('')}
        </ul>
    </div>
    
    <div class="sidebar-section">
        <h3 class="sidebar-title" data-i18n="tags">${texts.tags}</h3>
        <div class="sidebar-tags">
            ${Array.from(tags.entries()).map(([tag, count]) => `
            <a href="${pathPrefix}tag/${tag}.html" class="tag-link">
                #${tag} <span class="tag-count">(${count})</span>
            </a>
            `).join(' ')}
        </div>
    </div>
</aside>`;
    }
    
    /**
     * 更新页面配置，添加博客页面
     */
    updatePagesConfig() {
        console.log('\n📝 Updating pages configuration...');
        
        const configPath = path.join(this.rootPath, 'build', 'pages-config.json');
        
        // 检查配置文件是否存在
        if (!fs.existsSync(configPath)) {
            console.error('❌ Pages configuration file not found.');
            return false;
        }
        
        try {
            // 读取现有配置
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // 检查是否已存在博客页面
            const blogPages = config.pages.filter(page => 
                page.output.includes('/blog/') || page.name.includes('blog'));
                
            if (blogPages.length > 0) {
                console.log('ℹ️ Blog pages already exist in configuration. Updating with latest blog content...');
                // Remove existing blog pages to regenerate them
                config.pages = config.pages.filter(page => !page.name.includes('blog-'));
            }
                // 为每种语言添加博客页面
                this.languages.forEach(lang => {
                    // 博客首页
                    config.pages.push({
                        name: `blog-index-${lang}`,
                        template: 'blog-index',
                        output: `blog/index.html`,
                        page_content: `blog-index-${lang}`,
                        enabled_languages: [lang],
                        config: {
                            page_title_key: 'blog_page_title',
                            page_description_key: 'blog_page_description',
                            page_heading_key: 'blog_page_heading',
                            page_intro_key: 'blog_page_intro',
                            page_keywords: 'blog, responsive design, viewport, screen resolution, web development',
                            canonical_url: `https://screensizechecker.com/${lang}/blog/`,
                            og_title: lang === 'zh' ? '屏幕尺寸检查器博客' : 'Screen Size Checker Blog',
                            og_description: lang === 'zh' ? 
                                '探索屏幕尺寸、视口和响应式设计的知识库' : 
                                'Explore our knowledge base on screen sizes, viewports, and responsive design',
                            og_type: 'website',
                            og_url: `https://screensizechecker.com/${lang}/blog/`,
                            css_path: '../../css',
                            locales_path: '../../locales',
                            js_path: '../../js',
                            home_url: `../index.html`,
                            blog_url: `index.html`,
                            privacy_policy_url: '../../privacy-policy.html',
                            show_breadcrumb: true,
                            current_key: 'blog',
                            current_name: lang === 'zh' ? '博客' : 'Blog',
                            parent_url: `../index.html`,
                            blog_sidebar: `blog-sidebar-${lang}`,
                            parent_key: 'home',
                            parent_name: lang === 'zh' ? '首页' : 'Home'
                        }
                    });
                    
                    // 遍历文章添加配置
                    Array.from(this.blogPosts.entries())
                        .filter(([key]) => key.startsWith(`${lang}:`))
                        .map(([_, post]) => post)
                        .forEach(post => {
                            config.pages.push({
                                name: `blog-post-${post.id}-${lang}`,
                                template: 'blog-post',
                                output: `blog/${post.slug}.html`,
                                page_content: `blog-post-${post.id}-${lang}`,
                                enabled_languages: [lang],
                                config: {
                                    page_title: post.title,
                                    page_description: post.description,
                                    page_keywords: post.tags.join(', '),
                                    canonical_url: `https://screensizechecker.com/${lang}/blog/${post.slug}`,
                                    og_title: post.title,
                                    og_description: post.description,
                                    og_type: 'article',
                                    og_url: `https://screensizechecker.com/${lang}/blog/${post.slug}`,
                                    css_path: '../../css',
                                    locales_path: '../../locales',
                                    js_path: '../../js',
                                    home_url: `../../index.html`,
                                    blog_url: `../index.html`,
                                    blog_sidebar: `blog-sidebar-${lang}`,
                                    privacy_policy_url: '../../privacy-policy.html',
                                    show_breadcrumb: true,
                                    current_key: post.title,
                                    current_name: post.title,
                                    parent_url: `../../${lang}/blog/index.html`,
                                    parent_key: 'blog',
                                    parent_name: lang === 'zh' ? '博客' : 'Blog',
                                    structured_data: {
                                        '@context': 'https://schema.org',
                                        '@type': 'BlogPosting',
                                        'headline': post.title,
                                        'description': post.description,
                                        'author': {
                                            '@type': 'Person',
                                            'name': post.author
                                        },
                                        'datePublished': post.date.toISOString(),
                                        'publisher': {
                                            '@type': 'Organization',
                                            'name': 'Screen Size Checker',
                                            'logo': {
                                                '@type': 'ImageObject',
                                                'url': 'https://screensizechecker.com/favicon.png'
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    
                    // 遍历分类添加配置
                    if (this.categories.has(lang)) {
                        Array.from(this.categories.get(lang).keys()).forEach(category => {
                            config.pages.push({
                                name: `blog-category-${category}-${lang}`,
                                template: 'blog-category',
                                output: `blog/category/${category}.html`,
                                page_content: `blog-category-${category}-${lang}`,
                                enabled_languages: [lang],
                                config: {
                                    page_title: lang === 'zh' ? `分类: ${category}` : `Category: ${category}`,
                                    page_description: lang === 'zh' ? 
                                        `浏览${category}分类中的所有文章` : 
                                        `Browse all articles in the ${category} category`,
                                    page_keywords: `blog, ${category}, ${lang === 'zh' ? '分类' : 'category'}`,
                                    canonical_url: `https://screensizechecker.com/${lang}/blog/category/${category}`,
                                    og_title: lang === 'zh' ? `分类: ${category}` : `Category: ${category}`,
                                    og_description: lang === 'zh' ? 
                                        `浏览${category}分类中的所有文章` : 
                                        `Browse all articles in the ${category} category`,
                                    og_type: 'website',
                                    og_url: `https://screensizechecker.com/${lang}/blog/category/${category}`,
                                    css_path: '../../../css',
                                    locales_path: '../../../locales',
                                    js_path: '../../../js',
                                    home_url: `../../../${lang}/index.html`,
                                    blog_url: `../../../${lang}/blog/index.html`,
                                    privacy_policy_url: '../../../privacy-policy.html',
                                    show_breadcrumb: true,
                                    current_key: category,
                                    current_name: category,
                                    parent_url: `../../index.html`,
                                    blog_sidebar: `blog-sidebar-sub-${lang}`,
                                    parent_key: 'blog',
                                    parent_name: lang === 'zh' ? '博客' : 'Blog'
                                }
                            });
                        });
                    }
                    
                    // 遍历标签添加配置
                    if (this.tags.has(lang)) {
                        Array.from(this.tags.get(lang).keys()).forEach(tag => {
                            config.pages.push({
                                name: `blog-tag-${tag}-${lang}`,
                                template: 'blog-tag',
                                output: `blog/tag/${tag}.html`,
                                page_content: `blog-tag-${tag}-${lang}`,
                                enabled_languages: [lang],
                                config: {
                                    page_title: lang === 'zh' ? `标签: ${tag}` : `Tag: ${tag}`,
                                    page_description: lang === 'zh' ? 
                                        `浏览${tag}标签下的所有文章` : 
                                        `Browse all articles tagged with ${tag}`,
                                    page_keywords: `blog, ${tag}, ${lang === 'zh' ? '标签' : 'tag'}`,
                                    canonical_url: `https://screensizechecker.com/${lang}/blog/tag/${tag}`,
                                    og_title: lang === 'zh' ? `标签: ${tag}` : `Tag: ${tag}`,
                                    og_description: lang === 'zh' ? 
                                        `浏览${tag}标签下的所有文章` : 
                                        `Browse all articles tagged with ${tag}`,
                                    og_type: 'website',
                                    og_url: `https://screensizechecker.com/${lang}/blog/tag/${tag}`,
                                    css_path: '../../../css',
                                    locales_path: '../../../locales',
                                    js_path: '../../../js',
                                    home_url: `../../../${lang}/index.html`,
                                    blog_url: `../../../${lang}/blog/index.html`,
                                    privacy_policy_url: '../../../privacy-policy.html',
                                    show_breadcrumb: true,
                                    current_key: tag,
                                    current_name: `#${tag}`,
                                    parent_url: `../../index.html`,
                                    blog_sidebar: `blog-sidebar-sub-${lang}`,
                                    parent_key: 'blog',
                                    parent_name: lang === 'zh' ? '博客' : 'Blog'
                                }
                            });
                        });
                    }
                });
                
                // 保存更新后的配置
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                console.log('✅ Pages configuration updated successfully!');
            
            return true;
        } catch (error) {
            console.error('❌ Error updating pages configuration:', error.message);
            return false;
        }
    }
    
    /**
     * 运行完整的博客构建过程
     */
    build() {
        console.log('\n🚀 Starting blog system build...');
        
        // 加载博客文章
        this.loadBlogPosts();
        
        // 生成组件
        this.generateBlogComponents();
        
        // 更新页面配置
        this.updatePagesConfig();
        
        console.log('\n✨ Blog system build completed!');
        
        return {
            posts: this.blogPosts.size,
            languages: this.languages,
            categories: Array.from(this.categories.entries()).map(([lang, categories]) => {
                return {
                    lang,
                    categories: Array.from(categories.keys())
                };
            })
        };
    }
}

// 如果直接运行此脚本，执行构建
if (require.main === module) {
    const blogBuilder = new BlogBuilder();
    blogBuilder.build();
}

module.exports = BlogBuilder; 