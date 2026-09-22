import type { Metadata } from "next";
import { getLocale, getServerTranslator } from "@/i18n/server";
import { MarketExplorer } from "@/components/market-explorer";
import { cards, getPlayer, getTeam } from "@/lib/demo-data";
import { DemoDataBadge } from "@/components/data-provenance";
import styles from "./market.module.css";
import { FreshnessBadge, MetricCard } from "@/components/hud/hud";
import { getDataHealth } from "@/lib/data-health";

export async function generateMetadata(): Promise<Metadata> {
  const t = getServerTranslator(await getLocale());
  return { title: t("market.title"), description: t("market.description"), alternates: { canonical: "/market" } };
}

export default async function MarketPage() {
  const t = getServerTranslator(await getLocale());
  const health = await getDataHealth();
  const rows = cards.map((card) => ({
    ...card,
    player: getPlayer(card.playerId)!,
    team: card.printedTeamId ? getTeam(card.printedTeamId) : undefined,
  }));
  return (
    <main className="page-shell inner-page">
      <header className={styles.masthead}>
        <div>
          <span>{t("market.eyebrow")}</span>
          <h1>{t("market.title")}</h1>
          <p className={styles.headline}>{t("market.headline")}</p>
          <p>{t("market.description")}</p>
        </div>
        <aside>
          <DemoDataBadge />
          <strong>{cards.length}<small> {t("market.standardizedCards")}</small></strong>
          <p>{t("market.coverage")} 78.4% · 4 {t("market.pendingAnomalies")}<br />{t("market.separation")}</p>
        </aside>
      </header>
      <section className="hud-grid" aria-label="Market data status">
        <MetricCard label="STANDARDIZED CARDS" value={cards.length} detail="Catalog identity records" state="PASS" />
        <MetricCard label="ACTIVE LISTINGS" value={health.counts?.market_listings ?? "—"} detail={health.counts?.market_listings ? "Official eBay active listings" : "Real market database not yet populated"} state={health.counts?.market_listings ? "PASS" : "EMPTY"} />
        <MetricCard label="MARKET SNAPSHOTS" value={health.counts?.market_price_snapshots ?? "—"} detail="Fixed-price median only" state={health.counts?.market_price_snapshots ? "PASS" : "COLLECTING"} />
        <MetricCard label="VERIFIED SOLD PRICE" value={health.counts?.verified_sales ?? "—"} detail={health.counts?.verified_sales ? "Authorized sale evidence" : "Verified sold-price data unavailable"} state={health.counts?.verified_sales ? "PASS" : "UNAVAILABLE"} />
      </section>
      <p className={styles.marketHonesty}><FreshnessBadge value={health.ebay.lastSuccessfulFetch ? `eBay checked ${new Date(health.ebay.lastSuccessfulFetch).toLocaleString()}` : health.ebay.configured ? "eBay collecting data" : "eBay provider not configured"} /> Active listing, live auction, active snapshot and verified sale remain separate evidence classes.</p>
      <MarketExplorer rows={rows} />
    </main>
  );
}
