import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { HeaderControls } from "@/components/header-controls";
import { PwaRegister } from "@/components/pwa-register";
import { productConfig } from "@/config/product";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${productConfig.name} · NBA 球星卡行情`,
    template: `%s · ${productConfig.name}`,
  },
  description: "NBA 球星卡行情监控、收藏管理与风险分析平台",
  applicationName: productConfig.name,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#09111f",
  colorScheme: "dark light",
};

const nav = [
  ["首页", "/"],
  ["行情", "/market"],
  ["球队", "/teams"],
  ["新秀", "/rookies/2025"],
  ["持仓", "/portfolio"],
  ["提醒", "/alerts"],
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          跳至主要内容
        </a>
        <header className="topbar">
          <Link
            className="brand"
            href="/"
            aria-label={`${productConfig.name} 首页`}
          >
            <span className="brand-mark" aria-hidden>
              N
            </span>
            <span>{productConfig.name}</span>
            <small>BETA</small>
          </Link>
          <nav className="desktop-nav" aria-label="主要导航">
            {nav.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <HeaderControls />
        </header>
        <div className="status-banner">
          <span>DEMO MODE</span> 当前展示种子数据，不代表实时市场行情。
          <Link href="/methodology">查看数据声明</Link>
        </div>
        <div id="main-content">{children}</div>
        <footer>
          <div>
            <span className="brand-mark small">N</span>
            <b>{productConfig.name}</b>
          </div>
          <p>{productConfig.disclaimer}</p>
          <nav>
            <Link href="/methodology">数据方法</Link>
            <Link href="/admin">管理后台</Link>
            <Link href="/settings">隐私设置</Link>
          </nav>
        </footer>
        <nav className="mobile-nav" aria-label="手机导航">
          {nav.slice(0, 5).map(([label, href], index) => (
            <Link key={href} href={href}>
              <span aria-hidden>{["⌂", "⌕", "◫", "★", "▣"][index]}</span>
              {label}
            </Link>
          ))}
        </nav>
        <PwaRegister />
      </body>
    </html>
  );
}
