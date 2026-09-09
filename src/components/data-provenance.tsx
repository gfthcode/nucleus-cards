import Link from "next/link";
import { Info, MessageSquareWarning, ShieldCheck } from "lucide-react";

export function DemoDataBadge({ compact = false }: { compact?: boolean }) {
  return <span className={`provenance-badge provenance-demo ${compact ? "is-compact" : ""}`} title="当前记录来自本地演示样本，尚未连接授权实时数据源"><Info size={12} aria-hidden /> 演示数据 · 非实时</span>;
}

export function EvidenceBadge({ verified }: { verified: boolean }) {
  return verified ? <span className="provenance-badge provenance-verified"><ShieldCheck size={12} aria-hidden /> 已核验来源</span> : <span className="provenance-badge provenance-review"><Info size={12} aria-hidden /> 待外部核验</span>;
}

export function DataTrustBar({ context = "当前页面" }: { context?: string }) {
  return (
    <section className="data-trust-bar" aria-label="数据可信度说明">
      <div className="data-trust-status"><Info size={14} aria-hidden /><b>{context}使用演示数据</b><span>非实时、不可用于交易决策</span></div>
      <div className="data-trust-facts"><span><b>来源</b>本地规则样本</span><span><b>更新时间</b>2026-09-02 09:30 CST</span><span><b>授权状态</b>未接入</span></div>
      <Link href="/methodology#feedback" data-analytics-event="data_feedback_opened"><MessageSquareWarning size={13} aria-hidden /> 发现错误？提交证据</Link>
    </section>
  );
}

export function MetricHelp({ label, description }: { label: string; description: string }) {
  return <span className="metric-help" title={description} aria-label={`${label}：${description}`}><Info size={12} aria-hidden /></span>;
}
