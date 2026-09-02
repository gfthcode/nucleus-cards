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
  return (
    <div
      className={`card-visual ${side}`}
      aria-label={`${player.displayNameZh} ${side === "front" ? "卡片正面演示图" : "卡片背面演示图"}`}
    >
      {side === "front" ? (
        <>
          <span className="card-brand">{card.brand}</span>
          <div className="player-monogram">
            {player.name
              .split(" ")
              .map((word) => word[0])
              .join("")}
          </div>
          <div className="card-player">
            <b>{player.name}</b>
            <small>{card.productLine}</small>
          </div>
          <span className="card-number">{card.cardNumber}</span>
          {card.rookie && <span className="rc-mark">RC</span>}
        </>
      ) : (
        <>
          <span className="card-brand">NUCLEUS DEMO</span>
          <div className="back-lines">
            <i />
            <i />
            <i />
            <i />
          </div>
          <b className="back-name">{player.name}</b>
          <small>演示占位图 · 不代表真实卡面</small>
        </>
      )}
    </div>
  );
}
