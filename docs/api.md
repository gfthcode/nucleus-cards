# API 与服务接口

所有响应均为 JSON。演示模式不要求认证；生产模式中的账户、私有持仓、导入和后台接口必须接入 Supabase session、角色检查与审计。

## HTTP Route Handlers

### `GET /api/health`

返回应用模式与来源健康摘要。适合部署后的 smoke check。

### `GET /api/ai/:cardId`

返回指定卡片的确定性结构化分析，包含周期、方向、概率区间、置信度、数据完整度、正负因素、流动性/伤病因素、反证事件、证据、时间戳和免责声明。每个来源 IP 有演示限流；不存在的卡片返回 `404`。

### `POST /api/import/sales`

接受：

```json
{
  "records": [
    {
      "cardIdentityKey": "topps|chrome|2025|1|cooper-flagg",
      "soldAt": "2026-08-30T08:00:00Z",
      "amount": 8420,
      "currency": "CNY",
      "source": "reviewed-offline",
      "verified": false,
      "isBundle": false
    }
  ]
}
```

限制：最多 1000 条、请求体最多 2 MB、币种仅 CNY/HKD/USD。合法请求返回 `202 queued-for-review`；记录不会直接变成平台认证成交。

### `GET /api/account/export`

演示返回当前演示资料、持仓与提醒的 JSON 附件。生产版必须只导出已认证用户自己的数据。

### `DELETE /api/account/delete`

演示模式提示清除浏览器数据；生产模式当前返回 `501`，用于明确阻止没有身份校验和审计的危险删除操作。

## 数据适配器

`src/lib/adapters/types.ts` 定义统一能力：

- `searchListings()`：查询允许公开使用的在售记录。
- `fetchListing()`：获取单条在售详情。
- `fetchSales()`：仅在授权并支持历史成交时实现。
- `fetchPlayerEvents()`：比赛、伤病、签约或交易事件。
- `normalizeCard()`：转换为稳定卡片身份。
- `validateRecord()`：来源级校验。
- `getSourceHealth()`：能力、授权、同步和错误状态。

适配器必须显式声明 enabled、API Key 要求、在售/成交能力、授权状态、最后同步时间和错误状态。没有授权的来源不得通过该接口偷偷抓取。

## AI Provider

Provider 输入标准化卡片、球员、周期与证据；输出必须通过 `aiAnalysisSchema`。生产 Provider 的 API Key 只可在服务端读取，且仍需执行禁用词、概率一致性、证据和免责声明校验。
