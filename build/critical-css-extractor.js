/**
 * 关键CSS提取器 - 构建时工具
 * 用于在构建过程中自动提取关键CSS并内联到HTML中
 */

const fs = require('fs').promises;
const path = require('path');

class CriticalCSSExtractor {
    constructor(config = {}) {
        this.config = {
            // 关键CSS选择器模式
            criticalSelectors: [
                // 基础元素
                'html', 'body', '*',
                // CSS变量定义
                ':root', '[data-theme="dark"]',
                // 布局容器
                '.main-content', '.container', '.hero-section',
                // 头部导航
                '.header', '.header-container', '.nav-menu',
                // 首屏内容
                '.hero-title', '.hero-subtitle', '.hero-secondary',
                '.info-dashboard', '.dashboard-container',
                '.info-card', '.card-header', '.card-title',
                // 关键交互元素
                '.copy-btn', '.theme-toggle', '.language-toggle',
                // 响应式断点
                '@media (max-width: 768px)',
                '@media (max-width: 480px)',
                '@media (min-width: 769px)'
            ],
            
            // 关键CSS文件路径
            criticalCSSFiles: [
                'css/main.css',
                'css/base.css'
            ],
            
            // 输出配置
            outputDir: 'multilang-build',
            inlineThreshold: 50 * 1024, // 50KB
            enableMinification: true,
            
            ...config
        };
        
        this.extractedCSS = '';
        this.stats = {
            totalRules: 0,
            criticalRules: 0,
            originalSize: 0,
            extractedSize: 0,
            compressionRatio: 0
        };
    }
    
    /**
     * 从CSS文件中提取关键CSS
     */
    async extractCriticalCSS() {
        console.log('🎨 Extracting critical CSS...');
        
        const criticalRules = [];
        
        for (const cssFile of this.config.criticalCSSFiles) {
            try {
                const cssContent = await fs.readFile(cssFile, 'utf8');
                const rules = this.parseCSSRules(cssContent);
                
                this.stats.totalRules += rules.length;
                this.stats.originalSize += cssContent.length;
                
                for (const rule of rules) {
                    if (this.isCriticalRule(rule)) {
                        criticalRules.push(rule.cssText);
                        this.stats.criticalRules++;
                    }
                }
                
                console.log(`📄 Processed ${cssFile}: ${rules.length} rules`);
            } catch (error) {
                console.error(`❌ Error reading CSS file ${cssFile}:`, error);
            }
        }
        
        this.extractedCSS = criticalRules.join('\n');
        this.stats.extractedSize = this.extractedCSS.length;
        this.stats.compressionRatio = this.stats.originalSize > 0 ? 
            (this.stats.extractedSize / this.stats.originalSize * 100).toFixed(2) : 0;
        
        console.log(`✅ Critical CSS extracted: ${this.stats.criticalRules}/${this.stats.totalRules} rules`);
        console.log(`📊 Size: ${this.stats.extractedSize} bytes (${this.stats.compressionRatio}% of original)`);
        
        return this.extractedCSS;
    }
    
