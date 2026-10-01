/**
 * Append reviewed public card photos without replacing an existing representative.
 *
 * node scripts/merge-reviewed-card-photos.mjs --existing existing.json
 *   --candidates reviewed.json --roster roster.json [--output new-manifest.json]
 *   [--delay-ms 350]
 *
 * No --output means dry-run (including image verification). An output must be a
 * new, independent file; this script never writes back to any input. Reviewers
 * must establish that the source metadata describes a basketball trading card.
 * Pixel decoding proves image integrity, NOT identity, licensing, or a sale.
 * New sources require an explicit code-reviewed policy below, never a CLI host.
 * Public GET only, no redirects/retries/credentials; 403/429 stop that source.
 */
import { readFile, writeFile, realpath, lstat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { matchPlayer, normalizeName } from "./collect-public-card-candidates.mjs";

export const SOURCE_POLICIES = Object.freeze({
  "Collector Crypt": Object.freeze({
    docs: "https://docs.collectorcrypt.com/marketplace/api",
    sourceHost: "collectorcrypt.com",
    sourcePath: /^\/assets\/solana\/[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    imageHosts: Object.freeze(["d1xpxki1g4htqu.cloudfront.net", "collectorcrypt-prod.s3.us-west-2.amazonaws.com", "arweave.net"]),
    imagePath: /^\/[^\s]+$/,
    id: /^[a-zA-Z0-9_-]{1,100}$/,
  }),
  CardPricer: Object.freeze({
    docs: "https://cardpricer.co/docs/api",
    sourceHost: "cardpricer.co",
    sourcePath: /^\/cards\/[a-f0-9-]+$/i,
    imageHosts: Object.freeze(["static.courtyard.io", "i2c.seadn.io", "arweave.net"]),
    imagePath: /^\/[^\s]+$/,
    id: /^(?:cardpricer-)?[a-f0-9-]+$/i,
  }),
  Phygitals: Object.freeze({
    docs: "https://www.phygitals.com/docs/public-api",
    sourceHost: "api.phygitals.com",
    sourcePath: /^\/api\/vm\/chase\/[a-z0-9-]+$/,
    imageHosts: Object.freeze(["img.phygitals.com"]),
    imagePath: /^\/[a-zA-Z0-9_-]+$/,
    id: /^phygitals-[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  }),
  HobbyScan: Object.freeze({
    docs: "https://www.hobbyscan.com/cards",
    sourceHost: "www.hobbyscan.com",
    sourcePath: /^\/card\/\d+$/,
    imageHosts: Object.freeze(["hobbyscan-images-prod.s3.us-east-2.amazonaws.com"]),
    imagePath: /^\/scans\/[a-zA-Z0-9_.-]+\.jpg$/i,
    id: /^hobbyscan-\d+$/,
  }),
});

export class PhotoIntakeError extends Error {
  /** @param {string} code @param {string} message @param {number | null} status */
  constructor(code, message, status = null) {
    super(message);
    this.name = "PhotoIntakeError";
    this.code = code;
    this.status = status;
  }
}

function reject(code, message) { throw new PhotoIntakeError(code, message); }
function text(value, field, max = 600) {
  if (typeof value !== "string" || !value.trim() || value.length > max || /[\u0000-\u001f]/.test(value)) reject("invalid-field", `Invalid ${field}`);
  return value.trim();
}
function optionalText(value, field) { return value == null ? null : text(value, field, 200); }
function recordsOf(manifest, label) {
  const records = Array.isArray(manifest) ? manifest : manifest?.records;
  if (!Array.isArray(records)) reject("invalid-manifest", `${label} must contain a records array`);
  return records;
}
function timestamp(value) {
  const date = new Date(value ?? Date.now());
  if (!Number.isFinite(date.getTime())) reject("invalid-time", "Invalid verification time");
  return date.toISOString();
}
function safeUrl(value, field) {
  let url;
  try { url = new URL(text(value, field, 2048)); } catch { reject("invalid-url", `Invalid ${field}`); }
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash || url.search) reject("invalid-url", `Non-public or non-canonical ${field}`);
  return url;
}

export function validateImageUrl(value, sourceName) {
  const policy = SOURCE_POLICIES[sourceName];
  if (!policy) reject("unknown-source", "Unknown image source");
  const url = safeUrl(value, "image URL");
  if (!policy.imageHosts.includes(url.hostname) || !policy.imagePath.test(url.pathname)) reject("image-source-mismatch", "Image host/path does not belong to this source policy");
  if (/placeholder|no[-_]?image|missing[-_]?image|default[-_]?image|avatar|headshot|\.svg$/i.test(decodeURIComponent(url.pathname))) reject("placeholder-image", "Placeholder or portrait image is not a card photo");
  return url.href;
}

/** Pure validation/whitelisting: untrusted price, insurance, owner and URL fields never spread. */
export function validateCandidate(row, roster, now = new Date().toISOString()) {
  if (!row || typeof row !== "object" || Array.isArray(row)) reject("invalid-record", "Candidate must be an object");
  const players = recordsOf(roster, "Roster");
  const personId = String(row.personId ?? "");
  if (!/^\d+$/.test(personId)) reject("invalid-player", "Invalid personId");
  const player = players.find((entry) => String(entry.personId) === personId);
  if (!player || normalizeName(text(row.playerName, "playerName")) !== normalizeName(player.name)) reject("player-mismatch", "Candidate name/personId must match the roster");
  const title = text(row.title, "title");
  const year = row.year;
  if (!Number.isInteger(year) || year < 1900 || year > new Date(timestamp(now)).getUTCFullYear()) reject("invalid-year", "Invalid or future card year");
  if (!new RegExp(`\\b${year}(?:\\b|-)`).test(title)) reject("year-mismatch", "Card year is absent from the source title");
  const matched = matchPlayer({ title, year }, players);
  if (!matched || String(matched.personId) !== personId) reject("title-mismatch", "Source title does not uniquely identify this player and era");
  if (row.category != null && !/^basketball$/i.test(row.category)) reject("not-basketball", "Source category is not Basketball");
  if (row.cardType != null && !/^card$/i.test(row.cardType)) reject("not-card", "Source item is not a trading card");
  const cardNumber = text(String(row.cardNumber ?? ""), "cardNumber", 100).replace(/^#/, "");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(cardNumber) || /^(?:NBA-|unknown$|none$|na$|n-a$)/i.test(cardNumber)) reject("invalid-card-number", "Missing or invented card number");
  const escapedNumber = cardNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // An unlabelled number could be a grade or print run (PSA 10, /99), not a card number.
  if (!new RegExp(`(?:^|[\\s(])(?:#\\s*|(?:card(?:\\s+no\\.?|\\s+number)?|no\\.?)\\s+)${escapedNumber}(?=$|[\\s,;)])`, "i").test(title)) reject("card-number-mismatch", "Explicit card number is absent from the source title");
  const sourceName = row.sourceName ?? "Collector Crypt";
  const policy = SOURCE_POLICIES[sourceName];
  if (!policy) reject("unknown-source", "Source has no reviewed policy");
  const sourceUrl = safeUrl(row.sourceUrl, "source URL");
  if (sourceUrl.hostname !== policy.sourceHost || !policy.sourcePath.test(sourceUrl.pathname)) reject("source-url-mismatch", "Source URL is outside the reviewed catalogue");
  const sourceId = text(row.sourceId, "sourceId", 120);
  if (!policy.id.test(sourceId)) reject("invalid-source-id", "Source ID is invalid");
  if (sourceName === "HobbyScan" && sourceId !== `hobbyscan-${sourceUrl.pathname.split("/").at(-1)}`) reject("source-id-mismatch", "HobbyScan ID does not match the source page");
  if (row.id != null && row.id !== sourceId) reject("source-id-mismatch", "Record and source IDs disagree");
  if (row.sourceDocs != null && row.sourceDocs !== policy.docs) reject("source-docs-mismatch", "Unrecognized source documentation");
  const imageUrl = validateImageUrl(row.imageUrl, sourceName);
  return {
    id: sourceId, sourceId, personId, playerName: player.name, title, year,
    set: text(row.set, "set", 250), cardNumber,
    parallel: optionalText(row.parallel, "parallel"), grade: optionalText(row.grade, "grade"),
    gradingCompany: optionalText(row.gradingCompany, "gradingCompany"), autographed: row.autographed === true,
    imageUrl, fullImageUrl: validateImageUrl(row.fullImageUrl ?? imageUrl, sourceName),
    backImageUrl: row.backImageUrl == null ? null : validateImageUrl(row.backImageUrl, sourceName),
    sourceUrl: sourceUrl.href, sourceName, sourceDocs: policy.docs,
  };
}

/** Fully decodes every pixel; metadata or a resized thumbnail alone are insufficient. */
export async function decodeImageBytes(bytes) {
  const sharp = createRequire(import.meta.resolve("next"))("sharp");
  const options = { failOn: "warning", limitInputPixels: 25_000_000, animated: false };
  const metadata = await sharp(bytes, options).metadata();
  if (!["jpeg", "png", "webp", "avif", "heif", "tiff"].includes(metadata.format) || (metadata.pages ?? 1) > 1) reject("invalid-image-format", "Expected a non-animated raster card scan");
  if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 250) reject("image-too-small", "Card image must be at least 200 × 250 pixels");
  const { data, info } = await sharp(bytes, options).raw().toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height * info.channels) reject("incomplete-image", "Image pixel buffer is incomplete");
  return { width: info.width, height: info.height };
}

export async function verifyRemoteImage(url, sourceName, { fetchImpl = globalThis.fetch, maxBytes = 20_000_000, decode = decodeImageBytes } = {}) {
  const allowedUrl = validateImageUrl(url, sourceName);
  const response = await fetchImpl(allowedUrl, {
    method: "GET", redirect: "error", credentials: "omit", signal: AbortSignal.timeout(20_000),
    headers: { Accept: "image/avif,image/webp,image/png,image/jpeg", "User-Agent": "NucleusCards-ReviewedPhotoIntake/1.0" },
  });
  if (response.status === 429 || response.status === 403) throw new PhotoIntakeError("source-stopped", `HTTP ${response.status}: source stopped without retry`, response.status);
  if (!response.ok) throw new PhotoIntakeError("image-http-error", `Image HTTP ${response.status}`, response.status);
  if (response.redirected || (response.url && response.url !== allowedUrl)) reject("image-redirect", "Image response unexpectedly redirected");
  const mime = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!/^image\/(?:jpeg|png|webp|avif|heif|tiff)$/.test(mime) && mime !== "application/octet-stream") reject("image-content-type", "Response is not an approved raster image");
  if (Number(response.headers.get("content-length")) > maxBytes) { await response.body?.cancel(); reject("image-too-large", "Image exceeds byte limit"); }
  if (!response.body) reject("empty-image", "Empty image response");
  const chunks = [];
  let length = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); reject("image-too-large", "Image exceeds byte limit"); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  return decode(Buffer.concat(chunks));
}

