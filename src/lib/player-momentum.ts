import { z } from "zod";
import type { Player } from "@/types/domain";
import { fetchPlayerRecentPerformance } from "@/lib/providers";
import { fetchNBANews } from "@/lib/providers/nba-news";

const eventSchema = z.object({ id: z.string(), playerId: z.string(), teamId: z.string().optional(), type: z.string(), headline: z.string(), summary: z.string(), source: z.string(), sourceUrl: z.string().url(), publishedAt: z.string().nullable(), retrievedAt: z.string(), reliabilityTier: z.number().int().min(1).max(2), confidence: z.enum(["CONFIRMED", "REPORTED", "RUMOR", "UNKNOWN"]), impactDirection: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]), impactMagnitude: z.number().int().min(-100).max(100) });

export const momentumAnalysisSchema = z.object({
  playerId: z.string(), generatedAt: z.string(), momentumScore: z.number().min(0).max(100), momentumLabel: z.enum(["SURGING", "HEATING_UP", "POSITIVE", "NEUTRAL", "COOLING", "WEAK"]),
  momentumChange24h: z.number().nullable(), momentumChange7d: z.number().nullable(), momentumChange30d: z.number().nullable(), performanceScore: z.number(), opportunityScore: z.number(), roleChangeScore: z.number(), teamContextScore: z.number(), developmentScore: z.number(), newsMomentumScore: z.number(), availabilityScore: z.number(), attentionScore: z.number(), dataQualityScore: z.number().min(0).max(100), seasonMode: z.enum(["IN_SEASON", "OFFSEASON"]), recentPerformanceAvailable: z.boolean(), shortTermOutlook: z.enum(["STRONG_POSITIVE", "POSITIVE", "NEUTRAL", "NEGATIVE", "STRONG_NEGATIVE"]), mediumTermOutlook: z.enum(["STRONG_POSITIVE", "POSITIVE", "NEUTRAL", "NEGATIVE", "STRONG_NEGATIVE"]), marketAttentionOutlook: z.enum(["RISING_FAST", "RISING", "STABLE", "FALLING", "FALLING_FAST"]), summary: z.string(), catalysts: z.array(z.string()), risks: z.array(z.string()), events: z.array(eventSchema), evidence: z.array(z.string()), confidence: z.enum(["HIGH", "MEDIUM", "LOW"]), dataFreshness: z.string(), recentGames: z.number(), source: z.string(),
});
export type PlayerMomentumAnalysis = z.infer<typeof momentumAnalysisSchema>;

const avg = (rows: Array<{ points: number; rebounds: number; assists: number; minutes: number }>, key: "points" | "rebounds" | "assists" | "minutes") => rows.length ? rows.reduce((sum, row) => sum + row[key], 0) / rows.length : 0;
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
function label(score: number): PlayerMomentumAnalysis["momentumLabel"] { return score >= 85 ? "SURGING" : score >= 70 ? "HEATING_UP" : score >= 55 ? "POSITIVE" : score >= 45 ? "NEUTRAL" : score >= 30 ? "COOLING" : "WEAK"; }
function outlook(score: number): PlayerMomentumAnalysis["shortTermOutlook"] { return score >= 85 ? "STRONG_POSITIVE" : score >= 65 ? "POSITIVE" : score >= 45 ? "NEUTRAL" : score >= 30 ? "NEGATIVE" : "STRONG_NEGATIVE"; }