    /**
     * 简单的CSS规则解析器
     */
    parseCSSRules(cssContent) {
        const rules = [];
        
        // 移除注释
        cssContent = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // 分割规则（简化版本）
        const ruleMatches = cssContent.match(/[^{}]+\{[^{}]*\}/g) || [];
        
        ruleMatches.forEach(ruleText => {
            const match = ruleText.match(/^([^{]+)\{([^}]*)\}$/);
            if (match) {
                const selector = match[1].trim();
                const declarations = match[2].trim();
                
                rules.push({
                    selector,
                    declarations,
                    cssText: `${selector} { ${declarations} }`
                });
            }
        });
        
        // 处理媒体查询
        const mediaMatches = cssContent.match(/@media[^{]+\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
        
        mediaMatches.forEach(mediaRule => {
            const mediaMatch = mediaRule.match(/^(@media[^{]+)\{([\s\S]*)\}$/);
            if (mediaMatch) {
                const mediaQuery = mediaMatch[1].trim();
                const mediaContent = mediaMatch[2].trim();
                
                rules.push({
                    selector: mediaQuery,
                    declarations: mediaContent,
                    cssText: mediaRule,
                    isMediaQuery: true
                });
            }
        });
        
        return rules;
    }
    
    /**
     * 判断CSS规则是否为关键规则
     */
    isCriticalRule(rule) {
        const selector = rule.selector;
        
        // 媒体查询处理
        if (rule.isMediaQuery) {
            return this.isCriticalMediaQuery(selector);
        }
        
        // 检查是否匹配关键选择器
        return this.config.criticalSelectors.some(criticalSelector => {
            if (criticalSelector.startsWith('@media')) {
                return false; // 媒体查询单独处理
            }
            
            // 精确匹配或包含匹配
            return selector === criticalSelector || 
                   selector.includes(criticalSelector) ||
                   this.matchesCriticalPattern(selector);
        });
    }
    
    /**
     * 匹配关键CSS模式
     */
    matchesCriticalPattern(selector) {
        const criticalPatterns = [
            /^body/, /^html/, /^\*/, /^:root/,
            /\.hero-/, /\.header/, /\.main-content/,
            /\.info-card/, /\.dashboard-/,
            /\.btn-primary/, /\.copy-btn/,
            /\[data-theme/, /\.theme-/,
            /\.container/, /\.nav-/
        ];
        
        return criticalPatterns.some(pattern => pattern.test(selector));
    }
    
    /**
     * 判断是否为关键媒体查询
     */
    isCriticalMediaQuery(mediaQuery) {
        const criticalMediaQueries = [
            'max-width: 768px',
            'max-width: 480px',
            'min-width: 769px',
            'prefers-color-scheme'
        ];
        
        return criticalMediaQueries.some(query => mediaQuery.includes(query));
    }
    
    /**
     * 压缩CSS
     */
    minifyCSS(css) {
        if (!this.config.enableMinification) {
            return css;
        }
        
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
            .replace(/\s+/g, ' ') // 压缩空白
            .replace(/;\s*}/g, '}') // 移除最后一个分号
            .replace(/\s*{\s*/g, '{') // 压缩大括号
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';') // 压缩分号
            .replace(/\s*:\s*/g, ':') // 压缩冒号
            .replace(/,\s+/g, ',') // 压缩逗号
            .trim();
    }
    
    /**
     * 将关键CSS内联到HTML文件中
     */
    async inlineCriticalCSSToHTML(htmlFilePath) {
        try {
            let htmlContent = await fs.readFile(htmlFilePath, 'utf8');
            
            // 检查是否已经有内联的关键CSS
            if (htmlContent.includes('data-critical="true"')) {
                console.log(`⚠️ Critical CSS already inlined in ${htmlFilePath}`);
                return htmlContent;
            }
            
            // 压缩关键CSS
            const minifiedCSS = this.minifyCSS(this.extractedCSS);
            
            // 检查大小限制
            if (minifiedCSS.length > this.config.inlineThreshold) {
                console.warn(`⚠️ Critical CSS size (${minifiedCSS.length} bytes) exceeds threshold (${this.config.inlineThreshold} bytes) for ${htmlFilePath}`);
                // 可以选择截取或跳过内联
                return htmlContent;
            }
            
            // 创建内联样式标签
            const inlineStyle = `
    <style data-critical="true" data-generated="build-time">
/* Critical CSS - Generated at build time */
${minifiedCSS}
    </style>`;
            
            // 在head标签中插入关键CSS（在其他样式表之前）
            const headMatch = htmlContent.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);
            if (headMatch) {
                const headStart = headMatch[1];
                const headContent = headMatch[2];
                const headEnd = headMatch[3];
                
                // 在第一个link或style标签之前插入
                const firstStyleOrLink = headContent.search(/<(?:link[^>]*rel=["']stylesheet["']|style)/i);
                
                let newHeadContent;
                if (firstStyleOrLink !== -1) {
                    newHeadContent = headContent.slice(0, firstStyleOrLink) + 
                                   inlineStyle + '\n    ' + 
                                   headContent.slice(firstStyleOrLink);
                } else {
                    // 如果没有找到样式表，就添加到head的末尾
                    newHeadContent = headContent + inlineStyle + '\n    ';
                }
                
                htmlContent = headStart + newHeadContent + headEnd;
                
                console.log(`✅ Critical CSS inlined to ${htmlFilePath} (${minifiedCSS.length} bytes)`);
            } else {
                console.error(`❌ Could not find head tag in ${htmlFilePath}`);
            }
            
            return htmlContent;
        } catch (error) {
            console.error(`❌ Error inlining critical CSS to ${htmlFilePath}:`, error);
            return null;
        }
    }
    
    /**
     * 处理构建目录中的所有HTML文件
     */
    async processHTMLFiles() {
        console.log('🔄 Processing HTML files for critical CSS inlining...');
        
        const processedFiles = [];
        
        try {
            // 递归查找所有HTML文件
            const htmlFiles = await this.findHTMLFiles(this.config.outputDir);
            
            for (const htmlFile of htmlFiles) {
                const updatedContent = await this.inlineCriticalCSSToHTML(htmlFile);
                
                if (updatedContent) {
                    await fs.writeFile(htmlFile, updatedContent, 'utf8');
                    processedFiles.push(htmlFile);
                }
            }
            
            console.log(`✅ Processed ${processedFiles.length} HTML files`);
            return processedFiles;
        } catch (error) {
            console.error('❌ Error processing HTML files:', error);
            return [];
        }
    }
    
    /**
     * 递归查找HTML文件
     */
    async findHTMLFiles(dir) {
        const htmlFiles = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    const subFiles = await this.findHTMLFiles(fullPath);
                    htmlFiles.push(...subFiles);
                } else if (entry.isFile() && entry.name.endsWith('.html')) {
                    htmlFiles.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
        }
        
        return htmlFiles;
    }
    
    /**
     * 生成关键CSS文件（可选）
     */
    async generateCriticalCSSFile() {
        const outputPath = path.join(this.config.outputDir, 'css', 'critical.css');
        
        try {
            // 确保目录存在
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            
            const minifiedCSS = this.minifyCSS(this.extractedCSS);
            await fs.writeFile(outputPath, minifiedCSS, 'utf8');
            
            console.log(`✅ Critical CSS file generated: ${outputPath}`);
            return outputPath;
        } catch (error) {
            console.error('❌ Error generating critical CSS file:', error);
            return null;
        }
    }
    
    /**
     * 获取提取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            extractedCSSLength: this.extractedCSS.length,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * 运行完整的关键CSS提取和内联流程
     */
    async run() {
        console.log('🚀 Starting critical CSS extraction process...');
        
        try {
            // 1. 提取关键CSS
            await this.extractCriticalCSS();
            
            // 2. 内联到HTML文件
            const processedFiles = await this.processHTMLFiles();
            
            // 3. 生成独立的关键CSS文件（可选）
            await this.generateCriticalCSSFile();
            
            // 4. 输出统计信息
            const stats = this.getStats();
            console.log('📊 Critical CSS extraction completed:');
            console.log(`   - Total rules processed: ${stats.totalRules}`);
            console.log(`   - Critical rules extracted: ${stats.criticalRules}`);
            console.log(`   - Original size: ${stats.originalSize} bytes`);
            console.log(`   - Extracted size: ${stats.extractedSize} bytes`);
            console.log(`   - Compression ratio: ${stats.compressionRatio}%`);
            console.log(`   - HTML files processed: ${processedFiles.length}`);
            
            return {
                success: true,
                stats,
                processedFiles
            };
        } catch (error) {
            console.error('❌ Critical CSS extraction failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = CriticalCSSExtractor;

// 如果直接运行此脚本
if (require.main === module) {
    const extractor = new CriticalCSSExtractor();
    extractor.run().then(result => {
        if (result.success) {
            console.log('✅ Critical CSS extraction completed successfully');
            process.exit(0);
        } else {
            console.error('❌ Critical CSS extraction failed');
            process.exit(1);
        }
    });
}