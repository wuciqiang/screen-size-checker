# Screen Size Checker 维护与开发 SOP

## 1. 需求评估与规划
- 明确需求类型：功能新增、语言扩展、内容更新、性能/SEO 调整。
- 检查现有组件与模板是否可复用，评估影响范围。
- 记录任务清单与预估工时，必要时拆分子任务。

## 2. 开发准备
- 拉取最新代码，创建独立工作分支。
- 阅读 `components/`、`templates/`、`build/pages-config.json` 等文件掌握现状。
- 若涉及翻译，确认 `locales/<语言>/translation.json` 的结构与键值约定。

## 3. 组件与内容修改
- 在 `components/` 目录新增或调整 HTML 片段，保持命名风格一致。
- 如需改布局与插槽调用，更新 `templates/` 下对应模板。
- 在 `build/pages-config.json` 中新增或修改页面配置，补齐 SEO、输出路径与静态资源。
- 在相关的 `locales/<语言>/translation.json` 中补充翻译键值，保持嵌套结构。
- 新的静态资源按现有结构放入 `css/`、`js/`、`data/` 等目录，并遵循模块化规范。

## 4. 构建与自检
- 执行 `npm run multilang-build` 生成完整产物。
- 针对需求运行必要的测试脚本（如 `node test/internal-links-checker.js` 等）。
- 手动检查 `multilang-build/` 内相关页面的视觉与交互。
- 查看构建日志与生成报告（如 `build-report.json`）是否异常。

## 5. 新语言接入流程
- 在 `locales/` 下创建新语言目录，拷贝现有结构后翻译所有键值。
- 在 `build/multilang-builder.js` 中将语言加入 `supportedLanguages`/`enabledLanguages`（如需要）。
- 确认 `build/pages-config.json` 的输出路径支持新语言。
- 根据需要调整 `_redirects`、`sitemap` 等生成逻辑。
- 构建后验证新语言页面并运行多语言相关测试。

## 6. 回归测试清单
- 主页与核心设备工具页（至少检查英文与中文版本）。
- 博客首页、分类页、标签页与最新文章页面。
- 多语言切换、内部链接模块、主题切换、复制等关键交互。
- 核心脚本加载情况（`js/app.js` 及关联模块）是否正常。
- `_redirects`、`sitemap.xml` 等生成文件内容是否符合预期。

## 7. 部署流程
- 确认工作区无未提交改动，执行 `git status`。
- 完成必要的构建与测试，若 CI/CD 有额外步骤需提前验证。
- 提交代码并推送分支，发起合并请求。
- 按需执行 `npm run deploy-check`、`npm run performance-check` 等部署前检查。
- 部署完成后抽样验证线上页面与新增功能。
- 记录变更摘要、注意事项与后续观察点。

## 8. 维护归档
- 更新任务记录或轻量笔记，便于团队成员同步。
- 新增功能或语言时写下补充说明（组件用途、翻译键前缀等）。
- 定期审查 `test/`、`build/`、`components/` 等目录，清理过期文件或脚本。
