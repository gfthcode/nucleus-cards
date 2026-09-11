# Player Investment Intelligence 数据源规格

## 1. 数据源分层原则

所有输入先进入 `Retrieval → Normalization → Evidence Ledger`，再进入评分和 AI 解读。每条数据必须带：

- `sourceId`、来源名称、来源区域、授权状态
- `sourceUrl` 或外部记录 ID
- `retrievedAt`、`sourceUpdatedAt`、`freshnessState`
- 原始值与标准化值
- `confidence`、`missingReason`、`isDemo`

`isDemo=true`、无来源 URL、无外部 ID 的记录不能单独支撑“真实成交”“最新伤病”或精确价格结论。

## 2. 来源矩阵

| 数据域 | 首选来源 | 当前代码状态 | 允许用途 | 最低证据 |
|---|---|---|---|---|
| 球员身份/阵容 | NBA.com 公开阵容快照；授权 Sportradar | `roster-sync.ts` 已有路径 | 球员、球队、阵容关系 | 公开 URL + 快照时间或 API 响应 |
| 比赛与赛季统计 | 授权 NBA 数据供应商/Sportradar | 未完成 Adapter | PPG/RPG/APG、分钟、Usage、窗口趋势 | API 许可 + 统计窗口 |
| 伤病 | 授权体育源、球队/联盟公开伤病报告 | SQL 表已设计，未同步 | Injury Risk 事实输入 | 来源 URL、发生/更新时间、非医学解释 |
| 新闻/事件 | 许可新闻 API 或允许再展示的 RSS | SQL 表已设计，未同步 | 交易、合同、奖项、媒体事件 | 标题、摘要、来源、发布时间、URL |
| 卡目录 | 许可 checklist/catalog 或人工审核 CSV | `Card`/`card_variants` 已有 | 卡身份、RC、平行、卡层 | checklist URL/导入批次/匹配证据 |
| 历史成交 | 官方历史成交 API、许可 CSV、审核导入 | `verified-sales` 仅入队 | 中位价、成交量、波动、comps | `source_sale_id` + 原始 URL + 证据快照 |
| 在售挂牌 | eBay Browse 等官方 API | eBay 为占位 | 当前挂牌、供给、买卖价差 | listing ID + API 授权 + 抓取时间 |
| 卡 POP/供应 | PSA/BGS 等许可 population 或卡厂数据 | schema 有字段，未同步 | Scarcity、Population、Print Run | 报告时间、评级公司、卡身份 |
| 卡图 | 用户上传、获授权 catalog/marketplace | 现有 `CardImageRecord` | 可视化，不自动证明成交 | source URL、rights status、match confidence |
| 汇率 | 许可汇率源 | 现有 `exchange_rates` 表 | 交易时点换算 | rate timestamp + source ID |

## 3. 适配器契约

沿用 `MarketplaceAdapter`，为球员分析新增只读接口，建议拆分为以下能力，避免一个适配器拥有不真实的万能权限：

```ts
interface SportsDataAdapter {
  getPlayerProfile(playerId: string): Promise<SourceEnvelope<PlayerProfile>>;
  getPerformance(playerId: string, window: StatWindow): Promise<SourceEnvelope<PerformanceSnapshot>>;
  getTeamContext(teamId: string): Promise<SourceEnvelope<TeamContext>>;
  getInjuries(playerId: string, since: string): Promise<SourceEnvelope<InjuryEvent[]>>;
}

interface NewsDataAdapter {
  searchPlayerEvents(playerId: string, window: NewsWindow): Promise<SourceEnvelope<NewsEvent[]>>;
}

interface CardMarketAdapter {
  getCardsToWatch(playerId: string): Promise<SourceEnvelope<CardMarketRecord[]>>;
  getSales(cardIds: string[], window: PriceWindow): Promise<SourceEnvelope<Sale[]>>;
  getListings(cardIds: string[], window: PriceWindow): Promise<SourceEnvelope<Listing[]>>;
  getSupply(cardIds: string[]): Promise<SourceEnvelope<SupplyRecord[]>>;
}
```

`SourceEnvelope<T>` 必须带 `source`, `authorization`, `retrievedAt`, `sourceUpdatedAt`, `freshness`, `records`, `warnings`，并允许 `status: unavailable | partial | available`。

## 4. 标准化字段

### 球员表现

`playerId`, `season`, `window` (`last5`, `last10`, `last30d`, `season`, `priorSeason`), `gamesPlayed`, `minutes`, `points`, `rebounds`, `assists`, `tsPct`, `per`, `usagePct`, `teamWinPct`, `playoffProbability`。未提供的指标必须为 `null` 并保留 `missingReason`。

### 新闻/伤病

`eventId`, `playerId`, `eventType`, `headline`, `summary`, `occurredAt`, `sourceUrl`, `sourceId`, `impactDirection`, `confidence`, `freshness`。`injuryType`、预计缺席时间和复发字段只在来源明确给出时保存。

### 球星卡市场

`cardId`, `identityKey`, `tier`, `isRookie`, `rookieSubtype`, `gradingCompany`, `grade`, `population`, `printRun`, `lastSale`, `median30d`, `median90d`, `change7d`, `change30d`, `change90d`, `saleCount30d`, `saleCount90d`, `listingCount`, `bidCount`, `spread`, `liquidity`, `sourceCoverage`, `confidence`。

推荐 `tier` 枚举：`flagship_base`, `flagship_parallel`, `rookie_parallel`, `rookie_auto`, `rpa`, `numbered`, `insert`, `vintage_legacy`, `other`。

## 5. Freshness 与缓存

| 输入 | 目标 TTL | stale 阈值 | 失败策略 |
|---|---:|---:|---|
| 球员身份/阵容 | 6—24h | 48h | 使用最近成功快照并标 stale |
| 比赛统计 | 15—60min | 24h | 保留旧窗口，禁止称实时 |
| 新闻/事件 | 30—60min | 48h | 显示 news unavailable/partial |
| 伤病 | 15—60min | 48h | 不做医学推断，显示最后更新时间 |
| 历史成交/挂牌 | 5—30min | 24h | 可读缓存但降低 confidence |
| Population/print run | 24h | 72h | 缺失不填估计值 |
| AI 报告 | 30—60min | 过期后按需重算 | stale 报告必须显式提示 |

缓存键建议：`player-ai:v{analysisVersion}:{playerId}:{window}:{inputSnapshotHash}`。同一球员并发刷新使用 single-flight，避免重复调用来源和模型。

## 6. 授权与可展示边界

- eBay Browse 可支持在售检索，但不等价于已完成成交；历史成交必须使用明确授权的历史成交能力或审核 CSV。
- 卡淘、闲鱼、Carousell、Goldin、Heritage 等未授权时只保留 `adapter-only`，不能自动采集、不能把搜索页价格写成成交。
- 图片的 `licenseStatus=unknown` 只能显示“来源/授权待核验”，不能显示“官方卡图”。
- 数据源 API Key 只在 Route Handler/后台任务读取，不使用 `NEXT_PUBLIC_*`。
- 每次分析的 `sources` 只列实际被使用的来源，不列“配置了但没有返回记录”的来源。

## 7. 完整链路

```text
source response
  → schema validation
  → identity matching (player/card identityKey)
  → dedupe + unit/currency normalization
  → evidence ledger + freshness
  → score engine
  → AI interpretation (optional)
  → persisted report + source summary
```
