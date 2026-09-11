# Player Investment Intelligence UI 规格

本轮只定义组件、入口、状态和交互，不直接修改现有 UI。所有入口复用一个 `PlayerAIAnalysisButton`，不在各页面复制分析逻辑。

## 1. 统一入口组件

```tsx
<PlayerAIAnalysisButton
  playerId={player.id}
  playerName={player.displayNameZh}
  teamId={player.currentTeamId}
  context="player_detail"
/>
```

属性：

- `playerId`：必填，作为 API 唯一键。
- `playerName`：展示与无障碍文本，不作为查询键。
- `teamId`：用于球队环境摘要。
- `context`：`player_list | search | team_roster | trending | market_mover | player_detail | watchlist`。
- 可选 `compact`、`onOpen`、`disabled`。

按钮文案：桌面/中文优先“AI 投资分析”，辅助英文 `AI Analysis`。不得使用“立即买入”“稳赚”等高压文案。

## 2. 入口覆盖清单

第一阶段必须覆盖：

1. 球员详情页 `src/app/players/[id]/page.tsx`：主入口，摘要可嵌入页面。
2. 球队阵容 `src/app/teams/[slug]/page.tsx`：每位球员行内入口。
3. 搜索/行情结果：`MarketExplorer` 的球员列或结果详情中入口。
4. Trending / Market Movers：当前首页榜单和拍卖相关球员。
5. Watchlist：卡片关联球员显示入口。
6. Player List：后续若新增独立列表，必须直接复用组件。

入口只负责打开面板与传递 ID，不负责获取数据、计算分数或组装 prompt。

## 3. Desktop 与 Mobile

### Desktop

- 右侧 Drawer，宽度建议 420—560px，不离开当前页面。
- 顶部显示球员头像/缩写、姓名、球队、更新时间和数据模式。
- 长报告提供 `查看完整分析`，链接 `/players/[id]/analysis`；Drawer 关闭后保留原页面上下文。

### Mobile

- Full-screen Sheet/Bottom Sheet，支持返回、关闭和手势。
- 顶部固定摘要；`Short Term`、`Long Term`、`Cards To Watch` 三个 Tab 优先可达。
- 表格改为纵向卡片，不横向滚动隐藏风险或来源。

## 4. 加载流程

点击后立即打开面板并显示真实阶段，不显示虚构百分比：

1. `读取球员基本面…`
2. `检查最新新闻与伤病…`
3. `整理球星卡成交与挂牌…`
4. `计算流动性、稀缺与风险…`
5. `生成短期与长期观点…`

阶段必须来自服务状态；某一步失败应标记该维度 unavailable，而不是继续显示完成百分比。

## 5. Drawer 信息层级

### Overview

- Overall Card Market Score（若 coverage 不足则显示“暂不评分”）
- Short-term / Long-term score 与 outlook
- Momentum、Liquidity、Scarcity、Risk、Confidence
- Score Breakdown：每个分数对应输入与更新时间

### Short Term（1—3 months）

- Outlook、Score、Market Momentum
- 最近 5/10 场或 30 日竞技表现（实际可用才展示）
- Upcoming Catalysts：时间、事件、影响、`AI estimate` 标识
- 短期风险与代表性卡片

### Long Term（12—36 months）

- 职业轨迹、Legacy、冠军/奖项潜力
- Rookie Card 质量、稀缺、人口、收藏需求
- Long-term thesis 与反证事件

### Cards To Watch

每张卡显示：真实卡图或明确占位、身份键摘要、卡层、RC/平行/评级、近期成交区间、30/90D、流动性、POP/限编、风险、置信度、`为什么关注`。

操作：`查看卡片`、`加入关注`、`设置价格提醒`。若没有真实成交，不显示 Buy Zone。

### Risks

固定列出：伤病、估值、高人口、低流动性、炒作依赖、球队变化、波动、供应过剩；每项带 level、触发依据、来源和更新时间。

### Sources

按数据域列来源、授权状态、更新时间、fresh/stale/unavailable。底部放简短免责声明，不遮挡主体内容：

> 本分析基于公开体育信息及收藏品市场数据，仅供研究和收藏决策参考，不构成收益保证。历史成交价格不代表未来表现。

## 6. 数据状态与降级

- `demo`：显示“演示数据”，分数和观点必须带低置信度边界。
- `partial`：在对应 Tab 显示受影响维度和“数据暂不可用”，其余维度可继续查看。
- `stale`：显示最后更新时间和 stale 标签；不写“实时”。
- `unavailable`：显示缺失原因，不显示 0、不生成价格建议。
- `error`：提供重试按钮；重试受 rate limit 约束。

## 7. 无障碍与性能

- Drawer/Sheet 使用 `role=dialog`、焦点陷阱、Esc 关闭、返回按钮和可读的 `aria-label`。
- 分数不能只靠颜色；同时显示数值、文字等级和解释。
- 点击入口不阻塞 Player 页面首屏；分析数据 lazy load。
- 首页/球员列表只读取缓存摘要，不请求完整报告；完整报告只在打开后请求。
- 长来源列表可折叠，关键信息保持可见。

## 8. Watchlist 闭环

```text
AI Analysis → Cards To Watch → View Card
           → Add Watchlist → Set Price Alert
           → Marketplace / Alerts
```

生产环境所有写操作必须走 session、RLS、审计；演示 localStorage 状态必须标注“仅当前浏览器”。

## 9. UI 验收标准

- 所有球员入口都调用同一组件和同一 API。
- 没有新闻/卡市/比赛数据时，用户能看到具体缺口和更新时间。
- Short Term、Long Term、Cards To Watch 在移动端首屏可达。
- 任何 score 都能展开查看 breakdown 和 sources。
- 不出现 guaranteed profit、must buy、必涨、稳赚等文案。
