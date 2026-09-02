import { cards, dataSources, listings, players, sales } from "@/lib/demo-data";
import type { Card } from "@/types/domain";
import type {
  CardSearchInput,
  MarketplaceAdapter,
  RawCardRecord,
} from "./types";

export class DemoMarketplaceAdapter implements MarketplaceAdapter {
  source = dataSources.find((source) => source.id === "src-demo")!;
  async searchListings(input: CardSearchInput) {
    return listings
      .filter(
        (row) =>
          !input.playerId ||
          cards.find((item) => item.id === row.cardId)?.playerId ===
            input.playerId,
      )
      .slice(0, input.limit ?? 50);
  }
  async fetchListing(id: string) {
    return listings.find((row) => row.id === id) ?? null;
  }
  async fetchSales(input: CardSearchInput) {
    return sales
      .filter(
        (row) =>
          !input.playerId ||
          cards.find((item) => item.id === row.cardId)?.playerId ===
            input.playerId,
      )
      .slice(0, input.limit ?? 50);
  }
  async fetchPlayerEvents(playerId: string) {
    const player = players.find((item) => item.id === playerId);
    return player
      ? [
          {
            player,
            type: "demo_status_snapshot",
            occurredAt: "2026-08-31T01:30:00Z",
          },
        ]
      : [];
  }
  async normalizeCard(raw: RawCardRecord) {
    return {
      brand: String(raw.brand ?? ""),
      productLine: String(raw.productLine ?? ""),
      cardNumber: String(raw.cardNumber ?? ""),
    } satisfies Partial<Card>;
  }
  async validateRecord(raw: RawCardRecord) {
    const missing = ["brand", "productLine", "cardNumber", "playerId"].filter(
      (key) => !raw[key],
    );
    return {
      valid: missing.length === 0,
      reasons: missing.map((key) => `缺少字段: ${key}`),
    };
  }
  async getSourceHealth() {
    return {
      status: "healthy" as const,
      checkedAt: "2026-08-31T01:30:00Z",
      message: "演示适配器可用",
    };
  }
}
