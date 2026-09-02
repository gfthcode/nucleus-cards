# Nucleus Cards

面向中国内地与中国香港 NBA 球星卡收藏者的行情监控、持仓管理与辅助分析 MVP。项目采用 Next.js App Router、TypeScript、Supabase 数据模型、Zod、Recharts、Vitest 与 Playwright；没有任何外部账号或 API Key 时也能以确定性的演示数据完整运行。

> 本平台提供的是收藏品行情与数据分析，不构成投资、医疗或交易建议，不承诺任何收益。球星卡价格可能大幅波动，用户应独立判断并承担风险。

## 已实现

- 市场首页：市场概览、涨跌榜、2020—2026 新秀届、球员代际热点、风险与数据质量。
- 标准化行情：搜索与选秀届、球员代际、角色球员、交易/签约热点等多维筛选；真实成交和在售标价分开展示。
- 完整公共路由：30 支球队、球员、新秀届、卡片详情、数据方法页。
- 卡片详情：CNY/HKD/USD 切换、7D/30D/90D/1Y 图表、成交样本、异常值、AI 证据和风险标签。
- 跨届新秀工具：默认对比 2023、2024、2025 届，可切换 2020—2026，并显示同届排名和估值观察。
- 本地持仓 CRUD：添加、编辑、删除、估值、未实现盈亏和球员代际分布；隐私默认关闭，数据保存在当前浏览器。
- 公开收藏、交易/签约/代际提醒、隐私设置、演示登录，以及支持 2020—2026 与角色球员批量打标的管理后台。
- 数据层：规范化 PostgreSQL 迁移、RLS 策略、种子数据、CSV 模板、适配器接口和 eBay Browse API 占位实现。
- 确定性 AI Provider：Zod 校验结构化输出，没有 Key 时不随机编造结论。
- PWA Manifest 与 Service Worker、深浅主题、桌面/移动响应式布局、键盘焦点、加载/空/错状态。
- API 输入校验、限流接口、管理员生产路由保护、账号导出/删除接口设计。

所有市场数据均明确标记为演示数据。未授权来源没有爬虫，也不会把在售标价冒充为真实成交。

## 快速启动

要求 Node.js 20+ 与 pnpm 11+。

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。默认 `NEXT_PUBLIC_DEMO_MODE=true`，不需要注册账号；右上角“演示账户”可查看登录与生产接入说明。管理后台在 `/admin`，演示模式直接可见，生产模式不会使用硬编码密码。

## 常用命令

```bash
pnpm lint          # ESLint
pnpm typecheck     # TypeScript strict 检查
pnpm test          # Vitest 单元/API 测试
pnpm test:coverage # 覆盖率
pnpm test:e2e      # Playwright 桌面端与移动端核心流程
pnpm build         # Next.js 生产构建
pnpm check         # lint + typecheck + unit test + build
```

首次运行 E2E 前安装 Chromium：

```bash
pnpm exec playwright install chromium
```

## 环境变量

完整模板见 [`.env.example`](./.env.example)。

