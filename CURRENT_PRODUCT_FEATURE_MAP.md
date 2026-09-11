# Current Product Feature Map

| 功能 | 入口 | 路由/组件 | 数据与逻辑 |
|---|---|---|---|
| 首页市场总览 | 首页 | `/`, `ImmersiveHomeHero` | demo cards, market math |
| 全局搜索 | 顶部搜索框 | `layout.tsx` | 页面级导航入口 |
| 市场搜索/筛选/排序 | 市场 | `/market`, `MarketExplorer` | card/player/team rows, filters |
| 卡片详情 | 市场卡片 | `/cards/[id]` | card identity, sales, AI |
| 球员档案/分析 | 球员入口 | `/players/[id]` | player stats, market, AI |
| 球队列表/详情 | 球队与球员 | `/teams`, `/teams/[slug]` | roster, team cards |
| 拍卖雷达 | 主导航 | `/auction-radar` | auction rows, watch state |
| 新秀比较 | 新秀 | `/rookies/[year]` | cohorts, comparison |
| 持仓/收藏 | 持仓 | `/portfolio`, `/collections/demo` | holdings, collection views |
| 风险提醒/价格提醒 | 风险提醒 | `/alerts` | alert manager |
| 数据方法与反馈 | 数据方法 | `/methodology` | provenance, confidence rules |
| 管理/导入 | 管理后台 | `/admin` | CSV importer, admin modules |
| 登录/偏好 | 我的 | `/login`, `/settings` | privacy/settings |
| 状态页 | 全局 | `loading.tsx`, `error.tsx`, `not-found.tsx` | loading/error/empty states |

## 保护规则

所有上述入口、路由、数据结构和业务逻辑必须保留；本阶段只改变共享视觉系统和应用壳层。
