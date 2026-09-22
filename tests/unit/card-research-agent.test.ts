import { describe, expect, it } from "vitest";
import {
  researchCard,
  researchQuestionSchema,
} from "@/lib/card-research-agent";
import { cards } from "@/lib/demo-data";

describe("card research agent", () => {
  it("returns traceable evidence instead of a price prediction", () => {
    const result = researchCard(cards[0].id, "这张卡和我的收藏重复吗？", {
      collectionQuantity: 1,
      positionQuantity: 0,
    });
    expect(result).not.toBeNull();
    expect(result?.modelVersion).toBe("nucleus-research-agent-v1");
    expect(result?.evidence.length).toBeGreaterThanOrEqual(4);
    expect(result?.toolTrace.every((tool) => tool.status === "read-only")).toBe(
      true,
    );
    expect(result?.answer).toContain("私有收藏");
    expect(result?.answer).not.toContain("上涨概率");
  });

  it("rejects excessively long questions", () => {
    expect(researchQuestionSchema.safeParse("x").success).toBe(false);
    expect(researchQuestionSchema.safeParse("x".repeat(601)).success).toBe(
      false,
    );
  });
});
