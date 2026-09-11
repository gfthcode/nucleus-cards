# 项目 Skill 缺口与建议

本轮只登记，不安装。

|Skill|覆盖问题|状态|触发后应产出|
|---|---|---|---|
|sports-card-data-normalization|球员/卡/grade/parallel/币种归一化|BUILD NOW|schema、规则、fixture、冲突报告|
|sports-card-card-matching|canonical identity 与图片匹配|BUILD NOW|候选排序、阈值、人工复核|
|sports-card-marketplace-adapter|eBay/卡淘/其他授权适配器|BUILD NOW|授权检查、rate limit、health、合同测试|
|sports-card-comps-engine|成交 comps、异常值、样本置信度|BUILD NOW|可解释统计与回放 fixture|
|sports-card-price-monitor|快照、TTL、告警冷却|NEXT|幂等 job、重试、通知审计|
|sports-card-image-pipeline|图片许可、缩略图、破图|NEXT|manifest、归属、尺寸和清理策略|
|sports-card-player-analysis|统计/新闻/伤病到 AI 上下文|NEXT|来源时间线、提示词输入契约、免责声明|
|sports-card-ui|卡详情、来源、空态、无障碍|NEXT|token/checklist、Playwright 验收|
|sports-card-auction-monitor|拍卖状态、时区、重复事件|LATER|事件归一化与结束状态机|
|sports-card-github-discovery|每次 Prompt 的仓库/Skill 研究|BUILD NOW|检索记录、许可证、复用决策|

## 设计约束

Skill 必须是项目规则的可执行说明，不应把外部仓库代码整包复制进来。先建立领域 fixture 和授权边界，再决定是否需要 Skill 或依赖；每个 Skill 都要有失败、回滚、测试和安全章节。
