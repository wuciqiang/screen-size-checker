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
- **基础**: `base.css` - 全局基础样式、CSS变量、重置样式
- **主样式**: `main.css` - 主要布局和组件样式
- **核心优化**: `core-optimized.css` - 性能优化的核心样式

### 加载顺序
1. `base.css` - 基础样式（最先加载）
2. `core-optimized.css` - 核心优化样式
3. 页面特定样式（按需加载）
4. 移动端优化样式（媒体查询）

---

## 对外接口

### CSS变量系统
```css
:root {
    /* 颜色系统 */
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;

    /* 间距系统 */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;

    /* 断点 */
    --breakpoint-mobile: 768px;
    --breakpoint-tablet: 1024px;
    --breakpoint-desktop: 1280px;

    /* 字体 */
    --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-size-base: 16px;
    --line-height-base: 1.5;
}
```

### 响应式断点
```css
/* 移动端优先 */
@media (min-width: 768px) { /* 平板 */ }
@media (min-width: 1024px) { /* 桌面 */ }
@media (min-width: 1280px) { /* 大屏 */ }
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

### 2025-12-29 - 初始化模块文档
- 创建样式模块文档
- 记录25个CSS文件
- 整理样式架构和分类
