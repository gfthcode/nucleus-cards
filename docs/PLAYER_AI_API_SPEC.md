# Player Investment Intelligence API 规格

本规格只定义第一版接口，不在本轮实现。所有接口均为服务器端编排，浏览器不得直接携带体育、新闻、市场或 LLM API Key。

## 1. 通用响应

```ts
type SourceRef = {
  id: string;
  name: string;
  type: "sports" | "news" | "marketplace" | "catalog" | "population" | "internal";
  authorization: "licensed" | "official-api" | "official-web" | "community" | "demo" | "adapter-only";
  url?: string;
  retrievedAt: string;
  sourceUpdatedAt?: string;
  freshness: "fresh" | "stale" | "unavailable";
};

type AnalysisEnvelope<T> = {
  data: T;
  meta: {
    playerId: string;
    generatedAt: string;
    expiresAt: string;
    analysisVersion: string;
    inputSnapshotHash: string;
    mode: "licensed" | "partial" | "demo";
    confidenceScore: number | null;
    sources: SourceRef[];
    warnings: string[];
  };
};
```

## 2. `GET /api/players/:id/investment-analysis`

### Query

- `window=1-3m|12-36m|both`，默认 `both`
- `refresh=false|true`，默认 `false`；普通 GET 不绕过缓存
- `includeCards=true|false`，默认 `true`

### 行为

1. 读取当前球员身份与最新可用输入快照。
2. 查找未过期的 `ai_analyses`（按 `playerId + window + analysisVersion + inputSnapshotHash`）。
3. 命中缓存直接返回；未命中时触发服务端 retrieval + score + interpretation。
4. 来源部分失败时返回 `mode=partial`、warnings 和可用维度；不补假数字。

### 200 示例形状

```json
{
  "data": {
    "player": {"id":"p-wemby","name":"Victor Wembanyama","team":"San Antonio Spurs"},
    "overall": {"score": 84, "outlook": "WATCH", "confidence": 77},
    "shortTerm": {
      "period": "1–3 months",
      "score": 81,
      "outlook": "MODERATELY_BULLISH",
      "thesis": "近期表现和季后赛曝光支持需求，但旗舰卡供应仍需观察。",
      "catalysts": [],
      "risks": []
    },
    "longTerm": {
      "period": "12–36 months",
      "score": 88,
      "outlook": "POSITIVE",
      "thesis": "长期价值更依赖职业轨迹和稀缺新秀平行，而不是高人口 Base。"
    },
    "scoreBreakdown": {},
    "cardsToWatch": [],
    "sources": [],
    "disclaimer": "本分析基于公开体育信息及收藏品市场数据，仅供研究和收藏决策参考，不构成收益保证。"
  },
  "meta": {}
}
```

### 状态码

- `200`：完整或部分可用报告。
- `202`：来源正在刷新，返回最近缓存（如果有）和 `status=refreshing`。
- `404`：球员不存在。
- `429`：达到刷新/读取限额，带 `Retry-After`。
- `503`：没有任何可用输入，返回明确 `data_unavailable`，不能返回伪造观点。

## 3. `POST /api/players/:id/investment-analysis/refresh`

### 请求

```json
{
  "windows": ["1-3m", "12-36m"],
  "force": false,
  "reason": "user_requested"
}
```

### 规则

- 需要登录用户或受限匿名额度；生产使用 Supabase session 与审计日志。
- `force=true` 不能绕过来源授权、缓存最小 TTL 或平台限额。
- 同一 `playerId + window` 通过 distributed lock single-flight；已有任务返回同一 `jobId`。

### 202 示例

```json
{
  "jobId": "player-ai-uuid",
  "status": "queued",
  "playerId": "p-wemby",
  "pollUrl": "/api/players/p-wemby/investment-analysis"
}
```

## 4. `GET /api/players/:id/cards-to-watch`

### Query

- `limit`：1—5，默认 5
- `tier`：可选 `flagship_base|rookie_parallel|rookie_auto|rpa|numbered|other`
- `includeUnavailable=false|true`：默认 false

只返回经过身份匹配且有足够证据的候选。每张卡返回：`cardIdentity`、`tier`、`isRookie`、`grade`、`currentMarketRange`、`lastSale`、`change30d`、`change90d`、`liquidity`、`population`、`risk`、`confidence`、`whyWatch`、`sourceRefs`。没有真实成交时 `lastSale=null`，不返回合理买入价。

## 5. 内部服务接口

```ts
interface PlayerInvestmentAnalysisService {
  get(playerId: string, options: AnalysisOptions): Promise<AnalysisEnvelope<InvestmentReport>>;
  refresh(playerId: string, options: RefreshOptions): Promise<{ jobId: string; status: string }>;
  getCardsToWatch(playerId: string, options: CardsToWatchOptions): Promise<AnalysisEnvelope<CardWatchItem[]>>;
}
```

执行顺序固定：`retrieve → normalize → evidence ledger → quantitative score → optional AI interpretation → validate → persist`。LLM Provider 只能接收标准化证据与分数，不能自行联网补数据。

## 6. 缓存与错误

- 读取缓存 TTL 30—60 分钟；输入快照按来源各自 TTL。
- 生产缓存放 Supabase/Redis/KV，不使用单进程 Map 作为唯一缓存。
- `news_unavailable` 不阻断体育 + 卡市分析；`card_market_unavailable` 时禁止价格建议；`sports_unavailable` 时禁止表现动量结论。
- 每个 error 都返回 `code`、`message`、`retryable`、`affectedDimensions`，不把上游原始密钥或内部堆栈返回浏览器。

## 7. 安全

- 服务器端读取 `SPORTRADAR_API_KEY`、eBay、新闻和 LLM 凭据。
- 输入的 `playerId`、query、limit 用 Zod 校验；对 refresh 使用用户/IP/球员维度限流。
- 报告只读取公开球员/市场数据，不默认读取用户私有持仓；watchlist/alert 写入必须有 session 与 RLS。
- 写入 `ai_analyses`、`review_queue`、`audit_logs` 时记录来源快照哈希和分析版本。
