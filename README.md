# Screen Size Checker - 屏幕尺寸检测器

一个功能强大的在线工具，帮助用户检测屏幕信息、比较设备尺寸，并提供专业的响应式设计测试功能。采用现代化的组件构建系统和博客内容管理，目前支持英文和中文的完整本地化。

## 🌟 功能特点

### 核心检测功能
- **实时屏幕信息检测**：分辨率、视口尺寸、设备像素比(DPR)
- **设备信息显示**：操作系统、浏览器、颜色深度、宽高比
- **交互功能支持**：触摸支持检测、Cookie支持检测
- **一键复制功能**：快速复制检测结果用于技术支持或开发

### 设备对比功能
- **屏幕尺寸对比工具**：支持自定义宽高比和尺寸的详细对比
- **视觉化对比图表**：直观的尺寸比较和统计数据
- **多单位支持**：支持英寸和厘米单位切换
- **URL分享功能**：可分享对比结果到社交媒体

### 设备规格查询
- **iPhone设备尺寸**：完整的iPhone系列屏幕规格数据（iPhone 15/14/13/12/11系列等）
- **iPad设备尺寸**：全系列iPad屏幕参数和技术规格
- **Android设备尺寸**：主流Android设备屏幕信息
- **详细规格展示**：分辨率、像素密度、物理尺寸、屏幕类型等

### 响应式设计测试
- **标准分辨率查询**：常见屏幕分辨率和断点参考
- **响应式测试器**：在不同屏幕尺寸下测试网站表现

### 技术博客系统
- **专业技术文章**：视口、像素比、媒体查询等前端知识
- **开发者指南**：笔记本屏幕尺寸、响应式设计最佳实践
- **分类和标签**：技术、CSS、基础知识等分类体系
- **双语内容**：英文和中文技术文章同步更新

## 🌍 多语言支持

**当前状态**：网站默认语言为英文，目前完整支持英文和中文两种语言，其他语言后续完善。

### 已启用语言 ✅
- 🇺🇸 **English** - `/en/` (默认语言，474个完整翻译键值)
- 🇨🇳 **中文** - `/zh/` (474个完整翻译键值)

### 预备语言 🚧 (后续完善)
- 🇩🇪 **Deutsch** - `/de/` (83个基础翻译键值，待完善)
- 🇪🇸 **Español** - `/es/` (83个基础翻译键值，待完善)
- 🇫🇷 **Français** - `/fr/` (83个基础翻译键值，待完善)
- 🇮🇹 **Italiano** - `/it/` (83个基础翻译键值，待完善)
- 🇯🇵 **日本語** - `/ja/` (84个基础翻译键值，待完善)
- 🇰🇷 **한국어** - `/ko/` (83个基础翻译键值，待完善)
- 🇵🇹 **Português** - `/pt/` (83个基础翻译键值，待完善)
- 🇷🇺 **Русский** - `/ru/` (83个基础翻译键值)

## 🏗️ 技术架构

### 构建系统
- **组件化架构** - 60个模块化HTML组件系统
- **多语言构建器** - 自动生成多语言版本（754行核心代码）
- **博客构建系统** - 自动从Markdown生成博客页面和组件
- **模板引擎** - 基于模板的页面生成系统，支持变量替换和条件渲染
- **静态构建** - 纯静态文件输出，优化性能和SEO

### 前端技术栈
- **现代JavaScript (ES6+)** - 12个模块化JS文件，支持ES6 import/export
- **CSS3响应式设计** - 8个专业样式文件，移动优先设计理念
- **i18next国际化** - 专业的多语言框架，支持动态语言切换
- **设备检测API** - 实时检测屏幕分辨率、DPR、浏览器信息
- **组件化CSS** - 可维护的样式架构，支持CSS变量和现代布局

### 博客内容系统
- **Markdown驱动** - 使用Markdown编写技术文章
- **自动组件生成** - 从Markdown自动生成HTML组件
- **分类标签系统** - 支持文章分类、标签和侧边栏导航
- **双语内容管理** - 英文和中文技术文章同步管理

### 部署和SEO
- **Cloudflare Pages** - 全球CDN和自动HTTPS
- **SEO友好URL** - 每种语言独立的URL结构（无.html后缀）
- **结构化数据** - JSON-LD格式的搜索引擎优化
- **多语言Sitemap** - 自动生成54个URL的网站地图
- **自动重定向** - 智能语言检测和URL重定向
##
 📁 项目结构

