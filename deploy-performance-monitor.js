#!/usr/bin/env node

/**
 * 性能监控系统部署验证脚本
 * 确保性能监控系统在生产环境中正确部署和运行
 */

const fs = require('fs');
const path = require('path');

class PerformanceMonitorDeployment {
    constructor() {
        this.buildDir = 'multilang-build';
        this.requiredFiles = [
            'js/performance-monitor.js',
            'js/app.js',
            'js/utils.js'
        ];
        this.testPages = [
            'index.html',
            'en/index.html',
            'zh/index.html'
        ];
    }

    /**
     * 主部署验证流程
     */
    async deploy() {
        console.log('🚀 开始性能监控系统部署验证...\n');

        try {
            // 1. 检查构建目录
            this.checkBuildDirectory();
            
            // 2. 验证必需文件
            this.verifyRequiredFiles();
            
            // 3. 检查文件内容
            this.verifyFileContents();
            
            // 4. 验证页面集成
            this.verifyPageIntegration();
            
            // 5. 生成部署报告
            this.generateDeploymentReport();
            
            console.log('\n✅ 性能监控系统部署验证完成！');
            console.log('🌐 系统已准备好在生产环境中运行');
            
        } catch (error) {
            console.error('\n❌ 部署验证失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 检查构建目录是否存在
     */
    checkBuildDirectory() {
        console.log('📁 检查构建目录...');
        
        if (!fs.existsSync(this.buildDir)) {
            throw new Error(`构建目录不存在: ${this.buildDir}`);
        }
        
        console.log(`  ✅ 构建目录存在: ${this.buildDir}`);
    }

    /**
     * 验证必需文件是否存在
     */
    verifyRequiredFiles() {
        console.log('\n📋 验证必需文件...');
        
        for (const file of this.requiredFiles) {
            const filePath = path.join(this.buildDir, file);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`必需文件不存在: ${filePath}`);
            }
            
            const stats = fs.statSync(filePath);
            console.log(`  ✅ ${file} (${this.formatFileSize(stats.size)})`);
        }
    }

    /**
     * 检查文件内容是否正确
     */
    verifyFileContents() {
        console.log('\n🔍 验证文件内容...');
        
        // 检查 performance-monitor.js
        this.verifyPerformanceMonitorFile();
        
        // 检查 app.js 集成
        this.verifyAppJsIntegration();
    }

    /**
     * 验证性能监控文件
     */
    verifyPerformanceMonitorFile() {
        const filePath = path.join(this.buildDir, 'js/performance-monitor.js');
        const content = fs.readFileSync(filePath, 'utf8');
        
        const requiredClasses = [
            'PerformanceMonitor',
            'PerformanceMetricsModel'
        ];
        
        const requiredMethods = [
            'observeLCP',
            'observeFID', 
            'observeCLS',
            'observeFCP',
            'observeTTI'
        ];
        
        // 检查类定义
        for (const className of requiredClasses) {
            if (!content.includes(`class ${className}`)) {
                throw new Error(`性能监控文件缺少类定义: ${className}`);
            }
        }
        
        // 检查方法定义
        for (const method of requiredMethods) {
            if (!content.includes(method)) {
                throw new Error(`性能监控文件缺少方法: ${method}`);
            }
        }
        
        // 检查导出
        if (!content.includes('export { PerformanceMonitor')) {
            throw new Error('性能监控文件缺少正确的导出语句');
        }
        
        console.log('  ✅ performance-monitor.js 内容验证通过');
    }

    /**
     * 验证 app.js 集成
     */
    verifyAppJsIntegration() {
        const filePath = path.join(this.buildDir, 'js/app.js');
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查导入语句
        if (!content.includes("import { performanceMonitor } from './performance-monitor.js'")) {
            throw new Error('app.js 缺少性能监控系统的导入语句');
        }
        
        // 检查使用语句
        const usagePatterns = [
            'performanceMonitor.recordCustomMetric',
            'translationLoadTime',
            'deviceDetectionTime'
        ];
        
        for (const pattern of usagePatterns) {
            if (!content.includes(pattern)) {
                console.warn(`  ⚠️  app.js 中未找到使用模式: ${pattern}`);
            }
        }
        
        console.log('  ✅ app.js 集成验证通过');
    }

    /**
     * 验证页面集成
     */
    verifyPageIntegration() {
        console.log('\n🌐 验证页面集成...');
        
        for (const page of this.testPages) {
            const pagePath = path.join(this.buildDir, page);
            
            if (!fs.existsSync(pagePath)) {
                console.warn(`  ⚠️  页面不存在: ${page}`);
                continue;
            }
            
            const content = fs.readFileSync(pagePath, 'utf8');
            
            // 检查是否包含 app.js 引用
            if (content.includes('js/app.js')) {
                console.log(`  ✅ ${page} 包含 app.js 引用`);
            } else {
                console.warn(`  ⚠️  ${page} 未找到 app.js 引用`);
            }
        }
    }

    /**
     * 生成部署报告
     */
    generateDeploymentReport() {
        console.log('\n📊 生成部署报告...');
        
        const report = {
            timestamp: new Date().toISOString(),
            buildDirectory: this.buildDir,
            verificationResults: {
                requiredFiles: this.requiredFiles.map(file => ({
                    file,
                    exists: fs.existsSync(path.join(this.buildDir, file)),
                    size: this.getFileSize(path.join(this.buildDir, file))
                })),
                pages: this.testPages.map(page => ({
                    page,
                    exists: fs.existsSync(path.join(this.buildDir, page))
                }))
            },
            deploymentInstructions: this.getDeploymentInstructions()
        };
        
        // 保存报告
        const reportPath = path.join(this.buildDir, 'performance-monitor-deployment-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`  ✅ 部署报告已生成: ${reportPath}`);
        
        // 显示部署说明
        this.displayDeploymentInstructions();
    }

    /**
     * 获取文件大小
     */
    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * 获取部署说明
     */
    getDeploymentInstructions() {
        return {
            step1: '确保 multilang-build 目录已完整构建',
            step2: '将 multilang-build 目录内容上传到服务器',
            step3: '确保服务器支持 ES6 模块 (type="module")',
            step4: '配置适当的 MIME 类型 (.js 文件)',
            step5: '启用 HTTPS (性能监控 API 需要安全上下文)',
            step6: '配置适当的缓存策略',
            monitoring: '部署后访问网站，打开浏览器控制台查看性能监控日志'
        };
    }

    /**
     * 显示部署说明
     */
    displayDeploymentInstructions() {
        console.log('\n📋 部署说明:');
        console.log('');
        console.log('1. 🏗️  构建验证');
        console.log('   ✅ multilang-build 目录已准备就绪');
        console.log('   ✅ 性能监控系统文件已包含');
        console.log('');
        console.log('2. 🚀 部署步骤');
        console.log('   • 将 multilang-build/ 目录内容上传到您的服务器');
        console.log('   • 确保服务器支持 ES6 模块 (现代浏览器支持)');
        console.log('   • 配置正确的 MIME 类型 (.js → application/javascript)');
        console.log('   • 启用 HTTPS (性能监控 API 需要安全上下文)');
        console.log('');
        console.log('3. 🔧 服务器配置建议');
        console.log('   • 启用 Gzip/Brotli 压缩');
        console.log('   • 设置适当的缓存头');
        console.log('   • 配置 CDN (如 Cloudflare)');
        console.log('');
        console.log('4. ✅ 验证部署');
        console.log('   • 访问您的网站');
        console.log('   • 打开浏览器开发者工具 (F12)');
        console.log('   • 查看控制台是否有性能监控日志');
        console.log('   • 检查 Network 标签页确认文件正确加载');
        console.log('');
        console.log('5. 📊 监控验证');
        console.log('   • 等待几秒钟让系统收集数据');
        console.log('   • 在控制台输入: performanceMonitor.getMetrics()');
        console.log('   • 应该看到 Core Web Vitals 数据');
        console.log('');
        console.log('🎯 部署完成后，性能监控系统将自动开始工作！');
    }
}

// 运行部署验证
if (require.main === module) {
    const deployment = new PerformanceMonitorDeployment();
    deployment.deploy().catch(error => {
        console.error('部署验证失败:', error);
        process.exit(1);
    });
}

module.exports = PerformanceMonitorDeployment;