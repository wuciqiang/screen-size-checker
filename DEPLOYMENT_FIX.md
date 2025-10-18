# 部署问题修复指南

## 🎯 问题症状

- ✅ **本地测试**：`http://127.0.0.1:5000/blog/` ✅ 正确
- ❌ **线上生产**：`https://screensizechecker.com/en/blog/` ❌ 错误（旧路径）
- ✅ **代码已提交**：源代码已更新
- ❌ **构建文件未更新**：`multilang-build/` 在 `.gitignore` 中，未提交

---

## 🔍 根本原因

**`multilang-build/` 目录被 `.gitignore` 忽略**

这意味着：
```
你提交的内容：
├── build/multilang-builder.js  ✅ 新代码
├── components/header.html       ✅ 新代码
└── multilang-build/            ❌ 被忽略，未提交
    └── index.html              ❌ 线上还是旧的
```

---

## ✅ 解决方案（根据你的部署平台）

### 方案 A：Cloudflare Pages / Netlify / Vercel（推荐）

这些平台会自动运行构建命令，但需要正确配置。

#### Step 1: 检查部署配置

**登录你的部署平台**（Cloudflare Pages / Netlify / Vercel）：

查看构建配置是否正确：
- **构建命令**：`npm run build` 或 `node build/multilang-builder.js`
- **输出目录**：`multilang-build`
- **Node 版本**：`16` 或更高

#### Step 2: 触发重新部署

**选项 1：推送新提交（推荐）**
```bash
cd G:\Workspace\screen-size-checker

# 创建一个空提交强制触发构建
git commit --allow-empty -m "chore: trigger rebuild for URL structure fix"
git push origin main
```

**选项 2：手动触发部署**
- 在平台控制台找到"Trigger deploy"/"Retry deployment"按钮
- 点击触发重新构建

#### Step 3: 清除 CDN 缓存

部署完成后，清除缓存：

**Cloudflare Pages**：
1. 登录 Cloudflare 控制台
2. 进入你的域名
3. Caching → Configuration → Purge Everything

**Netlify**：
```bash
# 或在 Netlify UI 中：Site settings → Build & deploy → Post processing → Asset optimization → Clear cache
```

---

### 方案 B：传统服务器（FTP/SSH 上传）

如果你是手动上传文件到服务器：

#### Step 1: 本地重新构建

```bash
cd G:\Workspace\screen-size-checker

# 删除旧构建
Remove-Item -Path "multilang-build" -Recurse -Force

# 重新构建
npm run build
```

#### Step 2: 上传到服务器

**选项 1：FTP**
- 使用 FileZilla / WinSCP
- 上传整个 `multilang-build` 目录
- **覆盖**服务器上的旧文件

**选项 2：SSH/SCP**
```bash
# 压缩构建文件
tar -czf multilang-build.tar.gz multilang-build/

# 上传到服务器
scp multilang-build.tar.gz user@your-server.com:/path/to/website/

# SSH 登录服务器解压
ssh user@your-server.com
cd /path/to/website/
tar -xzf multilang-build.tar.gz
```

---

### 方案 C：GitHub Pages

如果使用 GitHub Pages：

#### 需要将构建文件提交到 git

**原因**：GitHub Pages 直接部署 git 中的文件，不运行构建脚本。

#### 解决步骤：

**选项 1：创建单独的部署分支（推荐）**

```bash
cd G:\Workspace\screen-size-checker

# 创建 gh-pages 分支
git checkout -b gh-pages

# 从 .gitignore 中移除 multilang-build（仅在此分支）
# 编辑 .gitignore，删除 "multilang-build/" 这一行

# 添加构建文件
git add multilang-build/
git commit -m "deploy: add built files for gh-pages"
git push origin gh-pages

# 回到主分支
git checkout main
```

**选项 2：使用 GitHub Actions 自动构建**

创建 `.github/workflows/deploy.yml`：

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./multilang-build
```

---

## 🧪 验证部署是否成功

### 1. 清除浏览器缓存

```
Chrome: Ctrl + Shift + Del → 清除缓存
或使用隐身模式: Ctrl + Shift + N
```

### 2. 测试关键 URL

访问这些 URL，确认正确重定向：

```
测试 1: 主页导航
https://screensizechecker.com/
点击 "Blog" 按钮
✅ 应该跳转到: https://screensizechecker.com/blog/
❌ 不应该是: https://screensizechecker.com/en/blog/

测试 2: 旧 URL 重定向
https://screensizechecker.com/en/
✅ 应该 301 重定向到: https://screensizechecker.com/

测试 3: 查看网页源代码
右键 → 查看网页源代码
搜索: href="blog/"
✅ 应该找到: <a href="blog/" class="nav-link"
❌ 不应该是: <a href="en/blog/" class="nav-link"
```

### 3. 使用开发者工具检查

```
F12 → Network 标签
访问: https://screensizechecker.com/en/
查看响应:
✅ Status: 301 Moved Permanently
✅ Location: https://screensizechecker.com/
```

---

## ⚠️ 常见问题

### Q1: 部署后还是显示旧内容
**A**: CDN 缓存问题
- **解决**：清除 CDN 缓存（见方案 A Step 3）
- **验证**：使用隐身模式访问

### Q2: 部署失败，提示找不到文件
**A**: 构建命令可能错误
- **检查**：部署平台的构建日志
- **修复**：确认构建命令是 `npm run build`

### Q3: 301 重定向不工作
**A**: `_redirects` 文件未部署
- **检查**：确认 `_redirects` 文件在 `multilang-build/` 目录中
- **修复**：重新运行 `npm run build`

---

## 📋 快速行动清单

根据你的部署方式，执行对应的步骤：

### [ ] Cloudflare Pages / Netlify / Vercel 用户
1. [ ] 检查构建配置（构建命令、输出目录）
2. [ ] 推送空提交触发重新部署：`git commit --allow-empty -m "trigger rebuild" && git push`
3. [ ] 等待部署完成（3-5 分钟）
4. [ ] 清除 CDN 缓存
5. [ ] 清除浏览器缓存，测试

### [ ] 传统服务器用户
1. [ ] 本地运行：`npm run build`
2. [ ] 上传 `multilang-build/` 目录到服务器（覆盖）
3. [ ] 上传 `_redirects` 文件到服务器根目录
4. [ ] 清除浏览器缓存，测试

### [ ] GitHub Pages 用户
1. [ ] 创建 `gh-pages` 分支
2. [ ] 在该分支从 .gitignore 移除 `multilang-build/`
3. [ ] 提交并推送构建文件
4. [ ] 在 GitHub 仓库设置中选择 `gh-pages` 分支部署
5. [ ] 等待部署完成，测试

---

## 🎯 你最可能的情况

基于项目配置（package.json 中有 "cloudflare-pages" 关键词），你很可能使用：

**Cloudflare Pages**

### 立即执行：

```bash
# 1. 触发重新部署
cd G:\Workspace\screen-size-checker
git commit --allow-empty -m "chore: trigger rebuild after URL structure update"
git push origin main

# 2. 等待 3-5 分钟让 Cloudflare Pages 构建完成

# 3. 登录 Cloudflare 控制台清除缓存
# 或等待 24 小时让缓存自然过期
```

---

## 📞 需要帮助？

如果以上方法都不行，告诉我：
1. 你使用的部署平台名称（Cloudflare / Netlify / Vercel / 自己的服务器）
2. 部署方式（自动 CI/CD / 手动 FTP / 其他）
3. 最近一次部署是什么时候

我会提供更具体的解决方案。

---

**最后更新**：2025-10-18
