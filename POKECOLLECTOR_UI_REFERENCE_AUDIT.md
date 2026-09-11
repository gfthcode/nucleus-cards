# PokéCollector UI Reference Audit

参考站点的可迁移模式（不复制品牌、Pokemon 内容、Logo、素材或代码）：

- Application shell：固定侧栏/顶部工具区，内容区有明确最大宽度。
- Navigation：分组导航、当前项高亮、移动端底部导航；主要任务有清晰 CTA。
- Information architecture：Hero → 能力亮点 → 功能分段 → 详情/集合 → FAQ/帮助。
- Components：圆角 surface、细边框、低阴影；卡片网格与列表视图并列；筛选使用紧凑 chips。
- Interaction：搜索、筛选、排序、标签、详情进入路径可预测；按钮有 hover/focus/active。
- States：空状态、加载状态、错误状态和数据来源说明均在内容流内表达。
- Responsive：桌面多列、移动单列；导航和筛选在小屏折叠或横向滚动。

## NBA 转译

Pokemon → NBA player；Pokemon Card → sports card；Set → card product/set；Type → player/card metadata。品牌色保持 Nucleus 蓝色强调，表面层级、间距、密度和交互规则采用参考站点的产品化节奏。
