import { describe, expect, it } from "vitest";
import {
  calculateMarketReference,
  convertCurrency,
  detectOutliers,
  liquidityScore,
  median,
  portfolioItemValue,
  volumeWeightedPrice,
} from "@/lib/market-math";
import type { PortfolioItem, Sale } from "@/types/domain";

describe("market calculations", () => {
  it("uses the median for even and odd sample sets", () => {
    expect(median([10, 3, 5])).toBe(5);
    expect(median([10, 20, 30, 40])).toBe(25);
    expect(median([])).toBeNull();
  });
  it("calculates volume weighted price", () => {
    expect(
      volumeWeightedPrice([
        { price: 100, quantity: 1 },
        { price: 200, quantity: 3 },
      ]),
    ).toBe(175);
  });
  it("converts currencies through CNY rates", () => {
    expect(
      convertCurrency(100, "USD", "CNY", { CNY: 1, HKD: 0.916, USD: 7.17 }),
    ).toBe(717);
    expect(
      convertCurrency(717, "CNY", "USD", { CNY: 1, HKD: 0.916, USD: 7.17 }),
    ).toBe(100);
  });
  it("detects but does not delete outliers", () => {
    expect(detectOutliers([100, 101, 102, 103, 999])).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
  });
  it("shows a range instead of false precision for low samples", () => {
    const sale = (id: string, price: number): Sale => ({
      id,
      cardId: "1",
      sourceId: "demo",
      soldAt: "2026-01-01",
      originalAmount: price,
      originalCurrency: "CNY",
      convertedCny: price,
      exchangeRate: 1,
      verified: true,
      communitySubmitted: false,
      isBundle: false,
      isOutlier: false,
    });
    expect(calculateMarketReference([sale("1", 100), sale("2", 120)])).toEqual({
      precise: false,
      median: 110,
      range: [100, 120],
      samples: 2,
    });
  });
  it("computes bounded liquidity", () => {
    expect(
      liquidityScore({
        sales30d: 100,
        listingsCount: 100,
        daysSinceLastSale: 0,
        volatility: 0,
      }),
    ).toBe(100);
    expect(
      liquidityScore({
        sales30d: 0,
        listingsCount: 0,
        daysSinceLastSale: 40,
        volatility: 100,
      }),
    ).toBe(0);
  });
  it("calculates portfolio cost and profit", () => {
    const item: PortfolioItem = {
      id: "1",
      cardId: "1",
      quantity: 2,
      purchasePrice: 100,
      purchaseCurrency: "CNY",
      purchaseDate: "2026-01-01",
      platform: "demo",
      fees: 10,
      shipping: 5,
      tax: 0,
      gradingCost: 20,
      note: "",
      isPublic: false,
    };
    expect(portfolioItemValue(item, 150)).toEqual({
      cost: 235,
      current: 300,
      profit: 65,
      profitRate: (65 / 235) * 100,
    });
  });
});