| 变量                                    | 必需       | 用途                                   |
| --------------------------------------- | ---------- | -------------------------------------- |
| `NEXT_PUBLIC_DEMO_MODE`                 | 否         | `true` 时使用本地演示数据              |
| `NEXT_PUBLIC_APP_URL`                   | 否         | 应用公开地址                           |
| `NEXT_PUBLIC_SUPABASE_URL`              | 生产       | Supabase 项目 URL                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | 生产       | 浏览器端匿名 Key，配合 RLS             |
| `SUPABASE_SERVICE_ROLE_KEY`             | 服务端任务 | 仅服务端使用，禁止 `NEXT_PUBLIC_` 前缀 |
| `AI_PROVIDER` / `OPENAI_API_KEY`        | 可选       | 切换真实 AI Provider；默认 `demo`      |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` | 可选       | 官方 eBay Browse API 凭据              |

## Supabase 初始化

1. 创建 Supabase 项目并启用邮箱或所需第三方认证。
2. 在 SQL Editor 执行 `supabase/migrations/0001_initial.sql`。
3. 再执行 `supabase/seed.sql` 写入球队、2020—2026 选秀届、跨代际演示球员、品牌、系列和来源元数据。
4. 将项目 URL 与 anon key 填入 `.env.local`。
5. 服务端导入任务才可使用 service role key；不要将它暴露到浏览器或提交到 Git。

迁移包含规范化实体、常用查询索引与用户私有表的 Row Level Security。演示前端目前由本地适配器驱动，后续只需实现同一数据接口的 Supabase Adapter 即可切换。

## CSV 导入

模板位于 `public/templates/sales-import-template.csv`。管理后台会解析并校验记录，将合法记录放入审核队列；社区提交和线下记录始终保留来源与授权状态，不会被包装成平台官方成交。

## 数据源与 AI

- `src/lib/adapters/types.ts` 定义统一接口与来源能力声明。
- `src/lib/adapters/demo.ts` 提供无需凭据的完整演示实现。
- `src/lib/adapters/ebay.ts` 只预留官方 Browse API 接入，不抓取网页。
- 卡淘、闲鱼、Carousell HK、Goldin 等未授权平台目前仅支持适配器占位、CSV 或人工审核输入。
- `src/lib/ai-analysis.ts` 定义可替换 Provider；演示实现根据确定性指标生成包含 `playerCohort` 和 `peerComparison` 的短期/中期结构化分析，并经过 Zod 校验。

详细说明见 [数据授权文档](./docs/data-authorization.md) 与 [API 文档](./docs/api.md)。

## 部署到 Vercel

1. 将本目录提交到你自己的 GitHub 仓库。
2. 在 Vercel 选择 **Add New → Project**，导入该仓库。
3. Framework Preset 保持 Next.js，安装命令使用 `pnpm install --frozen-lockfile`。
4. 先设置 `NEXT_PUBLIC_DEMO_MODE=true` 即可部署演示站；启用生产数据时再配置 Supabase 与其他服务端变量。
5. 部署后访问 `/api/health`，再检查首页、行情、卡片详情和持仓流程。

中国内地正式公开部署前，需要根据实际主体、服务器位置、域名和业务形态完成 ICP 备案/许可判断、网络安全与个人信息保护评估、数据跨境与数据源商业授权评估。Vercel 的可访问性和合规适用性也需单独评估。本仓库不构成法律意见。

## 项目结构

```text
src/app/               页面、动态路由与 Route Handlers
src/components/        行情、图表、持仓、提醒、隐私等组件
src/config/            产品名、币种、时区和免责声明集中配置
src/i18n/              简体中文与繁体中文国际化骨架
src/lib/               演示数据、指标、AI、校验、限流和适配器
src/types/             领域类型
supabase/migrations/   PostgreSQL 数据库迁移与 RLS
supabase/seed.sql      元数据种子脚本
tests/unit/            指标、AI、校验和 API 测试
tests/e2e/             Playwright 桌面/移动端核心流程
docs/                  架构、API、授权与截图说明
```

架构细节见 [docs/architecture.md](./docs/architecture.md)。

## 功能截图

仓库不提交自动生成的界面截图。发布前请按 [docs/screenshots/README.md](./docs/screenshots/README.md) 的命名和尺寸采集首页、行情、卡片、持仓与移动端截图，避免把真实账号或私有持仓带入图片。

## 路线图

1. 接入 Supabase Auth 与持仓/提醒的真实持久化，完成生产级角色权限和审计。
2. 在取得授权后接入 eBay Browse API 与核心中国市场数据合作方。
3. 增加服务端汇率、赛事/伤病官方数据源和调度任务。
4. 完成 zh-HK 全量翻译、通知渠道、图片上传与无障碍自动审计。
5. 增加多租户数据审核工作台、观测告警与生产备份/恢复演练。

## 贡献

请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。项目尚未选择开源协议，因此没有添加 LICENSE；在明确授权前不要将代码视为已获得开源许可。
