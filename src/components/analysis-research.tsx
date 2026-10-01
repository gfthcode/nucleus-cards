"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CircleAlert, ScanSearch, Sparkles } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import type { AIAnalysis } from "@/lib/ai-analysis";
import type { Card, Player } from "@/types/domain";
import styles from "./analysis-research.module.css";

type Period = "7-30d" | "1-3m";
type ResearchRow = {
  card: Card;
  player: Player;
  analyses: Record<Period, AIAnalysis>;
};

const periodOptions: { value: Period; label: string }[] = [
  { value: "7-30d", label: "近 30 日" },
  { value: "1-3m", label: "近 90 日" },
];

function directionLabel(analysis: AIAnalysis) {
  if (!analysis.marketEvidence.hasObservedPriceChange) return "缺少价格记录";
  if (analysis.trendDirection === "up") return "价格记录上行";
  if (analysis.trendDirection === "down") return "价格记录回落";
  return "价格记录平稳";
}

function formatChange(value: number | null) {
  if (value === null) return "暂无记录";
  return `${value > 0 ? "+" : ""}${value}%`;
}

export function AnalysisResearch({ rows }: { rows: ResearchRow[] }) {
  const [selectedCardId, setSelectedCardId] = useState(rows[0]?.card.id ?? "");
  const [period, setPeriod] = useState<Period>("7-30d");
  const selected = useMemo(
    () => rows.find((row) => row.card.id === selectedCardId) ?? rows[0],
    [rows, selectedCardId],
  );
  if (!selected) return null;

  const analysis = selected.analyses[period];
  const direction = directionLabel(analysis);
  const confidenceLabel =
    analysis.confidenceLevel === "high"
      ? "高"
      : analysis.confidenceLevel === "medium"
        ? "中"
        : "低";

  return (
    <main className={`${styles.page} page-shell inner-page`}>
      <header className={styles.masthead}>
        <div>
          <span>INTELLIGENCE DESK</span>
          <h1>先读证据，<br />再读结论。</h1>
          <p>
            研究结论来自明确列出的站内字段与规则；不会把规则结果包装成模型预测、投资建议或确定盈利概率。
          </p>
        </div>
        <aside>
          <Sparkles size={18} />
          <span>RULE-BASED RESEARCH · NOT AN LLM</span>
          <strong>{direction}</strong>
          <p>
            引擎 {analysis.modelVersion}<br />
            更新于 {analysis.generatedAt.slice(0, 10)}
          </p>
        </aside>
      </header>

      <section className={styles.controls} aria-label="研究筛选">
        <label>
          <span>研究卡片</span>
          <select
            value={selected.card.id}
            onChange={(event) => setSelectedCardId(event.target.value)}
          >
            {rows.map((row) => (
              <option key={row.card.id} value={row.card.id}>
                {row.player.displayNameZh} · {row.card.releaseYear} {row.card.brand} {row.card.parallel}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.periodPicker} role="group" aria-label="价格变化周期">
          {periodOptions.map((option) => (
            <button
              aria-pressed={period === option.value}
              key={option.value}
              onClick={() => setPeriod(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.lead}>
        <Link className={styles.visual} href={`/cards/${selected.card.id}`}>
          <CardVisual card={selected.card} player={selected.player} />
          <span>当前研究对象 <ArrowUpRight size={14} /></span>
        </Link>
        <div className={styles.thesis}>
          <span>证据摘要 · {analysis.marketEvidence.isDemo ? "演示行情" : "站内行情"}</span>
          <h2>
            {selected.player.displayNameZh}
            <small>{selected.card.releaseYear} {selected.card.brand} · {selected.card.parallel}</small>
          </h2>
          <p>{analysis.peerComparison}</p>
          <dl>
            <div>
              <dt>{analysis.observedPeriodLabel}价格变化记录</dt>
              <dd className={analysis.trendDirection === "up" ? styles.up : analysis.trendDirection === "down" ? styles.down : ""}>
                {formatChange(analysis.observedPriceChangePct)}
              </dd>
            </div>
            <div><dt>近 30 日成交样本</dt><dd>{analysis.marketEvidence.sales30d} 笔</dd></div>
            <div><dt>当前挂牌记录</dt><dd>{analysis.marketEvidence.listings} 条</dd></div>
          </dl>
          <Link href={`/cards/${selected.card.id}#analysis`}>查看这张卡的全部证据 <ArrowUpRight size={14} /></Link>
        </div>
        <aside className={styles.confidence}>
          <span>DATA CONFIDENCE</span>
          <strong>{confidenceLabel}</strong>
          <p>数据完整度 {analysis.dataCompleteness}/100</p>
          <i><b style={{ width: `${analysis.dataCompleteness}%` }} /></i>
          <small>
            {analysis.marketEvidence.isDemo
              ? "当前价格与成交数为演示数据，置信度保持低；不会因字段完整而提升。"
              : "置信度尚未校准；有记录不等于有独立核验的真实成交。"}
          </small>
        </aside>
      </section>

      {analysis.courtMatchContext ? (
        <section className={styles.courtMatch}>
          <div className={styles.courtMatchHeading}>
            <div>
              <span>COURTMATCH PLAYER CONTEXT · {analysis.courtMatchContext.season}</span>
              <h2>{selected.player.displayNameZh} 的赛场对位背景</h2>
            </div>
            <a href={analysis.courtMatchContext.sourceUrl} target="_blank" rel="noopener noreferrer">
              查看 CourtMatch <ArrowUpRight size={14} />
            </a>
          </div>
          <div className={styles.courtMatchMetrics}>
            <article>
              <span>进攻得分 / 100 次对位回合</span>
              <b>{analysis.courtMatchContext.offensePointsPer100MatchupPossessions?.toFixed(1) ?? "暂无"}</b>
              <small>{analysis.courtMatchContext.offenseMatchupPossessions.toLocaleString()} 次回合 · {analysis.courtMatchContext.offenseOpponentCount} 名对手</small>
            </article>
            <article>
              <span>防守端对手得分 / 100 次对位回合</span>
              <b>{analysis.courtMatchContext.defensePointsAllowedPer100MatchupPossessions?.toFixed(1) ?? "暂无"}</b>
              <small>{analysis.courtMatchContext.defenseMatchupPossessions.toLocaleString()} 次回合 · {analysis.courtMatchContext.defenseOpponentCount} 名对手</small>
            </article>
            <article>
              <span>球队 · CourtMatch 数据更新</span>
              <b>{analysis.courtMatchContext.teamAbbreviation} · {analysis.courtMatchContext.lastUpdated.slice(0, 10)}</b>
              <small>{analysis.courtMatchContext.status === "stale" ? "来源标记为 STALE，仅作历史背景" : `来源状态 ${analysis.courtMatchContext.status}`}</small>
            </article>
          </div>
          <p>{analysis.courtMatchContext.metricNote} 数据口径：{analysis.courtMatchContext.dataSource}；覆盖：{analysis.courtMatchContext.coverage}</p>
        </section>
      ) : (
        <section className={styles.courtMatchUnavailable}>
          <b>暂未匹配到 CourtMatch 球员记录</b>
          <span>系统采用严格球员姓名匹配；未唯一匹配时不会借用其他球员数据。</span>
        </section>
      )}

      <section className={styles.evidence}>
        <div><span>EVIDENCE LEDGER</span><h2>结论如何被支持，也如何被推翻。</h2></div>
        <div className={styles.ledger}>
          <article><b>正向观察</b>{analysis.keyPositiveFactors.map((factor) => <p key={factor}>＋ {factor}</p>)}</article>
          <article><b>风险与样本限制</b>{analysis.keyNegativeFactors.map((factor) => <p key={factor}>− {factor}</p>)}</article>
          <article><b>需要重新评估的条件</b>{analysis.invalidationEvents.slice(0, 3).map((factor) => <p key={factor}><CircleAlert size={13} />{factor}</p>)}</article>
        </div>
      </section>

      {analysis.recentPerformance && (
        <section className={styles.performance}>
          <div><span>PLAYER CONTEXT</span><h2>近期赛场表现</h2></div>
          <p>
            {analysis.recentPerformance.source} · 近 {analysis.recentPerformance.last5.length} 场 · 更新于 {analysis.recentPerformance.fetchedAt.slice(0, 10)}
          </p>
          <div className={styles.performanceStats}>
            {analysis.keyPositiveFactors.filter((factor) => factor.includes("PTS /")).map((factor) => <b key={factor}>{factor}</b>)}
          </div>
        </section>
      )}

      <section className={styles.queue}>
        <div className={styles.queueHeading}>
          <div><span>RESEARCH QUEUE</span><h2>继续阅读的卡片</h2></div>
          <p>按当前目录顺序展示研究入口，不构成买入或卖出建议。</p>
        </div>
        <div>
          {rows.filter((row) => row.card.id !== selected.card.id).map((row, index) => {
            const rowAnalysis = row.analyses[period];
            return (
              <article key={row.card.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Link href={`/cards/${row.card.id}`}>
                  <b>{row.player.displayNameZh}</b>
                  <small>{row.card.releaseYear} {row.card.brand} · {row.card.parallel}</small>
                </Link>
                <em className={rowAnalysis.trendDirection === "up" ? styles.up : rowAnalysis.trendDirection === "down" ? styles.down : ""}>
                  {formatChange(rowAnalysis.observedPriceChangePct)}
                </em>
                <p>{rowAnalysis.marketEvidence.isDemo ? "演示数据" : "站内记录"} · {rowAnalysis.marketEvidence.sales30d} 笔成交</p>
                <Link href={`/cards/${row.card.id}#analysis`} aria-label={`查看 ${row.player.displayNameZh} 分析`}><ScanSearch size={16} /></Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.sources}>
        <b>数据来源与时间</b>
        {analysis.evidence.map((evidence) => (
          <span key={`${evidence.label}-${evidence.source}`}>
            {evidence.label} · {evidence.source} · {evidence.updatedAt.slice(0, 10)}
          </span>
        ))}
      </section>
      <footer className={styles.disclaimer}>
        <b>研究边界</b>
        <span>{analysis.disclaimer} 本页面使用确定性规则，不是实时 LLM；价格变化不代表未来表现。</span>
      </footer>
    </main>
  );
}
