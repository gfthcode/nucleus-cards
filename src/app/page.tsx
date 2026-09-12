import Link from "next/link";
import { ArrowRight, BarChart3, Camera, Check, Search, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { AppPreviewWindow } from "@/components/marketing/app-preview-window";
import { CardVisual } from "@/components/card-visual";
import styles from "@/components/marketing/marketing.module.css";
import { cards, demoPortfolio, getPlayer } from "@/lib/demo-data";

function joinedCard(id: string) {
  const card = cards.find((item) => item.id === id);
  const player = card ? getPlayer(card.playerId) : undefined;
  return card && player ? { card, player } : undefined;
}

export default function Home() {
  const previewRows = ["2", "19", "21", "20"].map(joinedCard).filter((row): row is NonNullable<typeof row> => Boolean(row));
  const collection = demoPortfolio.slice(0, 3).map((item) => joinedCard(item.cardId)).filter((row): row is NonNullable<typeof row> => Boolean(row));

  return <main className={`${styles.home} ${styles.marketingHome}`}>
    <section className={styles.homeHero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <span>NBA SPORTS CARD COLLECTION MANAGER</span>
        <h1 id="home-title"><span>一个更聪明的</span><span>球星卡</span><span>收藏家。</span></h1>
        <p>把卡片、球员、球队、成交和收藏进度放在一起。先找到正确的卡，再用清晰的市场证据决定下一步。</p>
        <div className={styles.heroActions}><Link href="/market">探索市场 <ArrowRight size={16} /></Link><Link href="/collections/demo">浏览公开收藏 <WalletCards size={15} /></Link></div>
        <div className={styles.heroMeta}><span>免费使用</span><span>·</span><span>演示数据清晰标注</span><span>·</span><span>NBA / CNY</span></div>
      </div>
      <AppPreviewWindow rows={previewRows} />
    </section>

    <section id="features" className={styles.sectionBand} aria-labelledby="features-title">
      <header><span className={styles.featureKicker}>FOR THE WAY YOU COLLECT</span><h2 id="features-title">让每一次收藏，都更有把握。</h2><p>从发现下一张卡到追踪长期持仓，Nucleus Cards 把复杂信息整理成收藏者真正需要的几个动作。</p></header>
      <div className={styles.featureGrid}>
        <article className={styles.featureCard}><Search size={22} /><h3>卡片与球员搜索</h3><p>按球员、球队、年份、系列和卡号快速找到正确身份，避免把相似卡混在一起。</p></article>
        <article className={styles.featureCard}><BarChart3 size={22} /><h3>行情与成交</h3><p>把在售标价与历史成交分开呈现，样本不足时明确显示“未知”，不制造虚假的精确感。</p></article>
        <article className={styles.featureCard}><Sparkles size={22} /><h3>AI 收藏研究</h3><p>用可解释的规则阅读热度、流动性、数据完整度和风险，帮助你先比较再决定。</p></article>
      </div>
    </section>

    <section id="market" className={styles.splitSection} aria-labelledby="market-title">
      <div><span className={styles.featureKicker}>MARKET OVERVIEW</span><h2 id="market-title">卡片不只是目录，还是一条可以核验的证据链。</h2><p>每张卡都有自己的身份指纹：年份、系列、平行、卡号、评级和印刷球队。打开市场页面即可在画廊与表格之间切换，按自己的方式浏览。</p><Link className={styles.heroActions} href="/market">打开行情市场 <ArrowRight size={15} /></Link></div>
      <div className={styles.splitVisual}><div className={styles.metricRow}><div><small>CARDS TRACKED</small><strong>4,000+</strong></div><div><small>MARKET SAMPLES</small><strong>28</strong></div><div><small>DATA STATUS</small><strong>清晰</strong></div></div><div className={styles.mockList}><span>RECENT MARKET SIGNALS</span><b>Victor Wembanyama · Silver Prizm</b><small>成交样本 28 · 流动性 91 · 观察口径</small><b>Shai Gilgeous-Alexander · Silver Prizm</b><small>样本不足 · 等待授权来源</small></div></div>
    </section>

    <section id="collection" className={`${styles.splitSection} ${styles.reverse}`} aria-labelledby="collection-title">
      <div className={styles.splitVisual}><div className={styles.collectionPreviewHeader}><span>MY COLLECTION</span><strong>公开收藏预览</strong></div><div className={styles.collectionPreviewGrid}>{collection.map(({ card, player }) => <Link href={`/cards/${card.id}`} key={card.id}><CardVisual card={card} player={player} density="compact" /><span>{player.displayNameZh}</span></Link>)}</div><Link className={styles.previewLink} href="/portfolio">管理我的持仓 <ArrowRight size={14} /></Link></div>
      <div><span className={styles.featureKicker}>COLLECTION + PORTFOLIO</span><h2 id="collection-title">你的收藏，应该始终属于你。</h2><p>把公开收藏、个人持仓、关注列表和价格提醒放在同一套清晰的入口下。成本与盈亏默认私密，公开什么由你决定。</p><ul className={styles.checkList}><li><Check size={15} />收藏与持仓分开管理</li><li><Check size={15} />从卡片详情一键加入关注</li><li><Check size={15} />隐私状态清楚可见</li></ul></div>
    </section>

    <section id="scanner" className={styles.splitSection} aria-labelledby="scanner-title">
      <div><span className={styles.featureKicker}>SMART CARD SCANNING</span><h2 id="scanner-title">从一张照片，回到正确的卡片。</h2><p>未来接入授权图像来源或扫描服务后，识别器会先给出候选匹配，再让你逐张确认。不会把未经核验的图片当成事实写入收藏。</p><Link className={styles.heroActions} href="/analysis">查看 AI 研究 <Sparkles size={15} /></Link></div>
      <div className={styles.splitVisual}><div className={styles.scannerMock}><Camera size={28} /><strong>扫描 · 匹配 · 确认</strong><span>每一张卡都经过你的最后确认</span><div><Check size={14} />身份与卡号</div><div><Check size={14} />图片与来源</div><div><Check size={14} />成交与挂牌口径</div></div></div>
    </section>

    <section id="faq" className={styles.sectionBand} aria-labelledby="faq-title"><header><span className={styles.featureKicker}>FAQ</span><h2 id="faq-title">开始之前，先知道这些。</h2><p>我们把演示数据、授权来源和隐私边界写在产品里，而不是藏在脚注中。</p></header><div className={styles.faqGrid}><article className={styles.faqItem}><h3>现在的价格是真实成交吗？</h3><p>当前公开版本包含演示快照。未接入授权平台前，不会把演示金额写成实时或历史真实成交。</p></article><article className={styles.faqItem}><h3>可以导入我的收藏吗？</h3><p>持仓与收藏入口已经保留，支持在应用内管理；外部 CSV/API 导入取决于你的授权数据源。</p></article><article className={styles.faqItem}><h3>AI 会替我做投资决定吗？</h3><p>不会。AI 研究只解释站内指标与样本完整度，不构成预测或交易建议。</p></article><article className={styles.faqItem}><h3>如何保护我的持仓隐私？</h3><p>成本、盈亏与精确资产总额默认隐藏，公开收藏与个人持仓使用不同入口。</p></article></div></section>

    <aside className={styles.homeTrust}><ShieldCheck size={17} /><span><b>数据边界始终可见</b>　来源、样本数量、授权状态和最后更新时间会随页面一起显示。</span><Link href="/methodology">查看数据方法 <ArrowRight size={14} /></Link></aside>
  </main>;
}
