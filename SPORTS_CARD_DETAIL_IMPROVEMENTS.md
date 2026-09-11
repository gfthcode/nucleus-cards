# 球星卡细节优化清单

|细节|当前情况|验收标准|决定|
|---|---|---|---|
|数据新鲜度徽章|字段零散|每个价格/阵容显示 `source + lastUpdatedAt + age`，过期自动降级|BUILD NOW|
|样本数/置信度|有 match/data completeness|中位数旁显示 n、窗口、置信度；n 不足不出确定结论|BUILD NOW|
|成交 vs 在售|类型已有但 UI 易混|标签、颜色、查询和图表完全分离；listing 不计入 sold comps|BUILD NOW|
|异常值提示|market-math 有 outlier|显示剔除原因，不静默删除；可查看原始证据|BUILD NOW|
|来源与证据|URL 字段存在|每条记录有 sourceId、原始链接、授权状态、抓取时间|BUILD NOW|
|canonical identity|identityKey 存在|年份/品牌/系列/编号/parallel/grade 唯一约束，冲突进入 review queue|BUILD NOW|
|图片可信度|有匹配/许可字段|破图 fallback、尺寸/比例检查、归属/许可可见；未授权图片不进生产|BUILD NOW|
|Provider health|health 方法存在|源级 healthy/degraded/disabled、失败次数、下次重试时间可见|NEXT|
|币种与全包成本|有 convertedCny/费用字段|显示原币、汇率时间、运费/税/平台费，禁止混算|NEXT|
|低流动性/无成交|liquidity 字段存在|0 成交、n<门槛、过期数据分别显示|BUILD NOW|
|告警去重/冷却|alert 类型存在|同一 identity+阈值在冷却窗只通知一次，可审计|NEXT|
|拍卖时区|AuctionEvent 有时间|显示用户本地时区与原始时区，结束状态有容错|NEXT|
|加载/空态|页面有 loading|骨架、错误重试、空数据解释和 demo/真实区分|BUILD NOW|
|人工纠错|review_queue 迁移存在|用户可报告 mismatch，审核后保留原值与变更日志|NEXT|
|无障碍/动效|reduced motion 已有|键盘焦点、ARIA、prefers-reduced-motion、低端设备不掉帧|BUILD NOW|

## 明确不做

不凭公开 listing 推断成交价；不抓取未授权平台；不用生成图片冒充真实卡图；不把 demo 数据改名为实时数据。任何“实时价格”必须先有授权 API/CSV/许可数据源。
