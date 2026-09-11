# 首页 UI / Motion / Image / Performance 审计

审计日期：2026-09-11

范围：src/app/page.tsx、src/components/immersive-home-hero.tsx、src/components/card-image.tsx、src/components/card-visual.tsx、src/lib/card-images.ts、src/app/globals.css、src/app/layout.tsx、next.config.ts、public/、package.json。

本轮只做 PHASE 0 审计，不修改业务代码，不新增动画依赖，不伪造图片或市场数据。

## 1. 现有技术栈

- Next.js 16.3.3 App Router，React 19.2.8，TypeScript。
- Tailwind CSS 4 仅通过 PostCSS 引入；大部分视觉规则仍集中在 src/app/globals.css。
- 未安装 Framer Motion、Motion、GSAP、React Spring 或 Anime.js。
- 图标使用 lucide-react。
- 首页为服务端 src/app/page.tsx + 客户端 ImmersiveHomeHero。
- 站点目前部署于 Vercel，首页可公开访问；数据状态明确标为演示快照。

## 2. Existing UI

首页当前结构：

1. ImmersiveHomeHero 沉浸式首屏。
2. Market Overview 标题与快照状态。
3. Collector Intelligence 说明。
4. Quick Start。
5. 今日市场概览。
6. 热力图、成交活跃榜、涨幅榜、跌幅榜。
7. 风险提醒入口。

优点：

- 产品主线已经从普通 dashboard 转向“身份 → 成交 → 挂牌 → 风险”。
- 站内演示数据、来源、快照时间和非投资建议文案可见。
- 首页首屏已经有真实用户提供的卡图和 Wikimedia 球员赛场图链接。
- 桌面与移动端已有不同 CSS 断点。

问题：

- ImmersiveHomeHero 中卡片、球员照片、市场面板和文字都由一个组件管理，后续扩展场景会继续变重。
- 首页下方仍有较多同质化数据面板，首屏结束后视觉层级突然转为密集终端表格。
- Hero 的 CTA、卡片身份、市场参考和滚动提示在小屏容易争夺注意力。
- 首页卡片序列只显示名称标签，键盘和触摸用户没有明确的跳转/选择行为。

## 3. Existing Motion

当前实现：

- 通过 requestAnimationFrame + passive scroll listener 计算 progress。
- 每次 progress 更新会触发 React state 更新，进而重渲染整个 Hero。
- 文字场景通过内联 opacity 与 translate3d 切换。
- 卡片通过 translate3d 与 scale 做轻微滚动位移。
- CSS 使用 transition、prefers-reduced-motion 和媒体查询。
- 尚未使用 sticky timeline 库或 Motion Value。

风险：

- 单个 progress state 会导致整个 Hero 子树重渲染；在低端手机上需要测量，而不是凭感觉宣称流畅。
- sceneOpacity 在场景边界同时控制多个层，快速滚动时可能出现文字重叠或场景跳变。
- Hero 使用 height: 360vh / 移动端 290vh 的固定比例，尚未按真实内容高度和输入设备校准。
- transition: height、大面积 filter: blur、复杂阴影和多个 radial gradient 可能增加合成成本。
- 页面有 html scroll-behavior: smooth，与 scroll-linked choreography 组合时需要验证键盘跳转和 reduced-motion 行为。

已有正向约束：

- 已支持 prefers-reduced-motion，并在 reduced motion 下缩短/关闭滚动位移。
- 主要移动属性是 transform 和 opacity，方向正确。
- 未引入滚动劫持库。

## 4. Existing Image System

- 卡片图片统一经过 getCardImage()、CardImage 和 CardVisual。
- 图片状态有用户提供图片、占位图、来源名称、待授权提示和匹配置信度边界。
- 首页球员照片在 page.tsx 的 heroPhotos 中以外部 Wikimedia URL 配置。
- Hero 球员照片使用原生 img，没有 next/image 的尺寸、响应式 srcset 或统一错误状态。
- 卡片图片组件使用原生 img，卡片图尺寸通过 CSS 控制。
- next.config.ts 没有 images.remotePatterns、质量白名单或自定义 loader。
- 本地卡图为 PNG：Wembanyama 652×944 约 772 KB；SGA 818×976 约 772 KB；Jalen Williams 790×964 约 772 KB；App icon 1254×1254 约 944 KB。
- 当前没有 AVIF/WebP 版本，没有 blur placeholder 数据，也没有明确的 thumbnail/hero 资源层级。

关键问题：

