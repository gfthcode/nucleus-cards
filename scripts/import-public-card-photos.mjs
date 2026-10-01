/** Public read-only catalogue importer. No wallet, credential, or purchase calls. */
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.resolve("next"))("sharp");

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: node scripts/import-public-card-photos.mjs <public-candidates.json>");
const candidates = JSON.parse(await readFile(inputPath, "utf8"));
const roster = JSON.parse(await readFile(new URL("../src/data/nba-official-roster.json", import.meta.url), "utf8"));
const normalize = (s) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const aliases = new Map(roster.records.map((p) => [normalize(p.name), p]));
const suffixless = (s) => s.replace(/\s+(jr|sr|ii|iii|iv)$/, "");
const names = [...aliases].map(([name, player]) => ({ name, player, short: suffixless(name) }));
const matches = (title) => names.filter(({ name, short }) => (` ${normalize(title)} `).includes(` ${name} `) || (` ${normalize(title)} `).includes(` ${short} `));
const grouped = new Map();
for (const row of candidates.cards) {
  if (/\b(jersey|jerseys|basketball shoes|signed photo|signed ball|wax box|pack lot)\b/i.test(row.title)) continue;
  const players = matches(row.title);
  if (players.length !== 1 || !row.cardNumber || !row.year || !row.imageUrl) continue;
  const player = players[0].player;
  const bucket = grouped.get(player.personId) ?? [];
  bucket.push({ ...row, personId: player.personId, playerName: player.name });
  grouped.set(player.personId, bucket);
}
// One verified photograph for every available player before adding alternate cards.
// Failures are explicit and do not manufacture a substitute identity or price.
const records = [], failures = [];
let complete = 0;
for (const [, rows] of grouped) {
  let selected = 0;
  for (const row of rows.slice(0, 5)) {
    if (selected >= 2) break;
    try {
      const response = await fetch(`https://api.collectorcrypt.com/cards/publicNft/${encodeURIComponent(row.cardId)}`, { signal: AbortSignal.timeout(20000) });
      if (response.status === 429) throw new Error("Rate limited: stop and retry later, never bypass");
      if (!response.ok) throw new Error(`metadata HTTP ${response.status}`);
      const detail = await response.json();
      if (detail.type !== "Card" || detail.category !== "Basketball" || !detail.frontImage || !detail.serial) continue;
      if (matches(detail.itemName).length !== 1 || matches(detail.itemName)[0].player.personId !== row.personId) continue;
      const photoUrl = detail.images?.frontM ?? detail.frontImage;
      const photo = await fetch(photoUrl, { signal: AbortSignal.timeout(20000) });
      if (!photo.ok || !photo.headers.get("content-type")?.startsWith("image/")) throw new Error(`photo HTTP ${photo.status}`);
      const bytes = Buffer.from(await photo.arrayBuffer());
      const metadata = await sharp(bytes, { failOn: "warning" }).metadata();
      await sharp(bytes, { failOn: "warning" }).resize({ width: 24 }).raw().toBuffer();
      if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 250) throw new Error("photo too small");
      records.push({
        id: String(detail.id), personId: row.personId, playerName: row.playerName,
        title: detail.itemName, year: Number(detail.year), set: detail.set ?? "Unspecified set",
        cardNumber: String(detail.serial), parallel: detail.parallel || null,
        grade: detail.grade || null, gradingCompany: detail.gradingCompany || null,
        autographed: detail.autographed === true,
        imageUrl: photoUrl, fullImageUrl: detail.frontImage, backImageUrl: detail.images?.backM ?? detail.backImage ?? null,
        width: metadata.width, height: metadata.height,
        sourceUrl: `https://collectorcrypt.com/assets/solana/${detail.nftAddress}`,
        sourceId: String(detail.id), checkedAt: new Date().toISOString(),
      });
      selected++;
    } catch (error) {
      failures.push({ id: row.cardId, playerName: row.playerName, error: error.message });
      if (error.message.includes("Rate limited")) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  complete++;
  if (complete % 15 === 0) console.log(`Verified ${complete}/${grouped.size} players, ${records.length} decodable photos`);
}
const snapshot = { source: "Collector Crypt public catalogue", sourceUrl: "https://docs.collectorcrypt.com/marketplace/api", imageDocs: "https://docs.collectorcrypt.com/metadata", fetchedAt: new Date().toISOString(), rosterSource: roster.sourceUrl, rosterFetchedAt: roster.fetchedAt, candidateCount: candidates.cards.length, records, failures };
await writeFile(new URL("../src/data/public-card-photos.json", import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ photos: records.length, players: new Set(records.map((r) => r.personId)).size, failures: failures.length }));
