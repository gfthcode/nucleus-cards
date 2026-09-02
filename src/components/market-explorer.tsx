"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import type { Card, Player, Team } from "@/types/domain";

type MarketRow = Card & { player: Player; team?: Team };

export function MarketExplorer({ rows }: { rows: MarketRow[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [draftYear, setDraftYear] = useState("all");
  const [cohort, setCohort] = useState("all");
  const [risk, setRisk] = useState("all");
  const [price, setPrice] = useState("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [parallel, setParallel] = useState("all");
  const [grade, setGrade] = useState("all");
  const [printRun, setPrintRun] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [watched, setWatched] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = `${row.player.name} ${row.player.displayNameZh} ${row.brand} ${row.productLine} ${row.team?.name ?? ""}`.toLowerCase();
    const amount = row.latestSaleCny ?? 0;
    return haystack.includes(query.toLowerCase()) &&
      (brand === "all" || row.brand === brand) &&
      (draftYear === "all" || row.draftYear === Number(draftYear)) &&
      (cohort === "all" || row.player.cohort === cohort) &&
      (risk === "all" || row.riskLevel === risk) &&
      (price === "all" || (price === "under1k" && amount < 1000) || (price === "1k5k" && amount >= 1000 && amount <= 5000) || (price === "over5k" && amount > 5000)) &&
      (parallel === "all" || row.parallel.toLowerCase().includes(parallel)) &&
      (grade === "all" || (grade === "graded" ? row.condition === "graded" : row.condition !== "graded")) &&
      (printRun === "all" || (printRun === "numbered" ? Boolean(row.printRun) : !row.printRun));
  }).sort((a,b) => (b.latestSaleCny ?? 0) - (a.latestSaleCny ?? 0)), [rows, query, brand, draftYear, cohort, risk, price, parallel, grade, printRun]);

  function toggleWatch(id: string) {
    setWatched((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  return <>
    <section className="terminal-filter-panel" aria-label="行情筛选">
      <div className="terminal-filter-row">
        <label className="terminal-market-search"><Search size={15} aria-hidden /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="球员、球队、品牌或系列" /></label>
        <label><span>选秀年份</span><select value={draftYear} onChange={(e)=>setDraftYear(e.target.value)}><option value="all">全部</option>{[2026,2025,2024,2023,2022,2021,2020].map(year=><option key={year}>{year}</option>)}</select></label>
        <label><span>品牌</span><select value={brand} onChange={(e)=>setBrand(e.target.value)}><option value="all">全部品牌</option><option>Topps</option><option>Panini</option><option>Upper Deck</option></select></label>
        <label><span>价格区间</span><select value={price} onChange={(e)=>setPrice(e.target.value)}><option value="all">全部价格</option><option value="under1k">¥1,000 以下</option><option value="1k5k">¥1,000—5,000</option><option value="over5k">¥5,000 以上</option></select></label>
        <button className={advancedOpen ? "filter-toggle active" : "filter-toggle"} onClick={()=>setAdvancedOpen(!advancedOpen)}><SlidersHorizontal size={14} />更多筛选</button>
      </div>
      <div className="terminal-filter-tags" aria-label="快速筛选">
        <button className={cohort === "all" ? "active" : ""} onClick={()=>setCohort("all")}>全部卡片</button>
        <button className={cohort === "core_rookie" ? "active" : ""} onClick={()=>setCohort("core_rookie")}>核心新秀</button>
        <button className={risk === "high" ? "active warning" : ""} onClick={()=>setRisk(risk === "high" ? "all" : "high")}>高风险</button>
        <label className="sr-only-label"><span>球员代际</span><select aria-label="球员代际" value={cohort} onChange={(e)=>setCohort(e.target.value)}><option value="all">全部代际</option><option value="core_rookie">核心新秀</option><option value="recent_rookie">近年新秀</option><option value="young_core">年轻核心</option><option value="prime">当打球员</option><option value="veteran">老将</option><option value="retired_legend">退役传奇</option></select></label>
      </div>
      {advancedOpen && <div className="terminal-advanced-filters">
        <label><span>平行版本</span><select value={parallel} onChange={(e)=>setParallel(e.target.value)}><option value="all">全部</option><option value="silver">Silver</option><option value="gold">Gold</option></select></label>
        <label><span>评级状态</span><select value={grade} onChange={(e)=>setGrade(e.target.value)}><option value="all">全部</option><option value="graded">已评级</option><option value="raw">裸卡</option></select></label>
        <label><span>限编数量</span><select value={printRun} onChange={(e)=>setPrintRun(e.target.value)}><option value="all">全部</option><option value="numbered">有限编</option><option value="open">非限编</option></select></label>
        <label><span>风险等级</span><select value={risk} onChange={(e)=>setRisk(e.target.value)}><option value="all">全部</option><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select></label>
      </div>}
    </section>
    <div className="result-meta"><span>共 <b>{filtered.length}</b> 张标准化卡片</span><small>按最新可信成交价排序 · 在售标价不计入收益</small></div>
    <section className="market-table terminal-market-table data-panel">
      <div className="table-wrap"><table><thead><tr><th aria-label="关注" /><th>卡片名称</th><th>最新成交价</th><th>7D%</th><th>30D%</th><th>90D%</th><th>成交量</th><th>流动性评分</th></tr></thead>
      <tbody>{filtered.map((row)=><tr className={selected === row.id ? "selected" : ""} onClick={()=>setSelected(row.id)} key={row.id}>
        <td><button className={watched.has(row.id) ? "watch active" : "watch"} aria-label={watched.has(row.id) ? "取消关注" : "加入关注"} onClick={(event)=>{event.stopPropagation();toggleWatch(row.id);}}><Star size={14} fill={watched.has(row.id) ? "currentColor" : "none"} /></button></td>
        <td><Link className="market-card-link" href={`/cards/${row.id}`}><span className="mini-card">{row.player.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</span><span><b>{row.player.name}</b><small>{row.releaseYear} {row.brand} {row.productLine} {row.cardNumber} · {row.parallel}</small></span></Link></td>
        <td data-label="最新成交价">{row.latestSaleCny ? <><b className="mono">¥{row.latestSaleCny.toLocaleString()}</b><small>真实成交</small></> : <span className="no-data">暂无成交</span>}</td>
        {[row.change7d,row.change30d,row.change90d].map((value,index)=><td data-label={["7D","30D","90D"][index]} className={(value ?? 0) >= 0 ? "up mono" : "down mono"} key={index}>{value == null ? "—" : `${value > 0 ? "+" : ""}${value}%`}</td>)}
        <td data-label="成交量"><b className="mono">{row.sales30d}</b><small>近 30 日</small></td>
        <td data-label="流动性"><b className="mono">{row.liquidity}</b><span className="liquidity-meter"><i style={{width:`${row.liquidity}%`}} /></span></td>
      </tr>)}{!filtered.length && <tr><td colSpan={8}><div className="empty-state"><b>暂无成交数据</b><span>调整筛选条件或刷新后重试。</span><button onClick={()=>{setQuery("");setBrand("all");setDraftYear("all");}}>刷新</button></div></td></tr>}</tbody></table></div>
    </section>
  </>;
}
