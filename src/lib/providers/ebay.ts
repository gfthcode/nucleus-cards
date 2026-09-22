import "server-only";
import type { MarketObservationType } from "@/lib/market-observation";

export type EbayObservationType = Extract<MarketObservationType, "ACTIVE_FIXED_PRICE" | "LIVE_AUCTION_CURRENT_BID">;
export type EbayErrorCategory = "EBAY_CREDENTIALS_NOT_CONFIGURED" | "EBAY_TOKEN_401" | "EBAY_TOKEN_403" | "EBAY_BROWSE_401" | "EBAY_BROWSE_403" | "EBAY_RATE_LIMIT_429" | "EBAY_EMPTY_RESULTS" | "EBAY_TIMEOUT" | "EBAY_NETWORK_ERROR" | "EBAY_SCHEMA_ERROR";

export type TradingCardIdentity = {
  playerName: string;
  year: number | null;
  manufacturer: string | null;
  setName: string | null;
  cardNumber: string | null;
  parallel: string | null;
  rookieDesignation: boolean | null;
  autograph: boolean | null;
  memorabilia: boolean | null;
  serialNumber: string | null;
  gradingCompany: string | null;
  grade: number | null;
  identityConfidence: "HIGH" | "MEDIUM" | "LOW";
  season: string | null;
  brand: string | null;
  printRun: number | null;
  rawOrGraded: "RAW" | "GRADED";
};

export type MarketObservation = {
  source: "eBay";
  sourceItemId: string;
  sourceUrl: string;
  title: string;
  cardIdentity: TradingCardIdentity;
  observationType: EbayObservationType;
  currency: string | null;
  askingPrice: number | null;
  currentBid: number | null;
  buyNowPrice: number | null;
  listingStart: string | null;
  auctionEnd: string | null;
  retrievedAt: string;
  sourceVerified: true;
};

type EbayItem = {
  itemId?: string;
  title?: string;
  itemWebUrl?: string;
  buyingOptions?: string[];
  price?: { value?: string; currency?: string };
  currentBidPrice?: { value?: string; currency?: string };
  itemEndDate?: string;
  itemCreationDate?: string;
  image?: { imageUrl?: string };
  condition?: string;
};

const API = "https://api.ebay.com";
const MARKETPLACE = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";

const tokenCache = new Map<string, { value: string; expiresAt: number }>();
function credentials() {
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("EBAY_CREDENTIALS_NOT_CONFIGURED");
  return { id, secret };
}

