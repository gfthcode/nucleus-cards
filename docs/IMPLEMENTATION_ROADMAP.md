# 实施路线图（审计后分阶段执行）

## P0：可信底座

1. 冻结 canonical card identity 规范与别名表。
2. 完成 CSV/官方 API 的 raw → normalized → review → publish 管道。
3. 建立销售、挂牌、拍卖的事件类型与幂等键。
4. 将卡图审核、版权、来源 URL 和撤回流程接入后台。
5. 以 Supabase `data_import_jobs`、`review_queue`、`audit_logs` 记录每次导入。

## P1：市场产品

1. 完成 eBay 官方授权适配器与字段映射；授权前只保留导入模板。
2. 以同一查询服务驱动 Market、Player、Team、Auction Radar 和首页，移除页面内重复的演示榜单。
3. 提供 24H/7D/30D 参考价、样本数、异常剔除理由、来源和“挂牌/成交”切换。
4. 增加搜索、关注、价格/拍卖提醒，并通过后台任务发送通知。

## P2：收藏者工作台

1. 作品集 all-in 成本、分批买入、收益区间与来源证据。
2. 评级人口、卖家/拍卖来源可信度和数据新鲜度。
3. 组合风险、流动性和跨平台比价；所有结论展示置信度和反证。

## 本轮已完成

首页增加了可访问、可降级、支持 `prefers-reduced-motion` 的沉浸式滚动导览：先讲卡片身份，再展示站内参考价与样本数，最后引导至 Market、Auction Radar 和 Methodology。原有市场总览区和全部核心入口保留。
