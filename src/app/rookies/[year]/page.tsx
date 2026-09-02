import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { RookieComparison } from "@/components/rookie-comparison";
import { RookieComparePool } from "@/components/rookie-compare-pool";
import { cards, getTeam, players } from "@/lib/demo-data";

const draftYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export function generateStaticParams() {
  return draftYears.map((year) => ({ year: String(year) }));
}

export default async function RookiePage({
  params,
}: PageProps<"/rookies/[year]">) {
  const { year } = await params;
  if (!draftYears.includes(Number(year))) notFound();
  const draftYear = Number(year);
  const rookies = players.filter((player) => player.draftYear === draftYear);
  const heatLeader = [...rookies].sort(
    (a, b) => b.marketHeat - a.marketHeat,
  )[0];
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow="DRAFT CLASS"
        title={`${year} 选秀届新秀专区`}
        description="按选秀年份定义新秀届，而不是卡片发行年份。排名为 AI 综合观察，不是投资或收益排行榜。"
        actions={
          <div className="year-switch">
            {draftYears.map((item) => (
              <Link
                className={year === String(item) ? "active" : ""}
                href={`/rookies/${item}`}
                key={item}
              >
                {item}
              </Link>
            ))}
          </div>
        }
      />
      <section className="rookie-leader-grid">
        {[
          ["价格涨幅榜", heatLeader?.displayNameZh, "近 30 日"],
          ["成交量榜", rookies[0]?.displayNameZh, "演示样本"],
          [
            "市场热度榜",
            heatLeader?.displayNameZh,
            `${heatLeader?.marketHeat ?? 0}/100`,
          ],
          [
            "伤病风险榜",
            rookies.find((p) => p.injuryStatus !== "healthy")?.displayNameZh ??
              "暂无信号",
            "不作医学判断",
          ],
        ].map(([title, name, note], index) => (
          <article key={String(title)}>
            <span>0{index + 1}</span>
            <div>
              <small>{title}</small>
              <b>{name}</b>
              <em>{note}</em>
            </div>
          </article>
        ))}
      </section>
      <section className="data-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">AI OBSERVATION BOARD</span>
            <h2>AI 综合观察榜</h2>
          </div>
          <small>确定性演示引擎 · 结构化输出</small>
        </div>
        <div className="rookie-table table-wrap">
          <table>
            <thead>
              <tr>
                <th>顺位 / 球员</th>
                <th>球队与位置</th>
                <th>比赛表现</th>
                <th>卡市数据</th>
                <th>热度</th>
                <th>趋势观察</th>
                <th>风险 / 完整度</th>
              </tr>
            </thead>
            <tbody>
              {rookies.map((player) => {
                const team = player.currentTeamId
                  ? getTeam(player.currentTeamId)
                  : undefined;
                const playerCard = cards.find(
                  (card) => card.playerId === player.id,
                );
                return (
                  <tr key={player.id}>
                    <td>
                      <Link href={`/players/${player.id}`}>
                        <span className="draft-pick">
                          #{player.draftPick ?? "—"}
                        </span>
                        <b>{player.displayNameZh}</b>
                        <small>{player.name}</small>
                        <PlayerCohortBadges player={player} compact />
                      </Link>
                    </td>
                    <td>
                      <b>
                        {team?.abbreviation ?? "TBD"} · {player.position}
                      </b>
                      <small>
                        {player.age} 岁 · {player.minutes} 分钟
                      </small>
                    </td>
                    <td>
                      <b>
                        {player.points} / {player.rebounds} / {player.assists}
                      </b>
                      <small>得分 / 篮板 / 助攻</small>
                    </td>
                    <td>
                      <b>{playerCard?.sales30d ?? 0} 笔成交</b>
                      <small>
                        {playerCard?.change30d == null
                          ? "暂无可信价格变化"
                          : `30 日 ${playerCard.change30d > 0 ? "+" : ""}${playerCard.change30d}%`}
                      </small>
                    </td>
                    <td>
                      <div className="heat">
                        <span style={{ width: `${player.marketHeat}%` }} />
                      </div>
                      <small>{player.marketHeat}/100</small>
                    </td>
                    <td>
                      <span className="observation">
                        同届 #{player.peerRank ?? "—"} ·{" "}
                        {player.valuationSignal === "overheated"
                          ? "估值偏热"
                          : player.valuationSignal === "underfollowed"
                            ? "关注不足"
                            : "估值均衡"}
                      </span>
                      <small>{player.peerComparison}</small>
                    </td>
                    <td>
                      <span className={`risk-pill ${player.riskLevel}`}>
                        {player.riskLevel === "high"
                          ? "高"
                          : player.riskLevel === "medium"
                            ? "中"
                            : "低"}
                        风险
                      </span>
                      <small>{playerCard?.dataCompleteness ?? 38}% 完整</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <RookieComparison players={players} cards={cards} />
      <RookieComparePool players={rookies} cards={cards} />
      <section className="comparison-panel">
        <div>
          <span className="section-kicker">COMPARE</span>
          <h2>新秀横向对比</h2>
          <p>
            对比上场时间、基础表现、同位置竞争、伤病记录、成交量、卡价变化与数据完整度。
          </p>
        </div>
        {rookies.map((player) => (
          <article key={player.id}>
            <b>{player.displayNameZh}</b>
            <div>
              <span style={{ width: `${Math.min(100, player.points * 3)}%` }}>
                表现
              </span>
            </div>
            <div>
              <span style={{ width: `${player.marketHeat}%` }}>热度</span>
            </div>
            <div className="risk-bar">
              <span
                style={{
                  width: `${player.riskLevel === "high" ? 80 : player.riskLevel === "medium" ? 55 : 30}%`,
                }}
              >
                风险
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
