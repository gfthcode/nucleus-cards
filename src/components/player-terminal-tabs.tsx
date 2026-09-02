"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, HeartPulse, Layers3 } from "lucide-react";
import { PriceChart } from "@/components/price-chart";
import type { Card, Player } from "@/types/domain";

export function PlayerTerminalTabs({ player, cards }: { player: Player; cards: Card[] }) {
  const [tab,setTab] = useState<"market"|"data"|"cards">("market");
  const tabs = [{id:"market" as const,label:"行情趋势",icon:Activity},{id:"data" as const,label:"数据与伤病",icon:HeartPulse},{id:"cards" as const,label:"相关卡片",icon:Layers3}];
  return <section className="player-terminal-tabs data-panel">
    <div className="terminal-tabs" role="tablist" aria-label="球员详情">
      {tabs.map(({id,label,icon:Icon})=><button role="tab" aria-selected={tab===id} className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}><Icon size={14}/>{label}</button>)}
    </div>
    {tab === "market" && <div className="player-tab-content"><PriceChart/><div className="player-sales-table"><h3>近期成交记录</h3><div className="table-wrap"><table><thead><tr><th>日期</th><th>卡片</th><th>成交价</th><th>来源</th></tr></thead><tbody>{cards.slice(0,4).map((card,index)=><tr key={card.id}><td>2026-08-{30-index*3}</td><td>{card.releaseYear} {card.productLine}</td><td className="mono">{card.latestSaleCny?`¥${card.latestSaleCny.toLocaleString()}`:"—"}</td><td>演示可信成交</td></tr>)}</tbody></table></div></div></div>}
    {tab === "data" && <div className="player-data-grid"><div><span className="section-kicker">SEASON SNAPSHOT</span><h3>比赛数据摘要</h3><div className="player-stat-grid compact">{[["得分",player.points],["篮板",player.rebounds],["助攻",player.assists],["上场时间",player.minutes]].map(([label,value])=><div key={String(label)}><span>{label}</span><b>{value}</b></div>)}</div></div><div><span className="section-kicker">INJURY TIMELINE</span><h3>伤病时间线</h3><div className="terminal-timeline"><article><i/><div><b>2026-08 · {player.injuryStatus === "healthy" ? "无新增事件" : "出场状态观察中"}</b><p>来源：演示资料；不作医学判断。</p></div></article><article><i/><div><b>后续数据待补充</b><p>样本不足时不输出趋势推断。</p></div></article></div></div></div>}
    {tab === "cards" && <div className="related-terminal-cards">{cards.length?cards.map(card=><Link href={`/cards/${card.id}`} key={card.id}><span className="related-card-placeholder">{player.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</span><div><b>{card.releaseYear} {card.productLine}</b><small>{card.brand} · {card.parallel} · {card.cardNumber}</small></div><strong>{card.latestSaleCny?`¥${card.latestSaleCny.toLocaleString()}`:"暂无成交"}</strong></Link>):<div className="empty-state"><b>暂无成交数据</b><span>该球员暂未收录相关卡片。</span></div>}</div>}
  </section>;
}
