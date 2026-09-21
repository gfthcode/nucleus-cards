import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PlayerTerminalTabs } from "@/components/player-terminal-tabs";
import { PlayerProfileHero } from "@/components/player-profile-hero";
import { productConfig } from "@/config/product";
import { getPlayer, getPlayerCards, getTeam, players } from "@/lib/demo-data";
import { buildPlayerMomentum } from "@/lib/player-momentum";

export function generateStaticParams() {
  return players.map((player) => ({ id: player.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/players/[id]">): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) return { title: "球员不存在" };
  return {
    title: `${player.displayNameZh} 球星卡行情`,
    description: `查看 ${player.displayNameZh} 的当前球队、关联球星卡、成交样本、热度和数据完整度。页面数据状态以来源标注为准。`,
    alternates: { canonical: `/players/${player.id}` },
  };
}

export default async function PlayerPage({
  params,
}: PageProps<"/players/[id]">) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();
  const team = player.currentTeamId ? getTeam(player.currentTeamId) : undefined;
  const related = getPlayerCards(player.id);
  const lead = related[0];
  const momentum = await buildPlayerMomentum(player);
  return (
    <main className="page-shell inner-page player-terminal-page">
      <PlayerProfileHero player={player} team={team} lead={lead} />
      <section className="player-market-conclusion data-panel">
        <div>
          <span className="section-kicker">MARKET STATE SUMMARY</span>
          <h2>当前市场状态总结</h2>
          <p>
            {(lead?.change30d ?? 0) >= 0 ? "近 30 日价格上涨" : "近 30 日价格回落"}
            ，成交活跃度{(lead?.sales30d ?? 0) >= 10 ? "较高" : "有限"}
            ；部分卡片成交样本仍需继续观察。
          </p>
        </div>
        <div className="conclusion-signals">
          <span>
            30D 趋势{" "}
            <b className={(lead?.change30d ?? 0) >= 0 ? "up" : "down"}>
              {(lead?.change30d ?? 0) >= 0 ? "↑ 上涨" : "↓ 下跌"}
            </b>
          </span>
          <span>
            成交活跃度 <b>{(lead?.sales30d ?? 0) >= 10 ? "高" : "中"}</b>
          </span>
          <span>
            数据可信度{" "}
            <b>{(lead?.dataCompleteness ?? 0) >= 85 ? "高" : "中"}</b>
          </span>
          <span>
            风险{" "}
            <b className={"risk-pill " + (lead?.riskLevel ?? "medium")}>
              {lead?.riskLevel === "high"
                ? "高"
                : lead?.riskLevel === "low"
                  ? "低"
                  : "中"}
            </b>
          </span>
        </div>
        <small className="source-note">
          行情来源：演示成交数据 · {productConfig.demoDataUpdatedLabel} ·
          数据完整度 {lead?.dataCompleteness ?? 0}%
        </small>
      </section>
      <PlayerTerminalTabs player={player} cards={related} />
      <section className="data-panel" style={{ marginTop: 20, padding: 20 }}>
        <span className="section-kicker">MOMENTUM RADAR</span>
        <h2>球员关注度动量：{momentum.momentumScore}</h2>
        <p>{momentum.summary}</p>
        <p className="source-note">
          短期展望：{momentum.shortTermOutlook} · 中期展望：{momentum.mediumTermOutlook} · 置信度：{momentum.confidence} · 数据质量：{momentum.dataQualityScore} · {momentum.momentumChange7d == null ? "7D 暂无历史快照" : `7D ${momentum.momentumChange7d >= 0 ? "+" : ""}${momentum.momentumChange7d}`} · <Link href="/momentum">查看完整动量雷达 →</Link>
        </p>
        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          <strong>为什么动量变化</strong>
          <span>推动因素：{momentum.catalysts.join("；")}</span>
          <span>风险因素：{momentum.risks.join("；")}</span>
          {momentum.events.length ? <div><strong>最新公开报道</strong>{momentum.events.map((event) => <div key={event.id}><a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.headline}</a><small className="source-note"> · {event.source}</small></div>)}</div> : null}
        </div>
      </section>
    </main>
  );
}
