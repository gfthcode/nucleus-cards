/**
 * Read-only Collector Crypt photo catalogue maintenance (Node >= 20).
 * Official endpoints: https://docs.collectorcrypt.com/marketplace/api
 * Image embedding: https://docs.collectorcrypt.com/metadata
 *
 * node scripts/collect-public-card-candidates.mjs [output.json]
 *   [--candidate-cache /private/tmp/nucleus-public-card-candidates.json]
 *   [--max-pages 3] [--max-new 250] [--delay-ms 1000]
 * Then: node scripts/verify-public-card-photos.mjs output.json
 *
 * Existing representatives are reused after identity validation. Only missing
 * players receive detail requests. A supplied candidate cache avoids catalogue
 * requests; it never substitutes for the Basketball/Card detail validation.
 * All requests are public GETs. 403/429 stop immediately; no credentials,
 * proxies, retries, or bypasses. Owner, seller, wallet, and insurance fields
 * are never persisted. A card's NFT mint is used only in its public source URL.
 * Catalogue presence/insurance is NOT a verified sale or market valuation.
 */
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const API = "https://api.collectorcrypt.com";
const REPO = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_OUTPUT = "/private/tmp/nucleus-public-card-representatives.json";
const SOURCE = "Collector Crypt public marketplace API";
// These are explicit name variants, not a general suffix-removal rule.
// Never collapse Tim Hardaway Jr., Gary Payton II, Kenyon Martin Jr., etc.
const NAME_GROUPS = [
  ["Stephen Curry", "Steph Curry"],
  ["Alex Sarr", "Alexandre Sarr"],
  ["Nic Claxton", "Nicolas Claxton"],
  ["Cameron Thomas", "Cam Thomas"],
  ["Cameron Whitmore", "Cam Whitmore"],
  ["Herbert Jones", "Herb Jones"],
  ["Nicolas Batum", "Nic Batum"],
  ["GG Jackson", "GG Jackson II"],
  ["Bronny James", "Bronny James Jr."],
  ["Jimmy Butler III", "Jimmy Butler"],
  ["Tre Johnson", "Tre Johnson III"],
  ["P.J. Washington", "PJ Washington Jr."],
];
const NAME_KEY_CACHE = new Map();

export function normalizeName(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[.’']/g, "").replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function nameKeys(name) {
  if (NAME_KEY_CACHE.has(name)) return NAME_KEY_CACHE.get(name);
  const normalized = normalizeName(name);
  const group = NAME_GROUPS.find((names) => names.some((n) => normalizeName(n) === normalized));
  const keys = new Set((group ?? [name]).map(normalizeName));
  NAME_KEY_CACHE.set(name, keys);
  return keys;
}

function text(value, max = 500) {
  return typeof value === "string" && value.length <= max ? value : null;
}

function httpsUrl(value) {
  if (typeof value !== "string") return null;
  try { return new URL(value).protocol === "https:" ? value : null; } catch { return null; }
}

function yearOf(value) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() + 1 ? year : null;
}

function plausibleYear(card, player) {
  const year = yearOf(card.year);
  const draft = Number(player?.draftYear);
  // Permit genuine pre-draft college cards, but reject a parent's 1990s card.
  return year !== null && (!Number.isInteger(draft) || draft < 1947 || year >= draft - 4);
}

function disallowedTitle(title) {
  return /[a-z]\s*\/\s*[a-z]/i.test(title)
    || /\b(duals?|triple|combo talents|king.s court|rebound leaders|scoring leaders|autographed jersey|signed.*jersey|basketball signed|ticket|playmat)\b/i.test(title)
    || /\s(?:&|and|versus|vs\.?)\s/i.test(title);
}

export function matchPlayer(card, players) {
  if (!card.title || disallowedTitle(card.title)) return null;
  const title = ` ${normalizeName(card.title)} `;
  const matches = players.filter((p) => [...nameKeys(p.name)].some((key) => title.includes(` ${key} `)));
  return matches.length === 1 && plausibleYear(card, matches[0]) ? matches[0] : null;
}

function sourceNameMatches(sourceName, player) {
  if (!sourceName) return true; // A missing field is not invented; the title must still match.
  // Source occasionally appends a numeric print run, e.g. "Joel Embiid/99".
  const name = normalizeName(String(sourceName).replace(/\s*\/\s*\d+\s*$/, ""));
  return nameKeys(player.name).has(name);
}

function candidateFromMarketplace(raw) {
  if (raw.category !== "Basketball" || (raw.type && raw.type !== "Card")) return null;
  const mint = typeof raw.nftAddress === "string" && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw.nftAddress) ? raw.nftAddress : null;
  return sanitizeCandidate({
    cardId: raw.id, title: raw.itemName, year: raw.year, set: raw.set,
    cardNumber: raw.serial, grade: raw.grade, gradingCompany: raw.gradingCompany,
    gradingId: raw.gradingID, imageUrl: raw.frontImage, thumbnailUrl: raw.images?.frontM,
    sourceUrl: mint ? `https://collectorcrypt.com/assets/solana/${mint}` : null,
  });
}

