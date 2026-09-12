/* eslint-disable @next/next/no-img-element */

import { getCardImage } from "@/lib/card-images";
import type { Card, Player } from "@/types/domain";
import styles from "./card-visual.module.css";

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
  const image = getCardImage(card);
  const imageUrl = side === "back" ? image.backUrl : image.frontUrl;
  const hasImage = Boolean(imageUrl);
  const price = card.latestSaleCny ? `¥${card.latestSaleCny.toLocaleString()}` : "暂无成交";
  const change = card.change30d;

  return <div className={`${styles.card} ${side === "back" ? styles.sideBack : ""} ${density === "compact" ? styles.compact : ""}`} aria-label={`${player.displayNameZh} ${side === "front" ? "卡片正面" : "卡片背面"}`}>
    <div className={styles.imageWrap}>
      {imageUrl && hasImage ? <img src={imageUrl} alt={`${player.name} ${card.releaseYear} ${card.productLine} ${card.parallel} #${card.cardNumber}`} /> : <div className={styles.placeholder}><b>{side === "front" ? "CARD IMAGE" : "CARD BACK"}</b><strong>{player.name}</strong><small>{card.releaseYear} · {card.brand} {card.productLine}<br />{card.parallel} · #{card.cardNumber}<br />未使用虚构卡面</small></div>}
      {card.condition === "graded" && <span className={styles.grade}>{card.gradingCompany} {card.grade}</span>}
    </div>
    <div className={styles.meta}>
      <b className={styles.player}>{player.name}</b>
      <span className={styles.identity}>{card.releaseYear} {card.productLine} · {card.parallel} · #{card.cardNumber}</span>
      <div className={styles.valueRow}><b>{price}</b><small className={change == null ? "" : change >= 0 ? styles.up : styles.down}>{change == null ? "样本不足" : `${change > 0 ? "+" : ""}${change}% / 30D`}</small></div>
    </div>
  </div>;
}
