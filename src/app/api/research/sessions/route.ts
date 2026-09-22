import { z } from "zod";
import { getCard, getPlayer } from "@/lib/demo-data";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const createSessionSchema = z.object({ cardId: z.string().min(1).max(120) });

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase)
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user)
    return Response.json(
      { error: "请先登录后查看私有研究记录" },
      { status: 401 },
    );

  const { data, error } = await supabase
    .from("research_sessions")
    .select("id, card_id, player_id, title, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(30);
  if (error)
    return Response.json({ error: "无法读取研究记录" }, { status: 500 });
  return Response.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const body = createSessionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success)
    return Response.json({ error: "研究对象无效" }, { status: 400 });
  const card = getCard(body.data.cardId);
  const player = card ? getPlayer(card.playerId) : undefined;
  if (!card || !player)
    return Response.json({ error: "卡片不存在" }, { status: 404 });

  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase)
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user)
    return Response.json(
      { error: "请先登录后创建私有研究记录" },
      { status: 401 },
    );

  const { data, error } = await supabase
    .from("research_sessions")
    .insert({
      card_id: card.id,
      player_id: player.id,
      title: `${player.displayNameZh} · ${card.releaseYear} ${card.brand}`,
    })
    .select("id, card_id, player_id, title, created_at, updated_at")
    .single();
  if (error || !data)
    return Response.json({ error: "无法创建研究会话" }, { status: 500 });
  return Response.json({ data }, { status: 201 });
}
