import { NextResponse } from "next/server";

const fallbackRates = { CNY: 1, HKD: 1.09, USD: 0.14 } as const;

export async function GET() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/CNY", {
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`Exchange rate service returned ${response.status}`);
    const payload = (await response.json()) as { rates?: Record<string, number> };
    const rates = {
      CNY: 1,
      HKD: Number.isFinite(payload.rates?.HKD) ? payload.rates.HKD : fallbackRates.HKD,
      USD: Number.isFinite(payload.rates?.USD) ? payload.rates.USD : fallbackRates.USD,
    };
    return NextResponse.json(
      { base: "CNY", rates, fetchedAt: new Date().toISOString(), source: "live" },
      { headers: { "Cache-Control": "public, max-age=900, s-maxage=3600" } },
    );
  } catch {
    return NextResponse.json(
      { base: "CNY", rates: fallbackRates, fetchedAt: null, source: "fallback" },
      { headers: { "Cache-Control": "public, max-age=60" } },
    );
  }
}

