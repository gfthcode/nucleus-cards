import { z } from "zod";
import { fetchPlayerRecentPerformance } from "@/lib/providers";
import { fetchNBANews } from "@/lib/providers/nba-news";
import type { MomentumPlayerInput } from "@/lib/momentum-players";

const eventSchema = z.object({ id: z.string(), playerId: z.string(), teamId: z.string().optional(), type: z.string(), headline: z.string(), summary: z.string(), source: z.string(), sourceUrl: z.string().url(), publishedAt: z.string().nullable(), retrievedAt: z.string(), reliabilityTier: z.number().int().min(1).max(2), confidence: z.enum(["CONFIRMED", "REPORTED", "RUMOR", "UNKNOWN"]), impactDirection: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]), impactMagnitude: z.number().int().min(-100).max(100) });
export const momentumAnalysisSchema = z.object({
  playerId: z.string(), generatedAt: z.string(), momentumScore: z.number().min(0).max(100), momentumLabel: z.enum(["SURGING", "HEATING_UP", "POSITIVE", "NEUTRAL", "COOLING", "WEAK"]),
  momentumChange24h: z.number().nullable(), momentumChange7d: z.number().nullable(), momentumChange30d: z.number().nullable(), performanceScore: z.number(), opportunityScore: z.number(), roleChangeScore: z.number(), teamContextScore: z.number(), developmentScore: z.number(), newsMomentumScore: z.number(), availabilityScore: z.number(), attentionScore: z.number(), dataQualityScore: z.number().min(0).max(100), seasonMode: z.enum(["IN_SEASON", "OFFSEASON"]), recentPerformanceAvailable: z.boolean(), shortTermOutlook: z.enum(["STRONG_POSITIVE", "POSITIVE", "NEUTRAL", "NEGATIVE", "STRONG_NEGATIVE"]), mediumTermOutlook: z.enum(["STRONG_POSITIVE", "POSITIVE", "NEUTRAL", "NEGATIVE", "STRONG_NEGATIVE"]), marketAttentionOutlook: z.enum(["RISING_FAST", "RISING", "STABLE", "FALLING", "FALLING_FAST"]), summary: z.string(), catalysts: z.array(z.string()), risks: z.array(z.string()), events: z.array(eventSchema), evidence: z.array(z.string()), confidence: z.enum(["HIGH", "MEDIUM", "LOW"]), dataFreshness: z.string(), recentGames: z.number(), source: z.string(), sourceProvenance: z.object({ nba: z.string(), news: z.string(), statsUpdatedAt: z.string().nullable() }),
});
export type PlayerMomentumAnalysis = z.infer<typeof momentumAnalysisSchema>;

const avg = (rows: Array<{ points: number; rebounds: number; assists: number; minutes: number }>, key: "points" | "rebounds" | "assists" | "minutes") => rows.length ? rows.reduce((sum, row) => sum + row[key], 0) / rows.length : 0;
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
function label(score: number): PlayerMomentumAnalysis["momentumLabel"] { return score >= 85 ? "SURGING" : score >= 70 ? "HEATING_UP" : score >= 55 ? "POSITIVE" : score >= 45 ? "NEUTRAL" : score >= 30 ? "COOLING" : "WEAK"; }
function outlook(score: number): PlayerMomentumAnalysis["shortTermOutlook"] { return score >= 85 ? "STRONG_POSITIVE" : score >= 65 ? "POSITIVE" : score >= 45 ? "NEUTRAL" : score >= 30 ? "NEGATIVE" : "STRONG_NEGATIVE"; }