```
screen-size-checker/
├── 📦 构建系统
│   ├── build/
│   │   ├── multilang-builder.js     # 多语言构建器 (754行)
│   │   ├── component-builder.js     # 组件构建器 (271行)
│   │   ├── blog-builder.js          # 博客构建器
│   │   └── pages-config.json        # 页面配置文件 (235行)
│   ├── templates/
│   │   ├── base.html               # 基础页面模板
│   │   ├── device-page.html        # 设备页面模板
│   │   └── blog-post.html          # 博客文章模板
│   └── components/ (60个组件)
│       ├── head.html               # 页面头部组件
│       ├── header.html             # 导航栏组件
│       ├── footer.html             # 页脚组件
│       ├── breadcrumb.html         # 面包屑导航
│       ├── toast.html              # 通知组件
│       ├── home-content.html       # 主页内容组件 (191行)
│       ├── compare-content.html    # 对比工具组件 (798行)
│       ├── iphone-content.html     # iPhone页面组件 (318行)
│       ├── ipad-content.html       # iPad页面组件 (270行)
│       ├── android-content.html    # Android页面组件 (319行)
│       ├── simulator-content.html  # 响应式测试器组件
│       ├── standard-resolutions-content.html # 标准分辨率组件
│       └── blog-*.html             # 博客相关组件 (40+个)
│
├── 📝 博客内容系统
│   └── blog-content/
│       ├── en/                     # 英文博客文章
│       │   ├── average-laptop-screen-size-2025.md
│       │   ├── device-pixel-ratio.md
│       │   ├── media-queries-essentials.md
│       │   └── viewport-basics.md
│       ├── zh/                     # 中文博客文章
│       │   ├── average-laptop-screen-size-2025.md
│       │   ├── device-pixel-ratio.md
│       │   ├── media-queries-essentials.md
│       │   └── viewport-basics.md
│       └── images/                 # 博客图片资源
│           ├── laptop-screen-size-distribution-2025.png
│           ├── responsive-breakpoints-2025.png
│           └── aspect-ratio-comparison.png
│
├── 🌐 多语言资源
│   └── locales/                    # 翻译文件
│       ├── en/translation.json     # 英文翻译 (474个键值)
│       ├── zh/translation.json     # 中文翻译 (474个键值)
│       ├── de/translation.json     # 德文翻译 (83个键值)
│       ├── es/translation.json     # 西班牙文翻译 (83个键值)
│       ├── fr/translation.json     # 法文翻译 (83个键值)
│       ├── it/translation.json     # 意大利文翻译 (83个键值)
│       ├── ja/translation.json     # 日文翻译 (84个键值)
│       ├── ko/translation.json     # 韩文翻译 (83个键值)
│       ├── pt/translation.json     # 葡萄牙文翻译 (83个键值)
│       └── ru/translation.json     # 俄文翻译 (83个键值)
│
├── 💻 前端资源
│   ├── js/ (12个模块)              # JavaScript模块
│   │   ├── app.js                  # 主应用逻辑
│   │   ├── i18n.js                 # 国际化管理
│   │   ├── device-detector.js      # 设备检测
│   │   ├── screen-comparison-fixed.js  # 屏幕对比工具
│   │   ├── device-comparison.js    # 设备规格对比
│   │   ├── clipboard.js            # 剪贴板功能
│   │   ├── simulator.js            # 响应式测试器
│   │   ├── language-modal.js       # 语言选择模态框
│   │   ├── blog.js                 # 博客功能
│   │   ├── blog-progress.js        # 博客阅读进度
│   │   ├── cookie-notice.js        # Cookie通知
│   │   └── utils.js                # 工具函数
│   └── css/ (8个样式文件)          # 样式文件
│       ├── main.css                # 主样式
│       ├── base.css                # 基础样式
│       ├── comparison.css          # 对比工具样式
│       ├── info-items.css          # 信息项样式
│       ├── language-selector.css   # 语言选择器样式
│       ├── simulator.css           # 模拟器样式
│       ├── blog.css                # 博客样式
│       └── blog-progress.css       # 博客进度条样式
│
├── 🚀 构建输出
│   └── multilang-build/            # 多语言构建输出
│       ├── en/                     # 英文版本 (28个页面)
│       │   ├── index.html          # 主页
│       │   ├── devices/            # 设备页面
│       │   └── blog/               # 博客页面
│       ├── zh/                     # 中文版本 (28个页面)
│       │   ├── index.html          # 主页
│       │   ├── devices/            # 设备页面
│       │   └── blog/               # 博客页面
│       ├── css/                    # 样式文件
│       ├── js/                     # JavaScript文件
│       ├── locales/                # 翻译资源
│       ├── sitemap.xml             # 多语言网站地图 (54个URL)
│       ├── build-report.json       # 构建报告
│       ├── _redirects              # Cloudflare重定向规则
│       ├── robots.txt              # 搜索引擎爬虫规则
│       └── index.html              # 根目录重定向页面
│
├── 📋 配置文件
│   ├── package.json                # 项目配置
│   ├── BUILD_SYSTEM.md             # 构建系统文档
│   ├── DEPLOYMENT.md               # 部署文档
│   ├── PROJECT_STATUS.md           # 项目状态报告
│   ├── structured-data.json        # 结构化数据
│   └── ads.txt                     # 广告验证文件
│
└── 🎨 静态资源
    ├── favicon.ico                 # 网站图标
    ├── favicon.png                 # 网站图标PNG
    ├── privacy-policy.html         # 隐私政策
    └── googlec786a02f43170c4d.html # Google验证文件
```

