# Screen Size Checker 维护与开发 SOP

> **文档目的**：为项目的日常维护、功能开发和语言扩展提供标准化操作指南。  
> **更新日期**：2025-10-18  
> **适用人员**：开发人员、内容编辑、维护人员

---

## 📑 目录

1. [项目架构速查](#1-项目架构速查)
2. [开发环境准备](#2-开发环境准备)
3. [日常开发流程](#3-日常开发流程)
4. [新增页面完整指南](#4-新增页面完整指南)
5. [新增博客文章流程](#5-新增博客文章流程)
6. [多语言管理](#6-多语言管理)
7. [构建与部署](#7-构建与部署)
8. [常见问题排查](#8-常见问题排查)
9. [代码规范](#9-代码规范)
10. [维护最佳实践](#10-维护最佳实践)

---

## 1. 项目架构速查

### 1.1 核心目录结构

```
screen-size-checker/
├── build/                      # 构建系统 ⚙️
│   ├── multilang-builder.js    # 多语言构建器 (核心)
│   ├── component-builder.js    # 组件构建器
│   ├── blog-builder.js         # 博客构建器
│   ├── internal-links-processor.js  # 内链处理器
│   └── pages-config.json       # 页面配置 (重要)
│
├── components/                 # HTML组件 (60+个) 📦
│   ├── head.html              # 页面头部
│   ├── header.html            # 导航栏
│   ├── footer.html            # 页脚
│   ├── *-content.html         # 各页面内容组件
│   └── internal-links.html    # 内链组件
│
├── templates/                  # 页面模板 📄
│   ├── base.html              # 基础模板
│   ├── device-page.html       # 设备页面模板
│   └── blog-*.html            # 博客相关模板
│
├── locales/                    # 翻译文件 🌍
│   ├── en/translation.json    # 英文 (474键值)
│   └── zh/translation.json    # 中文 (474键值)
│
├── blog-content/               # 博客内容 📝
│   ├── en/                    # 英文文章 (.md)
│   ├── zh/                    # 中文文章 (.md)
│   └── images/                # 文章图片
│
├── js/                         # 前端JS (13个模块) 💻
│   ├── app.js                 # 主入口
│   ├── i18n.js                # 国际化
│   ├── device-detector.js     # 设备检测
│   └── ...其他功能模块
│
├── css/                        # 样式文件 (8个) 🎨
│   ├── main.css               # 主样式
│   ├── base.css               # 基础样式
│   └── ...其他样式
│
├── data/                       # 配置数据 📊
│   └── internal-links-config.json  # 内链配置
│
├── test/                       # 测试脚本 🧪
│   ├── seo-tags-validator.js
│   ├── internal-links-checker.js
│   └── ...其他测试
│
└── multilang-build/            # 构建输出 🚀
    ├── en/                    # 英文版本 (28页)
    ├── zh/                    # 中文版本 (28页)
    ├── css/, js/, locales/    # 静态资源
    └── sitemap.xml            # 网站地图
```

### 1.2 技术栈概览

- **构建系统**：Node.js 自定义静态网站生成器
- **前端**：原生 JavaScript (ES6+)，无框架
- **国际化**：i18next
- **内容**：Markdown + Front Matter
- **部署**：Cloudflare Pages (静态托管)

### 1.3 关键文件说明

| 文件 | 用途 | 修改频率 |
|------|------|---------|
| `build/pages-config.json` | 页面路由和SEO配置 | 🔴 每次新增页面 |
| `locales/*/translation.json` | 多语言翻译 | 🟡 每次新增内容 |
| `data/internal-links-config.json` | 内链配置 | 🟡 每次新增页面 |
| `build/multilang-builder.js` | 构建核心逻辑 | 🟢 很少修改 |
| `components/*.html` | 可复用组件 | 🟡 中等频率 |

---

## 2. 开发环境准备

### 2.1 环境要求

```bash
# 检查 Node.js 版本 (需要 >= 16.0.0)
node --version

# 检查 npm 版本
npm --version
```

### 2.2 初始化项目

```bash
# 克隆项目
git clone <repository-url>
cd screen-size-checker

# 安装依赖
npm install

# 验证构建系统
npm run multilang-build
```

### 2.3 必备工具

- **代码编辑器**：VS Code (推荐)
- **浏览器**：Chrome/Edge (开发者工具)
- **Git**：版本控制
- **可选**：Playwright (端到端测试)

---

## 3. 日常开发流程

### 3.1 标准工作流

```bash
# 1. 创建工作分支
git checkout -b feature/your-feature-name

# 2. 进行开发...
# (修改组件、添加翻译、更新配置等)

# 3. 本地构建测试
npm run multilang-build

# 4. 验证构建产物
# 检查 multilang-build/ 目录
# 在浏览器中打开相关页面测试

# 5. 运行测试脚本
node test/seo-tags-validator.js
node test/internal-links-checker.js

# 6. 提交代码
git add .
git commit -m "feat: 描述你的改动"
git push origin feature/your-feature-name
```

### 3.2 快速命令参考

```bash
# 完整构建 (推荐)
npm run multilang-build

# 仅测试组件构建
npm run test-build

# 验证组件完整性
npm run validate-components

# 批量构建所有页面
npm run batch-build
```

### 3.3 开发注意事项

✅ **DO (推荐做法)**：
- 每次开发前先 `git pull` 获取最新代码
- 修改后立即构建测试，不要积累问题
- 使用有意义的 commit message
- 保持组件的独立性和可复用性

❌ **DON'T (避免做法)**：
- 直接在 `main` 分支开发
- 修改 `multilang-build/` 目录（这是构建产物）
- 硬编码文本，应使用翻译键
- 修改核心构建逻辑而不做充分测试

---

## 4. 新增页面完整指南

### 4.1 页面开发检查清单

- [ ] 创建页面内容组件
- [ ] 选择或创建页面模板
- [ ] 配置页面路由和SEO
- [ ] 添加多语言翻译
- [ ] 配置内链
- [ ] 构建并测试
- [ ] 验证SEO标签

### 4.2 详细步骤

#### 步骤 1：创建内容组件

在 `components/` 目录创建新组件：

```html
<!-- components/your-new-page-content.html -->
<section class="your-section">
    <h1 data-i18n="yourPage.title">{{yourPage.title}}</h1>
    <p data-i18n="yourPage.intro">{{yourPage.intro}}</p>
    
    <!-- 你的页面内容 -->
</section>
```

**命名规范**：
- 使用 `kebab-case`
- 以 `-content.html` 结尾
- 名称应清晰描述用途

#### 步骤 2：配置页面路由

在 `build/pages-config.json` 添加配置：

```json
{
  "name": "your-new-page",
  "template": "base",
  "output": "your-page.html",
  "enabled_languages": ["en", "zh"],
  "page_content": "your-new-page-content",
  "config": {
    "page_title": "Your Page Title",
    "page_title_key": "yourPage.pageTitle",
    "page_description_key": "yourPage.pageDescription",
    "canonical_url": "https://screensizechecker.com/your-page",
    "og_title": "Your Page - Screen Size Checker",
    "og_description": "Your page description for social sharing",
    "og_type": "website",
    "og_url": "https://screensizechecker.com/your-page",
    "css_path": "css",
    "locales_path": "locales",
    "js_path": "js",
    "home_url": "index.html",
    "blog_url": "blog/",
    "privacy_policy_url": "privacy-policy.html",
    "show_breadcrumb": true,
    "breadcrumb_items": [
      {"text_key": "home", "url": "index.html"},
      {"text_key": "yourPage.breadcrumb", "url": "your-page.html"}
    ]
  }
}
```

#### 步骤 3：添加翻译

在 `locales/en/translation.json` 和 `locales/zh/translation.json` 添加：

```json
{
  "yourPage": {
    "title": "Your Page Title",
    "intro": "Introduction text",
    "pageTitle": "Complete Page Title - Screen Size Checker",
    "pageDescription": "SEO description for your page",
    "breadcrumb": "Your Page"
  }
}
```

#### 步骤 4：配置内链

在 `data/internal-links-config.json` 添加：

```json
{
  "pages": {
    "your-new-page": {
      "id": "your-new-page",
      "category": "tools",
      "priority": 5,
      "icon": "🔧",
      "urls": {
        "en": "your-page.html",
        "zh": "your-page.html"
      },
      "titleKey": "yourPage.title",
      "descriptionKey": "yourPage.intro"
    }
  }
}
```

#### 步骤 5：构建并测试

```bash
# 构建
npm run multilang-build

# 检查构建日志是否有错误
# 查看 multilang-build/build-report.json

# 在浏览器中测试
# multilang-build/en/your-page.html
# multilang-build/zh/your-page.html
```

#### 步骤 6：验证 SEO

```bash
# 运行 SEO 验证
node test/seo-tags-validator.js

# 检查项：
# - Title 标签正确
# - Meta description 存在
# - Canonical URL 正确
# - Open Graph 标签完整
# - hreflang 标签正确
```

### 4.3 常见页面类型示例

#### 工具页面（如计算器）

```json
{
  "name": "calculator-page",
  "template": "base",
  "page_content": "calculator-content",
  "config": {
    "show_breadcrumb": true,
    "custom_js": "calculator.js"
  }
}
```

#### 设备信息页面

```json
{
  "name": "device-info",
  "template": "device-page",
  "page_content": "device-info-content",
  "output": "devices/device-name.html"
}
```

---

## 5. 新增博客文章流程

### 5.1 文章创建检查清单

- [ ] 同时创建英文和中文 Markdown 文件
- [ ] 填写完整的 Front Matter
- [ ] 使用正确的分类和标签
- [ ] 添加文章图片（如需要）
- [ ] 构建并预览
- [ ] 检查博客索引和分类页

### 5.2 创建文章文件

在 `blog-content/en/` 和 `blog-content/zh/` 创建同名文件：

```bash
# 英文版
blog-content/en/your-article-title.md

# 中文版
blog-content/zh/your-article-title.md
```

### 5.3 文章 Front Matter 模板

```yaml
---
title: "Your Article Title"
description: "SEO-friendly article description (120-160 characters)"
date: "2025-10-18"
author: "Screen Size Checker Team"
category: "technical"  # 只能用: technical, css, basics
tags: ["tag1", "tag2", "tag3"]  # 必须是数组格式
readingTime: "5 分钟阅读"
featuredImage: "your-image.png"  # 可选，放在 blog-content/images/
---

# 文章标题

## 第一节

你的内容...

## 第二节

更多内容...

### 子章节

代码示例：

\`\`\`javascript
// 你的代码
console.log('Hello World');
\`\`\`

## 结论

总结...
```

### 5.4 支持的分类和标签

**分类（category）**：
- `technical` - 深入技术主题
- `css` - CSS 技术相关
- `basics` - 基础概念

**常用标签（tags）**：
- 英文：`responsive-design`, `css`, `dpr`, `viewport`, `web-development`
- 中文：`响应式设计`, `像素密度`, `视口`, `网页开发`

### 5.5 图片管理

```bash
# 1. 将图片放入
blog-content/images/your-image.png

# 2. 在 Markdown 中引用
![图片描述](../images/your-image.png)

# 3. 构建后图片会被复制到
multilang-build/images/your-image.png
```

### 5.6 构建博客

```bash
# 完整构建（包含博客）
npm run multilang-build

# 检查构建日志中的博客部分
# 查看生成的文章页面
# multilang-build/en/blog/your-article-title.html
# multilang-build/zh/blog/your-article-title.html

# 检查博客索引
# multilang-build/en/blog/index.html
# multilang-build/zh/blog/index.html
```

### 5.7 博客验证清单

- [ ] 文章在博客首页显示
- [ ] 分类页面包含该文章
- [ ] 标签页面包含该文章
- [ ] 文章内容渲染正确
- [ ] 代码高亮正常
- [ ] 图片正确加载
- [ ] 阅读时间显示正确

---

## 6. 多语言管理

### 6.1 当前语言状态

**完整支持**（474键值）：
- 🇺🇸 英文 (en) - 默认语言
- 🇨🇳 中文 (zh)

**预备语言**（83-84键值）：
- 🇩🇪 德文 (de), 🇪🇸 西班牙文 (es), 🇫🇷 法文 (fr)
- 🇮🇹 意大利文 (it), 🇯🇵 日文 (ja), 🇰🇷 韩文 (ko)
- 🇵🇹 葡萄牙文 (pt), 🇷🇺 俄文 (ru)

### 6.2 新增语言完整流程

#### 步骤 1：创建翻译文件

```bash
# 1. 创建语言目录
mkdir locales/fr

# 2. 复制英文翻译作为模板
cp locales/en/translation.json locales/fr/translation.json

# 3. 翻译所有键值（474个）
# 保持 JSON 结构不变，只翻译值
```

#### 步骤 2：启用语言

编辑 `build/multilang-builder.js`：

```javascript
// 找到这一行
this.supportedLanguages = ['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it'];

// 找到这一行（实际启用的语言）
const enabledLanguages = ['en', 'zh', 'fr'];  // 添加 'fr'
```

#### 步骤 3：配置语言选择器

在 `js/language-modal.js` 或相关配置中添加语言：

```javascript
{
  code: 'fr',
  name: 'Français',
  flag: '🇫🇷'
}
```

#### 步骤 4：构建并测试

```bash
# 构建
npm run multilang-build

# 检查新语言目录
ls multilang-build/fr/

# 浏览器测试
# multilang-build/fr/index.html
```

### 6.3 翻译键命名规范

```json
{
  "page": {
    "section": {
      "element": "翻译文本"
    }
  }
}
```

**示例**：

```json
{
  "ppiCalculator": {
    "title": "PPI Calculator",
    "form": {
      "inputTitle": "Enter Screen Parameters",
      "widthLabel": "Width (pixels)",
      "validation": {
        "invalidNumber": "Please enter a valid number"
      }
    }
  }
}
```

**使用方式**：

```html
<!-- HTML 中 -->
<h1 data-i18n="ppiCalculator.title">{{ppiCalculator.title}}</h1>

<!-- JavaScript 中 -->
i18next.t('ppiCalculator.form.validation.invalidNumber')
```

### 6.4 翻译质量检查

```bash
# 构建时会自动验证翻译
npm run multilang-build

# 查看翻译验证报告
cat build/translation-validation-report.json

# 手动检查翻译覆盖率
node -e "
const en = require('./locales/en/translation.json');
const zh = require('./locales/zh/translation.json');
console.log('EN keys:', Object.keys(en).length);
console.log('ZH keys:', Object.keys(zh).length);
"
```

---

## 7. 构建与部署

### 7.1 本地构建流程

```bash
# 1. 确保代码是最新的
git pull origin main

# 2. 清理旧的构建产物（可选）
rm -rf multilang-build

# 3. 完整构建
npm run multilang-build

# 4. 检查构建报告
cat multilang-build/build-report.json

# 5. 本地预览（需要本地服务器）
# 使用 VS Code Live Server 或
# npx http-server multilang-build -p 8080
```

### 7.2 构建产物验证

**检查项**：

```bash
# 1. 检查目录结构
ls -la multilang-build/

# 应包含：
# ✅ en/, zh/ (语言目录)
# ✅ css/, js/, locales/ (静态资源)
# ✅ images/ (博客图片)
# ✅ sitemap.xml
# ✅ robots.txt
# ✅ _redirects
# ✅ favicon.ico, ads.txt 等

# 2. 检查页面数量
ls multilang-build/en/*.html | wc -l
ls multilang-build/zh/*.html | wc -l
# 每种语言应该有 28 个页面

# 3. 检查博客文章
ls multilang-build/en/blog/*.html
ls multilang-build/zh/blog/*.html
```

### 7.3 运行测试

```bash
# SEO 标签验证
node test/seo-tags-validator.js

# 内链完整性检查
node test/internal-links-checker.js

# 博客重定向测试
node test/blog-redirect-test.js

# 简单验证
node test/simple-validation.js
```

### 7.4 部署到 Cloudflare Pages

**方式一：Git 自动部署（推荐）**

```bash
# 1. 提交代码
git add .
git commit -m "feat: 你的更新说明"
git push origin main

# 2. Cloudflare Pages 会自动检测并构建部署
# 构建命令: npm run multilang-build
# 构建输出目录: multilang-build
```

**方式二：手动上传**

```bash
# 1. 本地构建
npm run multilang-build

# 2. 上传 multilang-build/ 目录到 Cloudflare Pages
# (通过 Cloudflare Dashboard 或 wrangler CLI)
```

### 7.5 部署后验证

**立即检查**：
- [ ] 访问主页：`https://screensizechecker.com/`
- [ ] 测试语言切换：`/en/`, `/zh/`
- [ ] 检查新增页面是否可访问
- [ ] 测试内链跳转
- [ ] 验证博客文章显示

**SEO 验证**：
- [ ] 访问 `https://screensizechecker.com/sitemap.xml`
- [ ] 验证 robots.txt
- [ ] 使用 Google Search Console 检查索引
- [ ] 检查 Open Graph 预览（社交分享）

### 7.6 回滚流程

如果部署出现问题：

```bash
# 1. 在 Cloudflare Pages Dashboard 找到上一个成功的部署
# 2. 点击 "Rollback to this deployment"

# 或者通过 Git 回滚
git revert <commit-hash>
git push origin main
```

---

## 8. 常见问题排查

### 8.1 构建失败

**问题：构建报错**

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 16.0.0

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 检查是否有语法错误
npm run test-build
```

**问题：某个页面构建失败**

1. 检查 `build-report.json` 中的错误信息
2. 检查对应的组件文件是否存在
3. 检查 `pages-config.json` 配置是否正确
4. 检查翻译键是否存在

### 8.2 翻译问题

**问题：页面显示翻译键而非文本**

```javascript
// 检查翻译文件
// locales/en/translation.json 或 locales/zh/translation.json

// 确认键值存在：
{
  "yourKey": "Your Translation"
}

// 如果是嵌套键：
{
  "parent": {
    "child": "Your Translation"
  }
}

// 使用方式：
// HTML: data-i18n="parent.child"
// JS: i18next.t('parent.child')
```

**问题：翻译未生效**

1. 清理构建产物：`rm -rf multilang-build`
2. 重新构建：`npm run multilang-build`
3. 检查浏览器控制台错误
4. 检查翻译文件是否被正确复制到 `multilang-build/locales/`

### 8.3 博客问题

**问题：博客文章不显示**

```bash
# 1. 检查 Markdown 文件是否存在
ls blog-content/en/your-article.md
ls blog-content/zh/your-article.md

# 2. 检查 Front Matter 格式
# 必须有三个短横线包围：
---
title: "Title"
category: "technical"
tags: ["tag1"]
---

# 3. 检查分类是否正确（只能是 technical, css, basics）

# 4. 重新构建
npm run multilang-build

# 5. 检查构建日志中的博客部分
```

**问题：图片不显示**

```bash
# 1. 确认图片在正确位置
ls blog-content/images/your-image.png

# 2. 检查 Markdown 中的路径
# 应该是：../images/your-image.png

# 3. 确认构建后图片被复制
ls multilang-build/images/your-image.png
```

### 8.4 内链问题

**问题：内链不显示或显示错误**

```bash
# 1. 检查配置文件
cat data/internal-links-config.json

# 2. 确认页面 ID 配置正确

# 3. 检查翻译键是否存在

# 4. 检查构建日志
npm run multilang-build | grep "internal"

# 5. 运行内链检查测试
node test/internal-links-checker.js
```

### 8.5 性能问题

**问题：页面加载缓慢**

1. 检查图片大小：图片应该 < 500KB
2. 检查 JavaScript 模块是否按需加载
3. 检查 CSS 是否有重复或未使用的样式
4. 使用浏览器开发者工具分析性能

**问题：构建时间过长**

```bash
# 1. 检查是否有不必要的文件被处理

# 2. 清理缓存
rm -rf node_modules/.cache

# 3. 确认只启用了必要的语言
# 在 multilang-builder.js 中：
const enabledLanguages = ['en', 'zh'];  # 只启用需要的
```

---

## 9. 代码规范

### 9.1 HTML 组件规范

```html
<!-- ✅ 好的示例 -->
<section class="calculator-section">
    <!-- 使用语义化标签 -->
    <h2 data-i18n="calculator.title">{{calculator.title}}</h2>
    
    <!-- 清晰的类名 -->
    <div class="calculator-input-group">
        <label for="width-input" data-i18n="calculator.widthLabel">
            {{calculator.widthLabel}}
        </label>
        <input 
            type="number" 
            id="width-input" 
            class="calculator-input"
            aria-label="Screen width in pixels"
        >
    </div>
</section>

<!-- ❌ 避免 -->
<div class="sec">
    <div class="t">Calculator</div>  <!-- 硬编码文本 -->
    <input type="text" class="i">    <!-- 不明确的类名 -->
</div>
```

### 9.2 JavaScript 规范

```javascript
// ✅ 好的示例
class PPICalculator {
    constructor(options = {}) {
        this.container = options.container;
        this.precision = options.precision || 2;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTranslations();
    }
    
    /**
     * 计算 PPI
     * @param {number} width - 屏幕宽度（像素）
     * @param {number} height - 屏幕高度（像素）
     * @param {number} diagonal - 对角线尺寸（英寸）
     * @returns {number} PPI 值
     */
    calculatePPI(width, height, diagonal) {
        const pixels = Math.sqrt(width ** 2 + height ** 2);
        return (pixels / diagonal).toFixed(this.precision);
    }
}

// ❌ 避免
function calc(w,h,d){
    return Math.sqrt(w*w+h*h)/d;  // 无注释，变量名不清晰
}
```

### 9.3 CSS 规范

```css
/* ✅ 好的示例 */
.calculator-section {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
}

.calculator-input-group {
    margin-bottom: 1.5rem;
}

.calculator-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .calculator-section {
        padding: 1rem;
    }
}

/* ❌ 避免 */
.calc { padding:10px; }  /* 不明确的类名 */
input { width:100%; }    /* 过于宽泛的选择器 */
```

### 9.4 命名约定

**文件命名**：
- 组件：`kebab-case-content.html`
- 脚本：`kebab-case.js`
- 样式：`kebab-case.css`
- 博客：`kebab-case.md`

**变量命名**：
- JavaScript：`camelCase`
- CSS 类：`kebab-case`
- CSS 变量：`--kebab-case`
- 翻译键：`camelCase.nestedKey`

**示例**：

```javascript
// JavaScript
const screenWidth = 1920;
const devicePixelRatio = 2;

// CSS
.screen-info-container { }
.device-pixel-ratio-display { }

// CSS 变量
:root {
    --primary-color: #007bff;
    --text-color: #333;
}

// 翻译键
{
    "screenInfo": {
        "title": "Screen Information",
        "devicePixelRatio": "Device Pixel Ratio"
    }
}
```

---

## 10. 维护最佳实践

### 10.1 代码维护

**定期任务**：

```bash
# 每月一次：检查依赖更新
npm outdated

# 谨慎更新主要版本
npm update <package-name>

# 每季度：清理未使用的代码
# 1. 检查未引用的组件
# 2. 删除未使用的翻译键
# 3. 移除过时的测试脚本

# 每次发布前：运行所有测试
npm run multilang-build
node test/seo-tags-validator.js
node test/internal-links-checker.js
```

### 10.2 性能监控

**关键指标**：
- 页面加载时间 < 3秒
- 构建时间 < 2分钟
- 总页面数：56 (28 英文 + 28 中文)
- JavaScript 总大小 < 500KB
- CSS 总大小 < 200KB

**监控工具**：
```bash
# 检查构建产物大小
du -sh multilang-build/

# 检查单个资源大小
ls -lh multilang-build/js/
ls -lh multilang-build/css/
```

### 10.3 文档维护

**保持更新**：
- [ ] README.md - 项目概览和快速开始
- [ ] BUILD_SYSTEM.md - 构建系统技术文档
- [ ] MAINTENANCE_SOP.md - 本维护手册
- [ ] INCREMENTAL_SEO_DEV_PLAN.md - SEO 优化计划

**更新时机**：
- 新增功能后
- 修改工作流程后
- 发现文档错误时
- 收到团队反馈时

### 10.4 Git 提交规范

```bash
# 功能新增
git commit -m "feat: 新增 PPI 计算器页面"

# Bug 修复
git commit -m "fix: 修复移动端导航栏样式问题"

# 文档更新
git commit -m "docs: 更新维护 SOP"

# 样式调整
git commit -m "style: 优化按钮样式和间距"

# 重构
git commit -m "refactor: 重构设备检测模块"

# 性能优化
git commit -m "perf: 优化图片加载性能"

# 测试
git commit -m "test: 新增内链完整性测试"

# 构建相关
git commit -m "build: 更新构建依赖"
```

### 10.5 备份策略

**重要文件备份**：
```bash
# 定期备份关键配置
cp build/pages-config.json build/pages-config.json.backup
cp data/internal-links-config.json data/internal-links-config.json.backup

# 备份翻译文件
zip -r locales-backup-$(date +%Y%m%d).zip locales/

# 备份博客内容
zip -r blog-backup-$(date +%Y%m%d).zip blog-content/
```

### 10.6 应急预案

**生产环境问题**：

1. **立即回滚** (如果影响用户)
2. **本地复现问题**
3. **修复并测试**
4. **重新部署**
5. **记录问题和解决方案**

**数据恢复**：

```bash
# 从 Git 历史恢复文件
git checkout HEAD~1 -- path/to/file

# 从备份恢复
unzip locales-backup-20251018.zip

# 查看文件历史
git log --follow -- path/to/file
```

---

## 📞 获取帮助

### 常用资源

- **项目文档**：查看 `README.md` 和 `BUILD_SYSTEM.md`
- **测试脚本**：`test/` 目录下的验证工具
- **构建报告**：`multilang-build/build-report.json`
- **Git 历史**：查看类似功能的提交记录

### 调试技巧

```bash
# 1. 查看详细构建日志
npm run multilang-build 2>&1 | tee build.log

# 2. 检查特定组件
grep -r "your-component" components/

# 3. 查找翻译键
grep -r "your.translation.key" locales/

# 4. 检查页面配置
cat build/pages-config.json | jq '.pages[] | select(.name=="your-page")'
```

---

## 📋 附录：快速参考

### 常用命令速查

```bash
# 构建
npm run multilang-build          # 完整构建
npm run test-build               # 测试构建
npm run batch-build              # 批量构建

# 测试
node test/seo-tags-validator.js  # SEO 验证
node test/internal-links-checker.js  # 内链检查

# Git
git status                       # 查看状态
git diff                        # 查看改动
git log --oneline -10           # 查看历史

# 文件操作
ls multilang-build/en/          # 列出英文页面
cat build/pages-config.json     # 查看页面配置
grep -r "keyword" .             # 搜索关键词
```

### 关键路径速查

```
组件: components/your-component.html
配置: build/pages-config.json
翻译: locales/en/translation.json
内链: data/internal-links-config.json
博客: blog-content/en/your-article.md
输出: multilang-build/en/your-page.html
```

---

**维护 SOP 版本**：v2.0.0  
**最后更新**：2025-10-18  
**适用项目版本**：v2.3.0+

如有疑问或建议，请及时更新本文档！
