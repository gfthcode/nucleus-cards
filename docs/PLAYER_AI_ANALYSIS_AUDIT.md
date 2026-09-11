# Player Investment Intelligence 审计

审计日期：2026-09-11  
审计范围：`src/app`、`src/components`、`src/lib`、`src/types`、`supabase/migrations`、现有测试与环境变量。  
本轮结论：只完成架构与数据审计，不修改页面 UI、不接入未授权来源、不把演示数据标记为真实数据。

## 1. 当前可复用能力

### 球员与球队

- `src/types/domain.ts` 的 `Player` 已包含姓名、中英文名、位置、选秀年份/顺位、当前球队、前球队、年龄、分钟、得分、篮板、助攻、市场热度、代际、伤病状态、风险等级和演示标记。
- `Team`、`PlayerTeamMembership`、`RosterType`、`MembershipVerification` 已支持当前阵容与历史关系分离。
- `src/lib/roster-sync.ts` 已有 NBA.com 公开号单快照与 Sportradar 适配路径；无授权凭据时安全回退到演示 Membership。
- 球员详情页是 `src/app/players/[id]/page.tsx`，球队阵容页是 `src/app/teams/[slug]/page.tsx`。

### 卡片与市场

- `Card` 已覆盖品牌、系列、发行年、卡号、RC、平行、限编、签字、物料、裸卡/评级、最新成交、挂牌、7/30/90/1 年变化、30 日成交量、流动性、风险、匹配置信度和数据完整度。
- `Sale` 已区分来源、成交时间、原币种、换算 CNY、已核验、社区提交、组合包和异常值。
- `Listing`、`AuctionEvent`、`CardImageRecord` 已有领域类型；`card.identityKey` 为稳定匹配键。
- `src/lib/market-math.ts` 已有中位数、成交加权参考、异常值、流动性评分和市场参考区间。
- `src/lib/team-market.ts` 已有球员卡覆盖、Card Heat、30D 成交和队内热门卡排序。
- `src/lib/card-images.ts` 已明确区分用户提供图片、占位图、授权状态和匹配置信度。

### AI 与服务入口

- `src/lib/ai-analysis.ts` 只有 `DeterministicDemoAI`，输入是一张卡 + 一个球员 + 7—30 日周期，输出价格动量概率、因素、置信度、证据和免责声明。
- `src/app/api/ai/[cardId]/route.ts` 是卡片级 GET 接口，带内存限流；它不是球员级检索服务，也没有新闻、比赛、供应量和缓存编排。
- AI 输出通过 Zod `aiAnalysisSchema` 校验，但 schema 仍是卡片短周期分析，不能表达长期观点、催化剂、情景、卡片推荐层级或逐字段时效。

### 数据库与账户

- `supabase/migrations/0001_initial.sql` 已有：`players`、`player_game_stats`、`injury_events`、`player_news_events`、`card_variants`、`graded_cards`、`listings`、`sales`、`price_snapshots`、`market_metrics`、`liquidity_metrics`、`risk_signals`、`ai_analyses`、`watchlists`、`watchlist_items`、`alert_rules`、`review_queue`、`audit_logs`。
- `ai_analyses` 目前用 `payload jsonb`，同时支持 `player_id` 或 `card_variant_id`，可以作为结果缓存的底层表，但需要增加分析版本、输入快照哈希和状态约束。
- Supabase 浏览器客户端与 RLS 边界已存在；当前作品集和提醒主要使用 localStorage 演示，不等于生产持久化。

## 2. 数据真实性分层

| 数据 | 当前状态 | 是否可用于真实投资分析 |
|---|---|---|
| 本地 `demo-data.ts` 球员/卡片/成交 | 演示快照 | 否；只能标记 `demo` 并降低置信度 |
| `nba-official-roster.json` 与 NBA.com 阵容快照 | 官方公开阵容 | 可用于阵容身份，需记录快照时间 |
| Sportradar | 代码路径已存在，需密钥和许可 | 可用于授权体育数据，服务器端读取 |
| `player_game_stats` | 数据表已设计，当前未接生产写入 | 有授权同步后可用 |
| `injury_events` / `player_news_events` | 表已设计，当前未接生产写入 | 有来源 URL、时间和授权后可用 |
| eBay Browse | 适配器占位 | 只能查授权在售；不能直接宣称历史成交 |
| 卡淘/闲鱼/Carousell | 未授权、未自动采集 | 只能人工 CSV/授权导入并进入审核 |
| `sales` / `price_snapshots` | schema 完整，默认数据是演示 | 只有 `verified` 且有来源证据才可进入真实口径 |
| `graded_cards.population` | schema 有字段，当前 demo 卡片无完整 POP | 缺失时显示 `Data unavailable` |
| 卡图 | 有用户提供图片及未知许可状态 | 可展示但必须标记来源和授权待核验 |