- 约 772 KB 的 PNG 卡图作为多场景 Hero 资源偏大，且透明/大图可能造成首屏带宽压力。
- 外部球员照片没有统一的超时、错误、fallback 或版权/来源显示组件。
- loading=eager 只写在当前活动球员图上，但四个外部候选 URL 的预加载策略没有经过测量。
- 图片虽有 CSS aspect-ratio，但部分路径仍依赖内容加载后计算，需检查 CLS。

## 5. Design tokens 与字体

- 已有基础变量：--bg、--panel、--line、--text、--muted、--blue、--green、--red 等。
- 后半段 CSS 还存在 --terminal-* 系列变量，命名和层级未统一。
- 大量局部 magic hex、独立 radius、阴影和字体声明分散在同一文件。
- 当前 body 使用 Inter 优先；项目尚无 DESIGN.md 或单一字体决策文档。
- 数据数字已有等宽/等数字风格的局部设置，但没有全局 numeric token。

设计风险：

- 未来 AI 修改容易继续增加新的蓝色、圆角和 panel 变体。
- brand-mark、terminal panel、hero card frame、market panel 各自有半径和边框规则。
- 视觉方向已经接近深色收藏品终端，但需要通过 token 固化“专业、克制、可核验”，避免向 crypto/casino/glassmorphism 漂移。

## 6. Responsive / Mobile

已有：

- 移动端降低 Hero 尺寸、轨道、层级和 metric grid。
- 有底部 MobileNavigation。
- 交互元素多使用 link/button，存在 focus-visible 基础规则。

待验证：

- 375px 宽度下球员图、卡片、CTA 和来源条的碰撞。
- 竖屏 Safari 的 100vh / sticky 场景；当前 Hero 使用 100vh，需迁移评估为 100dvh。
- 横屏、动态地址栏、系统字体放大、触摸目标是否至少 44×44 px。
- reduced-motion 下滚动后是否仍能看到完整的市场参考和 CTA。

## 7. Performance baseline

本轮没有运行 Lighthouse 或真实用户监测，因此以下指标均为“未测量”，不能宣称已达标：

| 指标 | 目标 | 当前状态 |
|---|---:|---|
| LCP | ≤ 2.5 s | 未测量 |
| INP | ≤ 200 ms | 未测量 |
| CLS | ≤ 0.1 | 未测量 |
| Hero 图片总 payload | 优先 < 1 MB | 现有 PNG 约 772 KB/张，需按实际请求测量 |
| 首屏 JS | 尽量小 | 未测量 |

目标参考：[web.dev Core Web Vitals](https://web.dev/articles/vitals?hl=en)。

## 8. 可复用组件

- ImmersiveHomeHero：保留为场景编排层，后续拆出 HeroScene、HeroCardStage、HeroPlayerAtmosphere、HeroMarketPanel。
- CardImage：保留为卡图语义和来源边界组件，补充统一 loading/error/fallback 和尺寸契约。
- CardVisual：保留给卡片详情/收藏场景，不与 Hero 的视觉状态耦合。
- DataTrustBar / DataProvenance：继续作为任何市场/AI 结果的来源与快照提示。
- PriceChart、MarketExplorer：复用数据展示，不复制新的价格 card 样式。

## 9. 建议变更优先级

### P0：先测量与固化边界

1. 为 375/768/1024/1440/1920 宽度建立截图基线。
2. 记录 Hero 的 LCP 元素、请求大小、CLS 和滚动长任务。
3. 明确首屏唯一主角是卡图，球员照片作为低对比氛围层。

### P1：资源和结构

1. 将 Hero 关键图片迁移到统一 next/image 方案或经过审核的等价资源管线。
2. 建立 ImageSource / ImageState / ImageSize 约定。
3. 拆分 Hero 子组件，但只保留一个滚动进度源。
4. 固化 DESIGN.md 和 CSS token 层级。

### P2：Motion

1. 先用 CSS + 当前 RAF 方案完成最小修正并测量。
2. 只有当 pinned timeline、scrub、resize cleanup 需要时，才评估 GSAP ScrollTrigger。
3. 不在同一元素上混用 GSAP、Motion 和本地 state。

### P3：全站一致性

1. 统一 Button、radius、panel、source badge、empty/error/loading。
2. 再扩展 Player、Team、Card Detail、Market、Auction、Watchlist。

## 10. 审计结论

当前首页已经具备“收藏品数据终端 + 沉浸式导览”的可用基线，不需要推倒重写。最重要的短板不是再增加动画，而是：

- 图片管线没有响应式尺寸、压缩和错误闭环；
- Hero 进度更新与场景渲染耦合；
- token 和字体约束不完整；
- Lighthouse/真实设备基线缺失；
- 需要把“真实卡图/授权状态/演示数据”继续作为视觉层的一部分。

本轮不进入实现，等待确认后从 DESIGN.md、资源契约和测量基线开始。
