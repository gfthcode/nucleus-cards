import type { Metadata } from "next";
import Link from "next/link";
import { buildMomentumBoard } from "@/lib/player-momentum";
import { getPlayer, getTeam, players } from "@/lib/demo-data";

export const metadata: Metadata = { title: "球员动量雷达", description: "基于 NBA 表现、角色和球队环境的球员市场关注度分析。" };
export const revalidate = 1800;

const labels = { SURGING: "强势升温", HEATING_UP: "升温", POSITIVE: "偏强", NEUTRAL: "中性", COOLING: "降温", WEAK: "偏弱" } as const;
const outlooks = { STRONG_POSITIVE: "强正向", POSITIVE: "正向", NEUTRAL: "中性", NEGATIVE: "负向", STRONG_NEGATIVE: "强负向" } as const;

export default async function MomentumPage() {
  const board = await buildMomentumBoard(players);
  return <main className="page-shell inner-page"><header className="terminal-page-heading"><div><span className="section-kicker">NUCLEUS MOMENTUM RADAR</span><h1>球员动量雷达</h1><p>解释球员市场关注度为何升温或降温。它不是球星卡价格预测，也不会虚构卡价。</p></div><div className="updated-at"><span>覆盖球员</span><strong>{board.length}</strong></div></header><section className="data-panel" style={{ padding: 20 }}><div className="section-heading"><div><span className="section-kicker">MOMENTUM BOARD</span><h2>当前关注度排序</h2></div><small>权重会随 IN_SEASON / OFFSEASON 自动切换</small></div><div style={{ display: "grid", gap: 10 }}>{board.map((row, index) => { const player = getPlayer(row.playerId); const team = player?.currentTeamId ? getTeam(player.currentTeamId) : undefined; const delta = row.momentumChange7d; return <Link href={`/players/${row.playerId}`} key={row.playerId} style={{ borderBottom: "1px solid var(--nucleus-border)", display: "grid", gap: 5, gridTemplateColumns: "34px minmax(150px, 1fr) 90px 90px minmax(140px, 1fr) 100px", padding: "12px 0", textDecoration: "none" }}><b style={{ color: "var(--nucleus-text-muted)" }}>{String(index + 1).padStart(2, "0")}</b><span><strong style={{ color: "var(--nucleus-text)", display: "block" }}>{player?.displayNameZh ?? row.playerId}</strong><small style={{ color: "var(--nucleus-text-muted)" }}>{player?.name} · {team?.abbreviation ?? "NBA"}</small></span><strong style={{ color: "var(--nucleus-text)" }}>{row.momentumScore}<small style={{ color: "var(--nucleus-text-muted)", display: "block" }}>{labels[row.momentumLabel]}</small></strong><span style={{ color: delta == null ? "var(--nucleus-text-muted)" : delta >= 0 ? "#65d5a4" : "#f08a7e" }}>{delta == null ? "暂无历史" : `${delta >= 0 ? "+" : ""}${delta} / 7D`}</span><span style={{ color: "var(--nucleus-text-muted)" }}>{row.catalysts[0] ?? "暂无证据驱动"}</span><span style={{ color: "var(--nucleus-text-muted)" }}>{outlooks[row.shortTermOutlook]}</span></Link>; })}</div></section><section className="data-panel" style={{ marginTop: 20, padding: 20 }}><h2>指标说明</h2><p>当前分析优先使用 SportsDataIO 或 BallDontLie 的比赛日志；若授权源不可用，页面会降级到球员目录基线并将置信度标为 LOW。没有历史快照时，24H / 7D / 30D 会显示“暂无历史”，不会伪造变化百分比。</p><p className="source-note">重要：当前输出是球员市场关注度，不等同于球星卡价格涨跌。真实卡价仍需经过授权成交数据核验。</p></section></main>;
}
