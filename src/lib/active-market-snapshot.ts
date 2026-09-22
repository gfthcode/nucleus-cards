import "server-only";
import { canonicalCardIdentityKey, isLikelySingleTradingCard } from "@/lib/card-discovery-core";
import { detectOutliers, median } from "@/lib/market-math";
import { searchActiveEbayListings, matchesTargetPlayer, parseTradingCardTitle, type MarketObservation } from "@/lib/providers/ebay";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SyncInput = Parameters<typeof searchActiveEbayListings>[0] & { playerId: string };

export async function syncActiveMarketSnapshot(input: SyncInput) {
  const observations = await searchActiveEbayListings(input);
  const admin = createSupabaseAdminClient();
  const accepted: MarketObservation[] = [];
  const rejected: Array<{ sourceItemId: string; reason: string }> = [];
  for (const observation of observations) {
    const identity = parseTradingCardTitle(observation.title, input.playerName);
    if (!isLikelySingleTradingCard(observation.title) || !matchesTargetPlayer(observation.title, input.playerName) || identity.identityConfidence === "LOW") { rejected.push({ sourceItemId: observation.sourceItemId, reason: "IDENTITY_OR_PRODUCT_REJECTED" }); continue; }
    accepted.push({ ...observation, cardIdentity: identity });
  }
  const identityIds = new Map<string, string>();
  for (const observation of accepted) {
    const key = canonicalCardIdentityKey(input.playerId, observation.cardIdentity);
    if (!key) {
      rejected.push({ sourceItemId: observation.sourceItemId, reason: "IDENTITY_FIELDS_INCOMPLETE" });
      continue;
    }
    if (!identityIds.has(key)) {
      const identity = observation.cardIdentity;
      const { data, error } = await admin.from("card_identities").upsert({ player_id: input.playerId, player_name: input.playerName, season: identity.season, year: identity.year, brand: identity.brand, set_name: identity.setName, card_number: identity.cardNumber, parallel: identity.parallel, rookie: identity.rookieDesignation, autograph: identity.autograph, memorabilia: identity.memorabilia, serial_number: identity.serialNumber, print_run: identity.printRun, grading_company: identity.gradingCompany, grade: identity.grade, raw_or_graded: identity.rawOrGraded }, { onConflict: "player_id,year,brand,set_name,card_number,parallel,grading_company,grade,raw_or_graded" }).select("id").single();
      if (error || !data?.id) throw new Error("MARKET_IDENTITY_UPSERT_FAILED"); identityIds.set(key, data.id as string);
    }
    const identityId = identityIds.get(key)!;
    const price = observation.observationType === "ACTIVE_FIXED_PRICE" ? observation.askingPrice : observation.currentBid;
    await admin.from("market_listings").upsert({ source: "ebay", marketplace: input.marketplace ?? "EBAY_US", source_item_id: observation.sourceItemId, card_identity_id: identityId, price, currency: observation.currency, source_url: observation.sourceUrl, status: "active", identity_confidence: observation.cardIdentity.identityConfidence, last_seen_at: observation.retrievedAt, last_retrieved_at: observation.retrievedAt, buying_option: observation.observationType }, { onConflict: "source,source_item_id" });
    await admin.from("market_price_observations").insert({ card_identity_id: identityId, source: "ebay", marketplace: input.marketplace ?? "EBAY_US", source_item_id: observation.sourceItemId, observation_type: observation.observationType, price, currency: observation.currency, retrieved_at: observation.retrievedAt, identity_confidence: observation.cardIdentity.identityConfidence });
  }
  const snapshots = [] as Array<{ cardIdentityId: string; sampleSize: number; medianPrice: number | null }>;
  for (const identityId of new Set(identityIds.values())) {
    const { data } = await admin.from("market_price_observations").select("price,currency").eq("card_identity_id", identityId).eq("observation_type", "ACTIVE_FIXED_PRICE").order("retrieved_at", { ascending: false }).limit(200);
    const prices = (data ?? []).map((row) => Number(row.price)).filter(Number.isFinite); const outliers = detectOutliers(prices); const usable = prices.filter((_, index) => !outliers[index]);
    const snapshot = { card_identity_id: identityId, source: "ebay", sample_size: usable.length, median_price: median(usable), mean_price: usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null, low_price: usable.length ? Math.min(...usable) : null, high_price: usable.length ? Math.max(...usable) : null, currency: data?.[0]?.currency ?? null, observation_type: "ACTIVE_MARKET_SNAPSHOT" };
    await admin.from("market_price_snapshots").insert(snapshot); snapshots.push({ cardIdentityId: identityId, sampleSize: snapshot.sample_size, medianPrice: snapshot.median_price });
  }
  return { source: "eBay Browse API", verifiedSoldPrice: "VERIFIED_SOLD_PRICE_UNAVAILABLE" as const, raw: observations.length, accepted: accepted.length, rejected, snapshots };
}
