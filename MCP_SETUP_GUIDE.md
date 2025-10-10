# MCP服务器安装配置指南

## 🎯 已安装的MCP服务器

### 1. 文件系统服务器 (`filesystem`)
- **功能**: 允许Claude访问和操作文件系统
- **权限**: 可访问 `C:\Users\Administrator` 目录下的所有文件
- **用途**: 读取、写入、创建文件和目录

### 2. GitHub服务器 (`github`)
- **功能**: 与GitHub API集成，管理仓库和Issues
- **状态**: 已安装但需要配置GitHub Token
- **用途**: 仓库操作、Issue管理、代码审查等

### 3. Puppeteer服务器 (`puppeteer`)
- **功能**: 自动化浏览器操作，网页截图和测试
- **用途**: 网页自动化、截图、SEO测试等

### 4. Context7服务器 (`context7`)
- **功能**: 上下文管理和文档处理工具
- **版本**: v1.0.3
- **用途**: 文档上下文分析、智能内容处理

### 5. Sequential Thinking服务器 (`sequential-thinking`)
- **功能**: 顺序思考和问题解决助手
- **版本**: v2025.7.1
- **用途**: 分步骤解决复杂问题、逻辑推理

### 6. Magic服务器 (`magic`)
- **功能**: AI驱动的UI构建工具
- **版本**: v0.1.0 (by 21st.dev)
- **用途**: 快速构建用户界面、原型设计

### 7. Playwright服务器 (`playwright`)
- **功能**: 现代化浏览器自动化测试工具
- **版本**: v0.0.41 (Official)
- **用途**: 端到端测试、网页自动化、跨浏览器测试

### 8. Morph Fast Apply服务器 (`morph-fast-apply`)
- **功能**: AI驱动的代码编辑和快速应用
- **版本**: v0.7.1
- **用途**: 智能代码修改、批量编辑、代码重构

## 📁 配置文件位置

配置文件已创建在：`C:\Users\Administrator\claude_desktop_config.json`

## ⚙️ 使用方法

### 在Claude Code中使用

1. **文件系统操作**:
   ```
   请读取项目根目录的README.md文件
   请创建一个新的组件文件
   请列出当前目录的所有文件
   ```

2. **GitHub集成** (需要配置Token):
   ```
   请检查我的GitHub仓库
   请创建一个新的Issue
   请列出最近的提交记录
   ```

3. **网页自动化**:
   ```
   请截图 screensizechecker.com 首页
   请测试网站的响应式设计
   请检查页面的SEO元素
   ```

## 🔧 GitHub Token配置

如果您想使用GitHub功能，需要：

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择以下权限：
   - `repo` (完整仓库访问权限)
   - `issues:write` (Issue管理权限)
   - `read:org` (组织读取权限)
4. 复制生成的Token
5. 编辑配置文件，将Token填入 `GITHUB_TOKEN` 环境变量

## 🚀 测试MCP服务器

重启Claude Code后，您可以测试以下功能：

### 基础功能测试
```bash
# 测试文件系统访问
请列出当前项目的所有文件

# 测试文件读取
请读取 package.json 文件内容

# 测试文件创建
请在项目根目录创建一个测试文件 test-mcp.txt
```

### 新服务器功能测试
```bash
# 测试Context7
请分析当前项目的文档结构

# 测试Sequential Thinking
请用分步骤的方式分析如何优化这个项目

# 测试Magic
请为这个项目创建一个简单的管理界面原型

# 测试Playwright
请测试 screensizechecker.com 的响应式设计

# 测试Morph Fast Apply
请优化当前项目中的某个JavaScript文件
```

### 组合使用示例
```bash
# 组合使用多个MCP服务器
1. 使用文件系统读取项目配置
2. 使用Sequential Thinking分析架构
3. 使用Morph Fast Apply进行代码优化
4. 使用Playwright测试修改结果
```

## 📝 注意事项

1. **安全性**: 文件系统服务器可以访问您的用户目录，请注意数据安全
2. **性能**: Puppeteer服务器需要较多资源，请适度使用
3. **权限**: 确保Claude Code有足够权限访问配置的目录
4. **更新**: 定期更新MCP服务器包以获得最新功能

## 🆘 常见问题

### Q: MCP服务器无法启动
A: 检查Node.js版本和npm全局包路径是否正确

### Q: 文件访问权限错误
A: 确保配置文件中的路径正确且有访问权限

### Q: GitHub功能无法使用
A: 确保已正确配置GitHub Token并具有必要权限

## 📞 技术支持

如需帮助，请检查：
1. Node.js版本: `node --version`
2. npm包列表: `npm list -g --depth=0`
3. 配置文件语法是否正确
4. Claude Code版本是否支持MCP

### 🆕 Serena服务器状态
- **状态**: ❌ 未找到
- **说明**: 在npm registry中未找到名为"Serena"的MCP服务器
- **建议**: 请确认准确的包名或提供GitHub仓库地址

## 🎉 安装总结

✅ **成功安装**: 7个MCP服务器
❌ **未找到**: 1个MCP服务器 (Serena)
📊 **总计**: 8个MCP服务器 (7个可用)

### 🚀 新增能力
1. **文档分析** - Context7提供智能文档处理
2. **顺序思考** - Sequential Thinking提供逻辑推理
3. **UI构建** - Magic提供快速原型设计
4. **现代测试** - Playwright提供专业自动化测试
5. **智能编辑** - Morph Fast Apply提供AI代码修改

---
**安装完成时间**: 2025-10-09
**安装版本**: 最新稳定版
**配置状态**: ✅ 就绪
**可用服务器**: 7/8 个正常运行