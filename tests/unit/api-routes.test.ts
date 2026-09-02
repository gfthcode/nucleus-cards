import { describe, expect, it } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { POST as importSales } from "@/app/api/import/sales/route";

describe("API routes", () => {
  it("reports demo source health", async () => {
    const response = getHealth();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.mode).toBe("demo");
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
});
