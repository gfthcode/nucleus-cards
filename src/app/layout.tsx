import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Activity, Search, ShieldCheck } from "lucide-react";
import { MobileNavigation, SidebarNavigation } from "@/components/app-navigation";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('nucleus-theme')||'dark'}catch(e){}` }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          跳至主要内容
        </a>
        <aside className="terminal-sidebar">
          <Link className="terminal-brand" href="/" aria-label={`${productConfig.name} 首页`}>
            <span className="brand-mark" aria-hidden>N</span>
            <span><b>{productConfig.name}</b><small>CARDS INTELLIGENCE</small></span>
          </Link>
          <div className="system-state"><Activity size={14} aria-hidden /><span>市场数据服务正常</span><i /></div>
          <SidebarNavigation />
          <div className="sidebar-foot"><span>数据更新时间</span><strong>09:30:12 CST</strong></div>
        </aside>
        <div className="terminal-main">
          <header className="terminal-topbar">
            <Link className="mobile-brand" href="/"><span className="brand-mark">N</span><b>{productConfig.name}</b></Link>
            <label className="global-search"><Search size={16} aria-hidden /><input aria-label="全局搜索" placeholder="搜索球员、卡片或球队" /><kbd>⌘ K</kbd></label>
            <div className="market-session"><i /> 美东市场 · 盘后</div>
            <HeaderControls />
          </header>
          <div className="advice-disclaimer"><ShieldCheck size={13} aria-hidden /><span>数据仅供参考，不构成投资建议。</span><Link href="/methodology">数据与免责声明</Link></div>
          <div id="main-content" className="terminal-content">{children}</div>
          <footer className="terminal-footer"><p>{productConfig.disclaimer}</p><nav><Link href="/methodology">数据方法</Link><Link href="/settings">隐私</Link></nav></footer>
        </div>
        <MobileNavigation />
        <PwaRegister />
      </body>
    </html>
  );
}
