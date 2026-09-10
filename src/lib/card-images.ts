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

const userProvidedCardImages: Record<string, CardImageRecord> = {
  "2": {
    id: "user-card-image-2",
    cardId: "2",
    imageType: "graded_card",
    frontUrl: "/card-images/wembanyama-2023-prizm-silver-136-psa10.png",
    thumbnailUrl: "/card-images/wembanyama-2023-prizm-silver-136-psa10.png",
    sourceName: "用户提供图片",
    sourceType: "user-provided",
    width: 652,
    height: 944,
    aspectRatio: 652 / 944,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-10",
    licenseStatus: "unknown",
    notes: "根据用户上传图片核对：2023 Prizm Silver Prizm #136，PSA GEM MT 10。图片公开授权状态未声明。",
  },
  "19": {
    id: "user-card-image-19",
    cardId: "19",
    imageType: "graded_card",
    frontUrl: "/card-images/sga-2018-prizm-silver-184-psa10.png",
    thumbnailUrl: "/card-images/sga-2018-prizm-silver-184-psa10.png",
    sourceName: "用户提供图片",
    sourceType: "user-provided",
    width: 818,
    height: 976,
    aspectRatio: 818 / 976,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-10",
    licenseStatus: "unknown",
    notes: "根据用户上传图片核对：2018 Panini Prizm Silver Prizm #184，PSA GEM MT 10。图片公开授权状态未声明。",
  },
  "21": {
    id: "user-card-image-21",
    cardId: "21",
    imageType: "graded_card",
    frontUrl: "/card-images/jalen-williams-2022-prizm-silver-246-psa10.png",
    thumbnailUrl: "/card-images/jalen-williams-2022-prizm-silver-246-psa10.png",
    sourceName: "用户提供图片",
    sourceType: "user-provided",
    width: 790,
    height: 964,
    aspectRatio: 790 / 964,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-10",
    licenseStatus: "unknown",
    notes: "根据用户上传图片核对：2022 Prizm Silver Prizm #246，PSA GEM MT 10。图片公开授权状态未声明。",
  },
};

export function getCardImage(card: Card): CardImageRecord {
  const userProvidedImage = userProvidedCardImages[card.id];
  if (userProvidedImage) return userProvidedImage;

  return { id: `placeholder-${card.id}`, cardId: card.id, imageType: "placeholder", isSlabbed: false, imageVerified: false, matchConfidence: 0, verificationStatus: "unverified", licenseStatus: "unknown", notes: "未接入已授权的精确卡图来源" };
}
