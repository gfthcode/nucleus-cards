import type { Metadata } from "next";
import { AlertManager } from "@/components/alert-manager";
import { PageHeader } from "@/components/page-header";
import { cards, demoAlerts, getPlayer } from "@/lib/demo-data";

export const metadata: Metadata = { title: "关注与提醒" };
export default function AlertsPage() {
  const joined = cards.map((card) => ({
    ...card,
    player: getPlayer(card.playerId)!,
  }));
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow="WATCHLIST & ALERTS"
        title="关注与价格提醒"
        description="创建价格、涨跌、成交量、新成交、伤病、复出、交易流言、签约与球员代际变化提醒。MVP 使用站内提醒与演示触发器。"
      />
      <AlertManager seed={demoAlerts} cards={joined} />
    </main>
  );
}