function sanitizeCandidate(row) {
  const cardId = String(row.cardId ?? "");
  const sourceUrl = httpsUrl(row.sourceUrl);
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(cardId) || !text(row.title)
      || !sourceUrl?.startsWith("https://collectorcrypt.com/assets/solana/")) return null;
  return {
    cardId, title: text(row.title), year: yearOf(row.year), set: text(row.set),
    cardNumber: text(String(row.cardNumber ?? ""), 100), grade: text(row.grade),
    gradingCompany: text(row.gradingCompany), gradingId: text(row.gradingId),
    imageUrl: httpsUrl(row.imageUrl), thumbnailUrl: httpsUrl(row.thumbnailUrl), sourceUrl,
  };
}

function sanitizeRepresentative(row) {
  const candidate = sanitizeCandidate(row);
  if (!candidate || !row.playerId || !text(row.playerName) || row.cardType !== "Card"
      || (row.category && row.category !== "Basketball")) return null;
  return {
    ...candidate, playerId: String(row.playerId), playerName: text(row.playerName),
    parallel: text(row.parallel), subset: text(row.subset),
    sourcePlayerName: text(row.sourcePlayerName), sourceDescription: text(row.sourceDescription),
    sourceSetUrl: httpsUrl(row.sourceSetUrl), cardType: "Card", category: "Basketball",
    autographed: typeof row.autographed === "boolean" ? row.autographed : null,
    fullImageUrl: httpsUrl(row.fullImageUrl) ?? candidate.imageUrl,
    backImageUrl: httpsUrl(row.backImageUrl), backThumbnailUrl: httpsUrl(row.backThumbnailUrl),
  };
}

