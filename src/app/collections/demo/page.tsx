import Link from "next/link";
import type { Metadata } from "next";
import { CardVisual } from "@/components/card-visual";
import { cards, demoPortfolio, getPlayer } from "@/lib/demo-data";

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
    <main className="page-shell inner-page public-profile">
      <section className="profile-hero">
        <span className="collector-avatar">NC</span>
        <div>
          <span className="section-kicker">PUBLIC COLLECTION · DEMO</span>
          <h1>Nucleus Collector</h1>
          <p>
            专注现代新秀卡与高流动性经典卡。所有展示均为演示数据，不提供交易或私信。
          </p>
          <div className="profile-meta">
            <span>公开卡片 {publicItems.length}</span>
            <span>收藏合集 2</span>
            <span>中国香港 · 时区 Asia/Hong_Kong</span>
          </div>
        </div>
        <button className="button button-secondary">复制公开链接</button>
      </section>
      <div className="public-privacy">
        <b>隐私说明</b>
        <span>真实姓名、联系方式、购买成本、盈亏和精确资产总额默认隐藏。</span>
      </div>
      <section className="collection-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">FEATURED COLLECTION</span>
            <h2>公开卡片</h2>
          </div>
          <small>收藏者主动公开</small>
        </div>
        <div className="collection-grid">
          {publicItems.map(({ item, card }) => {
            const player = getPlayer(card.playerId)!;
            return (
              <Link href={`/cards/${card.id}`} key={item.id}>
                <CardVisual card={card} player={player} />
                <div>
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
