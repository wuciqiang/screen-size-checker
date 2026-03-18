# templates/ 使用说明

- `base.html`：主页等基础模板
- `device-page.html`：工具页 / 设备页
- `blog-*.html`：博客页模板
- `hub-page.html`：Hub / Gaming 内容页模板

改模板时，优先确认：

1. `{{component:...}}` 引用是否仍然存在
2. `{{variable}}` 是否由 `build/pages-config.json` 或构建器提供
3. `data-i18n`、SEO 占位是否仍可被构建脚本替换