export async function buildPlayerMomentum(player: Player): Promise<PlayerMomentumAnalysis> {
  const performance = await fetchPlayerRecentPerformance(player);
  const news = await fetchNBANews(player);
  const recent = performance?.last10 ?? [];
  const last5 = performance?.last5 ?? [];
  const baseline = performance?.games.slice(10, 30) ?? [];
  const ppg = avg(last5, "points") || player.points;
  const basePpg = avg(baseline, "points") || player.points;
  const minutes = avg(last5, "minutes") || player.minutes;
  const baseMinutes = avg(baseline, "minutes") || player.minutes;
  const seasonMode: "IN_SEASON" | "OFFSEASON" = [4, 5, 6, 7, 8, 9].includes(new Date().getUTCMonth()) ? "OFFSEASON" : "IN_SEASON";
  const performanceScore = clamp(50 + ((ppg - basePpg) / Math.max(basePpg, 1)) * 80 + ((minutes - baseMinutes) / Math.max(baseMinutes, 1)) * (seasonMode === "IN_SEASON" ? 25 : 12));
  const developmentScore = clamp(58 + (player.age <= 24 ? 16 : player.age <= 28 ? 8 : 0) + Math.min(player.points, 30) * 0.4);
  const availabilityScore = player.injuryStatus === "healthy" ? 82 : player.injuryStatus === "monitor" ? 55 : 25;
  const opportunityScore = clamp(55 + (player.isTradeHot ? 8 : 0) + (player.isSigningHot ? 5 : 0) + (minutes - player.minutes) * 2);
  const roleChangeScore = clamp(50 + (minutes - baseMinutes) * 3);
  const teamContextScore = clamp(55 + (player.marketHeat - 50) * 0.35);
  const now = Date.now();
  const newsMomentumScore = clamp(news.reduce((sum, event) => {
    const ageHours = event.publishedAt ? Math.max(0, (now - Date.parse(event.publishedAt)) / 3_600_000) : 720;
    const decay = ageHours <= 24 ? 1 : ageHours <= 72 ? 0.8 : ageHours <= 168 ? 0.55 : ageHours <= 720 ? 0.25 : 0.1;
    return sum + 18 * decay * event.reliabilityTier;
  }, 0));
  const attentionScore = clamp(player.marketHeat * 0.55 + performanceScore * 0.25 + developmentScore * 0.2);
  const momentumScore = clamp(performanceScore * (seasonMode === "IN_SEASON" ? 0.25 : 0.17) + opportunityScore * (seasonMode === "IN_SEASON" ? 0.2 : 0.24) + roleChangeScore * 0.15 + teamContextScore * 0.1 + developmentScore * 0.1 + newsMomentumScore * (seasonMode === "IN_SEASON" ? 0.1 : 0.16) + availabilityScore * 0.1 + attentionScore * (seasonMode === "IN_SEASON" ? 0 : 0.08));
  const dataQualityScore = clamp((performance ? 42 : 8) + (recent.length >= 5 ? 20 : recent.length ? 10 : 0) + (baseline.length >= 10 ? 15 : baseline.length ? 7 : 0) + (news.length ? 15 : 0) + (player.injuryStatus === "healthy" ? 8 : 3));
  const evidence = [...(performance ? [`${performance.source} 最近 ${last5.length} 场：${ppg.toFixed(1)} PTS / ${avg(last5, "rebounds").toFixed(1)} REB / ${avg(last5, "assists").toFixed(1)} AST`, `最近 ${recent.length} 场与可用基线完成对比`] : ["暂无授权的实时比赛日志，暂以球员目录基线计算"]), ...(news.length ? [`ESPN NBA 公开报道 ${news.length} 条：${news[0].headline}`] : ["暂无匹配的 ESPN NBA 公开报道"])];
  const catalysts = [ppg > basePpg * 1.08 ? "近期得分高于可用基线" : "核心球员稳定贡献", minutes > baseMinutes * 1.05 ? "出场时间出现扩张" : "角色变化暂无充分证据"].filter(Boolean);
  const risks = [!performance ? "实时比赛样本未接入" : "近期样本仍有限", player.injuryStatus !== "healthy" ? "健康状态需要持续核验" : "球队角色可能随轮换变化" ];
  return momentumAnalysisSchema.parse({ playerId: player.id, generatedAt: new Date().toISOString(), momentumScore, momentumLabel: label(momentumScore), momentumChange24h: null, momentumChange7d: null, momentumChange30d: null, performanceScore, opportunityScore, roleChangeScore, teamContextScore, developmentScore, newsMomentumScore, availabilityScore, attentionScore, dataQualityScore, seasonMode, recentPerformanceAvailable: Boolean(performance && recent.length), shortTermOutlook: outlook(momentumScore), mediumTermOutlook: outlook((developmentScore + opportunityScore + teamContextScore) / 3), marketAttentionOutlook: momentumScore >= 75 ? "RISING" : momentumScore <= 40 ? "FALLING" : "STABLE", summary: `${player.displayNameZh} 当前球员关注度动量为 ${momentumScore}。该指标基于 NBA 表现、角色与球队环境，不是球星卡价格预测。`, catalysts, risks, events: news, evidence, confidence: dataQualityScore >= 75 ? "HIGH" : dataQualityScore >= 45 ? "MEDIUM" : "LOW", dataFreshness: performance?.fetchedAt ?? "目录基线", recentGames: recent.length, source: performance?.source ?? "NBA roster baseline" });
}

export async function buildMomentumBoard(players: Player[]) {
  const results = await Promise.all(players.map((player) => buildPlayerMomentum(player)));
  return results.sort((a, b) => b.momentumScore - a.momentumScore);
}
