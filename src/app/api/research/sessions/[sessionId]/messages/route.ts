import { z } from "zod";
import {
  researchCard,
  researchQuestionSchema,
} from "@/lib/card-research-agent";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const messageSchema = z.object({ question: researchQuestionSchema });

export async function GET(
  _request: Request,
  context: RouteContext<"/api/research/sessions/[sessionId]/messages">,
) {
  const { sessionId } = await context.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase)
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const { data, error } = await supabase
    .from("research_messages")
    .select("id, role, content, evidence, tool_trace, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error)
    return Response.json({ error: "无法读取会话消息" }, { status: 404 });
  return Response.json({ data: data ?? [] });
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/research/sessions/[sessionId]/messages">,
) {
  const body = messageSchema.safeParse(await request.json().catch(() => null));
  if (!body.success)
    return Response.json(
      { error: body.error.issues[0]?.message ?? "问题无效" },
      { status: 400 },
    );
  const { sessionId } = await context.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase)
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user)
    return Response.json(
      { error: "请先登录后再开始私有研究" },
      { status: 401 },
    );

  const { data: session, error: sessionError } = await supabase
    .from("research_sessions")
    .select("id, card_id")
    .eq("id", sessionId)
    .single();
  if (sessionError || !session)
    return Response.json(
      { error: "研究会话不存在或无权访问" },
      { status: 404 },
    );

  const [collectionItems, positions] = await Promise.all([
    supabase
      .from("collection_items")
      .select("quantity")
      .eq("card_id", session.card_id),
    supabase
      .from("portfolio_positions")
      .select("quantity")
      .eq("card_id", session.card_id),
  ]);
  const collectionQuantity = (collectionItems.data ?? []).reduce(
    (sum, item) => sum + Number(item.quantity ?? 0),
    0,
  );
  const positionQuantity = (positions.data ?? []).reduce(
    (sum, item) => sum + Number(item.quantity ?? 0),
    0,
  );
  const response = researchCard(session.card_id, body.data.question, {
    collectionQuantity,
    positionQuantity,
  });
  if (!response)
    return Response.json({ error: "研究对象不存在" }, { status: 404 });

  const { error: writeError } = await supabase
    .from("research_messages")
    .insert([
      { session_id: session.id, role: "user", content: body.data.question },
      {
        session_id: session.id,
        role: "assistant",
        content: response.answer,
        evidence: response.evidence,
        tool_trace: response.toolTrace,
      },
    ]);
  if (writeError)
    return Response.json({ error: "无法保存研究消息" }, { status: 500 });
  await supabase
    .from("research_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", session.id);
  return Response.json({ data: response });
}
