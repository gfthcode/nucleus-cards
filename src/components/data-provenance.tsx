import { Info, ShieldCheck } from "lucide-react";

export function DemoDataBadge({ compact = false }: { compact?: boolean }) {
  return <span className={`provenance-badge provenance-demo ${compact ? "is-compact" : ""}`} title="当前记录来自本地演示样本，尚未连接授权实时数据源"><Info size={12} aria-hidden /> 演示数据 · 非实时</span>;
}

export function EvidenceBadge({ verified }: { verified: boolean }) {
  return verified ? <span className="provenance-badge provenance-verified"><ShieldCheck size={12} aria-hidden /> 已核验来源</span> : <span className="provenance-badge provenance-review"><Info size={12} aria-hidden /> 待外部核验</span>;
}

export function MetricHelp({ label, description }: { label: string; description: string }) {
  return <span className="metric-help" title={description} aria-label={`${label}：${description}`}><Info size={12} aria-hidden /></span>;
}
