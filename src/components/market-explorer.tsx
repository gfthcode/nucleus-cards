"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Grid2X2, List, Search, SlidersHorizontal, Star, Database } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import { MetricHelp } from "@/components/data-provenance";
import type { Card, Player, Team } from "@/types/domain";
import styles from "./market-explorer.module.css";
import { useI18n } from "@/i18n/client";
import { displayPlayerName, displayTeamName } from "@/i18n/display-names";
import { DisplayedAmount } from "@/components/currency-switcher";

type MarketRow = Card & { player: Player; team?: Team };
type View = "gallery" | "table";
type SavedView = { id: string; name: string; query: string; brand: string; draftYear: string; price: string; cohort: string; risk: string; onlySales: boolean; highLiquidity: boolean };
const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const savedViewsKey = "nucleus-market-saved-views";

export function MarketExplorer({ rows }: { rows: MarketRow[] }) {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [brand, setBrand] = useState("all");
  const [draftYear, setDraftYear] = useState("all");
  const [price, setPrice] = useState("all");
  const [cohort, setCohort] = useState("all");
  const [risk, setRisk] = useState("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [onlySales, setOnlySales] = useState(false);
  const [highLiquidity, setHighLiquidity] = useState(false);
  const [view, setView] = useState<View>("gallery");
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [savingView, setSavingView] = useState(false);
  const [viewName, setViewName] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(savedViewsKey);
        if (stored) setSavedViews(JSON.parse(stored) as SavedView[]);
      } catch { /* Ignore unavailable or malformed local storage. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function persistViews(next: SavedView[]) {
    setSavedViews(next);
    try { window.localStorage.setItem(savedViewsKey, JSON.stringify(next)); } catch { /* Ignore private browsing storage limits. */ }
  }

  function currentView(name: string): SavedView {
    return { id: `${Date.now()}`, name, query, brand, draftYear, price, cohort, risk, onlySales, highLiquidity };
  }

  function saveCurrentView() {
    const name = viewName.trim();
    if (!name) return;
    persistViews([currentView(name), ...savedViews].slice(0, 8));
    setViewName("");
    setSavingView(false);
  }

  function applySavedView(saved: SavedView) {
    setQuery(saved.query); setBrand(saved.brand); setDraftYear(saved.draftYear); setPrice(saved.price); setCohort(saved.cohort); setRisk(saved.risk); setOnlySales(saved.onlySales); setHighLiquidity(saved.highLiquidity);
  }

  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = `${row.player.name} ${row.player.displayNameZh} ${row.brand} ${row.productLine} ${displayTeamName(row.team, locale)}`.toLowerCase();
    const amount = row.latestSaleCny ?? 0;
    return haystack.includes(query.toLowerCase()) &&
      (brand === "all" || row.brand === brand) &&
      (draftYear === "all" || row.draftYear === Number(draftYear)) &&
      (risk === "all" || row.riskLevel === risk) &&
      (cohort === "all" || row.player.cohort === cohort) &&
      (price === "all" || (price === "under1k" && amount < 1000) || (price === "1k5k" && amount >= 1000 && amount <= 5000) || (price === "over5k" && amount > 5000)) &&
      (!onlySales || row.sales30d > 0) && (!highLiquidity || row.liquidity >= 70);
  }).sort((a, b) => (b.latestSaleCny ?? 0) - (a.latestSaleCny ?? 0)), [rows, query, brand, draftYear, price, risk, cohort, onlySales, highLiquidity, locale]);

  function reset() { setQuery(""); setBrand("all"); setDraftYear("all"); setPrice("all"); setRisk("all"); setCohort("all"); setOnlySales(false); setHighLiquidity(false); }
  function toggleWatch(id: string) { setWatched((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  return <section id="market-search" className={`${styles.explorer} ${styles.anchorTarget}`} aria-label={t("market.browserLabel")}>
    <div className={styles.controls}>
      <label className={styles.search}><Search size={17} aria-hidden /><input aria-label={t("search.label")} data-analytics-event="search_used" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("market.searchPlaceholder")} /></label>
      <div className={styles.selects}>
        <label><span>{t("market.year")}</span><select value={draftYear} onChange={(event) => setDraftYear(event.target.value)}><option value="all">{t("market.allYears")}</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
        <label><span>{t("market.brand")}</span><select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="all">{t("market.allBrands")}</option><option>Topps</option><option>Panini</option><option>Upper Deck</option></select></label>
        <label><span>{t("market.priceRange")}</span><select value={price} onChange={(event) => setPrice(event.target.value)}><option value="all">{t("market.allPrices")}</option><option value="under1k">{t("market.under1k")}</option><option value="1k5k">{t("market.price1k5k")}</option><option value="over5k">{t("market.over5k")}</option></select></label>
        <label><span>{t("market.cohort")}</span><select aria-label={t("market.cohort")} value={cohort} onChange={(event) => setCohort(event.target.value)}><option value="all">{t("market.allCohorts")}</option><option value="core_rookie">{t("market.coreRookie")}</option><option value="recent_rookie">{t("market.recentRookie")}</option><option value="young_core">{t("market.youngCore")}</option><option value="prime">{t("market.prime")}</option><option value="veteran">{t("market.veteran")}</option><option value="retired_legend">{t("market.retiredLegend")}</option></select></label>
      </div>
      <button className={advancedOpen ? styles.utilityActive : styles.utility} onClick={() => setAdvancedOpen((open) => !open)}><SlidersHorizontal size={15} /> {t("market.filter")}</button>
    </div>
    <div className={styles.chips} aria-label={t("market.quickFilters")}>
      <button className={!onlySales ? styles.selected : ""} onClick={() => setOnlySales(false)}>{t("market.allCards")}</button>
      <button className={onlySales ? styles.selected : ""} onClick={() => setOnlySales((value) => !value)}>{t("market.withSales")}</button>
      <button className={highLiquidity ? styles.selected : ""} onClick={() => setHighLiquidity((value) => !value)}>{t("market.highLiquidity")}</button>
      <button className={risk === "high" ? styles.danger : ""} onClick={() => setRisk((value) => value === "high" ? "all" : "high")}>{t("market.highRisk")}</button>
    </div>
    <div className={styles.savedViews} aria-label={t("market.savedViews")}>
      <div className={styles.savedViewsHeader}><span>{t("market.savedViews")}</span><button type="button" onClick={() => setSavingView((value) => !value)}>{t("market.saveView")}</button></div>
      {savingView && <div className={styles.saveViewForm}><input aria-label={t("market.viewName")} placeholder={t("market.viewNamePlaceholder")} value={viewName} onChange={(event) => setViewName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveCurrentView()} /><button type="button" onClick={saveCurrentView} disabled={!viewName.trim()}>{t("market.save")}</button><small>{t("market.saveViewHint")}</small></div>}
      {savedViews.length ? <div className={styles.savedViewList}>{savedViews.map((saved) => <span className={styles.savedView} key={saved.id}><button type="button" onClick={() => applySavedView(saved)}>{saved.name}</button><button type="button" aria-label={`${t("market.removeView")}: ${saved.name}`} onClick={() => persistViews(savedViews.filter((item) => item.id !== saved.id))}>×</button></span>)}</div> : <small className={styles.noSavedViews}>{t("market.noSavedViews")}</small>}
    </div>
    {advancedOpen && <div className={styles.advanced} role="region" aria-label={t("market.filter")}><label><span>{t("market.riskLevel")}</span><select value={risk} onChange={(event) => setRisk(event.target.value)}><option value="all">{t("market.all")}</option><option value="low">{t("market.low")}</option><option value="medium">{t("market.medium")}</option><option value="high">{t("market.high")}</option></select></label><label><span>{t("market.observationType")}</span><select disabled aria-label={t("market.observationType")}><option>{t("market.realRowsRequired")}</option></select></label><label><span>{t("market.dataSource")}</span><select disabled aria-label={t("market.dataSource")}><option>eBay Browse API</option></select></label><p>{t("market.filterHint")} {t("market.realFiltersPending")}</p></div>}
    <div id="recent-sales" className={`${styles.resultsBar} ${styles.salesAnchor}`}>
      <div><span>{t("market.discovered")}</span><strong>{filtered.length}</strong><small> {t("market.cards")}</small></div>
      <p>{t("market.sortHint")} <MetricHelp label={t("market.liquidityScore")} description={t("market.liquidityDescription")} /></p>
      <div className={styles.viewSwitch} aria-label={t("market.displayMode")}><button className={view === "gallery" ? styles.selected : ""} onClick={() => setView("gallery")} aria-label={t("market.galleryView")}><Grid2X2 size={16} /></button><button className={view === "table" ? styles.selected : ""} onClick={() => setView("table")} aria-label={t("market.tableView")}><List size={17} /></button></div>
    </div>
    {!filtered.length ? <div className={styles.empty}><Database aria-hidden size={20}/><b>{t("market.noMatch")}</b><span>{t("market.tryAgain")}</span><button onClick={reset}>{t("market.clearFilters")}</button></div> : view === "gallery" ? <div className={styles.gallery}>{filtered.map((row) => <article className={styles.product} key={row.id}><Link aria-label={`${displayPlayerName(row.player, locale)} ${row.releaseYear} ${row.productLine}`} href={`/cards/${row.id}`} data-analytics-event="card_viewed" data-analytics-label={row.player.name}><CardVisual card={row} player={row.player} density="compact" /></Link><footer><span>{row.demo ? t("market.demoNotSale") : t("market.verifiedSale")}</span><button className={watched.has(row.id) ? styles.watching : ""} onClick={() => toggleWatch(row.id)} aria-label={watched.has(row.id) ? t("market.removeWatch") : t("market.addWatch")}><Star size={14} fill={watched.has(row.id) ? "currentColor" : "none"} /></button></footer></article>)}</div> : <div className={styles.tableWrap}><table><thead><tr><th>{t("market.card")}</th><th>{t("market.latestSale")}</th><th>{t("market.thirtyDay")}</th><th>{t("market.samples")}</th><th>{t("market.liquidity")}</th><th aria-label={t("market.removeWatch")} /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><Link aria-label={`${displayPlayerName(row.player, locale)} ${row.releaseYear} ${row.productLine}`} href={`/cards/${row.id}`}><b>{displayPlayerName(row.player, locale)}</b><small>{row.releaseYear} {row.brand} · {row.parallel} · #{row.cardNumber}</small></Link></td><td><b><DisplayedAmount cny={row.latestSaleCny} /></b><small>{row.demo ? t("market.demoNotSale") : t("market.verifiedSample")}</small></td><td className={(row.change30d ?? 0) >= 0 ? styles.up : styles.down}>{row.change30d == null ? "—" : `${row.change30d > 0 ? "+" : ""}${row.change30d}%`}</td><td>{row.sales30d} {t("market.salesCount")}</td><td>{row.liquidity}/100</td><td><button className={watched.has(row.id) ? styles.watching : ""} onClick={() => toggleWatch(row.id)} aria-label={watched.has(row.id) ? t("market.removeWatch") : t("market.addWatch")}><Star size={14} fill={watched.has(row.id) ? "currentColor" : "none"} /></button></td></tr>)}</tbody></table></div>}
    <p className={styles.methodology}>{t("market.methodology")}<Link href="/methodology#metrics">{t("market.readMethodology")}</Link></p>
  </section>;
}

