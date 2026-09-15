import type { Player } from "@/types/domain";

export type RecentGame = {
  date: string;
  opponent: string;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
};

export type PlayerRecentPerformance = {
  playerId: string;
  externalPlayerId: number;
  games: RecentGame[];
  last5: RecentGame[];
  last10: RecentGame[];
  fetchedAt: string;
  source: "BallDontLie";
};

type BdlPlayer = { id: number; first_name: string; last_name: string; team?: { abbreviation?: string } };
type BdlStat = {
  game?: { date?: string; home_team?: { abbreviation?: string }; visitor_team?: { abbreviation?: string } };
  player?: { id?: number };
  min?: string | number;
  pts?: number;
  reb?: number;
  ast?: number;
  stl?: number;
  blk?: number;
  turnover?: number;
  fgm?: number;
  fga?: number;
  fg3m?: number;
  fg3a?: number;
  ftm?: number;
  fta?: number;
};

const API = "https://api.balldontlie.io/v1";

function pct(made = 0, attempts = 0) { return attempts ? Math.round((made / attempts) * 1000) / 10 : 0; }
function minutes(value: string | number | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const [m, s] = value.split(":").map(Number);
  return Number.isFinite(s) ? m + s / 60 : Number(value) || 0;
}

async function request<T>(path: string): Promise<T> {
  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) throw new Error("BALLDONTLIE_API_KEY is not configured");
  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: key },
    next: { revalidate: 1800 },
  });
  if (!response.ok) throw new Error(`BallDontLie request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function fetchPlayerRecentPerformance(player: Player): Promise<PlayerRecentPerformance | null> {
  const search = encodeURIComponent(player.name);
  const identity = await request<{ data: BdlPlayer[] }>(`/players?search=${search}`);
  const normalized = player.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = identity.data.find((item) => `${item.first_name}${item.last_name}`.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized);
  if (!match) return null;
  const seasonResponses = await Promise.all([2024, 2023, 2022].map((season) => request<{ data: BdlStat[] }>(`/stats?player_ids[]=${match.id}&seasons[]=${season}&per_page=100`)));
  const games = seasonResponses.flatMap((response) => response.data).filter((stat) => stat.game?.date).sort((a, b) => String(b.game?.date).localeCompare(String(a.game?.date))).map((stat) => {
    const home = stat.game?.home_team?.abbreviation ?? "";
    const visitor = stat.game?.visitor_team?.abbreviation ?? "";
    const opponent = home === match.team?.abbreviation ? visitor : home;
    return { date: String(stat.game?.date), opponent, minutes: minutes(stat.min), points: stat.pts ?? 0, rebounds: stat.reb ?? 0, assists: stat.ast ?? 0, steals: stat.stl ?? 0, blocks: stat.blk ?? 0, turnovers: stat.turnover ?? 0, fgPct: pct(stat.fgm, stat.fga), threePct: pct(stat.fg3m, stat.fg3a), ftPct: pct(stat.ftm, stat.fta) };
  });
  if (!games.length) return null;
  return { playerId: player.id, externalPlayerId: match.id, games, last5: games.slice(0, 5), last10: games.slice(0, 10), fetchedAt: new Date().toISOString(), source: "BallDontLie" };
}

