import { z } from "zod";
import { productConfig } from "@/config/product";
import type { Card, Player } from "@/types/domain";
import type { PlayerRecentPerformance } from "@/lib/providers/balldontlie";

export const aiAnalysisSchema = z.object({
  analysisPeriod: z.enum(["7-30d", "1-3m"]),
  playerCohort: z.enum([
    "core_rookie",
    "recent_rookie",
    "young_core",
    "prime",
    "veteran",
    "retired_legend",
  ]),
  peerComparison: z.string().min(1),
  trendDirection: z.enum(["up", "neutral", "down"]),
  upwardProbabilityRange: z.tuple([
    z.number().min(0).max(100),
    z.number().min(0).max(100),
  ]),
  neutralProbabilityRange: z.tuple([
    z.number().min(0).max(100),
    z.number().min(0).max(100),
  ]),
  downwardProbabilityRange: z.tuple([
    z.number().min(0).max(100),
    z.number().min(0).max(100),
  ]),
  confidenceLevel: z.enum(["low", "medium", "high"]),
  dataCompleteness: z.number().min(0).max(100),
  keyPositiveFactors: z.array(z.string()),
  keyNegativeFactors: z.array(z.string()),
  injuryFactors: z.array(z.string()),
  liquidityFactors: z.array(z.string()),
  marketHeatFactors: z.array(z.string()),
  invalidationEvents: z.array(z.string()),
  evidence: z.array(
    z.object({ label: z.string(), source: z.string(), updatedAt: z.string() }),
  ),
  disclaimer: z.string(),
  generatedAt: z.string(),
  modelVersion: z.string(),
  recentPerformance: z.object({ last5: z.array(z.object({ date: z.string(), opponent: z.string(), minutes: z.number(), points: z.number(), rebounds: z.number(), assists: z.number(), steals: z.number(), blocks: z.number(), turnovers: z.number(), fgPct: z.number(), threePct: z.number(), ftPct: z.number() })), last10: z.array(z.object({ date: z.string(), opponent: z.string(), minutes: z.number(), points: z.number(), rebounds: z.number(), assists: z.number(), steals: z.number(), blocks: z.number(), turnovers: z.number(), fgPct: z.number(), threePct: z.number(), ftPct: z.number() })), fetchedAt: z.string(), source: z.literal("BallDontLie") }).optional(),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

export interface AIProvider {
  name: string;
  analyze(
    card: Card,
    player: Player,
    period: "7-30d" | "1-3m",
  ): Promise<AIAnalysis>;
}

export class DeterministicDemoAI implements AIProvider {
  name = "nucleus-demo-rules-v1";

  async analyze(
    card: Card,
    player: Player,
    period: "7-30d" | "1-3m",
    performance?: PlayerRecentPerformance | null,
  ): Promise<AIAnalysis> {
    const momentum =
      period === "7-30d"
        ? (card.change30d ?? 0)
        : (card.change90d ?? card.change30d ?? 0);
    const dataPenalty =
      card.dataCompleteness < 60 ? 14 : card.dataCompleteness < 80 ? 7 : 0;
    const liquidityPenalty =
      card.liquidity < 30 ? 14 : card.liquidity < 55 ? 7 : 0;
    const injuryPenalty =
      player.injuryStatus === "out"
        ? 15
        : player.injuryStatus === "monitor"
          ? 6
          : 0;
    const baseUp = Math.max(
      15,
      Math.min(
        70,
        38 + momentum * 0.7 - dataPenalty - liquidityPenalty - injuryPenalty,
      ),
    );
    const baseDown = Math.max(
      15,
      Math.min(
        65,
        32 - momentum * 0.45 + dataPenalty + liquidityPenalty + injuryPenalty,
      ),
    );
    const baseNeutral = Math.max(15, 100 - baseUp - baseDown);
    const total = baseUp + baseDown + baseNeutral;
    const normalized = [baseUp, baseNeutral, baseDown].map((value) =>
      Math.round((value / total) * 100),
    );
    const [up, neutral, down] = normalized;
    const trendDirection =
      up > down + 8 ? "up" : down > up + 8 ? "down" : "neutral";
    const confidenceLevel =
      card.dataCompleteness >= 85 && card.sales30d >= 8
        ? "high"
        : card.dataCompleteness >= 65 && card.sales30d >= 3
          ? "medium"
          : "low";

    const recent = performance?.last5 ?? [];
    const avg = (field: "points" | "rebounds" | "assists" | "minutes") => recent.length ? recent.reduce((sum, game) => sum + game[field], 0) / recent.length : 0;
    return aiAnalysisSchema.parse({
      analysisPeriod: period,
      playerCohort: player.cohort,
      peerComparison:
        player.peerComparison ??
        `${player.draftYear} 届暂无足够同届演示样本，当前不输出精确排名。`,
      trendDirection,
      upwardProbabilityRange: [Math.max(0, up - 5), Math.min(100, up + 5)],
      neutralProbabilityRange: [
        Math.max(0, neutral - 5),
        Math.min(100, neutral + 5),
      ],
      downwardProbabilityRange: [
        Math.max(0, down - 5),
        Math.min(100, down + 5),
      ],
      confidenceLevel,
      dataCompleteness: card.dataCompleteness,
      keyPositiveFactors: [
        ...(performance ? [`BallDontLie 近 ${recent.length} 场：${avg("points").toFixed(1)} PTS / ${avg("rebounds").toFixed(1)} REB / ${avg("assists").toFixed(1)} AST`, `近 ${recent.length} 场场均出场 ${avg("minutes").toFixed(1)} 分钟`] : []),
        card.change30d && card.change30d > 0
          ? `30 日成交中位价变化 +${card.change30d}%`
          : "当前无明确价格动量",
        `球员市场热度 ${player.marketHeat}/100`,
      ],
      keyNegativeFactors: [
        card.sales30d < 4 ? "近 30 日成交样本偏少" : "短期价格仍可能显著波动",
        card.listingsCount < 4
          ? "在售供给少，价格发现效率有限"
          : "在售标价可能高于真实成交",
      ],
      injuryFactors: [
        player.injuryStatus === "healthy"
          ? "暂无演示伤病信号"
          : "存在需持续观察的演示伤病状态；不作医学诊断",
      ],
      liquidityFactors: [
        `流动性评分 ${card.liquidity}/100`,
        `近 30 日 ${card.sales30d} 笔成交样本`,
      ],
      marketHeatFactors: [
        `市场热度 ${player.marketHeat}/100`,
        card.rookie
          ? `${card.draftYear} 选秀届关注度影响显著`
          : "非新秀卡，热度更依赖历史收藏需求",
      ],
      invalidationEvents: [
        "新增重大伤病或复出信息",
        "连续出现经验证的大额成交",
        "成交量显著下降或异常放大",
        "球队交易或角色变化",
      ],
      evidence: [
        ...(performance ? [{ label: "近期比赛统计", source: "BallDontLie", updatedAt: performance.fetchedAt }] : []),
        {
          label: "演示成交指标",
          source: "Nucleus 演示源",
          updatedAt: "2026-08-31T01:30:00Z",
        },
        {
          label: "球员状态",
          source: "Nucleus 演示资料",
          updatedAt: "2026-08-31T01:30:00Z",
        },
      ],
      disclaimer: productConfig.disclaimer,
      generatedAt: "2026-08-31T01:30:00Z",
      modelVersion: this.name,
      recentPerformance: performance ? { last5: performance.last5, last10: performance.last10, fetchedAt: performance.fetchedAt, source: "BallDontLie" } : undefined,
    });
  }
}

