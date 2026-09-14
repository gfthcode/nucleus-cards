/* eslint-disable @next/next/no-img-element */
"use client";

import { getCardImage } from "@/lib/card-images";
import type { Card, Player } from "@/types/domain";
import styles from "./card-visual.module.css";
import { useI18n } from "@/i18n/client";
import { displayPlayerName } from "@/i18n/display-names";

export function CardVisual({
  card,
  player,
  side = "front",
  density = "default",
}: {
  card: Card;
  player: Player;
  side?: "front" | "back";
  density?: "default" | "compact";
}) {
  const { locale, t } = useI18n();
  const playerName = displayPlayerName(player, locale);
  const image = getCardImage(card);
  const imageUrl = side === "back" ? image.backUrl : image.frontUrl;
  const hasImage = Boolean(imageUrl);
  const price = card.latestSaleCny ? `¥${card.latestSaleCny.toLocaleString()}` : t("market.noSales");
  const change = card.change30d;

  return <div className={`${styles.card} ${side === "back" ? styles.sideBack : ""} ${density === "compact" ? styles.compact : ""}`} aria-label={`${playerName} ${side === "front" ? t("market.front") : t("market.back")}`}>
    <div className={styles.imageWrap}>
      {imageUrl && hasImage ? <img src={imageUrl} alt={`${playerName} ${card.releaseYear} ${card.productLine} ${card.parallel} #${card.cardNumber}`} /> : <div className={styles.placeholder}><b>{side === "front" ? t("market.cardImage") : t("market.back")}</b><strong>{playerName}</strong><small>{card.releaseYear} · {card.brand} {card.productLine}<br />{card.parallel} · #{card.cardNumber}<br />{t("market.noFiction")}</small></div>}
      {card.condition === "graded" && <span className={styles.grade}>{card.gradingCompany} {card.grade}</span>}
    </div>
    <div className={styles.meta}>
      <b className={styles.player}>{playerName}</b>
      <span className={styles.identity}>{card.releaseYear} {card.productLine} · {card.parallel} · #{card.cardNumber}</span>
      <div className={styles.valueRow}><b>{price}</b><small className={change == null ? "" : change >= 0 ? styles.up : styles.down}>{change == null ? t("market.insufficientData") : `${change > 0 ? "+" : ""}${change}% / 30D`}</small></div>
    </div>
  </div>;
}

