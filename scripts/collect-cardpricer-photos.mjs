/** Read-only public API intake. Produces candidates, never replaces the live catalogue. */
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.resolve("next"))("sharp");
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: node scripts/collect-cardpricer-photos.mjs <downloaded-api-snapshot.json> <review-candidates.json>");
const source = JSON.parse(await readFile(input, "utf8"));
const roster = JSON.parse(await readFile(new URL("../src/data/nba-official-roster.json", import.meta.url), "utf8"));
const existing = JSON.parse(await readFile(new URL("../src/data/public-card-photos.json", import.meta.url), "utf8"));
const normalize = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const covered = new Set(existing.records.map((row) => row.personId));
const hosts = new Set(["arweave.net", "static.courtyard.io", "i2c.seadn.io"]);
const records = [], failures = [], seen = new Set();
for (const row of source.records) {
  if (seen.has(row.id)) continue;
  seen.add(row.id);
  // Do not strip Jr/II or guess abbreviations: father/son and multi-player matches require review.
  const matches = roster.records.filter((player) => normalize(player.name) === normalize(row.player));
  if (matches.length !== 1 || covered.has(matches[0].personId) || !row.imageUrl || !row.cardNumber || !row.year || !row.set) continue;
  const player = matches[0];
  try {
    const url = new URL(row.imageUrl);
    if (url.protocol !== "https:" || !hosts.has(url.hostname) || url.username || url.password) throw new Error("Unapproved image origin");
    const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: "error" });
    if (response.status === 429) throw new Error("Rate limited; stop intake");
    if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(bytes, { failOn: "warning" }).metadata();
    // Decode all pixels: metadata alone can accept truncated JPEGs.
    await sharp(bytes, { failOn: "warning" }).raw().toBuffer();
    if (metadata.width < 200 || metadata.height < 250) throw new Error("Image too small");
    const gradingCompany = row.grade?.match(/\b(PSA|BGS|SGC|CGC|TAG)\b/i)?.[1]?.toUpperCase() ?? null;
    const detailResponse = await fetch(`https://cardpricer.co/api/v1/cards/${row.id}`, { signal: AbortSignal.timeout(20000) });
    if (detailResponse.status === 429) throw new Error("Rate limited; stop intake");
    if (!detailResponse.ok) throw new Error(`Card detail HTTP ${detailResponse.status}`);
    const detail = (await detailResponse.json()).data;
    if (normalize(detail.player) !== normalize(player.name) || detail.cardNumber !== row.cardNumber || detail.year !== row.year) throw new Error("Card identity changed during intake");
    records.push({ id: `cardpricer-${row.id}`, sourceId: `cardpricer-${row.id}`, personId: player.personId,
      playerName: player.name, title: `${row.year} ${row.set} ${row.player} #${row.cardNumber} ${row.grade ?? ""}`.trim(),
      year: row.year, set: row.set, cardNumber: row.cardNumber, parallel: null, grade: row.grade ?? null,
      gradingCompany, autographed: detail.attributes?.isAutographed === true, imageUrl: row.imageUrl, fullImageUrl: row.imageUrl, backImageUrl: null,
      width: metadata.width, height: metadata.height, sourceUrl: `https://cardpricer.co/cards/${row.id}`,
      sourceName: "CardPricer", sourceDocs: "https://cardpricer.co/docs/api", checkedAt: new Date().toISOString() });
    covered.add(player.personId);
    console.log(`Decoded candidate: ${player.name} (${metadata.width} x ${metadata.height})`);
  } catch (error) {
    failures.push({ id: row.id, playerName: player.name, error: error.message });
    if (error.message.includes("Rate limited")) break;
  }
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
await writeFile(output, JSON.stringify({ source: "CardPricer public API", sourceDocs: "https://cardpricer.co/docs/api", fetchedAt: new Date().toISOString(), reviewed: false, records, failures }, null, 2) + "\n");
console.log(JSON.stringify({ candidates: records.length, failures }));
