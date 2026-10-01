import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decodeImageBytes,
  main,
  mergeReviewedPhotos,
  parseArguments,
  PhotoIntakeError,
  validateCandidate,
  validateImageUrl,
  verifyRemoteImage,
} from "../../scripts/merge-reviewed-card-photos.mjs";

const NOW = "2026-10-01T10:00:00.000Z";
const roster = {
  records: [
    { personId: "1", name: "Harrison Barnes", draftYear: 2012 },
    { personId: "2", name: "Aaron Wiggins", draftYear: 2021 },
    { personId: "3", name: "Miles Bridges", draftYear: 2018 },
    { personId: "4", name: "Gary Payton II", draftYear: 2016 },
  ],
};
const sharp = createRequire(import.meta.resolve("next"))("sharp");

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    id: "hobbyscan-123", sourceId: "hobbyscan-123", personId: "1", playerName: "Harrison Barnes",
    title: "2021 Donruss Optic Harrison Barnes #111", year: 2021, set: "Donruss Optic", cardNumber: "111",
    imageUrl: "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/barnes.jpg",
    sourceUrl: "https://www.hobbyscan.com/card/123", sourceName: "HobbyScan", ...overrides,
  };
}

function wiggins(overrides: Record<string, unknown> = {}) {
  return candidate({
    id: "hobbyscan-456", sourceId: "hobbyscan-456", personId: "2", playerName: "Aaron Wiggins",
    title: "2021 Panini Spectra Aaron Wiggins #130", set: "Panini Spectra", cardNumber: "130",
    sourceUrl: "https://www.hobbyscan.com/card/456",
    imageUrl: "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/wiggins.jpg", ...overrides,
  });
}

function phygitals() {
  return candidate({
    id: "phygitals-GBxTzXUozVnGTmFHRrC83yJHi63mq7Ba3PjtWwHZvGvY",
    sourceId: "phygitals-GBxTzXUozVnGTmFHRrC83yJHi63mq7Ba3PjtWwHZvGvY",
    personId: "3", playerName: "Miles Bridges", title: "2018 Panini Prizm Miles Bridges #278",
    year: 2018, set: "Panini Prizm", cardNumber: "278", sourceName: "Phygitals",
    sourceUrl: "https://api.phygitals.com/api/vm/chase/boost-sport-pack",
    imageUrl: "https://img.phygitals.com/06TGQRjVLuT6zIovYypDFCt5K8FPMooV7BdT395qX0M",
  });
}

