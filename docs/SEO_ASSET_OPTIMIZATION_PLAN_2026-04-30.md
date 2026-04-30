# screensizechecker.com SEO 资产优化执行文档

> 日期：2026-04-30  
> 适用范围：screensizechecker.com 全站页面、构建配置、sitemap、robots、多语言内容资产  
> 核心目标：按 2026 年 Google core/spam update 方向，收缩低价值索引面，强化直接满足需求的工具页和数据资产页，重建多语言本地化质量信号。

---

## 1. 执行原则

后续所有 SEO 和内容资产处理都按本文件执行。除非有新的 GSC 数据或 Google 官方政策变化，否则不要随意扩展页面、批量生成内容或只改 title/meta。

### 1.1 Google 算法导向

本次优化基于以下判断：

- Google 2026 年 3 月核心更新后，更偏向直接满足用户任务的页面，而不是泛泛信息中间页。
- 批量模板页、低增量 listicle、过期年份内容、纯聚合内容、无真实经验的 affiliate/guide 类页面风险上升。
- AI 内容本身不是问题；问题是规模化生成、缺少人工判断、缺少原创信息和用户价值。
- 多语言页面不能只是翻译。每个语言版本都需要有本地用户、设备、表达习惯和搜索意图上的增量。

官方参考：

- Google core updates: https://developers.google.com/search/docs/appearance/core-updates
- Helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Spam policies / scaled content abuse: https://developers.google.com/search/docs/essentials/spam-policies
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro

### 1.2 站点资产处理优先级

按优先级处理：

1. 抓取和索引问题：robots、sitemap、canonical、noindex。
2. 直接工具页：首页、resolution test、compare、PPI、aspect ratio、LCD tester、responsive tester。
3. 数据参考页：standard resolutions、iPhone/iPad/Android viewport sizes。
4. 高曝光 hub 页面：gaming monitor、resolution、refresh rate、panel type 等。
5. blog 页面：只保留能支持工具页和数据页的内容。
6. tag、分页、低价值归档页：默认不作为 SEO 增长资产。

---

## 2. 数据诊断结论

### 2.1 总体趋势

GSC 数据显示，站点不是被整体惩罚，而是曝光池被重新分配。

以 2026-03-01 到 2026-03-23 作为算法前高峰，对比 2026-04-09 到 2026-04-27：

| 指标 | 算法前 | 算法后 | 变化 |
| --- | ---: | ---: | ---: |
| 日均点击 | 139.9 | 109.9 | -21% |
| 日均曝光 | 8544.4 | 6488.3 | -24% |
| CTR | 1.64% | 1.69% | 基本稳定 |
| 平均排名 | 11.3 | 12.38 | 小幅下降 |

判断：问题主要是 Google 给站点的展示机会减少，不是单纯标题点击率问题。

### 2.2 页面类型表现

| 页面类型 | 曝光 | 点击 | CTR | 诊断 |
| --- | ---: | ---: | ---: | --- |
| 首页 | 209,494 | 10,522 | 5.02% | 仍然是核心资产 |
| 工具/设备页 | 232,639 | 2,806 | 1.21% | 有潜力，但部分页未直接满足意图 |
| Hub 页 | 279,920 | 478 | 0.17% | 最大问题区 |
| Blog 页 | 39,671 | 72 | 0.18% | 多数不是增长资产 |
| Blog tag 页 | 329 | 0 | 0% | 不应占用索引资源 |

结论：Hub/Blog 内容层拿了大量曝光但 CTR 极低，正在拖累整站质量信号。未来要从“文章资产”转向“工具 + 数据 + 方法论资产”。

### 2.3 高风险页面

优先处理以下高曝光低 CTR 页面：

| 页面 | 曝光 | CTR | 处理方向 |
| --- | ---: | ---: | --- |
| `/hub/gaming-monitor-size-guide` | 45,823 | 0.15% | 重做为交互式选择器 + 本地化购买建议 |
| `/hub/ips-vs-tn-vs-va-gaming` | 23,194 | 0.02% | 补真实对比数据，否则降级/合并 |
| `/hub/best-gaming-resolution-2025` | 21,826 | 0.06% | 更新到 2026 或合并迁移 |
| `/hub/hdr-gaming-monitor-guide` | 20,444 | 0.13% | 补显示标准、设备验证和案例 |
| `/devices/standard-resolutions` | 19,457 | 0.17% | 重做为可筛选数据参考页 |
| `/devices/ppi-calculator` | 21,704 | 0.10% | 首屏计算器和 query intent 需要强化 |

