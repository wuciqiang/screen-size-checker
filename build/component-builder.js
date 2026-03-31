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

        this.components.clear();
        const counts = {
            manual: 0,
            generatedBlog: 0,
            generatedHub: 0
        };
        const verbose = process.env.DEBUG_COMPONENTS === '1';

        const files = this.getComponentFiles(componentDir);
        files.forEach(filePath => {
            const name = path.basename(filePath, '.html');
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.rootPath, filePath).replace(/\\/g, '/');

            if (this.components.has(name)) {
                console.warn(`Duplicate component "${name}" detected, overriding with ${relativePath}`);
            }

            this.components.set(name, content);

            if (relativePath.startsWith('components/generated/blog/')) {
                counts.generatedBlog += 1;
            } else if (relativePath.startsWith('components/generated/hub/')) {
                counts.generatedHub += 1;
            } else {
                counts.manual += 1;
            }

            if (verbose) {
                console.log(`Loaded component: ${relativePath}`);
            }
        });

        console.log(
            `Loaded ${this.components.size} components `
            + `(${counts.manual} manual, ${counts.generatedBlog} generated blog, ${counts.generatedHub} generated hub)`
        );
    }

    getComponentFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const files = [];

        entries.forEach(entry => {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                files.push(...this.getComponentFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        });

        return files.sort((a, b) => a.localeCompare(b));
    }
    
    buildPage(templateName, pageData) {
        const templatePath = path.join(this.rootPath, 'templates', `${templateName}.html`);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template "${templateName}" not found at ${templatePath}`);
        }
        
        let html = fs.readFileSync(templatePath, 'utf8');
        
        // 缁熶竴鐨勭粍浠跺鐞嗘柟娉?
        html = this.processAllComponents(html, pageData);
        
        return html;
    }
    
    // 缁熶竴澶勭悊鎵€鏈夌被鍨嬬殑缁勪欢寮曠敤
    processAllComponents(html, pageData, depth = 0) {
        // 闃叉鏃犻檺閫掑綊
        if (depth > 5) {
            console.warn(`Maximum recursion depth reached at depth ${depth}`);
            return html;
        }
        
        let result = html;
        let hasChanges = true;
        let iterations = 0;
        
        // 寰幆澶勭悊鐩村埌娌℃湁鏇村鍙樺寲锛岀‘淇濇墍鏈夊祵濂楅兘琚鐞?
        while (hasChanges && iterations < 15) {
            const originalResult = result;
            iterations++;
            
            // 1. 棣栧厛澶勭悊鏈€澶嶆潅鐨勫祵濂楃粍浠跺紩鐢細{{component:{{variable}}}}
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
            
            // 2. 澶勭悊鍖呭惈鍙橀噺鐨勭粍浠跺紩鐢細{{component:name-{{variable}}-suffix}}
            // 浣跨敤鏇寸簿纭殑姝ｅ垯琛ㄨ揪寮忔潵鍖归厤杩欑妯″紡
            result = result.replace(/\{\{component:([^{}]*\{\{[^{}]+\}\}[^{}]*)\}\}/g, (match, componentNameWithVar) => {
                // 鍏堟浛鎹㈢粍浠跺悕涓殑鍙橀噺
                let actualComponentName = componentNameWithVar;
                
                // 鏇挎崲鎵€鏈夊彉閲忓崰浣嶇
                actualComponentName = actualComponentName.replace(/\{\{(\w+)\}\}/g, (varMatch, varName) => {
                    return pageData[varName] || varMatch;
                });
                
                // 濡傛灉杩樻湁鏈浛鎹㈢殑鍙橀噺锛岃烦杩囪繖娆″鐞?
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
            
            // 3. 澶勭悊绠€鍗曠殑缁勪欢寮曠敤锛歿{component:name}}
            result = result.replace(/\{\{component:([\w-]+)\}\}/g, (match, componentName) => {
                // 妫€鏌ユ槸鍚︽槸鍙橀噺寮曠敤
                if (pageData[componentName]) {
                    const actualComponentName = pageData[componentName];
                    const component = this.components.get(actualComponentName);
                    if (component) {
                        return this.processAllComponents(component, pageData, depth + 1);
                    }
                }
                
                // 鐩存帴缁勪欢寮曠敤
                const component = this.components.get(componentName);
                if (component) {
                    return this.processAllComponents(component, pageData, depth + 1);
                } else {
                    console.warn(`Component "${componentName}" not found (simple reference)`);
                    return `<!-- Component not found: ${componentName} -->`;
                }
            });
            
            // 4. 澶勭悊椤甸潰鍙橀噺
            result = this.processVariables(result, pageData, depth);
            
            // 妫€鏌ユ槸鍚﹁繕鏈夊彉鍖?
            hasChanges = (result !== originalResult);
            
            // 濡傛灉杩樻湁鏈鐞嗙殑缁勪欢寮曠敤锛岃褰曡鍛?
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
    
    // 澶勭悊鍙橀噺鍜屾潯浠惰〃杈惧紡
    processVariables(content, data, depth = 0) {
        // 闃叉鏃犻檺閫掑綊
        if (depth > 3) {
            return content;
        }
        
        let result = content;
        
        // 鍏堝鐞嗘潯浠惰鍙ワ紝閬垮厤 false 鍒嗘敮閲岀殑鍙橀噺浠嶇劧瑙﹀彂 undefined 璀﹀憡
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
            if (data[condition]) {
                return content;
            }
            return '';
        });
        
        // 澶勭悊绠€鍗曠殑鍙橀噺鏇挎崲 {{variable}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            if (data[key] !== undefined) {
                if (typeof data[key] === 'object') {
                    return JSON.stringify(data[key], null, 2);
                }
                
                // 检查变量值是否是组件名
                const variableValue = data[key];
                if (typeof variableValue === 'string' && this.components.has(variableValue)) {
                    // 濡傛灉鏄粍浠跺悕锛岃繑鍥炵粍浠跺唴瀹瑰苟閫掑綊澶勭悊
                    const component = this.components.get(variableValue);
                    return this.processVariables(component, data, depth + 1);
                }
                
                return variableValue;
            }
            // 如果变量未定义，返回空字符串而不是保留原始模板语法
            console.warn(`Template variable "${key}" is undefined, replacing with empty string`);
            return '';
        });
        
        return result;
    }
    
    // 娴嬭瘯鏋勫缓 - 鐢熸垚娴嬭瘯椤甸潰浣嗕笉鏇挎崲鐜版湁鏂囦欢
    testBuild() {
        console.log('\n Starting test build...');
        
        // 娴嬭瘯涓婚〉鏋勫缓
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
                        <p class="hero-subtitle" data-i18n="hero_subtitle">浣犵殑娴忚鍣ㄨ鍙ｅぇ灏?/p>
                        <h1 class="hero-title huge-number" id="viewport-display">
                            <span data-i18n="detecting">妫€娴嬩腑...</span>
                        </h1>
                        <p class="hero-secondary" id="screen-resolution-display">
                            <span data-i18n="screen_resolution">灞忓箷鍒嗚鲸鐜?/span>: <span data-i18n="detecting">妫€娴嬩腑...</span>
                        </p>
                    </div>
                </section>
                
                <!-- More content would go here -->
            `
        };
        
        try {
            const html = this.buildPage('base', indexData);
            
            // 鍒涘缓娴嬭瘯杈撳嚭鐩綍
            const testDir = path.join(this.rootPath, 'test-build');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            // 鍐欏叆娴嬭瘯鏂囦欢
            fs.writeFileSync(path.join(testDir, 'index.html'), html);
            console.log(' Test build completed successfully!');
            console.log(' Test file created: test-build/index.html');
            
            return true;
        } catch (error) {
            console.error(' Test build failed:', error.message);
            return false;
        }
    }
    
    // 楠岃瘉缁勪欢瀹屾暣鎬?
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
    
    // 鎵归噺鏋勫缓鎵€鏈夐〉闈?
    buildAllPages() {
        console.log('\n Starting batch build...');
        
        try {
            // 璇诲彇椤甸潰閰嶇疆
            const configPath = path.join(this.rootPath, 'build', 'pages-config.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // 鍒涘缓娴嬭瘯鏋勫缓鐩綍
            const testDir = path.join(this.rootPath, 'test-build');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            // 涓烘瘡涓〉闈㈠垱寤虹洰褰?
            const devicesDir = path.join(testDir, 'devices');
            if (!fs.existsSync(devicesDir)) {
                fs.mkdirSync(devicesDir, { recursive: true });
            }
            
            let successCount = 0;
            let totalCount = config.pages.length;
            
            // 鏋勫缓姣忎釜椤甸潰
            for (const page of config.pages) {
                try {
                    console.log(`\n Building page: ${page.name}`);
                    
                    // 鍚堝苟椤甸潰鏁版嵁
                    const pageData = {
                        lang: 'en',
                        page_content: page.page_content, // 杩欎細鎸囧悜鍐呭缁勪欢
                        ...page.config
                    };
                    
                    // 鐢熸垚椤甸潰
                    const html = this.buildPage(page.template, pageData);
                    
                    // 鍐欏叆鏂囦欢
                    const outputPath = path.join(testDir, page.output);
                    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
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

// 濡傛灉鐩存帴杩愯姝よ剼鏈紝鎵ц娴嬭瘯鏋勫缓
if (require.main === module) {
    const builder = new ComponentBuilder();
    
    if (builder.validateComponents()) {
        // 妫€鏌ュ懡浠よ鍙傛暟
        const args = process.argv.slice(2);
        if (args.includes('--batch') || args.includes('-b')) {
            builder.buildAllPages();
        } else {
            builder.testBuild();
        }
    }
}

module.exports = ComponentBuilder; 
