import { describe, expect, it } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { POST as importSales } from "@/app/api/import/sales/route";
import { POST as importVerifiedSales } from "@/app/api/import/verified-sales/route";

describe("API routes", () => {
  it("reports the official public roster source health", async () => {
    const response = getHealth();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.mode).toBe("licensed");
    expect(body.rosterSource.provider).toBe("nba_official");
    expect(body.sources.length).toBeGreaterThan(0);
  });

  it("rejects malformed sale imports", async () => {
    const response = await importSales(
      new Request("http://localhost/api/import/sales", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ records: [] }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("queues valid sale imports for review", async () => {
    const response = await importSales(
      new Request("http://localhost/api/import/sales", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "api-test-valid-import",
        },
        body: JSON.stringify({
          records: [
            {
              cardIdentityKey: "topps|chrome|2025|1|cooper-flagg",
              soldAt: "2026-08-30T08:00:00Z",
              amount: 8420,
              currency: "CNY",
              source: "reviewed-offline",
            },
          ],
        }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(202);
    expect(body.status).toBe("queued-for-review");
    expect(body.accepted).toBe(1);
  });

  it("rejects historical prices without evidence", async () => {
    const response = await importVerifiedSales(
      new Request("http://localhost/api/import/verified-sales", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "evidence-missing" },
        body: JSON.stringify({ records: [{
          cardIdentityKey: "topps|chrome|2025|1|cooper-flagg",
          soldAt: "2026-08-30T08:00:00Z",
          amount: 8420,
          currency: "CNY",
          source: "ebay",
          verified: true,
        }] }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("queues only evidence-backed historical sales", async () => {
    const response = await importVerifiedSales(
      new Request("http://localhost/api/import/verified-sales", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "evidence-present" },
        body: JSON.stringify({ records: [{
          cardIdentityKey: "topps|chrome|2025|1|cooper-flagg",
          soldAt: "2026-08-30T08:00:00Z",
          amount: 8420,
          currency: "CNY",
          source: "ebay",
          originalUrl: "https://www.ebay.com/itm/1234567890",
          externalSaleId: "1234567890",
          evidenceSnapshot: "成交页面快照：已售出，成交时间与金额可核验。",
          verified: true,
        }] }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(202);
    expect(body.status).toBe("queued-for-review");
    expect(body.accepted).toBe(1);
  });
});

