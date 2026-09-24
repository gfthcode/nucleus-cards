type CardPricerCard = {
  id?: string;
  player?: string;
  year?: number | string;
  set?: string;
  cardNumber?: string;
  manufacturer?: string;
  imageUrl?: string;
  price?: number;
  lastSold?: string;
  grade?: string;
};

export type CardPricerImageMatch = {
  imageUrl: string;
  sourceUrl: string;
  title: string;
  matchType: "exact" | "year-player";
  metadata: { year?: number; set?: string; cardNumber?: string; grade?: string; price?: number };
};

const API_URL = "https://cardpricer.co/api/v1/cards";

function normalize(value: string | undefined | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(basketball|card|cards)\b/g, " ")
    .replace(/\bvw\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 2));
}

function playerMatches(target: string, candidate: string | undefined) {
  const wanted = normalize(target);
  const found = normalize(candidate);
  return Boolean(wanted && found && (found.includes(wanted) || wanted.includes(found)));
}

function setScore(requested: string, candidate: string) {
  const wanted = tokens(requested);
  const found = tokens(candidate);
  let score = 0;
  for (const token of wanted) if (found.has(token)) score += 1;
  return score;
}

export async function searchCardPricerImage(input: {
  playerName: string;
  year?: number;
  brand?: string;
  setName?: string;
  cardNumber?: string;
}): Promise<CardPricerImageMatch | null> {
  const params = new URLSearchParams({ sport: "basketball", q: input.playerName, limit: "25" });
  if (input.year) params.set("year", String(input.year));
  const response = await fetch(`${API_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 900 },
  });
  if (!response.ok) return null;
  const payload = await response.json() as { cards?: CardPricerCard[] } | CardPricerCard[];
  const cards = Array.isArray(payload) ? payload : payload.cards ?? [];
  const targetYear = input.year;
  const candidates = cards.filter((card) => {
    const year = Number(card.year);
    return Boolean(card.imageUrl && playerMatches(input.playerName, card.player) && (!targetYear || year === targetYear));
  });
  if (!candidates.length) return null;
  const requestedSet = `${input.brand ?? ""} ${input.setName ?? ""}`;
  const requestedNumber = normalize(input.cardNumber);
  const ranked = candidates
    .map((card) => {
      const numberMatch = requestedNumber && normalize(card.cardNumber) === requestedNumber ? 4 : 0;
      const overlap = setScore(requestedSet, `${card.manufacturer ?? ""} ${card.set ?? ""}`);
      return { card, score: numberMatch + overlap * 2 };
    })
    .sort((a, b) => b.score - a.score)[0]?.card;
  if (!ranked?.imageUrl) return null;
  const exact = Boolean((requestedNumber && normalize(ranked.cardNumber) === requestedNumber) || setScore(requestedSet, ranked.set ?? "") > 0);
  return {
    imageUrl: ranked.imageUrl,
    sourceUrl: "https://cardpricer.co",
    title: `${ranked.year ?? ""} ${ranked.set ?? ""} ${ranked.player ?? input.playerName}`.trim(),
    matchType: exact ? "exact" : "year-player",
    metadata: { year: Number(ranked.year) || undefined, set: ranked.set, cardNumber: ranked.cardNumber, grade: ranked.grade, price: ranked.price },
  };
}
