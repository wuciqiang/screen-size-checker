# 屏幕尺寸检测器 (Screen Size Checker)

## 项目概览

**屏幕尺寸检测器** 是一个为开发者和设计师打造的综合性在线工具，用于检测屏幕分辨率、视口大小和设备像素比 (DPR)。它还具备设备对比工具、响应式设计测试器以及技术博客功能。

**核心功能：**
*   **实时检测：** 屏幕分辨率、视口、DPR、浏览器信息。
*   **设备对比：** 可视化对比屏幕尺寸和宽高比。
*   **多语言支持：** 完整支持英语、中文、德语和西班牙语。
*   **静态架构：** 预构建的静态页面，优化性能和 SEO。
*   **内容系统：** 基于 Markdown 的博客和游戏中心 (Gaming Hub)。

**技术栈：**
*   **运行时：** Node.js (构建用), 静态 HTML/JS/CSS (客户端)。
*   **构建系统：** 自定义 Node.js 脚本 (`multilang-builder.js`)。
*   **前端：** 原生 ES6+ JavaScript, CSS3 (移动优先), HTML5 组件。
*   **国际化 (i18n)：** `i18next` 生态系统配合自定义构建时注入。
*   **部署：** Cloudflare Pages。

## 构建与运行

本项目使用 `npm` 进行依赖管理和任务执行。

### 环境要求
*   Node.js (v16+)
*   npm

### 关键命令

*   **安装依赖：**
    ```bash
    npm install
    ```

*   **构建项目 (生产环境)：**
    生成完整的多语言静态网站（包含博客和 Hub）到 `multilang-build/` 目录。
    ```bash
    npm run multilang-build
    ```

*   **测试组件构建：**
    ```bash
    npm run test-build
    ```

*   **验证组件：**
    检查缺失的翻译或组件问题。
    ```bash
    npm run validate-components
    ```

*   **批量构建：**
    ```bash
    npm run batch-build
    ```

## 开发规范

### 架构
*   **组件化：** UI 由位于 `components/` 目录下的 170+ 个模块化 HTML 组件构建而成。
*   **模板：** 页面使用 `templates/` 目录下的基础模板（例如 `base.html`, `blog-post.html`）。
*   **静态生成：** 构建过程将模板、组件和内容合并为纯 HTML 文件。

### 国际化 (i18n)
*   **翻译文件：** 位于 `locales/{lang}/translation.json`。
*   **使用方法：**
    *   HTML: 使用 `data-i18n="key"` 属性。
    *   构建时：处理嵌套键和模板替换。
    *   运行时：通过 `js/i18n.js` 支持动态切换。
*   **支持语言：** `en` (英语), `zh` (中文), `de` (德语), `es` (西班牙语)。

### 内容管理
*   **博客：** Markdown 文件位于 `blog-content/{lang}/`。
*   **游戏中心 (Gaming Hub)：** Markdown 文件位于 `hub-content/`。
*   **Frontmatter：** 需要严格的 YAML frontmatter（标题、描述、日期、分类、标签）。
*   **图片：** 存储在 `blog-content/images/`。

### 样式与脚本
*   **CSS：** 采用移动优先的方法。关键 CSS 通常内联或经过优化。
*   **JS：** ES6 模块。运行时代码不使用 Webpack 等打包工具；使用原生 ES 模块或根据配置进行简单拼接。

### 目录结构
*   `build/`: 构建脚本（核心逻辑）。
*   `components/`: HTML 局部组件。
*   `templates/`: 页面布局。
*   `locales/`: 翻译 JSON 文件。
*   `blog-content/`: 博客 Markdown 源文件。
*   `js/` & `css/`: 静态资源。
*   `multilang-build/`: 输出目录（请勿手动编辑）。