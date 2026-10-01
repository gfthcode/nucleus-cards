"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Grid2X2, List, Search, SlidersHorizontal, Star, Database, ExternalLink } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import { MetricHelp } from "@/components/data-provenance";
import type { Card, Player, Team } from "@/types/domain";
import styles from "./market-explorer.module.css";
import { useI18n } from "@/i18n/client";
import { displayPlayerName, displayTeamName } from "@/i18n/display-names";
import { DisplayedAmount } from "@/components/currency-switcher";

type MarketRow = Card & { player: Player; team?: Team };
type View = "gallery" | "table";
type CatalogScope = "photos" | "demo" | "all";
type Filters = {
  query: string; brand: string; draftYear: string; price: string;
  cohort: string; risk: string; onlySales: boolean; highLiquidity: boolean;
  scope: CatalogScope;
};
type SavedView = Omit<Filters, "scope"> & { id: string; name: string; scope?: CatalogScope };
const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const savedViewsKey = "nucleus-market-saved-views";
const defaultFilters: Filters = {
  query: "", brand: "all", draftYear: "all", price: "all", cohort: "all",
  risk: "all", onlySales: false, highLiquidity: false, scope: "photos",
};

function hasAuthenticPhoto(row: MarketRow) {
  return !row.demo && Boolean(
    row.photoEvidence && row.image?.imageVerified && row.image.frontUrl &&
    !row.image.frontUrl.startsWith("data:"),
  );
}