const dimensions = async () => ({ width: 600, height: 900 });
const temporaryDirectories: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("reviewed photo intake identity and provenance", () => {
  it("accepts reviewed metadata without claiming a manual visual inspection or importing prices", () => {
    const clean = validateCandidate(candidate({ price: 120, insuredValue: 80, fmv: 70, sourcePrice: 90, owner: "not-public", manual: false }), roster, NOW);
    expect(clean).toMatchObject({ personId: "1", sourceName: "HobbyScan", sourceDocs: "https://www.hobbyscan.com/cards", cardNumber: "111" });
    for (const key of ["price", "insuredValue", "fmv", "sourcePrice", "owner", "manual"]) expect(clean).not.toHaveProperty(key);
    expect(clean).not.toHaveProperty("width");
  });

  it("retains the documented Phygitals attribution for publicly reviewed pack images", () => {
    expect(validateCandidate(phygitals(), roster, NOW)).toMatchObject({ sourceName: "Phygitals", sourceDocs: "https://www.phygitals.com/docs/public-api" });
  });

  it("accepts the documented CardPricer provenance and an approved archive image", () => {
    const record = candidate({ id: "cardpricer-abc123", sourceId: "cardpricer-abc123", sourceName: "CardPricer", sourceUrl: "https://cardpricer.co/cards/abc123", imageUrl: "https://arweave.net/approved-card-photo", sourceDocs: "https://cardpricer.co/docs/api" });
    expect(validateCandidate(record, roster, NOW).sourceDocs).toBe("https://cardpricer.co/docs/api");
  });

  it.each([
    ["wrong player", { playerName: "Aaron Wiggins" }],
    ["wrong personId", { personId: "900" }],
    ["wrong title", { title: "2021 Donruss Optic Aaron Wiggins #111" }],
    ["ambiguous title", { title: "2021 Harrison Barnes and Aaron Wiggins #111" }],
    ["future year", { year: 2027 }],
    ["year disagreement", { year: 2020 }],
    ["missing number", { cardNumber: null }],
    ["synthetic number", { cardNumber: "NBA-1" }],
    ["number disagreement", { cardNumber: "112" }],
    ["grade mistaken for card number", { cardNumber: "10", title: "2021 Donruss Optic Harrison Barnes PSA 10" }],
    ["print run mistaken for card number", { cardNumber: "99", title: "2021 Donruss Optic Harrison Barnes /99" }],
    ["baseball", { category: "Baseball" }],
    ["jersey", { cardType: "Jersey" }],
    ["unapproved source", { sourceName: "Unknown" }],
    ["wrong source ID", { id: "hobbyscan-124", sourceId: "hobbyscan-124" }],
    ["source ID mismatch", { id: "hobbyscan-124" }],
    ["unapproved docs", { sourceDocs: "https://evil.test/docs" }],
  ])("rejects %s", (_name, overrides) => {
    expect(() => validateCandidate(candidate(overrides), roster, NOW)).toThrow();
  });

  it("does not collapse a current player into a father's older card", () => {
    expect(() => validateCandidate(candidate({ personId: "4", playerName: "Gary Payton II", title: "1997 Topps Gary Payton #111", year: 1997 }), roster, NOW)).toThrow(/identify|era/);
  });

  it.each([
    "http://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/x.jpg",
    "data:image/png;base64,aGVsbG8=",
    "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com.evil.test/scans/x.jpg",
    "https://user:secret@hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/x.jpg",
    "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com:444/scans/x.jpg",
    "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/private/x.jpg",
    "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/placeholder.jpg",
    "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/headshot.jpg",
    "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/x.jpg?token=secret",
    "https://img.phygitals.com/06TGQRjVLuT6zIovYypDFCt5K8FPMooV7BdT395qX0M",
  ])("rejects unsafe or source-mismatched image %s", (url) => {
    expect(() => validateImageUrl(url, "HobbyScan")).toThrow();
  });

  it("rejects a forged source page and credentials independently of the image", () => {
    for (const sourceUrl of ["https://www.hobbyscan.com.evil.test/card/123", "https://user:secret@www.hobbyscan.com/card/123", "https://www.hobbyscan.com/profile/123"]) {
      expect(() => validateCandidate(candidate({ sourceUrl }), roster, NOW)).toThrow();
    }
  });
});

