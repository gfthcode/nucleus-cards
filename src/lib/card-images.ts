import type { Card, CardImageRecord, Player } from "@/types/domain";

export interface CardImageSearchIdentity {
  playerName: string;
  displaySeason: string;
  manufacturer: string;
  setName: string;
  cardNumber: string;
  parallel: string;
  rookieDesignation: boolean;
}

export interface CardImageSourceAdapter {
  search(identity: CardImageSearchIdentity): Promise<CardImageRecord[]>;
  getSourceStatus(): "available" | "unavailable";
}

export function buildCardImageSearchIdentity(card: Card, player: Player): CardImageSearchIdentity {
  return { playerName: player.name, displaySeason: `${card.releaseYear}-${String(card.releaseYear + 1).slice(-2)}`, manufacturer: card.brand, setName: card.productLine, cardNumber: card.cardNumber, parallel: card.parallel, rookieDesignation: card.rookie };
}

// Until a licensed/catalog source is configured, missing images remain explicit placeholders.
export function getCardImage(card: Card): CardImageRecord {
  return { id: `placeholder-${card.id}`, cardId: card.id, imageType: "placeholder", isSlabbed: false, imageVerified: false, matchConfidence: 0, verificationStatus: "unverified", licenseStatus: "unknown", notes: "未接入已授权的精确卡图来源" };
}
