import "server-only";

export type EbayObservationType = "ACTIVE_FIXED_PRICE" | "LIVE_AUCTION_CURRENT_BID";

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
};

const API = "https://api.ebay.com";
const MARKETPLACE = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";

function credentials() {
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("EBAY_CREDENTIALS_NOT_CONFIGURED");
  return { id, secret };
}

async function getApplicationToken(): Promise<string> {
  const { id, secret } = credentials();
  const response = await fetch(`${API}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`EBAY_TOKEN_${response.status}`);
  const json = await response.json() as { access_token?: string };
  if (!json.access_token) throw new Error("EBAY_TOKEN_EMPTY");
  return json.access_token;
}

function numberOrNull(value?: string) {
  const number = value === undefined ? NaN : Number(value);
  return Number.isFinite(number) ? number : null;
}

function identityFromTitle(title: string): TradingCardIdentity {
  const year = title.match(/\b(19\d{2}|20\d{2})(?:[-/](?:\d{2,4}))?\b/)?.[1];
  const number = title.match(/(?:#|card\s*#?)\s*([A-Za-z0-9-]+)/i)?.[1] ?? null;
  const gradeMatch = title.match(/\b(PSA|BGS|SGC|CGC)\s*([0-9]+(?:\.5)?)\b/i);
  const confidence = year && number ? "MEDIUM" : "LOW";
  return {
    playerName: title,
    year: year ? Number(year) : null,
    manufacturer: /panini/i.test(title) ? "Panini" : /topps/i.test(title) ? "Topps" : null,
    setName: /prizm/i.test(title) ? "Prizm" : /chrome/i.test(title) ? "Chrome" : null,
    cardNumber: number,
    parallel: /silver/i.test(title) ? "Silver" : /refractor/i.test(title) ? "Refractor" : null,
    rookieDesignation: /\b(RC|rookie)\b/i.test(title) ? true : null,
    autograph: /\b(auto|autograph)\b/i.test(title) ? true : null,
    memorabilia: /\b(patch|relic|memorabilia)\b/i.test(title) ? true : null,
    serialNumber: title.match(/\/(\d{1,4})\b/)?.[1] ?? null,
    gradingCompany: gradeMatch?.[1]?.toUpperCase() ?? null,
    grade: gradeMatch ? Number(gradeMatch[2]) : null,
    identityConfidence: confidence,
  };
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
    cardIdentity: identityFromTitle(item.title),
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

export function generateEbayCardQueries(playerName: string) {
  return [`${playerName} rookie card`, `${playerName} Prizm`, `${playerName} PSA 10`, `${playerName} autograph`, `${playerName} numbered`];
}

export async function searchEbayMarket(playerName: string, limit = 50) {
  const token = await getApplicationToken();
  const retrievedAt = new Date().toISOString();
  const unique = new Map<string, MarketObservation>();
  for (const query of generateEbayCardQueries(playerName)) {
    const params = new URLSearchParams({ q: query, limit: String(Math.min(limit, 200)), fieldgroups: "EXTENDED" });
    const response = await fetch(`${API}/buy/browse/v1/item_summary/search?${params}`, {
      headers: { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": MARKETPLACE },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`EBAY_BROWSE_${response.status}`);
    const json = await response.json() as { itemSummaries?: EbayItem[] };
    for (const item of json.itemSummaries ?? []) {
      const observation = normalizeItem(item, retrievedAt);
      if (observation) unique.set(observation.sourceItemId, observation);
    }
  }
  return [...unique.values()];
}

export async function getEbayHealth() {
  const configured = Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
  if (!configured) return { configured: false, tokenWorking: false, browseApiWorking: false, marketplace: MARKETPLACE };
  try {
    await getApplicationToken();
    return { configured: true, tokenWorking: true, browseApiWorking: null, marketplace: MARKETPLACE };
  } catch {
    return { configured: true, tokenWorking: false, browseApiWorking: false, marketplace: MARKETPLACE };
  }
}
