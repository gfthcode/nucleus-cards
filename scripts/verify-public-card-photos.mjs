import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
// Use the same image decoder installed by Next; no extra production dependency.
const sharp = createRequire(import.meta.resolve("next"))("sharp");
const source = JSON.parse(await readFile(process.argv[2], "utf8"));
const input = source.cards ?? source.records;
if (!Array.isArray(input)) throw new Error("No public card records");
const destination = new URL("../src/data/public-card-photos.json", import.meta.url);
const previous = JSON.parse(await readFile(destination, "utf8").catch(() => '{"records":[]}'));
const cached = new Map(previous.records.map((r) => [r.sourceId, r]));
const records = [], failures = [];
let position = 0;
const worker = async () => {
  while (position < input.length) {
    const row = input[position++];
    try {
      const imageUrl = row.thumbnailUrl || row.imageUrl;
      const known = cached.get(row.cardId);
      if (known && known.imageUrl === imageUrl && Date.now() - Date.parse(known.checkedAt) < 86400000) {
        records.push(known);
        continue;
      }
      const response = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) });
      const mime = response.headers.get("content-type") ?? "";
      if (!response.ok || (!mime.startsWith("image/") && !mime.startsWith("application/octet-stream"))) throw new Error(`Photo response ${response.status} ${mime}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(bytes, { failOn: "warning" }).metadata();
      await sharp(bytes, { failOn: "warning" }).resize({ width: 24 }).raw().toBuffer();
      if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 250) throw new Error("Image too small");
      records.push({ id: row.cardId, sourceId: row.cardId, personId: row.playerId, playerName: row.playerName, title: row.title, year: row.year, set: row.set, cardNumber: row.cardNumber, parallel: row.parallel ?? null, grade: row.grade ?? null, gradingCompany: row.gradingCompany ?? null, autographed: row.autographed === true, imageUrl, fullImageUrl: row.fullImageUrl || row.imageUrl, backImageUrl: row.backImageUrl ?? null, width: metadata.width, height: metadata.height, sourceUrl: row.sourceUrl, checkedAt: new Date().toISOString() });
    } catch (error) { failures.push({ id: row.cardId, playerName: row.playerName, error: error.message }); }
    if ((records.length + failures.length) % 25 === 0) console.log(`Decoded ${records.length}/${input.length} photos; ${failures.length} failures`);
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
};
await Promise.all([worker(), worker(), worker()]);
records.sort((a, b) => a.playerName.localeCompare(b.playerName));
const snapshot = { source: "Collector Crypt public catalogue", sourceUrl: "https://docs.collectorcrypt.com/marketplace/api", imageDocs: "https://docs.collectorcrypt.com/metadata", fetchedAt: new Date().toISOString(), candidateCount: 2485, records, failures };
await writeFile(destination, JSON.stringify(snapshot, null, 2) + "\n");
console.log(JSON.stringify({ photos: records.length, players: new Set(records.map((r) => r.personId)).size, failures }));
