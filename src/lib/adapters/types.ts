import type { Card, DataSource, Listing, Player, Sale } from "@/types/domain";

export interface CardSearchInput {
  query?: string;
  playerId?: string;
  brand?: string;
  limit?: number;
}
export interface RawCardRecord {
  [key: string]: unknown;
}
export interface ValidationResult {
  valid: boolean;
  reasons: string[];
}
export interface SourceHealth {
  status: "healthy" | "disabled" | "degraded";
  checkedAt: string;
  message: string;
}

export interface MarketplaceAdapter {
  source: DataSource;
  searchListings(input: CardSearchInput): Promise<Listing[]>;
  fetchListing(id: string): Promise<Listing | null>;
  fetchSales(input: CardSearchInput): Promise<Sale[]>;
  fetchPlayerEvents(
    playerId: string,
  ): Promise<Array<{ player: Player; type: string; occurredAt: string }>>;
  normalizeCard(raw: RawCardRecord): Promise<Partial<Card>>;
  validateRecord(raw: RawCardRecord): Promise<ValidationResult>;
  getSourceHealth(): Promise<SourceHealth>;
}
