import type { MetadataRoute } from "next";
import { cards, players, teams } from "@/lib/demo-data";
import { productConfig } from "@/config/product";

const snapshotDate = new Date("2026-09-09T00:00:00+08:00");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = productConfig.siteUrl;
  const coreRoutes = [
    ["/", 1, "daily"],
    ["/market", 0.95, "daily"],
    ["/teams", 0.9, "daily"],
    ["/auction-radar", 0.85, "daily"],
    ["/rookies/2025", 0.8, "weekly"],
    ["/methodology", 0.7, "monthly"],
  ] as const;
  return [
    ...coreRoutes.map(([path, priority, changeFrequency]) => ({
      url: `${base}${path}`,
      lastModified: snapshotDate,
      changeFrequency,
      priority,
    })),
    ...teams.map((team) => ({
      url: `${base}/teams/${team.slug}`,
      lastModified: snapshotDate,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    ...players.map((player) => ({
      url: `${base}/players/${player.id}`,
      lastModified: snapshotDate,
      changeFrequency: "weekly" as const,
      priority: 0.55,
    })),
    ...cards.map((card) => ({
      url: `${base}/cards/${card.id}`,
      lastModified: snapshotDate,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
