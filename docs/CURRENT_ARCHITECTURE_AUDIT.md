# 当前架构审计（2026-09-10）

## 结论

当前项目是 Next.js App Router + React 的单体应用：公开页面由 `src/app` 提供，Route Handlers 负责导入、校验与分析入口，领域类型集中在 `src/types/domain.ts`，演示数据集中在 `src/lib/demo-data.ts`，Supabase 生产模式的表结构位于 `supabase/migrations`。这套结构足够支撑继续做产品迭代，但不能把演示快照直接升级成“实时行情”。

## 已存在能力

- 卡片身份、球员、球队、成交、挂牌、拍卖、风险和用户收藏已经有领域类型与页面入口。
- `Card.identityKey`、`Sale.verified/isOutlier`、`CardImageRecord.verificationStatus` 已为去重、可信度和卡图审核预留字段。
- Supabase schema 已有 `card_variants`、`sales`、`listings`、`price_snapshots`、`review_queue`、`audit_logs` 和 RLS；`player_team_memberships` 单独保存阵容关系。
- `src/lib/adapters` 已抽象来源适配器，eBay 当前是 Browse API 占位实现，未宣称已能读取真实成交。
- 首页原有市场总览、行情、拍卖雷达、方法说明和作品集入口，本轮新增沉浸式首页导览但保留这些路由。

## 当前阻塞与风险

1. `src/lib/demo-data.ts` 仍是默认数据源，`productConfig.demoMode` 默认开启；首页所有市场数字必须继续标注演示快照。
2. eBay 适配器尚未完成官方字段映射，且 Browse API 本身不能自动等价于历史成交；卡淘、闲鱼和卡图必须依赖授权 API、合规导出或人工审核。
3. Supabase 表结构已较完整，但生产 Adapter、调度器、对象存储、来源健康监控和后台审核仍未打通。
4. `players.current_team_id` 仍是查询便利字段，权威关系应以 `player_team_memberships` 和来源快照为准。
5. 卡图默认是明确占位图，没有许可时不能用搜索结果图片替代真实卡图。

## 本轮变更边界

首页沉浸式滚动只消费现有 `Card`、`Player` 和站内 `Sale` 计算结果；它不新增外部数据、不伪造球员剪影、不把占位图变成真实卡图。真实数据接入继续按下面路线分阶段进行。
