#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const sourceDir = args[0];
const outputPath = args[1] ?? "src/data/courtmatch-player-context.json";

if (!sourceDir) {
  throw new Error(
    "Usage: node scripts/import-courtmatch-player-context.mjs <courtmatch-public-data-dir> [output.json]",
  );
}

const sourceFile = (name) => path.join(sourceDir, name);
const [manifest, players, matchups, playerStats] = await Promise.all([
  readFile(sourceFile("manifest.json"), "utf8").then(JSON.parse),
  readFile(sourceFile("players.json"), "utf8").then(JSON.parse),
  readFile(sourceFile("matchups.json"), "utf8").then(JSON.parse),
  readFile(sourceFile("player-stats.json"), "utf8").then(JSON.parse),
]);

if (manifest.league !== "NBA" || manifest.isDemo !== false) {
  throw new Error("Refusing to import non-NBA or demo CourtMatch data.");
}
if (!Array.isArray(players) || !Array.isArray(matchups) || !Array.isArray(playerStats)) {
  throw new Error("CourtMatch data files have an unexpected shape.");
}
if (manifest.playerCount !== players.length || manifest.matchupRecordCount !== matchups.length) {
  throw new Error("CourtMatch manifest counts do not match the downloaded data.");
}

const season = [...new Set(matchups.map((row) => row.season))].sort().at(-1);
if (!season) throw new Error("No season was found in the CourtMatch matchup dataset.");
const seasonRows = matchups.filter(
  (row) => row.season === season && row.seasonType === "regular",
);
const accumulators = new Map();

function bucket(playerId) {
  let value = accumulators.get(playerId);
  if (!value) {
    value = {
      offensePoints: 0,
      offensePossessions: 0,
      defensePointsAllowed: 0,
      defensePossessions: 0,
      offenseOpponents: new Set(),
      defenseOpponents: new Set(),
    };
    accumulators.set(playerId, value);
  }
  return value;
}

for (const row of seasonRows) {
  if (
    typeof row.offensivePlayerId !== "string" ||
    typeof row.defensivePlayerId !== "string" ||
    !Number.isFinite(row.points) ||
    !Number.isFinite(row.matchupPossessions) ||
    row.matchupPossessions <= 0
  ) {
    throw new Error(`Invalid CourtMatch matchup record: ${row.id ?? "unknown"}`);
  }
  const offense = bucket(row.offensivePlayerId);
  offense.offensePoints += row.points;
  offense.offensePossessions += row.matchupPossessions;
  offense.offenseOpponents.add(row.defensivePlayerId);

  const defense = bucket(row.defensivePlayerId);
  defense.defensePointsAllowed += row.points;
  defense.defensePossessions += row.matchupPossessions;
  defense.defenseOpponents.add(row.offensivePlayerId);
}

const sourceStatus = manifest.status;
const contexts = players
  .map((player) => {
    const totals = accumulators.get(player.id);
    if (!totals) return null;
    const rate = (points, possessions) =>
      possessions > 0 ? Number(((points / possessions) * 100).toFixed(1)) : null;
    return {
      playerId: player.id,
      name: player.name,
      teamAbbreviation: player.teamAbbreviation,
      season,
      seasonType: "regular",
      offensePointsPer100MatchupPossessions: rate(
        totals.offensePoints,
        totals.offensePossessions,
      ),
      offenseMatchupPossessions: Number(totals.offensePossessions.toFixed(1)),
      offenseOpponentCount: totals.offenseOpponents.size,
      defensePointsAllowedPer100MatchupPossessions: rate(
        totals.defensePointsAllowed,
        totals.defensePossessions,
      ),
      defenseMatchupPossessions: Number(totals.defensePossessions.toFixed(1)),
      defenseOpponentCount: totals.defenseOpponents.size,
    };
  })
  .filter(Boolean);

const output = {
  source: "CourtMatch Analytics",
  sourceUrl: "https://gfthcode.github.io/courtmatch-analytics/",
  datasetUrl: "https://gfthcode.github.io/courtmatch-analytics/data/manifest.json",
  status: sourceStatus,
  league: "NBA",
  season,
  lastUpdated: manifest.lastUpdated,
  version: manifest.version,
  coverage: manifest.coverage,
  dataSource: manifest.dataSource ?? "未披露",
  playerCount: manifest.playerCount,
  matchupRecordCount: manifest.matchupRecordCount,
  seasonMatchupRecordCount: seasonRows.length,
  standardPlayerStatsCount: playerStats.length,
  metricNote:
    "进攻/防守指标由赛季球员对位记录聚合计算，不是场均数据或逐场 box score；CourtMatch 当前球员场均统计文件记录数为零。",
  players: contexts,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `Imported ${contexts.length} players from ${seasonRows.length} regular-season matchup records (${season}, ${sourceStatus}, ${manifest.lastUpdated}).`,
);
