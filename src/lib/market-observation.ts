export const marketObservationTypes = [
  "ACTIVE_FIXED_PRICE",
  "LIVE_AUCTION_CURRENT_BID",
  "ACTIVE_MARKET_SNAPSHOT",
  "VERIFIED_SOLD_PRICE_UNAVAILABLE",
] as const;

export type MarketObservationType = (typeof marketObservationTypes)[number];

export const verifiedSoldPriceStatus = "VERIFIED_SOLD_PRICE_UNAVAILABLE" as const;

export function isVerifiedSoldPriceAvailable() {
  // Browse is an active-market API. Historical sales must be supplied by an
  // explicitly authorized source, never inferred from an eBay listing.
  return false;
}