function knownAmount(row: MarketRow) {
  const amount = row.latestSaleCny ?? row.latestListingCny;
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

export function MarketExplorer({ rows }: { rows: MarketRow[] }) {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters, query: searchParams.get("q") ?? "" });
  const { query, brand, draftYear, price, cohort, risk, onlySales, highLiquidity, scope } = filters;
  const [advancedOpen, setAdvancedOpen] = useState(false);
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

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function persistViews(next: SavedView[]) {
    setSavedViews(next);
    try { window.localStorage.setItem(savedViewsKey, JSON.stringify(next)); } catch { /* Ignore private browsing storage limits. */ }
  }

  function saveCurrentView() {
    const name = viewName.trim();
    if (!name) return;
    persistViews([{ id: String(Date.now()), name, ...filters }, ...savedViews].slice(0, 8));
    setViewName("");
    setSavingView(false);
  }

  function applySavedView(saved: SavedView) {
    setFilters({
      query: saved.query, brand: saved.brand, draftYear: saved.draftYear,
      price: saved.price, cohort: saved.cohort, risk: saved.risk,
      onlySales: saved.onlySales, highLiquidity: saved.highLiquidity,
      scope: saved.scope ?? "photos",
    });
  }

  const photoRows = useMemo(() => rows.filter(hasAuthenticPhoto), [rows]);
  const photoPlayers = useMemo(() => new Set(photoRows.map((row) => row.player.name)).size, [photoRows]);
  const availableBrands = useMemo(() => [...new Set(rows.map((row) => row.brand))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter((row) => {
    const authenticPhoto = hasAuthenticPhoto(row);
    if (scope === "photos" && !authenticPhoto) return false;
    if (scope === "demo" && !row.demo) return false;
    const haystack = `${row.player.name} ${row.player.displayNameZh} ${row.brand} ${row.productLine} ${row.parallel} ${row.cardNumber} ${displayTeamName(row.team, locale)}`.toLowerCase();
    const amount = knownAmount(row);
    const matchesPrice = price === "all" || (amount !== undefined && (
      (price === "under1k" && amount < 1000) ||
      (price === "1k5k" && amount >= 1000 && amount <= 5000) ||
      (price === "over5k" && amount > 5000)
    ));
    return haystack.includes(query.trim().toLowerCase()) &&
      (brand === "all" || row.brand === brand) &&
      (draftYear === "all" || row.draftYear === Number(draftYear)) &&
      (risk === "all" || row.riskLevel === risk) &&
      (cohort === "all" || row.player.cohort === cohort) &&
      matchesPrice && (!onlySales || row.sales30d > 0) &&
      (!highLiquidity || row.liquidity >= 70);
  }).sort((a, b) => {
    const photoPriority = Number(hasAuthenticPhoto(b)) - Number(hasAuthenticPhoto(a));
    if (photoPriority) return photoPriority;
    const amountA = knownAmount(a);
    const amountB = knownAmount(b);
    if (amountA !== undefined || amountB !== undefined) return (amountB ?? -1) - (amountA ?? -1);
    return a.player.name.localeCompare(b.player.name) || a.id.localeCompare(b.id);
  }), [rows, query, brand, draftYear, price, risk, cohort, onlySales, highLiquidity, scope, locale]);
  const visibleRows = filtered;
  const filteredPhotoCount = filtered.filter(hasAuthenticPhoto).length;
  const filteredPlayerCount = new Set(filtered.map((row) => row.player.name)).size;

  function reset() { setFilters(defaultFilters); }
  function toggleWatch(id: string) { setWatched((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  const evidenceLabel = (row: MarketRow) => row.demo
    ? t("market.demoNotSale")
    : ["HobbyScan", "Phygitals"].includes(row.photoEvidence?.sourceName ?? "")
      ? locale === "en" ? "Card details & photo source" : "卡片资料与图片来源"
    : locale === "en" ? "Live price & price movement" : "实时价格和价格波动";
  const scopes: { value: CatalogScope; label: string }[] = [
    { value: "photos", label: locale === "en" ? "Real card photos" : "实物卡图" },
    { value: "demo", label: locale === "en" ? "Demo samples" : "演示样本" },
    { value: "all", label: locale === "en" ? "All records" : "全部记录" },
  ];

  return <section id="market-search" className={`${styles.explorer} ${styles.anchorTarget}`} aria-label={t("market.browserLabel")}>
    <div className={styles.catalogControls}>
      <div className={styles.scopeSwitch} role="group" aria-label={locale === "en" ? "Catalog scope" : "卡片目录范围"}>
        {scopes.map((item) => <button key={item.value} type="button" aria-pressed={scope === item.value} onClick={() => updateFilter("scope", item.value)}>{item.label}</button>)}
      </div>
      <p data-testid="photo-coverage">{locale === "en" ? `${photoRows.length} photographed cards · ${photoPlayers} players` : `${photoRows.length} 张实物卡图 · ${photoPlayers} 位球员`}</p>
      <small>{scope === "demo"
        ? locale === "en" ? "Demo prices and activity are illustrative." : "演示价格和活跃度仅用于体验功能。"
        : locale === "en" ? "Photos have source references. A photograph does not verify a transaction or price." : "卡图附来源；实物照片不代表已核实的成交或价格。"}</small>
    </div>
    <div className={styles.controls}>
      <label className={styles.search}><Search size={17} aria-hidden /><input aria-label={t("search.label")} data-analytics-event="search_used" value={query} onChange={(event) => updateFilter("query", event.target.value)} placeholder={t("market.searchPlaceholder")} /></label>
      <div className={styles.selects}>
        <label><span>{t("market.year")}</span><select value={draftYear} onChange={(event) => updateFilter("draftYear", event.target.value)}><option value="all">{t("market.allYears")}</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
        <label><span>{t("market.brand")}</span><select value={brand} onChange={(event) => updateFilter("brand", event.target.value)}><option value="all">{t("market.allBrands")}</option>{availableBrands.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label><span>{t("market.priceRange")}</span><select value={price} onChange={(event) => updateFilter("price", event.target.value)}><option value="all">{t("market.allPrices")}</option><option value="under1k">{t("market.under1k")}</option><option value="1k5k">{t("market.price1k5k")}</option><option value="over5k">{t("market.over5k")}</option></select></label>
        <label><span>{t("market.cohort")}</span><select aria-label={t("market.cohort")} value={cohort} onChange={(event) => updateFilter("cohort", event.target.value)}><option value="all">{t("market.allCohorts")}</option><option value="core_rookie">{t("market.coreRookie")}</option><option value="recent_rookie">{t("market.recentRookie")}</option><option value="young_core">{t("market.youngCore")}</option><option value="prime">{t("market.prime")}</option><option value="veteran">{t("market.veteran")}</option><option value="retired_legend">{t("market.retiredLegend")}</option></select></label>
      </div>
      <button className={advancedOpen ? styles.utilityActive : styles.utility} onClick={() => setAdvancedOpen((open) => !open)}><SlidersHorizontal size={15} /> {t("market.filter")}</button>
    </div>
    <div className={styles.chips} aria-label={t("market.quickFilters")}>
      <button className={!onlySales ? styles.selected : ""} onClick={() => updateFilter("onlySales", false)}>{t("market.allCards")}</button>
      <button className={onlySales ? styles.selected : ""} onClick={() => updateFilter("onlySales", !onlySales)}>{t("market.withSales")}</button>
      <button className={highLiquidity ? styles.selected : ""} onClick={() => updateFilter("highLiquidity", !highLiquidity)}>{t("market.highLiquidity")}</button>
      <button className={risk === "high" ? styles.danger : ""} onClick={() => updateFilter("risk", risk === "high" ? "all" : "high")}>{t("market.highRisk")}</button>
    </div>
    <div className={styles.savedViews} aria-label={t("market.savedViews")}>
      <div className={styles.savedViewsHeader}><span>{t("market.savedViews")}</span><button type="button" onClick={() => setSavingView((value) => !value)}>{t("market.saveView")}</button></div>
      {savingView && <div className={styles.saveViewForm}><input aria-label={t("market.viewName")} placeholder={t("market.viewNamePlaceholder")} value={viewName} onChange={(event) => setViewName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveCurrentView()} /><button type="button" onClick={saveCurrentView} disabled={!viewName.trim()}>{t("market.save")}</button><small>{t("market.saveViewHint")}</small></div>}
      {savedViews.length ? <div className={styles.savedViewList}>{savedViews.map((saved) => <span className={styles.savedView} key={saved.id}><button type="button" onClick={() => applySavedView(saved)}>{saved.name}</button><button type="button" aria-label={`${t("market.removeView")}: ${saved.name}`} onClick={() => persistViews(savedViews.filter((item) => item.id !== saved.id))}>×</button></span>)}</div> : <small className={styles.noSavedViews}>{t("market.noSavedViews")}</small>}
    </div>
    {advancedOpen && <div className={styles.advanced} role="region" aria-label={t("market.filter")}><label><span>{t("market.riskLevel")}</span><select value={risk} onChange={(event) => updateFilter("risk", event.target.value)}><option value="all">{t("market.all")}</option><option value="low">{t("market.low")}</option><option value="medium">{t("market.medium")}</option><option value="high">{t("market.high")}</option></select></label><label><span>{t("market.observationType")}</span><select disabled aria-label={t("market.observationType")}><option>{t("market.realRowsRequired")}</option></select></label><label><span>{t("market.dataSource")}</span><select disabled aria-label={t("market.dataSource")}><option>{locale === "en" ? "Photo references" : "实物卡图来源"}</option></select></label><p>{t("market.filterHint")} {t("market.realFiltersPending")}</p></div>}
    <div id="recent-sales" className={`${styles.resultsBar} ${styles.salesAnchor}`}>
      <div aria-live="polite"><span>{t("market.discovered")}</span><strong data-testid="market-result-count">{filtered.length}</strong><small>{locale === "en" ? ` cards · ${filteredPlayerCount} players` : ` 张卡片 · ${filteredPlayerCount} 位球员`}</small></div>
      <p>{locale === "en" ? `${filteredPhotoCount} with real photos · photos first` : `${filteredPhotoCount} 张实物图 · 优先展示实物卡图`} <MetricHelp label={t("market.liquidityScore")} description={t("market.liquidityDescription")} /></p>
      <div className={styles.viewSwitch} aria-label={t("market.displayMode")}><button className={view === "gallery" ? styles.selected : ""} onClick={() => setView("gallery")} aria-label={t("market.galleryView")}><Grid2X2 size={16} /></button><button className={view === "table" ? styles.selected : ""} onClick={() => setView("table")} aria-label={t("market.tableView")}><List size={17} /></button></div>
    </div>
    {!filtered.length ? <div className={styles.empty}><Database aria-hidden size={20}/><b>{t("market.noMatch")}</b><span>{price !== "all" ? locale === "en" ? "Cards without a recorded price are excluded from price filters." : "没有可用价格的卡片不会计入价格筛选。" : t("market.tryAgain")}</span><button onClick={reset}>{t("market.clearFilters")}</button></div> : view === "gallery" ? <div className={styles.gallery} data-testid="market-gallery">{visibleRows.map((row) => <article className={styles.product} key={row.id} data-evidence={row.demo ? "demo" : "photo"}>
      <Link aria-label={`${displayPlayerName(row.player, locale)} ${row.releaseYear} ${row.productLine}`} href={`/cards/${row.id}`} data-analytics-event="card_viewed" data-analytics-label={row.player.name}><CardVisual card={row} player={row.player} density="compact" /></Link>
      <footer><div className={styles.evidence}><span>{evidenceLabel(row)}</span>{row.photoEvidence && <a href={row.photoEvidence.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${locale === "en" ? "Photo source" : "卡图来源"}: ${row.photoEvidence.sourceName} · ${row.player.name}`}>{row.photoEvidence.sourceName}<ExternalLink size={11} aria-hidden /></a>}</div><button className={watched.has(row.id) ? styles.watching : ""} onClick={() => toggleWatch(row.id)} aria-label={watched.has(row.id) ? t("market.removeWatch") : t("market.addWatch")}><Star size={14} fill={watched.has(row.id) ? "currentColor" : "none"} /></button></footer>
    </article>)}</div> : <div className={styles.tableWrap}><table><thead><tr><th>{t("market.card")}</th><th>{t("market.latestSale")}</th><th>{t("market.thirtyDay")}</th><th>{t("market.samples")}</th><th>{t("market.liquidity")}</th><th aria-label={t("market.removeWatch")} /></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id} data-evidence={row.demo ? "demo" : "photo"}>
      <td><Link aria-label={`${displayPlayerName(row.player, locale)} ${row.releaseYear} ${row.productLine}`} href={`/cards/${row.id}`}><b>{displayPlayerName(row.player, locale)}</b><small>{row.releaseYear} {row.brand} · {row.parallel} · #{row.cardNumber.replace(/^#+/, "")}</small></Link>{row.photoEvidence && <a className={styles.sourceLink} href={row.photoEvidence.sourceUrl} target="_blank" rel="noreferrer">{row.photoEvidence.sourceName} ↗</a>}</td>
      <td><b><DisplayedAmount cny={row.latestSaleCny} /></b><small>{evidenceLabel(row)}</small></td><td className={row.change30d == null ? undefined : row.change30d >= 0 ? styles.up : styles.down}>{row.change30d == null ? "—" : `${row.change30d > 0 ? "+" : ""}${row.change30d}%`}</td><td>{row.sales30d} {t("market.salesCount")}</td><td>{row.demo || row.sales30d > 0 ? `${row.liquidity}/100` : "—"}</td><td><button className={watched.has(row.id) ? styles.watching : ""} onClick={() => toggleWatch(row.id)} aria-label={watched.has(row.id) ? t("market.removeWatch") : t("market.addWatch")}><Star size={14} fill={watched.has(row.id) ? "currentColor" : "none"} /></button></td>
    </tr>)}</tbody></table></div>}
    <p className={styles.methodology}>{t("market.methodology")}<Link href="/methodology#metrics">{t("market.readMethodology")}</Link></p>
  </section>;
}
