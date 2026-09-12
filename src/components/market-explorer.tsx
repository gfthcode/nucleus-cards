"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Grid2X2, List, Search, SlidersHorizontal, Star } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import { MetricHelp } from "@/components/data-provenance";
import type { Card, Player, Team } from "@/types/domain";
import styles from "./market-explorer.module.css";

type MarketRow = Card & { player: Player; team?: Team };
type View = "gallery" | "table";
const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

export function MarketExplorer({ rows }: { rows: MarketRow[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [brand, setBrand] = useState("all");
  const [draftYear, setDraftYear] = useState("all");
  const [price, setPrice] = useState("all");
  const [cohort, setCohort] = useState("all");
  const [risk, setRisk] = useState("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [onlySales, setOnlySales] = useState(false);
  const [highLiquidity, setHighLiquidity] = useState(false);
  const [view, setView] = useState<View>("gallery");
  const [watched, setWatched] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = `${row.player.name} ${row.player.displayNameZh} ${row.brand} ${row.productLine} ${row.team?.name ?? ""}`.toLowerCase();
    const amount = row.latestSaleCny ?? 0;
    return haystack.includes(query.toLowerCase()) &&
      (brand === "all" || row.brand === brand) &&
      (draftYear === "all" || row.draftYear === Number(draftYear)) &&
      (risk === "all" || row.riskLevel === risk) &&
      (cohort === "all" || row.player.cohort === cohort) &&
      (price === "all" || (price === "under1k" && amount < 1000) || (price === "1k5k" && amount >= 1000 && amount <= 5000) || (price === "over5k" && amount > 5000)) &&
      (!onlySales || row.sales30d > 0) && (!highLiquidity || row.liquidity >= 70);
  }).sort((a, b) => (b.latestSaleCny ?? 0) - (a.latestSaleCny ?? 0)), [rows, query, brand, draftYear, price, risk, cohort, onlySales, highLiquidity]);

  function reset() { setQuery(""); setBrand("all"); setDraftYear("all"); setPrice("all"); setRisk("all"); setCohort("all"); setOnlySales(false); setHighLiquidity(false); }
  function toggleWatch(id: string) { setWatched((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  return <section className={styles.explorer} aria-label="球星卡市场浏览器">
    <div className={styles.controls}>
      <label className={styles.search}><Search size={17} aria-hidden /><input data-analytics-event="search_used" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="球员、球队、品牌或系列" /></label>
      <div className={styles.selects}>
        <label><span>年份</span><select value={draftYear} onChange={(event) => setDraftYear(event.target.value)}><option value="all">全部年份</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
        <label><span>品牌</span><select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="all">全部品牌</option><option>Topps</option><option>Panini</option><option>Upper Deck</option></select></label>
        <label><span>成交区间</span><select value={price} onChange={(event) => setPrice(event.target.value)}><option value="all">全部价格</option><option value="under1k">¥1,000 以下</option><option value="1k5k">¥1,000—5,000</option><option value="over5k">¥5,000 以上</option></select></label>
        <label><span>球员代际</span><select aria-label="球员代际" value={cohort} onChange={(event) => setCohort(event.target.value)}><option value="all">全部代际</option><option value="core_rookie">核心新秀</option><option value="recent_rookie">近年新秀</option><option value="young_core">年轻核心</option><option value="prime">当打球员</option><option value="veteran">老将</option><option value="retired_legend">退役传奇</option></select></label>
      </div>
      <button className={advancedOpen ? styles.utilityActive : styles.utility} onClick={() => setAdvancedOpen((open) => !open)}><SlidersHorizontal size={15} /> 筛选</button>
    </div>
    <div className={styles.chips} aria-label="快速筛选">
      <button className={!onlySales ? styles.selected : ""} onClick={() => setOnlySales(false)}>全部卡片</button>
      <button className={onlySales ? styles.selected : ""} onClick={() => setOnlySales((value) => !value)}>有成交样本</button>
      <button className={highLiquidity ? styles.selected : ""} onClick={() => setHighLiquidity((value) => !value)}>高流动性</button>
      <button className={risk === "high" ? styles.danger : ""} onClick={() => setRisk((value) => value === "high" ? "all" : "high")}>高风险</button>
    </div>
    {advancedOpen && <div className={styles.advanced}><label><span>风险等级</span><select value={risk} onChange={(event) => setRisk(event.target.value)}><option value="all">全部</option><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select></label><p>筛选只影响当前浏览；收益率、流动性和热度均为辅助研究指标，不构成投资建议。</p></div>}
    <div className={styles.resultsBar}>
      <div><span>发现</span><strong>{filtered.length}</strong><small> 张标准化卡片</small></div>
      <p>按最近成交价排序 · <MetricHelp label="流动性评分" description="结合成交频率、在售深度与样本稳定性的观察指标，不代表价格回报。" /></p>
      <div className={styles.viewSwitch} aria-label="显示方式"><button className={view === "gallery" ? styles.selected : ""} onClick={() => setView("gallery")} aria-label="卡片视图"><Grid2X2 size={16} /></button><button className={view === "table" ? styles.selected : ""} onClick={() => setView("table")} aria-label="表格视图"><List size={17} /></button></div>
    </div>
    {!filtered.length ? <div className={styles.empty}><b>没有匹配的标准化卡片</b><span>换个关键词或清除筛选条件后再试。</span><button onClick={reset}>清除筛选</button></div> : view === "gallery" ? <div className={styles.gallery}>{filtered.map((row) => <article className={styles.product} key={row.id}><Link aria-label={`${row.player.name} ${row.releaseYear} ${row.productLine}`} href={`/cards/${row.id}`} data-analytics-event="card_viewed" data-analytics-label={row.player.name}><CardVisual card={row} player={row.player} density="compact" /></Link><footer><span>{row.demo ? "演示成交样本" : "已核验成交"}</span><button className={watched.has(row.id) ? styles.watching : ""} onClick={() => toggleWatch(row.id)} aria-label={watched.has(row.id) ? "取消关注" : "加入关注"}><Star size={14} fill={watched.has(row.id) ? "currentColor" : "none"} /></button></footer></article>)}</div> : <div className={styles.tableWrap}><table><thead><tr><th>卡片</th><th>最新成交</th><th>30D</th><th>样本</th><th>流动性</th><th aria-label="关注" /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><Link aria-label={`${row.player.name} ${row.releaseYear} ${row.productLine}`} href={`/cards/${row.id}`}><b>{row.player.displayNameZh}</b><small>{row.releaseYear} {row.brand} · {row.parallel} · #{row.cardNumber}</small></Link></td><td><b>{row.latestSaleCny ? `¥${row.latestSaleCny.toLocaleString()}` : "暂无成交"}</b><small>{row.demo ? "演示样本" : "核验样本"}</small></td><td className={(row.change30d ?? 0) >= 0 ? styles.up : styles.down}>{row.change30d == null ? "—" : `${row.change30d > 0 ? "+" : ""}${row.change30d}%`}</td><td>{row.sales30d} 笔 / 30D</td><td>{row.liquidity}/100</td><td><button className={watched.has(row.id) ? styles.watching : ""} onClick={() => toggleWatch(row.id)} aria-label={watched.has(row.id) ? "取消关注" : "加入关注"}><Star size={14} fill={watched.has(row.id) ? "currentColor" : "none"} /></button></td></tr>)}</tbody></table></div>}
    <p className={styles.methodology}>来源、成交与样本状态均在详情页保留；在售标价不会被写成真实成交。<Link href="/methodology#metrics">阅读指标口径 →</Link></p>
  </section>;
}
