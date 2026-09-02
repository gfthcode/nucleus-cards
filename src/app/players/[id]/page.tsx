import { notFound } from "next/navigation";
import { Flame, MapPin, TrendingUp } from "lucide-react";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { PlayerTerminalTabs } from "@/components/player-terminal-tabs";
import { getPlayer, getPlayerCards, getTeam, players } from "@/lib/demo-data";

export function generateStaticParams(){return players.map(player=>({id:player.id}));}

export default async function PlayerPage({params}:PageProps<"/players/[id]">){
  const {id}=await params; const player=getPlayer(id); if(!player)notFound();
  const team=player.currentTeamId?getTeam(player.currentTeamId):undefined; const related=getPlayerCards(player.id); const lead=related[0];
  return <main className="page-shell inner-page player-terminal-page">
    <section className="player-terminal-overview data-panel">
      <div className="player-identity"><span className="player-large-avatar">{player.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</span><div><span className="section-kicker">PLAYER OVERVIEW</span><h1>{player.displayNameZh}<small>{player.name}</small></h1><p><MapPin size={13}/>{team?.name??"退役 / 未披露"} · {player.position} · {player.draftYear} 年第 {player.draftPick??"—"} 顺位</p><PlayerCohortBadges player={player}/></div></div>
      <div className="player-market-kpis"><article><span>最新关联卡价</span><strong>{lead?.latestSaleCny?`¥${lead.latestSaleCny.toLocaleString()}`:"—"}</strong><small>真实成交中位价</small></article><article><span>7 日变化</span><strong className={(lead?.change7d??0)>=0?"up":"down"}><TrendingUp size={16}/>{lead?.change7d==null?"—":`${lead.change7d>0?"+":""}${lead.change7d}%`}</strong><small>同卡种口径</small></article><article><span>市场热度指数</span><strong><Flame size={16}/>{player.marketHeat}</strong><small>/ 100 · 观察值</small></article></div>
    </section>
    <PlayerTerminalTabs player={player} cards={related}/>
  </main>;
}
