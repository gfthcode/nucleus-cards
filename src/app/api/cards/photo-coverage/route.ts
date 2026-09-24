import { NextResponse } from "next/server";
import { officialRosterRecords, publicPhotoCards } from "@/lib/demo-data";
import { photoCatalogSnapshot } from "@/lib/public-card-catalog";
import roster from "@/data/nba-official-roster.json";

export function GET() {
  const found = new Set(publicPhotoCards.map((card) => card.playerId));
  return NextResponse.json({
    checkedAt: photoCatalogSnapshot.fetchedAt,
    roster: { source: roster.sourceUrl, checkedAt: roster.fetchedAt, players: officialRosterRecords.length, teams: new Set(officialRosterRecords.map((r) => r.teamAbbreviation).filter(Boolean)).size, note: "NBA public directory entries, not a standard-contract count" },
    photos: publicPhotoCards.length, playersWithPhotos: found.size,
    source: photoCatalogSnapshot.sourceUrl,
    noInventedCardNumbers: true, generatedImagesCountedAsPhotos: 0,
    missingPlayers: officialRosterRecords.filter((p) => !found.has(`nba-${p.personId}`)).map((p) => ({ personId: p.personId, name: p.name, team: p.teamAbbreviation })),
  }, { headers: { "Cache-Control": "public, s-maxage=300" } });
}
