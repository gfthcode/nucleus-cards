"use client";

import Link from "next/link";
import { Info, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/client";

export function DemoDataBadge({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return <span className={`provenance-badge provenance-demo ${compact ? "is-compact" : ""}`} title={t("shell.snapshot")}><Info size={12} aria-hidden /> {t("common.demo")}</span>;
}

export function EvidenceBadge({ verified }: { verified: boolean }) {
  const { t } = useI18n();
  return verified ? <span className="provenance-badge provenance-verified"><ShieldCheck size={12} aria-hidden /> {t("market.verifiedSale")}</span> : <span className="provenance-badge provenance-review"><Info size={12} aria-hidden /> {t("market.pendingAnomalies")}</span>;
}

export function DataTrustBar({ context }: { context?: string }) {
  const { t } = useI18n();
  const label = context ?? t("shell.current");
  return (
    <section className="data-trust-bar" aria-label={t("shell.disclaimer")}>
      <div className="data-trust-status"><Info size={14} aria-hidden /><b>{label} · {t("common.demo")}</b><span>{t("shell.disclaimer")}</span></div>
      <div className="data-trust-facts"><span><b>{t("market.brand")}</b> {t("market.demoSample")}</span><span><b>{t("common.updated")}</b> {t("market.demoVersion")}</span><span><b>{t("market.confidence")}</b> {t("market.pendingAnomalies")}</span></div>
      <Link href="/methodology#feedback" data-analytics-event="data_feedback_opened"><MessageSquareWarning size={13} aria-hidden /> {t("market.readMethodology")}</Link>
    </section>
  );
}

export function MetricHelp({ label, description }: { label: string; description: string }) {
  return <span className="metric-help" title={description} aria-label={`${label}：${description}`}><Info size={12} aria-hidden /></span>;
}