## 🚀 开发和构建

### 环境要求
- **Node.js** (v16+)
- **现代浏览器** (Chrome, Firefox, Safari, Edge)
- **依赖包**: gray-matter, highlight.js, marked

### 构建命令

```bash
# 安装依赖
npm install

# 构建多语言网站 (生产环境) - 包含博客系统
npm run multilang-build

# 测试组件构建
npm run test-build

# 验证组件完整性
npm run validate-components

# 批量构建所有页面
npm run batch-build
```

### 开发流程

1. **组件开发**
   - 在 `components/` 目录下创建或修改组件
   - 每个组件都是独立的HTML片段，支持i18n翻译

2. **博客内容管理**
   - 在 `blog-content/en/` 和 `blog-content/zh/` 下编写Markdown文章
   - 支持Front Matter元数据（标题、描述、分类、标签等）
   - 自动生成博客组件和页面

3. **模板配置**
   - 在 `templates/` 目录下配置页面模板
   - 支持变量替换、条件渲染和博客模板

4. **页面配置**
   - 在 `build/pages-config.json` 中配置页面路由
   - 支持多语言路径、SEO设置和博客页面自动配置

5. **翻译管理**
   - 在 `locales/` 目录下管理各语言翻译
   - 使用i18next标准格式，支持474个完整翻译键值

6. **构建和部署**
   - 运行 `npm run multilang-build` 生成静态文件
   - 自动构建博客系统和多语言页面
   - 输出到 `multilang-build/` 目录（56个页面）
   - 直接部署到Cloudflare Pages

## 📊 页面结构

### 主要功能页面
- **首页** - 屏幕检测工具 (`/` → `/en/`)
- **设备对比** - 屏幕尺寸对比工具 (`/en/devices/compare`)
- **iPhone尺寸** - iPhone设备规格 (`/en/devices/iphone-viewport-sizes`)
- **iPad尺寸** - iPad设备规格 (`/en/devices/ipad-viewport-sizes`)
- **Android尺寸** - Android设备规格 (`/en/devices/android-viewport-sizes`)
- **标准分辨率** - 常见屏幕分辨率参考 (`/en/devices/standard-resolutions`)
- **响应式测试器** - 网站响应式测试工具 (`/en/devices/responsive-tester`)

### 博客系统页面
- **博客首页** - 技术文章索引 (`/en/blog/`)
- **技术文章** - 4篇专业技术文章
  - 笔记本屏幕尺寸指南 (`/en/blog/average-laptop-screen-size-2025`)
  - 设备像素比详解 (`/en/blog/device-pixel-ratio`)
  - 媒体查询基础 (`/en/blog/media-queries-essentials`)
  - 视口基础知识 (`/en/blog/viewport-basics`)
- **分类页面** - 技术、CSS、基础知识分类
- **标签页面** - 响应式设计、像素密度等标签

### 多语言URL结构
每个页面都有英文和中文版本，例如：
```
/en/devices/compare          # 英文版
/zh/devices/compare          # 中文版
/en/blog/device-pixel-ratio  # 英文博客
/zh/blog/device-pixel-ratio  # 中文博客
```

### 构建统计
- **总页面数**: 56个页面
- **英文页面**: 28个页面
- **中文页面**: 28个页面
- **博客文章**: 8篇（英文4篇 + 中文4篇）
- **分类标签页**: 40个页面

## 🌐 部署架构

