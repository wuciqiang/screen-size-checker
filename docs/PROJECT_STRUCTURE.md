# 项目结构文档

**最后更新**: 2025-11-07  
**阶段**: Phase 1 Gaming内容集群开发中  
**项目版本**: v2.3.0+

---

## 📁 核心目录结构

```
screen-size-checker/
├── build/                          # 构建系统
│   ├── multilang-builder.js        # 多语言构建器（主）
│   ├── component-builder.js        # 组件处理器
│   ├── blog-builder.js            # 博客构建器
│   ├── hub-builder.js             # Gaming Hub构建器 ✨ 新增
│   ├── internal-links-processor.js # 内链处理器
│   ├── translation-validator.js    # 翻译验证器
│   └── pages-config.json          # 页面配置（6185+行）
│
├── components/                     # HTML组件（170+个）
│   ├── header-mega-menu.html      # 导航（Tools/Devices/Gaming下拉菜单）✨
│   ├── footer-optimized.html      # 页脚（5栏布局）
│   ├── head.html                  # HTML头部
│   ├── blog-*.html                # 博客组件（自动生成，8篇×4语言=32个）
│   ├── hub-*.html                 # Hub组件（自动生成，4页×4语言=16个）✨
│   ├── internal-link-modules.html # 内链模块组件
│   └── *-content.html             # 页面内容组件
│
├── css/                           # 样式文件
│   ├── mega-menu.css              # 导航样式
│   ├── footer-optimized.css       # 页脚样式
│   └── *.css                      # 其他样式
│
├── js/                            # JavaScript文件
│   ├── app.js                     # 主应用（导航高亮已修复）
│   ├── mega-menu.js               # 导航交互
│   ├── i18n.js                    # 国际化
│   └── *.js                       # 其他脚本
│
├── templates/                     # 页面模板
│   ├── base.html                  # 基础模板
│   ├── device-page.html           # 设备页面模板
│   ├── blog-*.html                # 博客模板
│   └── *.html                     # 其他模板
│
├── locales/                       # 翻译文件
│   ├── en/translation.json        # 英文翻译（724键）
│   ├── zh/translation.json        # 中文翻译（723键）
│   ├── de/translation.json        # 德语翻译（709键）✨
│   └── es/translation.json        # 西班牙语翻译（709键）✨
│
├── blog-content/                  # 博客Markdown源文件
│   ├── en/*.md                    # 英文文章（8篇）
│   ├── zh/*.md                    # 中文文章（8篇）
│   └── images/                    # 博客图片资源

├── hub-content/                   # Gaming Hub内容源文件 ✨ 新增
│   ├── best-gaming-resolution-2025.md (en)
│   ├── best-gaming-resolution-2025.{zh|de|es}.md
│   ├── 1080p-vs-1440p-gaming.md (en/zh/de/es)
│   ├── gaming-monitor-size-guide.md (en/zh/de/es)
│   └── 1440p-vs-4k-gaming.md (en/zh/de/es)
│
├── multilang-build/               # 构建输出（git忽略）
│   ├── index.html                 # 英文首页
│   ├── devices/*.html             # 设备页面
│   ├── blog/*.html                # 博客页面
│   └── zh/                        # 中文版本
│
└── docs/                          # 文档目录
    └── *.md                       # 项目文档

---

## 📋 核心文件说明

### 构建系统
- `build/multilang-builder.js`: 多语言构建主控制器，处理页面生成、翻译、组件替换
- `build/component-builder.js`: 组件处理，支持条件模板 `{{#if}}`
- `build/blog-builder.js`: 博客系统，从Markdown生成HTML组件
- `build/pages-config.json`: 页面配置清单

### 导航组件
- `components/header-mega-menu.html`: 
  - 结构: Home | Tools ▼ | Devices ▼ | Blog
  - 支持服务端active状态（is_home, is_tools, is_devices, is_blog）
  - 11个有效导航链接

### 页脚组件
- `components/footer-optimized.html`:
  - 5列布局：Brand | Tools | Devices | Resources | Company
  - 与顶部导航对齐，只包含已开发功能

### 脚本文件
- `js/app.js`: 导航高亮逻辑（已修复：优先使用服务端状态）
- `js/mega-menu.js`: 下拉菜单交互（已修复：不覆盖服务端状态）

---

## 🔧 开发工具

### 构建命令
```bash
npm run build           # 完整构建（86页面）
python dev-server.py    # 本地开发服务器（支持clean URLs）
npm run test:links      # 验证站内链接
```

### 关键脚本
- `dev-server.py`: 本地开发服务器，自动处理.html扩展名
- `test/internal-links-checker.js`: 站内链接验证工具

---

## 📊 当前状态

### 已完成功能（至2025-11-07）
- ✅ 多语言系统（**EN/ZH/DE/ES** - 4语言完整支持）
- ✅ 博客系统（8篇文章 × 4语言 = 32页）
- ✅ **Gaming Hub系统**（4页 × 4语言 = 16页）✨
- ✅ Mega Menu导航（Tools/Devices/Gaming下拉菜单）
- ✅ 响应式设计（含移动端优化）
- ✅ 服务端导航状态跟踪
- ✅ 内链系统（智能推荐）

### 页面清单（180+页）
- **英文（根路径）**：45+页
  - 设备页面：8页
  - 博客页面：34页（文章+索引+分类+标签）
  - Gaming Hub：4页 ✨
  - 首页：1页
- **中文（/zh/）**：45+页（镜像）
- **德语（/de/）**：45+页 ✨
- **西班牙语（/es/）**：45+页 ✨

### 导航链接（Mega Menu结构）
**Home (1):**
- Home

**Tools下拉菜单 (5):**
1. PPI Calculator
2. Aspect Ratio Calculator
3. Compare Screens
4. Responsive Tester
5. Standard Resolutions

**Devices下拉菜单 (3):**
1. iPhone
2. Android
3. iPad

**Gaming下拉菜单 (4):** ✨ 新增
1. Best Gaming Resolution 2025
2. 1080p vs 1440p Gaming
3. Gaming Monitor Size Guide
4. 1440p vs 4K Gaming

**其他 (1):**
1. Blog

**语言选择器 (4语言):**
EN | ZH | DE | ES

---

## 🚫 未开发功能

### 计划中但未实现的功能
- 核心工具（Projection Calculator, LCD Tester, TV Calculator, Virtual Ruler）
- 设备详细页（iPhone/Samsung/iPad单独型号页面）
- How-to指南（20页计划）
- 更多Gaming Spoke页面（8页完成，目标48页）
- FPS Test, Refresh Rate Test
- About Us / Contact页面

### 已清理的文件（2025-11-07）
- ✅ 备份文件（*.backup）
- ✅ 临时翻译文件（phase-02-translations*.json）
- ✅ 过时的导航版本（header-mega-menu-v1/v2/production）
- ✅ 过时文档（MULTILANG_DE_ES_PLAN.md, 翻译review结果.txt）

---

## 📝 重要约定

### 导航状态
- 服务端设置active类（构建时）
- 前端JS检测到服务端状态则跳过客户端逻辑
- 支持的状态：is_home, is_blog, is_tools, is_devices

### 模板语法
```html
<!-- 条件渲染 -->
{{#if condition}}content{{/if}}

<!-- 变量替换 -->
{{variable_name}}

<!-- 组件引用 -->
{{component:component-name}}

<!-- 翻译键 -->
<span data-i18n="translation_key">默认文本</span>
```

### 文件命名
- 组件：`component-name.html`
- 博客组件：`blog-post-{slug}-{lang}.html`（自动生成）
- 翻译文件：`locales/{lang}/translation.json`
- 构建输出：`multilang-build/`（不提交到git）

---

## 🎯 下一阶段准备

项目已准备好进入下一个开发阶段。

**当前基础设施**：
- ✅ 构建系统稳定
- ✅ 导航系统完善
- ✅ 博客系统可用
- ✅ 多语言支持完整
- ✅ 组件系统健全

**可扩展方向**：
- 新工具页面
- 新设备页面
- 新博客文章
- SEO优化
- 性能优化

---

**注意**: 此文档反映当前项目结构，后续开发请及时更新。
