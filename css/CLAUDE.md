# 样式模块 (css/)

[根目录](../CLAUDE.md) > **css**

> 最后更新: 2025-12-29 14:41:32

---

## 模块职责

样式模块负责：
- 基础样式和布局系统
- 响应式设计和移动端适配
- 博客内容样式和排版
- 组件样式（Mega Menu、内链、进度条等）
- 性能优化样式（关键CSS、移动端优化）

---

## 入口与启动

### 主样式文件
- **核心优化**: `core-optimized.css` - 全站主样式表（所有模板页都加载），**设计令牌的唯一事实来源**
- **视觉增强**: `visual-enhancements.css` - 最后加载的精修层（卡片/按钮/动效）
- **基础**: `base.css` - 仅 `about.html` 使用（独立静态页）

### 加载顺序（`components/head.html` 定义，所有模板页一致）
1. 内联 critical CSS（`components/head.html` 的 `<style>` 块，值与 core-optimized 令牌保持同步）
2. `core-optimized.css`（阻塞）
3. `mega-menu.css`（阻塞）
4. `internal-links.css` → `footer-optimized.css` → `visual-enhancements.css`（media="print" onload 异步）
5. 页面类型追加：blog → `blog.css` + `mobile-unified.css` + `blog-progress.css`；hub → `hub.css`；responsive-tester → `simulator.css`

---

## 对外接口

### CSS变量系统（2026-07 统一后的现代化令牌）
唯一事实来源是 `core-optimized.css` 的 `:root`（暗色覆盖在同文件 `[data-theme="dark"]`）。`components/head.html` 内联 critical CSS 手工同步同样的值；`visual-enhancements.css` 的 `:root` 只做别名，不得再定义冲突值。
```css
:root {
    /* 品牌蓝（唯一主色） */
    --primary-500: #0066FF;   /* --primary-color 别名 */
    --primary-600: #0052d6;   /* hover */

    /* 文字（slate 灰阶） */
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;

    /* 背景/边框 */
    --background-primary: #ffffff;
    --background-secondary: #f8fafc;
    --background-tertiary: #f1f5f9;
    --border-color: #e2e8f0;

    /* 圆角统一：6/10/14/18/24 */
    --radius-sm: 6px;  --radius-md: 10px; --radius-lg: 14px;

    /* 阴影：slate 着色的柔和多层（--shadow-xs ~ --shadow-xl） */
    /* 焦点环：--focus-ring: 0 0 0 3px rgba(0,102,255,0.25) */
}
/* 暗色 [data-theme="dark"]：bg #0b1220/#111a2c/#121c30/#1a2540，
   text #e2e8f0/#94a3b8/#64748b，border #24334d/#3b4d6e，primary #4d8dff */
```

### 响应式断点（现状：max-width 桌面优先，勿随意改动）
```css
@media (max-width: 1024px) { /* 小桌面 */ }
@media (max-width: 768px)  { /* 平板/手机（主断点，77+ 处） */ }
@media (max-width: 480px)  { /* 手机 */ }
@media (max-width: 320px)  { /* 超小屏 */ }
```

---

## 关键依赖与配置

### 样式分类

#### 基础样式（3个）
- `base.css` - 全局基础样式、CSS变量、重置
- `main.css` - 主要布局和组件
- `core-optimized.css` - 核心优化样式

#### 博客样式（9个）
- `blog.css` - 博客主样式
- `blog-progress.css` - 阅读进度条
- `blog-mobile.css` - 移动端博客样式
- `blog-mobile-fixes.css` - 移动端修复
- `blog-mobile-emergency-fix.css` - 紧急修复
- `blog-layout-mobile.css` - 移动端布局
- `blog-typography-mobile.css` - 移动端排版
- `blog-content-responsive.css` - 响应式内容
- `blog-table-color-fix.css` - 表格颜色修复

#### 组件样式（7个）
- `mega-menu.css` - Mega Menu导航
- `internal-links.css` - 内链模块
- `footer-optimized.css` - 优化页脚
- `language-selector.css` - 语言选择器
- `comparison.css` - 对比工具
- `simulator.css` - 响应式测试器
- `info-items.css` - 信息项

#### 移动端优化（6个）
- `mobile-performance.css` - 移动端性能优化
- `mobile-ui-optimization.css` - 移动端UI优化
- `mobile-chart-optimization.css` - 移动端图表优化
- `mobile-typography-classes.css` - 移动端排版类
- `mobile-unified.css` - 统一移动端样式
- `optimized-events.css` - 优化事件样式

#### 其他（1个）
- `hub.css` - Gaming Hub样式

---

## 数据模型

### 样式架构
```
base.css (基础层)
├── CSS变量定义
├── 重置样式
├── 全局字体和排版
└── 工具类

main.css (组件层)
├── 布局系统
├── 导航和页脚
├── 按钮和表单
└── 卡片和容器

core-optimized.css (优化层)
├── 关键渲染路径优化
├── 性能优化样式
└── 移动端优先样式

页面特定样式 (功能层)
├── blog.css
├── comparison.css
├── simulator.css
└── hub.css
```

