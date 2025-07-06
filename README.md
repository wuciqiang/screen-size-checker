# Screen Size Checker - 屏幕尺寸检测器

一个功能强大的在线工具，帮助用户检测屏幕信息、比较设备尺寸，并提供专业的响应式设计测试功能。采用现代化的组件构建系统，支持10种语言的完整本地化。

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
- **iPhone设备尺寸**：完整的iPhone系列屏幕规格数据
- **iPad设备尺寸**：全系列iPad屏幕参数和技术规格
- **Android设备尺寸**：主流Android设备屏幕信息
- **详细规格展示**：分辨率、像素密度、发布时间等

## 🌍 多语言支持

支持10种语言的完整本地化，每种语言都有独立的SEO友好URL：

- 🇺🇸 **English** - `/en/`
- 🇨🇳 **中文** - `/zh/`
- 🇩🇪 **Deutsch** - `/de/`
- 🇪🇸 **Español** - `/es/`
- 🇫🇷 **Français** - `/fr/`
- 🇮🇹 **Italiano** - `/it/`
- 🇯🇵 **日本語** - `/ja/`
- 🇰🇷 **한국어** - `/ko/`
- 🇵🇹 **Português** - `/pt/`
- 🇷🇺 **Русский** - `/ru/`

## 🏗️ 技术架构

### 构建系统
- **组件化架构** - 模块化的HTML组件系统
- **多语言构建器** - 自动生成10种语言版本
- **模板引擎** - 基于模板的页面生成系统
- **静态构建** - 纯静态文件输出，优化性能

### 前端技术
- **现代JavaScript (ES6+)** - 模块化开发
- **CSS3响应式设计** - 移动优先的设计理念
- **i18next国际化** - 专业的多语言框架
- **组件化CSS** - 可维护的样式架构

### 部署和SEO
- **Cloudflare Pages** - 全球CDN和自动HTTPS
- **SEO友好URL** - 每种语言独立的URL结构
- **结构化数据** - JSON-LD格式的搜索引擎优化
- **多语言Sitemap** - 自动生成的网站地图

## 📁 项目结构

```
screen-size-checker/
├── 📦 构建系统
│   ├── build/
│   │   ├── multilang-builder.js     # 多语言构建器
│   │   ├── component-builder.js     # 组件构建器
│   │   └── pages-config.json        # 页面配置文件
│   ├── templates/
│   │   ├── base.html               # 基础页面模板
│   │   └── device-page.html        # 设备页面模板
│   └── components/
│       ├── head.html               # 页面头部组件
│       ├── header.html             # 导航栏组件
│       ├── footer.html             # 页脚组件
│       ├── breadcrumb.html         # 面包屑导航
│       ├── toast.html              # 通知组件
│       ├── home-content.html       # 主页内容组件
│       ├── compare-content.html    # 对比工具组件
│       ├── iphone-content.html     # iPhone页面组件
│       ├── ipad-content.html       # iPad页面组件
│       └── android-content.html    # Android页面组件
│
├── 🌐 多语言资源
│   └── locales/                    # 翻译文件
│       ├── en/translation.json     # 英文翻译
│       ├── zh/translation.json     # 中文翻译
│       ├── de/translation.json     # 德文翻译
│       ├── es/translation.json     # 西班牙文翻译
│       ├── fr/translation.json     # 法文翻译
│       ├── it/translation.json     # 意大利文翻译
│       ├── ja/translation.json     # 日文翻译
│       ├── ko/translation.json     # 韩文翻译
│       ├── pt/translation.json     # 葡萄牙文翻译
│       └── ru/translation.json     # 俄文翻译
│
├── 💻 前端资源
│   ├── js/                         # JavaScript模块
│   │   ├── app.js                  # 主应用逻辑
│   │   ├── i18n.js                 # 国际化管理
│   │   ├── device-detector.js      # 设备检测
│   │   ├── screen-comparison-fixed.js  # 屏幕对比工具
│   │   ├── device-comparison.js    # 设备规格对比
│   │   ├── clipboard.js            # 剪贴板功能
│   │   └── utils.js                # 工具函数
│   └── css/                        # 样式文件
│       ├── main.css                # 主样式
│       ├── base.css                # 基础样式
│       ├── comparison.css          # 对比工具样式
│       ├── info-items.css          # 信息项样式
│       ├── language-selector.css   # 语言选择器样式
│       └── simulator.css           # 模拟器样式
│
├── 🚀 构建输出
│   └── multilang-build/            # 多语言构建输出
│       ├── en/                     # 英文版本
│       ├── zh/                     # 中文版本
│       ├── de/                     # 德文版本
│       ├── es/                     # 西班牙文版本
│       ├── fr/                     # 法文版本
│       ├── it/                     # 意大利文版本
│       ├── ja/                     # 日文版本
│       ├── ko/                     # 韩文版本
│       ├── pt/                     # 葡萄牙文版本
│       ├── ru/                     # 俄文版本
│       ├── css/                    # 样式文件
│       ├── js/                     # JavaScript文件
│       ├── locales/                # 翻译资源
│       ├── sitemap.xml             # 多语言网站地图
│       ├── build-report.json       # 构建报告
│       └── index.html              # 语言选择页面
│
├── 📋 配置文件
│   ├── package.json                # 项目配置
│   ├── BUILD_SYSTEM.md             # 构建系统文档
│   ├── DEPLOYMENT.md               # 部署文档
│   ├── _redirects                  # Cloudflare重定向规则
│   ├── robots.txt                  # 搜索引擎爬虫规则
│   ├── sitemap.xml                 # 网站地图
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

### 构建命令

```bash
# 安装依赖
npm install

