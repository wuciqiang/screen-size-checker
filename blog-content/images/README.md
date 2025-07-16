# Screen Size Checker - 博客系统

这是Screen Size Checker项目的博客图片资源目录，同时包含完整的博客系统架构和使用指南。

## 📁 项目结构

```
screen-size-checker/
├── blog-content/           # 博客内容源文件
│   ├── en/                # 英文文章
│   ├── zh/                # 中文文章
│   └── images/            # 图片资源（本目录）
├── build/                 # 构建脚本
│   ├── blog-builder.js    # 博客构建器
│   ├── component-builder.js # 组件构建器
│   ├── multilang-builder.js # 多语言构建器
│   └── pages-config.json  # 页面配置
├── components/            # 组件文件
├── templates/             # 页面模板
├── css/                   # 样式文件
├── js/                    # JavaScript文件
├── locales/               # 翻译文件
└── multilang-build/       # 构建输出目录
```

## 🚀 本地开发流程

### 1. 环境准备
```bash
# 安装依赖
npm install

# 验证Node.js版本（推荐16+）
node --version
```

### 2. 开发构建
```bash
# 完整构建（推荐）
npm run build

# 或者分步构建
npm run multilang-build
```

### 3. 本地预览
构建完成后，`multilang-build/` 目录包含完整的静态网站：
- `multilang-build/index.html` - 语言选择页面
- `multilang-build/en/` - 英文版网站
- `multilang-build/zh/` - 中文版网站

## 🏗️ 博客系统架构

### 核心组件

1. **博客构建器** (`build/blog-builder.js`)
   - 解析Markdown文章
   - 生成博客组件
   - 创建分类和标签页面
   - 更新页面配置

2. **组件构建器** (`build/component-builder.js`)
   - 处理组件引用
   - 变量替换
   - 模板渲染

3. **多语言构建器** (`build/multilang-builder.js`)
   - 多语言页面生成
   - 翻译应用
   - 静态资源复制
   - 网站地图生成

### 文章处理流程

```
Markdown文章 → 解析元数据 → 转换HTML → 生成组件 → 构建页面 → 输出静态文件
```

## ✍️ 文章发布流程

### 1. 创建新文章
在 `blog-content/en/` 或 `blog-content/zh/` 目录下创建新的Markdown文件：

```markdown
---
title: "文章标题"
description: "文章描述"
date: "2024-01-01"
author: "Screen Size Checker Team"
category: "technical|css|basics"
tags: ["tag1", "tag2", "tag3"]
featuredImage: "article-name.jpg"
---

# 文章内容

文章正文内容...
```

### 2. 元数据字段说明
- `title`: 文章标题
- `description`: 文章描述（用于SEO）
- `date`: 发布日期（YYYY-MM-DD格式）
- `author`: 作者名称
- `category`: 文章分类（technical/css/basics）
- `tags`: 标签数组
- `featuredImage`: 特色图片文件名

### 3. 构建和发布
```bash
# 构建博客系统
npm run build

# 检查生成的页面
# 英文: multilang-build/en/blog/
# 中文: multilang-build/zh/blog/
```

## 📝 文章撰写指南

### 内容方向

1. **技术类文章** (category: "technical")
   - 设备像素比详解
   - 浏览器兼容性分析
   - 性能优化技巧
   - 新技术趋势

2. **CSS类文章** (category: "css")
   - 媒体查询最佳实践
   - 响应式设计技巧
   - CSS新特性介绍
   - 布局解决方案

3. **基础类文章** (category: "basics")
   - 视口概念解释
   - 屏幕尺寸基础知识
   - 移动端适配入门
   - 工具使用指南

### 写作规范

1. **文章结构**
   - 清晰的标题层级
   - 适当的代码示例
   - 实用的表格和列表
   - 相关文章链接

2. **链接规范**
   - 内部链接必须包含 `.html` 后缀
   - 使用绝对路径：`/en/blog/article-name.html`
   - 确保链接有效性

3. **代码示例**
   - 使用适当的语法高亮
   - 提供完整可运行的示例
   - 添加必要的注释

## 🖼️ 图片资源管理

### 图片命名规范

1. 使用与文章文件名匹配的前缀：
   - `viewport-basics.jpg` - 主题图片
   - `viewport-basics-diagram-1.png` - 文章中的图表
   - `viewport-basics-example-2.jpg` - 示例图片

2. 文件格式选择：
   - 主题图片使用 `.jpg`
   - 图表和示意图使用 `.png`
   - 动画使用 `.gif`
   - 现代格式使用 `.webp`

### 图片尺寸指南

1. **主题图片**
   - 宽度: 1200px
   - 高度: 630px
   - 宽高比: 1.9:1
   - 文件大小: <300KB

2. **内容图片**
   - 最大宽度: 800px
   - 文件大小: <200KB
   - 支持高DPI显示

### 待创建的图片列表

- [ ] viewport-basics.jpg
- [ ] device-pixel-ratio.jpg
- [ ] media-queries.jpg
- [ ] viewport-basics-diagram-1.png
- [ ] device-pixel-ratio-example.png
- [ ] media-queries-responsive.png

## 🚀 部署流程

### 1. 构建生产版本
```bash
# 完整构建
npm run build

# 验证构建结果
ls multilang-build/
```

### 2. 部署到GitHub Pages
```bash
# 提交代码
git add .
git commit -m "Update blog content"
git push origin main

# GitHub Actions会自动部署multilang-build/目录
```

### 3. 部署验证
- 检查网站是否正常访问
- 验证博客页面功能
- 测试多语言切换
- 确认SEO元数据

## 🔧 图片优化

### 优化工具
- [TinyPNG](https://tinypng.com/) - PNG/JPG压缩
- [Squoosh](https://squoosh.app/) - 现代图片格式转换
- [ImageOptim](https://imageoptim.com/) - Mac图片优化

### 优化步骤
1. 调整图片尺寸到合适大小
2. 选择适当的图片格式
3. 应用压缩算法
4. 移除EXIF元数据
5. 验证文件大小

## ♿ 辅助功能

### 图片使用规范
- 提供有意义的替代文本
- 使用适当的长描述（复杂图表）
- 确保足够的颜色对比度
- 考虑低视力用户需求

### 示例
```html
<img src="viewport-basics.jpg" 
     alt="显示不同设备视口大小对比的示意图"
     title="视口大小对比">
```

## 📊 性能监控

### 关键指标
- 页面加载速度
- 图片加载时间
- 移动端性能
- SEO评分

### 监控工具
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 添加或修改文章
4. 运行构建测试
5. 提交Pull Request

## 📞 支持

如有问题或建议，请：
- 创建GitHub Issue
- 发送邮件至团队
- 查看项目文档

---

**Screen Size Checker Team**  
专注于响应式设计和屏幕适配的专业工具和知识分享 