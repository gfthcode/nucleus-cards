import type { Player } from "@/types/domain";
import type { PlayerRecentPerformance, RecentGame } from "./balldontlie";

const API = "https://api.sportsdata.io/v3/nba";

type SportsDataPlayer = { PlayerID?: number; Name?: string; Team?: string | null };
type SportsDataGame = {
  PlayerID?: number | null;
  Name?: string | null;
  Team?: string | null;
  Opponent?: string | null;
  Day?: string | null;
  DateTime?: string | null;
  Minutes?: number | null;
  Seconds?: number | null;
  Points?: number | null;
  Rebounds?: number | null;
  Assists?: number | null;
  Steals?: number | null;
  BlockedShots?: number | null;
  Turnovers?: number | null;
  FieldGoalsMade?: number | null;
  FieldGoalsAttempted?: number | null;
  ThreePointersMade?: number | null;
  ThreePointersAttempted?: number | null;
  FreeThrowsMade?: number | null;
  FreeThrowsAttempted?: number | null;
};

function pct(made = 0, attempts = 0) {
  return attempts ? Math.round((made / attempts) * 1000) / 10 : 0;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function request<T>(path: string): Promise<T> {
  const key = process.env.SPORTSDATAIO_API_KEY;
  if (!key) throw new Error("SPORTSDATAIO_API_KEY is not configured");
  const response = await fetch(`${API}${path}`, {
    headers: { "Ocp-Apim-Subscription-Key": key },
    next: { revalidate: 1800 },
  });
  if (!response.ok) throw new Error(`SportsDataIO request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function mapGame(game: SportsDataGame): RecentGame {
  const date = game.Day ?? game.DateTime ?? "";
  return {
    date: String(date),
    opponent: game.Opponent ?? "",
    minutes: (game.Minutes ?? 0) + (game.Seconds ?? 0) / 60,
    points: game.Points ?? 0,
    rebounds: game.Rebounds ?? 0,
    assists: game.Assists ?? 0,
    steals: game.Steals ?? 0,
    blocks: game.BlockedShots ?? 0,
    turnovers: game.Turnovers ?? 0,
    fgPct: pct(game.FieldGoalsMade ?? 0, game.FieldGoalsAttempted ?? 0),
    threePct: pct(game.ThreePointersMade ?? 0, game.ThreePointersAttempted ?? 0),
    ftPct: pct(game.FreeThrowsMade ?? 0, game.FreeThrowsAttempted ?? 0),
  };
}

/** Fetches the latest verified final game logs from the licensed SportsDataIO feed. */
export async function fetchSportsDataIORecentPerformance(player: Player): Promise<PlayerRecentPerformance | null> {
  const players = await request<SportsDataPlayer[]>("/scores/json/Players");
  const target = normalize(player.name);
  const match = players.find((item) => item.Name && normalize(item.Name) === target);
  if (!match?.PlayerID) return null;

  // SportsDataIO seasons use the starting calendar year (e.g. 2025REG for 2025-26).
  const season = `${new Date().getUTCFullYear() - 1}REG`;
  const games = (await request<SportsDataGame[]>(`/stats/json/PlayerGameStatsBySeason/${season}/${match.PlayerID}/10`))
    .filter((game) => game.Day || game.DateTime)
    .sort((a, b) => String(b.Day ?? b.DateTime).localeCompare(String(a.Day ?? a.DateTime)))
    .map(mapGame);
  if (!games.length) return null;
  return {
    playerId: player.id,
    externalPlayerId: match.PlayerID,
    games,
    last5: games.slice(0, 5),
    last10: games.slice(0, 10),
    fetchedAt: new Date().toISOString(),
    source: "SportsDataIO",
  };
}
