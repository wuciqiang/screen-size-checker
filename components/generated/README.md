# generated components

这个目录只存放构建脚本生成的中间组件：

- `blog/`
- `hub/`

这些 HTML 由下面脚本生成：

- `build/blog-builder.js`
- `build/hub-builder.js`

不要手动编辑这里的 `.html` 文件。  
如需刷新：

```bash
npm run build:content
```
