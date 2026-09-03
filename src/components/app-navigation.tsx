"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  ChartNoAxesCombined,
  CircleUserRound,
  Gauge,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";

const coreItems = [
  { label: "首页", href: "/", icon: Gauge },
  { label: "市场", href: "/market", icon: ChartNoAxesCombined },
  { label: "新秀", href: "/rookies/2025", icon: Sparkles },
  { label: "持仓", href: "/portfolio", icon: WalletCards },
  { label: "我的", href: "/settings", icon: CircleUserRound },
];

const secondaryItems = [
  { label: "球队与球员", href: "/teams", icon: UsersRound },
  { label: "风险提醒", href: "/alerts", icon: BellRing },
  { label: "数据方法", href: "/methodology", icon: ShieldCheck },
  { label: "管理后台", href: "/admin", icon: LayoutDashboard },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/rookies")) return pathname.startsWith("/rookies");
  return pathname.startsWith(href);
}

export function SidebarNavigation() {
  const pathname = usePathname();
  return (
    <nav className="sidebar-navigation" aria-label="主要导航">
      <p className="nav-label">工作台</p>
      {coreItems.slice(0, 4).map(({ label, href, icon: Icon }) => (
        <Link className={isActive(pathname, href) ? "active" : ""} href={href} key={href}>
          <Icon size={17} aria-hidden />
          <span>{label}</span>
        </Link>
      ))}
      <p className="nav-label secondary">研究</p>
      {secondaryItems.map(({ label, href, icon: Icon }) => (
        <Link className={isActive(pathname, href) ? "active" : ""} href={href} key={href}>
          <Icon size={17} aria-hidden />
          <span>{label}</span>
        </Link>
      ))}
      <Link className={isActive(pathname, "/settings") ? "active sidebar-settings" : "sidebar-settings"} href="/settings">
        <Settings2 size={17} aria-hidden />
        <span>偏好设置</span>
      </Link>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav className="terminal-mobile-nav" aria-label="手机导航">
      {coreItems.map(({ label, href, icon: Icon }) => (
        <Link className={isActive(pathname, href) ? "active" : ""} href={href} key={href}>
          <Icon size={19} aria-hidden />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
