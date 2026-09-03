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
  return <div className={`card-visual ${side} image-placeholder`} aria-label={`${player.displayNameZh} ${side === "front" ? "卡片正面" : "卡片背面"}图片暂缺`}>
    <span className="card-brand">IMAGE NOT AVAILABLE</span>
    <div className="player-monogram">{side === "front" ? "CARD" : "BACK"}</div>
    <div className="card-player"><b>{player.name}</b><small>{card.releaseYear} · {card.productLine}</small></div>
    <span className="card-number">#{card.cardNumber}</span>
    <small className="card-image-missing">{card.parallel} · 暂无已验证卡图</small>
  </div>;
}