/** In-memory merge, with an injected verifier for deterministic offline tests. */
export async function mergeReviewedPhotos(existing, candidates, roster, {
  verifyImage = verifyRemoteImage, now = new Date().toISOString(),
  delayMs = verifyImage === verifyRemoteImage ? 350 : 0,
  sleep = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds)),
} = {}) {
  const previous = recordsOf(existing, "Existing manifest");
  const incoming = recordsOf(candidates, "Candidate manifest");
  const players = recordsOf(roster, "Roster");
  const checkedAt = timestamp(now);
  if (!Number.isInteger(delayMs) || delayMs < 0 || delayMs > 60_000) reject("invalid-delay", "Image request delay must be 0..60000 ms");
  if (new Set(players.map((player) => String(player.personId))).size !== players.length) reject("invalid-roster", "Roster contains duplicate player IDs");
  const records = structuredClone(previous);
  const covered = new Set(previous.map((row) => String(row.personId)));
  const sourceIds = new Set(previous.map((row) => row.sourceId));
  if (covered.size !== previous.length || sourceIds.size !== previous.length) reject("invalid-existing", "Existing manifest has duplicate player or source IDs; nothing changed");
  const added = [], rejected = [], skipped = [], stoppedSources = new Set();
  const lastRequestAt = new Map();
  const verifyWithSpacing = async (url, sourceName) => {
    const last = lastRequestAt.get(sourceName);
    const wait = last == null ? 0 : Math.max(0, delayMs - (Date.now() - last));
    if (wait) await sleep(wait);
    lastRequestAt.set(sourceName, Date.now());
    return verifyImage(url, sourceName);
  };
  for (const row of incoming) {
    const identity = { personId: row?.personId ?? null, sourceId: row?.sourceId ?? null, playerName: row?.playerName ?? null };
    if (covered.has(String(row?.personId))) { skipped.push({ ...identity, code: "already-covered" }); continue; }
    try {
      const candidate = validateCandidate(row, players, checkedAt);
      if (sourceIds.has(candidate.sourceId)) reject("duplicate-source-id", "Source ID is already assigned to another player");
      if (stoppedSources.has(candidate.sourceName)) reject("source-stopped", "Earlier 403/429 stopped this source; request not made");
      const dimensions = await verifyWithSpacing(candidate.imageUrl, candidate.sourceName);
      // Any retained alternate image also needs a complete decode before publication.
      for (const url of new Set([candidate.fullImageUrl, candidate.backImageUrl].filter((value) => value && value !== candidate.imageUrl))) await verifyWithSpacing(url, candidate.sourceName);
      if (!Number.isInteger(dimensions?.width) || !Number.isInteger(dimensions?.height) || dimensions.width < 200 || dimensions.height < 250) reject("invalid-dimensions", "Verifier did not return valid decoded dimensions");
      const record = { ...candidate, width: dimensions.width, height: dimensions.height, checkedAt };
      records.push(record);
      covered.add(record.personId);
      sourceIds.add(record.sourceId);
      added.push({ ...identity, sourceName: record.sourceName });
    } catch (error) {
      const sourceName = row?.sourceName ?? "Collector Crypt";
      if (error?.status === 429 || error?.status === 403) stoppedSources.add(sourceName);
      rejected.push({ ...identity, sourceName, code: error?.code ?? "image-validation-failed", message: error instanceof Error ? error.message : "Validation failed" });
    }
  }
  const missing = players.filter((player) => !covered.has(String(player.personId))).map((player) => ({ personId: String(player.personId), name: player.name }));
  const report = {
    checkedAt, previous: previous.length, candidateCount: incoming.length,
    added: added.length, rejected: rejected.length, skipped: skipped.length,
    total: records.length, rosterPlayers: players.length,
    coveredPlayers: players.length - missing.length, missing: missing.length,
    stoppedSources: [...stoppedSources], additions: added, failures: rejected,
    skippedCandidates: skipped, missingPlayers: missing,
  };
  const base = Array.isArray(existing) ? {} : structuredClone(existing);
  return { manifest: { ...base, fetchedAt: checkedAt, records, intakeReport: report }, report };
}

