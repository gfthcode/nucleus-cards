import { NextResponse } from "next/server";
import { searchActiveEbayListings } from "@/lib/providers/ebay";
import { searchCardPricerImage } from "@/lib/providers/cardpricer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: string | null) {
  return value?.trim().slice(0, 120) ?? "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playerName = text(url.searchParams.get("player"));
  if (!playerName) return NextResponse.json({ error: "player_required" }, { status: 400 });

  const requested = {
    playerName,
    year: Number(url.searchParams.get("year")) || undefined,
    brand: text(url.searchParams.get("brand")) || undefined,
    setName: text(url.searchParams.get("set")) || undefined,
  };
  try {
    const rows = await searchActiveEbayListings({
      ...requested,
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
  } catch {
    // eBay is preferred when credentials are configured. Continue to the public catalog fallback otherwise.
  }
  try {
    const match = await searchCardPricerImage(requested);
    if (match) return NextResponse.json({ image: { url: match.imageUrl, sourceUrl: match.sourceUrl, sourceName: `CardPricer public catalog${match.matchType === "year-player" ? " · year/player match" : ""}`, title: match.title, metadata: match.metadata } }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
    return NextResponse.json({ image: null, reason: "no_public_catalog_image_match" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "catalog_providers_unavailable" }, { status: 502 });
  }
}
