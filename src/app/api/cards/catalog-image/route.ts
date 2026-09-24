import { NextResponse } from "next/server";
import { searchActiveEbayListings } from "@/lib/providers/ebay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: string | null) {
  return value?.trim().slice(0, 120) ?? "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playerName = text(url.searchParams.get("player"));
  if (!playerName) return NextResponse.json({ error: "player_required" }, { status: 400 });

  try {
    const rows = await searchActiveEbayListings({
      playerName,
      year: Number(url.searchParams.get("year")) || undefined,
      brand: text(url.searchParams.get("brand")) || undefined,
      setName: text(url.searchParams.get("set")) || undefined,
      limit: 12,
    });
    const match = rows.find((row) => row.imageUrl && row.cardIdentity.identityConfidence !== "LOW");
    if (!match?.imageUrl) return NextResponse.json({ image: null, reason: "no_verified_image_match" }, { status: 404 });
    return NextResponse.json({
      image: {
        url: match.imageUrl,
        sourceUrl: match.sourceUrl,
        sourceName: "eBay Browse API listing image",
        title: match.title,
        retrievedAt: match.retrievedAt,
      },
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "provider_unavailable";
    const status = reason === "EBAY_CREDENTIALS_NOT_CONFIGURED" ? 503 : 502;
    return NextResponse.json({ error: reason }, { status });
  }
}
