import { dataSources } from "@/lib/demo-data";
export const dynamic = "force-static";
export function GET() {
  return Response.json({
    status: "ok",
    mode: "demo",
    sources: dataSources.map((source) => ({
      id: source.id,
      enabled: source.enabled,
      authorization: source.authorization,
    })),
    updatedAt: "2026-08-31T01:30:00Z",
  });
}
