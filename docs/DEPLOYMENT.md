# 部署指南（Cloudflare Pages）

**最后更新**：2025-12-14  
**适用项目版本**：v2.3.0+  
**适用范围**：生产部署 / 预发布验证 / 回滚

---

## 1) 关键结论（TL;DR）

- **构建命令**：`npm run multilang-build`
- **构建产物目录**：`multilang-build/`（整目录作为静态站点输出）
- **重要文件**：
  - `multilang-build/_redirects`：Cloudflare Pages Redirect Rules（构建生成）
  - `multilang-build/sitemap.xml`：站点地图（构建生成）
  - `multilang-build/robots.txt`：抓取策略（构建生成）

---

## 2) Cloudflare Pages 建议配置

### Build settings

- **Framework preset**：None
- **Build command**：`npm run multilang-build`
- **Build output directory**：`multilang-build`

### 环境要求

- Node.js：`>= 16`（见 `package.json`）

---

## 3) 部署前检查清单

- 构建成功：本地执行 `npm run multilang-build` 无报错
- 输出完整：确认 `multilang-build/` 下包含 `index.html`、`css/`、`js/`、`locales/`
- SEO 关键文件存在：`multilang-build/sitemap.xml`、`multilang-build/robots.txt`
- 重定向规则存在：`multilang-build/_redirects`
- 链接校验（可选但推荐）：
  - `node test/seo-tags-validator.js`
  - `node test/internal-links-checker.js`
  - `python verify-links.py`

---

## 4) 重定向与 Clean URLs

- 生产环境的 Clean URLs 建议通过静态托管规则实现（例如 Pages `_redirects` / Nginx `try_files`）。
- 本地开发请使用 `python dev-server.py`（支持 `try_files $uri $uri.html $uri/` 行为）。

---

## 5) 缓存与静态资源策略（建议）

> Cloudflare Pages 会为静态资源提供较好的缓存默认值；以下内容为“站点端可控部分”的建议清单。

- **资源指纹**（长期优化项）：为 `css/js` 产物增加 hash 文件名，配合长期缓存
- **图片格式**：优先 WebP/AVIF；OG 图使用固定文件名并确保可访问
- **字体**：`font-display: swap`，必要时预加载（避免阻塞 LCP）

---

## 6) 回滚建议

- 使用 Git tag / commit 进行回滚
- 回滚后优先核对：
  - `_redirects` 是否仍覆盖旧路径（`/en/*` 等迁移后的兼容）
  - `canonical` / `hreflang` 是否与根域名策略一致
  - sitemap 是否仍可访问且内容正确

