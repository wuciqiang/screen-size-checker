# 📦 部署指南

## 🚀 Cloudflare Pages 自动部署配置

### 📋 前置条件
- [x] GitHub 仓库已连接到 Cloudflare Pages
- [x] 本地代码已完成开发和测试

### 🔧 Cloudflare Pages 构建设置

在 Cloudflare Dashboard 中配置以下构建设置：

#### 基本设置
```
Framework preset: None (或 Static)
Build command: npm run multilang-build
Build output directory: multilang-build
Root directory: / (根目录)
```

#### 环境变量
```
NODE_VERSION=18
NPM_VERSION=8
```

#### 分支设置
```
Production branch: main
Preview branches: development, staging (可选)
```

### 📂 文件结构说明
```
screen-size-checker/
├── components/          # 组件源文件
├── templates/          # 页面模板
├── locales/           # 翻译文件
├── build/             # 构建脚本
├── css/               # 样式文件
├── js/                # JavaScript 文件
├── _redirects         # 重定向配置
├── package.json       # 依赖和脚本
└── multilang-build/   # 构建输出 (被 .gitignore 忽略)
```

### 🔄 部署流程

#### 1. 提交代码
```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 更新设备数据和语言选择页面"

# 推送到 GitHub
git push origin main
```

#### 2. 自动触发构建
- Cloudflare Pages 会自动检测到推送
- 运行 `npm run multilang-build` 构建命令
- 将 `multilang-build/` 目录作为网站根目录部署

#### 3. 验证部署
- 检查构建日志确保无错误
- 访问网站确认更新生效
- 测试各语言版本和设备页面

### 🛠️ 本地测试

在推送前本地测试：
```bash
# 安装依赖
npm install

# 运行构建
npm run multilang-build

# 本地预览 (可选)
npm start
```

### 🌍 多语言支持状态

| 语言 | 状态 | 描述 |
|-----|------|------|
| 🇺🇸 英文 (en) | ✅ 已启用 | 完整翻译 |
| 🇨🇳 中文 (zh) | ✅ 已启用 | 完整翻译 |
| 🇫🇷 法语 (fr) | 🚫 禁用 | 待翻译 |
| 🇩🇪 德语 (de) | 🚫 禁用 | 待翻译 |
| 🇪🇸 西语 (es) | 🚫 禁用 | 待翻译 |
| 🇯🇵 日语 (ja) | 🚫 禁用 | 待翻译 |
| 🇰🇷 韩语 (ko) | 🚫 禁用 | 待翻译 |
| 🇷🇺 俄语 (ru) | 🚫 禁用 | 待翻译 |
| 🇵🇹 葡语 (pt) | 🚫 禁用 | 待翻译 |
| 🇮🇹 意语 (it) | 🚫 禁用 | 待翻译 |

### 🔓 启用新语言流程

1. **完善翻译文件**：`locales/{language}/translation.json`
2. **测试构建**：`npm run multilang-build`
3. **更新语言选择页面**：`multilang-build/index.html`
4. **提交并部署**

### 📊 部署监控

#### 构建日志关键信息
```
✅ Languages: 10
📄 Total pages: 50  
✅ Successful: 50/50
📁 Output directory: multilang-build/
```

#### 常见问题排查
- **构建失败**: 检查 `package.json` 中的依赖
- **页面 404**: 检查 `_redirects` 文件配置
- **翻译缺失**: 验证 `locales/` 目录中的翻译文件

### 🎯 部署优化建议

1. **缓存策略**: 配置适当的缓存头
2. **压缩**: 启用 Gzip/Brotli 压缩
3. **CDN**: 利用 Cloudflare 的全球 CDN
4. **监控**: 设置构建失败通知

---

💡 **提示**: 每次推送到 `main` 分支都会自动触发部署，无需手动操作！ 