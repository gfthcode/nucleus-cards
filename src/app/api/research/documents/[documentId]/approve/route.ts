import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const approvalSchema = z.object({
  confirmed: z.literal(true),
  reviewNotes: z.string().trim().max(2000).optional(),
});

export async function POST(
  request: Request,
  context: RouteContext<"/api/research/documents/[documentId]/approve">,
) {
  const body = approvalSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: "请明确确认后再保存审核决定" }, { status: 400 });
  }
  const { documentId } = await context.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const { data, error } = await supabase
    .from("research_documents")
    .update({ status: "approved", review_notes: body.data.reviewNotes ?? null })
    .eq("id", documentId)
    .eq("status", "ready_for_review")
    .select("id, source_filename, status, extracted_fields, review_notes, updated_at")
    .single();
  if (error || !data) {
    return Response.json({ error: "没有可确认的审核草稿，或该文档不属于当前用户" }, { status: 409 });
  }
  // Approval intentionally stores the review decision only. A later, explicit
  // import action must map these candidates to a verified card before any
  // collection/portfolio write is allowed.
  return Response.json({ data });
}
