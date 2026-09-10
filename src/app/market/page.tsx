import type { Metadata } from "next";
import { MarketExplorer } from "@/components/market-explorer";
import { PageHeader } from "@/components/page-header";
import { cards, getPlayer, getTeam } from "@/lib/demo-data";
import { DemoDataBadge } from "@/components/data-provenance";

export const metadata: Metadata = {
  title: "NBA 球星卡行情市场",
  description:
    "按球员、球队、品牌、选秀届和流动性筛选 NBA 球星卡。先区分成交样本与在售标价，再阅读价格区间和数据完整度。",
  alternates: { canonical: "/market" },
};

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
        description="按球员、球队、2020—2026 选秀届、球员代际、品牌、成交量、流动性与风险筛选。先看来源和样本量，再看价格变化。"
      />
      <div className="data-quality-strip">
        <DemoDataBadge />
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
