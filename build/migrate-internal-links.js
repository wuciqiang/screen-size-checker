const fs = require('fs');
const path = require('path');

/**
 * 内链迁移脚本
 * 将现有页面中的重复内链代码替换为统一的内链组件
 */
class InternalLinksMigrator {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.componentsDir = path.join(this.rootPath, 'components');
        this.backupDir = path.join(this.rootPath, 'build', 'migration-backup');
        this.migrationReport = {
            timestamp: new Date().toISOString(),
            processedFiles: [],
            replacements: [],
            errors: []
        };
    }

    /**
     * 创建备份目录
     */
    createBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log(`📁 Created backup directory: ${this.backupDir}`);
        }
    }

    /**
     * 备份文件
     */
    backupFile(filePath) {
        const relativePath = path.relative(this.rootPath, filePath);
        const backupPath = path.join(this.backupDir, relativePath);
        const backupDirPath = path.dirname(backupPath);

        if (!fs.existsSync(backupDirPath)) {
            fs.mkdirSync(backupDirPath, { recursive: true });
        }

        fs.copyFileSync(filePath, backupPath);
        console.log(`💾 Backed up: ${relativePath}`);
    }

    /**
     * 检测并替换旧的内链代码
     */
    migrateFile(filePath) {
        const relativePath = path.relative(this.rootPath, filePath);
        console.log(`🔍 Processing: ${relativePath}`);

        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            const replacements = [];

            // 检测旧的内链模式
            const patterns = [
                {
                    name: 'toolbar-section',
                    pattern: /<section class="interactive-toolbar">[\s\S]*?<\/section>/g,
                    replacement: '{{component:internal-links}}'
                },
                {
                    name: 'related-resources-section',
                    pattern: /<section[^>]*>\s*<div[^>]*>\s*<h2[^>]*data-i18n="related_resources_heading"[\s\S]*?<\/section>/g,
                    replacement: '{{component:internal-links}}'
                },
                {
                    name: 'toolbar-grid-only',
                    pattern: /<div class="toolbar-grid"[^>]*>[\s\S]*?<\/div>\s*(?=<\/div>|<\/section>)/g,
                    replacement: '<!-- 已迁移到统一内链组件 -->\n        {{component:internal-links}}'
                }
            ];

            // 应用替换模式
            patterns.forEach(({ name, pattern, replacement }) => {
                const matches = content.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        // 检查是否已经包含统一组件
                        if (!match.includes('{{component:internal-links}}') && 
                            !match.includes('internal-links-container')) {
                            
                            content = content.replace(match, replacement);
                            hasChanges = true;
                            replacements.push({
                                pattern: name,
                                originalLength: match.length,
                                newLength: replacement.length
                            });
                        }
                    });
                }
            });

            // 如果有变更，写入文件
            if (hasChanges) {
                // 先备份原文件
                this.backupFile(filePath);
                
                // 写入新内容
                fs.writeFileSync(filePath, content, 'utf8');
                
                this.migrationReport.processedFiles.push({
                    file: relativePath,
                    replacements: replacements.length,
                    status: 'migrated'
                });
                
                this.migrationReport.replacements.push(...replacements.map(r => ({
                    file: relativePath,
                    ...r
                })));

                console.log(`✅ Migrated: ${relativePath} (${replacements.length} replacements)`);
            } else {
                this.migrationReport.processedFiles.push({
                    file: relativePath,
                    replacements: 0,
                    status: 'no-changes'
                });
                
                console.log(`ℹ️  No changes needed: ${relativePath}`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${relativePath}:`, error.message);
            this.migrationReport.errors.push({
                file: relativePath,
                error: error.message
            });
        }
    }

    /**
     * 扫描并迁移所有组件文件
     */
    migrateAllComponents() {
        console.log('\n🔄 Starting internal links migration...');
        
        this.createBackupDir();

        // 获取所有组件文件
        const componentFiles = fs.readdirSync(this.componentsDir)
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(this.componentsDir, file));

        // 排除已经是统一内链组件的文件
        const filesToMigrate = componentFiles.filter(file => {
            const filename = path.basename(file);
            return filename !== 'internal-links.html';
        });

        console.log(`📋 Found ${filesToMigrate.length} component files to check`);

        // 迁移每个文件
        filesToMigrate.forEach(file => {
            this.migrateFile(file);
        });

        // 生成迁移报告
        this.generateReport();
    }

    /**
     * 生成迁移报告
     */
    generateReport() {
        const reportPath = path.join(this.rootPath, 'build', 'internal-links-migration-report.json');
        
        // 添加统计信息
        this.migrationReport.summary = {
            totalFiles: this.migrationReport.processedFiles.length,
            migratedFiles: this.migrationReport.processedFiles.filter(f => f.status === 'migrated').length,
            unchangedFiles: this.migrationReport.processedFiles.filter(f => f.status === 'no-changes').length,
            totalReplacements: this.migrationReport.replacements.length,
            errors: this.migrationReport.errors.length
        };

        fs.writeFileSync(reportPath, JSON.stringify(this.migrationReport, null, 2));
        
        console.log('\n📊 Migration Summary:');
        console.log(`   Total files processed: ${this.migrationReport.summary.totalFiles}`);
        console.log(`   Files migrated: ${this.migrationReport.summary.migratedFiles}`);
        console.log(`   Files unchanged: ${this.migrationReport.summary.unchangedFiles}`);
        console.log(`   Total replacements: ${this.migrationReport.summary.totalReplacements}`);
        console.log(`   Errors: ${this.migrationReport.summary.errors}`);
        console.log(`📄 Detailed report saved to: ${reportPath}`);

        if (this.migrationReport.summary.errors > 0) {
            console.log('\n❌ Errors encountered:');
            this.migrationReport.errors.forEach(error => {
                console.log(`   ${error.file}: ${error.error}`);
            });
        }
    }

    /**
     * 验证迁移结果
     */
    validateMigration() {
        console.log('\n🔍 Validating migration results...');
        
        const componentFiles = fs.readdirSync(this.componentsDir)
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(this.componentsDir, file));

        let validationErrors = 0;
        
        componentFiles.forEach(file => {
            const relativePath = path.relative(this.rootPath, file);
            const content = fs.readFileSync(file, 'utf8');
            
            // 检查是否还有旧的内链代码
            const oldPatterns = [
                /class="tool-card"/g,
                /class="toolbar-grid"/g,
                /class="interactive-toolbar"/g
            ];
            
            oldPatterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches && !relativePath.includes('internal-links.html')) {
                    console.warn(`⚠️  Found potential old internal links in: ${relativePath}`);
                    validationErrors++;
                }
            });
        });

        if (validationErrors === 0) {
            console.log('✅ Migration validation passed');
        } else {
            console.warn(`⚠️  Migration validation found ${validationErrors} potential issues`);
        }

        return validationErrors === 0;
    }

    /**
     * 运行完整的迁移流程
     */
    run() {
        console.log('🚀 Starting Internal Links Migration Process...');
        
        try {
            this.migrateAllComponents();
            this.validateMigration();
            
            console.log('\n✅ Internal links migration completed successfully!');
            console.log('💡 Next steps:');
            console.log('   1. Review the migration report');
            console.log('   2. Test the migrated pages');
            console.log('   3. Run the build process to verify everything works');
            
        } catch (error) {
            console.error('\n❌ Migration failed:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const migrator = new InternalLinksMigrator();
    migrator.run();
}

module.exports = InternalLinksMigrator;