---

## 测试与质量

### 当前状态
- ✅ 响应式测试（手动）
- ✅ 浏览器兼容性测试
- ❌ 无自动化CSS测试
- ❌ 无CSS Lint配置

### 性能指标
- 关键CSS内联（首屏渲染）
- 非关键CSS延迟加载
- 移动端优化（减少重绘和回流）
- 字体加载优化（font-display: swap）

### 已知问题
- 博客移动端样式有多个修复文件（需要整合）
- 部分样式文件命名不一致
- 缺少CSS模块化方案

### 死文件（2026-07 起不再拷贝进构建输出，源文件保留仅供参考）
以下文件无任何页面引用（内容已并入 `mobile-unified.css` / `core-optimized.css`），构建时由 `build/multilang-builder.js` 与 `scripts/build-page.js` 的排除清单跳过：
`blog-mobile.css`、`blog-mobile-fixes.css`、`blog-mobile-emergency-fix.css`、`blog-layout-mobile.css`、`blog-typography-mobile.css`、`blog-content-responsive.css`、`blog-table-color-fix.css`、`mobile-chart-optimization.css`、`mobile-typography-classes.css`、`mobile-ui-optimization.css`、`mobile-performance.css`、`language-selector.css`、`optimized-events.css`、`comparison.css`、`info-items.css`、`highlight.min.css`

---

## 常见问题 (FAQ)

### Q: 如何添加新的CSS变量？
A: 在`base.css`的`:root`选择器中添加，遵循命名规范：
```css
:root {
    --new-variable-name: value;
}
```

### Q: 如何优化移动端样式？
A:
1. 使用移动端优先设计
2. 利用`mobile-performance.css`中的优化类
3. 避免复杂的CSS选择器
4. 使用CSS变量减少重复

### Q: 博客样式不生效怎么办？
A: 检查：
1. 样式文件是否正确加载
2. 选择器优先级是否正确
3. 是否有样式冲突
4. 查看浏览器开发者工具

### Q: 如何处理响应式断点？
A: 使用统一的断点系统：
```css
/* 移动端（默认） */
.element { ... }

/* 平板 */
@media (min-width: 768px) {
    .element { ... }
}

/* 桌面 */
@media (min-width: 1024px) {
    .element { ... }
}
```

---

## 相关文件清单

### 基础样式（3个）
- `base.css` - 全局基础样式
- `main.css` - 主要布局和组件
- `core-optimized.css` - 核心优化样式

### 博客样式（9个）
- `blog.css` - 博客主样式
- `blog-progress.css` - 阅读进度条
- `blog-mobile.css` - 移动端博客
- `blog-mobile-fixes.css` - 移动端修复
- `blog-mobile-emergency-fix.css` - 紧急修复
- `blog-layout-mobile.css` - 移动端布局
- `blog-typography-mobile.css` - 移动端排版
- `blog-content-responsive.css` - 响应式内容
- `blog-table-color-fix.css` - 表格颜色修复

### 组件样式（7个）
- `mega-menu.css` - Mega Menu导航
- `internal-links.css` - 内链模块
- `footer-optimized.css` - 优化页脚
- `language-selector.css` - 语言选择器
- `comparison.css` - 对比工具
- `simulator.css` - 响应式测试器
- `info-items.css` - 信息项

### 移动端优化（6个）
- `mobile-performance.css` - 性能优化
- `mobile-ui-optimization.css` - UI优化
- `mobile-chart-optimization.css` - 图表优化
- `mobile-typography-classes.css` - 排版类
- `mobile-unified.css` - 统一样式
- `optimized-events.css` - 事件优化

### 其他（1个）
- `hub.css` - Gaming Hub样式

---

## 变更记录

### 2026-07-26 - 前端样式现代化重构（纯显示优化）
- 统一设计令牌到 `core-optimized.css :root`（品牌蓝 #0066FF、slate 灰阶、6/10/14/18/24 圆角、柔和多层阴影、--focus-ring）
- 同步 `visual-enhancements.css`、`components/head.html` 内联 critical CSS、`main.css`、`base.css` 的令牌值
- 全部在用样式表翻新排版/卡片/按钮/焦点态/暗色主题；hub 紫色调改为品牌蓝；simulator 去除 off-palette #007bff
- 修复 `mobile-unified.css` 引用不存在变量（--card-bg 等）导致的失效样式；为 `core-optimized.css` 补回 `.copy-value` 按钮重置（修复首页 hero 数字的 UA 默认白框）
- 16 个无引用死 CSS 文件从构建输出排除（源文件保留）
- 未改任何 DOM 结构、class 名、JS、URL、内链

### 2025-12-29 - 初始化模块文档
- 创建样式模块文档
- 记录25个CSS文件
- 整理样式架构和分类
