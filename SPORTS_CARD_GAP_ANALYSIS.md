# Sports Card 能力差距分析

状态基于 2026-09-11 当前仓库审计；“已有”不等于真实生产数据已接入。

|能力|当前状态|差距|优先级|
|---|---|---|---|
|Player/Team|类型、页面、demo roster；NBA 官方快照路径|实时授权、历史 membership、去重|P0|
|Card/Variant/Grade|Card 类型与 Supabase 迁移|canonical identity、parallel/grade 约束|P0|
|Images|CardImageRecord、placeholder、图片组件|授权、匹配置信、破图/尺寸监控|P0|
|Marketplace|adapter 接口；eBay Browse 为占位且仅 listings|官方 sold/completed 授权、卡淘/闲鱼授权|P0|
|Sales/Listings|Sale/Listing 与导入 API|严格区分成交/在售、证据 URL、费用/币种|P0|
|Comps/Price history|market-math 有 median、加权、异常值|样本门槛、grade/parallel 分层、时间窗口|P0|
|Freshness/Provider health|health API/字段存在|每源同步记录、退避、降级提示|P0|
|Search|全局搜索 UI|别名、编号、品牌/parallel/grade 解析|P1|
|Watchlist/Alerts|类型、迁移、页面|去重、冷却、阈值证据与通知状态|P1|
|Collection/Portfolio|迁移与 portfolio 页面|持仓快照、真实成本、已实现/未实现拆分|P1|
|Auction Radar|页面与 AuctionEvent|时区、结束状态、竞价证据、重复事件|P1|
|AI card analysis|`/api/ai/[cardId]` 确定性 demo|来源上下文、免责声明、可追溯结果|P1|
|AI player intelligence|规格文档存在|统计/新闻/伤病授权数据服务|P1|
|News/Injury|迁移与类型|来源、时间、球员关联和过期规则|P1|
|Auth/Export/Delete|API 与登录页面存在|生产身份、RLS 验证、审计日志演练|P1|
|Scheduler/Jobs/Cache|迁移预留|幂等 job、锁、缓存 TTL、失败重试|P1|
|Notifications|迁移预留|邮件/推送 provider、退订、审计|P2|
|Design system|CSS tokens 分散、magic values|统一 token、focus、响应式|P2|
|Performance|已有 rAF/reduced motion；图片较大|LCP/INP/CLS 预算、压缩与 sizes|P2|
|Community/Scanner|未形成生产功能|审核、隐私、版权、误识别回滚|P3|

## 结论

当前真正阻塞上线可信度的是数据层而非“再加一个卡片页面”：identity → source authorization → sold/listing separation → comps quality → freshness/health 必须先闭环。任何价格显示都应带来源、时间、样本数、币种、grade/parallel 和“估算/已验证”标签。
