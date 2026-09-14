"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/client";

const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF]/g;
const phraseMap: Record<string, string> = {
  "暂无成交": "No sales", "样本不足": "Insufficient data", "演示数据": "Demo data", "演示样本": "Demo sample", "演示成交样本": "Demo sale sample", "已核验成交": "Verified sale", "加入关注": "Add to watchlist", "取消关注": "Remove from watchlist", "最新成交": "Latest sale", "最新在售标价": "Latest listing", "数据口径": "Methodology", "数据方法": "Methodology", "数据可信度": "Data trust", "当前页面": "Current page", "来源": "Source", "授权状态": "Authorization status", "未接入": "Not connected", "本地规则样本": "Local rule sample", "清除筛选": "Clear filters", "全部年份": "All years", "全部品牌": "All brands", "全部价格": "All prices", "全部代际": "All cohorts", "球员代际": "Player cohort", "风险等级": "Risk level", "快速筛选": "Quick filters", "全部卡片": "All cards", "有成交样本": "With sales", "高流动性": "High liquidity", "高风险": "High risk", "卡片视图": "Gallery view", "表格视图": "Table view", "显示方式": "Display mode", "没有匹配的标准化卡片": "No matching standardized cards", "换个关键词或清除筛选条件后再试。": "Try another keyword or clear the filters.", "阅读指标口径": "Read methodology", "卡片正面": "Card front", "卡片背面": "Card back", "未使用虚构卡面": "No fictional card face used", "手机导航": "Mobile navigation", "主要导航": "Main navigation", "跳至主要内容": "Skip to main content", "进入应用": "Open app", "隐私": "Privacy", "登录": "Sign in", "退出登录": "Sign out", "设置": "Settings", "首页": "Home", "行情": "Market", "收藏": "Collection", "持仓": "Portfolio", "提醒": "Alerts", "拍卖": "Auctions", "球员": "Players", "球队": "Teams", "新秀": "Rookies", "管理后台": "Admin", "AI 研究": "AI research", "发现": "Discover", "研究": "Research", "数据服务": "Data service", "美东市场 · 盘后": "US market · After hours", "数据仅供收藏研究参考，不构成交易建议。": "Data is for collecting research only and is not trading advice.", "当前  ·  演示数据": "CURRENT · Demo data",
};

function translateText(value: string) {
  let next = value;
  for (const [source, target] of Object.entries(phraseMap)) next = next.replaceAll(source, target);
  return next.replace(CJK, "");
}

export function EnglishModeGuard() {
  const { locale } = useI18n();
  useEffect(() => {
    if (locale !== "en") return undefined;
    const sanitize = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) nodes.push(node as Text);
      nodes.forEach((text) => { if (!text.parentElement?.closest(".language-switcher")) text.nodeValue = translateText(text.nodeValue ?? ""); });
      if (root instanceof Element) [root, ...Array.from(root.querySelectorAll<HTMLElement>("*[aria-label], *[title], input[placeholder], textarea[placeholder]"))].forEach((element) => {
        for (const attribute of ["aria-label", "title", "placeholder"]) { const value = element.getAttribute(attribute); if (value && !element.closest(".language-switcher")) element.setAttribute(attribute, translateText(value)); }
      });
      document.title = translateText(document.title);
    };
    sanitize(document.body);
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => sanitize(node))));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);
  return null;
}

