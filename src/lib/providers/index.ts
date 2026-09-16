import type { Player } from "@/types/domain";
import { fetchPlayerRecentPerformance as fetchBallDontLie } from "./balldontlie";
import { fetchSportsDataIORecentPerformance } from "./sportsdataio";
import type { PlayerRecentPerformance } from "./balldontlie";

/** Primary licensed feed. BallDontLie remains an explicit fallback only when SportsDataIO is not configured. */
export async function fetchPlayerRecentPerformance(player: Player): Promise<PlayerRecentPerformance | null> {
  if (process.env.SPORTSDATAIO_API_KEY) return fetchSportsDataIORecentPerformance(player);
  return fetchBallDontLie(player);
}
