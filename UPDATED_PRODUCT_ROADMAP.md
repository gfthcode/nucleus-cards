# 更新后的产品路线图

路线按可信度依赖重排；当前仍停在 Phase 0 研究，不进入实现，直到用户明确确认。

## Phase 0：研究与决策（当前）

交付：六份审计文档、同类项目证据、Skill 复用决策、差距和验收指标。状态：完成后等待确认。

## Phase A：数据准确性基础（P0，BUILD NOW）

交付 canonical card identity、player membership 快照、sold/listing 分层、来源授权/证据、freshness/provider health、review queue。依赖：授权数据或用户 CSV。验收：同一卡不同 grade/parallel 不合并；无授权源不显示为实时；每个价格可回到证据。

## Phase B：Marketplace 与 Comps（P0，BUILD NOW）

交付 adapter contract、导入预览、样本门槛、异常值可解释、时间窗口和币种。依赖 Phase A 与 eBay/卡淘等授权。验收：listing 永不进入 sold median；n、窗口、来源在 UI 可见。

## Phase C：价格监控与提醒（P1，NEXT）

交付幂等同步、TTL/退避、快照、告警去重/冷却、通知审计。依赖 B。验收：重复 job 不重复快照/通知，源故障保留最后可信值并提示。

## Phase D：Collection/Portfolio（P1，NEXT）

交付购买成本、费用税运费、已实现/未实现 P&L、历史快照、导入回滚。依赖 B/C。验收：金额可追溯到原币与汇率时间。

## Phase E：Player AI Intelligence（P1，NEXT）

交付统计/新闻/伤病来源时间线、球员与卡的风险解释、提示词输入契约。依赖授权 NBA 数据和 A/B 的 identity。验收：每条 AI 结论有来源时间与不确定性。

## Phase F：Card Recognition（P2，LATER）

交付 OCR/视觉候选、grade/slab 识别、人工确认、隐私与删除。依赖 canonical matching、许可图片和用户同意。

## Phase G：Cinematic UI（P2，LATER）

交付 hero/scroll、卡图性能、统一 token、无障碍/低动效降级。依赖真实数据状态。性能门槛：75 分位 LCP ≤2.5s、INP ≤200ms、CLS ≤0.1；动效不应遮住来源与价格事实。

## Phase H：Community（P3，LATER）

交付用户提交、审核、声誉、版权申诉、滥用防护。未有审核与授权前不开放公开写入。

## 明确拒绝

未经授权的 eBay/卡淘/闲鱼爬虫、虚构历史成交、未许可球员/卡图片、把 demo 当生产、为动画先引入大依赖，均不进入路线图。
