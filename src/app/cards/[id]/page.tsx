import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardActions } from "@/components/card-actions";
import { CardVisual } from "@/components/card-visual";
import { CurrencyValue } from "@/components/currency-switcher";
import { PriceChart } from "@/components/price-chart";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { productConfig } from "@/config/product";
import { DeterministicDemoAI } from "@/lib/ai-analysis";
import { calculateMarketReference } from "@/lib/market-math";
import { getPlayerCohortLabel } from "@/lib/player-cohorts";
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
  const description = `${card.parallel} · ${card.condition === "graded" ? `${card.gradingCompany} ${card.grade}` : "裸卡"} · Nucleus Cards 演示行情`;
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
  const currentTeam = player.currentTeamId
    ? getTeam(player.currentTeamId)
    : undefined;
  const printedTeam = card.printedTeamId
    ? getTeam(card.printedTeamId)
    : undefined;
  const cardSales = getCardSales(card.id);
  const marketReference = calculateMarketReference(cardSales);
  const ai = await new DeterministicDemoAI().analyze(card, player, "7-30d");
  const trustedSales = cardSales.filter(
    (sale) => !sale.isOutlier && !sale.isBundle,
  );
  const latestSource = (id: string) =>
    dataSources.find((source) => source.id === id)?.name ?? "未披露";
  return (
    <main className="page-shell inner-page card-detail-page">
      <nav className="breadcrumbs" aria-label="面包屑">
        <Link href="/market">行情市场</Link>
        <span>›</span>
        <Link href={`/players/${player.id}`}>{player.name}</Link>
        <span>›</span>
        <b>{card.cardNumber}</b>
      </nav>
      <section className="card-hero-grid">
        <div className="card-gallery">
          <CardVisual card={card} player={player} />
          <CardVisual card={card} player={player} side="back" />
          <small>正反面均为演示占位图，不代表真实卡面。</small>
        </div>
        <div className="card-overview">
          <div className="tag-row">
            <i>{card.demo ? "演示数据" : "已验证"}</i>
            {card.rookie && <i>ROOKIE CARD</i>}
            <i>{card.type}</i>
            <i>{card.parallel}</i>
          </div>
          <PlayerCohortBadges player={player} />
          <h1>{player.name}</h1>
          <h2>
            {card.releaseYear} {card.productLine} {card.cardNumber}
          </h2>
          <p>
            {card.parallel}
            {card.printRun ? ` /${card.printRun}` : ""} ·{" "}
            {card.autograph ? (card.autographType ?? "签字") : "非签字"} ·{" "}
            {card.memorabilia ? (card.materialType ?? "含物料") : "无物料"}
          </p>
          <div className="identity-box">
            <span>稳定身份键</span>
            <code>{card.identityKey}</code>
            <small>数据匹配置信度 {card.matchConfidence}%</small>
          </div>
          <div className="team-relation">
            <div>
              <span>球员当前球队</span>
              <b>{currentTeam?.name ?? "退役 / 未披露"}</b>
            </div>
            <div>
              <span>卡片印刷球队</span>
              <b>{printedTeam?.name ?? "未披露"}</b>
            </div>
          </div>
          <CardActions />
        </div>
        <aside className="quote-panel">
          <div className="quote-label">
            <span>最新真实成交</span>
            <em>{marketReference.samples} 笔计算样本</em>
          </div>
          <CurrencyValue cny={card.latestSaleCny} />
          <div className="quote-separator" />
          <div className="listing-quote">
            <span>最新在售标价</span>
            <b>
              {card.latestListingCny
                ? `¥${card.latestListingCny.toLocaleString()}`
                : "暂无在售"}
            </b>
            <small>在售不是成交，不能用于历史收益计算</small>
          </div>
          <div className="period-grid">
            {[
              ["7日", card.change7d],
              ["30日", card.change30d],
              ["90日", card.change90d],
              ["1年", card.change1y],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <span>{label}</span>
                <b className={(Number(value) || 0) >= 0 ? "up" : "down"}>
                  {value == null
                    ? "—"
                    : `${Number(value) > 0 ? "+" : ""}${value}%`}
                </b>
              </div>
            ))}
          </div>
        </aside>
      </section>
      <section className="market-stat-grid">
        {[
          [
            "历史区间",
            marketReference.range
              ? `¥${marketReference.range[0].toLocaleString()}—¥${marketReference.range[1].toLocaleString()}`
              : "暂无",
          ],
          ["30 日成交量", `${card.sales30d} 笔`],
          ["当前在售", `${card.listingsCount} 张`],
          ["流动性", `${card.liquidity}/100`],
          ["数据完整度", `${card.dataCompleteness}%`],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </section>
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
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">TRANSACTIONS</span>
              <h2>真实成交记录</h2>
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
                            : "演示平台记录"}
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
                        ) : sale.verified ? (
                          <span className="risk-pill low">已验证</span>
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
      <section className="ai-analysis-panel">
        <header>
          <div>
            <span>DETERMINISTIC AI · {ai.modelVersion}</span>
            <h2>AI 辅助趋势分析</h2>
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
            <span>球员代际</span>
            <b>{getPlayerCohortLabel(player)}</b>
          </div>
          <div>
            <span>上行观察区间</span>
            <b className="up">{ai.upwardProbabilityRange.join("–")}%</b>
          </div>
          <div>
            <span>中性观察区间</span>
            <b>{ai.neutralProbabilityRange.join("–")}%</b>
          </div>
          <div>
            <span>下行观察区间</span>
            <b className="down">{ai.downwardProbabilityRange.join("–")}%</b>
          </div>
        </div>
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
