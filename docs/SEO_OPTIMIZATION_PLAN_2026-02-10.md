# Google SEO 优化执行计划 (2026-02-10)

## 1. 战略概述：流量爆发前夜
根据最新 GSC 数据诊断，网站处于"第二页瓶颈期"。核心页面已获得 Google 认可（排名 8-20），但因点击率 (CTR) 低和意图匹配度不足，未能突破进入 Top 3。
**核心策略**：优先优化现有内容的 CTR（修桶），而非盲目扩张新内容。

## 2. 第一阶段：Quick Wins (CTR 狙击战)
**目标**：在 7 天内提升核心页面的 CTR，复制西班牙语版的成功模式。

### 2.1 任务：英语版设备对比页 (`/devices/compare`) 复刻优化
*   **现状**：排名 #14.5，CTR 1.15% (西语版 CTR 10.19%)
*   **执行动作**：
    *   **Title 修改**：
        *   原：`Screen Size Comparison Tool (2026) | Compare Monitor, TV, Laptop & Phone Sizes`
        *   新：`Visual Screen Size Comparison Tool (2026) | Monitor, Laptop & Phone Side-by-Side`
    *   **Description 修改**：
        *   原：`Compare monitor, TV, laptop...`
        *   新：`Instantly visualize and compare screen sizes side-by-side. Free tool to see exact difference in width, height, and area. Perfect for upgrades.`
    *   **H1 微调**：确保 H1 包含 "Visual" 和 "Side-by-Side" 关键词。

### 2.2 任务：首页 (`/`) 核心词卡位
*   **现状**：`my screen size` 排名 #7.9
*   **执行动作**：
    *   **Title 修改**：
        *   原：`Screen Size Checker - Free Online Tool (2025)`
        *   新：`Screen Size Checker: What is my Screen Resolution? (Free Tool 2026)`
    *   **Hero Subtitle 修改**：
        *   原：`What Is My Screen Size?`
        *   新：`Check My Screen Size & Resolution Instantly`

## 3. 第二阶段：唤醒沉睡内容 (Gaming Hub)
**目标**：激活高展示、零点击的优质内容。

### 3.1 任务：Gaming Monitor Guide (`gaming-monitor-size-guide`)
*   **现状**：展示量高，点击极低。
*   **执行动作**：
    *   **Title 升级**：`Best Gaming Monitor Size 2026: FPS vs Immersive (24" vs 27" vs 32")`
    *   **Description 升级**：`Stop guessing. Compare 24 vs 27 vs 32 inch monitors. See exact viewing distances, desk depth requirements, and PPI charts.`
    *   **内容结构优化**：在 H1 之后立即插入"快速对比表" (Quick Summary Table)，满足 "Zero Click" 用户并争取 Featured Snippet。

### 3.2 任务：144Hz vs 240Hz (`144hz-vs-240hz-gaming`)
*   **执行动作**：
    *   **Title 升级**：`144Hz vs 240Hz: Can You See the Difference? (2026 Test)`
    *   **交互优化**：增加 "Frame Time Calculator" 或简单的对比图表。

## 4. 第三阶段：内链输血 (Internal Linking)
**目标**：利用首页权重提升第二页关键词。

### 4.1 首页改版
*   在首页增加 **"Popular Gaming Guides"** 板块，直接链接到：
    *   `/hub/gaming-monitor-size-guide` (Anchor: "Best Monitor Size for Gaming")
    *   `/hub/144hz-vs-240hz-gaming` (Anchor: "144Hz vs 240Hz Comparison")
*   在首页增加 **"Tools"** 下拉菜单或板块，高亮：
    *   `/devices/compare` (Anchor: "Screen Size Comparison")
    *   `/devices/ppi-calculator` (Anchor: "PPI Calculator")

### 4.2 博客互链
*   在所有 Review 类文章底部增加 Call to Action (CTA)：
    *   "Not sure if it fits your desk? Use our [Visual Screen Comparison Tool] to check."

## 5. 监控与指标
*   **每周检查**：GSC "Performance" 报告，对比修改前后的 CTR。
*   **成功标准**：
    *   `/devices/compare` (En) CTR > 3%
    *   `my screen size` 进入 Top 5
    *   Gaming Hub 页面开始获得每日稳定点击 (>10 clicks/day)

---
**执行顺序**：
1. 更新 `locales/en/translation.json` (完成 2.1 & 2.2)
2. 更新 `hub-content/gaming-monitor-size-guide.md` (完成 3.1)
3. 部署并提交 IndexNow (确保 Google 快速抓取)
