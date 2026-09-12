"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Gavel, Globe2, ShieldCheck, Star } from "lucide-react";
import { activeAuctions, demoAuctions } from "@/lib/auction-data";
import type { AuctionRegion } from "@/types/domain";
import { CardVisual } from "@/components/card-visual";
import { cards, getPlayer } from "@/lib/demo-data";
import { DemoDataBadge } from "@/components/data-provenance";
import styles from "./auction-radar.module.css";

const regionLabels: Record<AuctionRegion, string> = { GLOBAL: "全球", INTL: "海外", CN: "国内" };
const heatLabel = (score: number) => score >= 80 ? "Very Hot" : score >= 60 ? "Hot" : score >= 40 ? "Normal" : "Low";

export function AuctionRadar() {
  const [region, setRegion] = useState<AuctionRegion>("GLOBAL");
  const [rookieOnly, setRookieOnly] = useState(false);
  const [endingOnly, setEndingOnly] = useState(false);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const rows = useMemo(() => activeAuctions.filter((auction) => (region === "GLOBAL" || (region === "CN" ? auction.sourceRegion === "CN" : auction.sourceRegion !== "CN")) && (!rookieOnly || auction.rookieDesignation) && (!endingOnly || auction.auctionStatus === "ending_soon")), [region, rookieOnly, endingOnly]);
  const endingSoon = activeAuctions.filter((auction) => auction.auctionStatus === "ending_soon");
  const hotPlayers = [...rows].sort((a, b) => b.heatScore - a.heatScore).slice(0, 4);
  const toggleWatch = (id: string) => setWatched((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <main className={`${styles.page} page-shell inner-page`}>
    <header className={styles.masthead}><div><span>AUCTION RADAR</span><h1>拍卖，<br />先看状态。</h1><p>平台、销售类型、当前竞价与热度会被分别标注。未接入授权源时，页面只展示演示样本，不会伪装成实时竞价。</p></div><aside><DemoDataBadge /><strong>{activeAuctions.length}</strong><span>个活跃拍卖样本</span><small>{endingSoon.length} 个标注为即将结束</small></aside></header>
    <section className={styles.toolbar}><div>{(Object.keys(regionLabels) as AuctionRegion[]).map((key) => <button className={region === key ? styles.active : ""} data-analytics-event="auction_region_changed" key={key} onClick={() => setRegion(key)}><Globe2 size={14} />{regionLabels[key]}</button>)}</div><div><button className={rookieOnly ? styles.active : ""} data-analytics-event="auction_rookie_filter_toggled" onClick={() => setRookieOnly(!rookieOnly)}>只看 Rookie</button><button className={endingOnly ? styles.active : ""} data-analytics-event="auction_ending_filter_toggled" onClick={() => setEndingOnly(!endingOnly)}>即将结束</button></div></section>
    <section className={styles.layout}><div><header className={styles.sectionHeader}><div><span>LIVE BOARD</span><h2><Flame size={18} />当前拍卖</h2></div><small>{rows.length} 场符合筛选 · 按拍卖热度排列</small></header><div className={styles.grid}>{rows.map((auction) => { const card = cards.find((item) => item.id === auction.cardId); const player = card ? getPlayer(card.playerId) : undefined; return <article className={styles.auction} key={auction.id}>{card && player ? <Link href={`/cards/${card.id}`}><CardVisual card={card} player={player} density="compact" /></Link> : <div className={styles.noImage}>IMAGE NOT AVAILABLE</div>}<div className={styles.auctionCopy}><div><span>{auction.sourceName} · {auction.saleType === "auction" ? "拍卖" : auction.saleType}</span><button data-analytics-event="auction_watch_toggled" className={watched.has(auction.id) ? styles.watching : ""} onClick={() => toggleWatch(auction.id)} aria-label="关注拍卖"><Star size={14} fill={watched.has(auction.id) ? "currentColor" : "none"} /></button></div><b>{auction.playerName}</b><small>{auction.cardYear} {auction.setName} · {auction.parallel}</small><dl><div><dt>当前竞价</dt><dd>{auction.currency === "CNY" ? "¥" : "$"}{auction.currentBid.toLocaleString()}</dd></div><div><dt>拍卖热度</dt><dd>{auction.heatScore} <em>{heatLabel(auction.heatScore)}</em></dd></div></dl><p><Gavel size={13} />{auction.bidCount} bids · {auction.watcherCount} watchers · {auction.auctionStatus === "ending_soon" ? "即将结束" : "进行中"}</p></div></article>; })}</div></div><aside className={styles.aside}><article><header><span>HOT PLAYERS</span><h2>今日关注球员</h2></header>{hotPlayers.map((auction, index) => <Link href={`/players/${auction.playerId}`} key={auction.id}><span>{String(index + 1).padStart(2, "0")}</span><b>{auction.playerName}</b><small>{auction.bidCount} bids · Heat {auction.heatScore}</small><em>{auction.heatChange24h >= 0 ? "+" : ""}{auction.heatChange24h}</em></Link>)}</article><article className={styles.integrity}><ShieldCheck size={17} /><div><b>数据可信度</b><p>Heat 只代表当前竞价和关注活跃度，不代表价格预测。闲鱼普通挂牌不会混入拍卖数据。</p><Link href="/methodology">查看数据来源 →</Link></div></article><small>覆盖 {new Set(demoAuctions.map((auction) => auction.sourceId)).size} 个国内 / 海外演示源</small></aside></section>
  </main>;
}
