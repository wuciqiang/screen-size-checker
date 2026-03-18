# components/ 使用说明

## 目录约定

- `components/*.html`：手写核心组件，可直接编辑
- `components/generated/blog/*.html`：博客生成组件，禁止手改
- `components/generated/hub/*.html`：Hub 生成组件，禁止手改

## 修改规则

- 想改博客页面内容：去改 `blog-content/**/*.md`
- 想改 Hub 内容：去改 `hub-content/*.md`
- 想改生成逻辑：去改 `build/blog-builder.js` 或 `build/hub-builder.js`
- 想改页面拼装方式：优先看 `templates/*.html` 与 `build/component-builder.js`

## 常用命令

```bash
npm run build:content
npm run build:page -- --page compare --lang en
```
