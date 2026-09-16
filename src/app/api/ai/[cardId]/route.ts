import { DeterministicDemoAI } from "@/lib/ai-analysis";
import { getCard, getPlayer } from "@/lib/demo-data";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchPlayerRecentPerformance } from "@/lib/providers";

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
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  let performance = null;
  if (!demoMode) {
    try {
      performance = await fetchPlayerRecentPerformance(player);
    } catch {
      return Response.json({ error: "No verified sports data available", source: process.env.SPORTSDATAIO_API_KEY ? "SportsDataIO" : "BallDontLie" }, { status: 503 });
    }
    if (!performance) return Response.json({ error: "No verified sports data available", source: process.env.SPORTSDATAIO_API_KEY ? "SportsDataIO" : "BallDontLie" }, { status: 404 });
  }
  const analysis = await new DeterministicDemoAI().analyze(card, player, "7-30d", performance);
  return Response.json(
    { data: analysis, mode: demoMode ? "deterministic-demo" : performance?.source ?? "unknown" },
    { headers: { "X-RateLimit-Remaining": String(rate.remaining) } },
  );
}
