import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { getPlayer, getPlayerCards, getTeam, players } from "@/lib/demo-data";

export function generateStaticParams() {
  return players.map((player) => ({ id: player.id }));
}

export default async function PlayerPage({
  params,
}: PageProps<"/players/[id]">) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();
  const team = player.currentTeamId ? getTeam(player.currentTeamId) : undefined;
  const related = getPlayerCards(player.id);
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow={`PLAYER · ${player.position}`}
        title={player.displayNameZh}
        description={`${player.name} · ${player.draftYear} 年选秀${player.draftPick ? `第 ${player.draftPick} 顺位` : ""} · 当前球队 ${team?.name ?? "退役 / 未披露"}`}
        actions={
          <span className="avatar-hero">
            {player.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </span>
        }
      />
      <section className="player-classification-strip">
        <PlayerCohortBadges player={player} />
        <div>
          <span>同届观察排名</span>
          <b>#{player.peerRank ?? "—"}</b>
        </div>
        <div>
          <span>估值信号</span>
          <b>
            {player.valuationSignal === "overheated"
              ? "偏热"
              : player.valuationSignal === "underfollowed"
                ? "关注不足"
                : "均衡"}
          </b>
        </div>
        <p>{player.peerComparison ?? "暂无同届横向对比摘要。"}</p>
      </section>
      <section className="player-stat-grid">
        {[
          ["上场时间", player.minutes, "MIN"],
          ["得分", player.points, "PTS"],
          ["篮板", player.rebounds, "REB"],
          ["助攻", player.assists, "AST"],
          ["市场热度", player.marketHeat, "/100"],
        ].map(([label, value, suffix]) => (
          <div key={String(label)}>
            <span>{label}</span>
            <b>{value}</b>
            <small>{suffix}</small>
          </div>
        ))}
      </section>
      <div className="player-content-grid">
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">PERFORMANCE TREND</span>
              <h2>近期表现趋势</h2>
            </div>
            <small>演示比赛摘要</small>
          </div>
          <div className="performance-bars">
            {[64, 72, 58, 80, 76, 88, 83, 91].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }}>
                <span>{[18, 22, 16, 27, 24, 31, 28, 34][index]}</span>
              </i>
            ))}
          </div>
          <div className="chart-foot">
            <span>近 8 场得分</span>
            <b>趋势偏强 · 样本有限</b>
          </div>
        </section>
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">INJURY TIMELINE</span>
              <h2>伤病时间线</h2>
            </div>
            <span
              className={`risk-pill ${player.injuryStatus === "healthy" ? "low" : "medium"}`}
            >
              {player.injuryStatus === "healthy" ? "暂无信号" : "观察中"}
            </span>
          </div>
          <div className="timeline compact">
            <article>
              <span>2026-08</span>
              <div>
                <b>
                  {player.injuryStatus === "healthy"
                    ? "无新增演示事件"
                    : "出场状态需观察"}
                </b>
                <p>来源：演示资料 · 可信度中。不作医学诊断。</p>
              </div>
            </article>
            <article>
              <span>复出后</span>
              <div>
                <b>上场时间变化待数据</b>
                <p>暂无足够可信样本，不输出推断。</p>
              </div>
            </article>
          </div>
        </section>
      </div>
      <section className="data-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">RELATED CARDS</span>
            <h2>相关球星卡</h2>
          </div>
          <small>品牌与系列横向对比</small>
        </div>
        <div className="simple-card-list horizontal">
          {related.length ? (
            related.map((card) => (
              <Link href={`/cards/${card.id}`} key={card.id}>
                <span className="mini-card">
                  {player.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <div>
                  <b>
                    {card.releaseYear} {card.productLine}
                  </b>
                  <small>
                    {card.parallel} ·{" "}
                    {card.condition === "graded"
                      ? `${card.gradingCompany} ${card.grade}`
                      : "裸卡"}
                  </small>
                </div>
                <em>
                  {card.latestSaleCny
                    ? `¥${card.latestSaleCny.toLocaleString()}`
                    : "暂无可信成交"}
                </em>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <b>暂无相关演示卡片</b>
            </div>
          )}
        </div>
      </section>
      <section className="ai-summary">
        <div>
          <span>AI TREND SUMMARY · DEMO</span>
          <h2>基于成交、热度与风险信号的结构化观察</h2>
          <p>
            {related[0]?.sales30d
              ? `近 30 日包含 ${related[0].sales30d} 笔演示成交样本。`
              : "暂无足够成交样本。"}
            球员市场热度为 {player.marketHeat}
            /100；当前代际、交易或签约热点、伤病和球队角色变化都可能推翻当前判断。
          </p>
        </div>
        <aside>
          <b>置信度</b>
          <strong>
            {related[0]?.dataCompleteness && related[0].dataCompleteness > 85
              ? "高"
              : "中"}
          </strong>
          <small>不构成投资建议</small>
        </aside>
      </section>
    </main>
  );
}
