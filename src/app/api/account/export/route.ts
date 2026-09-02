import { demoAlerts, demoPortfolio } from "@/lib/demo-data";
export async function GET() {
  return Response.json(
    {
      profile: { nickname: "Nucleus Collector", demo: true },
      portfolio: demoPortfolio,
      alerts: demoAlerts,
      exportedAt: new Date().toISOString(),
      notice: "演示导出；生产模式必须验证当前用户身份并仅返回本人数据",
    },
    {
      headers: {
        "Content-Disposition": "attachment; filename=nucleus-demo-export.json",
      },
    },
  );
}
