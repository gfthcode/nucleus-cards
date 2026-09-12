import Link from "next/link";
import type { Metadata } from "next";
import { CardVisual } from "@/components/card-visual";
import { cards, demoPortfolio, getPlayer } from "@/lib/demo-data";
import styles from "./collection.module.css";

export const metadata: Metadata = {
  title: "Nucleus Collector 的公开收藏",
  description: "公开收藏演示主页",
  openGraph: { images: [] },
  twitter: { card: "summary", images: [] },
};

export default function PublicCollectionPage() {
  const publicItems = demoPortfolio
    .filter((item) => item.isPublic)
    .map((item) => ({
      item,
      card: cards.find((card) => card.id === item.cardId)!,
    }));
  return (
    <main className={`${styles.page} page-shell inner-page`}>
      <section className={styles.masthead}>
        <span className={styles.avatar}>NC</span>
        <div><span>PUBLIC COLLECTION · DEMO</span><h1>Nucleus Collector</h1><p>现代新秀与高流动性经典卡的公开橱窗。展示是收藏者选择公开的演示条目，不提供交易撮合或私信入口。</p></div>
        <dl><div><dt>公开卡片</dt><dd>{publicItems.length}</dd></div><div><dt>收藏合集</dt><dd>02</dd></div><div><dt>公开模式</dt><dd>DEMO</dd></div></dl>
      </section>
      <aside className={styles.privacy}><b>隐私由收藏者决定</b><span>真实姓名、联系方式、成本、盈亏和精确资产总额默认隐藏。</span><Link href="/portfolio">管理我的持仓 →</Link></aside>
      <section className={styles.collection}>
        <header><div><span>FEATURED CARDS</span><h2>公开的收藏选择</h2></div><small>卡片优先 · 收藏者主动公开</small></header>
        <div className={styles.grid}>
          {publicItems.map(({ item, card }) => {
            const player = getPlayer(card.playerId)!;
            return (
              <Link href={`/cards/${card.id}`} key={item.id} className={styles.product}>
                <CardVisual card={card} player={player} />
                <div className={styles.productCopy}>
                  <b>{player.name}</b>
                  <span>
                    {card.releaseYear} {card.productLine}
                  </span>
                  <small>购买成本与盈亏已隐藏</small>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
