import { describe, expect, it } from "vitest";
import { aiAnalysisSchema, DeterministicDemoAI } from "@/lib/ai-analysis";
import { cards, getPlayer } from "@/lib/demo-data";

describe("deterministic AI", () => {
  it("returns stable Zod-validated evidence-based output", async () => {
    const card = cards[0];
    const player = getPlayer(card.playerId)!;
    const engine = new DeterministicDemoAI();
    const first = await engine.analyze(card, player, "7-30d");
    const second = await engine.analyze(card, player, "7-30d");
    expect(aiAnalysisSchema.safeParse(first).success).toBe(true);
    expect(first).toEqual(second);
    expect(first.evidence.length).toBeGreaterThan(0);
    expect(first.playerCohort).toBe(player.cohort);
    expect(first.peerComparison).toBe(player.peerComparison);
    expect(first.disclaimer).toContain("不构成投资");
  });
  it("keeps every probability range within 0-100", async () => {
    const result = await new DeterministicDemoAI().analyze(
      cards[6],
      getPlayer(cards[6].playerId)!,
      "1-3m",
    );
    for (const range of [
      result.upwardProbabilityRange,
      result.neutralProbabilityRange,
      result.downwardProbabilityRange,
    ]) {
      expect(range[0]).toBeGreaterThanOrEqual(0);
      expect(range[1]).toBeLessThanOrEqual(100);
      expect(range[0]).toBeLessThanOrEqual(range[1]);
    }
  });
});
