# Nucleus Cards · structural UI rebuild

更新时间：2026-09-12

## 发布前置

- GitHub `main`：`3a95df72c8678a0b4d79f40d7b8acd343f004760`
- Vercel 生产地址：[nucleus-cards.vercel.app](https://nucleus-cards.vercel.app/)
- 生产响应：HTTP 200，公开页面内容与该 `main` 的最新首页文案匹配。Vercel 公共响应未暴露可单独核对的 source SHA，因此不虚构生产 SHA。

## 结构变化

| 页面/能力 | 旧入口与结构 | 新入口与结构 | 数据/逻辑 |
| --- | --- | --- | --- |
| 全站 Shell | 顶部导航 + 页面局部导航 | `AppShell`、分组侧栏、Top Bar、全局搜索、移动底栏 | 保留原有路由与 HeaderControls |
| 首页 | Hero 与信息块混排 | 左侧市场叙事、右侧代表卡、Market Movers、Player Spotlight、证据条 | 复用 `cards`、`demoPortfolio`、成交与拍卖数据 |
| 市场 | 以表格为主 | 筛选工具栏 → 卡片画廊 / 表格切换 → 数据口径 | 保留查询、代际、风险、成交、流动性筛选 |
| 卡片详情 | 传统 KPI hero | `CardDetailHero`：卡图、身份、市场参考、趋势、事实条 | 保留成交样本、在售标价、AI、风险与来源 |
| 球员详情 | KPI 面板 | `PlayerProfileHero`：球员身份、研究信号、代表卡 | 保留球员卡列表与终端标签 |
| 收藏/持仓 | 多个嵌套数据面板 | 收藏橱窗与隐私说明；持仓叙事页 + 原有本地编辑器 | 不改本地存储、估值、增删逻辑 |
| 拍卖 | 纵向 feed | 拍卖卡片网格、区域/状态工具栏、热门球员侧栏 | 保留区域、Rookie、Ending Soon、关注 |
| AI 研究 | 仅卡片内局部分析 | 新增 `/analysis` 研究工作台 | 复用 `DeterministicDemoAI`，明确演示边界 |

## 设计验收

- 视觉层使用新的组件级 CSS Modules：shell、card visual、market、auction、analysis、collection、portfolio、home 等，避免继续扩张单一全局样式。
- 卡片图片优先；无授权卡图时显示“未使用虚构卡面”的占位说明，不伪造卡面或成交。
- 首页与详情页文字、研究结论和成交数据分层展示，避免图片遮挡文本。
- Desktop 与 mobile 通过响应式栅格、移动底栏和内容降级保持可用。

## QA 证据

- `pnpm check`：lint、typecheck、Vitest 23/23、生产 build 全部通过。
- `pnpm test:e2e`：桌面 Chromium 与 mobile-chrome 共 2/2 通过；覆盖市场筛选/详情、跨年份新秀、持仓增删、管理台和移动导航。
- 关键页面路由均在生产构建中生成：`/`、`/market`、`/cards/[id]`、`/players/[id]`、`/portfolio`、`/collections/demo`、`/auction-radar`、`/analysis`。
- 当前托管环境的 Chromium 截图进程被系统权限拦截：`MachPortRendezvousServer … KERN_SUCCESS … Permission denied (1100)`。因此没有伪造 PNG；结构 QA 以 DOM/E2E、构建和路由证据为准，获得桌面 Chromium 权限后可直接补生成截图。

## 数据边界

当前项目仍清楚区分演示样本、在售标价、授权成交和待核验来源。未接入授权平台前，任何价格不会被表述为真实实时成交。
