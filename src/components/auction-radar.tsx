"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Gavel, Globe2, ShieldCheck, Star } from "lucide-react";
import { activeAuctions, demoAuctions } from "@/lib/auction-data";
import type { AuctionRegion } from "@/types/domain";

const regionLabels: Record<AuctionRegion, string> = { GLOBAL: "全球", INTL: "海外", CN: "国内" };
const heatLabel = (score: number) => score >= 80 ? "Very Hot" : score >= 60 ? "Hot" : score >= 40 ? "Normal" : "Low";

export function AuctionRadar() {
  const [region, setRegion] = useState<AuctionRegion>("GLOBAL");
  const [rookieOnly, setRookieOnly] = useState(false);
  const [endingOnly, setEndingOnly] = useState(false);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const rows = useMemo(() => activeAuctions.filter((auction) => (region === "GLOBAL" || (region === "CN" ? auction.sourceRegion === "CN" : auction.sourceRegion !== "CN")) && (!rookieOnly || auction.rookieDesignation) && (!endingOnly || auction.auctionStatus === "ending_soon")), [region, rookieOnly, endingOnly]);
  const hotPlayers = [...rows].sort((a, b) => b.heatScore - a.heatScore).slice(0, 4);
  const endingSoon = activeAuctions.filter((auction) => auction.auctionStatus === "ending_soon");
  const toggleWatch = (id: string) => setWatched((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <main className="page-shell inner-page auction-radar-page">
    <header className="terminal-page-heading"><div><span className="section-kicker">AUCTION RADAR</span><h1>全球球星卡拍卖雷达</h1><p>追踪国内外主要拍卖活动、竞价热度和市场关注变化。</p></div><div className="updated-at"><span>数据状态</span><b>演示数据 · 非实时</b></div></header>
    <div className="terminal-demo-notice"><span>拍卖监测演示</span><small>当前仅展示已明确区分 saleType=auction 的样本，闲鱼普通挂牌不会混入拍卖榜单。</small><Link href="/methodology">查看数据方法 →</Link></div>
    <section className="auction-pulse-grid"><article><span>活跃拍卖</span><strong>{activeAuctions.length}</strong><small>已验证来源待接入</small></article><article><span>24H 内结束</span><strong>{endingSoon.length}</strong><small>Ending Soon</small></article><article><span>热门球员</span><strong>{new Set(rows.map((auction) => auction.playerName)).size}</strong><small>按 Auction Heat</small></article><article><span>监测市场</span><strong>{new Set(demoAuctions.map((auction) => auction.sourceId)).size}</strong><small>国内 / 海外演示源</small></article></section>
    <section className="auction-toolbar"><div className="auction-region-tabs">{(Object.keys(regionLabels) as AuctionRegion[]).map((key) => <button data-analytics-event="auction_region_changed" className={region === key ? "active" : ""} key={key} onClick={() => setRegion(key)}><Globe2 size={14} />{regionLabels[key]}</button>)}</div><div className="auction-filter-chips"><button data-analytics-event="auction_rookie_filter_toggled" className={rookieOnly ? "active" : ""} onClick={() => setRookieOnly(!rookieOnly)}>只看 Rookie</button><button data-analytics-event="auction_ending_filter_toggled" className={endingOnly ? "active" : ""} onClick={() => setEndingOnly(!endingOnly)}>即将结束</button></div></section>
    <section className="auction-radar-grid"><article className="data-panel"><div className="terminal-panel-heading"><div><span className="section-kicker">WHAT IS HOT</span><h2><Flame className="auction-hot-icon" size={17} />今日热门拍卖</h2></div><small>{rows.length} 场符合筛选</small></div><div className="auction-feed">{rows.map((auction) => <article className="auction-card" key={auction.id}><div className="auction-card-mark"><Gavel size={20} /><span>{auction.sourceName}</span></div><div className="auction-card-main"><b>{auction.playerName}</b><strong>{auction.cardYear} {auction.setName} · {auction.parallel}</strong><small>{auction.gradingCompany ? `${auction.gradingCompany} ${auction.grade}` : "未评级"} · {auction.bidCount} bids · {auction.watcherCount} watchers</small></div><div className="auction-card-price"><span>当前竞价</span><b>{auction.currency === "CNY" ? "¥" : "$"}{auction.currentBid.toLocaleString()}</b><em className={auction.heatScore >= 80 ? "very-hot" : "hot"}>{auction.heatScore} · {heatLabel(auction.heatScore)}</em><small>{auction.auctionStatus === "ending_soon" ? "即将结束" : "进行中"} · {auction.heatChange24h >= 0 ? "+" : ""}{auction.heatChange24h} / 24H</small></div><button data-analytics-event="auction_watch_toggled" className={watched.has(auction.id) ? "watch active" : "watch"} aria-label="关注拍卖" onClick={() => toggleWatch(auction.id)}><Star size={15} fill={watched.has(auction.id) ? "currentColor" : "none"} /></button></article>)}</div></article>
      <aside className="auction-side-stack"><article className="data-panel"><div className="terminal-panel-heading"><div><span className="section-kicker">TRENDING PLAYERS</span><h2>热门球员</h2></div><span className="auction-window">24H</span></div>{hotPlayers.map((auction, index) => <Link data-analytics-event="auction_player_viewed" href={`/players/${auction.playerId}`} className="auction-player-row" key={auction.playerId}><span>{String(index + 1).padStart(2, "0")}</span><b>{auction.playerName}</b><small>{auction.bidCount} bids · Heat {auction.heatScore}</small><em>+{auction.heatChange24h}</em></Link>)}</article><article className="data-panel auction-trust-panel"><div className="terminal-panel-heading"><div><span className="section-kicker">DATA INTEGRITY</span><h2><ShieldCheck size={15} />数据可信度</h2></div></div><p>平台连接完成前，拍卖源会显示为演示或不可用，不会伪造实时竞价。</p><Link href="/methodology">查看来源状态 →</Link></article></aside>
    </section>
    <p className="source-note">Heat Score 仅代表当前拍卖关注与竞价活跃程度，不代表投资价值或价格涨跌预测。</p>
  </main>;
}
