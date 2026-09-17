import type { Player } from "@/types/domain";
import { fetchPlayerRecentPerformance as fetchBallDontLie } from "./balldontlie";
import { fetchSportsDataIORecentPerformance } from "./sportsdataio";
import type { PlayerRecentPerformance } from "./balldontlie";

/** Primary licensed feed with an explicit, failure-tolerant fallback chain. */
export async function fetchPlayerRecentPerformance(player: Player): Promise<PlayerRecentPerformance | null> {
  if (process.env.SPORTSDATAIO_API_KEY) {
    try {
      const performance = await fetchSportsDataIORecentPerformance(player);
      if (performance?.last5.length) return performance;
    } catch {
      // Entitlement, timeout, empty season, and transient provider errors all fall through.
    }
  }
  if (!process.env.BALLDONTLIE_API_KEY) return null;
  try {
    const performance = await fetchBallDontLie(player);
    return performance?.last5.length ? performance : null;
  } catch {
    return null;
  }
}