# 构建多语言网站 (生产环境)
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
   - 每个组件都是独立的HTML片段

2. **模板配置**
   - 在 `templates/` 目录下配置页面模板
   - 支持变量替换和条件渲染

3. **页面配置**
   - 在 `build/pages-config.json` 中配置页面路由
   - 支持多语言路径和SEO设置

4. **翻译管理**
   - 在 `locales/` 目录下管理各语言翻译
   - 使用i18next标准格式

5. **构建和部署**
   - 运行 `npm run multilang-build` 生成静态文件
   - 输出到 `multilang-build/` 目录
   - 直接部署到Cloudflare Pages

## 📊 页面结构

### 主要页面
- **首页** - 屏幕检测工具 (`/` → `/en/`)
- **设备对比** - 屏幕尺寸对比工具 (`/en/devices/compare`)
- **iPhone尺寸** - iPhone设备规格 (`/en/devices/iphone-viewport-sizes`)
- **iPad尺寸** - iPad设备规格 (`/en/devices/ipad-viewport-sizes`)
- **Android尺寸** - Android设备规格 (`/en/devices/android-viewport-sizes`)

### 多语言URL结构
每个页面都有10种语言版本，例如：
```
/en/devices/compare          # 英文版
/zh/devices/compare          # 中文版
/de/devices/compare          # 德文版
/es/devices/compare          # 西班牙文版
...其他语言版本
```

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
- 视口尺寸监控
- 设备像素比计算
- 浏览器信息识别

### 设备对比 (`screen-comparison-fixed.js`)
- 自定义宽高比对比
- 多单位尺寸计算
- 视觉化图表展示
- URL状态分享

### 国际化 (`i18n.js`)
- 动态语言切换
- 路径敏感的翻译资源加载
- 实时UI元素翻译
- 浏览器语言检测

### 数据管理 (`device-comparison.js`)
- 设备规格数据库
- 动态表格生成
- 搜索和过滤功能
- 规格对比计算

## 🎯 项目特色

### 📱 移动优先设计
- 响应式布局适配所有设备
- 触摸友好的交互设计
- 移动端性能优化

### 🌍 国际化支持
- 10种语言完整翻译
- SEO友好的多语言URL
- 自动语言检测和切换

### ⚡ 性能优越
- 纯静态文件部署
- 全球CDN加速
- 组件化模块加载

### 🔍 SEO友好
- 语义化HTML结构
- 完整的Meta数据
- 结构化数据支持
- 多语言sitemap

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

## 📞 联系方式

- **网站**: [screensizechecker.com](https://screensizechecker.com)
- **技术文档**: 查看项目根目录下的 `BUILD_SYSTEM.md` 和 `DEPLOYMENT.md`
- **问题反馈**: 通过GitHub Issues提交

---

**最后更新**: 2024年12月  
**当前版本**: v2.0 (组件化重构版本)  
**构建系统**: 多语言组件构建器  
**部署平台**: Cloudflare Pages