## 3. 当前缺口

1. 没有 `PlayerInvestmentAnalysisService`，无法编排球员基本面、新闻、伤病、球队环境和卡市数据。
2. `Player` 没有 TS 层面的比赛窗口统计、TS%、PER、Usage、球队战绩或季后赛概率字段；必须从新标准化快照读取，不能从 `Player` 静态字段推断。
3. 新闻、伤病和比赛表虽在 SQL 中存在，但没有生产 Adapter、同步任务、来源健康检查或 freshness 规则。
4. `Card` 没有 `population`、`serialNumber`、`cardTier`、买卖价差、近 90 日挂牌和 marketplace coverage 等分析所需字段。
5. `ai_analyses.payload` 缺少输入数据版本、来源清单、逐字段更新时间、失效原因和 fallback 状态；无法可靠复现一份报告。
6. 没有球员级 API、缓存、并发去重、刷新限额和后台任务；现有内存限流在多实例部署中不共享。
7. `PlayerTerminalTabs`、球队阵容、行情结果、拍卖雷达、首页榜单和提醒没有统一的球员 AI 入口组件。
8. Watchlist 当前以卡片为中心，部分 UI 使用 localStorage；“AI 推荐卡 → watchlist → price alert”尚未形成生产闭环。

## 4. 推荐目标架构

```text
PlayerAIAnalysisButton
          │ GET/POST
          ▼
PlayerInvestmentAnalysisService (server only)
  ├─ Player retrieval / identity
  ├─ Sports retrieval adapter
  ├─ News + injury retrieval adapter
  ├─ Card catalog / sales / listings retrieval
  ├─ Supply + population retrieval
  ├─ Normalization + evidence ledger
  ├─ Quantitative score engine
  ├─ Rule-based thesis inputs
  ├─ Optional server-side AI provider
  └─ Zod output validator + cache writer
          │
          ├─ Supabase `ai_analyses` / `player_ai_inputs`
          └─ JSON response: report + sources + freshness + confidence
```

硬约束：检索和量化评分必须在 AI 解读前完成；没有真实数据的字段输出 `unavailable`，不得由模型补齐数字。AI 只能解释已计算的输入和规则结论。

## 5. 推荐新增接口与表

接口详见 `PLAYER_AI_API_SPEC.md`：

- `GET /api/players/:id/investment-analysis`
- `POST /api/players/:id/investment-analysis/refresh`
- `GET /api/players/:id/cards-to-watch`

建议新增/扩展：

- `player_performance_snapshots`：窗口化基础面与来源时间。
- `player_catalysts`：事件、时间窗、证据、影响方向、概率是否为 AI 估计。
- `player_ai_inputs`：一次分析使用的输入快照、source IDs、freshness、coverage 和哈希。
- 扩展 `ai_analyses`：`analysis_version`、`input_snapshot_hash`、`status`、`source_summary`、`confidence_breakdown`、`generated_at`、`expires_at`。
- 扩展 `card_variants/graded_cards/market_metrics/liquidity_metrics`：人口、买卖价差、卡层、价格波动和供应证据。

## 6. 风险与验收门槛

- **来源/版权**：新闻、图片、卡淘/闲鱼数据必须先有 API、CSV 或商业授权；不得抓取登录后页面、验证码页面或绕过限制。
- **历史成交误读**：在售挂牌不能进入历史成交、收益或买入价建议。
- **模型幻觉**：AI 输出必须引用输入快照；缺失值只能 `unavailable`，概率必须标记 `AI estimate`。
- **陈旧数据**：体育数据 >24h、新闻 >48h、价格 >24h、人口 >24h 必须显示 `STALE`。
- **多实例限流**：生产限流和缓存不能只依赖进程内 Map，应使用 Supabase/Redis/平台 KV。
- **用户隐私**：分析接口不读取或暴露用户持仓成本；watchlist/alert 必须经过 session 与 RLS。

第一阶段完成标准：5 份规格文档通过审阅，接口契约、数据字典、评分公式、UI 状态和来源边界一致；本轮不新增按钮、不修改现有页面。
