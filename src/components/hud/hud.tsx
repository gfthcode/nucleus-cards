"use client";

import { motion, useReducedMotion } from "motion/react";
import { Activity, CircleAlert, Database, Radio, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./hud.module.css";

export type HudState = "CONFIGURED" | "UNAVAILABLE" | "COLLECTING" | "DISABLED" | "PASS" | "FAIL" | "EMPTY";

const labels: Record<HudState, string> = { CONFIGURED: "CONFIGURED", UNAVAILABLE: "UNAVAILABLE", COLLECTING: "COLLECTING DATA", DISABLED: "DISABLED", PASS: "PASS", FAIL: "FAIL", EMPTY: "NO ROWS YET" };

export function StatusLight({ state, label }: { state: HudState; label?: string }) {
  return <span className={`${styles.status} ${styles[state.toLowerCase()]}`}><i aria-hidden />{label ?? labels[state]}</span>;
}

export function MetricCard({ label, value, detail, state = "EMPTY" }: { label: string; value: ReactNode; detail: string; state?: HudState }) {
  const reduced = useReducedMotion();
  return <motion.article initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }} className={styles.metric}>
    <span>{label}</span><strong>{value}</strong><small>{detail}</small><StatusLight state={state} />
  </motion.article>;
}

export function ProviderStatusCard({ name, state, detail, icon = "activity" }: { name: string; state: HudState; detail: string; icon?: "activity" | "database" | "shield" | "alert" }) {
  const Icon = icon === "database" ? Database : icon === "shield" ? ShieldCheck : icon === "alert" ? CircleAlert : Activity;
  return <article className={styles.provider}><Icon aria-hidden size={18} /><div><h3>{name}</h3><p>{detail}</p></div><StatusLight state={state} /></article>;
}

export function FreshnessBadge({ value }: { value: string }) { return <span className={styles.freshness}><Radio size={12} aria-hidden /> {value}</span>; }

export function EmptyDataState({ title, description }: { title: string; description: string }) { return <section className={styles.empty}><Database aria-hidden size={22} /><div><h2>{title}</h2><p>{description}</p></div></section>; }
