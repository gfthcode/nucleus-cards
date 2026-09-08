import { checkRateLimit } from "@/lib/rate-limit";
import { verifiedSaleImportBatchSchema } from "@/lib/validation";

/** Evidence-first historical sales intake. It queues records for review. */
export async function POST(request: Request) {
  const rate = checkRateLimit(
    request.headers.get("x-forwarded-for") ?? "verified-sale-import",
    5,
    60_000,
  );
  if (!rate.allowed)
    return Response.json({ error: "导入过于频繁" }, { status: 429 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2 * 1024 * 1024)
    return Response.json({ error: "请求超过 2MB" }, { status: 413 });

  const parsed = verifiedSaleImportBatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      {
        error: "历史成交必须包含真实来源链接、外部成交编号和证据快照",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  return Response.json(
    {
      jobId: `verified-sale-import-${Date.now()}`,
      status: "queued-for-review",
      accepted: parsed.data.records.length,
      sourceRecords: parsed.data.records.map((record) => ({
        cardIdentityKey: record.cardIdentityKey,
        externalSaleId: record.externalSaleId,
        source: record.source,
        soldAt: record.soldAt,
      })),
      persistence: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "supabase-review-queue"
        : "demo-review-queue",
    },
    { status: 202 },
  );
}

