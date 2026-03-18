const fs = require('fs');
const path = require('path');

class ComponentBuilder {
    constructor() {
        this.components = new Map();
        this.rootPath = path.join(__dirname, '..');
        this.loadComponents();
    }
    
    loadComponents() {
        const componentDir = path.join(this.rootPath, 'components');
        if (!fs.existsSync(componentDir)) {
            console.error('Components directory not found!');
            return;
        }
        
        const files = fs.readdirSync(componentDir);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                const name = path.basename(file, '.html');
                const filePath = path.join(componentDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                this.components.set(name, content);
                console.log(`Loaded component: ${name}`);
            }
        });
    }
    
    buildPage(templateName, pageData) {
        const templatePath = path.join(this.rootPath, 'templates', `${templateName}.html`);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template "${templateName}" not found at ${templatePath}`);
        }
        
        let html = fs.readFileSync(templatePath, 'utf8');
        
        // 统一的组件处理方法
        html = this.processAllComponents(html, pageData);
        
        return html;
    }
    
    // 统一处理所有类型的组件引用
    processAllComponents(html, pageData, depth = 0) {
        // 防止无限递归
        if (depth > 5) {
            console.warn(`Maximum recursion depth reached at depth ${depth}`);
            return html;
        }
        
        let result = html;
        let hasChanges = true;
        let iterations = 0;
        
        // 循环处理直到没有更多变化，确保所有嵌套都被处理
        while (hasChanges && iterations < 15) {
            const originalResult = result;
            iterations++;
            
            // 1. 首先处理最复杂的嵌套组件引用：{{component:{{variable}}}}
            result = result.replace(/\{\{component:\{\{(\w+)\}\}\}\}/g, (match, variableName) => {
                if (pageData[variableName]) {
                    const componentName = pageData[variableName];
                    const component = this.components.get(componentName);
                    if (component) {
                        return this.processAllComponents(component, pageData, depth + 1);
                    } else {
                        console.warn(`Component "${componentName}" not found (nested reference)`);
                        return `<!-- Component not found: ${componentName} -->`;
                    }
                }
                console.warn(`Variable "${variableName}" not found in pageData for nested component reference`);
                return `<!-- Variable not found: ${variableName} -->`;
            });
            
            // 2. 处理包含变量的组件引用：{{component:name-{{variable}}-suffix}}
            // 使用更精确的正则表达式来匹配这种模式
            result = result.replace(/\{\{component:([^{}]*\{\{[^{}]+\}\}[^{}]*)\}\}/g, (match, componentNameWithVar) => {
                // 先替换组件名中的变量
                let actualComponentName = componentNameWithVar;
                
                // 替换所有变量占位符
                actualComponentName = actualComponentName.replace(/\{\{(\w+)\}\}/g, (varMatch, varName) => {
                    return pageData[varName] || varMatch;
                });
                
                // 如果还有未替换的变量，跳过这次处理
                if (actualComponentName.includes('{{')) {
                    return match;
                }
                
                const component = this.components.get(actualComponentName);
                if (component) {
                    return this.processAllComponents(component, pageData, depth + 1);
                } else {
                    console.warn(`Component "${actualComponentName}" not found (variable in name)`);
                    return `<!-- Component not found: ${actualComponentName} -->`;
                }
            });
            
            // 3. 处理简单的组件引用：{{component:name}}
            result = result.replace(/\{\{component:([\w-]+)\}\}/g, (match, componentName) => {
                // 检查是否是变量引用
                if (pageData[componentName]) {
                    const actualComponentName = pageData[componentName];
                    const component = this.components.get(actualComponentName);
                    if (component) {
                        return this.processAllComponents(component, pageData, depth + 1);
                    }
                }
                
                // 直接组件引用
                const component = this.components.get(componentName);
                if (component) {
                    return this.processAllComponents(component, pageData, depth + 1);
                } else {
                    console.warn(`Component "${componentName}" not found (simple reference)`);
                    return `<!-- Component not found: ${componentName} -->`;
                }
            });
            
            // 4. 处理页面变量
            result = this.processVariables(result, pageData, depth);
            
            // 检查是否还有变化
            hasChanges = (result !== originalResult);
            
            // 如果还有未处理的组件引用，记录警告
            if (!hasChanges && result.includes('{{component:')) {
                console.warn(`Unprocessed component references found after ${iterations} iterations`);
                const matches = result.match(/\{\{component:[^}]+\}\}/g);
                if (matches) {
                    console.warn(`Unprocessed components: ${matches.join(', ')}`);
                }
                break;
            }
        }
        
        if (iterations >= 15) {
            console.warn(`Maximum iterations (15) reached in component processing`);
        }
        
        return result;
    }
    
    // 处理变量和条件表达式
    processVariables(content, data, depth = 0) {
        // 防止无限递归
        if (depth > 3) {
            return content;
        }
        
        let result = content;
        
        // 处理简单的变量替换 {{variable}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            if (data[key] !== undefined) {
                if (typeof data[key] === 'object') {
                    return JSON.stringify(data[key], null, 2);
                }
                
                // 检查变量值是否是组件名
                const variableValue = data[key];
                if (typeof variableValue === 'string' && this.components.has(variableValue)) {
                    // 如果是组件名，返回组件内容并递归处理
                    const component = this.components.get(variableValue);
                    return this.processVariables(component, data, depth + 1);
                }
                
                return variableValue;
            }
            // 如果变量未定义，返回空字符串而不是保留原始模板语法
            console.warn(`Template variable "${key}" is undefined, replacing with empty string`);
            return '';
        });
        
        // 处理条件语句 {{#if condition}}...{{/if}}
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
            if (data[condition]) {
                return content;
            }
            return '';
        });
        
        return result;
    }
    
    // 测试构建 - 生成测试页面但不替换现有文件
    testBuild() {
        console.log('\n Starting test build...');
        
        // 测试主页构建
        const indexData = {
            lang: 'en',
            page_title_key: 'page_title',
            page_title: 'Screen Size Checker - Detect Screen Size and Browser Information',
            page_description_key: 'page_description',
            page_description: 'Free tool to detect your screen resolution, browser viewport size, device pixel ratio and more.',
            page_keywords: 'screen size, viewport size, screen resolution, browser detection, device pixel ratio',
            canonical_url: 'https://screensizechecker.com/',
            og_title: 'Screen Size Checker - Detect Screen Size and Browser Information',
            og_description: 'Free tool to detect your screen resolution, browser viewport size, device pixel ratio and more.',
            og_type: 'website',
            og_url: 'https://screensizechecker.com/',
            css_path: 'css',
            locales_path: 'locales',
            js_path: 'js',
            home_url: 'index.html',
            privacy_policy_url: 'privacy-policy.html',
            show_breadcrumb: false,
            structured_data: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Screen Size Checker",
                "url": "https://screensizechecker.com",
                "description": "Free tool to detect screen resolution, viewport size, and browser information",
                "applicationCategory": "UtilityApplication",
                "operatingSystem": "Any",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                }
            }, null, 2),
            page_content: `
                <!-- Part 2: Hero Display -->
                <section class="hero-section">
                    <div class="hero-container">
                        <p class="hero-subtitle" data-i18n="hero_subtitle">你的浏览器视口大小</p>
                        <h1 class="hero-title huge-number" id="viewport-display">
                            <span data-i18n="detecting">检测中...</span>
                        </h1>
                        <p class="hero-secondary" id="screen-resolution-display">
                            <span data-i18n="screen_resolution">屏幕分辨率</span>: <span data-i18n="detecting">检测中...</span>
                        </p>
                    </div>
                </section>
                
                <!-- More content would go here -->
            `
        };
        
        try {
            const html = this.buildPage('base', indexData);
            
            // 创建测试输出目录
            const testDir = path.join(this.rootPath, 'test-build');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            // 写入测试文件
            fs.writeFileSync(path.join(testDir, 'index.html'), html);
            console.log(' Test build completed successfully!');
            console.log(' Test file created: test-build/index.html');
            
            return true;
        } catch (error) {
            console.error(' Test build failed:', error.message);
            return false;
        }
    }
    
    // 验证组件完整性
    validateComponents() {
        console.log('\n Validating components...');
        
        const requiredComponents = ['head', 'header', 'footer', 'toast'];
        const missingComponents = [];
        
        requiredComponents.forEach(component => {
            if (!this.components.has(component)) {
                missingComponents.push(component);
            }
        });
        
        if (missingComponents.length > 0) {
            console.error(` Missing components: ${missingComponents.join(', ')}`);
            return false;
        }
        
        console.log(` All components validated (${this.components.size} total)`);
        return true;
    }
    
    // 批量构建所有页面
    buildAllPages() {
        console.log('\n Starting batch build...');
        
        try {
            // 读取页面配置
            const configPath = path.join(this.rootPath, 'build', 'pages-config.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // 创建测试构建目录
            const testDir = path.join(this.rootPath, 'test-build');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            // 为每个页面创建目录
            const devicesDir = path.join(testDir, 'devices');
            if (!fs.existsSync(devicesDir)) {
                fs.mkdirSync(devicesDir, { recursive: true });
            }
            
            let successCount = 0;
            let totalCount = config.pages.length;
            
            // 构建每个页面
            for (const page of config.pages) {
                try {
                    console.log(`\n Building page: ${page.name}`);
                    
                    // 合并页面数据
                    const pageData = {
                        lang: 'en',
                        page_content: page.page_content, // 这会指向内容组件
                        ...page.config
                    };
                    
                    // 生成页面
                    const html = this.buildPage(page.template, pageData);
                    
                    // 写入文件
                    const outputPath = path.join(testDir, page.output);
                    fs.writeFileSync(outputPath, html);
                    
                    console.log(` Successfully built: ${page.output}`);
                    successCount++;
                    
                } catch (error) {
                    console.error(` Failed to build ${page.name}:`, error.message);
                }
            }
            
            console.log(`\n Batch build completed:`);
            console.log(` Successful: ${successCount}/${totalCount} pages`);
            console.log(` Output directory: test-build/`);
            
            return successCount === totalCount;
            
        } catch (error) {
            console.error(' Batch build failed:', error.message);
            return false;
        }
    }
}

// 如果直接运行此脚本，执行测试构建
if (require.main === module) {
    const builder = new ComponentBuilder();
    
    if (builder.validateComponents()) {
        // 检查命令行参数
        const args = process.argv.slice(2);
        if (args.includes('--batch') || args.includes('-b')) {
            builder.buildAllPages();
        } else {
            builder.testBuild();
        }
    }
}

module.exports = ComponentBuilder; 