export function parseArguments(args) {
  const config = { existing: null, candidates: null, roster: null, output: null, delayMs: 350 };
  let hasDelay = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--delay-ms") {
      if (hasDelay || !/^\d+$/.test(args[index + 1] ?? "")) reject("invalid-arguments", "Invalid --delay-ms");
      config.delayMs = Number(args[++index]);
      hasDelay = true;
      if (config.delayMs < 350 || config.delayMs > 60_000) reject("invalid-delay", "CLI delay must be 350..60000 ms");
      continue;
    }
    const name = args[index].replace(/^--/, "");
    if (!["existing", "candidates", "roster", "output"].includes(name) || !args[index].startsWith("--") || !args[index + 1] || args[index + 1].startsWith("--") || config[name]) reject("invalid-arguments", `Invalid argument: ${args[index]}`);
    config[name] = resolve(args[++index]);
  }
  if (!config.existing || !config.candidates || !config.roster) reject("invalid-arguments", "Required: --existing --candidates --roster; optional: --output (new file only)");
  if (config.output && [config.existing, config.candidates, config.roster].includes(config.output)) reject("unsafe-output", "Output cannot replace an input file");
  return config;
}

export async function main(args = process.argv.slice(2)) {
  const config = parseArguments(args);
  const inputs = await Promise.all([config.existing, config.candidates, config.roster].map((path) => realpath(path)));
  if (config.output) {
    const resolvedOutput = resolve(await realpath(dirname(config.output)), config.output.split("/").at(-1));
    if (inputs.includes(resolvedOutput)) reject("unsafe-output", "Output resolves to an input file");
    const exists = await lstat(config.output).then(() => true).catch((error) => { if (error.code === "ENOENT") return false; throw error; });
    if (exists) reject("EEXIST", "Output already exists; no image requests made and no file replaced");
  }
  const manifests = await Promise.all(inputs.map(async (path) => JSON.parse(await readFile(path, "utf8"))));
  const result = await mergeReviewedPhotos(...manifests, { delayMs: config.delayMs });
  // Exclusive creation prevents replacing an old manifest, even through a symlink.
  if (config.output) await writeFile(config.output, JSON.stringify(result.manifest, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ dryRun: !config.output, output: config.output, ...result.report }, null, 2));
  return result;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
