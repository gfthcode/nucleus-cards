"use client";

import { PointerEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3, BookOpen, Search, Sparkles, WalletCards } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import type { Card, Player } from "@/types/domain";
import { useI18n } from "@/i18n/client";
import styles from "./marketing.module.css";

type PreviewRow = { card: Card; player: Player };

export function AppPreviewWindow({ rows }: { rows: PreviewRow[] }) {
  const { t } = useI18n();
  const featured = rows.slice(0, 3);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);
  const resetTilt = () => {
    pointerRef.current = { x: 0, y: 0 };
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(applyPointer);
  };
  const applyPointer = () => {
    frameRef.current = null;
    const node = stageRef.current;
    if (!node) return;
    const { x, y } = pointerRef.current;
    node.style.setProperty("--preview-tilt-x", `${(-y * 1.5).toFixed(2)}deg`);
    node.style.setProperty("--preview-tilt-y", `${(x * 1.8).toFixed(2)}deg`);
    node.style.setProperty("--preview-shift-x", `${(x * 8).toFixed(1)}px`);
    node.style.setProperty("--preview-shift-y", `${(y * 6).toFixed(1)}px`);
    node.style.setProperty("--preview-glow-x", `${(50 + x * 70).toFixed(1)}%`);
    node.style.setProperty("--preview-glow-y", `${(50 + y * 70).toFixed(1)}%`);
  };
  const moveTilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: (event.clientX - rect.left) / rect.width - 0.5, y: (event.clientY - rect.top) / rect.height - 0.5 };
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(applyPointer);
  };

  return <div ref={stageRef} className={styles.previewStage} aria-label={t("homepage.preview.aria")} onPointerMove={moveTilt} onPointerLeave={resetTilt}>
    <div className={styles.previewWindow}>
      <div className={styles.windowChrome}><span className={styles.windowDots}><i /><i /><i /></span><span>nucleus-cards / collection</span><span className={styles.windowStatus}>LIVE DEMO</span></div>
      <div className={styles.previewBody}>
        <aside className={styles.previewSidebar}><b>NC</b><span className={styles.previewActive}><WalletCards size={14} />{t("homepage.preview.collection")}</span><span><Search size={14} />{t("homepage.preview.search")}</span><span><BarChart3 size={14} />{t("homepage.preview.market")}</span><span><Sparkles size={14} />{t("homepage.preview.ai")}</span><span><BookOpen size={14} />{t("homepage.preview.methodology")}</span></aside>
        <div className={styles.previewMain}>
          <div className={styles.previewGreeting}><div><small>MY COLLECTION</small><h3>{t("homepage.preview.greeting")}</h3></div><Link href="/portfolio">{t("homepage.preview.openPortfolio")} <ArrowUpRight size={13} /></Link></div>
          <div className={styles.previewStats}><div><small>{t("homepage.preview.portfolioValue")}</small><strong>¥68,420</strong><em>+8.4% / 30D</em></div><div><small>{t("homepage.preview.cardsOwned")}</small><strong>12</strong><span>{t("homepage.preview.publicCollections")}</span></div><div><small>{t("homepage.preview.watchlist")}</small><strong>08</strong><span>{t("homepage.preview.newSignals")}</span></div></div>
          <div className={styles.previewChart}><div><small>{t("homepage.preview.history")}</small><span>30D　90D　1Y</span></div><svg viewBox="0 0 640 120" role="img" aria-label={t("homepage.preview.history")}><defs><linearGradient id="preview-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#df6a63" /><stop offset="1" stopColor="#df6a63" stopOpacity="0" /></linearGradient></defs><path d="M0 96 C70 88 95 100 150 79 S245 85 300 63 S405 70 462 42 S550 53 640 15" /><path className={styles.chartFill} d="M0 96 C70 88 95 100 150 79 S245 85 300 63 S405 70 462 42 S550 53 640 15 V120 H0Z" /></svg></div>
          <div className={styles.previewCollectionHeader}><small>{t("homepage.preview.featuredCards")}</small><Link href="/market">{t("homepage.preview.viewAll")} <ArrowUpRight size={12} /></Link></div>
          <div className={styles.previewCards}>{featured.map(({ card, player }) => <Link href={`/cards/${card.id}`} key={card.id} className={styles.previewCard}>
            <CardVisual card={card} player={player} density="compact" />
            <span>{player.displayNameZh}</span>
          </Link>)}</div>
        </div>
      </div>
    </div>
    <div className={`${styles.callout} ${styles.calloutTop}`}><strong>4,000+ cards</strong><span>{t("homepage.preview.identityMatched")}</span></div>
    <div className={`${styles.callout} ${styles.calloutBottom}`}><strong>{t("homepage.preview.aiAnalysis")}</strong><span>{t("homepage.preview.compare")}</span></div>
  </div>;
}

