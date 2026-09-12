import Link from "next/link";
import { ArrowUpRight, CircleAlert, ScanSearch, Sparkles } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import type { AIAnalysis } from "@/lib/ai-analysis";
import type { Card, Player } from "@/types/domain";
import styles from "./analysis-research.module.css";

type ResearchRow = { card: Card; player: Player; analysis: AIAnalysis };

export function AnalysisResearch({ rows }: { rows: ResearchRow[] }) {
  const lead = rows[0];
  if (!lead) return null;
  const direction = lead.analysis.trendDirection === "up" ? "上行观察" : lead.analysis.trendDirection === "down" ? "回撤观察" : "中性观察";
  return <main className={`${styles.page} page-shell inner-page`}>
    <header className={styles.masthead}>
      <div><span>INTELLIGENCE DESK</span><h1>先读证据，<br />再读结论。</h1><p>这是基于站内演示规则生成的研究界面。它展示因子、样本和可推翻条件，而不是制造“确定盈利”的叙事。</p></div>
      <aside><Sparkles size={18} /><span>DETERMINISTIC RESEARCH</span><strong>{direction}</strong><p>模型版本 {lead.analysis.modelVersion}<br />更新时间 {new Date(lead.analysis.generatedAt).toLocaleDateString("zh-CN")}</p></aside>
    </header>
    <section className={styles.lead}>
      <Link className={styles.visual} href={`/cards/${lead.card.id}`}><CardVisual card={lead.card} player={lead.player} /><span>当前研究对象 <ArrowUpRight size={14} /></span></Link>
      <div className={styles.thesis}><span>RESEARCH THESIS / 01</span><h2>{lead.player.displayNameZh}<small>{lead.card.releaseYear} {lead.card.brand} · {lead.card.parallel}</small></h2><p>{lead.analysis.peerComparison}</p><dl><div><dt>短期上行区间</dt><dd>{lead.analysis.upwardProbabilityRange.join("—")}%</dd></div><div><dt>中性区间</dt><dd>{lead.analysis.neutralProbabilityRange.join("—")}%</dd></div><div><dt>下行区间</dt><dd>{lead.analysis.downwardProbabilityRange.join("—")}%</dd></div></dl><Link href={`/cards/${lead.card.id}#analysis`}>查看这张卡的全部证据 <ArrowUpRight size={14} /></Link></div>
      <aside className={styles.confidence}><span>CONFIDENCE</span><strong>{lead.analysis.confidenceLevel === "high" ? "高" : lead.analysis.confidenceLevel === "medium" ? "中" : "低"}</strong><p>数据完整度 {lead.analysis.dataCompleteness}/100</p><i><b style={{ width: `${lead.analysis.dataCompleteness}%` }} /></i><small>完整度不足时，系统降低观察结论的可靠性，而非填补缺失数据。</small></aside>
    </section>
    <section className={styles.evidence}>
      <div><span>EVIDENCE LEDGER</span><h2>结论如何被支持，也如何被推翻。</h2></div>
      <div className={styles.ledger}><article><b>正向因子</b>{lead.analysis.keyPositiveFactors.map((factor) => <p key={factor}>+ {factor}</p>)}</article><article><b>风险因子</b>{lead.analysis.keyNegativeFactors.map((factor) => <p key={factor}>− {factor}</p>)}</article><article><b>失效条件</b>{lead.analysis.invalidationEvents.slice(0, 2).map((factor) => <p key={factor}><CircleAlert size={13} />{factor}</p>)}</article></div>
    </section>
    <section className={styles.queue}>
      <div className={styles.queueHeading}><div><span>RESEARCH QUEUE</span><h2>继续阅读的卡片</h2></div><p>研究队列按现有样本的完整度、热度和风险因子呈现，不代表推荐清单。</p></div>
      <div>{rows.slice(1).map((row, index) => <article key={row.card.id}><span>{String(index + 2).padStart(2, "0")}</span><Link href={`/cards/${row.card.id}`}><b>{row.player.displayNameZh}</b><small>{row.card.releaseYear} {row.card.brand} · {row.card.parallel}</small></Link><em className={row.analysis.trendDirection === "up" ? styles.up : row.analysis.trendDirection === "down" ? styles.down : ""}>{row.analysis.trendDirection === "up" ? "上行观察" : row.analysis.trendDirection === "down" ? "回撤观察" : "中性观察"}</em><p>{row.analysis.dataCompleteness}/100 完整度</p><Link href={`/cards/${row.card.id}#analysis`} aria-label={`查看 ${row.player.displayNameZh} 分析`}><ScanSearch size={16} /></Link></article>)}</div>
    </section>
    <footer className={styles.disclaimer}><b>研究边界</b><span>{lead.analysis.disclaimer}</span></footer>
  </main>;
}
