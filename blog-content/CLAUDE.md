# blog-content/ 使用说明

- 每篇文章使用 Markdown
- 按语言分目录：`blog-content/en/`、`blog-content/zh/` 等
- 文件名就是文章 slug

## 修改后需要做什么

```bash
npm run build:content
```

如果要继续预览页面：

```bash
npm run build:page -- --page blog-index-en --lang en
```

> 注意：不要直接改 `components/generated/blog/*.html`
