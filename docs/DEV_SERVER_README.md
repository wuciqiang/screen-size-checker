# 开发服务器使用指南

## 🚀 快速开始

### 1. 构建项目
```bash
npm run build
```

### 2. 启动开发服务器
```bash
python dev-server.py
```

### 3. 访问网站
```
http://localhost:8080/
```

---

## ✨ 特性

### Clean URLs 支持
无需 `.html` 扩展名即可访问页面：

```
✅ http://localhost:8080/devices/iphone-viewport-sizes
✅ http://localhost:8080/devices/compare
✅ http://localhost:8080/zh/
```

### 自动索引页
访问目录会自动加载 `index.html`：

```
✅ http://localhost:8080/          → index.html
✅ http://localhost:8080/zh/        → zh/index.html
```

### 静态文件
CSS、JS、图片等静态文件直接访问：

```
✅ http://localhost:8080/css/mega-menu.css
✅ http://localhost:8080/js/mega-menu.js
✅ http://localhost:8080/images/logo.png
```

---

## 🔄 与旧方式的区别

### 旧方式（不推荐）
```bash
cd multilang-build
python -m http.server 8080

# 问题：
# ❌ 需要 .html 扩展名
# ❌ 与线上环境不一致
# ❌ /devices/ 显示文件列表
```

### 新方式（推荐）
```bash
python dev-server.py

# 优势：
# ✅ Clean URLs（无需 .html）
# ✅ 与线上环境一致
# ✅ 自动处理目录索引
# ✅ Windows 编码问题已修复
```

---

## 📋 常用测试 URLs

### 首页
- http://localhost:8080/
- http://localhost:8080/zh/

### 设备页面
- http://localhost:8080/devices/iphone-viewport-sizes
- http://localhost:8080/devices/android-viewport-sizes
- http://localhost:8080/devices/ipad-viewport-sizes
- http://localhost:8080/devices/compare
- http://localhost:8080/devices/ppi-calculator

### 博客
- http://localhost:8080/blog/
- http://localhost:8080/blog/viewport-basics
- http://localhost:8080/zh/blog/

---

## 🐛 故障排除

### 问题：端口被占用
```
Error: [Errno 10048] Only one usage of each socket address
```

**解决方案**：
1. 停止占用端口的程序
2. 或修改 `dev-server.py` 中的 `PORT = 8080` 为其他端口

### 问题：找不到 multilang-build 目录
```
❌ Error: 'multilang-build' directory not found!
```

**解决方案**：
```bash
npm run build
```

### 问题：UnicodeEncodeError
```
UnicodeEncodeError: 'gbk' codec can't encode character
```

**解决方案**：
已在脚本中修复，如果仍有问题：
```bash
# Windows 设置环境变量
set PYTHONIOENCODING=utf-8
python dev-server.py
```

---

## 🔧 配置

### 修改端口
编辑 `dev-server.py`：
```python
PORT = 8080  # 改为你想要的端口
```

### 修改构建目录
编辑 `dev-server.py`：
```python
DIRECTORY = "multilang-build"  # 改为你的构建目录
```

---

## 📖 技术说明

### Clean URL 实现原理

```python
# 1. 用户请求 /devices/iphone-viewport-sizes
# 2. 服务器检查文件是否存在
# 3. 如果不存在，自动添加 .html
# 4. 返回 /devices/iphone-viewport-sizes.html
```

### 目录索引处理

```python
# 1. 用户请求 /devices/
# 2. 服务器查找 /devices/index.html
# 3. 如果存在，返回该文件
# 4. 如果不存在，返回 404
```

---

## 🚦 生产环境配置

### Nginx 配置示例
```nginx
# 与 dev-server.py 行为一致的 Nginx 配置
location / {
    try_files $uri $uri.html $uri/ =404;
}
```

### Apache 配置示例
```apache
# .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^.]+)$ $1.html [NC,L]
```

---

## 💡 提示

### 开发流程

```bash
# 1. 修改源代码
vim components/header-mega-menu.html

# 2. 重新构建
npm run build

# 3. 刷新浏览器测试
# 无需重启服务器！
```

### 性能建议

- ✅ 开发时使用 `dev-server.py`
- ✅ 生产环境使用 Nginx/Apache
- ✅ 不要在生产环境使用 Python http.server

---

## 📚 相关文档

- [PHASE_0.2_FIXES.md](./PHASE_0.2_FIXES.md) - 问题修复详情
- [PHASE_0.2_INTEGRATION_REPORT.md](./PHASE_0.2_INTEGRATION_REPORT.md) - 集成报告
- [BUILD_SYSTEM.md](./BUILD_SYSTEM.md) - 构建系统文档

---

## ⚡ 快捷命令

```bash
# 完整开发流程
npm run build && python dev-server.py

# 后台运行（Linux/Mac）
nohup python dev-server.py > server.log 2>&1 &

# 后台运行（Windows）
start /B python dev-server.py
```

---

**Happy Coding! 🎉**