---

## 3. 全站技术 SEO 处理

### 3.1 robots.txt

当前风险：

```txt
Disallow: /*test*
```

这会误伤真实工具页：

- `/resolution-test`
- `/devices/responsive-tester`
- `/devices/lcd-screen-tester`

处理要求：

- 禁止使用宽泛规则屏蔽包含 `test` 的 URL。
- 只屏蔽真实测试文件、调试文件、构建目录。
- 工具页必须允许 Googlebot 抓取。

建议规则：

```txt
Disallow: /performance-test-production.html
Disallow: /*debug*
Disallow: /build/
Disallow: /multilang-build/
Disallow: /node_modules/
```

验收标准：

- Google URL Inspection 显示核心工具页允许抓取。
- `robots.txt` 不再屏蔽任何正式工具页。

### 3.2 sitemap

当前问题：

- 构建目录有 470 个 HTML，但 sitemap 只有 307 个 URL。
- 部分真实工具页不在 sitemap。
- tag 页和低价值归档页混入 sitemap。

处理原则：

- sitemap 只放 canonical、indexable、有搜索价值的 URL。
- tag、分页、低价值归档默认移出 sitemap。
- 多语言页面必须用当前语言 canonical URL。

必须保留：

- 首页和多语言首页
- 核心工具页
- 数据参考页
- 经重写后的高质量 hub 页
- 少量有搜索价值的 blog 页

必须移出或 noindex：

- `/blog/tag/*`
- `/zh/blog/tag/*`
- `/de/blog/tag/*`
- `/es/blog/tag/*`
- `/pt/blog/tag/*`
- `/fr/blog/tag/*`
- blog 分页，除非它承担明确发现路径
- 无流量、无外链、无独立价值的旧文章

### 3.3 canonical 与 hreflang

要求：

- 每个语言版本 canonical 指向自身语言 URL。
- hreflang 必须互相返回。
- x-default 指向英文首页或对应英文 canonical。
- 不要让 `.html` 和无 `.html` 版本同时参与索引。

验收标准：

- sitemap URL 与 canonical URL 完全一致。
- GSC 国际定位/替代页面报告无大规模 canonical 冲突。

---

## 4. 页面资产分级策略

### 4.1 A 类：核心工具页

这类页面是最符合 Google 2026 算法方向的资产。目标是让用户打开页面就能完成任务。

核心页面：

- `/`
- `/resolution-test`
- `/devices/compare`
- `/devices/ppi-calculator`
- `/devices/aspect-ratio-calculator`
- `/devices/lcd-screen-tester`
- `/devices/responsive-tester`
- `/devices/projection-calculator`

优化要求：

- 首屏必须是工具本体，不是长介绍。
- 工具结果必须可复制、可分享、可解释。
- 每个工具页都要有 150-300 字的“结果如何理解”说明。
- 每个工具页必须链接到最相关的数据页或指南页。
- Schema 优先使用 WebApplication、SoftwareApplication、BreadcrumbList。
- 不添加无来源评分。

示例：`/devices/ppi-calculator`

首屏结构：

1. H1: PPI Calculator
2. 输入：宽度像素、高度像素、屏幕英寸
3. 输出：PPI、像素密度等级、适合用途
4. 快捷预设：24" 1080p、27" 1440p、32" 4K、iPhone、MacBook
5. 解释：PPI 对清晰度、阅读距离、游戏体验的影响

### 4.2 B 类：数据参考页

核心页面：

- `/devices/standard-resolutions`
- `/devices/iphone-viewport-sizes`
- `/devices/ipad-viewport-sizes`
- `/devices/android-viewport-sizes`

优化要求：

- 页面定位必须是“可查询数据资产”，不是普通文章。
- 表格支持搜索、筛选、排序。
- 明确数据字段含义：resolution、CSS viewport、DPR、PPI、aspect ratio。
- 标注更新时间和数据来源/验证方法。
- 增加 Dataset schema。
- 每个语言版本需要加入本地常见设备或本地术语解释。

`standard-resolutions` 重做方向：

- 添加用途筛选：web、gaming、video、office、mobile、TV。
- 添加分辨率与屏幕尺寸/PPI 对照。
- 添加“physical resolution vs CSS viewport”的解释。
- 添加“如何在当前设备检测真实分辨率”的工具入口。

### 4.3 C 类：Hub 指南页

Hub 页只有在具备原创信息、真实判断、工具联动时才保留。纯 listicle 或年份包装页不再作为增长资产。

保留条件：

