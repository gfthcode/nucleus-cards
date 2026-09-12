import Link from "next/link";
import { ArrowUpRight, BarChart3, BookOpen, Search, Sparkles, WalletCards } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import type { Card, Player } from "@/types/domain";
import styles from "./marketing.module.css";

type PreviewRow = { card: Card; player: Player };

export function AppPreviewWindow({ rows }: { rows: PreviewRow[] }) {
  const featured = rows.slice(0, 3);
  return <div className={styles.previewStage} aria-label="Nucleus Cards 应用预览">
    <div className={styles.previewWindow}>
      <div className={styles.windowChrome}><span className={styles.windowDots}><i /><i /><i /></span><span>nucleus-cards / collection</span><span className={styles.windowStatus}>LIVE DEMO</span></div>
      <div className={styles.previewBody}>
        <aside className={styles.previewSidebar}><b>NC</b><span className={styles.previewActive}><WalletCards size={14} />收藏</span><span><Search size={14} />搜索</span><span><BarChart3 size={14} />行情</span><span><Sparkles size={14} />AI 研究</span><span><BookOpen size={14} />数据口径</span></aside>
        <div className={styles.previewMain}>
          <div className={styles.previewGreeting}><div><small>MY COLLECTION</small><h3>欢迎回来，收藏者</h3></div><Link href="/portfolio">打开持仓 <ArrowUpRight size={13} /></Link></div>
          <div className={styles.previewStats}><div><small>PORTFOLIO VALUE</small><strong>¥68,420</strong><em>+8.4% / 30D</em></div><div><small>CARDS OWNED</small><strong>12</strong><span>3 个公开合集</span></div><div><small>WATCHLIST</small><strong>08</strong><span>2 个新信号</span></div></div>
          <div className={styles.previewChart}><div><small>PORTFOLIO HISTORY</small><span>30D　90D　1Y</span></div><svg viewBox="0 0 640 120" role="img" aria-label="持仓历史趋势演示"><defs><linearGradient id="preview-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#df6a63" /><stop offset="1" stopColor="#df6a63" stopOpacity="0" /></linearGradient></defs><path d="M0 96 C70 88 95 100 150 79 S245 85 300 63 S405 70 462 42 S550 53 640 15" /><path className={styles.chartFill} d="M0 96 C70 88 95 100 150 79 S245 85 300 63 S405 70 462 42 S550 53 640 15 V120 H0Z" /></svg></div>
          <div className={styles.previewCollectionHeader}><small>FEATURED CARDS</small><Link href="/market">查看全部 <ArrowUpRight size={12} /></Link></div>
          <div className={styles.previewCards}>{featured.map(({ card, player }) => <Link href={`/cards/${card.id}`} key={card.id} className={styles.previewCard}><CardVisual card={card} player={player} density="compact" /><span>{player.displayNameZh}</span></Link>)}</div>
        </div>
      </div>
    </div>
    <div className={`${styles.callout} ${styles.calloutTop}`}><strong>4,000+ cards</strong><span>identity matched</span></div>
    <div className={`${styles.callout} ${styles.calloutBottom}`}><strong>AI player analysis</strong><span>compare before you collect</span></div>
  </div>;
}
