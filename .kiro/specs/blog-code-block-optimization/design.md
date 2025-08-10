# 设计文档

## 概述

本设计旨在优化博客文章中代码块的显示效果，解决当前代码块自动换行导致格式混乱的问题。通过实现现代化的代码块样式，支持水平滚动，并添加复制功能，提升用户的阅读和使用体验。

## 架构

### 当前状态分析

通过分析现有代码，发现：

1. **代码块结构**：使用 `<pre><code class="language-xxx">` 标准结构
2. **语法高亮**：已集成 highlight.js，支持多种语言
3. **现有样式**：在 `css/blog.css` 中有基础的代码块样式
4. **构建系统**：`build/blog-builder.js` 使用 marked + highlight.js 处理代码块

### 设计目标

1. **保持代码格式**：防止长代码行被强制换行
2. **现代化视觉**：使用现代配色和交互效果
3. **响应式设计**：在不同设备上都有良好体验
4. **复制功能**：方便用户复制代码内容

## 组件和接口

### 1. CSS样式组件

#### 1.1 代码块容器样式
```css
.blog-post-content pre {
    position: relative;
    overflow-x: auto;
    white-space: pre;
    word-wrap: normal;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.3) transparent;
}
```

#### 1.2 代码内容样式
```css
.blog-post-content code {
    font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre;
}
```

#### 1.3 复制按钮样式
```css
.code-copy-button {
    position: absolute;
    top: 12px;
    right: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
}
```

### 2. JavaScript功能组件

#### 2.1 复制功能接口
```javascript
class CodeBlockManager {
    constructor() {
        this.initializeCopyButtons();
        this.setupScrollIndicators();
    }
    
    initializeCopyButtons() {
        // 为每个代码块添加复制按钮
    }
    
    copyToClipboard(text) {
        // 复制文本到剪贴板
    }
    
    showCopyFeedback(button) {
        // 显示复制成功反馈
    }
}
```

#### 2.2 滚动指示器接口
```javascript
setupScrollIndicators() {
    // 为长代码块添加滚动指示器
}
```

### 3. 构建系统集成

#### 3.1 博客构建器修改
在 `build/blog-builder.js` 中添加代码块后处理：

```javascript
processCodeBlocks(htmlContent) {
    return htmlContent.replace(
        /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
        (match, lang, code) => {
            return `<div class="code-block-container">
                <div class="code-block-header">
                    <span class="code-language">${lang}</span>
                    <button class="code-copy-button" data-code="${this.escapeHtml(code)}">
                        <span class="copy-icon">📋</span>
                        <span class="copy-text">Copy</span>
                    </button>
                </div>
                <pre><code class="language-${lang}">${code}</code></pre>
            </div>`;
        }
    );
}
```

## 数据模型

### 代码块数据结构
```javascript
{
    language: string,      // 编程语言
    content: string,       // 代码内容
    lineCount: number,     // 行数
    hasLongLines: boolean, // 是否包含长行
    needsScroll: boolean   // 是否需要滚动
}
```

### 复制状态模型
```javascript
{
    buttonId: string,      // 按钮ID
    status: 'idle' | 'copying' | 'success' | 'error',
    message: string,       // 状态消息
    timestamp: number      // 状态时间戳
}
```

## 错误处理

### 1. 复制功能错误处理
- **不支持剪贴板API**：回退到传统的选择+复制方法
- **复制失败**：显示错误提示，建议手动复制
- **权限被拒绝**：提示用户允许剪贴板访问

### 2. 样式兼容性处理
- **旧浏览器**：提供CSS回退方案
- **移动设备**：优化触摸滚动体验
- **高DPI屏幕**：确保代码字体清晰度

### 3. 性能优化
- **长代码块**：实现虚拟滚动（如果需要）
- **大量代码块**：延迟初始化复制按钮
- **内存管理**：及时清理事件监听器

## 测试策略

### 1. 单元测试
- 测试复制功能在不同浏览器中的表现
- 测试代码块样式在不同主题下的显示
- 测试响应式布局在不同屏幕尺寸下的效果

### 2. 集成测试
- 测试博客构建系统正确处理代码块
- 测试语法高亮与新样式的兼容性
- 测试多语言博客文章中的代码块显示

### 3. 用户体验测试
- 在不同设备上测试滚动体验
- 测试复制功能的易用性
- 测试代码块在长文章中的性能表现

### 4. 浏览器兼容性测试
- Chrome/Edge (Chromium)
- Firefox
- Safari (桌面和移动)
- 移动浏览器 (iOS Safari, Chrome Mobile)

## 实现优先级

### 阶段1：核心样式优化
1. 修改CSS防止代码换行
2. 添加水平滚动支持
3. 优化代码块视觉样式

### 阶段2：复制功能
1. 添加复制按钮
2. 实现剪贴板API
3. 添加复制反馈

### 阶段3：增强体验
1. 添加语言标签显示
2. 优化移动端体验
3. 添加滚动指示器

### 阶段4：性能优化
1. 优化大代码块性能
2. 添加懒加载支持
3. 内存优化

## 技术决策

### 1. 滚动方案选择
**决策**：使用CSS `overflow-x: auto` + 自定义滚动条样式
**理由**：简单可靠，浏览器兼容性好，性能优秀

### 2. 复制API选择
**决策**：优先使用现代 Clipboard API，回退到 execCommand
**理由**：现代API更安全可靠，回退方案确保兼容性

### 3. 字体选择
**决策**：使用 'Fira Code' 作为主要代码字体，提供多个回退选项
**理由**：Fira Code 支持连字符，提升代码可读性

### 4. 主题适配
**决策**：基于现有的暗色/亮色主题系统扩展代码块样式
**理由**：保持整体设计一致性，减少维护成本