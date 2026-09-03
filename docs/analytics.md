# 用户行为统计

网站支持通过环境变量启用 Google Analytics 4 和 Microsoft Clarity。默认留空，不加载任何第三方统计脚本。

在 Netlify 的 **Project configuration → Environment variables** 中添加：

```text
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx
```

重新部署后即可使用：

- GA4：Reports → Realtime / Engagement → Events
- Clarity：Dashboard → Recordings / Heatmaps

已埋点事件包括 `search_used`、`advanced_filter_toggled`、`card_viewed`、`watchlist_toggled` 和 `portfolio_draft_toggled`。事件不包含用户输入的完整搜索内容，只记录页面路径和控件标签。

Netlify 自带的 Logs & Metrics → Analytics 可查看页面浏览量、独立访客、热门页面和来源，但不提供按钮级事件统计。
