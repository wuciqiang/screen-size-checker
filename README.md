# Screen Size Checker

一个简单而强大的工具，用于检测和显示设备屏幕信息。

## 功能特点

- 实时显示设备屏幕分辨率
- 显示视口（viewport）尺寸
- 检测设备像素比（DPR）
- 显示颜色深度
- 显示操作系统信息
- 显示浏览器信息
- 检测 Cookie 支持
- 检测触摸支持
- 显示完整的 User Agent 信息
- 支持屏幕尺寸模拟器
- 支持中英文双语界面

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- i18next 用于国际化
- Express.js 用于本地服务器

## 本地开发

1. 克隆仓库：
```bash
git clone [repository-url]
cd screen-size-checker
```


3. 启动本地服务器：
```bash
python -m http.server 8000
```

4. 访问 http://127.0.0.1:5000

## 项目结构

```
screen-size-checker/
├── index.html          # 主页面
├── script.js           # 主要JavaScript逻辑
├── server.js           # Express服务器
├── sitemap.xml         # 网站地图
├── locales/            # 语言文件
│   ├── en/            # 英文翻译
│   └── zh/            # 中文翻译
└── README.md          # 项目文档
```

## 国际化支持

- 支持语言：英文（默认）和中文
- 使用 localStorage 保存语言偏好
- 支持自动检测浏览器语言

## 性能优化

- 使用 Service Worker 进行缓存
- 图片懒加载
- 资源预加载
- 性能监控和报告

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT License

## 运行本地副本 (Running Locally)

由于这是一个纯静态网站，你只需要：

1.  克隆或下载本仓库代码。
2.  直接在你的浏览器中打开 `index.html` 文件即可。

## 国际化 (Internationalization - i18n)

*   所有用户可见的文本都存储在 `locales/{lang}/translation.json` 文件中。
*   HTML 元素通过 `data-i18n="key"` 属性标记需要翻译的内容。
*   `script.js` 使用 `i18next` 库根据用户选择或检测到的语言加载对应的翻译，并更新页面文本。
*   默认加载语言为英语 (`en`)。

## 部署 (Deployment)

该项目目前部署在 **Cloudflare Pages** 上，利用其免费套餐进行静态网站托管。

*   通过连接 Git 仓库 (GitHub/GitLab)，实现每次推送到 `main` 分支时自动部署更新。
*   Cloudflare Pages 自动处理全球 CDN 分发和 HTTPS/SSL 证书。

## SEO 与 Google 收录

*   **页面优化 (On-Page SEO):**
    *   优化了 `<title>` 和 `<meta name="description">` 标签，包含相关关键词。
    *   使用了语义化的标题标签 (`<h1>`, `<h2>`)。
    *   在页面内容和解释性文本中自然地融入了关键词，如 `screen size`, `resolution`, `viewport`, `DPR`, `user agent` 等。
*   **技术 SEO (Technical SEO):**
    *   提供了 `robots.txt` 文件。
    *   创建并提交了 `sitemap.xml` 到 Google Search Console。
*   **Google Search Console:**
    *   网站已添加并验证。
    *   已提交 Sitemap。
    *   使用 URL Inspection 工具检查了首页并请求编入索引。

## 自定义域名 (Custom Domain)

项目已配置自定义域名： **`screensizechecker.com`**

## 未来可能的改进 (Future Ideas)

*   **增加更多检测信息:** 如操作系统、浏览器详细版本、Cookies 是否启用、触摸屏支持等。
*   **更丰富的设备模拟:** 提供更多预设设备和自定义尺寸输入。
*   **用户体验增强:** 例如，一键复制检测到的信息。
*   **盈利模式探索:** 在不影响核心体验的前提下，适度添加广告 (如 Google AdSense) 或捐赠链接。
*   **站外 SEO:** 获取高质量的外部链接。
*   **创建更多相关工具:** 围绕开发者或设计师需求，扩展网站功能。

## 贡献 (Contributing)
目前作为个人项目，暂未开放贡献流程。

## 许可证 (License)

该项目使用 [MIT License](https://opensource.org/licenses/MIT) 授权。

---