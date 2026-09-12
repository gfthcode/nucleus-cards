"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  BookOpenCheck,
  ChartNoAxesCombined,
  FolderHeart,
  Gauge,
  Gavel,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  UsersRound,
  WalletCards,
  WandSparkles,
} from "lucide-react";
import styles from "./app-shell.module.css";

const groups = [
  { label: "DISCOVER", items: [
    ["球员", "/teams#players", UserRoundSearch], ["球队", "/teams", UsersRound], ["卡片", "/market", LayoutDashboard], ["新秀", "/rookies/2025", Sparkles],
  ] },
  { label: "MARKET", items: [
    ["市场", "/market", ChartNoAxesCombined], ["拍卖", "/auction-radar", Gavel], ["最近成交", "/market#sales", BookOpenCheck],
  ] },
  { label: "COLLECT", items: [
    ["持仓", "/portfolio", WalletCards], ["收藏", "/collections/demo", FolderHeart], ["提醒", "/alerts", BellRing],
  ] },
  { label: "INTELLIGENCE", items: [["AI 研究", "/analysis", WandSparkles]] },
] as const;

function active(pathname: string, href: string) {
  const base = href.split("#")[0];
  return base === "/" ? pathname === "/" : pathname.startsWith(base);
}

export function ShellNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.navigation} aria-label="主要导航">
      <Link className={`${styles.navItem} ${active(pathname, "/") ? styles.active : ""}`} href="/">
        <Gauge size={16} aria-hidden /> <span>HOME</span>
      </Link>
      {groups.map((group) => (
        <section className={styles.navGroup} key={group.label} aria-label={group.label}>
          <p>{group.label}</p>
          {group.items.map(([label, href, Icon]) => (
            <Link className={`${styles.navItem} ${active(pathname, href) ? styles.active : ""}`} href={href} key={href}>
              <Icon size={16} aria-hidden /> <span>{label}</span>
            </Link>
          ))}
        </section>
      ))}
    </nav>
  );
}

export function ShellMobileNavigation() {
  const pathname = usePathname();
  const items = [
    ["首页", "/", Gauge], ["行情", "/market", ChartNoAxesCombined], ["拍卖", "/auction-radar", Gavel], ["持仓", "/portfolio", WalletCards], ["AI", "/analysis", WandSparkles],
  ] as const;
  return <nav className={styles.mobileNavigation} aria-label="手机导航">{items.map(([label, href, Icon]) => (
    <Link className={active(pathname, href) ? styles.active : ""} href={href} key={href}><Icon size={18} aria-hidden /><span>{label}</span></Link>
  ))}</nav>;
}

export function ShellFooterNavigation() {
  const pathname = usePathname();
  return <div className={styles.sideUtility}>
    <Link className={active(pathname, "/methodology") ? styles.active : ""} href="/methodology"><ShieldCheck size={15} />数据口径</Link>
    <Link className={active(pathname, "/settings") ? styles.active : ""} href="/settings"><Settings2 size={15} />设置</Link>
  </div>;
}
