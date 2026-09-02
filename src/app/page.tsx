import Link from "next/link";
import { cards, getTeam, players } from "@/lib/demo-data";
import { getPlayerCohortLabel } from "@/lib/player-cohorts";

const movers = [
  {
    player: "Cooper Flagg",
    card: "2025 Topps Chrome RC",
    price: "¥8,420",
    change: "+12.8%",
    positive: true,
  },
  {
    player: "Victor Wembanyama",
    card: "2023 Prizm Silver RC",
    price: "¥6,780",
    change: "+7.4%",
    positive: true,
  },
  {
    player: "Dylan Harper",
    card: "2025 Topps Basketball RC",
    price: "¥2,160",
    change: "+5.9%",
    positive: true,
  },
  {
    player: "Ace Bailey",
    card: "2025 Finest Gold /50",
    price: "¥3,350",
    change: "−4.6%",
    positive: false,
  },
];

const draftYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function Home() {
  const draftWatch = draftYears.map((year) => {
    const player = players
      .filter((item) => item.draftYear === year)
      .sort((a, b) => b.marketHeat - a.marketHeat)[0];
    const playerCard = cards.find((item) => item.playerId === player?.id);
    return {
      year,
      player,
      team: player?.currentTeamId
        ? getTeam(player.currentTeamId)?.abbreviation
        : "待定",
      change: playerCard?.change30d,
    };
  });
  const cohortWatch = [
    ["核心新秀", players.filter((player) => player.isCoreRookie)],
    [
      "2020—2024 近年新秀",
      players.filter((player) => player.cohort === "recent_rookie"),
    ],
    ["年轻核心", players.filter((player) => player.cohort === "young_core")],
    [
      "当打 / 角色球员",
      players.filter(
        (player) => player.cohort === "prime" || player.isRolePlayer,
      ),
    ],
    [
      "老将 / 退役传奇",
      players.filter(
        (player) =>
          player.cohort === "veteran" || player.cohort === "retired_legend",
      ),
    ],
    [
      "交易与签约热点",
      players.filter((player) => player.isTradeHot || player.isSigningHot),
    ],
  ] as const;
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />
            演示数据 · 更新于 09:30 CST
          </div>
          <h1>
            看清每一张卡的
            <br />
            <span>价格、热度与风险</span>
          </h1>
          <p className="hero-copy">
            面向中国内地与香港收藏者的 NBA
            球星卡行情工作台。真实成交与在售标价分开呈现，拒绝用低样本制造虚假精确。
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/market">
              浏览行情 <span aria-hidden>→</span>
            </Link>
            <Link className="button button-secondary" href="/rookies/2025">
              查看 2025 新秀
            </Link>
          </div>
        </div>
        <div className="hero-chart" aria-label="市场指数近七日演示图">
          <div className="chart-heading">
            <span>市场综合指数</span>
            <strong>1,284.6</strong>
          </div>
          <div className="chart-change">
            近 7 日 <b>+4.82%</b>
          </div>
          <div className="sparkline" aria-hidden>
            <i style={{ height: "24%" }} />
            <i style={{ height: "34%" }} />
            <i style={{ height: "29%" }} />
            <i style={{ height: "48%" }} />
            <i style={{ height: "44%" }} />
            <i style={{ height: "65%" }} />
            <i style={{ height: "59%" }} />
            <i style={{ height: "75%" }} />
            <i style={{ height: "70%" }} />
            <i style={{ height: "88%" }} />
            <i style={{ height: "82%" }} />
            <i style={{ height: "96%" }} />
          </div>
          <div className="chart-axis">
            <span>08/25</span>
            <span>08/28</span>
            <span>08/31</span>
          </div>
        </div>
      </section>

      <section className="metric-grid" aria-label="今日市场概览">
        {[
          ["今日成交样本", "1,248", "+18.2%", "up"],
          ["中位成交额", "¥2,860", "+3.6%", "up"],
          ["低流动性占比", "24.7%", "需留意", "warn"],
          ["数据覆盖率", "78.4%", "18 个来源", "neutral"],
        ].map(([label, value, note, tone]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small className={tone}>{note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="data-panel movers-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">MARKET PULSE</span>
              <h2>今日价格异动</h2>
            </div>
            <Link href="/market">查看全部 →</Link>
          </div>
          <div className="mover-list">
            {movers.map((item, index) => (
              <Link
                href={`/cards/${index + 1}`}
                className="mover-row"
                key={item.player}
              >
                <span className="rank">0{index + 1}</span>
                <span className="player-cell">
                  <b>{item.player}</b>
                  <small>{item.card}</small>
                </span>
                <span className="price-cell">
                  <b>{item.price}</b>
                  <small>可信成交 · 14 笔</small>
                </span>
                <span className={item.positive ? "change up" : "change down"}>
                  {item.change}
                </span>
              </Link>
            ))}
          </div>
        </article>

        <article className="data-panel risk-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">RISK RADAR</span>
              <h2>风险雷达</h2>
            </div>
            <Link href="/methodology">方法说明 →</Link>
          </div>
          <div className="risk-score">
            <div>
              <strong>6</strong>
              <span>项信号上升</span>
            </div>
            <p>伤病与低成交量是今日主要风险来源。</p>
          </div>
          <div className="risk-item">
            <span className="risk-icon">!</span>
            <div>
              <b>伤病风险上升</b>
              <small>3 位关注球员出现新增事件</small>
            </div>
            <em>高</em>
          </div>
          <div className="risk-item">
            <span className="risk-icon muted">≈</span>
            <div>
              <b>样本不足</b>
              <small>12 张卡近 30 日少于 3 笔成交</small>
            </div>
            <em className="medium">中</em>
          </div>
          <div className="risk-item">
            <span className="risk-icon muted">↯</span>
            <div>
              <b>价格异常</b>
              <small>4 笔成交等待人工复核</small>
            </div>
            <em className="medium">中</em>
          </div>
        </article>
      </section>

      <section className="data-panel draft-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">DRAFT CLASS WATCH</span>
            <h2>新秀届观察</h2>
          </div>
          <div className="year-links">
            {draftYears.map((year) => (
              <Link href={`/rookies/${year}`} key={year}>
                {year}
              </Link>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>选秀届</th>
                <th>球员 / 球队</th>
                <th>市场热度</th>
                <th>30 日变化</th>
                <th>风险</th>
                <th>AI 观察</th>
              </tr>
            </thead>
            <tbody>
              {draftWatch.map((row) => (
                <tr key={row.year}>
                  <td>
                    <span className="year-tag">{row.year}</span>
                  </td>
                  <td>
                    <b>{row.player?.name ?? "暂无代表球员"}</b>
                    <small>{row.team}</small>
                  </td>
                  <td>
                    <div className="heat">
                      <span
                        style={{ width: `${row.player?.marketHeat ?? 0}%` }}
                      />
                    </div>
                    <small>{row.player?.marketHeat ?? 0}/100</small>
                  </td>
                  <td className={(row.change ?? 0) >= 0 ? "up" : "down"}>
                    {row.change == null
                      ? "暂无可信变化"
                      : `${row.change > 0 ? "+" : ""}${row.change}%`}
                  </td>
                  <td>
                    <span
                      className={`risk-badge ${row.player?.riskLevel === "high" ? "high" : ""}`}
                    >
                      {row.player?.riskLevel === "high"
                        ? "高"
                        : row.player?.riskLevel === "medium"
                          ? "中"
                          : "低"}
                      风险
                    </span>
                  </td>
                  <td>
                    <span className="observation">
                      {row.player
                        ? `${getPlayerCohortLabel(row.player)} · 同届 #${row.player.peerRank ?? "—"}`
                        : "暂无演示数据"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="data-panel cohort-watch-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PLAYER COHORTS</span>
            <h2>球员代际与市场热点</h2>
          </div>
          <Link href="/market">按代际筛选 →</Link>
        </div>
        <div className="cohort-watch-grid">
          {cohortWatch.map(([label, cohort]) => (
            <article key={label}>
              <span>{label}</span>
              <b>{cohort.length} 位演示球员</b>
              <p>
                {cohort
                  .slice(0, 3)
                  .map((player) => player.displayNameZh)
                  .join(" · ") || "暂无演示样本"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <span>DATA INTEGRITY</span>
          <h2>不把标价当成交，不把估算当事实。</h2>
        </div>
        <p>
          所有行情保留原始币种、来源、样本量与授权状态。演示模式数据均有明确标识。
        </p>
        <Link href="/methodology">了解数据方法</Link>
      </section>
    </main>
  );
}
