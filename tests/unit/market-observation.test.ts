import { describe, expect, it } from "vitest";
import { isVerifiedSoldPriceAvailable, marketObservationTypes, verifiedSoldPriceStatus } from "@/lib/market-observation";
import { xianyuAuthorizedProvider } from "@/lib/xianyu-authorized-provider";

describe("active-market data boundaries", () => {
  it("keeps active listings and live auction bids distinct from verified sales", () => {
    expect(marketObservationTypes).toContain("ACTIVE_FIXED_PRICE");
    expect(marketObservationTypes).toContain("LIVE_AUCTION_CURRENT_BID");
    expect(marketObservationTypes).not.toContain("VERIFIED_SOLD_PRICE");
    expect(verifiedSoldPriceStatus).toBe("VERIFIED_SOLD_PRICE_UNAVAILABLE");
    expect(isVerifiedSoldPriceAvailable()).toBe(false);
  });

  it("leaves Xianyu disabled until an authorized source is connected", () => {
    const provider = xianyuAuthorizedProvider;
    expect(provider.status).toBe("DISABLED");
    expect(provider.allowedFutureInputs).toEqual(expect.arrayContaining(["official-api", "partner-feed"]));
  });
});