export async function buildPlayerMomentum(player: MomentumPlayerInput): Promise<PlayerMomentumAnalysis> {
  const [performance, news] = await Promise.all([fetchPlayerRecentPerformance(player), fetchNBANews(player)]);
  const recent = performance?.last10 ?? [];
  const last5 = performance?.last5 ?? [];
  const baseline = performance?.games.slice(10, 30) ?? [];
  const ppg = avg(last5, "points");
  const basePpg = avg(baseline, "points");
  const minutes = avg(last5, "minutes");
  const baseMinutes = avg(baseline, "minutes");
  const seasonMode: "IN_SEASON" | "OFFSEASON" = [4, 5, 6, 7, 8, 9].includes(new Date().getUTCMonth()) ? "OFFSEASON" : "IN_SEASON";
  const performanceScore = performance ? clamp(50 + (basePpg ? ((ppg - basePpg) / basePpg) * 80 : 0) + (baseMinutes ? ((minutes - baseMinutes) / baseMinutes) * (seasonMode === "IN_SEASON" ? 25 : 12) : 0)) : 45;
  const developmentScore = clamp(50 + (player.age == null ? 0 : player.age <= 24 ? 16 : player.age <= 28 ? 8 : 0));
  const availabilityScore = player.injuryStatus === "healthy" ? 82 : player.injuryStatus === "monitor" ? 55 : player.injuryStatus === "out" ? 25 : 50;
  const opportunityScore = clamp(50 + (baseMinutes ? (minutes - baseMinutes) * 2 : 0));
  const roleChangeScore = clamp(50 + (baseMinutes ? (minutes - baseMinutes) * 3 : 0));
  const teamContextScore = player.teamAbbreviation || player.currentTeamId ? 60 : 45;
  const now = Date.now();
  const newsMomentumScore = clamp(news.reduce((sum, event) => { const ageHours = event.publishedAt ? Math.max(0, (now - Date.parse(event.publishedAt)) / 3_600_000) : 720; const decay = ageHours <= 24 ? 1 : ageHours <= 72 ? 0.8 : ageHours <= 168 ? 0.55 : ageHours <= 720 ? 0.25 : 0.1; return sum + 18 * decay * event.reliabilityTier; }, 0));
  const attentionScore = clamp(newsMomentumScore * 0.45 + performanceScore * 0.35 + teamContextScore * 0.2);
  const momentumScore = clamp(performanceScore * 0.28 + opportunityScore * 0.16 + roleChangeScore * 0.14 + teamContextScore * 0.12 + developmentScore * 0.1 + newsMomentumScore * 0.1 + availabilityScore * 0.1);
  const dataQualityScore = clamp((performance ? 42 : 8) + (recent.length >= 5 ? 20 : recent.length ? 10 : 0) + (baseline.length >= 10 ? 15 : baseline.length ? 7 : 0) + (news.length ? 15 : 0) + (player.teamAbbreviation || player.currentTeamId ? 8 : 0));
  const evidence = [...(performance ? [`${performance.source} 最近 ${last5.length} 场：${ppg.toFixed(1)} PTS / ${avg(last5, "rebounds").toFixed(1)} REB / ${avg(last5, "assists").toFixed(1)} AST`, baseline.length ? `最近 ${recent.length} 场与可用基线完成对比` : "历史基线样本不足，未计算长期趋势"] : ["实时比赛日志不可用，未使用演示得分或出场时间"]), ...(news.length ? [`${news[0].source} 公开报道 ${news.length} 条：${news[0].headline}`] : ["暂无匹配的已验证公开报道"])];
  const catalysts = [performance && basePpg && ppg > basePpg * 1.08 ? "近期得分高于可用基线" : performance ? "近期比赛样本已接入" : "等待实时比赛样本", performance && baseMinutes && minutes > baseMinutes * 1.05 ? "出场时间出现扩张" : "角色变化暂无充分证据"];
  const risks = [!performance ? "实时比赛样本未接入" : baseline.length < 10 ? "长期基线样本有限" : "近期样本仍需持续观察", player.injuryStatus && player.injuryStatus !== "healthy" ? "健康状态需要持续核验" : "球队角色可能随轮换变化"];
  return momentumAnalysisSchema.parse({ playerId: player.id, generatedAt: new Date().toISOString(), momentumScore, momentumLabel: label(momentumScore), momentumChange24h: null, momentumChange7d: null, momentumChange30d: null, performanceScore, opportunityScore, roleChangeScore, teamContextScore, developmentScore, newsMomentumScore, availabilityScore, attentionScore, dataQualityScore, seasonMode, recentPerformanceAvailable: Boolean(performance && recent.length), shortTermOutlook: outlook(momentumScore), mediumTermOutlook: outlook((developmentScore + opportunityScore + teamContextScore) / 3), marketAttentionOutlook: momentumScore >= 75 ? "RISING" : momentumScore <= 40 ? "FALLING" : "STABLE", summary: `${player.displayNameZh} 当前球员关注度动量为 ${momentumScore}。该指标基于真实 NBA 表现、球队关系与公开报道，不是球星卡价格预测。`, catalysts, risks, events: news, evidence, confidence: dataQualityScore >= 75 ? "HIGH" : dataQualityScore >= 45 ? "MEDIUM" : "LOW", dataFreshness: performance?.fetchedAt ?? new Date().toISOString(), recentGames: recent.length, source: performance?.source ?? player.source, sourceProvenance: { nba: player.source, news: news.length ? "ESPN NBA RSS" : "ESPN NBA RSS (no match)", statsUpdatedAt: performance?.fetchedAt ?? null } });
}

export async function buildMomentumBoard(players: MomentumPlayerInput[], batchSize = 12) {
  const results: PlayerMomentumAnalysis[] = [];
  for (let i = 0; i < players.length; i += batchSize) {
    const settled = await Promise.allSettled(players.slice(i, i + batchSize).map((player) => buildPlayerMomentum(player)));
    results.push(...settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []));
  }
  return results.sort((a, b) => b.momentumScore - a.momentumScore);
}
