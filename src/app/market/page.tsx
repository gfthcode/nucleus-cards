import type { Metadata } from "next";
import { MarketExplorer } from "@/components/market-explorer";
import { PageHeader } from "@/components/page-header";
import { cards, getPlayer, getTeam } from "@/lib/demo-data";

export const metadata: Metadata = { title: "行情市场" };

export default function MarketPage() {
  const rows = cards.map((card) => ({
    ...card,
    player: getPlayer(card.playerId)!,
    team: card.printedTeamId ? getTeam(card.printedTeamId) : undefined,
  }));
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow="MARKET"
        title="球星卡行情市场"
        description="按球员、球队、2020—2026 选秀届、球员代际、交易签约热点、品牌、成交量、流动性与风险筛选。所有数据均为演示数据。"
      />
      <div className="data-quality-strip">
        <span>
          <b>78.4%</b> 数据覆盖率
        </span>
        <span>
          <b>{cards.length}</b> 张标准化卡片
        </span>
        <span>
          <b>6</b> 个数据源状态
        </span>
        <span className="warn">
          <b>4</b> 条待审核异常
        </span>
      </div>
      <MarketExplorer rows={rows} />
    </main>
  );
}
