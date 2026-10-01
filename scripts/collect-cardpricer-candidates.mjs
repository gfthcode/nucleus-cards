/**
 * Read-only CardPricer public API importer.
 * CardPricer documents this API as anonymous, read-only, and provenance-backed:
 * https://cardpricer.co/docs/api
 *
 * This importer only keeps one card with a public image per roster player that
 * is not already covered by the Collector Crypt catalogue. It never invents a
 * card number, price, or player identity; CardPricer values are source data,
 * not verified sale prices by this app.
 */
import { readFile, writeFile } from "node:fs/promises";

const API = "https://cardpricer.co/api/v1/cards";
const PAGE = 200;
const roster = JSON.parse(await readFile(new URL("../src/data/nba-official-roster.json", import.meta.url), "utf8"));
const snapshotPath = new URL("../src/data/public-card-photos.json", import.meta.url);
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));

const normalize = (value) => String(value ?? "").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ").trim();

const aliases = new Map([
  ["stephen curry", ["steph curry"]], ["alexandre sarr", ["alex sarr"]],
  ["nicolas claxton", ["nic claxton"]], ["cameron thomas", ["cam thomas"]],
  ["cameron whitmore", ["cam whitmore"]], ["herbert jones", ["herb jones"]],
  ["nicolas batum", ["nic batum"]], ["gg jackson", ["gg jackson ii"]],
  ["bronny james", ["bronny james jr"]], ["jimmy butler iii", ["jimmy butler"]],
  ["tre johnson", ["tre johnson iii"]], ["p j washington", ["pj washington jr"]],
].map(([key, values]) => [normalize(key), values.map(normalize)]));

const rosterEntries = roster.records.map((player) => {
  const key = normalize(player.name);
  return { player, keys: new Set([key, ...(aliases.get(key) ?? [])]) };
});
const covered = new Set((snapshot.records ?? []).map((row) => String(row.personId)));

function matchesPlayer(value) {
  const candidate = normalize(value);
  const matches = rosterEntries.filter(({ keys }) => [...keys].some((key) => candidate === key || candidate.endsWith(` ${key}`)));
  return matches.length === 1 ? matches[0].player : null;
}

function plausibleYear(card, player) {
  const year = Number(card.year), draft = Number(player.draftYear);
  return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() + 1
    && (!Number.isInteger(draft) || !draft || year >= draft - 4);
}

function imageSize(bytes) {
  if (bytes.length >= 24 && bytes.toString("ascii", 1, 4) === "PNG")
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP")
    return { width: 1, height: 1 }; // WebP header variants are intentionally accepted after content-type validation.
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset++; continue; }
      const marker = bytes[offset + 1];
      const length = bytes.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
      if (!length) break;
      offset += 2 + length;
    }
  }
  return null;
}

async function getPage(offset) {
  const response = await fetch(`${API}?sport=basketball&limit=${PAGE}&offset=${offset}`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`CardPricer HTTP ${response.status}`);
  return response.json();
}

const all = [];
for (let offset = 0; offset < 10000; offset += PAGE) {
  const body = await getPage(offset);
  if (!Array.isArray(body.data)) throw new Error("CardPricer response has no data array");
  all.push(...body.data);
  console.log(`Read CardPricer offset ${offset}; ${all.length} cards`);
  if (body.data.length < PAGE) break;
}

const candidates = new Map();
for (const card of all) {
  const player = matchesPlayer(card.player);
  if (!player || covered.has(String(player.personId)) || !plausibleYear(card, player) || !card.imageUrl || !card.cardNumber) continue;
  const current = candidates.get(String(player.personId));
  const score = (card.lastSold ? 3 : 0) + (card.grade ? 1 : 0) + (card.set ? 1 : 0);
  if (!current || score > current.score) candidates.set(String(player.personId), { card, player, score });
}

const records = [], failures = [];
for (const { card, player } of candidates.values()) {
  try {
    const photo = await fetch(card.imageUrl, { redirect: "follow", signal: AbortSignal.timeout(20000) });
    const type = photo.headers.get("content-type") ?? "";
    const bytes = Buffer.from(await photo.arrayBuffer());
    const dimensions = imageSize(bytes);
    if (!photo.ok || !type.startsWith("image/") || bytes.length < 1000 || !dimensions) throw new Error("image response was not a decodable card image");
    records.push({
      id: `cardpricer-${card.id}`, sourceId: String(card.id), personId: String(player.personId), playerName: player.name,
      title: `${card.year ?? ""} ${card.player} ${card.set ?? ""}`.trim(), year: Number(card.year), set: card.set ?? "Unspecified set",
      cardNumber: String(card.cardNumber), parallel: null, grade: card.grade ?? null, gradingCompany: null, autographed: false,
      imageUrl: card.imageUrl, fullImageUrl: card.imageUrl, backImageUrl: null, width: dimensions.width, height: dimensions.height,
      sourceUrl: `https://cardpricer.co/cards/${card.id}`, sourceName: "CardPricer", sourceDocs: "https://cardpricer.co/docs/api",
      checkedAt: new Date().toISOString(), sourcePrice: typeof card.price === "number" ? card.price : null,
    });
  } catch (error) {
    failures.push({ sourceId: String(card.id), playerName: player.name, error: error.message });
  }
}

const existing = snapshot.records ?? [];
const merged = [...existing, ...records];
const next = {
  ...snapshot,
  source: "Collector Crypt public catalogue + CardPricer public API",
  sourceDocs: [snapshot.sourceUrl, "https://cardpricer.co/docs/api"],
  fetchedAt: new Date().toISOString(),
  records: merged,
  cardPricerCandidateCount: all.length,
  cardPricerRecordsAdded: records.length,
  cardPricerFailures: failures,
};
await writeFile(snapshotPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(JSON.stringify({ cardPricerCandidates: all.length, added: records.length, players: new Set(merged.map((row) => row.personId)).size, failures: failures.length }));
