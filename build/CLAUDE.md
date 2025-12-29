# 构建系统模块 (build/)

[根目录](../CLAUDE.md) > **build**

> 最后更新: 2025-12-29 14:41:32

---

## 模块职责

构建系统是项目的核心，负责：
- 多语言静态页面生成（4语言 × 45+页面）
- 博客内容处理（Markdown → HTML组件）
- Gaming Hub内容管理
- 组件化构建和模板渲染
- 翻译验证和内链处理

---

## 入口与启动

### 主入口
- **文件**: `multilang-builder.js`
- **类**: `MultiLangBuilder`
- **启动命令**: `npm run multilang-build`

### 构建流程
1. 加载翻译资源（10种语言）
2. 初始化博客构建器和Hub构建器
3. 处理页面配置（pages-config.json）
4. 生成多语言页面（英文根路径 + 其他语言子目录）
5. 处理内链和验证翻译
6. 输出构建报告

---

## 对外接口

### MultiLangBuilder 类
```javascript
class MultiLangBuilder extends ComponentBuilder {
    constructor()
    loadTranslations()                    // 加载所有语言翻译
    getNestedTranslation(translations, key) // 获取嵌套翻译键
    generateBlogUrl(depth, lang, isRootPage) // 生成博客URL
    buildAllPages()                       // 构建所有页面
    generateRootRedirectPage()            // 生成根页面（英文内容）
}
```

### BlogBuilder 类
```javascript
class BlogBuilder {
    constructor()
    ensureDirectories()                   // 确保目录存在
    enhanceImages(html, options)          // 增强图片性能属性
    processMarkdownFile(filePath, lang)   // 处理Markdown文件
    generateBlogComponents()              // 生成博客组件
    generateBlogPages()                   // 生成博客页面配置
}
```

### HubBuilder 类
```javascript
class HubBuilder {
    constructor()
    processHubContent()                   // 处理Hub内容
    generateHubComponents()               // 生成Hub组件
    generateHubPages()                    // 生成Hub页面配置
}
```

---

## 关键依赖与配置

### 外部依赖
- `fs` - 文件系统操作
- `path` - 路径处理
- `marked` - Markdown解析
- `gray-matter` - Front Matter解析
- `highlight.js` - 代码高亮

### 内部依赖
- `component-builder.js` - 组件构建基类
- `blog-builder.js` - 博客构建器
- `hub-builder.js` - Hub构建器
- `translation-validator.js` - 翻译验证器
- `internal-links-processor.js` - 内链处理器
- `critical-css-extractor.js` - 关键CSS提取器

### 配置文件
- `pages-config.json` (6185+行) - 页面配置
  - 页面路由定义
  - SEO元数据
  - 结构化数据
  - 组件映射

---

## 数据模型

### 页面配置结构
```json
{
  "pages": [
    {
      "name": "index",
      "template": "base",
      "output": "index.html",
      "page_content": "home-content",
      "config": {
        "page_title_key": "page_title",
        "page_description_key": "page_description",
        "canonical_url": "https://screensizechecker.com/",
        "structured_data": { ... }
      }
    }
  ]
}
```

### 博客文章元数据
```yaml
---
title: "文章标题"
description: "文章描述"
date: "2025-01-15"
author: "Screen Size Checker Team"
category: "technical"
tags: ["tag1", "tag2"]
readingTime: "5 分钟阅读"
---
```

---

## 测试与质量

### 构建验证
- ✅ 翻译完整性检查（450个键值）
- ✅ 组件存在性验证
- ✅ 页面生成验证
- ✅ 内链配置验证

### 质量工具
- `translation-validator.js` - 检测缺失翻译
- `internal-links-processor.js` - 验证内链配置
- 构建报告生成（build-report.json）

### 已知限制
- 无单元测试覆盖
- 构建时间较长（~30秒）
- 错误处理可以改进

---

## 常见问题 (FAQ)

### Q: 如何添加新页面？
A: 在`pages-config.json`中添加页面配置，然后运行`npm run multilang-build`。

### Q: 如何添加新语言？
A:
1. 在`locales/`下创建新语言目录和translation.json
2. 在`multilang-builder.js`中添加到`enabledLanguages`数组
3. 运行构建

### Q: 博客文章不显示怎么办？
A: 检查：
1. Markdown文件是否在正确的语言目录下
2. Front Matter格式是否正确
3. 分类是否为支持的三种之一（technical/css/basics）
4. 运行构建后检查生成的组件

### Q: 构建失败怎么办？
A: 检查：
1. Node.js版本是否>=16
2. 依赖是否安装完整（npm install）
3. 查看错误日志定位问题
4. 检查pages-config.json语法

---

## 相关文件清单

### 核心构建文件
- `multilang-builder.js` (2687+行) - 多语言构建器
- `component-builder.js` - 组件构建基类
- `blog-builder.js` - 博客构建器
- `hub-builder.js` (473行) - Hub构建器

### 辅助工具
- `translation-validator.js` - 翻译验证
- `internal-links-processor.js` - 内链处理
- `critical-css-extractor.js` - CSS提取
- `migrate-internal-links.js` - 内链迁移工具

### 配置文件
- `pages-config.json` (6185+行) - 页面配置
- `internal-links-migration-report.json` - 迁移报告
- `internal-links-report.json` - 内链报告
- `translation-validation-report.json` - 翻译验证报告

---

## 变更记录

### 2025-12-29 - 初始化模块文档
- 创建构建系统模块文档
- 记录核心类和接口
- 整理配置文件结构
