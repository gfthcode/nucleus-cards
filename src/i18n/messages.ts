import type { Locale } from "@/config/product";

export const messages = {
  "zh-CN": {
    nav: {
      home: "首页",
      market: "行情",
      teams: "球队",
      rookies: "新秀",
      portfolio: "持仓",
      alerts: "提醒",
    },
    common: {
      demo: "演示数据",
      updatedAt: "更新时间",
      noTrustedSales: "暂无可信成交数据",
      samples: "成交样本",
    },
  },
  "zh-HK": {
    nav: {
      home: "首頁",
      market: "行情",
      teams: "球隊",
      rookies: "新秀",
      portfolio: "持倉",
      alerts: "提醒",
    },
    common: {
      demo: "示範數據",
      updatedAt: "更新時間",
      noTrustedSales: "暫無可信成交數據",
      samples: "成交樣本",
    },
  },
} as const;

export function getMessages(locale: Locale = "zh-CN") {
  return messages[locale];
}
