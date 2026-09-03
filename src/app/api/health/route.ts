import { dataSources } from "@/lib/demo-data";
import { getRosterSourceStatus } from "@/lib/roster-sync";
export const dynamic = "force-dynamic";
export function GET() {
  const rosterSource = getRosterSourceStatus();
  return Response.json({
    status: "ok",
    mode: rosterSource.configured ? "licensed" : "demo",
    sources: dataSources.map((source) => ({
      id: source.id,
      enabled: source.enabled,
      authorization: source.authorization,
    })),
    rosterSource,
    updatedAt: new Date().toISOString(),
  });
}