### 生产环境
- **平台**: Cloudflare Pages
- **域名**: [screensizechecker.com](https://screensizechecker.com)
- **HTTPS**: 自动SSL证书
- **CDN**: 全球分发网络
- **构建**: 自动化静态构建

### SEO优化
- ✅ 多语言hreflang标签
- ✅ 语义化HTML结构
- ✅ 结构化数据 (JSON-LD)
- ✅ 自动生成多语言sitemap
- ✅ 优化的Meta标签
- ✅ 搜索引擎验证

### 性能优化
- ✅ 静态文件预构建
- ✅ CSS和JS模块化
- ✅ 图片优化
- ✅ CDN缓存策略
- ✅ 移动端优化

## 🔧 核心功能模块

### 屏幕检测 (`device-detector.js`)
- 实时屏幕分辨率检测
- 视口尺寸监控和动态更新
- 设备像素比(DPR)计算
- 浏览器信息识别和操作系统检测
- 触摸支持和Cookie状态检测

### 设备对比 (`screen-comparison-fixed.js`)
- 自定义宽高比对比工具
- 多单位尺寸计算（英寸/厘米）
- 视觉化图表展示和实时预览
- URL状态分享和参数持久化

### 国际化 (`i18n.js`)
- 动态语言切换（英文/中文）
- 路径敏感的翻译资源加载
- 实时UI元素翻译更新
- 浏览器语言检测和自动切换

### 设备数据管理 (`device-comparison.js`)
- 完整的设备规格数据库
  - iPhone系列：iPhone 15/14/13/12/11等
  - iPad系列：iPad Pro/Air/Mini等
  - Android设备：主流品牌设备
- 动态表格生成和排序
- 搜索和过滤功能
- 详细规格对比（分辨率、DPR、物理尺寸、屏幕类型）

### 博客系统 (`blog.js`, `blog-progress.js`)
- Markdown文章渲染
- 阅读进度条显示
- 文章导航和目录生成
- 分类标签系统

### 响应式测试器 (`simulator.js`)
- 多设备尺寸模拟
- 实时响应式预览
- 自定义断点测试
- 移动端适配验证

## 🎯 项目特色

### 📱 移动优先设计
- 响应式布局适配所有设备
- 触摸友好的交互设计
- 移动端性能优化和手势支持

### 🌍 国际化支持
- 2种语言完整翻译（英文474键值，中文474键值）
- 8种预备语言基础翻译（各83-84键值）
- SEO友好的多语言URL结构
- 自动语言检测和智能切换

### ⚡ 性能优越
- 纯静态文件部署（56个页面）
- 全球CDN加速（Cloudflare Pages）
- 组件化模块加载（60个组件）
- 优化的构建系统（754行核心代码）

### 🔍 SEO友好
- 语义化HTML结构
- 完整的Meta数据和Open Graph标签
- 结构化数据支持（JSON-LD格式）
- 多语言sitemap（54个URL）
- 无.html后缀的现代URL结构

### 📝 内容管理系统
- Markdown驱动的博客系统
- 自动组件生成和页面构建
- 分类标签系统和导航
- 双语技术文章同步管理

## 🤝 贡献指南

### 开发规范
- 使用ES6+语法
- 遵循组件化开发模式
- 保持代码注释完整
- 确保跨浏览器兼容性

### 翻译贡献
- 在 `locales/` 目录下添加或修改翻译
- 使用标准的i18next格式
- 确保翻译准确性和一致性

### 组件开发
- 在 `components/` 目录下创建新组件
- 保持组件的独立性和可复用性
- 添加适当的样式和脚本支持

### 博客内容贡献
- 在 `blog-content/` 目录下添加Markdown文章
- 遵循Front Matter格式规范
- 确保英文和中文内容同步更新

## 📞 联系方式

- **网站**: [screensizechecker.com](https://screensizechecker.com)
- **技术文档**: 查看项目根目录下的 `BUILD_SYSTEM.md` 和 `DEPLOYMENT.md`
- **问题反馈**: 通过GitHub Issues提交

## 📈 项目状态

### 当前版本状态
- **版本**: v2.0.0 (组件化重构完成版本)
- **构建状态**: ✅ 生产就绪
- **功能状态**: ✅ 全部正常
- **部署状态**: ✅ 自动部署

### 构建统计
- **总页面数**: 56个页面
- **组件数量**: 60个HTML组件
- **翻译键值**: 474个（英文/中文），83-84个（其他语言）
- **博客文章**: 8篇技术文章
- **JavaScript模块**: 12个ES6模块
- **CSS样式文件**: 8个专业样式文件

### 技术指标
- **构建时间**: ~30秒
- **输出大小**: 静态文件优化
- **SEO评分**: 多语言sitemap + 结构化数据
- **性能**: CDN加速 + 静态部署

---

**最后更新**: 2025年7月26日  
**当前版本**: v2.0.0 (组件化重构 + 博客系统)  
**构建系统**: 多语言组件构建器 + 博客构建器  
**部署平台**: Cloudflare Pages  
**网站地址**: [screensizechecker.com](https://screensizechecker.com)  
**技术栈**: 纯静态 + 组件化 + 多语言 + 博客系统