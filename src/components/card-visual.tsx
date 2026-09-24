/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
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
  density?: "default" | "compact" | "image";
}) {
  const { locale, t } = useI18n();
  const playerName = displayPlayerName(player, locale);
  const image = getCardImage(card, player.name);
  const [failedUrl, setFailedUrl] = useState<string | undefined>();
  const imageUrl = side === "back" ? image.backUrl : image.frontUrl;
  const hasPhoto = Boolean(
    imageUrl &&
      image.imageVerified &&
      !imageUrl.startsWith("data:") &&
      imageUrl !== failedUrl,
  );
  const imageOnly = density === "image";
  const number = card.cardNumber.replace(/^#+/, "");
  const parallel = card.parallel === "Unspecified" && locale !== "en" ? "版本未披露" : card.parallel;
  const cardIdentity = `${card.releaseYear} ${card.productLine} · ${parallel} · #${number}`;
  const referenceAmount = card.latestSaleCny ?? card.latestListingCny;
  const isReferenceListing = card.latestSaleCny == null && card.latestListingCny != null;
  const change = card.change30d;

  return (
    <div
      className={`${styles.card} ${side === "back" ? styles.sideBack : ""} ${density === "compact" ? styles.compact : ""} ${imageOnly ? styles.imageOnly : ""}`}
      aria-label={`${playerName} ${side === "front" ? t("market.front") : t("market.back")}`}
      data-card-id={card.id}
      data-card-photo={hasPhoto ? "true" : "false"}
    >
      <div className={styles.imageWrap}>
        {hasPhoto && imageUrl ? (
          <img
            src={imageUrl}
            alt={`${playerName} ${cardIdentity}`}
            loading="lazy"
            decoding="async"
            onError={() => setFailedUrl(imageUrl)}
          />
        ) : (
          <div className={styles.placeholder}>
            <b>
              {side === "back"
                ? locale === "en" ? "Back photo unavailable" : "背面照片待补充"
                : locale === "en" ? "Card photo unavailable" : "实物卡图待补充"}
            </b>
            <strong>{playerName}</strong>
            <small>{cardIdentity}</small>
          </div>
        )}
        {!imageOnly && card.condition === "graded" && (
          <span className={styles.grade}>{card.gradingCompany} {card.grade}</span>
        )}
      </div>
      {!imageOnly && (
        <div className={styles.meta}>
          <b className={styles.player}>{playerName}</b>
          <span className={styles.identity}>
            {cardIdentity}
            {hasPhoto && image.sourceName ? <> · {image.sourceName}</> : null}
          </span>
          <div className={styles.valueRow}>
            <b><DisplayedAmount cny={referenceAmount} /></b>
            <small className={change == null ? "" : change >= 0 ? styles.up : styles.down}>
              {isReferenceListing
                ? locale === "en" ? "Reference listing · not a sale" : "参考挂牌 · 非成交"
                : change == null
                  ? t("market.insufficientData")
                  : `${change > 0 ? "+" : ""}${change}% / 30D`}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