async function getApplicationToken(): Promise<string> {
  const { id, secret } = credentials();
  const cached = tokenCache.get(id);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.value;
  const response = await fetchWithTimeout(`${API}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(response.status === 401 ? "EBAY_TOKEN_401" : response.status === 403 ? "EBAY_TOKEN_403" : `EBAY_TOKEN_${response.status}`);
  const json = await response.json() as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("EBAY_SCHEMA_ERROR");
  tokenCache.set(id, { value: json.access_token, expiresAt: Date.now() + Math.max(60, json.expires_in ?? 7200) * 1000 });
  return json.access_token;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 9_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  catch (error) { if (error instanceof DOMException && error.name === "AbortError") throw new Error("EBAY_TIMEOUT"); throw new Error("EBAY_NETWORK_ERROR"); }
  finally { clearTimeout(timer); }
}

async function browseFetch(path: string, token: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetchWithTimeout(`${API}${path}`, { headers: { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": MARKETPLACE }, cache: "no-store" });
    if (response.status !== 429) {
      if (!response.ok) throw new Error(response.status === 401 ? "EBAY_BROWSE_401" : response.status === 403 ? "EBAY_BROWSE_403" : `EBAY_BROWSE_${response.status}`);
      return response;
    }
    const retryAfter = Math.min(2_000, Math.max(250, Number(response.headers.get("retry-after") ?? 0) * 1000 || 500));
    await new Promise((resolve) => setTimeout(resolve, retryAfter));
  }
  throw new Error("EBAY_RATE_LIMIT_429");
}

function numberOrNull(value?: string) {
  const number = value === undefined ? NaN : Number(value);
  return Number.isFinite(number) ? number : null;
}

const BRANDS = ["Prizm", "Select", "Donruss", "Optic", "Mosaic", "Hoops", "Chronicles", "Contenders", "Origins", "Recon", "Obsidian", "Revolution", "Court Kings", "National Treasures", "Immaculate", "Flawless", "Topps Chrome", "Topps", "Bowman Chrome", "Bowman", "Fleer", "SkyBox", "SP Authentic", "Exquisite"];
const PARALLELS = ["Cracked Ice", "Fast Break", "Tie-Dye", "Refractor", "Genesis", "Velocity", "Disco", "Silver", "Holo", "Green", "Red", "Blue", "Purple", "Orange", "Gold", "Black", "White", "Ice", "Wave", "Pulsar", "Scope", "Zebra", "Elephant", "Base"];

export function parseTradingCardTitle(title: string, targetPlayerName?: string): TradingCardIdentity {
  const year = title.match(/\b(19\d{2}|20\d{2})(?:[-/](?:\d{2,4}))?\b/)?.[1];
  const season = title.match(/\b((?:19|20)\d{2}\s*[-/]\s*(?:\d{2}|(?:19|20)\d{2}))\b/)?.[1]?.replace(/\s+/g, "") ?? null;
  const number = title.match(/(?:#|no\.?|card\s*#?)\s*([A-Za-z0-9-]+)/i)?.[1] ?? null;
  const gradeMatch = title.match(/\b(PSA|BGS|SGC|CGC)\s*([0-9]+(?:\.5)?)\b/i);
  const brand = BRANDS.find((value) => new RegExp(`\\b${value.replace(/ /g, "\\s+")}\\b`, "i").test(title)) ?? null;
  const parallel = PARALLELS.find((value) => new RegExp(`\\b${value.replace(/ /g, "\\s+")}\\b`, "i").test(title)) ?? null;
  const exactPlayer = targetPlayerName ? normalizeName(title).includes(normalizeName(targetPlayerName)) : true;
  const confidence = exactPlayer && year && number && brand ? "HIGH" : exactPlayer && (year || number || brand) ? "MEDIUM" : "LOW";
  const printRun = title.match(/\/(\d{1,4})\b/)?.[1];
  return {
    playerName: targetPlayerName ?? title,
    year: year ? Number(year) : null,
    manufacturer: /panini/i.test(title) ? "Panini" : /topps/i.test(title) ? "Topps" : /upper\s*deck|fleer|skybox|sp authentic|exquisite/i.test(title) ? "Upper Deck" : null,
    setName: brand,
    cardNumber: number,
    parallel,
    rookieDesignation: /\b(RC|rookie)\b/i.test(title) ? true : null,
    autograph: /\b(auto|autograph)\b/i.test(title) ? true : null,
    memorabilia: /\b(patch|relic|memorabilia)\b/i.test(title) ? true : null,
    serialNumber: title.match(/\/(\d{1,4})\b/)?.[1] ?? null,
    gradingCompany: gradeMatch?.[1]?.toUpperCase() ?? null,
    grade: gradeMatch ? Number(gradeMatch[2]) : null,
    season,
    brand,
    printRun: printRun ? Number(printRun) : null,
    rawOrGraded: gradeMatch ? "GRADED" : "RAW",
    identityConfidence: confidence,
  };
}

function normalizeName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function matchesTargetPlayer(title: string, playerName: string) {
  const listing = normalizeName(title);
  const target = normalizeName(playerName);
  return Boolean(target) && listing.includes(target);
}

function normalizeItem(item: EbayItem, retrievedAt: string): MarketObservation | null {
  if (!item.itemId || !item.title || !item.itemWebUrl) return null;
  const auction = item.buyingOptions?.includes("AUCTION") === true;
  const price = auction ? item.currentBidPrice : item.price;
  return {
    source: "eBay",
    sourceItemId: item.itemId,
    sourceUrl: item.itemWebUrl,
    title: item.title,
    cardIdentity: parseTradingCardTitle(item.title),
    observationType: auction ? "LIVE_AUCTION_CURRENT_BID" : "ACTIVE_FIXED_PRICE",
    currency: price?.currency ?? null,
    askingPrice: auction ? null : numberOrNull(price?.value),
    currentBid: auction ? numberOrNull(price?.value) : null,
    buyNowPrice: auction ? null : numberOrNull(price?.value),
    listingStart: item.itemCreationDate ?? null,
    auctionEnd: auction ? item.itemEndDate ?? null : null,
    retrievedAt,
    sourceVerified: true,
  };
}

export type MarketTier = "S" | "A" | "B" | "C";

export function generateEbayCardQueries(playerName: string, tier: MarketTier = "S") {
  const base = [
    `${playerName} basketball card`, `${playerName} rookie card`, `${playerName} Panini`, `${playerName} Prizm`,
    `${playerName} Select`, `${playerName} Optic`, `${playerName} Mosaic`, `${playerName} PSA 10`,
    `${playerName} autograph`, `${playerName} numbered`, `${playerName} rookie PSA 10`,
  ];
  const budget: Record<MarketTier, number> = { S: 8, A: 6, B: 4, C: 3 };
  return base.slice(0, budget[tier]);
}

export async function searchEbayMarket(playerName: string, limit = 50, tier: MarketTier = "S") {
  const token = await getApplicationToken();
  const retrievedAt = new Date().toISOString();
  const unique = new Map<string, MarketObservation>();
  for (const query of generateEbayCardQueries(playerName, tier)) {
    const params = new URLSearchParams({ q: query, limit: String(Math.min(limit, 200)), fieldgroups: "EXTENDED" });
    const response = await browseFetch(`/buy/browse/v1/item_summary/search?${params}`, token);
    const json = await response.json() as { itemSummaries?: EbayItem[] };
    for (const item of json.itemSummaries ?? []) {
      const observation = normalizeItem(item, retrievedAt);
      if (observation) unique.set(observation.sourceItemId, observation);
    }
  }
  return [...unique.values()];
}

export type SearchActiveEbayListingsInput = { playerName: string; year?: number; brand?: string; setName?: string; cardNumber?: string; parallel?: string; gradingCompany?: string; grade?: number; limit?: number; marketplace?: string };
export async function searchActiveEbayListings(input: SearchActiveEbayListingsInput) {
  const terms = [input.playerName, input.year, input.brand, input.setName, input.cardNumber && `#${input.cardNumber}`, input.parallel, input.gradingCompany, input.grade].filter(Boolean).join(" ");
  const token = await getApplicationToken();
  const params = new URLSearchParams({ q: terms, limit: String(Math.min(Math.max(input.limit ?? 50, 1), 200)), fieldgroups: "EXTENDED" });
  const response = await browseFetch(`/buy/browse/v1/item_summary/search?${params}`, token);
  const json = await response.json() as { itemSummaries?: EbayItem[] };
  const rows = (json.itemSummaries ?? []).map((item) => normalizeItem(item, new Date().toISOString())).filter((item): item is MarketObservation => Boolean(item));
  if (!rows.length) throw new Error("EBAY_EMPTY_RESULTS");
  return rows;
}

export async function inspectEbayItem(sourceItemId: string) {
  if (!sourceItemId) throw new Error("EBAY_SCHEMA_ERROR");
  const token = await getApplicationToken();
  const response = await browseFetch(`/buy/browse/v1/item/${encodeURIComponent(sourceItemId)}`, token);
  const item = await response.json() as EbayItem;
  const normalized = normalizeItem(item, new Date().toISOString());
  if (!normalized) throw new Error("EBAY_SCHEMA_ERROR");
  return { ...normalized, marketplace: MARKETPLACE, imageUrl: item.image?.imageUrl ?? null, condition: item.condition ?? null, listingStatus: "active" as const };
}

export async function getEbayHealth() {
  const configured = Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
  if (!configured) return { configured: false, tokenWorking: false, browseApiWorking: false, marketplace: MARKETPLACE, lastSuccessfulFetch: null, lastErrorType: "CREDENTIALS_NOT_CONFIGURED" as const };
  try {
    const token = await getApplicationToken();
    const params = new URLSearchParams({ q: "Victor Wembanyama basketball card", limit: "1", fieldgroups: "EXTENDED" });
    const response = await browseFetch(`/buy/browse/v1/item_summary/search?${params}`, token);
    const json = await response.json() as { itemSummaries?: EbayItem[] };
    const item = json.itemSummaries?.[0];
    if (!item?.itemId || !item.title || !item.itemWebUrl) throw new Error("EMPTY_RESULTS");
    return { configured: true, tokenWorking: true, browseApiWorking: true, marketplace: MARKETPLACE, lastSuccessfulFetch: new Date().toISOString(), lastErrorType: null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "OTHER";
    const lastErrorType: EbayErrorCategory = reason === "EBAY_CREDENTIALS_NOT_CONFIGURED" ? "EBAY_CREDENTIALS_NOT_CONFIGURED" : reason.includes("TOKEN_401") ? "EBAY_TOKEN_401" : reason.includes("TOKEN_403") ? "EBAY_TOKEN_403" : reason.includes("BROWSE_401") ? "EBAY_BROWSE_401" : reason.includes("BROWSE_403") ? "EBAY_BROWSE_403" : reason.includes("429") ? "EBAY_RATE_LIMIT_429" : reason.includes("TIMEOUT") ? "EBAY_TIMEOUT" : reason.includes("SCHEMA") || reason.includes("EMPTY") ? "EBAY_SCHEMA_ERROR" : "EBAY_NETWORK_ERROR";
    return { configured: true, tokenWorking: !reason.startsWith("EBAY_TOKEN_"), browseApiWorking: false, marketplace: MARKETPLACE, lastSuccessfulFetch: null, lastErrorType };
  }
}
