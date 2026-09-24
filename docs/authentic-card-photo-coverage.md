# 实物卡图目录与覆盖验收 — 2026-09-24

## 本次纠正

- 旧市场的 471 条不是 471 张已核实实物卡：21 条演示卡之外的 450 条由名单、虚构 NBA-序号及 hash 挂牌价生成。这一生成逻辑已移除。
- 原来的 21 条演示记录仍在明确的「演示样本」分页，不伪装真实成交；原卡 ID 不被新卡静默替换，避免影响已有收藏引用。
- 真实目录使用独立 `photo-<sourceId>` ID，详情页可访问，无演示成交图、模拟价格和假预测。
- 首页沿用深红版式，完整照片使用 contain 与自适应竖幅；不再把整个卡片组件压进 68–145px 高容器。
- 旧本地 3 张 PNG 无法完整解码，首页不再依赖它们。

## 来源与证据

- NBA 官方当前可见名单：<https://www.nba.com/players>，关闭历史名单、选择 All。2026-09-24 核验 594 行、30 支球队。网页不提供正式/双向合同标记，不能称其为固定 450 名正式球员。
- Collector Crypt 官方公共 GET API：<https://docs.collectorcrypt.com/marketplace/api>。
- 官方卡图嵌入说明：<https://docs.collectorcrypt.com/metadata>。
- 本轮读取 2,485 条 Basketball 目录候选；排除非卡片、多球员、已知父子重名和无法解码图片。选取每位已匹配现役球员一张实物卡，保留来源标题、卡号、平行版、评级、来源页面和验证时间。
- 图片由 sharp 实际完整解码，不仅检查 HTTP 200 / 文件头。没有把生成 SVG 或球员头像算作实物图。
- 来源的保险估值不导入；公开目录快照不等于当前挂牌或历史成交。版权归原权利人，未声称公开 API 图片为公共领域作品。
- Tim Hardaway Jr. 搜索中的 1998 Tim Hardaway 卡已排除，不能按省略 Jr. 的模糊结果误配。

## 可复查入口

- `/api/cards/photo-coverage`：真实图片数量、已覆盖球员、完整 NBA 名单口径及逐名待补列表。
- `/market`：默认真实照片目录；明确区分照片、演示样本和成交记录，分页每页 36 张。
- `src/data/public-card-photos.json`：不含钱包、卖家个人信息、令牌或保险估值。

## 更新流程

1. 公共名单导出后用 `node scripts/refresh-official-roster.mjs <nba-visible-table.json>` 更新，不推断合同类型。
2. `node scripts/collect-public-card-candidates.mjs <output.json>` 仅调用官方公开 GET；明确名字别名，拒绝任意删除父子后缀，保留失败原因。
3. `node scripts/verify-public-card-photos.mjs <output.json>` 解码图片并生成快照，同 URL 在 24 小时内复用已验证结果。
4. `pnpm check`、`E2E_PORT=3137 pnpm test:e2e`，再发布到既有 nucleus-cards 项目。新目录数不作为 100% 全球员覆盖的声明。

## 当前未解决

本轮已解码 204 名球员照片；594 名单中仍有 390 名没有当前来源的已核验实物卡图。这些球员不会被隐藏成“全部完成”。生产 eBay 搜索接口仍返回 `EBAY_CREDENTIALS_NOT_CONFIGURED`；仅存在同名环境变量不等于可用生产凭据。本次没有变更登录、数据库或任何付费订阅。
