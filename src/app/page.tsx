"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Camera, Check, Search, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { AppPreviewWindow } from "@/components/marketing/app-preview-window";
import { FeatureRail, Reveal } from "@/components/marketing/homepage-motion";
import { CardVisual } from "@/components/card-visual";
import styles from "@/components/marketing/marketing.module.css";
import { getFeaturedCards } from "@/lib/featured-cards";
import { useI18n } from "@/i18n/client";

export default function Home() {
  const featuredCards = getFeaturedCards();
  const { t } = useI18n();

  return <main id="home" className={`${styles.home} ${styles.marketingHome}`}>
    <section className={styles.homeHero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <span>{t("homepage.eyebrow")}</span>
        <h1 id="home-title"><span>{t("homepage.title.1")}</span><span>{t("homepage.title.2")}</span><span>{t("homepage.title.3")}</span></h1>
        <p>{t("homepage.description")}</p>
        <div className={styles.heroActions}><Link href="/market">{t("homepage.exploreMarket")} <ArrowRight size={16} /></Link><Link href="/collections/demo">{t("homepage.publicCollection")} <WalletCards size={15} /></Link></div>
        <div className={styles.heroMeta}><span>{t("homepage.free")}</span><span>·</span><span>{t("homepage.demoLabel")}</span><span>·</span><span>NBA / CNY</span></div>
      </div>
      <AppPreviewWindow rows={featuredCards} />
    </section>

    <FeatureRail />

    <Reveal><section id="features" className={styles.sectionBand} aria-labelledby="features-title">
      <header><span className={styles.featureKicker}>{t("homepage.featureKicker")}</span><h2 id="features-title">{t("homepage.featureTitle")}</h2><p>{t("homepage.featureDescription")}</p></header>
      <div className={styles.featureGrid}>
        {[
          { title: t("homepage.feature.search.title"), description: t("homepage.feature.search.description"), href: "/market#market-search", icon: Search },
          { title: t("homepage.feature.market.title"), description: t("homepage.feature.market.description"), href: "/market#recent-sales", icon: BarChart3 },
          { title: t("homepage.feature.ai.title"), description: t("homepage.feature.ai.description"), href: "/analysis", icon: Sparkles },
        ].map(({ title, description, href, icon: Icon }) => <Link className={styles.featureCard} href={href} key={title} aria-label={title}>
          <Icon size={22} aria-hidden />
          <h3>{title}</h3>
          <p>{description}</p>
          <ArrowRight className={styles.featureCardArrow} size={16} aria-hidden />
        </Link>)}
      </div>
    </section></Reveal>

    <Reveal><section id="market" className={styles.splitSection} aria-labelledby="market-title">
      <div><span className={styles.featureKicker}>{t("homepage.section.market")}</span><h2 id="market-title">{t("market.headline")}</h2><p>{t("market.description")}</p><Link className={styles.heroActions} href="/market">{t("homepage.market.action")} <ArrowRight size={15} /></Link></div>
      <div className={styles.splitVisual}><div className={styles.metricRow}><div><small>{t("homepage.market.cardsTracked")}</small><strong>4,000+</strong></div><div><small>{t("homepage.market.samples")}</small><strong>28</strong></div><div><small>{t("homepage.market.dataStatus")}</small><strong>{t("homepage.market.statusClear")}</strong></div></div><div className={styles.mockList}><span>{t("homepage.market.signals")}</span><b>Victor Wembanyama · Silver Prizm</b><small>{t("homepage.market.saleSample")}</small><b>Shai Gilgeous-Alexander · Silver Prizm</b><small>{t("homepage.market.waitingSource")}</small></div></div>
    </section></Reveal>

    <Reveal><section id="collection" className={`${styles.splitSection} ${styles.reverse}`} aria-labelledby="collection-title">
      <div className={styles.splitVisual}><div className={styles.collectionPreviewHeader}><span>MY COLLECTION</span><strong>{t("homepage.collection.preview")}</strong></div><div className={styles.collectionPreviewGrid}>{featuredCards.map(({ card, player }) => <Link href={`/cards/${card.id}`} key={card.id}><CardVisual card={card} player={player} density="compact" /><span>{player.displayNameZh}</span></Link>)}</div><Link className={styles.previewLink} href="/portfolio">{t("homepage.collection.manage")} <ArrowRight size={14} /></Link></div>
      <div><span className={styles.featureKicker}>{t("homepage.collection.kicker")}</span><h2 id="collection-title">{t("homepage.collection.title")}</h2><p>{t("homepage.collection.description")}</p><ul className={styles.checkList}><li><Check size={15} />{t("homepage.collection.separate")}</li><li><Check size={15} />{t("homepage.collection.watch")}</li><li><Check size={15} />{t("homepage.collection.privacy")}</li></ul></div>
    </section></Reveal>

    <Reveal><section id="scanner" className={styles.splitSection} aria-labelledby="scanner-title">
      <div><span className={styles.featureKicker}>{t("homepage.scanner.kicker")}</span><h2 id="scanner-title">{t("homepage.scanner.title")}</h2><p>{t("homepage.scanner.description")}</p><Link className={styles.heroActions} href="/analysis">{t("homepage.scanner.action")} <Sparkles size={15} /></Link></div>
      <div className={styles.splitVisual}><div className={styles.scannerMock}><Camera size={28} /><strong>{t("homepage.scanner.label")}</strong><span>{t("homepage.scanner.confirm")}</span><div><Check size={14} />{t("homepage.scanner.identity")}</div><div><Check size={14} />{t("homepage.scanner.source")}</div><div><Check size={14} />{t("homepage.scanner.pricing")}</div></div></div>
    </section></Reveal>

    <Reveal><section id="faq" className={styles.sectionBand} aria-labelledby="faq-title"><header><span className={styles.featureKicker}>FAQ</span><h2 id="faq-title">{t("homepage.faq.title")}</h2><p>{t("homepage.faq.description")}</p></header><div className={styles.faqGrid}><article className={styles.faqItem}><h3>{t("homepage.faq.priceQuestion")}</h3><p>{t("homepage.faq.priceAnswer")}</p></article><article className={styles.faqItem}><h3>{t("homepage.faq.importQuestion")}</h3><p>{t("homepage.faq.importAnswer")}</p></article><article className={styles.faqItem}><h3>{t("homepage.faq.aiQuestion")}</h3><p>{t("homepage.faq.aiAnswer")}</p></article><article className={styles.faqItem}><h3>{t("homepage.faq.privacyQuestion")}</h3><p>{t("homepage.faq.privacyAnswer")}</p></article></div></section></Reveal>

    <aside className={styles.homeTrust}><ShieldCheck size={17} /><span><b>{t("homepage.trust.title")}</b>　{t("homepage.trust.description")}</span><Link href="/methodology">{t("homepage.trust.action")} <ArrowRight size={14} /></Link></aside>
  </main>;
}

