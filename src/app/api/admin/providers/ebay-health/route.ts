import { NextResponse } from "next/server";
import { getEbayHealth } from "@/lib/providers/ebay";

export async function GET() {
  return NextResponse.json(await getEbayHealth());
}
