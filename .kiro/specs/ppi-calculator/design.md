# PPI 计算器设计文档

## 概述

PPI（每英寸像素数）计算器是一个独立的网页工具，将集成到 screensizechecker.com 网站中。该工具允许用户输入屏幕的水平像素、垂直像素和对角线尺寸，然后实时计算并显示 PPI 值。设计遵循网站现有的组件化架构、设计系统和技术标准。

## 架构

### 组件化架构
该功能将遵循网站现有的组件化架构：

- **HTML 组件**: `/components/ppi-calculator-content.html` - 包含完整的用户界面
- **JavaScript 模块**: `/js/ppi-calculator.js` - 包含计算逻辑和交互功能
- **页面配置**: 在 `/build/pages-config.json` 中添加新页面配置
- **本地化文件**: 更新 `/locales/en/translation.json` 和 `/locales/zh/translation.json`

### 页面路径和模板
- **URL 路径**: `/devices/ppi-calculator.html`
- **模板**: 使用现有的 `device-page` 模板
- **面包屑导航**: 首页 > 设备 > PPI 计算器

## 组件和接口

### HTML 组件结构

```html
<!-- Hero Section -->
<section class="devices-hero-section">
    <div class="devices-hero-container">
        <h1 data-i18n="ppiCalculator.title">PPI 计算器</h1>
        <p data-i18n="ppiCalculator.intro">计算显示设备的像素密度</p>
    </div>
</section>

<!-- Calculator Section -->
<section class="ppi-calculator-section">
    <div class="calculator-container">
        <!-- Input Form -->
        <div class="calculator-form">
            <!-- 输入字段 -->
        </div>
        
        <!-- Result Display -->
        <div class="calculator-result">
            <!-- 结果显示 -->
        </div>
    </div>
</section>

<!-- SEO Content Section -->
<section class="ppi-content-section">
    <!-- 教育性内容 -->
</section>
```

### JavaScript 模块接口

```javascript
// ppi-calculator.js
export class PPICalculator {
    constructor() {
        this.horizontalPixels = 0;
        this.verticalPixels = 0;
        this.diagonalInches = 0;
        this.result = 0;
    }
    
    // 公共方法
    calculatePPI(horizontal, vertical, diagonal);
    validateInput(value);
    updateResult();
    setupEventListeners();
    init();
}

// 导出初始化函数
export function initializePPICalculator();
```

### CSS 类和样式系统

使用现有的 CSS 变量和类：
- `--primary-color`, `--text-primary`, `--background-card` 等颜色变量
- `--spacing-md`, `--spacing-lg` 等间距变量
- `--radius-md`, `--shadow-light` 等样式变量
- `.info-card`, `.card-content` 等现有组件类

## 数据模型

### 输入数据模型
```javascript
const InputData = {
    horizontalPixels: Number,    // 水平像素数 (例: 1920)
    verticalPixels: Number,      // 垂直像素数 (例: 1080)
    diagonalInches: Number       // 对角线英寸数 (例: 15.6)
};
```

### 输出数据模型
```javascript
const OutputData = {
    ppi: Number,                 // 计算得出的 PPI 值
    isValid: Boolean,            // 输入是否有效
    errorMessage: String         // 错误信息（如果有）
};
```

### 计算公式
```javascript
// PPI = √(水平像素² + 垂直像素²) / 对角线英寸
const calculatePPI = (horizontal, vertical, diagonal) => {
    const pixelDiagonal = Math.sqrt(horizontal * horizontal + vertical * vertical);
    return pixelDiagonal / diagonal;
};
```

## 错误处理

### 输入验证
1. **数字验证**: 确保所有输入都是有效数字
2. **正数验证**: 确保所有值都大于 0
3. **合理范围验证**: 
   - 像素值: 1-10000 范围
   - 对角线尺寸: 0.1-100 英寸范围

### 错误消息
```javascript
const ErrorMessages = {
    invalidNumber: "请输入有效的数字",
    negativeValue: "值必须大于 0",
    outOfRange: "值超出合理范围",
    calculationError: "计算过程中出现错误"
};
```

### 错误显示策略
- 实时验证：用户输入时立即显示错误
- 视觉反馈：错误输入字段显示红色边框
- 错误消息：在输入字段下方显示具体错误信息

## 测试策略

### 单元测试
1. **计算函数测试**
   - 测试正确的 PPI 计算
   - 测试边界值情况
   - 测试无效输入处理

