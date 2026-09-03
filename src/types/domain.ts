import type { Currency } from "@/config/product";

export type RiskLevel = "low" | "medium" | "high";
export type CardType = "Base" | "Insert" | "Parallel" | "Auto" | "Patch";
export type PlayerCohort =
  | "core_rookie"
  | "recent_rookie"
  | "young_core"
  | "prime"
  | "veteran"
  | "retired_legend";
export type SourceAuthorization =
  "licensed" | "official-api" | "community" | "demo" | "adapter-only";

export interface Team {
  id: string;
  slug: string;
  abbreviation: string;
  name: string;
  city: string;
  conference: "East" | "West";
  division: string;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  displayNameZh: string;
  position: string;
  draftYear: number;
  draftPick?: number;
  currentTeamId?: string;
  formerTeamIds: string[];
  age: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  marketHeat: number;
  cohort: PlayerCohort;
  isCoreRookie?: boolean;
  isRolePlayer?: boolean;
  isMarketActive?: boolean;
  isTradeHot?: boolean;
  isSigningHot?: boolean;
  peerRank?: number;
  valuationSignal?: "overheated" | "balanced" | "underfollowed";
  peerComparison?: string;
  injuryStatus: "healthy" | "monitor" | "out";
  riskLevel: RiskLevel;
  demo: boolean;
}

export interface Sale {
  id: string;
  cardId: string;
  sourceId: string;
  soldAt: string;
  originalAmount: number;
  originalCurrency: Currency;
  convertedCny: number;
  exchangeRate: number;
  verified: boolean;
  communitySubmitted: boolean;
  isBundle: boolean;
  isOutlier: boolean;
  excludedReason?: string;
  originalUrl?: string;
}

export interface Listing {
  id: string;
  cardId: string;
  sourceId: string;
  listedAt: string;
  amount: number;
  currency: Currency;
  convertedCny: number;
  originalUrl?: string;
}

export type AuctionRegion = "GLOBAL" | "INTL" | "CN";
export type AuctionSaleType = "auction" | "buy_now" | "best_offer" | "fixed_price" | "unknown";
export type AuctionStatus = "scheduled" | "live" | "ending_soon" | "ended" | "sold" | "unsold" | "cancelled";

export interface AuctionEvent {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceRegion: "CN" | "HK" | "INTL";
  auctionUrl: string;
  playerId: string;
  cardId: string;
  playerName: string;
  cardYear: number;
  manufacturer: string;
  setName: string;
  parallel: string;
  cardNumber: string;
  rookieDesignation: boolean;
  gradingCompany?: string;
  grade?: number;
  currency: string;
  startingBid: number;
  currentBid: number;
  bidCount: number;
  watcherCount: number;
  viewCount: number;
  startTime: string;
  endTime: string;
  auctionStatus: AuctionStatus;
  lastUpdatedAt: string;
  sourceVerified: boolean;
  saleType: AuctionSaleType;
  heatScore: number;
  heatChange24h: number;
}

export interface Card {
  id: string;
  identityKey: string;
  playerId: string;
  releaseYear: number;
  draftYear: number;
  brand: string;
  productLine: string;
  cardNumber: string;
  rookie: boolean;
  type: CardType;
  parallel: string;
  color?: string;
  printRun?: number;
  autograph: boolean;
  autographType?: string;
  memorabilia: boolean;
  materialType?: string;
  condition: "raw" | "graded";
  gradingCompany?: string;
  grade?: number;
  printedTeamId?: string;
  latestSaleCny?: number;
  latestListingCny?: number;
  change7d?: number;
  change30d?: number;
  change90d?: number;
  change1y?: number;
  sales30d: number;
  listingsCount: number;
  liquidity: number;
  riskLevel: RiskLevel;
  matchConfidence: number;
  dataCompleteness: number;
  demo: boolean;
}

export type CardImageType = "official" | "raw_card" | "graded_card" | "auction_scan" | "marketplace" | "catalog_scan" | "placeholder";
export type ImageVerificationStatus = "verified" | "probable" | "unverified" | "mismatch";

export interface CardImageRecord {
  id: string;
  cardId: string;
  imageType: CardImageType;
  frontUrl?: string;
  backUrl?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  sourceType?: "official" | "licensed" | "catalog" | "auction" | "marketplace";
  sourceImageId?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  isSlabbed: boolean;
  gradingCompany?: string;
  grade?: number;
  imageVerified: boolean;
  matchConfidence: number;
  verificationStatus: ImageVerificationStatus;
  lastCheckedAt?: string;
  attribution?: string;
  licenseStatus?: "permitted" | "attribution_required" | "unknown" | "not_permitted";
  notes?: string;
}

export interface DataSource {
  id: string;
  name: string;
  region: "CN" | "HK" | "INTL" | "COMMUNITY";
  enabled: boolean;
  requiresApiKey: boolean;
  supportsListings: boolean;
  supportsSales: boolean;
  authorization: SourceAuthorization;
  lastSyncAt?: string;
  error?: string;
}

export interface PortfolioItem {
  id: string;
  cardId: string;
  quantity: number;
  purchasePrice: number;
  purchaseCurrency: Currency;
  purchaseDate: string;
  platform: string;
  fees: number;
  shipping: number;
  tax: number;
  gradingCost: number;
  note: string;
  isPublic: boolean;
}

export interface AlertRule {
  id: string;
  cardId: string;
  type:
    | "price_above"
    | "price_below"
    | "daily_change"
    | "volume_spike"
    | "new_sale"
    | "injury"
    | "return"
    | "trade_rumor"
    | "signing"
    | "cohort_change"
    | "profit_target"
    | "loss_threshold";
  threshold?: number;
  enabled: boolean;
  triggered: boolean;
  lastTriggeredAt?: string;
}
