import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import type { Card, Player } from "@/types/domain";
import styles from "./premium-home.module.css";

type Row = { card: Card; player: Player };

export function MarketMoversSection({ rows }: { rows: Row[] }) {
  const [lead, ...rest] = rows;
  if (!lead) return null;
  return <section className={styles.movers} aria-labelledby="market-movers-title">
    <header className={styles.sectionHeader}><div><span>MARKET MOVERS</span><h2 id="market-movers-title">正在改变收藏者注意力的卡</h2></div><Link href="/market">查看完整市场 <ArrowUpRight size={15} /></Link></header>
    <div className={styles.moversLayout}>
      <Link className={styles.moverLead} href={`/cards/${lead.card.id}`}><CardVisual card={lead.card} player={lead.player} /><div><span>LEADING MOVE</span><h3>{lead.player.displayNameZh}</h3><p>{lead.card.releaseYear} {lead.card.brand} {lead.card.productLine} · {lead.card.parallel}</p><b>{lead.card.latestSaleCny ? `¥${lead.card.latestSaleCny.toLocaleString()}` : "暂无成交"}</b><em className={(lead.card.change30d ?? 0) >= 0 ? styles.up : styles.down}>{lead.card.change30d == null ? "样本不足" : `${lead.card.change30d > 0 ? "+" : ""}${lead.card.change30d}% / 30D`}</em></div></Link>
      <div className={styles.moverList}>{rest.slice(0, 3).map(({ card, player }, index) => <Link href={`/cards/${card.id}`} key={card.id} className={styles.moverRow}><span>{String(index + 2).padStart(2, "0")}</span><CardVisual card={card} player={player} density="compact" /><div><h3>{player.name}</h3><p>{card.releaseYear} {card.productLine} · {card.parallel}</p><small>{card.sales30d} 笔 30D 样本 · 流动性 {card.liquidity}</small></div><b>{card.latestSaleCny ? `¥${card.latestSaleCny.toLocaleString()}` : "—"}</b><em className={(card.change30d ?? 0) >= 0 ? styles.up : styles.down}>{card.change30d == null ? "—" : `${card.change30d > 0 ? "+" : ""}${card.change30d}%`}</em></Link>)}</div>
    </div>
  </section>;
}
