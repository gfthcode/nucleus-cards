"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { useI18n } from "@/i18n/client";
import styles from "./related-site-card.module.css";

const courtMatchUrl = "https://gfthcode.github.io/courtmatch-analytics/";

export function RelatedSiteCard({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return <aside className={`${styles.card} ${compact ? styles.compact : styles.featured}`} aria-label={t("related.courtMatch.title")}>
    <div className={styles.icon}><BarChart3 size={compact ? 16 : 20} aria-hidden /></div>
    <div className={styles.copy}>
      <span>{t("related.courtMatch.eyebrow")}</span>
      <h2>{t("related.courtMatch.title")}</h2>
      <p>{t("related.courtMatch.description")}</p>
    </div>
    <Link className={styles.link} href={courtMatchUrl} target="_blank" rel="noreferrer">
      {t("related.courtMatch.action")} <ArrowUpRight size={compact ? 14 : 16} aria-hidden />
    </Link>
  </aside>;
}
