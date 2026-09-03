import type { AuctionEvent, Card, Player, Sale } from "@/types/domain";
import { getCardImage } from "@/lib/card-images";

export interface PlayerCardMarketRow {
  player: Player;
  totalCards: number;
  verifiedCards: number;
  rookieCards: number;
  sales30d: number;
  activeAuctions: number;
  cardHeat: number | null;
  auctionHeat: number | null;
  change7d: number | null;
  change30d: number | null;
  hasEnoughPriceData: boolean;
}

export interface TeamCardCoverage {
  currentPlayers: number;
  playerMatch: number;
  playersWithCards: number;
  totalCards: number;
  verifiedCardCoverage: number | null;
  imageCoverage: number | null;
  marketDataCoverage: number | null;
  auctionCoverage: number | null;
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function getPlayerCardMarketRows(
  roster: Player[],
  cards: Card[],
  sales: Sale[],
  auctions: AuctionEvent[],
) {
  return roster
    .map((player): PlayerCardMarketRow => {
      const playerCards = cards.filter((card) => card.playerId === player.id);
      const verifiedCards = playerCards.filter((card) => card.matchConfidence >= 85);
      const rookieCards = playerCards.filter((card) => card.rookie);
      const playerSales = sales.filter(
        (sale) =>
          playerCards.some((card) => card.id === sale.cardId) &&
          sale.verified &&
          !sale.isOutlier,
      );
      const playerAuctions = auctions.filter((auction) => auction.playerId === player.id);
      const heatInputs = [
        Math.min(playerSales.length * 8, 32),
        average(playerCards.map((card) => card.liquidity * 0.25)) ?? 0,
        Math.min(playerAuctions.length * 8, 24),
        (average(playerAuctions.map((auction) => auction.heatScore)) ?? 0) * 0.35,
      ];
      const cardHeat = playerCards.length ? Math.min(100, Math.round(heatInputs.reduce((sum, value) => sum + value, 0))) : null;
      const auctionHeat = playerAuctions.length
        ? Math.round(average(playerAuctions.map((auction) => auction.heatScore)) ?? 0)
        : null;
      const changes7d = playerCards.map((card) => card.change7d).filter((value): value is number => typeof value === "number");
      const changes30d = playerCards.map((card) => card.change30d).filter((value): value is number => typeof value === "number");
      return {
        player,
        totalCards: playerCards.length,
        verifiedCards: verifiedCards.length,
        rookieCards: rookieCards.length,
        sales30d: playerSales.length,
        activeAuctions: playerAuctions.length,
        cardHeat,
        auctionHeat,
        change7d: playerSales.length >= 3 ? average(changes7d) : null,
        change30d: playerSales.length >= 3 ? average(changes30d) : null,
        hasEnoughPriceData: playerSales.length >= 3,
      };
    })
    .sort((a, b) => (b.cardHeat ?? -1) - (a.cardHeat ?? -1));
}

export function getTeamCardCoverage(
  roster: Player[],
  cards: Card[],
  auctions: AuctionEvent[],
): TeamCardCoverage {
  const rosterIds = new Set(roster.map((player) => player.id));
  const teamCards = cards.filter((card) => rosterIds.has(card.playerId));
  const playersWithCards = new Set(teamCards.map((card) => card.playerId));
  const verifiedCards = teamCards.filter((card) => card.matchConfidence >= 85);
  const cardsWithImage = teamCards.filter((card) => getCardImage(card).imageType !== "placeholder");
  const cardsWithMarketData = teamCards.filter((card) => card.sales30d > 0 || typeof card.latestSaleCny === "number");
  const playersWithAuctions = new Set(auctions.filter((auction) => rosterIds.has(auction.playerId)).map((auction) => auction.playerId));
  return {
    currentPlayers: roster.length,
    playerMatch: roster.length,
    playersWithCards: playersWithCards.size,
    totalCards: teamCards.length,
    verifiedCardCoverage: teamCards.length ? Math.round((verifiedCards.length / teamCards.length) * 100) : null,
    imageCoverage: teamCards.length ? Math.round((cardsWithImage.length / teamCards.length) * 100) : null,
    marketDataCoverage: teamCards.length ? Math.round((cardsWithMarketData.length / teamCards.length) * 100) : null,
    auctionCoverage: roster.length ? Math.round((playersWithAuctions.size / roster.length) * 100) : null,
  };
}

export function getTeamTopCards(roster: Player[], cards: Card[], limit = 6) {
  const rosterIds = new Set(roster.map((player) => player.id));
  return cards
    .filter((card) => rosterIds.has(card.playerId))
    .sort((a, b) => {
      const activityA = a.sales30d * 4 + a.liquidity + (a.listingsCount * 0.5);
      const activityB = b.sales30d * 4 + b.liquidity + (b.listingsCount * 0.5);
      return activityB - activityA;
    })
    .slice(0, limit);
}

export function getTeamRecentSales(roster: Player[], cards: Card[], sales: Sale[], limit = 8) {
  const rosterIds = new Set(roster.map((player) => player.id));
  const cardIds = new Set(cards.filter((card) => rosterIds.has(card.playerId)).map((card) => card.id));
  return sales
    .filter((sale) => cardIds.has(sale.cardId) && sale.verified && !sale.isOutlier)
    .sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime())
    .slice(0, limit);
}

export function get30dMedianSale(cardId: string, sales: Sale[]) {
  return median(
    sales
      .filter((sale) => sale.cardId === cardId && sale.verified && !sale.isOutlier)
      .map((sale) => sale.convertedCny),
  );
}
