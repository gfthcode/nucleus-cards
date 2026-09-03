/* eslint-disable @next/next/no-img-element */
import type { Card, CardImageRecord, Player } from "@/types/domain";
import { getCardImage } from "@/lib/card-images";

export function CardImage({ card, player, image, size = "medium", preferAuctionImage = false }: { card: Card; player: Player; image?: CardImageRecord; size?: "thumbnail" | "small" | "medium" | "large"; preferAuctionImage?: boolean }) {
  const record = image ?? getCardImage(card);
  const alt = `${card.releaseYear}-${String(card.releaseYear + 1).slice(-2)} ${card.brand} ${card.productLine} ${player.name} ${card.parallel} #${card.cardNumber}`;
  return <div className={`card-image card-image-${size} ${record.imageType === "placeholder" ? "is-placeholder" : ""}`} aria-label={alt}>
    {record.frontUrl ? <img src={record.frontUrl} alt={alt} loading={size === "large" ? "eager" : "lazy"} onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement?.classList.add("is-placeholder"); }} /> : <><span className="card-image-placeholder">IMAGE<br />NOT AVAILABLE</span><small>{card.releaseYear} · {card.productLine}</small><small>{card.parallel} · #{card.cardNumber}</small></>}
    {record.imageType !== "placeholder" && <small className="card-image-source">{preferAuctionImage ? "Auction Scan" : record.sourceName ?? "已验证卡图"}</small>}
  </div>;
}

export function CardIdentity({ card, player, image }: { card: Card; player: Player; image?: CardImageRecord }) {
  return <div className="card-identity"><CardImage card={card} player={player} image={image} size="small" /><div><b>{player.name}</b><strong>{card.releaseYear} · {card.brand} {card.productLine}</strong><small>{card.parallel} · #{card.cardNumber}{card.rookie ? " · Rookie Card" : ""}</small></div></div>;
}
