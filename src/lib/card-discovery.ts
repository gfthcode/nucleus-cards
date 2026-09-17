import {
  matchesTargetPlayer,
  parseTradingCardTitle,
  searchEbayMarket,
  type MarketObservation,
  type MarketTier,
  type TradingCardIdentity,
} from "@/lib/providers/ebay";
import { canonicalCardIdentityKey, isLikelySingleTradingCard } from "@/lib/card-discovery-core";

export type DiscoveryDecision = "ACCEPTED" | "REJECTED";
export type DiscoveredCard = {
  sourceItemId: string;
  sourceUrl: string;
  title: string;
  decision: DiscoveryDecision;
  rejectionReason?: "NOT_SINGLE_CARD" | "PLAYER_MISMATCH" | "LOW_CONFIDENCE" | "AUCTION";
  identity: TradingCardIdentity;
  identityKey: string | null;
  observation: MarketObservation;
};

export async function discoverPlayerCards(input: { playerId: string; playerName: string; marketTier?: MarketTier; limit?: number }) {
  const observations = await searchEbayMarket(input.playerName, input.limit ?? 50, input.marketTier ?? "S");
  const seen = new Set<string>();
  const results: DiscoveredCard[] = [];
  for (const observation of observations) {
    const identity = parseTradingCardTitle(observation.title, input.playerName);
    let decision: DiscoveryDecision = "ACCEPTED";
    let rejectionReason: DiscoveredCard["rejectionReason"];
    if (observation.observationType !== "ACTIVE_FIXED_PRICE") {
      decision = "REJECTED"; rejectionReason = "AUCTION";
    } else if (!isLikelySingleTradingCard(observation.title)) {
      decision = "REJECTED"; rejectionReason = "NOT_SINGLE_CARD";
    } else if (!matchesTargetPlayer(observation.title, input.playerName)) {
      decision = "REJECTED"; rejectionReason = "PLAYER_MISMATCH";
    } else if (identity.identityConfidence === "LOW") {
      decision = "REJECTED"; rejectionReason = "LOW_CONFIDENCE";
    }
    const identityKey = decision === "ACCEPTED" ? canonicalCardIdentityKey(input.playerId, identity) : null;
    if (decision === "ACCEPTED" && identityKey && seen.has(identityKey)) {
      decision = "REJECTED"; rejectionReason = "LOW_CONFIDENCE";
    }
    if (identityKey) seen.add(identityKey);
    results.push({ sourceItemId: observation.sourceItemId, sourceUrl: observation.sourceUrl, title: observation.title, decision, rejectionReason, identity, identityKey, observation });
  }
  return {
    playerId: input.playerId,
    playerName: input.playerName,
    marketTier: input.marketTier ?? "S",
    rawResults: observations.length,
    accepted: results.filter((item) => item.decision === "ACCEPTED"),
    rejected: results.filter((item) => item.decision === "REJECTED"),
    uniqueCardIdentities: [...new Set(results.flatMap((item) => item.identityKey ? [item.identityKey] : []))],
    results,
  };
}

