import type { Metadata } from "next";
import Link from "next/link";
import { buildMomentumBoard } from "@/lib/player-momentum";
import { getMomentumPlayers, momentumCoverage } from "@/lib/momentum-players";

export const metadata: Metadata = { title: "球员动量雷达", description: "基于真实 NBA 表现、角色和球队环境的球员市场关注度分析。" };
export const revalidate = 1800;
const labels = { SURGING: "强势升温", HEATING_UP: "升温", POSITIVE: "偏强", NEUTRAL: "中性", COOLING: "降温", WEAK: "偏弱" } as const;
const outlooks = { STRONG_POSITIVE: "强正向", POSITIVE: "正向", NEUTRAL: "中性", NEGATIVE: "负向", STRONG_NEGATIVE: "强负向" } as const;

export default async function MomentumPage() {
  let players: Awaited<ReturnType<typeof getMomentumPlayers>> = [];
  let sourceError: string | null = null;
  try { players = await getMomentumPlayers(); } catch (error) { sourceError = error instanceof Error ? error.message : "真实 NBA 球员源不可用"; }
  const board = players.length ? await buildMomentumBoard(players) : [];
  const byId = new Map(players.map((player) => [player.id, player]));
  const coverage = momentumCoverage(players);
  return <main className="page-shell inner-page"><header className="terminal-page-heading"><div><span className="section-kicker">NUCLEUS MOMENTUM RADAR</span><h1>球员动量雷达</h1><p>真实 NBA 球员、比赛日志和公开报道驱动；它不是球星卡价格预测，也不会虚构卡价。</p></div><div className="updated-at"><span>真实球员 / 球队</span><strong>{coverage.players} / {coverage.teams}</strong></div></header>{sourceError ? <section className="data-panel" style={{ padding: 20 }}><h2>真实 NBA 球员源暂不可用</h2><p>{sourceError}</p><p className="source-note">生产环境不会回退到 demo-data；请先配置并验证 NBA provider。</p></section> : <><section className="data-panel" style={{ padding: 20 }}><div className="section-heading"><div><span className="section-kicker">MOMENTUM BOARD</span><h2>当前关注度排序</h2></div><small>真实来源：{players[0]?.source ?? "NBA provider"} · {coverage.players} 名球员 / {coverage.teams} 支球队</small></div><div style={{ display: "grid", gap: 10 }}>{board.map((row, index) => { const player = byId.get(row.playerId); const delta = row.momentumChange7d; return <Link href={`/players/${row.playerId}`} key={row.playerId} style={{ borderBottom: "1px solid var(--nucleus-border)", display: "grid", gap: 5, gridTemplateColumns: "34px minmax(150px, 1fr) 90px 90px minmax(140px, 1fr) 100px", padding: "12px 0", textDecoration: "none" }}><b style={{ color: "var(--nucleus-text-muted)" }}>{String(index + 1).padStart(2, "0")}</b><span><strong style={{ color: "var(--nucleus-text)", display: "block" }}>{player?.displayNameZh ?? row.playerId}</strong><small style={{ color: "var(--nucleus-text-muted)" }}>{player?.name} · {player?.teamAbbreviation ?? "NBA"}</small></span><strong style={{ color: "var(--nucleus-text)" }}>{row.momentumScore}<small style={{ color: "var(--nucleus-text-muted)", display: "block" }}>{labels[row.momentumLabel]} · {row.confidence}</small></strong><span style={{ color: delta == null ? "var(--nucleus-text-muted)" : delta >= 0 ? "#65d5a4" : "#f08a7e" }}>{delta == null ? "暂无历史" : `${delta >= 0 ? "+" : ""}${delta} / 7D`}</span><span style={{ color: "var(--nucleus-text-muted)" }}>{row.catalysts[0] ?? "暂无证据驱动"}</span><span style={{ color: "var(--nucleus-text-muted)" }}>{outlooks[row.shortTermOutlook]}</span></Link>; })}</div></section><section className="data-panel" style={{ marginTop: 20, padding: 20 }}><h2>数据与历史状态</h2><p>统计源不可用时仅降低数据质量和置信度，不使用 demo 得分、出场时间、市场热度或交易/签约标记。首次采集前 24H / 7D / 30D 显示“暂无历史”，不会伪造变化百分比。</p><p className="source-note">NBA 来源：{players[0]?.source ?? "provider"} · 新闻来源：ESPN NBA RSS（匹配时显示）</p></section></>}</main>;
}
