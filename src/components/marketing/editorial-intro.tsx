"use client";

import Link from "next/link";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { useEffect, useState } from "react";
import { CardVisual } from "@/components/card-visual";
import type { Card, Player } from "@/types/domain";
import { useI18n } from "@/i18n/client";
import styles from "./editorial-intro.module.css";

type IntroRow = { card: Card; player: Player };

export function EditorialIntro({ rows }: { rows: IntroRow[] }) {
  const { locale } = useI18n();
  const copy = locale === "en" ? {
    eyebrow: "Nucleus / market film 01", lineOne: "Put every card", lineTwo: "back into", lineThree: "its story.", description: "Identity, imagery and sale evidence in one quiet sequence—see the card clearly before it joins your collection.", action: "Enter the market archive", signal: "Featured cards · live sequence", stamp: "COLLECT WITH EVIDENCE", select: "View card",
  } : {
    eyebrow: "Nucleus / market film 01", lineOne: "把一张卡", lineTwo: "放回", lineThree: "它的故事里。", description: "从身份、图像到成交证据，先看清卡片，再决定它是否值得进入收藏。", action: "进入行情档案", signal: "精选卡片 · 实时导览", stamp: "COLLECT WITH EVIDENCE", select: "查看第",
  };
  const cards = rows.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (cards.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % cards.length), 4200);
    return () => window.clearInterval(timer);
  }, [cards.length]);
  return <section className={styles.editorialIntro} aria-labelledby="editorial-intro-title">
    <div className={styles.introCopy}>
      <span className={styles.introEyebrow}>{copy.eyebrow}</span>
      <h2 id="editorial-intro-title"><span>{copy.lineOne}</span><em>{copy.lineTwo}</em><span>{copy.lineThree}</span></h2>
      <p>{copy.description}</p>
      <Link className={styles.introLink} href="/market">{copy.action} <ArrowUpRight size={15} /></Link>
    </div>
    <div className={styles.introStage}>
      <div className={styles.introStageTopline}><span>{copy.signal}</span><span>{String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span></div>
      <div className={styles.introOrbit}><div className={styles.introOrbitLine} />
        {cards.map(({ card, player }, index) => <Link className={`${styles.introCard} ${index === activeIndex ? styles.introCardActive : ""}`} href={`/cards/${card.id}`} key={card.id} style={{ ["--intro-index" as string]: index, ["--intro-total" as string]: cards.length }} onMouseEnter={() => setActiveIndex(index)} aria-label={`${player.name} ${card.releaseYear} ${card.productLine}`}>
          <CardVisual card={card} player={player} density="compact" />
          <span className={styles.introCardLabel}><b>{locale === "en" ? player.name : player.displayNameZh}</b><small>{card.releaseYear} · {card.parallel}</small></span>
        </Link>)}
        <div className={styles.introStamp}><span>NC</span><small>{copy.stamp}</small></div>
      </div>
      <div className={styles.introProgress}>{cards.map((item, index) => <button type="button" key={item.card.id} className={index === activeIndex ? styles.introProgressActive : ""} onClick={() => setActiveIndex(index)} aria-label={`${copy.select} ${index + 1}`} />)}<MoveRight size={14} /></div>
    </div>
  </section>;
}
