import type { Currency } from "@/config/product";
import type { PortfolioItem, Sale } from "@/types/domain";

export function median(values: number[]): number | null {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function volumeWeightedPrice(
  sales: Array<{ price: number; quantity?: number }>,
): number | null {
  const totalQuantity = sales.reduce(
    (sum, sale) => sum + (sale.quantity ?? 1),
    0,
  );
  if (!totalQuantity) return null;
  return (
    sales.reduce((sum, sale) => sum + sale.price * (sale.quantity ?? 1), 0) /
    totalQuantity
  );
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  cnyRates: Record<Currency, number>,
): number {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid amount");
  return (amount * cnyRates[from]) / cnyRates[to];
}

export function detectOutliers(values: number[]): boolean[] {
  if (values.length < 4) return values.map(() => false);
  const sorted = [...values].sort((a, b) => a - b);
  const quantile = (percentile: number) => {
    const index = (sorted.length - 1) * percentile;
    const lower = Math.floor(index);
    const fraction = index - lower;
    return sorted[lower + 1] === undefined
      ? sorted[lower]
      : sorted[lower] + fraction * (sorted[lower + 1] - sorted[lower]);
  };
  const q1 = quantile(0.25);
  const q3 = quantile(0.75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return values.map((value) => value < lower || value > upper);
}

export function calculateMarketReference(sales: Sale[]) {
  const trusted = sales.filter((sale) => !sale.isBundle && !sale.isOutlier);
  const prices = trusted.map((sale) => sale.convertedCny);
  const midpoint = median(prices);
  if (prices.length < 3) {
    return {
      precise: false,
      median: midpoint,
      range: prices.length
        ? ([Math.min(...prices), Math.max(...prices)] as [number, number])
        : null,
      samples: prices.length,
    };
  }
  return {
    precise: true,
    median: midpoint,
    range: [Math.min(...prices), Math.max(...prices)] as [number, number],
    samples: prices.length,
  };
}

export function liquidityScore(input: {
  sales30d: number;
  listingsCount: number;
  daysSinceLastSale: number;
  volatility: number;
}) {
  const frequency = Math.min(input.sales30d / 20, 1) * 45;
  const availability = Math.min(input.listingsCount / 15, 1) * 20;
  const recency = Math.max(0, 1 - input.daysSinceLastSale / 30) * 25;
  const stability = Math.max(0, 1 - input.volatility / 100) * 10;
  return Math.round(
    Math.min(100, frequency + availability + recency + stability),
  );
}

export function portfolioItemValue(
  item: PortfolioItem,
  currentPriceCny: number | undefined,
) {
  const cost =
    item.purchasePrice * item.quantity +
    item.fees +
    item.shipping +
    item.tax +
    item.gradingCost;
  const current = (currentPriceCny ?? 0) * item.quantity;
  const profit = current - cost;
  return {
    cost,
    current,
    profit,
    profitRate: cost ? (profit / cost) * 100 : 0,
  };
}
