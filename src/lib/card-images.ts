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
    id: "public-catalog-image-2",
    cardId: "2",
    imageType: "catalog_scan",
    frontUrl: "https://cdn-vault.fanaticscollect.com/2025/3/4/rm3/medium/v1233192_2024030310094760R_25.jpg",
    thumbnailUrl: "https://cdn-vault.fanaticscollect.com/2025/3/4/rm3/medium/v1233192_2024030310094760R_25.jpg",
    sourceUrl: "https://www.fanaticscollect.com/buy-now/792c836d-aec5-41e8-b0cd-44b8290bbb37/2023-panini-prizm-silver-victor-wembanyama-rookie-136-psa-10-gem-mint",
    sourceName: "Fanatics Collect catalog",
    sourceType: "catalog",
    width: 800,
    height: 1120,
    aspectRatio: 800 / 1120,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-24",
    licenseStatus: "unknown",
    notes: "公开目录完整卡图，已核对 2023 Prizm Silver Prizm #136、Victor Wembanyama、PSA GEM MT 10；商业使用授权待核实。",
  },
  "19": {
    id: "public-catalog-image-19",
    cardId: "19",
    imageType: "catalog_scan",
    frontUrl: "https://cdn.myslabs.com/myslabs-prod/media/b6e6f85c-2d57-4d86-8997-7ea968453986/2025/04/27/BSVGLAW_1745786034_1.png",
    thumbnailUrl: "https://cdn.myslabs.com/myslabs-prod/media/b6e6f85c-2d57-4d86-8997-7ea968453986/2025/04/27/BSVGLAW_1745786034_1.png",
    sourceUrl: "https://www.cardladder.com/ladder/card/IaS0ccs629Q4iU3g8MZQ",
    sourceName: "Card Ladder catalog",
    sourceType: "catalog",
    width: 900,
    height: 1260,
    aspectRatio: 900 / 1260,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-24",
    licenseStatus: "unknown",
    notes: "公开目录完整卡图，已核对 2018 Panini Prizm Silver Prizm #184、Shai Gilgeous-Alexander、PSA GEM MT 10；商业使用授权待核实。",
  },
  "21": {
    id: "public-catalog-image-21",
    cardId: "21",
    imageType: "catalog_scan",
    frontUrl: "https://cdn-vault.fanaticscollect.com/2025/6/26/lk1/large/v1376146_20250626061430324M_1.jpg",
    thumbnailUrl: "https://cdn-vault.fanaticscollect.com/2025/6/26/lk1/large/v1376146_20250626061430324M_1.jpg",
    sourceUrl: "https://www.fanaticscollect.com/buy-now/6c063f92-31f5-4031-9c30-64a0f22ab769/2022-panini-prizm-silver-jalen-williams-rookie-246-psa-10-gem-mint",
    sourceName: "Fanatics Collect catalog",
    sourceType: "catalog",
    width: 1200,
    height: 1680,
    aspectRatio: 1200 / 1680,
    isSlabbed: true,
    gradingCompany: "PSA",
    grade: 10,
    imageVerified: true,
    matchConfidence: 99,
    verificationStatus: "probable",
    lastCheckedAt: "2026-09-24",
    licenseStatus: "unknown",
    notes: "公开目录完整卡图，已核对 2022 Prizm Silver Prizm #246、Jalen Williams、PSA GEM MT 10；商业使用授权待核实。",
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

function escapeSvg(value: string) {
  return value.replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&apos;" })[character] ?? character);
}

function buildGeneratedCardArt(card: Card, playerName = "NBA Player"): CardImageRecord {
  const title = escapeSvg(playerName.slice(0, 28));
  const set = escapeSvg(`${card.releaseYear} ${card.brand} ${card.productLine}`.slice(0, 34));
  const number = escapeSvg(`#${card.cardNumber}`);
  const parallel = escapeSvg(card.parallel.slice(0, 24));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#102e55"/><stop offset=".52" stop-color="#7b274c"/><stop offset="1" stop-color="#e66b58"/></linearGradient><linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".06"/><stop offset=".5" stop-color="#fff" stop-opacity=".48"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/></linearGradient></defs><rect width="600" height="840" rx="28" fill="#07101d"/><rect x="20" y="20" width="560" height="800" rx="22" fill="url(#bg)"/><path d="M30 560 570 160v190L30 750Z" fill="url(#foil)" opacity=".55"/><circle cx="300" cy="370" r="154" fill="#07101d" fill-opacity=".42" stroke="#fff" stroke-opacity=".4" stroke-width="3"/><text x="54" y="86" fill="#fff" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="4">NUCLEUS CARDS</text><text x="300" y="350" fill="#fff" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="700">${title}</text><text x="300" y="394" fill="#fff" fill-opacity=".8" text-anchor="middle" font-family="Arial,sans-serif" font-size="17">STANDARDIZED CARD VISUAL</text><rect x="54" y="650" width="492" height="1" fill="#fff" fill-opacity=".5"/><text x="54" y="700" fill="#fff" font-family="Arial,sans-serif" font-size="18">${set}</text><text x="54" y="733" fill="#fff" fill-opacity=".82" font-family="Arial,sans-serif" font-size="16">${parallel}</text><text x="546" y="733" fill="#fff" text-anchor="end" font-family="Arial,sans-serif" font-size="16">${number}</text><text x="300" y="782" fill="#fff" fill-opacity=".65" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" letter-spacing="1">ILLUSTRATIVE ART · NOT AN AUTHENTIC SCAN</text></svg>`;
  const frontUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return {
    id: `generated-card-art-${card.id}`,
    cardId: card.id,
    imageType: "catalog_scan",
    frontUrl,
    thumbnailUrl: frontUrl,
    sourceName: "Nucleus standardized card visual",
    sourceType: "official",
    width: 600,
    height: 840,
    aspectRatio: 600 / 840,
    isSlabbed: false,
    imageVerified: false,
    matchConfidence: 0,
    verificationStatus: "unverified",
    lastCheckedAt: "2026-09-24",
    licenseStatus: "permitted",
    notes: "每张卡的视觉兜底；真实卡图可用时由公开目录或已授权 API 自动替换。此图不是实物扫描。",
  };
}

function buildRosterCatalogImage(card: Card, playerName?: string): CardImageRecord {
  const generated = buildGeneratedCardArt(card, playerName);
  return {
    ...generated,
    id: `catalog-card-image-pending-${card.id}`,
    notes: "未找到可核验的公开实物卡图，已使用标准化卡面示意图，避免使用球员头像冒充卡图。",
  };
}

export function getCardImage(card: Card, playerName?: string): CardImageRecord {
  const userProvidedImage = userProvidedCardImages[card.id];
  if (userProvidedImage) return userProvidedImage;
  const publicCatalogImage = publicCatalogCardImages[card.id];
  if (publicCatalogImage) return publicCatalogImage;
  if (card.id.startsWith("catalog-")) return buildRosterCatalogImage(card, playerName);

  return buildGeneratedCardArt(card, playerName);
}
