import type { Metadata } from "next";
import { getLocale, getServerTranslator } from "@/i18n/server";
import { MarketExplorer } from "@/components/market-explorer";
import { cards, getPlayer, getTeam } from "@/lib/demo-data";
import { DemoDataBadge } from "@/components/data-provenance";
import styles from "./market.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = getServerTranslator(await getLocale());
  return { title: t("market.title"), description: t("market.description"), alternates: { canonical: "/market" } };
}

export default async function MarketPage() {
  const t = getServerTranslator(await getLocale());
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
      <MarketExplorer rows={rows} />
    </main>
  );
}

