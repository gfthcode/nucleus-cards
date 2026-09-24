/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { getCardImage } from "@/lib/card-images";
import { DisplayedAmount } from "@/components/currency-switcher";
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
  const [liveImage, setLiveImage] = useState<{ url: string; sourceName: string; sourceUrl?: string } | null>(null);
  useEffect(() => {
    if (!card.id.startsWith("catalog-") || side === "back") return;
    const controller = new AbortController();
    const params = new URLSearchParams({ player: player.name, year: String(card.releaseYear), brand: card.brand, set: card.productLine });
    fetch(`/api/cards/catalog-image?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ image?: { url?: string; sourceName?: string; sourceUrl?: string } }> : null)
      .then((payload) => {
        if (payload?.image?.url) setLiveImage({ url: payload.image.url, sourceName: payload.image.sourceName ?? "eBay Browse API listing image", sourceUrl: payload.image.sourceUrl });
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [card, player.name, side]);
  const imageUrl = side === "back" ? image.backUrl : liveImage?.url ?? image.frontUrl;
  const hasImage = Boolean(imageUrl);
  const change = card.change30d;
  const referenceAmount = card.latestSaleCny ?? card.latestListingCny;
  const isReferenceListing = card.latestSaleCny == null && card.latestListingCny != null;

  return <div className={`${styles.card} ${side === "back" ? styles.sideBack : ""} ${density === "compact" ? styles.compact : ""}`} aria-label={`${playerName} ${side === "front" ? t("market.front") : t("market.back")}`}>
    <div className={styles.imageWrap}>
      {imageUrl && hasImage ? <img src={imageUrl} alt={`${playerName} ${card.releaseYear} ${card.productLine} ${card.parallel} #${card.cardNumber}`} /> : <div className={styles.placeholder}><b>{side === "front" ? t("market.cardImage") : t("market.back")}</b><strong>{playerName}</strong><small>{card.releaseYear} · {card.brand} {card.productLine}<br />{card.parallel} · #{card.cardNumber}<br />{t("market.noFiction")}</small></div>}
      {card.condition === "graded" && <span className={styles.grade}>{card.gradingCompany} {card.grade}</span>}
    </div>
    <div className={styles.meta}>
      <b className={styles.player}>{playerName}</b>
      <span className={styles.identity}>{card.releaseYear} {card.productLine} · {card.parallel} · #{card.cardNumber}{liveImage ? <> · {liveImage.sourceUrl ? <a href={liveImage.sourceUrl} target="_blank" rel="noreferrer" className={styles.sourceLink}>{liveImage.sourceName}</a> : liveImage.sourceName}</> : ""}</span>
      <div className={styles.valueRow}><b><DisplayedAmount cny={referenceAmount} /></b><small className={change == null ? "" : change >= 0 ? styles.up : styles.down}>{isReferenceListing ? (locale === "en" ? "Reference listing · not a sale" : "参考挂牌 · 非成交") : change == null ? t("market.insufficientData") : `${change > 0 ? "+" : ""}${change}% / 30D`}</small></div>
    </div>
  </div>;
}
