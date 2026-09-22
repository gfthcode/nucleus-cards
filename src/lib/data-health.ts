import "server-only";
import { getEbayHealth } from "@/lib/providers/ebay";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { xianyuAuthorizedProvider } from "@/lib/xianyu-authorized-provider";

export async function getDataHealth() {
  const ebay = await getEbayHealth();
  try {
    const admin = createSupabaseAdminClient();
    const tables = ["card_identities", "market_listings", "market_price_observations", "market_price_snapshots", "verified_sales", "player_momentum_snapshots"] as const;
    const counts = Object.fromEntries(await Promise.all(tables.map(async (table) => { const { count } = await admin.from(table).select("*", { count: "exact", head: true }); return [table, count ?? 0]; }))) as Record<(typeof tables)[number], number>;
    return { ebay, supabase: "CONFIGURED" as const, counts, momentum: counts.player_momentum_snapshots ? "PASS" as const : "COLLECTING" as const, xianyu: xianyuAuthorizedProvider, verifiedSales: counts.verified_sales ? "PASS" as const : "UNAVAILABLE" as const };
  } catch { return { ebay, supabase: "UNAVAILABLE" as const, counts: null, momentum: "UNAVAILABLE" as const, xianyu: xianyuAuthorizedProvider, verifiedSales: "UNAVAILABLE" as const }; }
}