2. **输入验证测试**
   - 测试各种无效输入
   - 测试边界值
   - 测试特殊字符输入

### 集成测试
1. **用户界面测试**
   - 测试实时计算功能
   - 测试错误消息显示
   - 测试响应式布局

2. **本地化测试**
   - 测试中英文界面切换
   - 测试所有文本的正确显示

### 浏览器兼容性测试
- Chrome, Firefox, Safari, Edge
- 移动端浏览器测试
- 不同屏幕尺寸测试

## 用户界面设计

### 布局结构
```
┌─────────────────────────────────────┐
│           Hero Section              │
│    (标题和简介)                      │
├─────────────────────────────────────┤
│         Calculator Section          │
│  ┌─────────────┐ ┌─────────────┐   │
│  │ Input Form  │ │   Result    │   │
│  │             │ │   Display   │   │
│  └─────────────┘ └─────────────┘   │
├─────────────────────────────────────┤
│         Content Section             │
│      (SEO 和教育内容)                │
└─────────────────────────────────────┘
```

### 输入表单设计
- 三个输入字段垂直排列
- 每个字段包含标签、输入框和单位说明
- 清晰的占位符文本
- 实时验证反馈

### 结果显示设计
- 突出显示的 PPI 值
- 大字体显示数值
- 包含单位说明 "PPI"
- 视觉上与输入区域分离

### 响应式设计
- 桌面端：输入和结果并排显示
- 移动端：输入和结果垂直堆叠
- 使用 CSS Grid 和 Flexbox 实现

## SEO 内容结构

### 内容章节
1. **什么是 PPI（像素密度）？**
   - 定义和基本概念
   - 与 DPI 的区别

2. **为什么 PPI 很重要？**
   - 对图像清晰度的影响
   - 对文本可读性的影响
   - 对设计师和开发者的意义

3. **如何使用我们的 PPI 计算器？**
   - 步骤说明
   - 示例计算

4. **PPI vs DPI：有什么区别？**
   - 概念澄清
   - 使用场景

### SEO 优化
- 使用语义化 HTML 标签（h2, h3, p）
- 包含相关关键词
- 内容长度 300-500 字
- 结构化数据标记

## 技术实现细节

### JavaScript 模块加载
```javascript
// 在 app.js 中条件加载
if (window.location.pathname.includes('/ppi-calculator')) {
    import('./ppi-calculator.js').then(module => {
        module.initializePPICalculator();
    });
}
```

### 事件处理
- 使用 `input` 事件实现实时计算
- 使用防抖（debounce）优化性能
- 键盘导航支持

### 本地化集成
- 使用现有的 i18next 系统
- 所有用户界面文本使用 `data-i18n` 属性
- 支持中英文切换

### 页面配置
```json
{
    "name": "ppi-calculator",
    "template": "device-page",
    "output": "devices/ppi-calculator.html",
    "page_content": "ppi-calculator-content",
    "config": {
        "page_title_key": "ppiCalculator.pageTitle",
        "page_description_key": "ppiCalculator.pageDescription",
        "page_heading_key": "ppiCalculator.pageHeading",
        "page_intro_key": "ppiCalculator.pageIntro",
        "canonical_url": "https://screensizechecker.com/devices/ppi-calculator.html",
        "show_breadcrumb": true,
        "current_key": "ppi_calculator",
        "parent_key": "devices"
    }
}
```

## 性能考虑

### 计算性能
- 简单的数学运算，性能影响最小
- 使用防抖避免过度计算
- 缓存计算结果（如果需要）

### 加载性能
- JavaScript 模块按需加载
- CSS 重用现有样式
- 最小化额外的 HTTP 请求

### 内存使用
- 避免内存泄漏
- 适当清理事件监听器
- 使用轻量级的数据结构

## 可访问性

### 键盘导航
- 所有交互元素可通过 Tab 键访问
- 合理的 Tab 顺序
- 支持 Enter 键提交

### 屏幕阅读器支持
- 适当的 ARIA 标签
- 语义化 HTML 结构
- 错误消息的无障碍公告

### 视觉设计
- 足够的颜色对比度
- 清晰的焦点指示器
- 响应式字体大小

## 浏览器兼容性

### 支持的浏览器
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### JavaScript 特性
- ES6 模块
- 现代 DOM API
- CSS 自定义属性

### 降级策略
- 基本功能在旧浏览器中仍可用
- 渐进增强的设计方法
- 优雅的错误处理