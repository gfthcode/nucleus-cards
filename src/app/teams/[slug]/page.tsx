import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { CardIdentity } from "@/components/card-image";
import { activeAuctions } from "@/lib/auction-data";
import { cards, getPlayer, getTeam, sales, teams } from "@/lib/demo-data";
import { getTeamRosterSnapshot } from "@/lib/roster-sync";
import { getTeamCardCoverage, getPlayerCardMarketRows, getTeamRecentSales, getTeamTopCards } from "@/lib/team-market";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return teams.map((team) => ({ slug: team.slug }));
}

export default async function TeamPage({ params }: PageProps<"/teams/[slug]">) {
  const { slug } = await params;
  const team = getTeam(slug);
  if (!team) notFound();
  const rosterSnapshot = await getTeamRosterSnapshot(team);
  const roster = rosterSnapshot.players;
  const rosterIds = new Set(roster.map((player) => player.id));
  const teamCards = cards.filter((card) => rosterIds.has(card.playerId));
  const printedCards = cards.filter((card) => card.printedTeamId === team.id);
  const teamAuctions = activeAuctions.filter((auction) => rosterIds.has(auction.playerId));
  const playerMarketRows = getPlayerCardMarketRows(roster, cards, sales, teamAuctions);
  const coverage = getTeamCardCoverage(roster, cards, teamAuctions);
  const topCards = getTeamTopCards(roster, cards);
  const recentSales = getTeamRecentSales(roster, cards, sales);
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow={`${team.conference.toUpperCase()} · ${team.division.toUpperCase()}`}
        title={team.name}
        description={`${team.city} · 当前阵容对应的球员、球星卡、成交与拍卖活动。`}
        actions={
          <span className="team-hero-mark" style={{ background: team.color }}>
            {team.abbreviation}
          </span>
        }
      />
      <div className={`roster-source-note ${rosterSnapshot.source.configured ? "is-live" : "is-demo"}`}>
        <span className="status-dot" aria-hidden />
        <span>
          阵容来源：{rosterSnapshot.source.label} · {rosterSnapshot.source.message}
          {rosterSnapshot.roster?.fetchedAt
            ? ` · 更新于 ${new Date(rosterSnapshot.roster.fetchedAt).toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
            : ""}
        </span>
        <Link href={`/api/teams/${team.slug}/roster`} target="_blank">查看同步状态 ↗</Link>
      </div>
      <section className="team-summary-grid">
        <div>
          <span>当前球员</span>
          <b>{roster.length || "—"}</b>
          <small>当前阵容 · {rosterSnapshot.source.configured ? "授权同步" : "演示回退"}</small>
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
      <section className="data-panel team-intelligence-panel">
        <div className="section-heading">
          <div><span className="section-kicker">PLAYER CARD MARKET</span><h2>球员卡牌市场</h2></div>
          <small>默认按市场活跃度 · Heat 仅表示关注与成交活跃度</small>
        </div>
        <div className="team-market-table-wrap">
          <table className="team-market-table">
            <thead><tr><th>球员</th><th>卡牌</th><th>30D 成交</th><th>拍卖</th><th>RC</th><th>Card Heat</th><th /></tr></thead>
            <tbody>
              {playerMarketRows.map((row) => (
                <tr key={row.player.id}>
                  <td><Link href={`/players/${row.player.id}`} className="team-player-link"><b>{row.player.displayNameZh}</b><small>{row.player.position} · 当前球队</small></Link></td>
                  <td className="mono">{row.totalCards || "—"}<small>{row.verifiedCards} 已验证</small></td>
                  <td className="mono">{row.sales30d || "—"}<small>{row.hasEnoughPriceData ? (row.change30d == null ? "—" : `${row.change30d >= 0 ? "+" : ""}${row.change30d.toFixed(1)}%`) : "样本不足"}</small></td>
                  <td className="mono">{row.activeAuctions || "—"}<small>{row.auctionHeat == null ? "暂无热度" : `Heat ${row.auctionHeat}`}</small></td>
                  <td className="mono">{row.rookieCards || "—"}</td>
                  <td><span className={`heat-pill ${row.cardHeat == null ? "muted" : ""}`}>{row.cardHeat ?? "—"}</span></td>
                  <td><Link className="text-action" href={`/players/${row.player.id}`}>查看球星卡 →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="coverage-grid">
        <div className="data-panel coverage-panel">
          <div className="section-heading"><div><span className="section-kicker">TEAM CARD COVERAGE</span><h2>球队卡牌覆盖</h2></div><small>当前阵容 → 统一 Card Database</small></div>
          <div className="coverage-metrics">
            <div><span>当前球员</span><b>{coverage.currentPlayers}</b></div>
            <div><span>球员匹配</span><b>{coverage.playerMatch} / {coverage.currentPlayers}</b></div>
            <div><span>有卡球员</span><b>{coverage.playersWithCards} / {coverage.currentPlayers}</b></div>
            <div><span>卡牌总数</span><b>{coverage.totalCards || "—"}</b></div>
            <div><span>已验证覆盖</span><b>{coverage.verifiedCardCoverage == null ? "—" : `${coverage.verifiedCardCoverage}%`}</b></div>
            <div><span>市场数据覆盖</span><b>{coverage.marketDataCoverage == null ? "—" : `${coverage.marketDataCoverage}%`}</b></div>
          </div>
          {coverage.currentPlayers > coverage.playersWithCards && <p className="coverage-warning">仍有 {coverage.currentPlayers - coverage.playersWithCards} 名当前球员暂无已匹配卡牌，已保留在阵容中，等待 Card Import Queue。</p>}
        </div>
        <div className="data-panel">
          <div className="section-heading"><div><span className="section-kicker">ROOKIE MARKET</span><h2>球队新秀市场</h2></div></div>
          <div className="rookie-market-summary"><b>{playerMarketRows.filter((row) => row.player.draftYear >= new Date().getFullYear() - 1).length}</b><span>Current Rookies</span><small>与当前球员历史 Rookie Cards 分开计算 · 全部 {playerMarketRows.reduce((sum, row) => sum + row.rookieCards, 0)} 张 RC</small></div>
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
                <b>{rosterSnapshot.error ? "授权阵容暂时不可用" : "暂无当前阵容"}</b>
                <span>{rosterSnapshot.error ?? "数据库结构已支持完整阵容导入。"}</span>
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
      <section className="data-panel team-intelligence-panel">
        <div className="section-heading"><div><span className="section-kicker">RECENT TEAM CARD SALES</span><h2>近期球队卡牌成交</h2></div><small>仅显示已验证成交 · 不包含挂牌价</small></div>
        <div className="simple-card-list">
          {recentSales.map((sale) => {
            const card = cards.find((item) => item.id === sale.cardId);
            const player = card ? getPlayer(card.playerId) : undefined;
            if (!card || !player) return null;
            return <Link href={`/cards/${card.id}`} key={sale.id}><CardIdentity card={card} player={player} /><div className="sale-meta"><b>¥{sale.convertedCny.toLocaleString()}</b><small>{new Date(sale.soldAt).toLocaleDateString("zh-CN")} · {sale.communitySubmitted ? "社区提交" : "已验证来源"}</small></div><em className="sale-badge">REAL SALE</em></Link>;
          })}
          {!recentSales.length && <div className="empty-state"><b>暂无已验证成交</b><span>接入成交源或导入销售记录后显示。</span></div>}
        </div>
      </section>
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
