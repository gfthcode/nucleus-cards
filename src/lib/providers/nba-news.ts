import type { MomentumPlayerInput } from "@/lib/momentum-players";

export type NBAEvent = { id: string; playerId: string; teamId?: string; type: "MEDIA"; headline: string; summary: string; source: "ESPN NBA"; sourceUrl: string; publishedAt: string | null; retrievedAt: string; reliabilityTier: 1; confidence: "REPORTED"; impactDirection: "NEUTRAL"; impactMagnitude: 0 };
const FEED = "https://www.espn.com/espn/rss/nba/news";
function clean(value: string) { return value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim(); }
export async function fetchNBANews(player: MomentumPlayerInput): Promise<NBAEvent[]> {
  try {
    const response = await fetch(FEED, { next: { revalidate: 1800 }, headers: { "User-Agent": "Nucleus-Cards/1.0" } });
    if (!response.ok) return [];
    const xml = await response.text();
    const target = player.name.split(" ").at(-1)?.toLowerCase() ?? player.name.toLowerCase();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match, index) => {
      const item = match[1]; const title = clean(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""); const link = clean(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? ""); const published = clean(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
      return { id: `espn-${player.id}-${index}-${published}`, playerId: player.id, type: "MEDIA" as const, headline: title, summary: title, source: "ESPN NBA" as const, sourceUrl: link, publishedAt: published ? new Date(published).toISOString() : null, retrievedAt: new Date().toISOString(), reliabilityTier: 1 as const, confidence: "REPORTED" as const, impactDirection: "NEUTRAL" as const, impactMagnitude: 0 as const };
    }).filter((event) => event.headline.toLowerCase().includes(target) && Boolean(event.sourceUrl)).slice(0, 5);
  } catch { return []; }
}
