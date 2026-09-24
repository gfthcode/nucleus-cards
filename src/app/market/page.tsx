import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getServerTranslator } from "@/i18n/server";
import { MarketExplorer } from "@/components/market-explorer";
import { cards, getPlayer, getTeam, officialRosterRecords, publicPhotoCards } from "@/lib/demo-data";
import { photoCatalogSnapshot } from "@/lib/public-card-catalog";
import { MetricCard } from "@/components/hud/hud";
import styles from "./market.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = getServerTranslator(await getLocale());
  return { title: t("market.title"), description: t("market.description"), alternates: { canonical: "/market" } };
}

export default async function MarketPage() {
  const locale = await getLocale();
  const t = getServerTranslator(locale);
  const en = locale === "en";
  const photographed = new Set(publicPhotoCards.map((card) => card.playerId));
  const missing = officialRosterRecords.filter((player) => !photographed.has(`nba-${player.personId}`));
  const rows = [...publicPhotoCards, ...cards].flatMap((card) => {
    const player = getPlayer(card.playerId);
    return player ? [{ ...card, player, team: player.currentTeamId ? getTeam(player.currentTeamId) : undefined }] : [];
  });
  return <main className="page-shell inner-page">
    <header className={styles.masthead}>
      <div><span>{t("market.eyebrow")}</span><h1>{t("market.title")}</h1><p className={styles.headline}>{en ? "Real cards. Complete photographs." : "真实球星卡，完整实物照片。"}</p><p>{en ? "Source-linked catalogue photographs, separate from demo prices and verified sales." : "逐卡保留照片来源；实物卡图、演示价格与真实成交记录分开显示。"}</p></div>
      <aside><strong>{publicPhotoCards.length}<small> {en ? "real card photographs" : "张真实卡图"}</small></strong><p>{en ? "Public catalogue checked" : "公开目录核验"} · {photoCatalogSnapshot.fetchedAt.slice(0, 10)}</p></aside>
    </header>
    <section className="hud-grid" aria-label={en ? "Card photograph coverage" : "卡图覆盖情况"}>
      <MetricCard label={en ? "REAL CARD PHOTOS" : "真实卡图"} value={publicPhotoCards.length} detail={en ? "Source metadata + decoded image" : "来源详情与图片完整解码验证"} state="PASS" />
      <MetricCard label={en ? "PLAYERS WITH PHOTOS" : "已匹配球员"} value={photographed.size} detail={`${officialRosterRecords.length} ${en ? "NBA.com directory names" : "名 NBA 官网目录球员"}`} state="PASS" />
      <MetricCard label={en ? "STILL TO MATCH" : "尚未匹配"} value={missing.length} detail={en ? "No invented card identities" : "不再生成虚构卡号补足数量"} state="COLLECTING" />
      <MetricCard label={en ? "VERIFIED SALES" : "已核验成交"} value="—" detail={en ? "Photographs do not prove a sale" : "卡图不等于成交凭证"} state="UNAVAILABLE" />
    </section>
    <p className={styles.marketHonesty}>{en ? "NBA.com lists roster and offseason directory entries, not exactly 450 standard contracts. Missing photos remain explicitly pending. Collector Crypt insurance values are not imported as prices." : "NBA 官网目录包含阵容与休赛期登记人员，不等于固定 450 个正式合同。未匹配球员保持待补；来源保险估值不作为行情价格。"} <Link href="/api/cards/photo-coverage">{en ? "Coverage audit" : "查看覆盖明细"}</Link></p>
    <MarketExplorer rows={rows} />
    <details className={styles.coverage}>
      <summary>{en ? `Still seeking a verified card photograph · ${missing.length} players` : `继续补图名单 · ${missing.length} 名球员`}</summary>
      <p>{en ? "No player portraits, generated card faces or another player's card are substituted." : "不会用球员头像、生成卡面或其他球员的卡来替代。"}</p>
      <div>{missing.map((player) => <Link key={player.personId} href={`/players/nba-${player.personId}`}>{player.name} <small>{player.teamAbbreviation || "—"}</small></Link>)}</div>
    </details>
  </main>;
}
