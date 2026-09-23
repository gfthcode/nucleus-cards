import { cards, getPlayer } from "@/lib/demo-data";
import { getCardImage } from "@/lib/card-images";
import type { Card, CardImageRecord, Player } from "@/types/domain";

/**
 * Homepage cards are deliberately limited to records with a bundled image
 * whose cardId matches the data record. This prevents a visually similar
 * user-provided photo from being presented as a different card identity.
 */
export interface FeaturedCardRecord {
  card: Card;
  player: Player;
  image: CardImageRecord;
}

const FEATURED_CARD_IDS = ["2", "19", "21", "6", "8", "12", "16", "17", "20"] as const;

export function getFeaturedCards(): FeaturedCardRecord[] {
  return FEATURED_CARD_IDS.flatMap((cardId) => {
    const card = cards.find((item) => item.id === cardId);
    const player = card ? getPlayer(card.playerId) : undefined;
    const image = card ? getCardImage(card) : undefined;

    if (!card || !player || !image?.frontUrl) return [];
    if (image.cardId !== card.id || !image.imageVerified || image.matchConfidence < 99) return [];

    return [{ card, player, image }];
  });
}

