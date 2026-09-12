import type { Metadata } from "next";
import { AnalysisResearch } from "@/components/analysis-research";
import { DeterministicDemoAI } from "@/lib/ai-analysis";
import { cards, getPlayer } from "@/lib/demo-data";

export const metadata: Metadata = { title: "AI 卡片研究", description: "基于站内规则、样本完整度和卡片市场指标的研究界面。演示结论不是投资建议。", alternates: { canonical: "/analysis" } };

export default async function AnalysisPage() {
  const provider = new DeterministicDemoAI();
  const rows = await Promise.all(cards.slice(0, 4).map(async (card) => {
    const player = getPlayer(card.playerId)!;
    return { card, player, analysis: await provider.analyze(card, player, "7-30d") };
  }));
  return <AnalysisResearch rows={rows} />;
}
