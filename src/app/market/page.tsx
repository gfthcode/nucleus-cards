import type { Metadata } from "next";
import { MarketExplorer } from "@/components/market-explorer";
import { cards, getPlayer, getTeam } from "@/lib/demo-data";
import { DemoDataBadge } from "@/components/data-provenance";
import styles from "./market.module.css";

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
      <header className={styles.masthead}>
        <div>
          <span>THE MARKET</span>
          <h1>球星卡行情市场</h1>
          <p className={styles.headline}>卡片，不只是目录。</p>
          <p>从成交样本开始，逐层阅读版本、评级、流动性与数据状态。这里的卡片是可研究的产品，而不是被压缩进数据表的一行文字。</p>
        </div>
        <aside>
          <DemoDataBadge />
          <strong>{cards.length}<small> 张标准化卡片</small></strong>
          <p>数据覆盖 78.4% · 4 条待审核异常<br />在售标价与成交样本始终分开。</p>
        </aside>
      </header>
      <MarketExplorer rows={rows} />
    </main>
  );
}
