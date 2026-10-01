import type { Metadata } from "next";
import { AnalysisResearch } from "@/components/analysis-research";
import { ResearchDesk } from "@/components/research-desk";
import { DeterministicDemoAI } from "@/lib/ai-analysis";
import { getCourtMatchPlayerContext } from "@/lib/courtmatch-context";
import { cards, getCard, getPlayer } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "AI 卡片研究",
  description:
    "基于站内规则、样本完整度和卡片市场指标的研究界面。演示结论不是投资建议。",
  alternates: { canonical: "/analysis" },
};

export default async function AnalysisPage({
  searchParams,
}: PageProps<"/analysis">) {
  const { card: selectedCardId } = await searchParams;
  const cardId = Array.isArray(selectedCardId) ? selectedCardId[0] : selectedCardId;
  const requestedCard = cardId ? getCard(cardId) : undefined;
  const analysisCards = requestedCard
    ? [requestedCard, ...cards.filter((card) => card.id !== requestedCard.id)].slice(0, 4)
    : cards.slice(0, 4);
  const provider = new DeterministicDemoAI();
  const rows = await Promise.all(
    analysisCards.map(async (card) => {
      const player = getPlayer(card.playerId)!;
      const courtMatchContext = getCourtMatchPlayerContext(player.name);
      return {
        card,
        player,
        analyses: {
          "7-30d": await provider.analyze(card, player, "7-30d", null, courtMatchContext),
          "1-3m": await provider.analyze(card, player, "1-3m", null, courtMatchContext),
        },
      };
    }),
  );
  return (
    <>
      <AnalysisResearch rows={rows} />
      <main className="page-shell inner-page">
        <ResearchDesk
          targets={cards.map((card) => {
            const player = getPlayer(card.playerId)!;
            return {
              id: card.id,
              label: `${player.displayNameZh} · ${card.releaseYear} ${card.brand} ${card.parallel}`,
            };
          })}
        />
      </main>
    </>
  );
}
