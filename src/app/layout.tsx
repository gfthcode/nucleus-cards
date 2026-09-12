import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/shell/app-shell";
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
