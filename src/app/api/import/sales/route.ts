import { saleImportBatchSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(
    request.headers.get("x-forwarded-for") ?? "demo-import",
    5,
    60_000,
  );
  if (!rate.allowed)
    return Response.json({ error: "导入过于频繁" }, { status: 429 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2 * 1024 * 1024)
    return Response.json({ error: "请求超过 2MB" }, { status: 413 });
  const parsed = saleImportBatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: "数据校验失败", issues: parsed.error.issues },
      { status: 400 },
    );
  return Response.json(
    {
      jobId: `demo-import-${Date.now()}`,
      status: "queued-for-review",
      accepted: parsed.data.records.length,
      mode: "demo",
    },
    { status: 202 },
  );
}
