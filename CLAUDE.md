# Screen Size Checker - Claude Code 工作说明

> 最后更新：2026-03-18  
> 目标：让 Claude Code 先读对、少误改、少跑全量构建

## 1. 优先级与事实来源

当多份文档冲突时，按下面顺序判断：

1. **实际代码与构建脚本**
   - `build/*.js`
   - `package.json`
   - `build/pages-config.json`
2. **本文件 `CLAUDE.md`**
3. **`.claude/index.json`**（可由 `npm run ai:refresh-context` 刷新）
4. **`docs/BUILD_SYSTEM.md` / `docs/DEPLOYMENT.md`**
5. 其他辅助文档（如 `WARP.md`、`GEMINI.md`、历史 spec）

如果 `WARP.md`、`GEMINI.md`、旧 spec 与代码不一致，**以代码和本文件为准**。

## 2. 回答与协作约定

- 与仓库维护者沟通时，**默认使用中文**
- 除非明确要求，不要直接改线上内容策略、URL 结构、canonical 规则
- 优先做**低风险、可验证、可回滚**的改动

## 3. 目录说明

### 手写源码
- `components/`：手写 HTML 组件
- `templates/`：页面模板
- `js/`：前端脚本
- `css/`：样式
- `locales/`：翻译
- `blog-content/`：博客 Markdown 源文件
- `hub-content/`：Hub / Gaming 内容 Markdown 源文件

### 生成产物
- `components/generated/blog/`：博客生成组件
- `components/generated/hub/`：Hub 生成组件

这些文件由构建脚本生成，**不要手改**。  
如果需要修改它们：

- 博客页面：改 `blog-content/**/*.md` 或 `build/blog-builder.js`
- Hub 页面：改 `hub-content/**/*.md` 或 `build/hub-builder.js`

### 文档与规范
- `docs/BUILD_SYSTEM.md`
- `docs/DEPLOYMENT.md`
- `.claude/specs/active/`
- `.kiro/specs/`

## 4. 常用命令

### 开发
```bash
npm run dev
```

### 全量构建
```bash
npm run multilang-build
```

### 仅预生成内容组件
```bash
npm run build:content
```

### 快速构建单页预览
```bash
npm run build:page -- --page compare --lang en
npm run build:page -- --page iphone-viewport-sizes --lang zh
```

输出目录默认是：

```text
test-build/selected/
```

### 批量页面测试构建
```bash
npm run batch-build
```

### 验证
```bash
npm run validate-components
npm run validate:i18n
npm run test
npm run test:smoke
npm run test:regression
```

### 刷新 Claude 索引
```bash
npm run ai:refresh-context
```

## 5. 典型任务入口

### 新增普通工具页 / 设备页
1. 新建或修改 `components/*.html`
2. 必要时改 `templates/*.html`
3. 在 `build/pages-config.json` 增加页面配置
4. 运行：
   - `npm run build:page -- --page <page-name> --lang en`
   - `npm run multilang-build`

### 新增博客文章
1. 在 `blog-content/{lang}/` 新建同名 Markdown
2. 运行 `npm run build:content`
3. 再运行 `npm run build:page -- --page <blog-page-name> --lang <lang>` 或全量构建

### 新增 Hub / Gaming 内容
1. 修改 `hub-content/*.md`
2. 运行 `npm run build:content`
3. 必要时再跑 `npm run multilang-build`

### 修改翻译
1. 改 `locales/{lang}/translation.json`
2. 运行 `npm run validate:i18n`
3. 必要时运行 `npm run build:page ...` 或 `npm run multilang-build`

## 6. 不要直接改的内容

- `components/generated/**/*.html`
- `multilang-build/**`
- `.claude/state/**`
- `.playwright-mcp/**`

## 7. 当前已知事实

- 生产构建入口：`build/multilang-builder.js`
- 内容预生成：
  - `build/blog-builder.js`
  - `build/hub-builder.js`
- 当前启用输出语言：`en`、`zh`、`de`、`es`、`pt`
- `build/pages-config.json` 是当前页面配置主入口

## 8. 建议工作流

对 Claude Code 最省上下文的顺序：

1. 先看本文件
2. 再看目标目录对应源码
3. 只在必要时看 `docs/` 或历史 spec
4. 改完先跑单页 / 冒烟验证
5. 最后再跑全量构建