describe("lossless incremental merge", () => {
  it("preserves all 205 prior rows byte-for-byte while only adding uncovered players", async () => {
    const records = Array.from({ length: 205 }, (_, index) => ({ sourceId: `legacy-${index}`, personId: String(index + 1000), original: { note: "keep" } }));
    const existing = { source: "original catalogue", records };
    const before = JSON.stringify(existing);
    const result = await mergeReviewedPhotos(existing, { records: [candidate(), wiggins()] }, roster, { verifyImage: dimensions, now: NOW });
    expect(JSON.stringify(existing)).toBe(before);
    expect(result.manifest.records.slice(0, 205)).toEqual(records);
    expect(result.report).toMatchObject({ previous: 205, added: 2, total: 207, rejected: 0, missing: 2, coveredPlayers: 2 });
    expect(result.manifest.source).toBe("original catalogue");
    expect(result.manifest.records[205]).toMatchObject({ width: 600, height: 900, checkedAt: NOW });
  });

  it("never replaces a previously covered player, including when the incoming source fails", async () => {
    const old = { ...candidate(), width: 450, height: 700, checkedAt: "2026-09-24T00:00:00Z" };
    const verifyImage = vi.fn(dimensions);
    const result = await mergeReviewedPhotos({ records: [old] }, [candidate({ imageUrl: "bad" }), candidate()], roster, { verifyImage, now: NOW });
    expect(result.manifest.records).toEqual([old]);
    expect(result.report).toMatchObject({ added: 0, rejected: 0, skipped: 2 });
    expect(verifyImage).not.toHaveBeenCalled();
  });

  it("reports a failed image and accepts a later valid alternative without dropping old rows", async () => {
    const verifyImage = vi.fn().mockRejectedValueOnce(new Error("Truncated image")).mockResolvedValue({ width: 700, height: 1100 });
    const result = await mergeReviewedPhotos({ records: [] }, [candidate(), candidate({ imageUrl: "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/alternative.jpg" })], roster, { verifyImage, now: NOW });
    expect(result.report).toMatchObject({ added: 1, rejected: 1, missing: 3 });
    expect(result.report.failures[0].message).toBe("Truncated image");
    expect(result.manifest.records[0].imageUrl).toContain("alternative");
  });

  it.each([403, 429])("stops source after HTTP %s but continues independent sources", async (status) => {
    const verifyImage = vi.fn(async (_url: string, name: string) => {
      if (name === "HobbyScan") throw new PhotoIntakeError("source-stopped", `HTTP ${status}`, status);
      return dimensions();
    });
    const result = await mergeReviewedPhotos({ records: [] }, [candidate(), wiggins(), phygitals()], roster, { verifyImage, now: NOW });
    expect(verifyImage).toHaveBeenCalledTimes(2);
    expect(result.report).toMatchObject({ added: 1, rejected: 2, stoppedSources: ["HobbyScan"] });
    expect(result.report.failures[1].message).toContain("request not made");
  });

  it("requires alternate images to decode and never imports their unchecked URLs", async () => {
    const verifyImage = vi.fn().mockResolvedValueOnce({ width: 700, height: 1100 }).mockRejectedValueOnce(new Error("Bad full-size photo"));
    const result = await mergeReviewedPhotos({ records: [] }, [candidate({ fullImageUrl: "https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/full.jpg" })], roster, { verifyImage, now: NOW });
    expect(result.report).toMatchObject({ added: 0, rejected: 1 });
    expect(result.manifest.records).toHaveLength(0);
  });

  it("spaces successive source requests without sleeping before the first image", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1234);
    const sleep = vi.fn(async () => {});
    const verifyImage = vi.fn(dimensions);
    const result = await mergeReviewedPhotos([], [candidate(), wiggins(), phygitals()], roster, { verifyImage, now: NOW, delayMs: 350, sleep });
    expect(result.report.added).toBe(3);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(350);
  });

  it("rejects an existing duplicate instead of trying to repair or discard it", async () => {
    await expect(mergeReviewedPhotos({ records: [candidate(), candidate()] }, [], roster, { verifyImage: dimensions, now: NOW })).rejects.toThrow(/duplicate/);
  });

  it("validates JSON shape and dimensions and counts uncovered players explicitly", async () => {
    await expect(mergeReviewedPhotos({}, [], roster)).rejects.toThrow(/records array/);
    const result = await mergeReviewedPhotos([], [candidate()], roster, { verifyImage: async () => ({ width: 10, height: 10 }), now: NOW });
    expect(result.report).toMatchObject({ added: 0, rejected: 1, missing: 4 });
    expect(result.report.missingPlayers).toHaveLength(4);
  });
});

