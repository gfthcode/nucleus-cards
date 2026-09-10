import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Activity, Search, ShieldCheck } from "lucide-react";
import {
  MobileNavigation,
  SidebarNavigation,
} from "@/components/app-navigation";
import { HeaderControls } from "@/components/header-controls";
import { PwaRegister } from "@/components/pwa-register";
import { Analytics } from "@/components/analytics";
import { DataTrustBar } from "@/components/data-provenance";
import { productConfig } from "@/config/product";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(productConfig.siteUrl),
  title: {
    default: `${productConfig.name} · NBA 球星卡行情`,
    template: `%s · ${productConfig.name}`,
  },
  description:
    "Nucleus Cards 是面向中文用户的 NBA 球星卡行情与收藏数据终端，提供球队、球员、卡片、成交样本和拍卖活动的可追溯浏览。当前为演示快照，真实成交需接入授权来源。",
  keywords: [
    "NBA 球星卡",
    "球星卡行情",
    "球星卡成交价",
    "Rookie Card",
    "NBA 卡片市场",
    "球星卡收藏",
  ],
  applicationName: productConfig.name,
  authors: [{ name: productConfig.name, url: productConfig.siteUrl }],
  creator: productConfig.name,
  publisher: productConfig.name,
  category: "sports",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: productConfig.siteUrl,
    siteName: productConfig.name,
    title: `${productConfig.name} · NBA 球星卡行情`,
    description:
      "按球队、球员和卡片身份浏览 NBA 球星卡行情、成交样本与拍卖活动。当前数据以演示快照和授权状态为准。",
    images: [
      { url: "/icon.svg", width: 512, height: 512, alt: "Nucleus Cards" },
    ],
  },
  twitter: {
    card: "summary",
    title: `${productConfig.name} · NBA 球星卡行情`,
    description: "NBA 球星卡行情、收藏与数据来源边界清晰的中文数据终端。",
    images: ["/icon.svg"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#09111f",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: productConfig.name,
              url: productConfig.siteUrl,
              description:
                "NBA 球星卡行情与收藏数据终端；当前页面包含演示快照，真实成交数据需经授权来源核验。",
              applicationCategory: "SportsApplication",
              operatingSystem: "Web",
              inLanguage: "zh-CN",
              isAccessibleForFree: true,
              isFamilyFriendly: true,
              author: {
                "@type": "Organization",
                name: productConfig.name,
                url: productConfig.siteUrl,
              },
              sameAs: [productConfig.repositoryUrl],
              dateModified: "2026-09-09",
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem('nucleus-theme')||'dark'}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Analytics />
        <a className="skip-link" href="#main-content">
          跳至主要内容
        </a>
        <aside className="terminal-sidebar">
          <Link
            className="terminal-brand"
            href="/"
            aria-label={`${productConfig.name} 首页`}
          >
            <span className="brand-mark" aria-hidden>
              N
            </span>
            <span>
              <b>{productConfig.name}</b>
              <small>CARDS INTELLIGENCE</small>
            </span>
          </Link>
          <div className="system-state">
            <Activity size={14} aria-hidden />
            <span>市场数据服务正常</span>
            <i />
          </div>
          <SidebarNavigation />
          <div className="sidebar-foot">
            <span>数据更新时间</span>
            <strong>09:30:12 CST</strong>
          </div>
        </aside>
        <div className="terminal-main">
          <header className="terminal-topbar">
            <Link className="mobile-brand" href="/">
              <span className="brand-mark">N</span>
              <b>{productConfig.name}</b>
            </Link>
            <label className="global-search">
              <Search size={16} aria-hidden />
              <input aria-label="全局搜索" placeholder="搜索球员、卡片或球队" />
              <kbd>⌘ K</kbd>
            </label>
            <div className="market-session">
              <i /> 美东市场 · 盘后
            </div>
            <HeaderControls />
          </header>
          <div className="advice-disclaimer">
            <ShieldCheck size={13} aria-hidden />
            <span>数据仅供参考，不构成投资建议。</span>
            <Link href="/methodology">数据与免责声明</Link>
          </div>
          <DataTrustBar />
          <div id="main-content" className="terminal-content">
            {children}
          </div>
          <footer className="terminal-footer">
            <p>{productConfig.disclaimer}</p>
            <nav>
              <Link href="/methodology">数据方法</Link>
              <Link href="/settings">隐私</Link>
            </nav>
          </footer>
        </div>
        <MobileNavigation />
        <PwaRegister />
      </body>
    </html>
  );
}
