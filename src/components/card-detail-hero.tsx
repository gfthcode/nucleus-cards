import Link from "next/link";
import { ArrowUpRight, Layers3, ShieldCheck } from "lucide-react";
import { CardActions } from "@/components/card-actions";
import { CardVisual } from "@/components/card-visual";
import { CurrencyValue } from "@/components/currency-switcher";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { DemoDataBadge, EvidenceBadge } from "@/components/data-provenance";
import type { Card, Player, Team } from "@/types/domain";
import styles from "./card-detail-hero.module.css";

type Reference = { median: number | null; samples: number; precise: boolean; range: [number, number] | null };

export function CardDetailHero({ card, player, currentTeam, printedTeam, reference }: { card: Card; player: Player; currentTeam?: Team; printedTeam?: Team; reference: Reference }) {
  const price = reference.median ?? card.latestSaleCny;
  return <>
    <nav className={styles.breadcrumbs} aria-label="面包屑"><Link href="/market">市场</Link><span>/</span><Link href={`/players/${player.id}`}>{player.name}</Link><span>/</span><b>{card.cardNumber}</b></nav>
    <section className={styles.hero}>
      <aside className={styles.visualRail}><div className={styles.visualSticky}><CardVisual card={card} player={player} /><small>卡图状态：{card.demo ? "演示 / 待授权核验" : "按来源状态展示"}</small></div></aside>
      <div className={styles.identity}>
        <div className={styles.badges}>{card.demo ? <DemoDataBadge compact /> : <EvidenceBadge verified />}{card.rookie && <span>ROOKIE CARD</span>}<span>{card.parallel}</span></div>
        <PlayerCohortBadges player={player} />
        <h1>{player.name}<small>{player.displayNameZh}</small></h1>
        <h2>{card.releaseYear} {card.brand} {card.productLine} <span>#{card.cardNumber}</span></h2>
        <p className={styles.specLine}>{card.parallel}{card.printRun ? ` · /${card.printRun}` : ""} · {card.autograph ? (card.autographType ?? "签字") : "非签字"} · {card.condition === "graded" ? `${card.gradingCompany} ${card.grade}` : "裸卡"}</p>
        <div className={styles.teamLine}><span>现属 {currentTeam?.name ?? "退役 / 未披露"}</span><i /> <span>印刷球队 {printedTeam?.name ?? "未披露"}</span></div>
        <div className={styles.actionRow}><CardActions /><Link href={`/analysis?card=${card.id}`}><ShieldCheck size={14} />查看 AI 研究</Link></div>
        <div className={styles.identityKey}><Layers3 size={14} /><span>身份键</span><code>{card.identityKey}</code><small>匹配度 {card.matchConfidence}%</small></div>
      </div>
      <aside className={styles.market}>
        <span>最新真实成交 · MARKET REFERENCE</span>
        <div className={styles.price}><CurrencyValue cny={price} /><small>{reference.samples} 笔可计算成交 · {reference.precise ? "精确口径" : "观察口径"}</small></div>
        <div className={styles.trends}>{[["7D", card.change7d], ["30D", card.change30d], ["90D", card.change90d]].map(([label, value]) => <div key={String(label)}><span>{label}</span><b className={Number(value) >= 0 ? styles.up : styles.down}>{value == null ? "—" : `${Number(value) > 0 ? "+" : ""}${value}%`}</b></div>)}</div>
        <div className={styles.marketDivider} />
        <p><span>最新在售标价</span><b>{card.latestListingCny ? `¥${card.latestListingCny.toLocaleString()}` : "暂无"}</b><small>在售标价不纳入历史价格参考</small></p>
        <Link href="#recent-sales">查看成交证据 <ArrowUpRight size={14} /></Link>
      </aside>
    </section>
    <section className={styles.facts} aria-label="卡片市场事实"><div><span>30D 成交</span><b>{card.sales30d} 笔</b></div><div><span>流动性</span><b>{card.liquidity}/100</b></div><div><span>当前挂牌</span><b>{card.listingsCount} 张</b></div><div><span>数据完整度</span><b>{card.dataCompleteness}%</b></div><div><span>历史区间</span><b>{reference.range ? `¥${reference.range[0].toLocaleString()}—${reference.range[1].toLocaleString()}` : "暂无"}</b></div></section>
  </>;
}
