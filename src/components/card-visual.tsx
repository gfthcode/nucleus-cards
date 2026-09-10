/* eslint-disable @next/next/no-img-element */

import { getCardImage } from "@/lib/card-images";
import type { Card, Player } from "@/types/domain";

export function CardVisual({
  card,
  player,
  side = "front",
}: {
  card: Card;
  player: Player;
  side?: "front" | "back";
}) {
  const image = getCardImage(card);
  const hasFrontImage = side === "front" && Boolean(image.frontUrl);

  if (hasFrontImage) {
    return <div className={`card-visual ${side} has-card-image`} aria-label={`${player.displayNameZh} 卡片正面图片`}>
      <img src={image.frontUrl} alt={`${player.name} ${card.releaseYear} ${card.productLine} ${card.parallel} #${card.cardNumber}`} />
      <span className="card-image-credit">{image.sourceName ?? "用户提供图片"} · 待授权核验</span>
    </div>;
  }

  return <div className={`card-visual ${side} image-placeholder`} aria-label={`${player.displayNameZh} ${side === "front" ? "卡片正面" : "卡片背面"}图片暂缺`}>
    <span className="card-brand">暂无已核验卡图</span>
    <div className="player-monogram">{side === "front" ? "CARD" : "BACK"}</div>
    <div className="card-player"><b>{player.name}</b><small>{card.releaseYear} · {card.productLine}</small></div>
    <span className="card-number">#${card.cardNumber}</span>
    <small className="card-image-missing">{card.parallel} · 暂无已验证卡图</small>
  </div>;
}
