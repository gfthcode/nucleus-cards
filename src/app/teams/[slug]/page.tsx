import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { cards, getPlayer, getTeam, players, teams } from "@/lib/demo-data";

export function generateStaticParams() {
  return teams.map((team) => ({ slug: team.slug }));
}

export default async function TeamPage({ params }: PageProps<"/teams/[slug]">) {
  const { slug } = await params;
  const team = getTeam(slug);
  if (!team) notFound();
  const roster = players.filter((player) => player.currentTeamId === team.id);
  const printedCards = cards.filter((card) => card.printedTeamId === team.id);
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow={`${team.conference.toUpperCase()} · ${team.division.toUpperCase()}`}
        title={team.name}
        description={`${team.city} · 当前球员、重点新秀、卡片印刷球队行情及伤病风险均为演示资料。`}
        actions={
          <span className="team-hero-mark" style={{ background: team.color }}>
            {team.abbreviation}
          </span>
        }
      />
      <section className="team-summary-grid">
        <div>
          <span>当前球员</span>
          <b>{roster.length || "—"}</b>
          <small>演示名单</small>
        </div>
        <div>
          <span>新秀与年轻核心</span>
          <b>
            {
              roster.filter((p) =>
                ["core_rookie", "recent_rookie", "young_core"].includes(
                  p.cohort,
                ),
              ).length
            }
          </b>
          <small>覆盖 2020—2026 届</small>
        </div>
        <div>
          <span>热门卡片</span>
          <b>{printedCards.length}</b>
          <small>印刷球队归属</small>
        </div>
        <div>
          <span>风险信号</span>
          <b>{roster.filter((p) => p.riskLevel === "high").length}</b>
          <small>高风险演示标签</small>
        </div>
      </section>
      <div className="team-detail-grid">
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CURRENT ROSTER</span>
              <h2>当前球员</h2>
            </div>
          </div>
          <div className="person-list">
            {roster.length ? (
              roster.map((player) => (
                <Link href={`/players/${player.id}`} key={player.id}>
                  <span className="avatar-mono">
                    {player.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <b>{player.displayNameZh}</b>
                    <small>
                      {player.name} · {player.position} · {player.draftYear}{" "}
                      选秀
                    </small>
                    <PlayerCohortBadges player={player} compact />
                  </div>
                  <em>热度 {player.marketHeat}</em>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <b>演示名单暂无更多球员</b>
                <span>数据库结构已支持完整阵容导入。</span>
              </div>
            )}
          </div>
        </section>
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">PRINTED TEAM CARDS</span>
              <h2>印刷球队卡片</h2>
            </div>
          </div>
          <div className="simple-card-list">
            {printedCards.length ? (
              printedCards.map((card) => {
                const player = getPlayer(card.playerId)!;
                return (
                  <Link href={`/cards/${card.id}`} key={card.id}>
                    <span className="mini-card">
                      {player.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <b>{player.name}</b>
                      <small>
                        {card.releaseYear} {card.productLine}
                      </small>
                    </div>
                    <em>
                      {card.latestSaleCny
                        ? `¥${card.latestSaleCny.toLocaleString()}`
                        : "暂无成交"}
                    </em>
                  </Link>
                );
              })
            ) : (
              <div className="empty-state">
                <b>暂无演示卡片</b>
                <span>可通过后台或 CSV 导入。</span>
              </div>
            )}
          </div>
        </section>
      </div>
      <section className="data-panel timeline-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">EVENTS & HISTORY</span>
            <h2>伤病事件与历史关系</h2>
          </div>
        </div>
        <div className="timeline">
          <article>
            <span>2026-08-31</span>
            <div>
              <b>演示数据更新</b>
              <p>球队资料与卡片印刷归属完成演示同步。</p>
            </div>
          </article>
          <article>
            <span>历史关系</span>
            <div>
              <b>当前球队 ≠ 卡片印刷球队</b>
              <p>球员转会后，旧卡仍保留发行时的球队归属，筛选时可分别选择。</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
