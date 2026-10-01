import { z } from "zod";
import { productConfig } from "@/config/product";
import type { Card, Player } from "@/types/domain";
import type { PlayerRecentPerformance } from "@/lib/providers/balldontlie";
import type { CourtMatchPlayerContext } from "@/lib/courtmatch-context";

const recentGameSchema = z.object({
  date: z.string(),
  opponent: z.string(),
  minutes: z.number(),
  points: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  fgPct: z.number(),
  threePct: z.number(),
  ftPct: z.number(),
});

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
  observedPriceChangePct: z.number().nullable(),
  observedPeriodLabel: z.enum(["30 日", "90 日"]),
  marketEvidence: z.object({
    sales30d: z.number().int().nonnegative(),
    listings: z.number().int().nonnegative(),
    liquidity: z.number().min(0).max(100),
    isDemo: z.boolean(),
    hasObservedPriceChange: z.boolean(),
  }),
  courtMatchContext: z.object({
    playerId: z.string(),
    name: z.string(),
    teamAbbreviation: z.string(),
    season: z.string(),
    seasonType: z.literal("regular"),
    offensePointsPer100MatchupPossessions: z.number().nullable(),
    offenseMatchupPossessions: z.number().nonnegative(),
    offenseOpponentCount: z.number().int().nonnegative(),
    defensePointsAllowedPer100MatchupPossessions: z.number().nullable(),
    defenseMatchupPossessions: z.number().nonnegative(),
    defenseOpponentCount: z.number().int().nonnegative(),
    source: z.string(),
    sourceUrl: z.string().url(),
    datasetUrl: z.string().url(),
    status: z.enum(["live", "recently-updated", "stale", "demo", "error", "unavailable"]),
    lastUpdated: z.string(),
    dataSource: z.string(),
    coverage: z.string(),
    metricNote: z.string(),
  }).optional(),
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
  recentPerformance: z
    .object({
      last5: z.array(recentGameSchema),
      last10: z.array(recentGameSchema),
      fetchedAt: z.string(),
      source: z.enum(["BallDontLie", "SportsDataIO"]),
    })
    .optional(),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

export interface AIProvider {
  name: string;
  analyze(
    card: Card,
    player: Player,
    period: "7-30d" | "1-3m",
    performance?: PlayerRecentPerformance | null,
    courtMatchContext?: CourtMatchPlayerContext | null,
  ): Promise<AIAnalysis>;
}

/**
 * Transparent deterministic research rules. This is deliberately not presented
 * as an LLM or a calibrated price forecast: it summarizes supplied evidence.
 */
export class DeterministicDemoAI implements AIProvider {
  name = "nucleus-evidence-rules-v2";

