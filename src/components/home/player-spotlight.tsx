import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import type { Card, Player, Team } from "@/types/domain";
import styles from "./premium-home.module.css";

export function PlayerSpotlight({ player, team, card }: { player: Player; team?: Team; card?: Card }) {
  return <section className={styles.spotlight} aria-labelledby="watch-player-title">
    <div className={styles.spotlightCopy}><span>PLAYER TO WATCH</span><p className={styles.spotlightIndex}>/ 01</p><h2 id="watch-player-title">{player.displayNameZh}<small>{player.name}</small></h2><p>{team?.name ?? "NBA"} · {player.position}。市场热度 {player.marketHeat}/100；关联卡价与成交密度需结合样本数阅读。</p><div className={styles.spotlightSignal}><Sparkles size={16} /><span><b>{(card?.change30d ?? 0) >= 0 ? "短期：关注上行催化" : "短期：观察价格回撤"}</b><small>AI 研究基于站内演示规则与数据完整度，不构成预测。</small></span></div><div className={styles.inlineActions}><Link href={`/players/${player.id}`}>查看球员 <ArrowUpRight size={14} /></Link><Link href={`/market?q=${encodeURIComponent(player.name)}`}>查看卡片</Link><Link href={`/analysis?player=${player.id}`}>AI 研究</Link></div></div>
    {card && <Link className={styles.spotlightCard} href={`/cards/${card.id}`}><CardVisual card={card} player={player} /><small>代表卡 · 点击查看市场结构</small></Link>}
  </section>;
}
