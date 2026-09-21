import { NextResponse } from "next/server";
import { generateDailyMomentumSnapshot } from "@/lib/momentum-snapshots";

export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await generateDailyMomentumSnapshot());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Snapshot failed" }, { status: 500 });
  }
}
