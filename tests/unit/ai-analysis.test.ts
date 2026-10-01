import { describe, expect, it } from "vitest";
import { aiAnalysisSchema, DeterministicDemoAI } from "@/lib/ai-analysis";
import { cards, getPlayer } from "@/lib/demo-data";
import { getCourtMatchPlayerContext } from "@/lib/courtmatch-context";

describe("deterministic AI", () => {
  it("returns stable Zod-validated evidence-based output", async () => {
    const card = cards[0];
    const player = getPlayer(card.playerId)!;
    const engine = new DeterministicDemoAI();
    const first = await engine.analyze(card, player, "7-30d");
    const second = await engine.analyze(card, player, "7-30d");
    expect(aiAnalysisSchema.safeParse(first).success).toBe(true);
    expect({ ...first, generatedAt: undefined, evidence: first.evidence.map((item) => ({ label: item.label, source: item.source })) }).toEqual({ ...second, generatedAt: undefined, evidence: second.evidence.map((item) => ({ label: item.label, source: item.source })) });
    expect(first.evidence.length).toBeGreaterThan(0);
    expect(first.playerCohort).toBe(player.cohort);
    expect(first.peerComparison).toBe(player.peerComparison);
    expect(first.disclaimer).toContain("不构成投资");
  });
  it("reports observed values without presenting them as forecast probabilities", async () => {
    const result = await new DeterministicDemoAI().analyze(
      cards[6],
      getPlayer(cards[6].playerId)!,
      "1-3m",
    );
    expect(result.observedPriceChangePct).toBe(cards[6].change90d ?? null);
    expect(result.observedPeriodLabel).toBe("90 日");
    expect(result.marketEvidence.isDemo).toBe(true);
    expect(result.confidenceLevel).toBe("low");
    expect(result).not.toHaveProperty("upwardProbabilityRange");
    expect(result).not.toHaveProperty("neutralProbabilityRange");
    expect(result).not.toHaveProperty("downwardProbabilityRange");
  });

  it("attaches CourtMatch context only for an exact player-name match", async () => {
    const context = getCourtMatchPlayerContext("Shai Gilgeous-Alexander");
    expect(context).toMatchObject({
      name: "Shai Gilgeous-Alexander",
      season: "2025-26",
      status: "stale",
      source: "CourtMatch Analytics",
    });
    expect(context?.offensePointsPer100MatchupPossessions).toBeGreaterThan(0);
    expect(getCourtMatchPlayerContext("Not A Real Player")).toBeUndefined();

    const card = cards.find((candidate) => {
      return getPlayer(candidate.playerId)?.name === "Shai Gilgeous-Alexander";
    });
    if (!card) return;
    const analysis = await new DeterministicDemoAI().analyze(
      card,
      getPlayer(card.playerId)!,
      "7-30d",
      null,
      context,
    );
    expect(analysis.courtMatchContext?.playerId).toBe(context?.playerId);
    expect(analysis.evidence.some((item) => item.source.includes("CourtMatch Analytics"))).toBe(true);
  });
});
