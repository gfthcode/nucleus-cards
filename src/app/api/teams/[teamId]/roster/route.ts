import { getTeamByParam, getTeamRosterSnapshot } from "@/lib/roster-sync";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const team = getTeamByParam(teamId);
  if (!team) {
    return Response.json({ error: "球队不存在" }, { status: 404 });
  }
  const snapshot = await getTeamRosterSnapshot(team);
  return Response.json({
    team: {
      id: team.id,
      slug: team.slug,
      abbreviation: team.abbreviation,
      name: team.name,
    },
    source: snapshot.source,
    fetchedAt: snapshot.roster?.fetchedAt ?? null,
    roster: snapshot.roster?.players ?? null,
    syncPlan: snapshot.plan ?? null,
    fallbackPlayerIds: snapshot.roster ? null : snapshot.players.map((player) => player.id),
    error: snapshot.error ?? null,
  });
}
