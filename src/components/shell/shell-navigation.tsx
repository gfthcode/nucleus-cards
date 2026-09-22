"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BellRing, BookOpenCheck, ChartNoAxesCombined, FolderHeart, Gauge, Gavel, LayoutDashboard, Settings2, ShieldCheck, Sparkles, UserRoundSearch, UsersRound, WalletCards, WandSparkles } from "lucide-react";
import { useI18n } from "@/i18n/client";
import type { TranslationKey } from "@/i18n/messages";
import styles from "./app-shell.module.css";

const groups: Array<{ labelKey: TranslationKey; items: Array<[string, string, typeof Gauge]> }> = [
  { labelKey: "navigation.discover", items: [["navigation.players", "/teams#players", UserRoundSearch], ["navigation.teams", "/teams", UsersRound], ["navigation.cards", "/market", LayoutDashboard], ["navigation.rookies", "/rookies/2025", Sparkles]] },
  { labelKey: "navigation.market", items: [["navigation.market", "/market", ChartNoAxesCombined], ["navigation.auctions", "/auction-radar", Gavel], ["navigation.sales", "/market#sales", BookOpenCheck]] },
  { labelKey: "navigation.collect", items: [["navigation.portfolio", "/portfolio", WalletCards], ["navigation.collection", "/collections", FolderHeart], ["navigation.alerts", "/alerts", BellRing]] },
  { labelKey: "navigation.intelligence", items: [["navigation.momentum", "/momentum", Activity], ["navigation.ai", "/analysis", WandSparkles]] },
];

function active(pathname: string, href: string) { const base = href.split("#")[0]; return base === "/" ? pathname === "/" : pathname.startsWith(base); }

export function ShellNavigation() {
  const pathname = usePathname(); const { t } = useI18n();
  return <nav className={styles.navigation} aria-label={t("shell.mainNavigation")}>
    <Link className={`${styles.navItem} ${active(pathname, "/") ? styles.active : ""}`} href="/"><Gauge size={16} aria-hidden /> <span>{t("navigation.home")}</span></Link>
    {groups.map((group) => <section className={styles.navGroup} key={group.labelKey} aria-label={t(group.labelKey)}><p>{t(group.labelKey)}</p>{group.items.map(([labelKey, href, Icon]) => <Link className={`${styles.navItem} ${active(pathname, href) ? styles.active : ""}`} href={href} key={href}><Icon size={16} aria-hidden /> <span>{labelKey.startsWith("navigation.") ? t(labelKey as TranslationKey) : labelKey}</span></Link>)}</section>)}
  </nav>;
}

export function ShellMobileNavigation() {
  const pathname = usePathname(); const { t } = useI18n();
  const items: Array<[string, string, typeof Gauge]> = [["navigation.home", "/", Gauge], ["navigation.market", "/market", ChartNoAxesCombined], ["navigation.auctions", "/auction-radar", Gavel], ["navigation.portfolio", "/portfolio", WalletCards], ["navigation.momentum", "/momentum", Activity], ["navigation.ai", "/analysis", WandSparkles]];
  return <nav className={styles.mobileNavigation} aria-label={t("shell.mobileNavigation")}>{items.map(([labelKey, href, Icon]) => <Link className={active(pathname, href) ? styles.active : ""} href={href} key={href}><Icon size={18} aria-hidden /><span>{labelKey.startsWith("navigation.") ? t(labelKey as TranslationKey) : labelKey}</span></Link>)}</nav>;
}

export function ShellFooterNavigation() {
  const pathname = usePathname(); const { t } = useI18n();
  return <div className={styles.sideUtility}><Link className={active(pathname, "/methodology") ? styles.active : ""} href="/methodology"><ShieldCheck size={15} />{t("common.dataMethodology")}</Link><Link className={active(pathname, "/settings") ? styles.active : ""} href="/settings"><Settings2 size={15} />{t("navigation.settings")}</Link></div>;
}