  async analyze(
    card: Card,
    player: Player,
    period: "7-30d" | "1-3m",
    performance?: PlayerRecentPerformance | null,
    courtMatchContext?: CourtMatchPlayerContext | null,
  ): Promise<AIAnalysis> {
    const observedPriceChangePct =
      period === "7-30d"
        ? (card.change30d ?? null)
        : (card.change90d ?? null);
    const hasObservedPriceChange = observedPriceChangePct !== null;
    const trendDirection = !hasObservedPriceChange
      ? "neutral"
      : observedPriceChangePct >= 5
        ? "up"
        : observedPriceChangePct <= -5
          ? "down"
          : "neutral";
    const recent = performance?.last5 ?? [];
    const average = (
      field: "points" | "rebounds" | "assists" | "minutes",
    ) =>
      recent.length
        ? recent.reduce((sum, game) => sum + game[field], 0) / recent.length
        : 0;
    const marketSource = card.demo ? "Nucleus 演示行情" : "站内卡片行情记录";
    const completenessSource = player.demo
      ? "Nucleus 演示球员资料"
      : "NBA 球员目录";

    // Until verified transaction evidence is passed into this provider, keep
    // confidence low even if a demo record reports high completeness or volume.
    const confidenceLevel = "low" as const;

    return aiAnalysisSchema.parse({
      analysisPeriod: period,
      playerCohort: player.cohort,
      peerComparison:
        player.peerComparison ??
        `${player.draftYear} 届暂无足够可核验的同届成交样本，不输出精确排名。`,
      trendDirection,
      observedPriceChangePct,
      observedPeriodLabel: period === "7-30d" ? "30 日" : "90 日",
      marketEvidence: {
        sales30d: card.sales30d,
        listings: card.listingsCount,
        liquidity: card.liquidity,
        isDemo: card.demo,
        hasObservedPriceChange,
      },
      courtMatchContext: courtMatchContext ?? undefined,
      confidenceLevel,
      dataCompleteness: card.dataCompleteness,
      keyPositiveFactors: [
        ...(performance
          ? [
              `${performance.source} 近 ${recent.length} 场：${average("points").toFixed(1)} PTS / ${average("rebounds").toFixed(1)} REB / ${average("assists").toFixed(1)} AST`,
              `近 ${recent.length} 场场均出场 ${average("minutes").toFixed(1)} 分钟`,
            ]
          : []),
        hasObservedPriceChange
          ? `${period === "7-30d" ? "30" : "90"} 日价格变化记录 ${observedPriceChangePct > 0 ? "+" : ""}${observedPriceChangePct}%（${card.demo ? "演示数据" : "站内记录"}）`
          : `没有可用的${period === "7-30d" ? "30" : "90"} 日价格变化记录`,
      ],
      keyNegativeFactors: [
        card.sales30d < 4
          ? "近 30 日成交样本少于 4 笔，价格发现能力有限"
          : `近 30 日成交样本为 ${card.sales30d} 笔；尚不能单独证明趋势可持续`,
        card.listingsCount < 4
          ? "在售挂牌少于 4 条，供需信号可能不稳定"
          : `当前记录 ${card.listingsCount} 条挂牌；挂牌价不等于成交价`,
        ...(card.demo ? ["本卡行情为演示数据，不代表真实市场报价"] : []),
        ...(courtMatchContext?.status === "stale"
          ? [`CourtMatch ${courtMatchContext.season} 对位快照已过期，只作背景参考，不代表当前赛季表现`]
          : []),
        ...(!courtMatchContext
          ? ["CourtMatch 未找到唯一对应球员，未拼接对位数据"]
          : []),
      ],
      injuryFactors: [
        player.demo
          ? "球员状态字段来自演示资料，不能据此确认最新伤病情况"
          : player.injuryStatus === "healthy"
            ? "当前目录未标记伤病；这不等于实时医疗状态核验"
            : "目录中存在待观察的球员状态，不作医学诊断",
      ],
      liquidityFactors: [
        `站内流动性评分 ${card.liquidity}/100（数据完整度 ${card.dataCompleteness}/100）`,
        `近 30 日记录 ${card.sales30d} 笔成交、${card.listingsCount} 条挂牌`,
      ],
      marketHeatFactors: [
        player.demo
          ? "球员热度为演示字段，未作为真实热度结论"
          : `目录热度字段 ${player.marketHeat}/100，非成交量统计`,
        card.rookie ? "新秀卡价格可能受预期波动影响" : "历史卡需求仍需以同卡、同评级成交验证",
      ],
      invalidationEvents: [
        "出现新的、同卡号且同评级的已核验成交记录",
        "成交样本量或挂牌量明显变化",
        "价格来源、采样窗口或汇率口径发生变化",
        "球员球队、角色或健康状态出现可核验的新信息",
      ],
      evidence: [
        ...(performance
          ? [
              {
                label: "近期比赛统计",
                source: performance.source,
                updatedAt: performance.fetchedAt,
              },
            ]
          : []),
        ...(courtMatchContext
          ? [
              {
                label: `${courtMatchContext.season} 球员对位数据`,
                source: `${courtMatchContext.source} · ${courtMatchContext.dataSource} · ${courtMatchContext.status}`,
                updatedAt: courtMatchContext.lastUpdated,
              },
            ]
          : []),
        {
          label: card.demo ? "演示行情指标" : "站内行情指标",
          source: marketSource,
          updatedAt: new Date().toISOString(),
        },
        {
          label: "球员目录字段",
          source: completenessSource,
          updatedAt: new Date().toISOString(),
        },
      ],
      disclaimer: productConfig.disclaimer,
      generatedAt: new Date().toISOString(),
      modelVersion: this.name,
      recentPerformance: performance
        ? {
            last5: performance.last5,
            last10: performance.last10,
            fetchedAt: performance.fetchedAt,
            source: performance.source,
          }
        : undefined,
    });
  }
}
