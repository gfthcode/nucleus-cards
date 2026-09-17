import { NextResponse } from "next/server";
import { discoverPlayerCards } from "@/lib/card-discovery";
import type { MarketTier } from "@/lib/providers/ebay";

const tiers = new Set<MarketTier>(["S", "A", "B", "C"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { playerId?: string; playerName?: string; marketTier?: MarketTier; limit?: number; dryRun?: boolean };
  if (!body.playerId || !body.playerName) return NextResponse.json({ error: "playerId and playerName are required" }, { status: 400 });
  if (body.marketTier && !tiers.has(body.marketTier)) return NextResponse.json({ error: "invalid marketTier" }, { status: 400 });
  try {
    const report = await discoverPlayerCards({ playerId: body.playerId, playerName: body.playerName, marketTier: body.marketTier, limit: Math.min(Math.max(body.limit ?? 50, 1), 200) });
    const stripObservation = (item: (typeof report.results)[number]) => ({ sourceItemId: item.sourceItemId, sourceUrl: item.sourceUrl, title: item.title, decision: item.decision, rejectionReason: item.rejectionReason, identity: item.identity, identityKey: item.identityKey });
    return NextResponse.json({ dryRun: body.dryRun !== false, source: "eBay Browse API", ...report, accepted: report.accepted.map(stripObservation), rejected: report.rejected.map(stripObservation) });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "CARD_DISCOVERY_FAILED";
    return NextResponse.json({ error: "CARD_DISCOVERY_FAILED", reason }, { status: reason === "EBAY_CREDENTIALS_NOT_CONFIGURED" ? 503 : 502 });
  }
}