- 有清晰搜索意图。
- 有独立方法论、表格、计算器、真实数据或经验。
- 和工具页形成闭环。
- 不与其他 hub 页互相蚕食。

处理动作：

- 高曝光低 CTR 页面优先重写。
- 过期 2025 页面更新到 2026，或 301 到新版。
- 主题重叠页面合并。
- 无数据、无外链、无转化价值的页面 noindex 或删除。

Hub 页标准结构：

1. Quick Answer：直接给结论。
2. Decision Tool：选择器、表格或计算器。
3. Methodology：说明判断标准。
4. Use Cases：按用户场景拆解。
5. Local Notes：多语言版本加入本地信息。
6. FAQ：只回答真实搜索问题。
7. Related Tools：链接到工具页。

### 4.4 D 类：Blog 页面

Blog 不再追求数量，只作为工具页和数据页的支撑内容。

保留条件：

- 能解释工具页中的概念。
- 能承接长尾问题。
- 有明确内部链接指向工具页。
- 不与核心工具页抢同一关键词。

默认降级：

- 年份过期但未更新的文章。
- 泛泛教程。
- 只有翻译没有本地增量的文章。
- tag 页面。
- 分页归档。

---

## 5. 多语言本地化策略

多语言是增长机会，但也是质量风险。后续不允许只把英文页面硬翻译后发布。

### 5.1 多语言基本原则

每个语言版本必须满足至少一项本地增量：

- 本地设备数据
- 本地搜索表达
- 本地单位和格式
- 本地购买习惯
- 本地平台/电商/品牌例子
- 本地 FAQ
- 本地竞品 SERP 差异

如果没有本地增量，页面可以暂缓发布或 noindex。

### 5.2 各语言本地化重点

#### English

定位：主版本，承担全站 canonical 质量基准。

重点：

- 保证数据和工具最完整。
- 删除过期年份。
- 避免过度 listicle。
- 所有断言必须有来源或改成保守表述。

#### Chinese (`/zh/`)

定位：不能只翻译英文。中文用户设备生态和搜索表达不同。

本地化要求：

- Android 数据加入华为、小米、OPPO、vivo、荣耀、Redmi 常见机型。
- iPhone 页面加入中国常见机型叫法，例如“国行 iPhone 15/16/17”。
- 单位使用中文习惯：厘米、英寸同时展示。
- FAQ 使用中文搜索表达：屏幕分辨率怎么看、手机屏幕尺寸怎么看、电脑分辨率怎么查。
- 避免英文直译词堆叠，如 viewport 可解释为“浏览器视口/CSS 显示区域”。

优先页面：

- `/zh/`
- `/zh/devices/standard-resolutions`
- `/zh/devices/iphone-viewport-sizes`
- `/zh/devices/android-viewport-sizes`
- `/zh/devices/compare`

#### German (`/de/`)

本地化要求：

- 使用德国用户常见表达：Bildschirmauflösung、Bildschirmgröße、Monitorgröße、Pixeldichte。
- 单位以 cm + Zoll 展示。
- Gaming 页面可加入德国/欧盟购买语境，如桌面深度、显示器尺寸和办公/游戏混合使用。
- 避免英文未翻译内容残留。

#### Spanish (`/es/`)

本地化要求：

- 覆盖西班牙语常见表达：tamaño de pantalla、resolución de pantalla、comparador de pantallas。
- 注意拉美用户和西班牙用户表达差异，避免只按西班牙本土表达。
- 工具页 CTA 使用自然表达，不要直译英文。
- 优先强化 `/es/devices/compare`，因为已有高 CTR。

#### Portuguese (`/pt/`)

本地化要求：

- 默认以巴西葡语为主，除非页面明确面向葡萄牙。
- 使用 resolução de tela、tamanho da tela、comparar telas 等表达。
- 单位用 polegadas + cm。
- 设备页加入巴西市场常见 Android 品牌和型号。

#### French (`/fr/`)

当前曝光较少，应先做少量高质量页面，不急于全量扩展。

优先：

- `/fr/`
- `/fr/devices/compare`
- `/fr/devices/standard-resolutions`
- `/fr/devices/ppi-calculator`

要求：

- 使用 taille d'écran、résolution d'écran、densité de pixels 等自然表达。
- 单位以 pouces + cm 展示。
- 确保不是英文内容残留。

### 5.3 多语言发布门槛

新增或重写多语言页面前必须检查：

- 标题是否符合该语言搜索习惯。
- 首屏是否能直接完成任务。
- 是否有本地数据或本地例子。
- 是否有该语言独立 FAQ。
- hreflang 是否完整。
- canonical 是否指向自身语言 URL。
- sitemap 是否包含该语言 URL。