describe("complete image verification without network in tests", () => {
  it("fully decodes a valid image and rejects truncated data despite readable metadata", async () => {
    const bytes = await sharp({ create: { width: 600, height: 900, channels: 3, background: "#aa7755" } }).jpeg().toBuffer();
    expect(await decodeImageBytes(bytes)).toEqual({ width: 600, height: 900 });
    const truncated = bytes.subarray(0, Math.floor(bytes.length * 0.75));
    expect((await sharp(truncated).metadata()).width).toBe(600);
    await expect(decodeImageBytes(truncated)).rejects.toThrow();
    const small = await sharp({ create: { width: 40, height: 40, channels: 3, background: "black" } }).png().toBuffer();
    await expect(decodeImageBytes(small)).rejects.toThrow(/200/);
    await expect(decodeImageBytes(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'></svg>"))).rejects.toThrow();
  });

  it("only performs credential-free, redirect-free GET and decodes the returned pixels", async () => {
    const png = await sharp({ create: { width: 300, height: 400, channels: 3, background: "blue" } }).png().toBuffer();
    const fetchImpl = vi.fn(async () => new Response(png, { headers: { "content-type": "image/png" } }));
    expect(await verifyRemoteImage(candidate().imageUrl, "HobbyScan", { fetchImpl })).toEqual({ width: 300, height: 400 });
    expect(fetchImpl.mock.calls[0]).toEqual([candidate().imageUrl, expect.objectContaining({ method: "GET", redirect: "error", credentials: "omit" })]);
  });

  it.each([403, 429])("surfaces source-stop HTTP %s without retrying", async (status) => {
    const fetchImpl = vi.fn(async () => new Response("stop", { status }));
    await expect(verifyRemoteImage(candidate().imageUrl, "HobbyScan", { fetchImpl })).rejects.toMatchObject({ status, code: "source-stopped" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("rejects HTML, redirects, and oversized streamed responses", async () => {
    await expect(verifyRemoteImage(candidate().imageUrl, "HobbyScan", { fetchImpl: async () => new Response("<html>Error</html>", { headers: { "content-type": "text/html" } }) })).rejects.toThrow(/raster/);
    const redirected = new Response("x", { headers: { "content-type": "image/jpeg" } });
    Object.defineProperty(redirected, "redirected", { value: true });
    await expect(verifyRemoteImage(candidate().imageUrl, "HobbyScan", { fetchImpl: async () => redirected })).rejects.toThrow(/redirect/);
    await expect(verifyRemoteImage(candidate().imageUrl, "HobbyScan", { maxBytes: 4, fetchImpl: async () => new Response("12345678", { headers: { "content-type": "image/jpeg" } }) })).rejects.toThrow(/byte limit/);
  });
});

describe("safe CLI output", () => {
  it("defaults to dry-run and refuses direct input replacement", () => {
    expect(parseArguments(["--existing", "old.json", "--candidates", "reviewed.json", "--roster", "roster.json"]).output).toBeNull();
    expect(() => parseArguments(["--existing", "old.json", "--candidates", "reviewed.json", "--roster", "roster.json", "--output", "old.json"])).toThrow(/replace/);
    expect(() => parseArguments(["--existing", "old.json"])).toThrow(/Required/);
    expect(() => parseArguments(["--image-host", "evil.test"])).toThrow(/argument/);
    expect(() => parseArguments(["--delay-ms", "0"])).toThrow(/350/);
    expect(parseArguments(["--existing", "old.json", "--candidates", "reviewed.json", "--roster", "roster.json", "--delay-ms", "1000"]).delayMs).toBe(1000);
  });

  it("dry-run does not mutate inputs and explicit output uses exclusive creation", async () => {
    const dir = await mkdtemp(join(tmpdir(), "nucleus-photo-intake-test-"));
    temporaryDirectories.push(dir);
    const oldPath = join(dir, "old.json"), candidatePath = join(dir, "reviewed.json"), rosterPath = join(dir, "roster.json"), outputPath = join(dir, "output.json");
    const oldText = JSON.stringify({ records: [candidate()] });
    await Promise.all([writeFile(oldPath, oldText), writeFile(candidatePath, JSON.stringify({ records: [] })), writeFile(rosterPath, JSON.stringify(roster))]);
    const args = ["--existing", oldPath, "--candidates", candidatePath, "--roster", rosterPath];
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await main(args);
    expect(JSON.parse(log.mock.calls[0][0]).dryRun).toBe(true);
    expect(await readFile(oldPath, "utf8")).toBe(oldText);
    await main([...args, "--output", outputPath]);
    const created = await readFile(outputPath, "utf8");
    expect(JSON.parse(created).records).toEqual([candidate()]);
    await expect(main([...args, "--output", outputPath])).rejects.toMatchObject({ code: "EEXIST" });
    expect(await readFile(outputPath, "utf8")).toBe(created);
    expect(await readFile(oldPath, "utf8")).toBe(oldText);
  });
});
