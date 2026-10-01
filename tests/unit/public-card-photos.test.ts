import { describe, expect, it } from "vitest";
import { GET as getCoverage } from "@/app/api/cards/photo-coverage/route";
import { getCardImage } from "@/lib/card-images";
import {
  cards,
  getCard,
  getCardSales,
  getPlayer,
  getPlayerCards,
  officialRosterRecords,
  players,
  publicPhotoCards,
} from "@/lib/demo-data";
import { getFeaturedCards } from "@/lib/featured-cards";
import { buildPublicPhotoCards, photoCatalogSnapshot } from "@/lib/public-card-catalog";

const PHOTO_HOSTS = new Set(["d1xpxki1g4htqu.cloudfront.net", "collectorcrypt-prod.s3.us-west-2.amazonaws.com", "static.courtyard.io", "arweave.net", "i2c.seadn.io", "img.phygitals.com", "hobbyscan-images-prod.s3.us-east-2.amazonaws.com"]);
const ARCHIVE_HOSTS = new Set([...PHOTO_HOSTS]);
const SOURCE_NAME_ALIASES: Record<string, string> = { "Alex Sarr": "Alexandre Sarr" };

function normalizeName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

describe("public card photograph catalogue", () => {
  it("retains at least 190 independently decoded photos and unique source, card and player identities", () => {
    const records = photoCatalogSnapshot.records;
    expect(records.length).toBeGreaterThanOrEqual(190);
    const currentRosterIds = new Set(officialRosterRecords.map((player) => player.personId));
    const currentRecords = records.filter((record) => currentRosterIds.has(record.personId));
    expect(publicPhotoCards).toHaveLength(currentRecords.length);
    expect(new Set(records.map((record) => record.sourceId)).size).toBe(records.length);
    expect(new Set(records.map((record) => record.personId)).size).toBe(records.length);
    expect(new Set(publicPhotoCards.map((card) => card.id)).size).toBe(currentRecords.length);
    expect(new Set([...cards, ...publicPhotoCards].map((card) => card.id)).size).toBe(cards.length + currentRecords.length);

    for (const record of records) {
      // The importer records these dimensions only after sharp fully decodes the pixels.
      expect(record.width, record.sourceId).toBeGreaterThanOrEqual(200);
      expect(record.height, record.sourceId).toBeGreaterThanOrEqual(250);
      expect(Number.isFinite(Date.parse(record.checkedAt))).toBe(true);
      expect(Date.parse(record.checkedAt)).toBeLessThanOrEqual(Date.parse(photoCatalogSnapshot.fetchedAt));
      expect(record.cardNumber).toBeTruthy();
      expect(record.cardNumber).not.toMatch(/^#?NBA-/i);
      expect(record.year).toBeGreaterThan(1900);
      expect(record.year).toBeLessThanOrEqual(new Date(photoCatalogSnapshot.fetchedAt).getUTCFullYear());
      const player = officialRosterRecords.find((entry) => entry.personId === record.personId);
      if (player) expect(player.name, record.sourceId).toBe(record.playerName);
      const title = normalizeName(record.title);
      const sourceName = SOURCE_NAME_ALIASES[record.playerName] ?? record.playerName;
      const name = normalizeName(sourceName.replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i, ""));
      expect(title, `${record.playerName}: ${record.title}`).toContain(name);
    }
  });

  it("only uses documented public source pages and approved HTTPS photo hosts", () => {
    for (const record of photoCatalogSnapshot.records) {
      const source = new URL(record.sourceUrl);
      expect(source.protocol).toBe("https:");
      if (record.sourceName === "CardPricer") {
        expect(source.hostname).toBe("cardpricer.co");
        expect(source.pathname).toMatch(/^\/cards\/[0-9a-f-]+$/);
      } else if (record.sourceName === "Phygitals") {
        expect(source.hostname).toBe("api.phygitals.com");
        expect(source.pathname).toMatch(/^\/api\/vm\/chase\/[a-z0-9-]+$/);
        expect(new URL(record.imageUrl).hostname).toBe("img.phygitals.com");
      } else if (record.sourceName === "HobbyScan") {
        expect(source.hostname).toBe("www.hobbyscan.com");
        expect(source.pathname).toMatch(/^\/card\/\d+$/);
        expect(new URL(record.imageUrl).hostname).toBe("hobbyscan-images-prod.s3.us-east-2.amazonaws.com");
      } else {
        expect(source.hostname).toBe("collectorcrypt.com");
        expect(source.pathname).toMatch(/^\/assets\/solana\/[1-9A-HJ-NP-Za-km-z]+$/);
      }
      expect(PHOTO_HOSTS.has(new URL(record.imageUrl).hostname)).toBe(true);
      for (const value of [record.imageUrl, record.fullImageUrl, record.backImageUrl].filter((url): url is string => Boolean(url))) {
        const url = new URL(value);
        expect(url.protocol).toBe("https:");
        expect(ARCHIVE_HOSTS.has(url.hostname), value).toBe(true);
        expect(url.username).toBe("");
        expect(url.password).toBe("");
      }
    }
  });

  it("preserves each source identity without inventing prices, insured values or historical printed teams", () => {
    for (const card of publicPhotoCards) {
      const record = photoCatalogSnapshot.records.find((item) => item.sourceId === card.photoEvidence?.sourceId)!;
      expect(record).toBeDefined();
      expect(card).toBeDefined();
      expect(card.demo).toBe(false);
      expect(card.playerId).toBe(`nba-${record.personId}`);
      expect(card.releaseYear).toBe(record.year);
      expect(card.productLine).toBe(record.set);
      expect(card.cardNumber).toBe(record.cardNumber);
      expect(card.parallel).toBe(record.parallel || "Unspecified");
      expect(card.printedTeamId).toBeUndefined();
      for (const key of ["latestSaleCny", "latestListingCny", "insuredValue", "insured_value", "price", "purchasePrice", "change30d", "change90d", "change1y"]) {
        expect(card).not.toHaveProperty(key);
        expect(record).not.toHaveProperty(key);
      }
      expect(card.sales30d).toBe(0);
      expect(card.listingsCount).toBe(0);
      expect(getCardSales(card.id)).toEqual([]);
      expect(card.photoEvidence).toMatchObject({ sourceId: record.sourceId, sourceUrl: record.sourceUrl, title: record.title, retrievedAt: record.checkedAt });
      const image = getCardImage(card);
      expect(image.cardId).toBe(card.id);
      expect(image.frontUrl).toBe(record.imageUrl);
      expect(image.sourceUrl).toBe(record.sourceUrl);
      expect(image.imageVerified).toBe(true);
      expect(image.matchConfidence).toBe(100);
      expect(image.gradingCompany).toBe(card.gradingCompany);
      expect(image.grade).toBe(card.grade);
      if (record.gradingCompany) expect(card.condition, record.title).toBe("graded");
      expect(image.isSlabbed).toBe(card.condition === "graded");
    }
    expect(buildPublicPhotoCards([])).toEqual([]);
  });

  it("preserves prefix-numbered grades and authenticated slabs", () => {
    for (const record of photoCatalogSnapshot.records) {
      const leadingGrade = Number(record.grade?.split(/[\s-]/)[0]);
      const authenticated = record.grade?.toLowerCase() === "auth";
      if (!authenticated && (!Number.isFinite(leadingGrade) || leadingGrade <= 0 || leadingGrade > 10)) continue;
      const card = getCard(`photo-${record.sourceId}`);
      // A roster update can remove a source-catalogue player from the active directory.
      if (!card) continue;
      expect(card.grade, record.title).toBe(authenticated ? undefined : leadingGrade);
      expect(card.condition, record.title).toBe("graded");
      expect(getCardImage(card).isSlabbed, record.title).toBe(true);
    }
  });

  it("resolves photo detail and player card routes through the shared lookups", () => {
    for (const card of publicPhotoCards) {
      expect(getCard(card.id)).toBe(card);
      expect(getPlayer(card.playerId)).toBeDefined();
    }
    for (const card of [publicPhotoCards[0], publicPhotoCards[Math.floor(publicPhotoCards.length / 2)], publicPhotoCards.at(-1)!]) {
      expect(getPlayerCards(card.playerId)).toContain(card);
    }
    for (const player of players) {
      const match = publicPhotoCards.find((card) => getPlayer(card.playerId)?.name === player.name);
      if (match) expect(getPlayerCards(player.id)).toContain(match);
    }
    expect(getCard("photo-missing-source-record")).toBeUndefined();
  });

  it("uses real source-linked photos for every homepage featured card", () => {
    const featured = getFeaturedCards();
    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(new Set(featured.map((row) => row.player.id)).size).toBe(featured.length);
    for (const row of featured) {
      expect(row.card.demo).toBe(false);
      expect(row.card.photoEvidence).toBeDefined();
      expect(row.image.imageVerified).toBe(true);
      expect(row.image.cardId).toBe(row.card.id);
      expect(row.image.sourceUrl).toBe(row.card.photoEvidence?.sourceUrl);
      expect(row.image.frontUrl).toMatch(/^https:\/\//);
      expect(getCard(row.card.id)).toBe(row.card);
      expect(row.card.playerId).toBe(row.player.id);
    }
  });

  it("reconciles the coverage endpoint with the full NBA directory and missing-player list", async () => {
    const response = getCoverage();
    expect(response.status).toBe(200);
    const coverage = await response.json();
    const found = new Set(publicPhotoCards.map((card) => card.playerId));
    expect(coverage.photos).toBe(publicPhotoCards.length);
    expect(coverage.playersWithPhotos).toBe(found.size);
    expect(coverage.roster.players).toBe(officialRosterRecords.length);
    expect(coverage.roster.teams).toBe(new Set(officialRosterRecords.map((player) => player.teamAbbreviation).filter(Boolean)).size);
    expect(coverage.playersWithPhotos + coverage.missingPlayers.length).toBe(officialRosterRecords.length);
    expect(coverage.generatedImagesCountedAsPhotos).toBe(0);
    expect(coverage.missingPlayers.map((player: { personId: string }) => player.personId).sort()).toEqual(
      officialRosterRecords.filter((player) => !found.has(`nba-${player.personId}`)).map((player) => player.personId).sort(),
    );
  });
});
