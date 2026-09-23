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

// Public catalog/listing references are used only when the player, year, set and
// card number match the local identity. The source URL and unknown license state
// stay attached so the image can be replaced when an authorized feed is connected.
const publicCatalogCardImages: Record<string, CardImageRecord> = {
  "6": {
    id: "public-catalog-image-6",
    cardId: "6",
    imageType: "catalog_scan",
    frontUrl: "https://cdn-vault.fanaticscollect.com/2021/10/3/1/medium/v238371_2021100215215715M_19.jpg",
    thumbnailUrl: "https://cdn-vault.fanaticscollect.com/2021/10/3/1/medium/v238371_2021100215215715M_19.jpg",
    sourceUrl: "https://www.fanaticscollect.com/buy-now/f7314b51-f996-4ea4-b21e-1813baadb612/1996-spx-die-cut-michael-jordan-8-psa-10-gem-mint",
    sourceName: "Fanatics Collect catalog",
    sourceType: "catalog",
    width: 480,
    height: 672,
    aspectRatio: 480 / 672,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 98,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-23",
    licenseStatus: "unknown",
    notes: "公开目录图片，已核对 1996 SPx Michael Jordan #8；商业使用授权待核实。",
  },
  "8": {
    id: "public-marketplace-image-8",
    cardId: "8",
    imageType: "marketplace",
    frontUrl: "https://i.ebayimg.com/images/g/sr0AAOSwz9FlS6KQ/s-l1600.jpg",
    thumbnailUrl: "https://i.ebayimg.com/images/g/sr0AAOSwz9FlS6KQ/s-l1600.jpg",
    sourceUrl: "https://www.ebay.com/itm/176019142344",
    sourceName: "eBay listing reference",
    sourceType: "marketplace",
    width: 1200,
    height: 1600,
    aspectRatio: 1200 / 1600,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 98,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-23",
    licenseStatus: "unknown",
    notes: "公开挂牌图片，已核对 2021 Panini Prizm Cade Cunningham #282；商业使用授权待核实。",
  },
  "17": {
    id: "public-auction-image-17",
    cardId: "17",
    imageType: "auction_scan",
    frontUrl: "https://d1w8cc2yygc27j.cloudfront.net/6097864440937633064/-1380405816046837501.jpg",
    thumbnailUrl: "https://d1w8cc2yygc27j.cloudfront.net/6097864440937633064/-1380405816046837501.jpg",
    sourceUrl: "https://www.psacard.com/auctionprices/basketball-cards/2009-topps/stephen-curry/1699202",
    sourceName: "PSA Auction Prices",
    sourceType: "auction",
    width: 640,
    height: 896,
    aspectRatio: 640 / 896,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 9,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-23",
    licenseStatus: "unknown",
    notes: "PSA 拍卖价格目录图片，已核对 2009 Topps Stephen Curry #321；商业使用授权待核实。",
  },
  "20": {
    id: "public-catalog-image-20",
    cardId: "20",
    imageType: "catalog_scan",
    frontUrl: "https://hollywoodcollectibles.com/cdn/shop/products/img854_d6219481-24de-479a-a3f6-46ae1474359a_600x.jpg?v=1675864757",
    thumbnailUrl: "https://hollywoodcollectibles.com/cdn/shop/products/img854_d6219481-24de-479a-a3f6-46ae1474359a_600x.jpg?v=1675864757",
    sourceUrl: "https://hollywoodcollectibles.com/products/lebron-james-2003-topps-chrome-rookie-card-111-psa-gem-mt-10",
    sourceName: "Hollywood Collectibles catalog",
    sourceType: "catalog",
    width: 600,
    height: 840,
    aspectRatio: 600 / 840,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-23",
    licenseStatus: "unknown",
    notes: "公开目录图片，已核对 2003 Topps Chrome LeBron James #111；商业使用授权待核实。",
  },
  "12": {
    id: "public-marketplace-image-12",
    cardId: "12",
    imageType: "marketplace",
    frontUrl: "https://i.ebayimg.com/images/g/DHMAAOSwETBmKb~U/s-l1200.jpg",
    thumbnailUrl: "https://i.ebayimg.com/images/g/DHMAAOSwETBmKb~U/s-l1200.jpg",
    sourceUrl: "https://www.ebay.com/itm/176348956744",
    sourceName: "eBay listing reference",
    sourceType: "marketplace",
    width: 1200,
    height: 1600,
    aspectRatio: 1200 / 1600,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-23",
    licenseStatus: "unknown",
    notes: "公开挂牌图片，已核对 2022 Panini Prizm Chet Holmgren Red Ice #266；商业使用授权待核实。",
  },
  "16": {
    id: "public-marketplace-image-16",
    cardId: "16",
    imageType: "marketplace",
    frontUrl: "https://i.ebayimg.com/images/g/YbMAAeSwuIFn0zh0/s-l1600.jpg",
    thumbnailUrl: "https://i.ebayimg.com/images/g/YbMAAeSwuIFn0zh0/s-l1600.jpg",
    sourceUrl: "https://www.ebay.com/itm/365458909257",
    sourceName: "eBay listing reference",
    sourceType: "marketplace",
    width: 1200,
    height: 1600,
    aspectRatio: 1200 / 1600,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-23",
    licenseStatus: "unknown",
    notes: "公开挂牌图片，已核对 2018 Panini Prizm Mikal Bridges Silver Prizm #289；商业使用授权待核实。",
  },
};

export function getCardImage(card: Card): CardImageRecord {
  const userProvidedImage = userProvidedCardImages[card.id];
  if (userProvidedImage) return userProvidedImage;
  const publicCatalogImage = publicCatalogCardImages[card.id];
  if (publicCatalogImage) return publicCatalogImage;

  return { id: `placeholder-${card.id}`, cardId: card.id, imageType: "placeholder", isSlabbed: false, imageVerified: false, matchConfidence: 0, verificationStatus: "unverified", licenseStatus: "unknown", notes: "未接入已授权的精确卡图来源" };
}
