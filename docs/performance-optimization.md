# 移动端性能优化计划（进行中）

> 目标：在不改变现有功能与架构的前提下，针对移动端优化 FCP/LCP/CLS/TBT，优化幅度以“高性价比与可回退”为原则，逐步实施、逐步验收。

- 当前参考页：`根域英文内容` 与 `英文前缀页`
  - 根域（英文内容直出）：[screensizechecker.com](https://screensizechecker.com/)
  - 英文前缀页（可访问，用于验证路径策略）：[screensizechecker.com/en](http://screensizechecker.com/en)

## 1. KPI 目标（移动端）
- FCP ≤ 1.8s
- LCP ≤ 2.5s
- TBT ≤ 100ms（当前 ~150ms，进一步压降）
- CLS ≤ 0.05（当前 ~0.161）

## 2. 原因归因（高优先级项）
- 早期主线程占用：UAParser 同步加载、i18n 初始化偏早（弱机/弱网影响更明显）。
- 网络并发与资源体积：两种语言 JSON 同时 preload；内联 CSS 体量偏大；部分第三方预连接多余。
- 内容优先级与布局稳定：LCP 资源优先级不足；异步块出现时无稳定占位导致轻微 CLS。

## 3. 分阶段实施计划与任务清单

> 说明：以下任务按“影响范围小→收益明显”的顺序推进。每条均给出：影响文件、动作要点、指标映射、验收标准、回滚策略。

### 阶段一（当天可落地，低风险高收益）

- [x] 1. UAParser 延后加载（defer/按需加载）
  - 影响文件：`components/head.html`
  - 动作要点：将 `<script src=ua-parser...>` 改为 `defer`，避免阻塞首屏。
  - 指标映射：FCP/LCP/TBT
  - 验收：移动端首页、博客页设备检测结果仍能在加载后更新，无报错。
  - 回滚：改回 `defer=false` 或恢复原 `<script>` 标签位置。

- [x] 2. 仅预加载“当前语言”的翻译 JSON（取消双语言同时 preload）
  - 影响文件：`components/head.html`
  - 动作要点：改为 `{{locales_path}}/{{lang}}/translation.json` 仅预加载当前语言，另一语言运行时加载。
  - 指标映射：FCP/LCP（减少并发与阻塞）
  - 验收：切换语言仍可正常加载另一语言文案（由运行时加载）。
  - 回滚：恢复双 preload。

- [x] 3. 去除不必要的字体预连接
  - 影响文件：`components/head.html`
  - 动作要点：将 `preconnect` 降级为 `dns-prefetch`，减少早期连接开销。
  - 指标映射：FCP（减少握手与队头）
  - 验收：页面字体无闪烁/无回退异常。
  - 回滚：恢复 `preconnect`。

- [ ] 4. LCP 资源优先级调整 + 稳定占位（尤其博客首图）
  - 影响文件：博客相关组件与构建输出（`components/blog-*.html`/构建器输出）
  - 动作要点：首屏/LCP 图片添加 `fetchpriority="high"`、`loading="eager"`、`decoding="async"`，并输出明确的 `width/height` 或 `aspect-ratio`；非首屏图片一律 `loading="lazy"` 且补齐尺寸。
  - 指标映射：LCP/CLS
  - 验收：博客 LCP 显著下降，CLS 不上升；弱网下图片出现稳定无跳动。
  - 回滚：移除高优先级标记或恢复为懒加载。

- [ ] 5. 异步区块占位与渐显（降低 CLS）
  - 影响文件：相关组件容器（如 `.internal-links`、博客目录/侧栏）
  - 动作要点：为异步内容容器设置固定 `min-height` 或 skeleton，占位后再渐显（已用 opacity 过渡，可结合占位）。
  - 指标映射：CLS
  - 验收：CLS ≤ 0.05；页面无“跳动感”。
  - 回滚：移除占位样式，恢复仅 opacity。

### 阶段二（次日实施，观察 A/B）

- [ ] 6. 缩减内联 Critical CSS（只保留首屏必需）
  - 影响文件：`components/head.html`（内联 CSS）→ `css/main.css`
  - 动作要点：仅保留主题变量、头部/主容器尺寸与首屏必要规则，其余迁移到 `main.css`（仍保留 `preload as=style` 的加载策略）。
  - 指标映射：FCP/TBT（减少样式计算）
  - 验收：首屏样式完整、无闪烁；体感加载更快。
  - 回滚：恢复原内联块。

- [ ] 7. 低端设备/慢网延后 i18n 初始化
  - 影响文件：`js/module-loading-optimizer.js`
  - 动作要点：基于 `deviceMemory/hardwareConcurrency/effectiveType`，将 i18n 从 `critical` 调整为 `deferred`（延时 300–800ms）；或保留在 `critical` 但动态延迟处理。
  - 指标映射：LCP/TBT
  - 验收：弱机/弱网首屏先成像，随后文案替换；无白屏与闪烁。
  - 回滚：恢复原优先级。

- [ ] 8. 图片规范化输出（构建层）
  - 影响文件：博客构建输出/模板
  - 动作要点：统一输出 `width/height`、必要的 `srcset/sizes`；校验图片压缩比与尺寸上限。
  - 指标映射：LCP/CLS/传输体积
  - 验收：移动端图像清晰且加载更快，CLS 不上升。
  - 回滚：撤回构建规则。

## 4. 验收与监控
- Lighthouse（移动端仿真）对比前后数据，重点关注 FCP/LCP/CLS。
- RUM（真实用户指标）埋点（可后续补充）观测 LCP/CLS 曲线，确保无地区性回退。
- 小流量观察 24–48 小时后再全量。

## 5. 变更影响与回滚原则
- 所有变更均为“优先级与加载时序调整、布局占位与属性补齐”，不改业务逻辑与数据结构。
- 每一步有独立回滚开关：还原 `<script>` 属性/位置、恢复双语言 preload、移除占位样式、恢复内联 CSS 等。

## 6. 里程碑（动态更新）
- [ ] 里程碑 A：阶段一完成，移动端 LCP ≤ 2.8s、CLS ≤ 0.08、FCP ≤ 2.0s、TBT ≤ 120ms。
- [ ] 里程碑 B：阶段二完成，移动端 LCP ≤ 2.5s、CLS ≤ 0.05、FCP ≤ 1.8s、TBT ≤ 100ms。

---

备注：文档会在每次完成一个任务后同步勾选与记录实测数据（含截图/时间/设备/网络环境），并在必要时追加补充项（例如图片压缩与缓存策略微调）。
