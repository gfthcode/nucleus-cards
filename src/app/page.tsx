import Link from "next/link";
import { ArrowRight, BarChart3, Camera, Check, Search, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Reveal } from "@/components/marketing/homepage-motion";
import { CardVisual } from "@/components/card-visual";
import styles from "@/components/marketing/marketing.module.css";
import { getFeaturedCards } from "@/lib/featured-cards";

export default function Home() {
  const featuredCards = getFeaturedCards();

  return <main id="home" className={`${styles.home} ${styles.marketingHome}`}>
    <section className={styles.homeHero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <span>证据优先的 NBA 收藏研究</span>
        <h1 id="home-title"><span>先确认卡片，</span><span>再决定下一步。</span></h1>
        <p>把卡片身份、成交证据和个人收藏放在同一个研究入口，减少猜测，保留判断空间。</p>
        <div className={styles.heroActions}><Link href="/market">探索市场 <ArrowRight size={16} /></Link><Link href="/collections/demo">浏览公开收藏 <WalletCards size={15} /></Link></div>
        <div className={styles.heroMeta}><span>演示数据清晰标注</span><span>个人持仓默认私密</span><span>研究结论可回看</span></div>
      </div>
      <figure className={styles.heroArchive}>
        <div className={styles.heroArchiveImage}>
          <div className={styles.heroCardFrame}>
            <CardVisual card={featuredCards[0].card} player={featuredCards[0].player} density="compact" />
          </div>
        </div>
        <figcaption>收藏先从身份核验开始。市场、研究和持仓使用同一张卡片档案。</figcaption>
      </figure>
    </section>

    <section className={styles.heroProofs} aria-label="Nucleus Cards 的研究原则">
      <dl>
        <div><dt>正确身份</dt><dd>年份、系列、平行和卡号共同构成卡片档案。</dd></div>
        <div><dt>可读证据</dt><dd>挂牌、成交与演示数据分开呈现，不混作一个价格。</dd></div>
        <div><dt>个人边界</dt><dd>持仓成本和盈亏留在你的私有空间。</dd></div>
      </dl>
    </section>

    <Reveal><section id="features" className={styles.sectionBand} aria-labelledby="features-title">
      <header><h2 id="features-title">让每一次收藏，都更有把握。</h2><p>从发现下一张卡到追踪长期持仓，Nucleus Cards 把复杂信息整理成收藏者真正需要的几个动作。</p></header>
      <div className={styles.featureGrid}>
        {[
          { title: "卡片与球员搜索", description: "按球员、球队、年份、系列和卡号快速找到正确身份，避免把相似卡混在一起。", href: "/market#market-search", icon: Search },
          { title: "行情与成交", description: "把在售标价与历史成交分开呈现，样本不足时明确显示“未知”，不制造虚假的精确感。", href: "/market#recent-sales", icon: BarChart3 },
          { title: "AI 收藏研究", description: "用可解释的规则阅读热度、流动性、数据完整度和风险，帮助你先比较再决定。", href: "/analysis", icon: Sparkles },
        ].map(({ title, description, href, icon: Icon }) => <Link className={styles.featureCard} href={href} key={title} aria-label={title}>
          <Icon size={22} aria-hidden />
          <h3>{title}</h3>
          <p>{description}</p>
          <ArrowRight className={styles.featureCardArrow} size={16} aria-hidden />
        </Link>)}
      </div>
    </section></Reveal>

    <Reveal><section id="market" className={styles.splitSection} aria-labelledby="market-title">
      <div><h2 id="market-title">卡片不只是目录，还是一条可以核验的证据链。</h2><p>每张卡都有自己的身份指纹：年份、系列、平行、卡号、评级和印刷球队。打开市场页面即可在画廊与表格之间切换，按自己的方式浏览。</p><Link className={styles.heroActions} href="/market">打开行情市场 <ArrowRight size={15} /></Link></div>
      <div className={styles.splitVisual}><div className={styles.metricRow}><div><small>覆盖范围</small><strong>卡片与球员</strong></div><div><small>价格口径</small><strong>挂牌和成交分开</strong></div><div><small>数据状态</small><strong>演示与核验清晰标注</strong></div></div><div className={styles.mockList}><span>当前研究样本</span><b>Victor Wembanyama · Silver Prizm</b><small>身份已匹配，成交样本与来源可在详情中查看</small><b>Shai Gilgeous-Alexander · Silver Prizm</b><small>样本不足时直接标注，等待授权来源补全</small></div></div>
    </section></Reveal>

    <Reveal><section id="collection" className={`${styles.splitSection} ${styles.reverse}`} aria-labelledby="collection-title">
      <div className={styles.splitVisual}><div className={styles.collectionPreviewHeader}><span>MY COLLECTION</span><strong>公开收藏预览</strong></div><div className={styles.collectionPreviewGrid}>{featuredCards.map(({ card, player }) => <Link href={`/cards/${card.id}`} key={card.id}><CardVisual card={card} player={player} density="compact" /><span>{player.displayNameZh}</span></Link>)}</div><Link className={styles.previewLink} href="/portfolio">管理我的持仓 <ArrowRight size={14} /></Link></div>
      <div><h2 id="collection-title">你的收藏，应该始终属于你。</h2><p>把公开收藏、个人持仓、关注列表和价格提醒放在同一套清晰的入口下。成本与盈亏默认私密，公开什么由你决定。</p><ul className={styles.checkList}><li><Check size={15} />收藏与持仓分开管理</li><li><Check size={15} />从卡片详情一键加入关注</li><li><Check size={15} />隐私状态清楚可见</li></ul></div>
    </section></Reveal>

    <Reveal><section id="scanner" className={styles.splitSection} aria-labelledby="scanner-title">
      <div><h2 id="scanner-title">从一张照片，回到正确的卡片。</h2><p>未来接入授权图像来源或扫描服务后，识别器会先给出候选匹配，再让你逐张确认。不会把未经核验的图片当成事实写入收藏。</p><Link className={styles.heroActions} href="/analysis">查看 AI 研究 <Sparkles size={15} /></Link></div>
      <div className={styles.splitVisual}><div className={styles.scannerMock}><Camera size={28} /><strong>扫描、匹配、确认</strong><span>每一张卡都经过你的最后确认</span><div><Check size={14} />身份与卡号</div><div><Check size={14} />图片与来源</div><div><Check size={14} />成交与挂牌口径</div></div></div>
    </section></Reveal>

    <Reveal><section id="faq" className={styles.sectionBand} aria-labelledby="faq-title"><header><h2 id="faq-title">开始之前，先知道这些。</h2><p>我们把演示数据、授权来源和隐私边界写在产品里，而不是藏在脚注中。</p></header><div className={styles.faqGrid}><article className={styles.faqItem}><h3>现在的价格是真实成交吗？</h3><p>当前公开版本包含演示快照。未接入授权平台前，不会把演示金额写成实时或历史真实成交。</p></article><article className={styles.faqItem}><h3>可以导入我的收藏吗？</h3><p>持仓与收藏入口已经保留，支持在应用内管理；外部 CSV/API 导入取决于你的授权数据源。</p></article><article className={styles.faqItem}><h3>AI 会替我做投资决定吗？</h3><p>不会。AI 研究只解释站内指标与样本完整度，不构成预测或交易建议。</p></article><article className={styles.faqItem}><h3>如何保护我的持仓隐私？</h3><p>成本、盈亏与精确资产总额默认隐藏，公开收藏与个人持仓使用不同入口。</p></article></div></section></Reveal>

    <aside className={styles.homeTrust}><ShieldCheck size={17} /><span><b>数据边界始终可见</b>　来源、样本数量、授权状态和最后更新时间会随页面一起显示。</span><Link href="/methodology">查看数据方法 <ArrowRight size={14} /></Link></aside>
  </main>;
}