不满足以上条件，不发布 indexable 页面。

---

## 6. 核心页面重做清单

### 6.1 首页 `/`

目标：保持为全站最强直接工具页。

需要处理：

- 删除重复的 Featured Tools & Guides 区块。
- 首屏强化：viewport、screen resolution、DPR、copy all。
- 增加“screen size vs screen resolution vs viewport”的简短解释。
- 把内部链接控制为少量高相关工具，不要像目录页。
- 保留 WebApplication schema，但删除无来源 aggregateRating。

### 6.2 `/devices/compare`

目标关键词：

- screen size comparison
- monitor size comparison
- display size comparison

需要处理：

- 首屏即对比工具。
- 增加预设对比：24 vs 27、27 vs 32、iPhone vs iPad、laptop vs monitor。
- 输出宽高、面积差、可视面积百分比、适合距离。
- 添加“如何理解对比结果”的说明。
- 多语言版本加入本地常见设备和单位。

### 6.3 `/devices/standard-resolutions`

目标关键词：

- standard screen resolutions
- screen resolution chart
- common monitor resolutions

需要处理：

- 可筛选表格。
- 增加 PPI/尺寸联动。
- 增加 CSS viewport 解释。
- 增加 Dataset schema。
- 删除社交媒体图片尺寸等偏题内容，或拆成独立页面。当前页面主题太散，会稀释意图。

### 6.4 `/devices/ppi-calculator`

目标关键词：

- ppi calculator
- pixel density calculator
- monitor ppi calculator

需要处理：

- 首屏计算器必须比解释更靠前。
- 加入预设设备和显示器。
- 输出结果要有判断：low、standard、sharp、retina-like。
- 与 standard resolutions、compare、gaming monitor size guide 互链。

### 6.5 `/hub/gaming-monitor-size-guide`

当前问题：

- 曝光高但 CTR 极低。
- 内容像普通指南，缺少强工具资产。
- 仍有 2025 链接和过期表达。

重做方向：

- 改成“Gaming Monitor Size Selector”。
- 输入：游戏类型、桌深、显卡、预算、是否竞技。
- 输出：推荐尺寸、分辨率、刷新率、观看距离。
- 保留文字指南，但从属工具。
- 2025 链接全部更新或迁移。
- 多语言加入本地购买/设备环境。

### 6.6 `/hub/best-gaming-resolution-2025`

处理选项：

1. 更新为 `/hub/best-gaming-resolution` 或 `/hub/best-gaming-resolution-2026`。
2. 如果无足够新增内容，合并到 gaming monitor size guide。
3. 旧 URL 301 到新版。

不要继续保留标题含 2025 的主推页面。

---

## 7. 内部链接策略

### 7.1 链接方向

权重应该从低转高：

- Blog -> 工具页
- Hub -> 工具页 + 数据页
- 数据页 -> 工具页
- 首页 -> 少量核心工具页

不要大量从首页链接到低 CTR hub 页面。

### 7.2 锚文本规则

锚文本应贴近用户任务：

- check your screen resolution
- compare screen sizes
- calculate PPI
- test your screen resolution
- view iPhone viewport sizes

避免泛锚文本：

- read more
- learn more
- guide
- click here

### 7.3 多语言内链

同语言页面优先互链。不要从中文页大量链接英文页，除非中文版本不存在并明确说明。

---

## 8. 结构化数据策略

### 8.1 允许使用

- WebApplication：工具页
- SoftwareApplication：工具页
- Dataset：数据参考页
- Article：高质量 hub/blog
- FAQPage：页面上真实可见的 FAQ
- BreadcrumbList：所有非首页页面

### 8.2 禁止使用

- 无真实来源的 AggregateRating。
- 页面不可见 FAQ 的 FAQPage。
- 与页面主体不匹配的 schema。
- 为了 rich result 而堆 schema。

### 8.3 多语言 schema

每个语言版本 schema 的：

- name
- description
- headline
- FAQ
- inLanguage

必须使用当前语言，不要输出英文内容。

---

## 9. 内容质量标准

每个 indexable 页面必须满足以下标准：

- 首屏能直接回答或完成用户任务。
- 页面主题单一，不混入无关主题。
- 有原创数据、工具输出、方法论或本地化增量。
- 不使用过期年份包装。
- 不做同一模板批量替换关键词。
- 内链指向相关工具和数据页。
- 多语言不是硬翻译。

不满足标准的页面处理方式：

