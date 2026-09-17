import { describe, expect, it } from "vitest";
import { canonicalCardIdentityKey, isLikelySingleTradingCard } from "@/lib/card-discovery-core";

describe("real card discovery normalization", () => {
  it("keeps grade, parallel and card number distinct", () => {
    const raw = { year: 2023, brand: "Panini", setName: "Prizm", cardNumber: "136", parallel: "Silver", gradingCompany: null, grade: null, rawOrGraded: "RAW" as const };
    const graded = { ...raw, gradingCompany: "PSA", grade: 10, rawOrGraded: "GRADED" as const };
    expect(raw.rawOrGraded).toBe("RAW");
    expect(graded.rawOrGraded).toBe("GRADED");
    expect(canonicalCardIdentityKey("wemby", raw)).not.toBe(canonicalCardIdentityKey("wemby", graded));
  });

  it("rejects marketplace bundles and accepts a single card title", () => {
    expect(isLikelySingleTradingCard("Victor Wembanyama 2023 Prizm #136 PSA 10")).toBe(true);
    expect(isLikelySingleTradingCard("Victor Wembanyama 2023 Prizm Hobby Box Sealed")).toBe(false);
    expect(isLikelySingleTradingCard("Spurs team break 30 cards lot")).toBe(false);
  });
});

