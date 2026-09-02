# 基础架构说明

## 运行形态

Nucleus Cards 是一个 Next.js App Router 应用。公开行情页面优先静态生成，API Route Handlers 承担校验、导入和服务端任务入口；Supabase 负责生产环境的 PostgreSQL、Auth 与 RLS。演示模式通过同一领域接口返回本地种子数据，因此没有凭据也不会阻塞页面或测试。

```text
Browser / PWA
  ├─ Public pages and client interactions
  ├─ Local demo portfolio (localStorage)
  └─ Route Handlers
       ├─ Zod validation + rate-limit boundary
       ├─ Data adapter interface
       │    ├─ Deterministic demo adapter
       │    ├─ Supabase adapter (next phase)
       │    └─ Authorized official APIs
       └─ AI provider interface
            ├─ Deterministic demo provider
            └─ Server-side production provider

Supabase PostgreSQL
  ├─ Normalized market/catalog tables
  ├─ User-private tables protected by RLS
  ├─ Review/import/audit tables
  └─ Indexed market and identity fields
```

## 数据边界

- 卡片身份键组合品牌、系列、发行年、卡号、球员、平行版本、限编、签名/物料与评级信息。
- 球员基础代际使用 `player_cohort` 枚举；角色球员、交易热点、签约热点是独立布尔标签，可与代际叠加。2020—2026 选秀届通过独立表和索引支持跨届查询。
- `Sale`、`Listing`、社区提交和估值是不同实体/状态；价格指标只纳入符合规则的成交样本。
- 价格保留原币种、换算值和成交时点汇率；多卡组合与异常值保留原记录并从参考指标中排除。
- 数据适配器暴露搜索、成交、球员事件、标准化、校验与健康检查能力，并声明授权状态。
- AI 只消费已结构化的证据，返回经 Zod 校验的 `playerCohort`、`peerComparison`、概率区间、置信度、反证事件和免责声明。

## 安全边界

- `src/proxy.ts` 在生产模式保护 `/admin`；正式实现需把演示 cookie 判定替换为 Supabase 服务端 session/role 校验。
- 私有用户表启用 RLS。service role key 只允许在可信服务端任务使用。
- 导入接口设置请求大小、记录数、字段范围和限流边界；记录进入审核队列而非直接成为认证成交。
- 公开收藏默认隐藏真实姓名、联系方式、购买成本、盈亏和精确资产总额。
- 账号导出与删除已保留 API 契约；生产实现必须校验本人身份、最近登录状态并生成审计记录。

## 生产补全点

演示 UI 与领域逻辑已完整，但生产落地还需 Supabase Adapter、真实 session 管理、对象存储上传策略、调度器、通知服务、来源商业授权、监控告警和备份恢复。不得直接把演示数据标记为实时数据。
