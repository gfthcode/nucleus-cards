import { NextResponse } from "next/server";
import { searchEbayMarket } from "@/lib/providers/ebay";

export async function GET(request: Request) {
  const player = new URL(request.url).searchParams.get("player")?.trim();
  if (!player) return NextResponse.json({ error: "player query is required" }, { status: 400 });
  try {
    return NextResponse.json({ source: "eBay", observations: await searchEbayMarket(player) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EBAY_PROVIDER_UNAVAILABLE";
    const status = message.startsWith("EBAY_BROWSE_401") || message.startsWith("EBAY_BROWSE_403") ? 502 : 503;
    return NextResponse.json({ error: "EBAY_PROVIDER_UNAVAILABLE", reason: message }, { status });
  }
}
