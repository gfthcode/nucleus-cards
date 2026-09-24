"use client";


import Link from "next/link";
import { ArrowRight, BarChart3, Camera, Check, Search, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { AppPreviewWindow } from "@/components/marketing/app-preview-window";
import { FeatureRail, Reveal } from "@/components/marketing/homepage-motion";
import { CardVisual } from "@/components/card-visual";
import styles from "@/components/marketing/marketing.module.css";
import { getFeaturedCards } from "@/lib/featured-cards";
import { useI18n } from "@/i18n/client";
import { RelatedSiteCard } from "@/components/related-site-card";
import { EditorialIntro } from "@/components/marketing/editorial-intro";


export default function Home() {
  const featuredCards = getFeaturedCards();
  const { locale, t } = useI18n();


  return <main id="home" className={`${styles.home} ${styles.marketingHome}`}>
    <EditorialIntro rows={featuredCards} />
    <section className={styles.homeHero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <span>{t("homepage.eyebrow")}</span>
        <h1 id="home-title"><span>{t("homepage.title.1")}</span><span>{t("homepage.title.2")}</span><span>{t("homepage.title.3")}</span></h1>
        <p>{t("homepage.description")}</p>
        <div className={styles.heroActions}><Link href="/market">{t("homepage.exploreMarket")} <ArrowRight size={16} /></Link><Link href="/collections/demo">{t("homepage.publicCollection")} <WalletCards size={15} /></Link></div>
        <div className={styles.heroMeta}><span>{t("homepage.free")}</span><span>·</span><span>{t("homepage.demoLabel")}</span><span>·</span><span>{locale === "en" ? "NBA / USD" : "NBA / 人民币"}</span></div>
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
