"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import { Analytics } from "@/components/analytics";
import { DataTrustBar } from "@/components/data-provenance";
import { GlobalSearch } from "@/components/global-search";
import { HeaderControls } from "@/components/header-controls";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { PwaRegister } from "@/components/pwa-register";
import { productConfig } from "@/config/product";
import { useI18n } from "@/i18n/client";
import { ShellFooterNavigation, ShellMobileNavigation, ShellNavigation } from "./shell-navigation";
import styles from "./app-shell.module.css";
import marketingStyles from "@/components/marketing/marketing.module.css";
import { HOMEPAGE_SECTIONS, useHomepageScrollSpy } from "@/components/marketing/homepage-scrollspy";
import { RelatedSiteCard } from "@/components/related-site-card";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname === "/") return <><Analytics /><MarketingChrome>{children}</MarketingChrome><PwaRegister /></>;
  return <>
    <Analytics />
    <a className={styles.skipLink} href="#main-content">{t("shell.skipToContent")}</a>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/" aria-label={`${productConfig.name} ${t("navigation.home")}`}><Image src="/icon.svg" alt="" width={34} height={34} priority /><span><b>NUCLEUS</b><small>CARDS / INTELLIGENCE</small></span></Link>
      <div className={styles.liveState}><Activity size={13} aria-hidden /><span>{t("shell.dataService")}</span><i /> <small>DEMO</small></div>
      <ShellNavigation />
      <div className={styles.sidebarBottom}><ShellFooterNavigation /><small>SNAPSHOT · 09:30 CST</small></div>
    </aside>
    <div className={styles.canvas}>
      <header className={styles.topbar}>
        <Link className={styles.mobileBrand} href="/"><Image src="/icon.svg" alt="" width={28} height={28} priority /><b>NUCLEUS</b></Link>
        <GlobalSearch />
        <div className={styles.session}><i /> {t("shell.marketStatus")}</div>
        <HeaderControls />
      </header>
      <div className={styles.disclaimer}><ShieldCheck size={14} aria-hidden /><span>{t("shell.disclaimer")}</span><Link href="/methodology">{t("common.dataMethodology")}</Link></div>
      <DataTrustBar />
      <div id="main-content" className={styles.content}>{children}</div>
      <RelatedSiteCard compact /><footer className={styles.footer}><p>{t("shell.disclaimer")}</p><Link href="/methodology">{t("navigation.methodology")}</Link><Link href="/settings">{t("shell.privacy")}</Link></footer>
    </div>
    <ShellMobileNavigation />
    <PwaRegister />
  </>;
}

function MarketingChrome({ children }: { children: React.ReactNode }) {
  const { activeId, scrollToSection } = useHomepageScrollSpy();
  const { t } = useI18n();
  const activeSection = HOMEPAGE_SECTIONS.find((section) => section.id === activeId) ?? HOMEPAGE_SECTIONS[0];
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(`.${marketingStyles.marketingHeader}`);
    if (!header) return undefined;
    const updateHeight = () => document.documentElement.style.setProperty("--marketing-header-height", `${header.offsetHeight}px`);
    updateHeight(); const observer = new ResizeObserver(updateHeight); observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return <div className={marketingStyles.marketingShell}>
    <a className={marketingStyles.marketingSkip} href="#main-content">{t("shell.skipToContent")}</a>
    <header className={marketingStyles.marketingHeader}>
      <Link className={marketingStyles.marketingBrand} href="#home" aria-current={activeId === "home" ? "page" : undefined} onClick={(event) => scrollToSection(event, "home")} aria-label={`Nucleus Cards ${t("navigation.home")}`}><Image src="/icon.svg" alt="" width={38} height={38} priority /><span><b>Nucleus Cards</b><small>SPORTS CARD INTELLIGENCE</small></span></Link>
      <nav className={marketingStyles.marketingNav} aria-label={t("shell.mainNavigation")}>
        {HOMEPAGE_SECTIONS.slice(1).map((section) => <a href={`#${section.id}`} key={section.id} aria-current={activeId === section.id ? "page" : undefined} className={activeId === section.id ? marketingStyles.marketingNavActive : undefined} onClick={(event) => scrollToSection(event, section.id)}>{t(section.shortLabelKey)}</a>)}
      </nav>
      <div className={marketingStyles.marketingActions}>
        <span className={marketingStyles.marketingCurrent} aria-live="polite"><small>{t("shell.current")}</small><b>{t(activeSection.labelKey)}</b></span>
        <LanguageSwitcher />
        <a href="https://github.com/gfthcode/nucleus-cards" target="_blank" rel="noreferrer">GitHub</a>
        <Link href="/market">{t("shell.enterApp")}</Link>
      </div>
    </header>
    <div id="main-content" className={marketingStyles.marketingContent}>{children}</div>
    <nav className={marketingStyles.marketingMobileNav} aria-label={t("shell.mobileNavigation")}><Link href="/">{t("navigation.home")}</Link><Link href="/market">{t("navigation.market")}</Link><Link href="/collections/demo">{t("navigation.collection")}</Link><Link href="/analysis">AI</Link></nav>
    <footer className={marketingStyles.marketingFooter}><div><b>Nucleus Cards</b><span>{t("shell.footerSummary")}</span></div><nav aria-label={t("shell.mainNavigation")}><a href="#features">{t("homepage.section.featuresShort")}</a><a href="#market">{t("homepage.section.marketShort")}</a><Link href="/methodology">{t("common.dataMethodology")}</Link><Link href="/settings">{t("shell.privacy")}</Link></nav><small>{t("shell.snapshot")}</small></footer>
  </div>;
}