1. 重写。
2. 合并到更强页面。
3. noindex。
4. 删除并 301 到相关页面。

---

## 10. 执行路线图

### Phase 1：技术止血

目标：让 Google 抓取和索引重点回到高价值工具页。

任务：

- 修 robots.txt。
- 重建 sitemap。
- 移出 tag/分页/低价值归档。
- 删除首页重复区块。
- 删除无来源 aggregateRating。
- 检查核心工具页是否都在 sitemap。

验收：

- sitemap 仅包含 canonical indexable URL。
- `/resolution-test` 等工具页可抓取。
- 首页 HTML 不再重复输出 Featured Tools & Guides。

### Phase 2：核心工具页强化

目标：提升直接任务型 query 的排名和 CTR。

任务：

- 重做 `/devices/compare`。
- 重做 `/devices/ppi-calculator`。
- 重做 `/devices/standard-resolutions`。
- 强化 `/resolution-test`。
- 每个核心工具页补 WebApplication/SoftwareApplication/Breadcrumb schema。

验收：

- 每页首屏就是工具。
- 每页有清晰结果解释。
- 每页有同语言内链闭环。

### Phase 3：Hub 页重构

目标：把高曝光低 CTR hub 页改造成有工具、有数据、有方法论的资产。

任务：

- 重做 `/hub/gaming-monitor-size-guide`。
- 处理 `/hub/best-gaming-resolution-2025`。
- 重写或合并 `/hub/ips-vs-tn-vs-va-gaming`。
- 重写或合并 `/hub/hdr-gaming-monitor-guide`。
- 清理所有 2025 链接和标题。

验收：

- 高曝光 hub 页不再是泛泛 listicle。
- 每个 hub 页至少有一个独有数据表、选择器或方法论模块。
- CTR 在 GSC 中逐步回升。

### Phase 4：多语言深度本地化

目标：让每个语言版本有独立价值，而不是翻译副本。

任务：

- 中文增加本地 Android 设备数据。
- 西语强化 compare 和工具页。
- 德语补本地术语和单位。
- 葡语按巴西葡语优化。
- 法语先做少量核心页，不做全量扩张。

验收：

- 每个重点语言至少有 3-5 个深度本地化页面。
- 本地页面包含独立 FAQ 和本地设备/单位/用法。
- 多语言 GSC 展示增长不依赖英文页面。

---

## 11. 后续数据监控

每次发布后 14 天检查：

- 页面维度：点击、曝光、CTR、排名。
- Query 维度：核心任务词是否增长。
- 国家/语言维度：本地化页面是否拿到本地展示。
- 索引维度：是否出现 Crawled currently not indexed 或 Duplicate without user-selected canonical。

重点监控 query：

- screen size checker
- what is my screen size
- my screen resolution
- what is my screen resolution
- screen size comparison
- monitor size comparison
- resolution test
- resolution checker
- ppi calculator

重点监控页面：

- `/`
- `/resolution-test`
- `/devices/compare`
- `/devices/ppi-calculator`
- `/devices/standard-resolutions`
- `/devices/iphone-viewport-sizes`
- `/devices/android-viewport-sizes`
- `/hub/gaming-monitor-size-guide`

---

## 12. 决策规则

后续遇到页面资产时按以下规则处理：

- 如果页面直接完成用户任务：保留并强化。
- 如果页面是数据资产：结构化、可筛选、加来源和更新时间。
- 如果页面只是解释概念：必须服务于工具页，否则 noindex。
- 如果页面是年份内容：必须更新到当前年份或迁移。
- 如果多语言页面没有本地增量：暂缓 index。
- 如果两个页面抢同一 query：合并或重新定位。
- 如果页面 90 天曝光高但 CTR 低于 0.3%：优先重写标题、首屏和页面意图。
- 如果页面 90 天无点击且无战略价值：noindex 或删除。

---

## 13. 不做事项

明确禁止：

- 批量生成城市页、设备页、关键词替换页。
- 为了覆盖关键词而新增薄页面。
- 把英文内容机械翻译后直接 index。
- 给所有页面批量加 FAQ schema。
- 给无真实来源页面添加评分 schema。
- 继续扩张 tag 页和归档页。
- 单纯通过改 title/meta 解决核心更新后的质量问题。

---

## 14. 最终目标

screensizechecker.com 的 SEO 定位应从“屏幕尺寸相关文章和工具集合”升级为：

> 多语言屏幕、分辨率、视口、显示器尺寸的实时检测工具和可信数据参考库。

所有页面都应服务这个定位。不能服务这个定位的页面，应合并、noindex 或删除。
