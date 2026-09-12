import Image from "next/image";
import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";
import { Analytics } from "@/components/analytics";
import { DataTrustBar } from "@/components/data-provenance";
import { GlobalSearch } from "@/components/global-search";
import { HeaderControls } from "@/components/header-controls";
import { PwaRegister } from "@/components/pwa-register";
import { productConfig } from "@/config/product";
import { ShellFooterNavigation, ShellMobileNavigation, ShellNavigation } from "./shell-navigation";
import styles from "./app-shell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
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
