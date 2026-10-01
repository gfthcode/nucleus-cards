import courtMatchSnapshot from "@/data/courtmatch-player-context.json";

const allowedStatuses = [
  "live",
  "recently-updated",
  "stale",
  "demo",
  "error",
  "unavailable",
] as const;
const sourceStatus = allowedStatuses.find(
  (status) => status === courtMatchSnapshot.status,
) ?? "unavailable";

export type CourtMatchPlayerContext = {
  playerId: string;
  name: string;
  teamAbbreviation: string;
  season: string;
  seasonType: "regular";
  offensePointsPer100MatchupPossessions: number | null;
  offenseMatchupPossessions: number;
  offenseOpponentCount: number;
  defensePointsAllowedPer100MatchupPossessions: number | null;
  defenseMatchupPossessions: number;
  defenseOpponentCount: number;
  source: string;
  sourceUrl: string;
  datasetUrl: string;
  status: "live" | "recently-updated" | "stale" | "demo" | "error" | "unavailable";
  lastUpdated: string;
  dataSource: string;
  coverage: string;
  metricNote: string;
};

function normalizePlayerName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const playerByName = new Map<string, CourtMatchPlayerContext | null>();
for (const player of courtMatchSnapshot.players) {
  const key = normalizePlayerName(player.name);
  const existing = playerByName.get(key);
  if (existing !== undefined) {
    playerByName.set(key, null);
    continue;
  }
  playerByName.set(key, {
    ...player,
    seasonType: "regular",
    source: courtMatchSnapshot.source,
    sourceUrl: courtMatchSnapshot.sourceUrl,
    datasetUrl: courtMatchSnapshot.datasetUrl,
    status: sourceStatus,
    lastUpdated: courtMatchSnapshot.lastUpdated,
    dataSource: courtMatchSnapshot.dataSource,
    coverage: courtMatchSnapshot.coverage,
    metricNote: courtMatchSnapshot.metricNote,
  });
}

/** Exact normalized-name match only. Ambiguous or missing players stay unmatched. */
export function getCourtMatchPlayerContext(
  playerName: string,
): CourtMatchPlayerContext | undefined {
  return playerByName.get(normalizePlayerName(playerName)) ?? undefined;
}
