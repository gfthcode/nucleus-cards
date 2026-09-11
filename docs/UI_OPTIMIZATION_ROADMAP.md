# UI / Motion / Image 优化路线图

状态：PHASE 0 方案，等待确认后执行。

## 1. 产品设计方向

网站的视觉主角是“可核验的球星卡市场对象”，而不是 dashboard 或纯球员照片。

- 70%：卡片身份、卡面、价格和来源。
- 30%：球员赛场氛围、球队语境和市场故事。
- 视觉性格：premium、dark、precise、collector-focused、cinematic、minimal。
- 禁止漂移：crypto aesthetic、casino UI、NFT style、gaming HUD、大量 neon、蓝紫 AI gradient、廉价 glassmorphism。

## 2. 分阶段执行

### PHASE 0：本轮已完成

- 仓库、首页、动画、图片和响应式审计。
- 检查 DESIGN.md：当前不存在。
- GitHub Skill / Pattern 预检。
- 明确 USE / ADAPT / REFERENCE ONLY / REJECT。
- 输出：
  - docs/UI_HOMEPAGE_AUDIT.md
  - docs/GITHUB_UI_SKILL_AUDIT.md
  - docs/UI_OPTIMIZATION_ROADMAP.md

### PHASE 1：Design System 与 UI 基线

交付：

- 根目录 DESIGN.md：品牌、颜色、字体、spacing、radius、边框、阴影、z-index、motion、数据可信度 badge。
- CSS token 分层，合并 --terminal-* 与基础变量的重复语义。
- Button、Panel、SourceBadge、Empty/Error/Loading 状态契约。
- 建立截图基线与 Lighthouse 记录，不能只写“优化完成”。

验收：

- 同一类按钮/面板不再出现随机 radius、颜色和阴影。
- 375/768/1440 视口的截图可对照。
- prefers-reduced-motion、键盘 focus、触摸目标不回归。

### PHASE 2：Hero 动态图片

交付：

- 拆分 ImmersiveHomeHero 为编排层、卡片层、球员氛围层、市场层。
- 保持一个 scroll progress source。
- 卡片为 1x 主体，球员照片低对比、慢速 parallax。
- 首屏只加载真正的 active/lead media；非关键候选延迟加载或在验证后预取。
- 关键图片统一尺寸、比例、来源和 fallback。

验收：

- 卡图始终比球员背景更清晰、更高对比。
- 快速滚动无明显文字重叠。
- reduced-motion 下仍可读、可操作。

### PHASE 3：Card depth / glare / market reveal

交付：

- 仅在桌面指针设备启用 ±3°/±5° 的轻微 tilt。
- Prizm/Silver/Refractor 等卡面只增加低强度 glare，不遮挡 artwork。
- Marketplace/price/alert 只显示真实接入或明确演示状态的数据。
- 一节只保留一个记忆点，不把每个模块都做成动效。

验收：

- 不新增虚构卡面、成交、POP、挂牌或价格。
- mobile 关闭复杂 tilt、强 blur 和大阴影。
- 所有动画可清理，不残留 ScrollTrigger/listener。

### PHASE 4：图片和性能

交付：

- 卡片资源转为合适的 AVIF/WebP 或 Next Image 优化路径；保留原始授权证据。
- 为 thumbnail、card medium、hero 建立尺寸级别。
- 图片使用 width/height 或 aspect-ratio，错误统一 fallback。
- 对 Hero、Player、Market、Auction 记录请求体积和 cache。
- 使用 Lighthouse + 真实设备截图对比。

验收：

- LCP/INP/CLS 按 75 分位目标记录。
- 首屏最大图片不再无理由加载 2–5MB 原图。
- 图片失败不会出现 broken image 或空白布局。

### PHASE 5：全站一致性

覆盖 Homepage、Player、Team、Card Detail、Market、Watchlist、Auction、AI Analysis、Collection：

- 同一语义的来源、快照、演示、错误状态一致。
- 统一标题、数字、按钮、链接和 panel 层级。
- 清理 card-inside-card、无意义圆角矩形和重复 KPI。

### PHASE 6：Mobile / Accessibility / Visual QA

- 375/390/768/1024/1440/1920 视口。
- Chrome、Safari、iPhone Safari、Android Chrome。
- 键盘、屏幕阅读器语义、focus-visible、色彩对比、系统字体放大。
- prefers-reduced-motion、横屏、动态地址栏、网络慢速。
- 最后才进行第二轮视觉修正并提交截图。

## 3. 依赖策略

默认不新增动画库。决策顺序：

1. CSS transform/opacity/clip-path。
2. 当前单一 RAF 进度源，经过性能测量。
3. 如果确实需要复杂 pinned timeline，选择 GSAP 或 Motion 其中一个，不能同时引入。
4. 每个依赖必须记录版本、许可证、包体积和删除/替代理由。

## 4. 数据与图片边界

- 用户提供卡图继续标注“用户提供图片 / 待授权核验”。
- Wikimedia 球员照片保留来源链接和许可信息；外部资源失效时显示球队色 silhouette/fallback。
- 演示价格、热力图、成交数和市场热度必须继续显示演示快照和更新时间。
- 任何动画都不能把演示数据包装成实时行情。

## 5. 本阶段停止点

本轮只完成 PHASE 0 文档，不创建 DESIGN.md，不修改 src/，不添加依赖，不重新设计首页。

下一步需要用户确认：

> 是否按 PHASE 1 先建立 DESIGN.md、统一 tokens，并建立首页 Desktop/Mobile 性能基线？
