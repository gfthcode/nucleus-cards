import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardDetailHero } from "@/components/card-detail-hero";
import { PriceChart } from "@/components/price-chart";
import { productConfig } from "@/config/product";
import { DeterministicDemoAI } from "@/lib/ai-analysis";
import { getCourtMatchPlayerContext } from "@/lib/courtmatch-context";
import { calculateMarketReference } from "@/lib/market-math";
import Link from "next/link";
import { CardVisual } from "@/components/card-visual";
import { CardActions } from "@/components/card-actions";
import { getLocale } from "@/i18n/server";
import {
  cards,
  dataSources,
  getCard,
  getCardSales,
  getPlayer,
  getTeam,
} from "@/lib/demo-data";

export function generateStaticParams() {
  return cards.map((card) => ({ id: card.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/cards/[id]">): Promise<Metadata> {
  const { id } = await params;
  const card = getCard(id);
  const player = card ? getPlayer(card.playerId) : undefined;
  if (!card || !player) return { title: "卡片不存在" };
  const title = `${player.name} ${card.releaseYear} ${card.productLine} ${card.cardNumber}`;
  const description = `${card.parallel} · ${card.condition === "graded" ? `${card.gradingCompany} ${card.grade}` : "裸卡"} · ${card.photoEvidence ? "来源实物卡图目录 / Real card photo catalogue" : "Nucleus Cards 演示行情"}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [] },
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default async function CardPage({ params }: PageProps<"/cards/[id]">) {
  const { id } = await params;
  const card = getCard(id);
  if (!card) notFound();
  const player = getPlayer(card.playerId);
  if (!player) notFound();
  if (card.photoEvidence) {
    const en = await getLocale() === "en";
    return <main className="page-shell inner-page card-detail-page">
      <nav aria-label={en ? "Breadcrumbs" : "面包屑"}><Link href="/market">{en ? "Card market" : "球星卡目录"}</Link> / <Link href={`/players/${player.id}`}>{player.name}</Link></nav>
      <section className="data-panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 28, marginTop: 24 }}>
        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}><CardVisual card={card} player={player} density="image" /></div>
        <div><span className="section-kicker">{en ? "REAL CARD PHOTOGRAPH" : "真实实物卡图"}</span><h1>{player.name}</h1><h2>{card.releaseYear} {card.productLine} #{card.cardNumber}</h2><p>{card.parallel} · {card.gradingCompany} {card.grade}</p><p>{en ? "Original catalogue title" : "来源原始标题"}：{card.photoEvidence.title}</p><p>{en ? "Catalogue identity is source-reported. A photo is not a verified sale; no insurance appraisal or simulated amount is used as a market price." : "卡片身份由来源目录提供，评级以实物标签与来源详情为准。照片不是成交凭证，保险估值和模拟金额不会作为行情价格。"}</p>
          <p><a href={card.photoEvidence.sourceUrl} target="_blank" rel="noopener noreferrer">{en ? "View original card and photograph" : "查看原始卡片与图片来源"} ↗ · {card.photoEvidence.sourceName}</a></p><small>{en ? "Checked" : "核对时间"}：{card.photoEvidence.retrievedAt.slice(0, 10)}</small>
          <div style={{ marginTop: 24 }}><CardActions cardId={card.id} /><Link href={`/analysis?card=${card.id}`}>{en ? "Research this card" : "研究这张卡"}</Link></div>
        </div>
      </section>
      <section className="data-panel" style={{ marginTop: 24 }}><h2>{en ? "Price evidence unavailable" : "暂无已核验成交价格"}</h2><p>{en ? "No invented sale, trend chart or prediction is generated for this photograph. Compare the exact year, number, parallel and grade when new evidence is available." : "不会为这张照片生成虚构成交、走势或预测。补充价格证据时，将核对年份、卡号、平行版本和评级。"}</p></section>
    </main>;
  }
  const currentTeam = player.currentTeamId
    ? getTeam(player.currentTeamId)
    : undefined;
  const printedTeam = card.printedTeamId
    ? getTeam(card.printedTeamId)
    : undefined;
  const cardSales = getCardSales(card.id);
  const marketReference = calculateMarketReference(cardSales);
  const ai = await new DeterministicDemoAI().analyze(
    card,
    player,
    "7-30d",
    null,
    getCourtMatchPlayerContext(player.name),
  );
  const trustedSales = cardSales.filter(
    (sale) => sale.verified && !sale.isOutlier && !sale.isBundle,
  );
  const latestSource = (id: string) =>
    dataSources.find((source) => source.id === id)?.name ?? "未披露";
  return (
    <main className="page-shell inner-page card-detail-page">
      <CardDetailHero card={card} player={player} currentTeam={currentTeam} printedTeam={printedTeam} reference={marketReference} />
      {!marketReference.precise && (
        <div className="data-warning">
          <b>样本不足</b>
          <span>当前仅展示价格区间，不生成虚假精确参考价。</span>
        </div>
      )}
      <section className="data-panel chart-panel">
        <PriceChart />
      </section>
      <div className="card-info-grid">
        <section className="data-panel" id="recent-sales">
          <div className="section-heading">
            <div>
              <span className="section-kicker">TRANSACTIONS</span>
              <h2>成交样本记录</h2>
            </div>
            <small>{trustedSales.length} 笔纳入计算</small>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>成交时间</th>
                  <th>来源</th>
                  <th>原始价格</th>
                  <th>换算 CNY</th>
                  <th>汇率</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {cardSales.length ? (
                  cardSales.map((sale) => (
                    <tr
                      className={sale.isOutlier ? "excluded-row" : ""}
                      key={sale.id}
                    >
                      <td>
                        {new Date(sale.soldAt).toLocaleDateString("zh-CN")}
                      </td>
                      <td>
                        <b>{latestSource(sale.sourceId)}</b>
                        <small>
                          {sale.communitySubmitted
                            ? "社区提交"
                            : card.demo ? "演示来源 · 无外部成交凭证" : sale.verified ? "来源已核验" : "待外部核验"}
                        </small>
                      </td>
                      <td>
                        {sale.originalCurrency}{" "}
                        {sale.originalAmount.toLocaleString()}
                      </td>
                      <td>¥{sale.convertedCny.toLocaleString()}</td>
                      <td>{sale.exchangeRate}</td>
                      <td>
                        {sale.isOutlier ? (
                          <span className="risk-pill high">已排除异常</span>
                        ) : sale.verified && !card.demo ? (
                          <span className="risk-pill low">已核验</span>
                        ) : card.demo ? (
                          <span className="risk-pill medium">演示样本</span>
                        ) : (
                          <span className="risk-pill medium">待审核</span>
                        )}
                        {sale.excludedReason && (
                          <small>{sale.excludedReason}</small>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <b>暂无可信成交数据</b>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">RISK SIGNALS</span>
              <h2>风险标签</h2>
            </div>
            <span className={`risk-pill ${card.riskLevel}`}>
              {card.riskLevel === "high"
                ? "高"
                : card.riskLevel === "medium"
                  ? "中"
                  : "低"}
              风险
            </span>
          </div>
          <div className="risk-detail-list">
            <article>
              <b>流动性风险</b>
              <span>
                评分 {card.liquidity}/100；
                {card.sales30d < 4 ? "成交样本不足" : "成交频率尚可"}。
              </span>
              <small>影响：双向 · 可信度中</small>
            </article>
            <article>
              <b>评级溢价风险</b>
              <span>
                {card.condition === "graded"
                  ? `${card.gradingCompany} ${card.grade} 与裸卡不可直接比较。`
                  : "当前为裸卡，需注意品相差异。"}
              </span>
              <small>影响：双向 · 可信度高</small>
            </article>
            <article>
              <b>伤病风险</b>
              <span>
                {player.injuryStatus === "healthy"
                  ? "无新增演示信号。"
                  : "存在需观察的球员状态，不作医学诊断。"}
              </span>
              <small>来源：演示资料 · 更新时间 2026-08-31</small>
            </article>
            <article>
              <b>汇率风险</b>
              <span>跨 CNY、HKD、USD 成交会受成交时点汇率影响。</span>
              <small>影响：双向 · 可信度高</small>
            </article>
          </div>
        </section>
      </div>
      <section className="ai-analysis-panel" id="analysis">
        <header>
          <div>
            <span>规则辅助研究 · {ai.modelVersion}</span>
            <h2>证据与趋势观察</h2>
          </div>
          <div>
            <small>模型置信度</small>
            <b>
              {ai.confidenceLevel === "high"
                ? "高"
                : ai.confidenceLevel === "medium"
                  ? "中"
                  : "低"}
            </b>
          </div>
        </header>
        <div className="ai-prob-grid">
          <div>
            <span>{ai.observedPeriodLabel}价格变化记录</span>
            <b className={ai.trendDirection === "up" ? "up" : ai.trendDirection === "down" ? "down" : ""}>
              {ai.observedPriceChangePct === null
                ? "暂无记录"
                : `${ai.observedPriceChangePct > 0 ? "+" : ""}${ai.observedPriceChangePct}%`}
            </b>
          </div>
          <div>
            <span>近 30 日成交样本</span>
            <b>{ai.marketEvidence.sales30d} 笔</b>
          </div>
          <div>
            <span>当前挂牌记录</span>
            <b>{ai.marketEvidence.listings} 条</b>
          </div>
          <div>
            <span>流动性评分</span>
            <b>{ai.marketEvidence.liquidity}/100</b>
          </div>
        </div>
        <p className="ai-analysis-data-note">
          {ai.marketEvidence.isDemo
            ? "演示行情：价格变化、成交和挂牌数字仅用于展示，不代表真实市场数据。"
            : "站内行情记录不等同于独立核验的成交凭证。"}
          {ai.marketEvidence.hasObservedPriceChange
            ? ` 当前观察方向：${ai.trendDirection === "up" ? "价格记录上行" : ai.trendDirection === "down" ? "价格记录回落" : "价格记录平稳"}。`
            : " 当前周期缺少价格变化记录。"}
        </p>
        {ai.courtMatchContext && (
          <section className="ai-courtmatch-context" aria-labelledby="courtmatch-context-title">
            <div className="ai-courtmatch-heading">
              <div>
                <span>CourtMatch Analytics · {ai.courtMatchContext.season}</span>
                <h3 id="courtmatch-context-title">球员对位表现背景</h3>
              </div>
              <a href={ai.courtMatchContext.sourceUrl} target="_blank" rel="noopener noreferrer">查看引流站数据 ↗</a>
            </div>
            <div className="ai-courtmatch-metrics">
              <div>
                <span>进攻 · 得分 / 100 次对位回合</span>
                <b>{ai.courtMatchContext.offensePointsPer100MatchupPossessions?.toFixed(1) ?? "暂无"}</b>
                <small>{ai.courtMatchContext.offenseMatchupPossessions.toLocaleString()} 次对位回合 · {ai.courtMatchContext.offenseOpponentCount} 名对手</small>
              </div>
              <div>
                <span>防守 · 对手得分 / 100 次对位回合</span>
                <b>{ai.courtMatchContext.defensePointsAllowedPer100MatchupPossessions?.toFixed(1) ?? "暂无"}</b>
                <small>{ai.courtMatchContext.defenseMatchupPossessions.toLocaleString()} 次对位回合 · {ai.courtMatchContext.defenseOpponentCount} 名对手</small>
              </div>
              <div>
                <span>球队 · 数据更新时间</span>
                <b>{ai.courtMatchContext.teamAbbreviation}</b>
                <small>{ai.courtMatchContext.lastUpdated.slice(0, 10)} · {ai.courtMatchContext.status === "stale" ? "来源已标记为过期" : "来源状态 " + ai.courtMatchContext.status}</small>
              </div>
            </div>
            <p>{ai.courtMatchContext.metricNote} 覆盖说明：{ai.courtMatchContext.coverage}</p>
          </section>
        )}
        <div className="ai-peer-comparison">
          <span>同届 / 同代际对比</span>
          <p>{ai.peerComparison}</p>
        </div>
        <div className="ai-columns">
          <div>
            <h3>正面因素</h3>
            {ai.keyPositiveFactors.map((factor) => (
              <p key={factor}>＋ {factor}</p>
            ))}
          </div>
          <div>
            <h3>负面与流动性因素</h3>
            {[...ai.keyNegativeFactors, ...ai.liquidityFactors].map(
              (factor) => (
                <p key={factor}>− {factor}</p>
              ),
            )}
          </div>
          <div>
            <h3>可能推翻判断的事件</h3>
            {ai.invalidationEvents.map((factor) => (
              <p key={factor}>↯ {factor}</p>
            ))}
          </div>
        </div>
        <footer>
          <div>
            {ai.evidence.map((evidence) => (
              <span key={evidence.label}>
                {evidence.label} · {evidence.source} ·{" "}
                {new Date(evidence.updatedAt).toLocaleString("zh-CN")}
              </span>
            ))}
          </div>
          <p>{productConfig.disclaimer}</p>
        </footer>
      </section>
    </main>
  );
}
