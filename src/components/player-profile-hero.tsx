import Link from "next/link";
import { ArrowUpRight, Flame, MapPin } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import type { Card, Player, Team } from "@/types/domain";
import styles from "./player-profile-hero.module.css";

export function PlayerProfileHero({ player, team, lead }: { player: Player; team?: Team; lead?: Card }) {
  return <section className={styles.hero}>
    <div className={styles.copy}><span>PLAYER INTELLIGENCE</span><p className={styles.number}>#{String(player.draftPick ?? "—").padStart(2, "0")}</p><h1>{player.displayNameZh}<small>{player.name}</small></h1><p className={styles.team}><MapPin size={14} />{team?.name ?? "退役 / 未披露"} · {player.position} · {player.draftYear} 选秀</p><PlayerCohortBadges player={player} /><p className={styles.summary}>市场热度 {player.marketHeat}/100。关联卡片需结合具体版本、成交样本和流动性，而不是将球员热度直接当成价格判断。</p><div className={styles.actions}><Link href={`/market?q=${encodeURIComponent(player.name)}`}>浏览全部卡片 <ArrowUpRight size={14} /></Link><Link href={`/analysis?player=${player.id}`}>AI 市场研究</Link></div></div>
    <div className={styles.signal}><span>AI MARKET VIEW</span><strong>{(lead?.change30d ?? 0) >= 0 ? "短期 · Positive" : "短期 · Watch"}</strong><p>{(lead?.change30d ?? 0) >= 0 ? "成交趋势保持向上，但当前样本不足以替代个人判断。" : "价格波动仍需由更多成交样本确认。"}</p><div><b>LONG TERM</b><span>{player.marketHeat >= 70 ? "强关注" : "持续观察"}</span></div><div><b>CONFIDENCE</b><span>{lead?.dataCompleteness ?? 0}/100</span></div></div>
    {lead && <Link className={styles.card} href={`/cards/${lead.id}`}><CardVisual card={lead} player={player} /><span><Flame size={13} />代表卡 · {lead.latestSaleCny ? `¥${lead.latestSaleCny.toLocaleString()}` : "暂无成交"}</span></Link>}
  </section>;
}
