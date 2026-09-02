import { describe, expect, it } from "vitest";
import { portfolioInputSchema, saleImportBatchSchema } from "@/lib/validation";

describe("runtime validation", () => {
  it("accepts a valid sale import record", () => {
    expect(
      saleImportBatchSchema.safeParse({
        records: [
          {
            cardIdentityKey: "topps|2025|101",
            soldAt: "2026-08-31T01:30:00Z",
            amount: 100,
            currency: "CNY",
            source: "community",
          },
        ],
      }).success,
    ).toBe(true);
  });
  it("rejects invalid currencies and negative amounts", () => {
    expect(
      saleImportBatchSchema.safeParse({
        records: [
          {
            cardIdentityKey: "topps|2025|101",
            soldAt: "bad",
            amount: -1,
            currency: "BTC",
            source: "x",
          },
        ],
      }).success,
    ).toBe(false);
  });
  it("keeps portfolio visibility private by default", () => {
    const parsed = portfolioInputSchema.parse({
      cardId: "1",
      quantity: 1,
      purchasePrice: 100,
      purchaseCurrency: "CNY",
      purchaseDate: "2026-08-31",
      platform: "demo",
    });
    expect(parsed.isPublic).toBe(false);
  });
});
