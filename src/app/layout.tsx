import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { productConfig } from "@/config/product";
import { LocaleProvider } from "@/i18n/client";
import { EnglishModeGuard } from "@/components/i18n/english-mode-guard";
import { getLocale } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const english = locale === "en";
  const title = english ? `${productConfig.name} · NBA card market` : `${productConfig.name} · NBA 球星卡行情`;
  const description = english ? "An NBA sports-card research terminal for traceable teams, players, cards, sales samples and auctions. Live sales require an authorized source." : "Nucleus Cards 是面向中文用户的 NBA 球星卡行情与收藏数据终端，提供球队、球员、卡片、成交样本和拍卖活动的可追溯浏览。当前为演示快照，真实成交需接入授权来源。";
  return {
    metadataBase: new URL(productConfig.siteUrl),
    title: { default: title, template: `%s · ${productConfig.name}` },
    description,
    keywords: ["NBA sports cards", "NBA 球星卡", "card market", "Rookie Card", "球星卡收藏"],
    applicationName: productConfig.name,
    authors: [{ name: productConfig.name, url: productConfig.siteUrl }],
    creator: productConfig.name,
    publisher: productConfig.name,
    category: "sports",
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: { type: "website", locale: english ? "en_US" : "zh_CN", url: productConfig.siteUrl, siteName: productConfig.name, title, description, images: [{ url: "/icon.svg", width: 512, height: 512, alt: "Nucleus Cards" }] },
    twitter: { card: "summary", title, description, images: ["/icon.svg"] },
    manifest: "/manifest.webmanifest",
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon.svg", sizes: "512x512", type: "image/svg+xml" }], shortcut: "/icon.svg", apple: "/icon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#09111f", colorScheme: "dark light" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const english = locale === "en";
  return <html lang={english ? "en" : "zh-CN"} data-scroll-behavior="smooth" suppressHydrationWarning>
    <head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebApplication", name: productConfig.name, url: productConfig.siteUrl,
        description: english ? "NBA sports-card market and collection research terminal. Demo snapshots are not verified live sales." : "NBA 球星卡行情与收藏数据终端；当前页面包含演示快照，真实成交数据需经授权来源核验。",
        applicationCategory: "SportsApplication", operatingSystem: "Web", inLanguage: locale, isAccessibleForFree: true, isFamilyFriendly: true,
        author: { "@type": "Organization", name: productConfig.name, url: productConfig.siteUrl }, sameAs: [productConfig.repositoryUrl], dateModified: "2026-09-14",
      }) }} />
      <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('nucleus-theme')||'dark'}catch(e){}` }} />
    </head>
    <body><LocaleProvider initialLocale={locale}><EnglishModeGuard /><AppShell>{children}</AppShell></LocaleProvider></body>
  </html>;
}

