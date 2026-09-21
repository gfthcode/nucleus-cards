import { createClient } from "@supabase/supabase-js";

export type MomentumPlayerInput = {
  id: string;
  name: string;
  displayNameZh: string;
  currentTeamId?: string;
  teamAbbreviation?: string;
  age?: number;
  injuryStatus?: "healthy" | "monitor" | "out";
  source: string;
};

type DatabasePlayer = {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  team_id: string | null;
  source: string;
};
type ProviderPlayer = { PlayerID?: number; Name?: string; Team?: string | null; Active?: boolean | null; Status?: string | null };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const zhName = (name: string) => name;

async function fromProductionDatabase(): Promise<MomentumPlayerInput[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.from("nba_players").select("id,full_name,first_name,last_name,team_id,source").eq("active", true).order("full_name");
  if (error || !data?.length) return [];
  return (data as DatabasePlayer[]).map((player) => ({ id: player.id, name: player.full_name, displayNameZh: zhName(player.full_name), currentTeamId: player.team_id ?? undefined, source: player.source || "production NBA roster" }));
}

async function fromSportsDataIO(): Promise<MomentumPlayerInput[]> {
  const key = process.env.SPORTSDATAIO_API_KEY;
  if (!key) return [];
  const response = await fetch("https://api.sportsdata.io/v3/nba/scores/json/Players", { headers: { "Ocp-Apim-Subscription-Key": key }, next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(`SportsDataIO roster request failed (${response.status})`);
  const rows = (await response.json()) as ProviderPlayer[];
  const unique = new Map<string, MomentumPlayerInput>();
  for (const row of rows) {
    if (!row.PlayerID || !row.Name || !row.Team || row.Active === false || row.Status === "Inactive") continue;
    const name = row.Name.trim();
    unique.set(String(row.PlayerID), { id: `nba:sportsdataio:${row.PlayerID}`, name, displayNameZh: zhName(name), currentTeamId: `nba-team:${row.Team}`, teamAbbreviation: row.Team, source: "SportsDataIO NBA Players" });
  }
  return [...unique.values()];
}

async function fromBallDontLie(): Promise<MomentumPlayerInput[]> {
  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) return [];
  const response = await fetch("https://api.balldontlie.io/v1/players?per_page=100", { headers: { Authorization: key }, next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(`BallDontLie roster request failed (${response.status})`);
  const body = (await response.json()) as { data?: Array<{ id: number; first_name: string; last_name: string; team?: { abbreviation?: string } }> };
  return (body.data ?? []).filter((row) => row.team?.abbreviation).map((row) => {
    const name = `${row.first_name} ${row.last_name}`;
    return { id: `nba:balldontlie:${row.id}`, name, displayNameZh: zhName(name), currentTeamId: `nba-team:${row.team?.abbreviation}`, teamAbbreviation: row.team?.abbreviation, source: "BallDontLie NBA Players" };
  });
}

export async function getMomentumPlayers(): Promise<MomentumPlayerInput[]> {
  const databasePlayers = await fromProductionDatabase();
  if (databasePlayers.length) return databasePlayers;
  const providerPlayers = await fromSportsDataIO();
  if (providerPlayers.length) return providerPlayers;
  const fallbackPlayers = await fromBallDontLie();
  if (fallbackPlayers.length) return fallbackPlayers;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") throw new Error("Demo mode is explicit, but Momentum demo adapter is not enabled in this production build");
  throw new Error("No real NBA player source is available. Configure a production NBA provider and retry.");
}

export function momentumCoverage(players: MomentumPlayerInput[]) {
  return { players: players.length, teams: new Set(players.map((player) => player.teamAbbreviation ?? player.currentTeamId).filter(Boolean)).size };
}

export function findMomentumPlayer(players: MomentumPlayerInput[], id: string) {
  return players.find((player) => player.id === id) ?? players.find((player) => normalize(player.name) === normalize(id));
}
