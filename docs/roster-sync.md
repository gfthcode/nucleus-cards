# NBA 阵容与 Membership 同步

Teams 页面现在通过 `getTeamRosterSnapshot()` 读取统一的 Membership 关系。生产环境配置授权源后，页面会优先读取 Sportradar NBA v8 Team Profile，并生成 Membership 同步计划；没有密钥或上游暂时不可用时，页面会明确标记为演示回退，不会把演示名单伪装成实时阵容。

## 推荐数据源

默认适配器是 Sportradar。它是 NBA 官方数据源支持的数据提供商，Team Profile 返回当前活跃阵容，并提供 `ACT`、`TWO-WAY`、`IR`、`M-LEAGUE`、`TEN-DAY` 等状态。接口需要 `x-api-key`，密钥只从服务器环境变量读取。

## 配置

在 Netlify 的 Site configuration → Environment variables 中添加：

```text
NBA_ROSTER_PROVIDER=sportradar
SPORTRADAR_API_KEY=
SPORTRADAR_ACCESS_LEVEL=trial 或 production
SPORTRADAR_LANGUAGE=zh
```

在 Netlify 的变量值输入框中粘贴你从 Sportradar 获取的密钥。不要把密钥提交到 GitHub、浏览器代码或聊天窗口。添加变量后触发一次新的生产部署。

## API 与同步模型

```text
GET /api/teams/:teamId/roster
```

`:teamId` 可以是球队 slug（例如 `boston-celtics`）或内部球队 ID。响应包含来源状态、上游阵容、匹配结果和 Membership `upserts` / `closures` 计划。同步器只更新当前关系：交易或裁员会关闭旧 Membership；新关系会创建新记录；未匹配球员会进入 `unmatched`，不会静默创建重复 Player。

生产持久化表为 `player_team_memberships`，迁移文件是 `supabase/migrations/0002_player_team_memberships.sql`。应用当前没有把服务角色密钥放进前端；实际写入应由受保护的定时任务或后台作业执行。建议每日同步，交易截止日、自由市场和赛季开始阶段提高频率。

## 数据边界

卡片的 `printedTeamId`（发行时球队）与 Player 的当前 Membership 完全分离。球员受伤仍保留球队关系，只改变 `rosterType`；球员交易不会修改历史卡片球队。
