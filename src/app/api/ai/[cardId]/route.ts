import { DeterministicDemoAI } from "@/lib/ai-analysis";
import { getCard, getPlayer } from "@/lib/demo-data";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  context: RouteContext<"/api/ai/[cardId]">,
) {
  const rate = checkRateLimit(
    request.headers.get("x-forwarded-for") ?? "demo-ai",
    20,
  );
  if (!rate.allowed)
    return Response.json(
      { error: "请求过于频繁" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  const { cardId } = await context.params;
  const card = getCard(cardId);
  const player = card ? getPlayer(card.playerId) : undefined;
  if (!card || !player)
    return Response.json({ error: "卡片不存在" }, { status: 404 });
  const analysis = await new DeterministicDemoAI().analyze(
    card,
    player,
    "7-30d",
  );
  return Response.json(
    { data: analysis, mode: "deterministic-demo" },
    { headers: { "X-RateLimit-Remaining": String(rate.remaining) } },
  );
}
