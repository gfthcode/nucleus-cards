import type { Metadata } from "next";
import { AlertManager } from "@/components/alert-manager";
import { PersonalWorkspace } from "@/components/personal-workspace";
import { PageHeader } from "@/components/page-header";
import { cards, demoAlerts, getPlayer } from "@/lib/demo-data";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "关注与提醒" };
export default async function AlertsPage() {
  const { supabase, user } = await getAuthenticatedUser();
  if (supabase && user) return <main className="page-shell inner-page"><PageHeader eyebrow="PRIVATE ALERTS" title="我的价格提醒" description="提醒规则只对当前登录账号生效，服务端通过行级权限隔离。" /><PersonalWorkspace mode="alerts" /></main>;
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
