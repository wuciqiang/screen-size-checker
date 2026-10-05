# 商品卡片与手动 AdSense 迁移（2026-09-30）

## 仓库事实与后台边界

- 当前仓库只有两处英文 Amazon 模块：`/devices/compare` 的比较结果之后，以及 `/hub/best-monitor-size-fps` 的购买判断之后。两处已有披露、`rel="sponsored nofollow noopener"` 和 `data-affiliate-module` / `data-affiliate-link` 事件属性。
- `js/consent-runtime.js` 在广告同意后加载 `adsbygoogle.js`，并用元素 ID 防止重复加载。仓库没有现成 `data-ad-slot` 手动单元。不能从源码断言 AdSense 后台自动广告已关闭，也没有改后台设置。
- `data/manual-ad-slots.json` 是手动单元配置接口，当前两个 slot 为空；空 slot 在本地显示带明确标识的占位，在生产域名由 `js/manual-ads.js` 删除且不请求广告。拿到真实 slot 后只需填配置并重新构建。

## 全站页面模板 → 广告位置 → 语言覆盖

| 页面类型 | 模板/范围（仓库事实） | 语言覆盖 | 适合的手动广告位置 | 当前决策 |
|---|---|---|---|---|
| 工具页 | `base` 首页；`device-page` 下的比较、resolution、viewport、laptop、responsive、PPI、aspect ratio、projection、LCD 等 | 核心页面由 `pages-config.json` 生成多语言；`/devices/compare` 卡片和手动广告试点仅英文 | 工具结果、完整操作说明和表格之后；不得贴近输入、按钮、复制、分享、画布 | 本轮只实现 compare 结果后的 hook；其它工具页保持待规划 |
| 文章页 | `hub-page`（72 个 hub 语言条目）、`blog-post`、`blog-index`、`blog-category`、`blog-tag` | 由对应 Markdown/生成配置决定；语言不统一 | 长文章自然段落分界或正文之后，避开目录、代码、操作按钮 | 本轮只实现英文 `best-monitor-size-fps` 文章购买判断后的 hook；没有把它当全站覆盖 |
| 纯色/全屏检测页 | `color-page` 的 black/red/green/blue/yellow/orange/purple/pink/gray/white，以及 LCD 全屏流程 | 多语言 | 不放在全屏画布或检测区域内 | 有意停止广告试点，保持全屏功能和退出流程 |
| 非内容页 | legal、about、404、language selector 等静态页面 | 依文件而定 | 没有自然内容位置 | 不强行放广告 |

### 生产中广告覆盖的真实含义

如果后台整站关闭自动广告，目前代码只准备了两个英文手动位置，其他工具页、文章页和语言版本都不会自动获得替代广告；纯色/全屏页和非内容页有意不覆盖。因此关闭自动广告会让多数页面暂时无广告，不能把两页试点误写为全站覆盖。

若分批试点，先在 AdSense 后台确认是否支持按页面/URL 排除或实验；不能假定所有设置都能按单页控制。切换窗口应先让代码和真实 slot 在同一版本就绪，再在后台关闭对应自动广告范围，并观察页面只出现一个广告来源，避免自动和手动叠加。

## 需要在 AdSense 后台创建的单元清单

| 建议名称 | 用途 | 布局/容器 | 需要复制回仓库的字段 | 当前代码位置 |
|---|---|---|---|---|
| `ssc_compare_results_after_manual` | 比较结果与解释完成后的内容间广告 | 响应式 display，独立块，至少保留未填充空间；不覆盖 canvas/table | `data-ad-slot`（client 已是 `ca-pub-9212629010224868`；仍以后台真实代码为准） | `compare_results_after` |
| `ssc_fps_guidance_after_manual` | FPS 指导文章购买判断之后 | 响应式 display，独立块，和商品卡片留出间距 | `data-ad-slot`（client 以后台代码为准） | `best_monitor_size_fps_after_guidance` |

后台创建单元是后台操作；关闭自动广告也是后台操作，不能靠仓库改动完成。没有真实 slot 前，生产不会请求广告，也不会输出虚构广告。

## A. 商品卡片上线方案

1. 复核 [商品研究报告](<G:\Workspace\google-data-analysis\screensizechecker.com\amazon-monitor-products-2026-09-30\RESEARCH_CN.md>) 中的 ASIN、变体、规格和 Amazon 普通页；确认 `screensizechecker-20` 对应账户授权。
2. 在 `data/affiliate-products.json` 更新已核实字段；只把 `enabled: true` 用于已核实的具体商品。
3. 正常运行 `npm run multilang-build`，检查英文两页卡片位置、移动端列布局、空图片可用性和 affiliate attributes。
4. 本地浏览器拦截 Amazon 导航和统计请求后验收；不自动点击推广链接，不模拟订单。
5. 与广告迁移分开发布并记录时间；本轮不提交、不推送、不部署。

回滚：恢复 `affiliate-products.json` 和两个内容入口到上一版本，重新构建即可；不要删除研究证据或覆盖其他工作。

## B. 手动广告迁移方案

1. 先在后台创建上述单元并取得真实 `data-ad-slot`；没有 slot 时保持配置为空。
2. 本地填入 slot，运行构建和测试，验证 `adsbygoogle` 每页只初始化一次、同意状态生效、未填充/脚本失败不破坏布局。
3. 确认后台是否能排除自动广告的试点 URL；如果不能按页控制，先不要关闭整站自动广告。
4. 在一个明确窗口先发布代码配置，再按后台支持的范围关闭自动广告，检查自动与手动没有叠加；生产验收不能把本地模拟占位当成广告填充。
5. 观察桌面/手机容器宽度、未填充状态和布局位移；不得修改 iframe、覆盖素材或自动刷新。

回滚必须同时处理两侧：代码把 slot 配置恢复为空/旧值并重新构建，后台恢复原自动广告或原手动单元状态；先确认单一投放来源后再打开另一侧，避免重复投放。

## 本轮未完成项

- 需要虾哥补充/确认：AdSense 后台真实 slot ID、是否按 URL 排除自动广告、是否计划整站关闭自动广告。
- 需要账户后台确认：Amazon `screensizechecker-20` 的资格、佣金分类/费率、地区限制和真实订单数据。
- 需要发布授权：本轮只完成本地代码、构建、测试和预览，不推送、不部署、不改后台。
