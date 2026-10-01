import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
const destination = new URL("../src/data/nba-official-roster.json", import.meta.url);
const old = JSON.parse(execFileSync("git", ["show", "HEAD:src/data/nba-official-roster.json"], { encoding: "utf8" }));
const source = JSON.parse(await readFile(process.argv[2], "utf8"));
if (source.sourceUrl !== "https://www.nba.com/players" || source.records.length !== source.recordCount) throw new Error("Official roster snapshot incomplete");
const previous = new Map(old.records.map((r) => [r.personId, r]));
const records = source.records.map(([personId, name, teamAbbreviation, jerseyNumber, position]) => ({
  ...previous.get(personId),
  personId, name, teamAbbreviation, jerseyNumber, position,
  sourceSlug: previous.get(personId)?.sourceSlug ?? "",
  // Draft information is carried forward, never invented from the current year.
  draftYear: previous.get(personId)?.draftYear ?? 0,
  draftPick: previous.get(personId)?.draftPick ?? null,
}));
if (new Set(records.map((r) => r.personId)).size !== records.length) throw new Error("Duplicate roster IDs");
await writeFile(destination, JSON.stringify({ source: source.source, sourceUrl: source.sourceUrl, fetchedAt: source.verifiedAt ?? source.fetchedAt, contractStatus: source.contractStatus, draftMetadataNote: `Carried forward from ${old.fetchedAt}; 0 means not verified`, records }, null, 2) + "\n");
console.log(`Refreshed ${records.length} NBA directory entries; contract type is not inferred.`);
