import { NextResponse } from "next/server";
import { getEbayHealth } from "@/lib/providers/ebay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getEbayHealth(), {
    headers: { "Cache-Control": "no-store" },
  });
}
