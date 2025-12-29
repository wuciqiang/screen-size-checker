# IndexNow 提交问题排查与解决

## 问题总结

### 已修复的问题 ✅

1. **端点配置错误**
   - 原问题: `www.bing.com/indexnow` 被当作 hostname
   - 错误: `ENOTFOUND www.bing.com/indexnow`
   - 修复: 改为 `www.bing.com` (hostname) + `/indexnow` (path)

2. **验证文件缺失**
   - 原问题: 验证文件未复制到 multilang-build 目录
   - 结果: 访问 URL 返回网站首页而不是 API key
   - 修复: 在构建脚本中添加自动复制

### 当前问题 ⚠️

**HTTP 403 错误**
```
✗ Failed to submit to api.indexnow.org: HTTP 403
✗ Failed to submit to www.bing.com: HTTP 403
```

## 403 错误原因分析

### 可能原因1: 验证文件未部署到线上 (最可能)

**问题**: IndexNow API 需要验证域名所有权
- API 会访问: `https://screensizechecker.com/965fb3d0...txt`
- 如果文件不存在或返回错误内容,返回 403

**验证方法**:
```bash
# 检查线上文件
curl https://screensizechecker.com/965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead.txt

# 应该返回:
# 965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead
```

**解决方案**:
1. 提交代码到 Git
2. 推送到 GitHub
3. Cloudflare Pages 自动部署
4. 等待部署完成后再提交 IndexNow

### 可能原因2: URL 格式错误

**检查 payload**:
```javascript
{
  "host": "screensizechecker.com",
  "key": "965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead",
  "urlList": [
    "https://screensizechecker.com/",
    "https://screensizechecker.com/devices/iphone-viewport-sizes",
    ...
  ]
}
```

确保:
- ✅ host 不包含 `https://` 或 `/`
- ✅ urlList 中的 URL 是完整的 HTTPS URL
- ✅ 所有 URL 都属于同一个 host

### 可能原因3: API 限流

IndexNow 有提交限制:
- 每次最多 10,000 个 URL
- 建议分批提交
- 当前提交: 310 个 URL (在限制内)

## 完整解决方案

### 步骤1: 部署验证文件到线上

```bash
# 1. 提交修改
git add .
git commit -m "fix: add IndexNow verification file to build output"
git push

# 2. 等待 Cloudflare Pages 部署完成 (约 1-2 分钟)

# 3. 验证文件可访问
curl https://screensizechecker.com/965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead.txt
```

### 步骤2: 提交 IndexNow

```bash
# 本地提交
node build/indexnow-submitter.js

# 或提交特定 URL
node build/indexnow-submitter.js https://screensizechecker.com/ https://screensizechecker.com/devices/iphone-viewport-sizes
```

### 步骤3: 验证提交结果

#### 方法1: Bing Webmaster Tools
1. 访问: https://www.bing.com/webmasters
2. 登录并选择网站
3. 查看 **URL Submission** → **IndexNow**
4. 应该能看到提交历史

#### 方法2: 检查日志
```bash
# 成功输出:
Submitting 310 URLs to IndexNow...
✓ Successfully submitted to api.indexnow.org
✓ Successfully submitted to www.bing.com
```

## 自动化部署配置

### 方案1: 集成到构建流程

修改 `package.json`:
```json
{
  "scripts": {
    "build": "node build/multilang-builder.js",
    "build:deploy": "npm run build && node build/indexnow-submitter.js",
    "indexnow": "node build/indexnow-submitter.js"
  }
}
```

**注意**: 只在部署到生产环境时提交 IndexNow,本地构建不需要。

### 方案2: GitHub Actions (推荐)

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      # Cloudflare Pages 会自动部署 multilang-build 目录

      - name: Wait for deployment
        run: sleep 60  # 等待 Cloudflare 部署完成

      - name: Submit to IndexNow
        run: node build/indexnow-submitter.js
```

### 方案3: Cloudflare Pages 构建钩子

在 Cloudflare Pages 设置中:
- Build command: `npm run build`
- Build output directory: `multilang-build`

**注意**: Cloudflare Pages 不支持部署后钩子,需要使用 GitHub Actions。

## 最佳实践

### 何时提交 IndexNow

✅ **应该提交**:
- 新页面发布
- 内容重大更新
- URL 结构变更
- 定期提交(每周/每月)

❌ **不应该提交**:
- 每次构建都提交
- 内容未变化的页面
- 测试/开发环境

### 提交频率

- **新站点**: 首次提交所有页面
- **日常更新**: 只提交变更的页面
- **批量更新**: 分批提交,每批 < 1000 个 URL

### 监控与日志

建议添加日志记录:
```javascript
// 在 indexnow-submitter.js 中
console.log(`[${new Date().toISOString()}] Submitting ${urls.length} URLs`);
console.log(`[${new Date().toISOString()}] Response: ${res.statusCode}`);
```

## 常见问题

### Q: 为什么本地提交返回 403?
A: IndexNow 需要验证域名所有权,必须先部署验证文件到线上。

### Q: 提交后多久生效?
A: 通常 24-48 小时内,Bing 会开始抓取提交的 URL。

### Q: 如何确认提交成功?
A:
1. 检查 Bing Webmaster Tools
2. 查看日志输出 (200/202 状态码)
3. 等待几天后检查索引状态

### Q: 403 错误如何解决?
A:
1. 确认验证文件已部署到线上
2. 确认文件可通过 HTTPS 访问
3. 确认 API key 与文件名一致
4. 等待 DNS 传播完成

## 修改文件清单

- ✅ `build/indexnow-submitter.js` - 修正端点配置
- ✅ `build/multilang-builder.js` - 添加验证文件复制
- ✅ `multilang-build/965fb3d0...txt` - 验证文件已复制

---

**下一步操作**:
1. 提交代码到 Git
2. 推送到 GitHub
3. 等待 Cloudflare 部署
4. 验证文件可访问
5. 重新提交 IndexNow

**预期结果**: ✅ 提交成功,Bing 开始索引
