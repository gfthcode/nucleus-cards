import { NextResponse } from "next/server";
import { syncActiveMarketSnapshot } from "@/lib/active-market-snapshot";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const body = await request.json().catch(() => null) as { playerId?: string; playerName?: string; limit?: number } | null;
  if (!body?.playerId || !body.playerName) return NextResponse.json({ error: "playerId and playerName are required" }, { status: 400 });
  try { return NextResponse.json(await syncActiveMarketSnapshot({ playerId: body.playerId, playerName: body.playerName, limit: Math.min(Math.max(body.limit ?? 50, 1), 200) })); }
  catch (error) { return NextResponse.json({ error: "ACTIVE_MARKET_SNAPSHOT_FAILED", reason: error instanceof Error ? error.message : "UNKNOWN" }, { status: 503 }); }
}
