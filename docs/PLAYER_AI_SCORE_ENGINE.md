# Player Investment Intelligence 评分引擎

本引擎先计算规则分数，再允许 AI 解释。任何缺失输入都不会被默认成 0 后伪装成真实结论；输出需同时包含 `value`、`available`、`coverage`、`rationale`。

## 1. 评分输出

```ts
type Score = {
  value: number | null;       // 0—100；无足够数据时为 null
  available: boolean;
  coverage: number;           // 参与计算的权重百分比
  confidence: number;         // 0—100
  rationale: string[];
  updatedAt?: string;
};
```

必需分数：`fundamentalsScore`、`careerLegacyScore`、`playerMomentumScore`、`cardMarketMomentumScore`、`liquidityScore`、`scarcityScore`、`hypeScore`、`riskScore`、`teamSituationScore`、`overallScore`。

## 2. 基础面分数（20%）

优先使用最近 30 日/赛季快照，不能只使用 `Player.points` 等静态演示字段。建议子项：

- 近期表现趋势：25%
- 赛季产出（PPG/RPG/APG）：25%
- 效率（TS%、PER、Usage，缺失则降权）：20%
- 出场与稳定性（GP、分钟）：15%
- 球队角色/核心持球：15%

每个子项先做 percentile 或 z-score 截断到 0—100；只有可用子项重新归一化权重，并降低 coverage/confidence。

## 3. 生涯/收藏基础分（15%）

按 `PlayerCohort` 使用不同逻辑：

| 阶段 | 主要输入 |
|---|---|
| `core_rookie` / `recent_rookie` | 年龄、选秀预期、球队地位、上场时间、奖项潜力、RC 生态 |
| `young_core` / `prime` | 全明星/All-NBA、季后赛曝光、冠军概率、持续产出、全球需求 |
| `veteran` / `retired_legend` | 历史荣誉、冠军/MVP、名人堂概率、经典卡稀缺和收藏共识 |

不得用“退役传奇 = 高分”硬编码；每项需有来源或标记为 unavailable。

## 4. 球员动量分（15%）

`PlayerMomentumScore` 0—100：

```text
momentum =
  30% recentPerformanceTrend
+ 20% minutesAndUsageChange
+ 15% teamResultsTrend
+ 15% mediaAttention (only if sourced)
+ 10% playoffExposure
+ 10% awardTrajectory
```

窗口优先级：最近 5 场、最近 10 场、最近 30 天、本赛季、上赛季。输出必须解释“相对什么基准发生了什么变化”，不能只显示 Strong。

## 5. 卡市动量分（15%）

按卡种先分组，再汇总球员：

```text
cardMarketMomentum =
  35% change30d
+ 25% change90d
+ 20% saleCountTrend
+ 10% listingDemandProxy
+ 10% priceStability
```

只有 `verified=true`、非 bundle、非 outlier 的成交进入价格趋势；仅有挂牌时输出 `listing-only`，不生成成交动量。

## 6. 流动性分（10%）

复用 `liquidityScore` 的思路并扩展：

```text
liquidity =
  35% normalized sales30d
+ 20% normalized sales90d
+ 15% recency of last verified sale
+ 15% listing depth / marketplace coverage
+ 15% inverse bid-ask spread
```

成交不足、只有一个市场或价差缺失时降低 coverage。低流动性必须在结果中提示“价格可能看起来很高，但出售需要更长时间”。

## 7. 稀缺分（10%）

```text
scarcity =
  35% inverse population (only when population is sourced)
+ 25% serial scarcity (/99, /25, /10, 1/1)
+ 20% parallel/card-tier demand
+ 20% image/identity match confidence
```

`population`、`printRun` 缺失不能猜；缺失时该子项为 unavailable，不能用“低 POP”文案。

## 8. 催化剂分（10%）

催化剂按 `eventType`、时间窗、影响方向和来源置信度计算：

- Awards：MVP、All-NBA、All-Star、DPOY、ROY
- Playoffs：play-in、季后赛、分区决赛、总决赛
- Milestones：里程碑得分、纪录、三双纪录
- Career：续约、交易、自由球员、退役、名人堂
- Media：纪录片、签名鞋、重大公开活动

若事件概率不是外部事实，字段必须叫 `aiEstimate`，同时输出 `probabilityBasis`。没有事件来源时催化剂分为 null/低 coverage，不填乐观默认值。

## 9. 风险分与扣分（-5% 至 -20%）

风险类型：`INJURY_RISK`、`OVERVALUATION_RISK`、`HIGH_POPULATION`、`LOW_LIQUIDITY`、`HYPE_DEPENDENCE`、`AGE_RISK`、`TEAM_CHANGE_RISK`、`MARKET_VOLATILITY`、`SHORT_TERM_SPECULATION`、`CARD_OVERSUPPLY`。

风险扣分不是单一“高/中/低”映射，建议：

```text
riskPenalty = min(20,
  injuryImpact
+ valuationImpact
+ liquidityImpact
+ volatilityImpact
+ supplyImpact
+ teamChangeImpact)
```

每个风险必须有 `level`、`impactDirection`、`triggerBasis`、`sourceId`、`confidence`。伤病只引用公开体育信息，不作医学诊断。

## 10. 综合分

```text
overallRaw =
  0.20 * fundamentals
+ 0.15 * careerLegacy
+ 0.15 * playerMomentum
+ 0.15 * cardMarketMomentum
+ 0.10 * liquidity
+ 0.10 * scarcity
+ 0.10 * catalysts
+ 0.05 * teamSituation
- riskPenalty
```

对不可用分数重新归一化已使用权重，同时输出 `coverage`. 若有效权重低于 55%，`overallScore=null`，只给数据缺口和观察项，不能生成方向性投资结论。

## 11. 短期与长期

### 短期（1—3 个月）

输入：最近表现、比赛/季后赛曝光、奖项、新闻、伤病、7/30/90D 卡市动量、Hype、Liquidity、近期催化剂。输出枚举：`BULLISH`、`MODERATELY_BULLISH`、`NEUTRAL`、`CAUTIOUS`、`HIGH_RISK`。

### 长期（12—36 个月）

输入：年龄、职业轨迹、Legacy、冠军/奖项潜力、名人堂概率、全球收藏需求、RC 质量、稀缺和人口。输出枚举：`STRONG`、`POSITIVE`、`NEUTRAL`、`SPECULATIVE`、`HIGH_RISK`。

不得合并为单一 BUY/SELL；不得出现 guaranteed、must buy、必涨等文案。

## 12. Cards To Watch 选择

先按球员卡分层，再每层最多选 1—2 张，合计 3—5 张：

1. 核心 RC/旗舰卡（流动性优先）
2. Silver/Refractor/高共识平行
3. Auto/RPA（高风险、高上行）
4. Low-numbered/SSP（稀缺优先）
5. Entry-level（真实成交样本足够时）

候选排序：身份匹配 → 成交样本 → 流动性 → 价格趋势 → 稀缺 → 置信度。没有真实近期成交，不生成买入价或 Buy Zone。

## 13. 置信度

```text
confidence =
  25% sportsDataFreshness
+ 15% newsFreshness
+ 25% verifiedSaleCount
+ 15% cardMatchConfidence
+ 10% marketplaceCoverage
+ 10% populationLiquidityCoverage
```

所有组件必须可解释；任何一项 stale/缺失都应降低对应权重。最终输出 `confidenceScore` 和分项 breakdown，而不是只给一个黑盒数字。
