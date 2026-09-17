import type { TradingCardIdentity } from "@/lib/providers/ebay";

const REJECT_TERMS = /\b(pack|box|blaster|hobby box|sealed|break\s*spot|team\s*break|repacks?|lot|lots|multi[- ]?card|multi[- ]?player|digital| nft|photo|poster|jersey|uniform|custom|reprint|proxy)\b/i;

export function isLikelySingleTradingCard(title: string) { return !REJECT_TERMS.test(title); }

export function canonicalCardIdentityKey(playerId: string, identity: Pick<TradingCardIdentity, "year" | "brand" | "setName" | "cardNumber" | "parallel" | "gradingCompany" | "grade" | "rawOrGraded">) {
  if (!identity.year || !identity.brand || !identity.setName || !identity.cardNumber) return null;
  const part = (value: string | number | boolean | null | undefined) => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, "_");
  return [playerId, identity.year, identity.brand, identity.setName, identity.cardNumber, identity.parallel, identity.gradingCompany, identity.grade, identity.rawOrGraded].map(part).join("|");
}

