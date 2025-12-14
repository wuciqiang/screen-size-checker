# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 快速命令（Windows PowerShell）

```powershell path=null start=null
# 安装依赖
npm install

# 全量构建（多语言 + 博客 + 内链 + SEO 产物）
npm run multilang-build

# 组件构建/验证（便于本地调试组件拼装）
npm run test-build
npm run validate-components

# 批量构建所有已配置页面
npm run batch-build

# 部署前检查（Cloudflare 相关校验）
npm run deploy-check

# 性能监控构建检查（确保监控模块已集成）
npm run performance-check
```

测试脚本（仓库自带 Node 测试脚本，非 Jest）：
- 运行单个测试
```powershell path=null start=null
node test/seo-tags-validator.js
```
- 批量运行 test 目录下所有测试（PowerShell）
```powershell path=null start=null
Get-ChildItem test -Filter *.js | ForEach-Object { node $_.FullName }
```

## 高层架构总览（Big Picture）

本项目是“多语言静态网站生成系统 + ES6 模块化前端”的组合，围绕以下关键流水线与子系统运作：

### 1) 静态构建流水线（Build）
- 核心构建器：`build/multilang-builder.js`
  - 只启用 en/zh 两种语言进行实际产出；其他语言为占位翻译（83-84键值）。
  - 生成目录：`multilang-build/`（包含 en、zh 子目录、css/js/locales、sitemap.xml、robots.txt、_redirects、build-report.json）。
  - 集成子流程：
    - 翻译验证：`build/translation-validator.js`（构建时校验 450+ 键值）
    - 内链注入：`build/internal-links-processor.js`（从 `data/internal-links-config.json` 注入）
    - 博客构建：`build/blog-builder.js`（从 `blog-content/` 读取 Markdown + Front Matter）
    - 关键 CSS 提取：`build/critical-css-extractor.js`（必要时抽取关键样式）
- 页面配置：`build/pages-config.json`
  - 为每个页面声明模板、输出路径、SEO（title/description/OG/structured data）与资源路径（css/js/locales）。
- 组件与模板：
  - `components/` 提供 60+ 片段组件；`templates/` 定义 `base.html`、`device-page.html`、`blog-*.html` 等模板。

### 2) 语言与 SEO 策略（i18n + SEO）
- 启用语言：英文(en)与中文(zh)完整翻译（各 474 键值），其他语言保留基础键值待完善。
- 根域名策略（v2.3.0）：根域名不再 302 到 `/en/`，直接输出英文页面（Canonical 与 hreflang 正确配置，保持 `/en/`、`/zh/` 向后兼容）。
- 构建时翻译：支持嵌套键（如 `ppiCalculator.title`），处理 `data-i18n` 和 `{{t:key}}` 占位。
- 运行时翻译：`js/i18n.js` 基于 i18next，按当前 URL 路径智能解析翻译资源路径，支持事件驱动更新与回退。

### 3) 运行时代码组织（Runtime JS）
- 入口：`js/app.js`
  - 分阶段初始化（主题/事件管理/字体优化/移动端优化），并通过 `module-loading-optimizer.js` 按需懒加载页面模块。
  - 与 `optimized-event-manager.js`、`performance-monitor.js` 协同收集与优化性能。
- 设备检测：`js/device-detector.js`
  - 统一收集设备/浏览器/视口信息；设置 30s 缓存；视口更新防抖（100ms）。
- 内链前端：`js/internal-links.js`
  - 结合构建时注入的页面信息，运行时修正相对路径、去重当前页并统一展示风格。

### 4) 内容与页面生成（Content）
- 博客系统：`blog-content/{en,zh}/` + `build/blog-builder.js`
  - 使用 Markdown + YAML Front Matter；支持分类：`technical`、`css`、`basics`。
  - 构建生成文章组件、索引、分类、标签页，并产出到 `multilang-build/{lng}/blog/`。
- 设备与工具页面：由 `build/pages-config.json` 驱动，使用 `templates/device-page.html` 装配 `components/*-content.html`。

## 常见开发任务

- 新增页面
  1) 新建组件到 `components/`
  2) 在 `templates/` 选用/新增模板
  3) 在 `build/pages-config.json` 增加路由与 SEO 配置
  4) 执行 `npm run multilang-build`

- 新增博客文章
  1) 在 `blog-content/en/` 与 `blog-content/zh/` 同名创建 Markdown
  2) 填写规范的 Front Matter（标题/描述/日期/分类/标签等）
  3) 构建后检查 `multilang-build/{lng}/blog/` 输出

- 更新翻译
  1) 修改 `locales/{en|zh}/translation.json`
  2) 执行 `npm run multilang-build`（会进行翻译验证）

- 内链维护
  1) 更新 `data/internal-links-config.json`
  2) 构建时由 `internal-links-processor.js` 注入并在前端由 `js/internal-links.js` 处理

## 验证与调试

- 构建产物与报告
```powershell path=null start=null
npm run multilang-build
# 查看 multilang-build/build-report.json、sitemap.xml、_redirects、robots.txt
```
- 关键测试脚本示例
```powershell path=null start=null
node test/internal-links-checker.js
node test/seo-tags-validator.js
node test/blog-redirect-test.js
node test/simple-validation.js
```

## 部署要点（Cloudflare Pages）
- 发布目录：`multilang-build/`（整个目录上传/作为 Pages 构建输出）。
- 根域名即英文主入口（保持 `/en/`、`/zh/` 可访问）。
- 参考 `docs/DEPLOYMENT.md` 获取 HTTPS、MIME、压缩与缓存的具体建议，以及性能监控验证步骤。

---

补充说明：
- Node.js >= 16，依赖：gray-matter、highlight.js、marked。
- 不包含 ESLint/单测框架脚本；如需测试，使用仓库提供的 Node 脚本直接运行。
- 本文件仅聚焦必要命令与系统架构，不重复 README 中易于浏览的清单。
