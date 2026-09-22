import { z } from "zod";
import { productConfig } from "@/config/product";
import { getCard, getPlayer } from "@/lib/demo-data";

export const researchQuestionSchema = z
  .string()
  .trim()
  .min(2, "请输入至少两个字符的问题")
  .max(600, "问题不能超过 600 个字符");

export const researchEvidenceSchema = z.object({
  label: z.string(),
  source: z.string(),
  updatedAt: z.string(),
  sampleSize: z.number().int().nonnegative().optional(),
  status: z.enum(["verified", "limited", "demo"]),
  detail: z.string(),
});

export const researchResponseSchema = z.object({
  title: z.string(),
  answer: z.string(),
  observation: z.enum(["supportive", "mixed", "cautious", "insufficient"]),
  evidenceStrength: z.enum(["strong", "moderate", "limited"]),
  evidence: z.array(researchEvidenceSchema).min(1),
  uncertainty: z.array(z.string()).min(1),
  nextChecks: z.array(z.string()).min(1),
  toolTrace: z.array(
    z.object({
      name: z.string(),
      status: z.literal("read-only"),
      summary: z.string(),
    }),
  ),
  disclaimer: z.string(),
  generatedAt: z.string(),
  modelVersion: z.string().min(1).max(160),
  // Kept server-side in the message row; never render provider usage to users.
  tokenUsage: z.record(z.string(), z.unknown()).optional(),
});

export type ResearchResponse = z.infer<typeof researchResponseSchema>;
export type CollectionContext = {
  collectionQuantity: number;
  positionQuantity: number;
};

function formatPrice(value: number | undefined) {
  return value == null
    ? "暂无"
    : `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

/**
 * This is an evidence workflow, not a predictive model. Every tool represented
 * here is read-only and its source quality is exposed in the resulting answer.
 */
export function researchCard(
  cardId: string,
  question: string,
  collection: CollectionContext = {
    collectionQuantity: 0,
    positionQuantity: 0,
  },
): ResearchResponse | null {
  const card = getCard(cardId);
  const player = card ? getPlayer(card.playerId) : undefined;
  if (!card || !player) return null;

  const now = new Date().toISOString();
  const isDuplicateQuestion = /重复|已有|持仓|收藏|duplicate|portfolio/i.test(
    question,
  );
  const isEvidenceQuestion = /证据|成交|行情|样本|价格|sales|evidence/i.test(
    question,
  );
  const hasThinSample = card.sales30d < 4 || card.dataCompleteness < 65;
  const observation = hasThinSample
    ? "insufficient"
    : card.change30d != null && card.change30d > 5
      ? "supportive"
      : card.change30d != null && card.change30d < -5
        ? "cautious"
        : "mixed";
  const evidenceStrength =
    card.demo || hasThinSample
      ? "limited"
      : card.dataCompleteness >= 85
        ? "strong"
        : "moderate";

  const evidence = [
    {
      label: "卡片身份核验",
      source: "Nucleus 卡片目录",
      updatedAt: now,
      status: card.demo ? ("demo" as const) : ("verified" as const),
      detail: `${card.releaseYear} ${card.brand} ${card.productLine} · ${card.parallel} · 卡号 ${card.cardNumber}${card.grade ? ` · ${card.gradingCompany} ${card.grade}` : ""}`,
    },
    {
      label: "市场样本",
      source: card.demo ? "Nucleus 演示市场指标" : "Nucleus 已核验成交汇总",
      updatedAt: now,
      sampleSize: card.sales30d,
      status: card.demo
        ? ("demo" as const)
        : hasThinSample
          ? ("limited" as const)
          : ("verified" as const),
      detail: `近 30 日 ${card.sales30d} 笔成交样本；最近成交 ${formatPrice(card.latestSaleCny)}；30 日变化 ${card.change30d == null ? "暂无" : `${card.change30d > 0 ? "+" : ""}${card.change30d}%`}`,
    },
    {
      label: "供给与流动性",
      source: card.demo ? "Nucleus 演示市场指标" : "Nucleus 挂牌与成交汇总",
      updatedAt: now,
      status: card.demo
        ? ("demo" as const)
        : card.listingsCount < 4
          ? ("limited" as const)
          : ("verified" as const),
      detail: `当前 ${card.listingsCount} 条挂牌记录；流动性 ${card.liquidity}/100。挂牌价不能替代真实成交价。`,
    },
    {
      label: "球员上下文",
      source: player.demo ? "Nucleus 演示球员资料" : "Nucleus 球员资料",
      updatedAt: now,
      status: player.demo ? ("demo" as const) : ("verified" as const),
      detail: `${player.displayNameZh}：市场热度 ${player.marketHeat}/100；当前伤病状态 ${player.injuryStatus === "healthy" ? "未见信号" : "需持续观察"}。`,
    },
  ];

  const ownership = collection.collectionQuantity + collection.positionQuantity;
  const ownershipLine =
    ownership > 0
      ? `你的私有收藏记录中有 ${ownership} 件匹配持有记录（收藏 ${collection.collectionQuantity}、持仓 ${collection.positionQuantity}）；这只用于核对重复，不会向其他用户公开。`
      : "你的私有收藏和持仓中未发现匹配记录；这不代表你未在其他平台持有。";
  const baseConclusion =
    observation === "supportive"
      ? "现有站内指标呈现正向观察，但不足以证明未来价格会继续上涨。"
      : observation === "cautious"
        ? "现有站内指标偏谨慎，尤其应避免把挂牌价格当成可实现成交价。"
        : observation === "insufficient"
          ? "当前可用成交样本或完整度不足，系统不能形成可靠的行情判断。"
          : "现有指标没有形成一致方向，结论应保持中性并等待新增成交证据。";
  const answer = isDuplicateQuestion
    ? `${ownershipLine} ${baseConclusion}`
    : isEvidenceQuestion
      ? `${baseConclusion} 目前最有用的证据是身份、成交样本、挂牌/流动性和球员上下文；其中演示或样本不足的来源不能被当作真实历史成交。`
      : `${baseConclusion} ${ownershipLine}`;

  return researchResponseSchema.parse({
    title: `${player.displayNameZh} · ${card.releaseYear} ${card.brand} 研究`,
    answer,
    observation,
    evidenceStrength,
    evidence,
    uncertainty: [
      ...(card.demo
        ? ["当前卡片与行情数据标注为演示数据，不能用于真实估值或交易决策。"]
        : []),
      ...(hasThinSample
        ? [
            "近 30 日成交样本偏少或数据完整度不足，价格波动可能主要来自个别交易。",
          ]
        : []),
      "球员表现、伤病、交易和新增真实成交都可能迅速改变本次观察。",
    ],
    nextChecks: [
      "补充可追溯的已成交记录，并与挂牌记录分开比较。",
      "核对卡号、平行、评级与卡片图像，避免把相近版本混入样本。",
      "若准备新增关注或价格提醒，先预览条件和影响范围，再确认写入。",
    ],
    toolTrace: [
      {
        name: "card_identity",
        status: "read-only",
        summary: "核对年份、品牌、系列、平行与卡号",
      },
      {
        name: "market_evidence",
        status: "read-only",
        summary: "读取成交、挂牌、流动性与完整度指标",
      },
      {
        name: "player_context",
        status: "read-only",
        summary: "读取球员市场热度与状态上下文",
      },
      {
        name: "collection_match",
        status: "read-only",
        summary: "仅在当前登录用户的私有收藏与持仓内核对重复",
      },
    ],
    disclaimer: productConfig.disclaimer,
    generatedAt: now,
    modelVersion: "nucleus-research-agent-v1",
  });
}
