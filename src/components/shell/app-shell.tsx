"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ShieldCheck } from "lucide-react";
import { Analytics } from "@/components/analytics";
import { DataTrustBar } from "@/components/data-provenance";
import { GlobalSearch } from "@/components/global-search";
import { HeaderControls } from "@/components/header-controls";
import { PwaRegister } from "@/components/pwa-register";
import { productConfig } from "@/config/product";
import { ShellFooterNavigation, ShellMobileNavigation, ShellNavigation } from "./shell-navigation";
import styles from "./app-shell.module.css";
import marketingStyles from "@/components/marketing/marketing.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <>
      <Analytics />
      <MarketingChrome>{children}</MarketingChrome>
      <PwaRegister />
    </>;
  }

  return <>
    <Analytics />
    <a className={styles.skipLink} href="#main-content">跳至主要内容</a>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/" aria-label={`${productConfig.name} 首页`}>
        <Image src="/icon.svg" alt="" width={34} height={34} priority />
        <span><b>NUCLEUS</b><small>CARDS / INTELLIGENCE</small></span>
      </Link>
      <div className={styles.liveState}><Activity size={13} aria-hidden /><span>数据服务</span><i /> <small>DEMO</small></div>
      <ShellNavigation />
      <div className={styles.sidebarBottom}><ShellFooterNavigation /><small>SNAPSHOT · 09:30 CST</small></div>
    </aside>
    <div className={styles.canvas}>
      <header className={styles.topbar}>
        <Link className={styles.mobileBrand} href="/"><Image src="/icon.svg" alt="" width={28} height={28} priority /><b>NUCLEUS</b></Link>
        <GlobalSearch />
        <div className={styles.session}><i /> 美东市场 <span>· 盘后</span></div>
        <HeaderControls />
      </header>
      <div className={styles.disclaimer}><ShieldCheck size={14} aria-hidden /><span>数据仅供收藏研究参考，不构成交易建议。</span><Link href="/methodology">数据口径</Link></div>
      <DataTrustBar />
      <div id="main-content" className={styles.content}>{children}</div>
      <footer className={styles.footer}><p>{productConfig.disclaimer}</p><Link href="/methodology">数据方法</Link><Link href="/settings">隐私</Link></footer>
    </div>
    <ShellMobileNavigation />
    <PwaRegister />
  </>;
}

function MarketingChrome({ children }: { children: React.ReactNode }) {
  return <div className={marketingStyles.marketingShell}>
    <a className={marketingStyles.marketingSkip} href="#main-content">跳至主要内容</a>
    <header className={marketingStyles.marketingHeader}>
      <Link className={marketingStyles.marketingBrand} href="/" aria-label="Nucleus Cards 首页">
        <Image src="/icon.svg" alt="" width={38} height={38} priority />
        <span><b>Nucleus Cards</b><small>SPORTS CARD INTELLIGENCE</small></span>
      </Link>
      <nav className={marketingStyles.marketingNav} aria-label="公开页面导航">
        <a href="#features">功能</a>
        <a href="#market">行情</a>
        <a href="#scanner">识别器</a>
        <a href="#collection">收藏</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className={marketingStyles.marketingActions}>
        <button type="button" aria-label="切换语言">中 / EN</button>
        <a href="https://github.com/gfthcode/nucleus-cards" target="_blank" rel="noreferrer">GitHub</a>
        <Link href="/market">进入应用</Link>
      </div>
    </header>
    <div id="main-content" className={marketingStyles.marketingContent}>{children}</div>
    <nav className={marketingStyles.marketingMobileNav} aria-label="手机导航"><Link href="/">首页</Link><Link href="/market">行情</Link><Link href="/collections/demo">收藏</Link><Link href="/analysis">AI</Link></nav>
    <footer className={marketingStyles.marketingFooter}>
      <div><b>Nucleus Cards</b><span>NBA 球星卡收藏、行情与研究工具。</span></div>
      <nav aria-label="页脚导航"><a href="#features">功能</a><a href="#market">行情</a><Link href="/methodology">数据口径</Link><Link href="/settings">隐私</Link></nav>
      <small>演示快照 · 真实成交需接入授权来源核验</small>
    </footer>
  </div>;
}
