import { describe, expect, it } from "vitest";
import { players } from "@/lib/demo-data";
import {
  getPlayerCohortLabel,
  getPlayerTags,
  isRecentDraftClass,
} from "@/lib/player-cohorts";

describe("player cohorts", () => {
  it("covers every 2020-2026 draft class", () => {
    const covered = new Set(
      players
        .filter(
          (player) => player.draftYear >= 2020 && player.draftYear <= 2026,
        )
        .map((player) => player.draftYear),
    );
    expect([...covered].sort()).toEqual([
      2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
  });

  it("labels core rookies and layered market tags", () => {
    const flagg = players.find((player) => player.id === "p-flagg")!;
    expect(getPlayerCohortLabel(flagg)).toBe("2025 核心新秀");
    expect(getPlayerTags(flagg)).toContain("核心新秀");
    expect(
      players
        .filter((player) => player.isCoreRookie)
        .every((player) => player.draftYear === 2025 || player.draftYear === 2026),
    ).toBe(true);
  });

  it("distinguishes recent draft classes from career-stage cohorts", () => {
    const wemby = players.find((player) => player.id === "p-wemby")!;
    const white = players.find((player) => player.id === "p-white")!;
    expect(isRecentDraftClass(wemby)).toBe(true);
    expect(white.isRolePlayer).toBe(true);
    expect(getPlayerTags(white)).toContain("签约热门");
  });
});
