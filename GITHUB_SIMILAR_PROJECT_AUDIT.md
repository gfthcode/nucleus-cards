# GitHub 同类项目审计

> 研究阶段：2026-09-11。仅审计公开仓库与当前代码，不改运行代码、依赖、数据库或 UI。

## 方法与评分

按 Prompt 权重评分：产品相关性 25、架构 20、数据模型 15、维护性 10、测试 10、安全 5、许可证 5、性能 5、可复用模式 5。仓库页面、README、目录和提交历史是证据；未验证内容不作事实推断。

## Top 5

|项目|定位|得分|可复用|结论|
|---|---|---:|---|---|
|[DamageLabs/sports-card-tracker](https://github.com/DamageLabs/sports-card-tracker)|体育卡收藏、多用户、管理后台|83|集合/权限/管理后台、E2E、文档化路线|最高相关性；借鉴边界与测试，不能直接复制业务模型|
|[Git-Romer/pokecollector](https://github.com/Git-Romer/pokecollector)|自托管 TCG 集合、价格、同步、备份|81|来源/语言回退、同步锁、备份、可解释价格|借鉴数据新鲜度与失败保留，不采用 Pokémon 专属字段|
|[jbright471/Trading-Card-Collection-Tracker](https://github.com/jbright471/Trading-Card-Collection-Tracker)|多 TCG 组合与价格跟踪|76|CSV 预览导入、费用/利润拆分、provider 失败保留|适合导入、组合和价格历史交互；确认许可证后再复用代码|
|[Aendoarphin/comps_v1](https://github.com/Aendoarphin/comps_v1)|交易卡 comps 桌面工具|68|检索、成交可比项、来源链接|可参考 comps 工作流；eBay 数据必须获授权，不能把抓取脚本带入生产|
|[maccann-24/sports-card-research](https://github.com/maccann-24/sports-card-research)|体育卡市场研究文档|59|市场平台分类、CardLadder 竞品观察|研究参考，不是可部署依赖|

## 种子项目核验

- `DamageLabs/sports-card-tracker` 与 `Git-Romer/pokecollector` 已找到且公开可审计；前者有 `src/server/e2e/.github/workflows`，后者明确记录环境变量、备份和同步策略。
- `CardTCGApp`：本轮 GitHub 搜索未确认唯一官方仓库，暂列“未验证/拒绝直接复用”。不得依据同名项目或二手文章推断许可证、维护状态或实现质量。

## 当前项目对照

Nucleus Cards 已有 Next.js 16、Supabase 迁移、Player/Card/Sale/Listing/Auction 类型、`MarketplaceAdapter` 抽象、demo 与 eBay Browse 占位适配器、市场数学、图片来源/授权字段、导入 API 和 Playwright/Vitest。主要差距不是页面数量，而是：canonical card identity、sold/listing 严格分层、授权来源可审计、provider health/freshness、comps 质量门槛、真实图片许可和玩家 AI 数据服务。

## 复用决策

**BUILD NOW（只在确认 Phase 1 后）**：抽象借鉴来源状态、导入预览、失败保留、备份与可比项解释。**ADAPT**：将 TCG 的 set/variant 模型改成 NBA 年份、品牌、product line、parallel、grade、print run。**REJECT**：未验证仓库代码、未经授权的 eBay/Xianyu 爬虫、把 listing 当成交、把演示图片当授权图片。

## 证据边界

星标/提交数量会变化；本文件只记录本次访问时可见信息。任何生产采用前应重新检查 LICENSE、最近提交、依赖漏洞、API 条款与数据授权。
