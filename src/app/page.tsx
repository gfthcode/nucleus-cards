import Link from "next/link";
import { ArrowRight, Gavel, Search, ShieldCheck } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import { MarketMoversSection } from "@/components/home/market-movers-section";
import { PlayerSpotlight } from "@/components/home/player-spotlight";
import styles from "@/components/home/premium-home.module.css";
import { activeAuctions } from "@/lib/auction-data";
import { cards, demoPortfolio, getCardSales, getPlayer, getTeam } from "@/lib/demo-data";
import { calculateMarketReference } from "@/lib/market-math";

function joinedCard(id: string) {
  const card = cards.find((item) => item.id === id);
  const player = card ? getPlayer(card.playerId) : undefined;
  return card && player ? { card, player } : undefined;
}

export default function Home() {
  const hero = joinedCard("2") ?? joinedCard(cards[0]?.id ?? "");
  if (!hero) return null;
  const movers = ["19", "2", "21", "20"].map(joinedCard).filter((row): row is NonNullable<typeof row> => Boolean(row));
  const spotlight = joinedCard("19") ?? movers[0];
  const team = spotlight.player.currentTeamId ? getTeam(spotlight.player.currentTeamId) : undefined;
  const reference = calculateMarketReference(getCardSales(hero.card.id));
  const collection = demoPortfolio.slice(0, 3).map((item) => joinedCard(item.cardId)).filter((row): row is NonNullable<typeof row> => Boolean(row));

  return <main className={styles.home}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <span>NUCLEUS / CARD MARKET INTELLIGENCE</span>
        <h1 id="home-title"><span>THE MARKET</span><span>BEHIND</span><span>EVERY CARD.</span></h1>
        <p>从一张真实卡片开始，连接身份、成交、挂牌与风险。先看可以核验的市场证据，再做收藏判断。</p>
        <div className={styles.heroActions}><Link href="/market">探索市场 <ArrowRight size={15} /></Link><Link href="/market?q=Victor%20Wembanyama"><Search size={14} />搜索卡片</Link></div>
        <div className={styles.heroMeta}><span>DEMO SNAPSHOT</span><span>·</span><span>样本不足不伪造精确结论</span></div>
      </div>
      <div className={styles.heroProduct}>
        <Link className={styles.heroCard} href={`/cards/${hero.card.id}`} aria-label="查看文班亚马卡片详情"><CardVisual card={hero.card} player={hero.player} /></Link>
        <div className={styles.heroData}><span>市场参考</span><b>{reference.median ? `¥${Math.round(reference.median).toLocaleString()}` : "暂无样本"}</b><small>{reference.samples} 笔可计算样本 · {reference.precise ? "精确口径" : "观察口径"}</small></div>
      </div>
    </section>

    <MarketMoversSection rows={movers} />
    <PlayerSpotlight player={spotlight.player} team={team} card={spotlight.card} />

    <section className={styles.intelligence} aria-labelledby="intelligence-title">
      <div>
        <header className={styles.intelligenceHeader}><span>MARKET INTELLIGENCE</span><h2 id="intelligence-title">不是把数据堆在一起，而是让下一步更明确。</h2><p>所有价格、热度和评级信息都应回到来源、样本和身份。这里保留真实工作流：先核验，再比较，最后再决定是否关注。</p></header>
        <div className={styles.evidenceList}>
          <article><span>01 / MATCH</span><div><b>卡片身份必须可复核</b><p>年份、系列、平行、卡号、评级与印刷球队共同构成卡片指纹。</p></div><small>进入卡片详情 →</small></article>
          <article><span>02 / SALES</span><div><b>成交与挂牌从不混为一谈</b><p>只有合格成交样本参与市场参考；在售标价始终单独标记。</p></div><small>查看市场口径 →</small></article>
          <article><span>03 / RISK</span><div><b>先识别流动性与样本不足</b><p>少量成交、极端价格和信息缺口都应显式显示，而不是被视觉包装为信号。</p></div><small>阅读风险提醒 →</small></article>
        </div>
      </div>
      <aside className={styles.collectionRail} aria-label="收藏预览"><span>MY COLLECTION</span><h3>持仓中的代表卡</h3>{collection.map(({ card, player }) => <Link href={`/cards/${card.id}`} key={card.id}><CardVisual card={card} player={player} density="compact" /><div><b>{player.name}</b><small>{card.latestSaleCny ? `¥${card.latestSaleCny.toLocaleString()}` : "暂无成交"} · {card.sales30d} 笔样本</small></div></Link>)}<Link href="/portfolio">打开我的持仓 <ArrowRight size={14} /></Link></aside>
    </section>

    <section className={styles.auctionStrip}>
      <div><span>AUCTION MONITORING</span><h2>拍卖不是价格历史，也不只是一个倒计时。</h2><p>当前监测 {activeAuctions.length} 场已分类为拍卖的演示活动；平台会把当前竞价、结束时间、出价人数和来源状态放在同一阅读面板。</p></div>
      <Link href="/auction-radar"><Gavel size={16} />打开拍卖雷达 <ArrowRight size={14} /></Link>
    </section>
    <section className={styles.auctionStrip}>
      <div><span>DATA INTEGRITY</span><h2>把“未知”明确留在界面上。</h2><p>当前公开版本使用本地演示快照。未接入授权来源的数据不会被写成实时成交或投资结论。</p></div>
      <Link href="/methodology"><ShieldCheck size={16} />查看数据与免责声明 <ArrowRight size={14} /></Link>
    </section>
  </main>;
}
