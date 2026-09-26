"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { CardVisual } from "@/components/card-visual";
import type { Card, Player } from "@/types/domain";
import styles from "./marketing.module.css";

type FeaturedCard = { card: Card; player: Player };

export function CinematicHero({ cards, locale }: { cards: FeaturedCard[]; locale: "zh-CN" | "en" }) {
  const safeCards = cards.slice(0, 4);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || safeCards.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % safeCards.length), 4600);
    return () => window.clearInterval(timer);
  }, [playing, safeCards.length]);

  if (!safeCards.length) return null;
  const current = safeCards[active] ?? safeCards[0];
  const next = safeCards[(active + 1) % safeCards.length] ?? current;
  const name = locale === "en" ? current.player.name : current.player.displayNameZh;

  return <div className={styles.cinematicStage} data-playing={playing} onMouseEnter={() => setPlaying(false)} onMouseLeave={() => setPlaying(true)}>
    <div className={styles.cinematicAura} aria-hidden />
    <div className={styles.cinematicGrid} aria-hidden />
    <div className={styles.trainScene} aria-hidden>
      <div className={styles.trainSkyline} />
      <div className={styles.trainWindow}>
        <div className={styles.trainTrack} />
        <div className={styles.trainLight} />
        <div className={styles.trainBody}>
          <i /><i /><i />
        </div>
      </div>
      <div className={styles.trainWatcher}>
        <span className={styles.watcherHead} />
        <span className={styles.watcherBody} />
      </div>
      <span className={styles.trainSceneLabel}>{locale === "en" ? "WATCH THE MARKET MOVE" : "看着行情驶来"}</span>
    </div>
    <div className={styles.cinematicMirror}>
      <div className={styles.mirrorOrnament} aria-hidden><span /><span /><span /></div>
      <div className={styles.mirrorImage} key={current.card.id}>
        <CardVisual card={current.card} player={current.player} density="image" />
      </div>
      <div className={styles.mirrorCaption}>
        <span>{locale === "en" ? "THE CARD IN FOCUS" : "聚焦卡片"}</span>
        <strong>{name}</strong>
        <small>{current.card.releaseYear} · {current.card.productLine} · #{current.card.cardNumber.replace(/^#+/, "")}</small>
      </div>
    </div>
    <div className={styles.cinematicSideCard} key={`${next.card.id}-${active}`}>
      <CardVisual card={next.card} player={next.player} density="image" />
      <span>{locale === "en" ? "NEXT IN THE COLLECTION" : "下一张收藏"}</span>
    </div>
    <div className={styles.cinematicControls} aria-label={locale === "en" ? "Hero card controls" : "首页卡片控制"}>
      <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? (locale === "en" ? "Pause animation" : "暂停动画") : (locale === "en" ? "Play animation" : "播放动画")}>
        {playing ? <Pause size={13} aria-hidden /> : <Play size={13} aria-hidden />}
      </button>
      {safeCards.map((item, index) => <button key={item.card.id} type="button" className={index === active ? styles.cinematicDotActive : styles.cinematicDot} onClick={() => setActive(index)} aria-label={`${locale === "en" ? "Show" : "查看"} ${locale === "en" ? item.player.name : item.player.displayNameZh}`} />)}
      <Link href={`/cards/${current.card.id}`}>{locale === "en" ? "Open card" : "打开卡片"} <ArrowUpRight size={13} aria-hidden /></Link>
    </div>
    <Link className={styles.cinematicNext} href="/market">{locale === "en" ? "Explore the market" : "进入行情"} <ChevronRight size={16} aria-hidden /></Link>
  </div>;
}
