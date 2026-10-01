import { readFile, writeFile } from "node:fs/promises";

const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const hobbyManifest = await read("/private/tmp/nucleus-photo-sources-oct01/hobbyscan-candidates.json");
const decisions = await read("/private/tmp/nucleus-photo-sources-oct01/hobbyscan-review-decisions.json");
const reviewed09180 = await read("/private/tmp/nucleus-photo-sources-oct01/hobbyscan-visual-review-091-180.json");
const visualIds = new Set(reviewed09180.records.filter((r) => r.decision === "visually_suitable").map((r) => String(r.sourceId)));
const replacements = new Map(decisions.decisions.map((r) => [String(r.personId), String(r.replacementSourceId)]));
const rejected = new Set(decisions.decisions.map((r) => String(r.rejectedSourceId)));
const byId = new Map(hobbyManifest.records.flatMap((r) => [r.selected, ...r.candidates]).filter(Boolean).map((r) => [String(r.sourceId), r]));
const hobby = [];
for (const group of hobbyManifest.records) {
  const replacement = replacements.get(String(group.selected.personId));
  const selectedId = replacement ?? String(group.selected.sourceId);
  const selected = byId.get(selectedId);
  if (!selected || rejected.has(String(selected.sourceId))) continue;
  if (replacement || visualIds.has(String(selected.sourceId)) || !reviewed09180.records.some((r) => String(r.personId) === String(selected.personId))) hobby.push(selected);
}
// The last 86 entries were reviewed from contact sheets; keep complete-looking fronts and
// omit the few visibly rotated/blurred/undersized shots. This is a conservative intake list.
const omitLate = new Set(["hobbyscan-400084", "hobbyscan-884516", "hobbyscan-980397"]);
const late = hobbyManifest.records.flatMap((g) => g.candidates ?? []).filter((r) => Number(r.sourceId) && Number(r.sourceId) >= 0 && !omitLate.has(String(r.id)));
// Restrict late records to the source-order range 181..266 using the image audit person IDs.
const latePeople = new Set((await read("/private/tmp/nucleus-photo-sources-oct01/contact-sheet-image-audit-180-266.json")).records.map((r) => String(r.personId)));
for (const r of late) if (latePeople.has(String(r.personId)) && !hobby.some((x) => String(x.personId) === String(r.personId))) hobby.push(r);
const cc = (await read("/private/tmp/nucleus-photos-oct01/collectorcrypt-new-records.json")).records;
const phy = (await read("/private/tmp/nucleus-photos-oct01/phygitals-new-records.json")).records.map((r) => ({ ...r, sourceName: "Phygitals", sourceDocs: "https://www.phygitals.com/docs/public-api" }));
const cp = (await read("/private/tmp/nucleus-cardpricer-oct01-verified.json")).records ?? await read("/private/tmp/nucleus-cardpricer-oct01-verified.json");
const incoming = [...cc.map((r) => ({ ...r, sourceName: "Collector Crypt", sourceDocs: "https://docs.collectorcrypt.com/marketplace/api" })), ...phy, ...hobby.map((r) => ({ ...r, id: `hobbyscan-${r.sourceId}`, sourceId: `hobbyscan-${r.sourceId}`, sourceName: "HobbyScan", sourceDocs: "https://www.hobbyscan.com/cards", parallel: r.parallel ?? null })), ...cp];
const seen = new Set();
const unique = incoming.filter((r) => { const key = String(r.personId); if (seen.has(key)) return false; seen.add(key); return true; });
await writeFile("/private/tmp/nucleus-photo-sources-oct01/reviewed-candidates-final.json", JSON.stringify({ source: "Reviewed public card catalogues", generatedAt: new Date().toISOString(), records: unique }, null, 2) + "\n");
console.log(JSON.stringify({ hobby: hobby.length, incoming: incoming.length, unique: unique.length, people: seen.size }));
