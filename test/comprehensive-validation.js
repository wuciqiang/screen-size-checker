/**
 * 综合验证脚本
 * 运行所有构建验证和测试脚本
 */

const BuildValidationTest = require('./build-validation-test');
const InternalLinksChecker = require('./internal-links-checker');
const SEOTagsValidator = require('./seo-tags-validator');
const fs = require('fs');
const path = require('path');

class ComprehensiveValidation {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                totalPassed: 0,
                totalFailed: 0,
                totalWarnings: 0,
                overallSuccessRate: 0
            },
            testSuites: {}
        };
    }

    /**
     * 运行所有验证测试
     */
    async runAllValidations() {
        console.log('🚀 Starting Comprehensive Build Validation...');
        console.log('=' .repeat(70));
        console.log(`📅 Started at: ${new Date().toLocaleString()}`);
        console.log('=' .repeat(70));

        // 1. 运行构建验证测试
        await this.runBuildValidation();
        
        // 2. 运行内部链接检查
        await this.runInternalLinksCheck();
        
        // 3. 运行SEO标签验证
        await this.runSEOValidation();
        
        // 4. 生成综合报告
        this.generateComprehensiveReport();
        
        return this.results;
    }

    /**
     * 运行构建验证测试
     */
    async runBuildValidation() {
        console.log('\\n🔧 PHASE 1: Build Validation Test');
        console.log('-'.repeat(50));
        
        try {
            const buildValidator = new BuildValidationTest();
            const buildResults = buildValidator.runTests();
            
            this.results.testSuites.buildValidation = {
                name: 'Build Validation',
                status: 'completed',
                summary: buildResults.summary,
                categories: buildResults.categories,
                timestamp: buildResults.timestamp
            };
            
            // 更新总体统计
            this.results.summary.totalTests += buildResults.summary.total;
            this.results.summary.totalPassed += buildResults.summary.passed;
            this.results.summary.totalFailed += buildResults.summary.failed;
            this.results.summary.totalWarnings += buildResults.summary.warnings;
            
            console.log('✅ Build Validation Test completed');
            
        } catch (error) {
            console.error('❌ Build Validation Test failed:', error.message);
            this.results.testSuites.buildValidation = {
                name: 'Build Validation',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 运行内部链接检查
     */
    async runInternalLinksCheck() {
        console.log('\\n🔗 PHASE 2: Internal Links Check');
        console.log('-'.repeat(50));
        
        try {
            const linksChecker = new InternalLinksChecker();
            const linksResults = linksChecker.runCheck();
            
            this.results.testSuites.internalLinks = {
                name: 'Internal Links Check',
                status: 'completed',
                summary: linksResults.summary,
                linksChecked: linksResults.links.length,
                brokenLinks: linksResults.links.filter(link => !link.exists).length,
                timestamp: linksResults.timestamp
            };
            
            // 将链接检查结果转换为测试格式
            const linksTotal = linksResults.summary.total;
            const linksAccessible = linksResults.summary.accessible;
            const linksBroken = linksResults.summary.broken;
            
            this.results.summary.totalTests += linksTotal;
            this.results.summary.totalPassed += linksAccessible;
            this.results.summary.totalFailed += linksBroken;
            
            console.log('✅ Internal Links Check completed');
            
        } catch (error) {
            console.error('❌ Internal Links Check failed:', error.message);
            this.results.testSuites.internalLinks = {
                name: 'Internal Links Check',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 运行SEO标签验证
     */
    async runSEOValidation() {
        console.log('\\n🏷️ PHASE 3: SEO Tags Validation');
        console.log('-'.repeat(50));
        
        try {
            const seoValidator = new SEOTagsValidator();
            const seoResults = seoValidator.runValidation();
            
            this.results.testSuites.seoValidation = {
                name: 'SEO Tags Validation',
                status: 'completed',
                summary: seoResults.summary,
                pagesValidated: seoResults.pages.length,
                criticalFailures: this.countCriticalSEOFailures(seoResults),
                timestamp: seoResults.timestamp
            };
            
            // 更新总体统计
            this.results.summary.totalTests += seoResults.summary.total;
            this.results.summary.totalPassed += seoResults.summary.passed;
            this.results.summary.totalFailed += seoResults.summary.failed;
            this.results.summary.totalWarnings += seoResults.summary.warnings;
            
            console.log('✅ SEO Tags Validation completed');
            
        } catch (error) {
            console.error('❌ SEO Tags Validation failed:', error.message);
            this.results.testSuites.seoValidation = {
                name: 'SEO Tags Validation',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 计算关键SEO失败数量
     */
    countCriticalSEOFailures(seoResults) {
        let criticalFailures = 0;
        const criticalTests = ['Title Tag', 'Meta Description', 'Canonical URL', 'HTML Lang Attribute'];
        
        for (const pageResult of seoResults.pages) {
            for (const test of pageResult.tests) {
                if (test.status === 'failed' && criticalTests.some(critical => test.test.includes(critical))) {
                    criticalFailures++;
                }
            }
        }
        
        return criticalFailures;
    }

    /**
     * 生成综合报告
     */
    generateComprehensiveReport() {
        console.log('\\n' + '='.repeat(70));
        console.log('📊 COMPREHENSIVE VALIDATION REPORT');
        console.log('='.repeat(70));
        
        // 计算总体成功率
        const { totalTests, totalPassed, totalFailed, totalWarnings } = this.results.summary;
        const overallSuccessRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
        this.results.summary.overallSuccessRate = parseFloat(overallSuccessRate);
        
        console.log(`\\n📈 OVERALL SUMMARY:`);
        console.log(`📅 Validation completed at: ${new Date().toLocaleString()}`);
        console.log(`🧪 Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${totalPassed}`);
        console.log(`❌ Failed: ${totalFailed}`);
        console.log(`⚠️  Warnings: ${totalWarnings}`);
        console.log(`📊 Overall Success Rate: ${overallSuccessRate}%`);
        
        // 测试套件详情
        console.log(`\\n📋 TEST SUITES BREAKDOWN:`);
        
        for (const [suiteKey, suiteData] of Object.entries(this.results.testSuites)) {
            console.log(`\\n   🔍 ${suiteData.name}:`);
            console.log(`      Status: ${suiteData.status === 'completed' ? '✅ Completed' : '❌ Failed'}`);
            
            if (suiteData.status === 'completed' && suiteData.summary) {
                const suiteSuccessRate = suiteData.summary.total > 0 ? 
                    ((suiteData.summary.passed / suiteData.summary.total) * 100).toFixed(1) : 0;
                
                console.log(`      Tests: ${suiteData.summary.total}`);
                console.log(`      Passed: ${suiteData.summary.passed}`);
                console.log(`      Failed: ${suiteData.summary.failed}`);
                console.log(`      Success Rate: ${suiteSuccessRate}%`);
                
                // 特定套件的额外信息
                if (suiteKey === 'internalLinks') {
                    console.log(`      Links Checked: ${suiteData.linksChecked}`);
                    console.log(`      Broken Links: ${suiteData.brokenLinks}`);
                } else if (suiteKey === 'seoValidation') {
                    console.log(`      Pages Validated: ${suiteData.pagesValidated}`);
                    console.log(`      Critical Failures: ${suiteData.criticalFailures}`);
                }
            } else if (suiteData.error) {
                console.log(`      Error: ${suiteData.error}`);
            }
        }
        
        // 关键问题汇总
        this.showCriticalIssues();
        
        // 建议和下一步
        this.showRecommendations();
        
        // 保存综合报告
        this.saveComprehensiveReport();
        
        // 最终判断
        const isOverallSuccess = this.evaluateOverallSuccess();
        
        console.log('\\n' + '='.repeat(70));
        if (isOverallSuccess) {
            console.log('🎉 COMPREHENSIVE VALIDATION SUCCESSFUL!');
            console.log('   The SEO redirect optimization build is ready for deployment.');
        } else {
            console.log('⚠️  COMPREHENSIVE VALIDATION ISSUES DETECTED');
            console.log('   Please review and fix the issues before deployment.');
        }
        console.log('='.repeat(70));
        
        return isOverallSuccess;
    }

    /**
     * 显示关键问题
     */
    showCriticalIssues() {
        console.log(`\\n🚨 CRITICAL ISSUES SUMMARY:`);
        
        const criticalIssues = [];
        
        // 从构建验证中提取关键问题
        if (this.results.testSuites.buildValidation && this.results.testSuites.buildValidation.categories) {
            const buildCategories = this.results.testSuites.buildValidation.categories;
            
            if (buildCategories.rootPageGeneration && buildCategories.rootPageGeneration.failed > 0) {
                criticalIssues.push(`Root page generation has ${buildCategories.rootPageGeneration.failed} failures`);
            }
            
            if (buildCategories.redirectRules && buildCategories.redirectRules.failed > 0) {
                criticalIssues.push(`Redirect rules have ${buildCategories.redirectRules.failed} failures`);
            }
        }
        
        // 从内部链接检查中提取关键问题
        if (this.results.testSuites.internalLinks && this.results.testSuites.internalLinks.brokenLinks > 0) {
            criticalIssues.push(`${this.results.testSuites.internalLinks.brokenLinks} broken internal links detected`);
        }
        
        // 从SEO验证中提取关键问题
        if (this.results.testSuites.seoValidation && this.results.testSuites.seoValidation.criticalFailures > 0) {
            criticalIssues.push(`${this.results.testSuites.seoValidation.criticalFailures} critical SEO failures detected`);
        }
        
        if (criticalIssues.length > 0) {
            for (let i = 0; i < criticalIssues.length; i++) {
                console.log(`   ${i + 1}. ❌ ${criticalIssues[i]}`);
            }
        } else {
            console.log('   ✅ No critical issues detected');
        }
    }

    /**
     * 显示建议
     */
    showRecommendations() {
        console.log(`\\n💡 RECOMMENDATIONS:`);
        
        const recommendations = [];
        
        // 基于成功率给出建议
        if (this.results.summary.overallSuccessRate < 80) {
            recommendations.push('Overall success rate is below 80%. Review failed tests in all categories.');
        }
        
        // 基于SEO问题给出建议
        if (this.results.testSuites.seoValidation && this.results.testSuites.seoValidation.criticalFailures > 0) {
            recommendations.push('Fix critical SEO issues (Title tags, Meta descriptions, Canonical URLs) before deployment.');
        }
        
        // 基于链接问题给出建议
        if (this.results.testSuites.internalLinks && this.results.testSuites.internalLinks.brokenLinks > 5) {
            recommendations.push('Fix broken internal links to improve user experience and SEO.');
        }
        
        // 基于构建问题给出建议
        if (this.results.testSuites.buildValidation) {
            const buildSummary = this.results.testSuites.buildValidation.summary;
            if (buildSummary && buildSummary.failed > 0) {
                recommendations.push('Address build validation failures to ensure proper page generation.');
            }
        }
        
        // 通用建议
        if (this.results.summary.totalWarnings > 10) {
            recommendations.push('Review warnings to identify potential improvements.');
        }
        
        if (recommendations.length > 0) {
            for (let i = 0; i < recommendations.length; i++) {
                console.log(`   ${i + 1}. ${recommendations[i]}`);
            }
        } else {
            console.log('   ✅ No specific recommendations. The build looks good!');
        }
        
        // 下一步建议
        console.log(`\\n🚀 NEXT STEPS:`);
        if (this.results.summary.overallSuccessRate >= 85) {
            console.log('   1. Deploy to staging environment for final testing');
            console.log('   2. Run Google Search Console URL inspection');
            console.log('   3. Monitor search engine indexing after deployment');
        } else {
            console.log('   1. Fix critical failures identified above');
            console.log('   2. Re-run comprehensive validation');
            console.log('   3. Deploy only after achieving >85% success rate');
        }
    }

    /**
     * 保存综合报告
     */
    saveComprehensiveReport() {
        const reportPath = path.join('multilang-build', 'comprehensive-validation-report.json');
        
        try {
            // 确保目录存在
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
            console.log(`\\n📋 Comprehensive report saved to: ${reportPath}`);
            
            // 也保存一个简化的摘要报告
            const summaryPath = path.join('multilang-build', 'validation-summary.txt');
            const summaryContent = this.generateTextSummary();
            fs.writeFileSync(summaryPath, summaryContent);
            console.log(`📄 Summary report saved to: ${summaryPath}`);
            
        } catch (error) {
            console.warn('⚠️  Could not save comprehensive report:', error.message);
        }
    }

    /**
     * 生成文本摘要
     */
    generateTextSummary() {
        const { totalTests, totalPassed, totalFailed, totalWarnings, overallSuccessRate } = this.results.summary;
        
        let summary = `SEO REDIRECT OPTIMIZATION - VALIDATION SUMMARY\\n`;
        summary += `${'='.repeat(50)}\\n\\n`;
        summary += `Validation Date: ${new Date().toLocaleString()}\\n`;
        summary += `Overall Success Rate: ${overallSuccessRate}%\\n\\n`;
        summary += `Total Tests: ${totalTests}\\n`;
        summary += `Passed: ${totalPassed}\\n`;
        summary += `Failed: ${totalFailed}\\n`;
        summary += `Warnings: ${totalWarnings}\\n\\n`;
        
        summary += `TEST SUITES:\\n`;
        for (const [suiteKey, suiteData] of Object.entries(this.results.testSuites)) {
            summary += `- ${suiteData.name}: ${suiteData.status}\\n`;
            if (suiteData.summary) {
                const suiteRate = suiteData.summary.total > 0 ? 
                    ((suiteData.summary.passed / suiteData.summary.total) * 100).toFixed(1) : 0;
                summary += `  Success Rate: ${suiteRate}%\\n`;
            }
        }
        
        summary += `\\nSTATUS: ${overallSuccessRate >= 85 ? 'READY FOR DEPLOYMENT' : 'NEEDS ATTENTION'}\\n`;
        
        return summary;
    }

    /**
     * 评估整体成功
     */
    evaluateOverallSuccess() {
        const { overallSuccessRate } = this.results.summary;
        
        // 检查关键测试套件是否成功
        const buildValidationOk = this.results.testSuites.buildValidation && 
                                 this.results.testSuites.buildValidation.status === 'completed';
        
        const seoValidationOk = this.results.testSuites.seoValidation && 
                               this.results.testSuites.seoValidation.status === 'completed' &&
                               this.results.testSuites.seoValidation.criticalFailures < 5;
        
        const linksOk = this.results.testSuites.internalLinks && 
                       this.results.testSuites.internalLinks.status === 'completed' &&
                       this.results.testSuites.internalLinks.brokenLinks < 10;
        
        // 成功条件：
        // 1. 总体成功率 >= 80%
        // 2. 所有关键测试套件都成功完成
        // 3. 关键失败数量在可接受范围内
        
        return overallSuccessRate >= 80 && buildValidationOk && seoValidationOk && linksOk;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const validator = new ComprehensiveValidation();
    validator.runAllValidations().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Comprehensive validation failed:', error);
        process.exit(1);
    });
}

module.exports = ComprehensiveValidation;