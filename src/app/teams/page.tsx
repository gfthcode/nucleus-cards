import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { cards, getCurrentTeamPlayers, teams } from "@/lib/demo-data";
import { activeAuctions } from "@/lib/auction-data";

export const metadata: Metadata = { title: "NBA 球队" };

export default function TeamsPage() {
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow="30 NBA TEAMS"
        title="球队行情地图"
        description="覆盖 NBA 全部 30 支球队。球员当前球队与卡片印刷球队在数据模型和页面中分别记录。"
      />
      <div className="conference-grid">
        {(["West", "East"] as const).map((conference) => (
          <section className="data-panel" key={conference}>
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  {conference === "West"
                    ? "WESTERN CONFERENCE"
                    : "EASTERN CONFERENCE"}
                </span>
                <h2>{conference === "West" ? "西部联盟" : "东部联盟"}</h2>
              </div>
              <small>15 支球队</small>
            </div>
            <div className="team-grid">
              {teams
                .filter((team) => team.conference === conference)
                .map((team) => {
                  const roster = getCurrentTeamPlayers(team.id);
                  const rosterIds = new Set(roster.map((player) => player.id));
                  const teamCards = cards.filter((card) => rosterIds.has(card.playerId));
                  const teamAuctions = activeAuctions.filter((auction) => rosterIds.has(auction.playerId));
                  return (
                    <Link
                      className="team-tile"
                      href={`/teams/${team.slug}`}
                      key={team.id}
                    >
                      <span
                        className="team-mark"
                        style={{ background: team.color }}
                      >
                        {team.abbreviation}
                      </span>
                      <span>
                        <b>{team.name}</b>
                        <small>
                          {team.city} · {team.division}
                        </small>
                      </span>
                      <em>
                          {roster.length} 球员 / {teamCards.length} 卡片 · {teamAuctions.length} 拍卖
                      </em>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
