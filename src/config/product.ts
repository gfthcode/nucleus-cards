export const productConfig = {
  name: "Nucleus Cards",
  shortName: "Nucleus",
  defaultLocale: "zh-CN",
  supportedLocales: ["zh-CN", "zh-HK"] as const,
  defaultCurrency: "CNY" as const,
  supportedCurrencies: ["CNY", "HKD", "USD"] as const,
  supportedTimezones: ["Asia/Shanghai", "Asia/Hong_Kong"] as const,
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
  disclaimer:
    "本平台提供的是收藏品行情与数据分析，不构成投资、医疗或交易建议，不承诺任何收益。球星卡价格可能大幅波动，用户应独立判断并承担风险。",
};

export type Currency = (typeof productConfig.supportedCurrencies)[number];
export type Locale = (typeof productConfig.supportedLocales)[number];
