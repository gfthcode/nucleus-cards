import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { CardIdentity } from "@/components/card-image";
import { activeAuctions } from "@/lib/auction-data";
import { cards, getCurrentTeamPlayers, getPlayer, getTeam, teams } from "@/lib/demo-data";

export function generateStaticParams() {
  return teams.map((team) => ({ slug: team.slug }));
}

export default async function TeamPage({ params }: PageProps<"/teams/[slug]">) {
  const { slug } = await params;
  const team = getTeam(slug);
  if (!team) notFound();
  const roster = getCurrentTeamPlayers(team.id);
  const rosterIds = new Set(roster.map((player) => player.id));
  const teamCards = cards.filter((card) => rosterIds.has(card.playerId));
  const printedCards = cards.filter((card) => card.printedTeamId === team.id);
  const teamAuctions = activeAuctions.filter((auction) => rosterIds.has(auction.playerId));
  const topCards = [...teamCards].sort((a, b) => (b.liquidity + (b.sales30d * 2)) - (a.liquidity + (a.sales30d * 2))).slice(0, 6);
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow={`${team.conference.toUpperCase()} · ${team.division.toUpperCase()}`}
        title={team.name}
        description={`${team.city} · 当前阵容对应的球员、球星卡、成交与拍卖活动。数据源接入前显示为演示资料。`}
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
          <small>当前阵容 · 演示同步</small>
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
          <b>{teamCards.length}</b>
          <small>当前球员关联卡片</small>
        </div>
        <div>
          <span>风险信号</span>
          <b>{teamAuctions.length}</b>
          <small>活跃拍卖 · Auction Heat</small>
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
                      {player.name} · {player.position} · Rookie Class {player.draftYear}
                    </small>
                    <PlayerCohortBadges player={player} compact />
                  </div>
                  <em>卡牌热度 {player.marketHeat} · {teamCards.filter((card) => card.playerId === player.id).length} 卡</em>
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
      <section className="data-panel team-intelligence-panel"><div className="section-heading"><div><span className="section-kicker">TOP CARDS · ROOKIE CARDS</span><h2>该球队热门球星卡</h2></div><small>按市场活动排序 · Heat 不等于价格回报</small></div><div className="team-card-grid">{topCards.map((card) => { const player = getPlayer(card.playerId)!; return <Link href={`/cards/${card.id}`} key={card.id}><CardIdentity card={card} player={player} /><span className="team-card-metrics">{card.rookie ? "ROOKIE · " : ""}成交 {card.sales30d} · 流动性 {card.liquidity}</span></Link>; })}</div></section>
      <section className="data-panel team-intelligence-panel"><div className="section-heading"><div><span className="section-kicker">AUCTION ACTIVITY</span><h2>球队热门拍卖</h2></div><Link href="/auction-radar">进入拍卖雷达 →</Link></div><div className="simple-card-list">{teamAuctions.slice(0, 5).map((auction) => <Link href="/auction-radar" key={auction.id}><span className="mini-card">{auction.heatScore}</span><div><b>{auction.playerName}</b><small>{auction.setName} · {auction.parallel} · {auction.bidCount} bids</small></div><em>{auction.currency === "CNY" ? "¥" : "$"}{auction.currentBid.toLocaleString()} · Heat {auction.heatScore}</em></Link>)}{!teamAuctions.length && <div className="empty-state"><b>暂无球队拍卖数据</b><span>接入授权拍卖源后将在此聚合。</span></div>}</div></section>
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
