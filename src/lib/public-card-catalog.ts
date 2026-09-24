import snapshot from "@/data/public-card-photos.json";
import type { Card, Player } from "@/types/domain";

export type PublicPhotoRecord = {
  id: string; personId: string; playerName: string; title: string; year: number;
  set: string; cardNumber: string; parallel: string | null; grade: string | null;
  gradingCompany: string | null; autographed: boolean; imageUrl: string;
  fullImageUrl: string; backImageUrl: string | null; width: number; height: number;
  sourceUrl: string; sourceId: string; checkedAt: string;
};

export const photoCatalogSnapshot = snapshot as Omit<typeof snapshot, "records"> & { records: PublicPhotoRecord[] };

/** No generated card numbers, demo prices, insured values, or assumed Base parallel. */
export function buildPublicPhotoCards(rosterPlayers: Player[]): Card[] {
  const playerById = new Map(rosterPlayers.map((player) => [player.id, player]));
  return photoCatalogSnapshot.records.flatMap((record) => {
    const player = playerById.get(`nba-${record.personId}`);
    if (!player || !record.imageUrl || !record.cardNumber || !record.year) return [];
    const id = `photo-${record.sourceId}`;
    const grade = Number(record.grade?.match(/\b(10|[1-9](?:\.5)?)\b/)?.[1]) || undefined;
    const brand = /panini/i.test(record.set) ? "Panini" : /topps|bowman/i.test(record.set) ? "Topps" : /upper deck/i.test(record.set) ? "Upper Deck" : /fleer/i.test(record.set) ? "Fleer" : "Other";
    const condition = record.gradingCompany ? "graded" : "raw";
    const autograph = record.autographed || /autograph|signature/i.test(`${record.title} ${record.set} ${record.parallel ?? ""}`);
    return [{
      id, identityKey: ["collectorcrypt", record.sourceId].join(":"), playerId: player.id,
      releaseYear: record.year, draftYear: player.draftYear, brand, productLine: record.set,
      cardNumber: record.cardNumber, rookie: /\brookie\b|\bRC\b/i.test(record.title),
      type: autograph ? "Auto" : record.parallel ? "Parallel" : "Base",
      parallel: record.parallel || "Unspecified", autograph,
      memorabilia: /patch|jersey|relic|memorabilia/i.test(record.title), condition,
      gradingCompany: record.gradingCompany ?? undefined, grade,
      // Current NBA team is NOT the team printed on a historical card.
      sales30d: 0, listingsCount: 0, liquidity: 0, riskLevel: "high",
      matchConfidence: 100, dataCompleteness: record.parallel ? 85 : 70, demo: false,
      photoEvidence: { sourceName: "Collector Crypt", sourceUrl: record.sourceUrl, sourceId: record.sourceId, title: record.title, retrievedAt: record.checkedAt },
      image: {
        id: `cc-photo-${record.sourceId}`, cardId: id, imageType: "catalog_scan",
        frontUrl: record.imageUrl, backUrl: record.backImageUrl ?? undefined,
        thumbnailUrl: record.imageUrl, sourceUrl: record.sourceUrl, sourceName: "Collector Crypt",
        sourceType: "catalog", sourceImageId: record.sourceId, width: record.width, height: record.height,
        aspectRatio: record.width / record.height, isSlabbed: condition === "graded",
        gradingCompany: record.gradingCompany ?? undefined, grade,
        imageVerified: true, matchConfidence: 100, verificationStatus: "verified",
        lastCheckedAt: record.checkedAt, attribution: "Collector Crypt public image API · rights belong to the original owners",
        licenseStatus: "unknown", notes: "Full card photo decoded successfully. Catalogue metadata is source-reported, not independently certified. Not sold-price evidence.",
      },
    } satisfies Card];
  });
}
