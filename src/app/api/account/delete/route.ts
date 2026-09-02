export async function DELETE() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false")
    return Response.json({
      deleted: false,
      mode: "demo",
      message: "演示模式不持久化账号；清除浏览器本地数据即可",
    });
  return Response.json(
    { error: "生产实现必须验证身份、最近登录状态并执行可审计的级联删除" },
    { status: 501 },
  );
}