function options(args) {
  const out = { output: DEFAULT_OUTPUT, candidateCache: null, maxPages: 3, maxNew: 250, delayMs: 1000 };
  let positional = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--") && !positional) { out.output = arg; positional = true; continue; }
    const key = { "--output": "output", "--candidate-cache": "candidateCache", "--max-pages": "maxPages", "--max-new": "maxNew", "--delay-ms": "delayMs" }[arg];
    if (!key || !args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Invalid argument: ${arg}`);
    out[key] = args[++i];
  }
  for (const [key, min, max] of [["maxPages", 1, 20], ["maxNew", 0, 1000], ["delayMs", 250, 60000]]) {
    out[key] = Number(out[key]);
    if (!Number.isInteger(out[key]) || out[key] < min || out[key] > max) throw new Error(`Invalid ${key} (${min}..${max})`);
  }
  out.output = resolve(out.output);
  return out;
}

class StopCollection extends Error {}

function publicClient(delayMs) {
  let lastRequestAt = 0;
  return async function get(path) {
    const pause = Math.max(0, delayMs - (Date.now() - lastRequestAt));
    if (pause) await new Promise((done) => setTimeout(done, pause));
    lastRequestAt = Date.now();
    const response = await fetch(`${API}${path}`, {
      method: "GET", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { Accept: "application/json", "User-Agent": "NucleusCards-PublicCatalog/1.0" },
    });
    if (response.status === 403 || response.status === 429) throw new StopCollection(`HTTP ${response.status}: collection stopped; no retry or bypass`);
    if (!response.ok) throw new Error(`Public API HTTP ${response.status}`);
    return response.json();
  };
}

export async function main(args = process.argv.slice(2)) {
  const config = options(args);
  const roster = JSON.parse(await readFile(resolve(REPO, "src/data/nba-official-roster.json"), "utf8"));
  if (!Array.isArray(roster.records)) throw new Error("NBA roster has no records");
  const players = roster.records.map((p) => ({ ...p, personId: String(p.personId) }));
  let previous = { cards: [] };
  try { previous = JSON.parse(await readFile(config.output, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const cards = [], failures = [];
  for (const raw of previous.cards ?? []) {
    const row = sanitizeRepresentative(raw);
    const player = row && (players.find((p) => p.personId === row.playerId) ?? { personId: row.playerId, name: row.playerName });
    if (!row || !matchPlayer(row, [player]) || !sourceNameMatches(row.sourcePlayerName, player)) {
      failures.push({ cardId: String(raw.cardId ?? ""), reason: "Rejected cached identity; title, player name, or year does not agree" });
      continue;
    }
    if (!cards.some((c) => c.playerId === row.playerId)) cards.push(row);
  }
  const get = publicClient(config.delayMs);
  let candidates = [], catalogueComplete = false, pagesRead = 0;
  if (config.candidateCache) {
    const cache = JSON.parse(await readFile(resolve(config.candidateCache), "utf8"));
    if (!Array.isArray(cache.cards)) throw new Error("Candidate cache has no cards");
    candidates = cache.cards.map(sanitizeCandidate).filter(Boolean);
  } else {
    let cursor;
    for (let page = 1; page <= config.maxPages; page++) {
      const query = new URLSearchParams({ categories: "Basketball", step: "1000", ...(cursor ? { cursor } : { page: "1" }) });
      const body = await get(`/marketplace?${query}`);
      if (!Array.isArray(body.filterNFtCard)) throw new Error("Unexpected public marketplace response");
      candidates.push(...body.filterNFtCard.map(candidateFromMarketplace).filter(Boolean));
      pagesRead++;
      const next = typeof body.nextCursor === "string" ? body.nextCursor : null;
      console.log(`Read public Basketball catalogue page ${pagesRead}; ${candidates.length} candidates`);
      if (!next || body.filterNFtCard.length === 0) { catalogueComplete = true; break; }
      if (next === cursor) throw new Error("Repeated catalogue cursor; stopped");
      cursor = next;
    }
  }
  candidates = [...new Map(candidates.map((row) => [row.cardId, row])).values()];
  const existing = new Set(cards.map((row) => row.playerId)), groups = new Map();
  for (const card of candidates) {
    const player = matchPlayer(card, players);
    if (!player || existing.has(player.personId) || !(card.imageUrl || card.thumbnailUrl)) continue;
    const group = groups.get(player.personId) ?? [];
    group.push({ ...card, playerId: player.personId, playerName: player.name });
    groups.set(player.personId, group);
  }
  const representatives = [...groups.values()].map((rows) => rows.sort((a, b) =>
    Number(b.title.toLowerCase().includes("prizm")) - Number(a.title.toLowerCase().includes("prizm"))
    || b.year - a.year || a.cardId.localeCompare(b.cardId))[0]).slice(0, config.maxNew);
  console.log(`Reusing ${cards.length} valid representatives; requesting ${representatives.length} missing-player details`);
  let terminalError, consecutiveFailures = 0;
  for (const card of representatives) {
    try {
      const detail = await get(`/cards/publicNft/${encodeURIComponent(card.cardId)}`);
      const player = players.find((p) => p.personId === card.playerId);
      if (String(detail.id) !== card.cardId || detail.type !== "Card" || detail.category !== "Basketball") throw new Error("Detail is not the expected Basketball Card");
      if (!sourceNameMatches(detail.gemrateCardName, player)) throw new Error("Detail player name differs; no suffix guessing allowed");
      if (detail.year && Number(detail.year) !== card.year) throw new Error("Detail year differs from catalogue");
      const row = sanitizeRepresentative({
        ...card, parallel: detail.parallel, subset: detail.subset, grade: detail.grade ?? card.grade,
        gradingCompany: detail.gradingCompany ?? card.gradingCompany,
        sourcePlayerName: detail.gemrateCardName, sourceDescription: detail.gemrateDescription,
        sourceSetUrl: detail.setUrl, cardType: detail.type, category: detail.category,
        autographed: detail.autographed, fullImageUrl: detail.images?.front ?? card.imageUrl,
        thumbnailUrl: detail.images?.frontM ?? card.thumbnailUrl,
        backImageUrl: detail.images?.back ?? detail.backImage, backThumbnailUrl: detail.images?.backM,
      });
      if (!row || !row.fullImageUrl) throw new Error("No usable full photo URL");
      cards.push(row);
      consecutiveFailures = 0;
    } catch (error) {
      failures.push({ cardId: card.cardId, playerName: card.playerName, reason: error.message });
      if (error instanceof StopCollection || ++consecutiveFailures >= 5) { terminalError = error; break; }
    }
  }
  for (const card of cards) {
    const player = players.find((p) => p.personId === card.playerId);
    card.inCurrentRoster = Boolean(player);
    card.currentRosterSource = roster.sourceUrl ?? null;
    if (player) { card.currentRosterName = player.name; card.currentRosterTeam = player.teamAbbreviation ?? null; }
  }
  const output = {
    source: SOURCE, sourceDocs: "https://docs.collectorcrypt.com/marketplace/api",
    imageDocs: "https://docs.collectorcrypt.com/metadata", fetchedAt: new Date().toISOString(),
    rosterSource: { source: roster.source, url: roster.sourceUrl, fetchedAt: roster.fetchedAt, count: players.length },
    candidateCount: candidates.length, pagesRead, catalogueComplete,
    notes: ["Real catalogued physical cards, not verified sales.", "Photos still require decoder and visual verification.", "Missing parallel/autograph fields remain unknown; no invented Base classification."],
    cards, failures,
  };
  await mkdir(dirname(config.output), { recursive: true });
  const temporary = `${config.output}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(output, null, 2) + "\n");
  await rename(temporary, config.output);
  console.log(JSON.stringify({ output: config.output, representatives: cards.length, currentPlayers: cards.filter((c) => c.inCurrentRoster).length, failures: failures.length, catalogueComplete }));
  if (terminalError) throw terminalError;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
