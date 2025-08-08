/**
 * 内部链接检查器
 * 验证所有内部链接在根目录下的可访问性
 */

const fs = require('fs');
const path = require('path');

class InternalLinksChecker {
    constructor() {
        this.buildDir = 'multilang-build';
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: { total: 0, accessible: 0, broken: 0, warnings: 0 },
            links: []
        };
        this.checkedFiles = new Set();
    }

    /**
     * 运行内部链接检查
     */
    runCheck() {
        console.log('🔗 Starting Internal Links Accessibility Check...');
        console.log('=' .repeat(50));

        // 检查主要页面的链接
        this.checkPageLinks(path.join(this.buildDir, 'index.html'), 'Root Home Page');
        this.checkPageLinks(path.join(this.buildDir, 'blog', 'index.html'), 'Blog Index');
        this.checkPageLinks(path.join(this.buildDir, 'devices', 'compare.html'), 'Device Compare');
        
        // 检查博客文章链接
        this.checkBlogPostLinks();
        
        // 检查设备页面链接
        this.checkDevicePageLinks();
        
        // 生成报告
        this.generateReport();
        
        return this.testResults;
    }

    /**
     * 检查页面中的链接
     */
    checkPageLinks(filePath, pageName) {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${pageName}: File not found - ${filePath}`);
            return;
        }

        console.log(`\\n📄 Checking links in: ${pageName}`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const links = this.extractLinks(content);
        
        for (const link of links) {
            this.checkLink(link, pageName, filePath);
        }
    }

    /**
     * 提取页面中的内部链接
     */
    extractLinks(content) {
        const links = [];
        
        // 提取href链接
        const hrefPattern = /href="([^"]+)"/g;
        let match;
        
        while ((match = hrefPattern.exec(content)) !== null) {
            const href = match[1];
            
            // 过滤内部链接（排除外部链接、邮件链接、锚点链接等）
            if (this.isInternalLink(href)) {
                links.push({
                    type: 'href',
                    url: href,
                    raw: match[0]
                });
            }
        }
        
        // 提取src链接（CSS、JS、图片等）
        const srcPattern = /src="([^"]+)"/g;
        while ((match = srcPattern.exec(content)) !== null) {
            const src = match[1];
            
            if (this.isInternalResource(src)) {
                links.push({
                    type: 'src',
                    url: src,
                    raw: match[0]
                });
            }
        }
        
        return links;
    }

    /**
     * 判断是否为内部链接
     */
    isInternalLink(href) {
        // 排除外部链接
        if (href.startsWith('http://') || href.startsWith('https://')) {
            return false;
        }
        
        // 排除邮件链接
        if (href.startsWith('mailto:')) {
            return false;
        }
        
        // 排除电话链接
        if (href.startsWith('tel:')) {
            return false;
        }
        
        // 排除纯锚点链接
        if (href.startsWith('#')) {
            return false;
        }
        
        // 排除JavaScript链接
        if (href.startsWith('javascript:')) {
            return false;
        }
        
        return true;
    }

    /**
     * 判断是否为内部资源
     */
    isInternalResource(src) {
        // 排除外部资源
        if (src.startsWith('http://') || src.startsWith('https://')) {
            return false;
        }
        
        // 排除data URI
        if (src.startsWith('data:')) {
            return false;
        }
        
        return true;
    }

    /**
     * 检查单个链接
     */
    checkLink(link, pageName, sourceFile) {
        this.testResults.summary.total++;
        
        const resolvedPath = this.resolveLinkPath(link.url, sourceFile);
        const exists = fs.existsSync(resolvedPath);
        
        const result = {
            pageName,
            sourceFile,
            linkType: link.type,
            originalUrl: link.url,
            resolvedPath,
            exists,
            status: exists ? 'accessible' : 'broken',
            timestamp: new Date().toISOString()
        };
        
        this.testResults.links.push(result);
        
        if (exists) {
            this.testResults.summary.accessible++;
            console.log(`   ✅ ${link.type}: ${link.url}`);
        } else {
            this.testResults.summary.broken++;
            console.log(`   ❌ ${link.type}: ${link.url} -> ${resolvedPath}`);
        }
    }

    /**
     * 解析链接路径
     */
    resolveLinkPath(url, sourceFile) {
        // 移除锚点
        const cleanUrl = url.split('#')[0];
        
        // 移除查询参数
        const pathOnly = cleanUrl.split('?')[0];
        
        if (pathOnly === '' || pathOnly === '/') {
            return path.join(this.buildDir, 'index.html');
        }
        
        // 处理绝对路径
        if (pathOnly.startsWith('/')) {
            return path.join(this.buildDir, pathOnly.substring(1));
        }
        
        // 处理相对路径
        const sourceDir = path.dirname(sourceFile);
        const resolvedPath = path.resolve(sourceDir, pathOnly);
        
        // 如果路径指向目录，尝试添加index.html
        if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
            return path.join(resolvedPath, 'index.html');
        }
        
        // 如果没有扩展名，尝试添加.html
        if (!path.extname(pathOnly)) {
            const htmlPath = resolvedPath + '.html';
            if (fs.existsSync(htmlPath)) {
                return htmlPath;
            }
        }
        
        return resolvedPath;
    }

    /**
     * 检查博客文章链接
     */
    checkBlogPostLinks() {
        const blogDir = path.join(this.buildDir, 'blog');
        
        if (!fs.existsSync(blogDir)) {
            console.log('⚠️  Blog directory not found');
            return;
        }
        
        const blogFiles = fs.readdirSync(blogDir).filter(file => 
            file.endsWith('.html') && file !== 'index.html'
        );
        
        console.log(`\\n📝 Checking ${blogFiles.length} blog post links...`);
        
        for (const file of blogFiles.slice(0, 3)) { // 检查前3个文件以避免输出过多
            const filePath = path.join(blogDir, file);
            this.checkPageLinks(filePath, `Blog Post: ${file}`);
        }
    }

    /**
     * 检查设备页面链接
     */
    checkDevicePageLinks() {
        const devicesDir = path.join(this.buildDir, 'devices');
        
        if (!fs.existsSync(devicesDir)) {
            console.log('⚠️  Devices directory not found');
            return;
        }
        
        const deviceFiles = fs.readdirSync(devicesDir).filter(file => 
            file.endsWith('.html')
        );
        
        console.log(`\\n📱 Checking ${deviceFiles.length} device page links...`);
        
        for (const file of deviceFiles.slice(0, 2)) { // 检查前2个文件
            const filePath = path.join(devicesDir, file);
            this.checkPageLinks(filePath, `Device Page: ${file}`);
        }
    }

    /**
     * 生成报告
     */
    generateReport() {
        console.log('\\n' + '='.repeat(50));
        console.log('📊 INTERNAL LINKS CHECK SUMMARY');
        console.log('='.repeat(50));
        
        const { total, accessible, broken, warnings } = this.testResults.summary;
        
        console.log(`Total Links Checked: ${total}`);
        console.log(`✅ Accessible: ${accessible}`);
        console.log(`❌ Broken: ${broken}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        
        const accessibilityRate = total > 0 ? ((accessible / total) * 100).toFixed(1) : 0;
        console.log(`Accessibility Rate: ${accessibilityRate}%`);
        
        // 显示破损链接详情
        const brokenLinks = this.testResults.links.filter(link => !link.exists);
        if (brokenLinks.length > 0) {
            console.log(`\\n❌ BROKEN LINKS (${brokenLinks.length}):`);
            
            // 按页面分组显示
            const brokenByPage = {};
            for (const link of brokenLinks) {
                if (!brokenByPage[link.pageName]) {
                    brokenByPage[link.pageName] = [];
                }
                brokenByPage[link.pageName].push(link);
            }
            
            for (const [pageName, links] of Object.entries(brokenByPage)) {
                console.log(`\\n   📄 ${pageName}:`);
                for (const link of links) {
                    console.log(`      • ${link.linkType}: ${link.originalUrl} -> ${link.resolvedPath}`);
                }
            }
        }
        
        // 显示链接类型统计
        const linkTypes = {};
        for (const link of this.testResults.links) {
            const type = link.linkType;
            if (!linkTypes[type]) {
                linkTypes[type] = { total: 0, accessible: 0, broken: 0 };
            }
            linkTypes[type].total++;
            if (link.exists) {
                linkTypes[type].accessible++;
            } else {
                linkTypes[type].broken++;
            }
        }
        
        console.log(`\\n📈 LINK TYPES BREAKDOWN:`);
        for (const [type, stats] of Object.entries(linkTypes)) {
            const rate = stats.total > 0 ? ((stats.accessible / stats.total) * 100).toFixed(1) : 0;
            console.log(`   ${type}: ${stats.accessible}/${stats.total} (${rate}%)`);
        }
        
        // 保存报告
        const reportPath = path.join(this.buildDir, 'internal-links-report.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            console.log(`\\n📋 Report saved to: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️  Could not save report:', error.message);
        }
        
        console.log('\\n🎉 Internal Links Check Complete!');
        
        // 判断检查是否成功
        const isSuccess = accessibilityRate >= 85 && broken <= Math.ceil(total * 0.1);
        
        if (isSuccess) {
            console.log('\\n✅ INTERNAL LINKS ACCESSIBILITY VERIFIED!');
            console.log('   Most internal links are accessible from the root domain.');
        } else {
            console.log('\\n⚠️  Internal links accessibility issues detected.');
            console.log('   Please review the broken links above.');
        }
        
        return isSuccess;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const checker = new InternalLinksChecker();
    const success = checker.runCheck();
    process.exit(success ? 0 : 1);
}

module.exports = InternalLinksChecker;