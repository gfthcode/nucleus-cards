import { describe, expect, it } from "vitest";
import { buildMembershipSyncPlan } from "@/lib/roster-sync";
import type { NormalizedRoster } from "@/lib/roster-sync";
import type { PlayerTeamMembership } from "@/types/domain";

const roster: NormalizedRoster = {
  provider: "sportradar",
  teamExternalId: "team-external-1",
  fetchedAt: "2026-09-03T03:00:00.000Z",
  players: [
    {
      sourcePlayerId: "external-flagg",
      fullName: "Cooper Flagg",
      jerseyNumber: "32",
      rosterType: "active",
      sourceStatus: "ACT",
    },
  ],
};

describe("Membership sync plan", () => {
  it("matches a source player without creating a duplicate player", () => {
    const plan = buildMembershipSyncPlan({
      teamId: "team-7",
      roster,
      existing: [],
      now: "2026-09-03T03:01:00.000Z",
    });

    expect(plan.unmatched).toHaveLength(0);
    expect(plan.upserts).toHaveLength(1);
    expect(plan.upserts[0]).toMatchObject({
      playerId: "p-flagg",
      teamId: "team-7",
      rosterType: "active",
      source: "sportradar",
      verificationStatus: "verified",
    });
  });

  it("closes a departed current membership while preserving its history", () => {
    const existing: PlayerTeamMembership[] = [
      {
        id: "membership-old",
        playerId: "p-harper",
        teamId: "team-7",
        status: "active",
        startDate: "2025-10-01",
        rosterType: "active",
        source: "sportradar",
        lastVerifiedAt: "2026-09-02T03:00:00.000Z",
        verificationStatus: "verified",
      },
    ];
    const plan = buildMembershipSyncPlan({
      teamId: "team-7",
      roster,
      existing,
      now: "2026-09-03T03:01:00.000Z",
    });

    expect(plan.closures).toHaveLength(1);
    expect(plan.closures[0]).toMatchObject({
      id: "membership-old",
      status: "ended",
      endDate: "2026-09-03T03:01:00.000Z",
    });
    expect(plan.upserts[0].playerId).toBe("p-flagg");
  });
});
