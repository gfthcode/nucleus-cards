import { PDFParse } from "pdf-parse";
import {
  extractDocumentDraft,
  ResearchProviderUnavailableError,
} from "@/lib/research-llm-agent";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/research/documents/[documentId]/extract">,
) {
  const { documentId } = await context.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const { data: document, error } = await supabase
    .from("research_documents")
    .select("id, storage_path, status")
    .eq("id", documentId)
    .single();
  if (error || !document) return Response.json({ error: "PDF 不存在或无权访问" }, { status: 404 });
  if (document.status === "approved") {
    return Response.json({ error: "该 PDF 已确认，不能重新覆盖审核结果" }, { status: 409 });
  }
  const { data: blob, error: downloadError } = await supabase.storage
    .from("research-documents")
    .download(document.storage_path);
  if (downloadError || !blob) return Response.json({ error: "无法读取私有 PDF" }, { status: 500 });

  let text: string;
  try {
    const parser = new PDFParse({ data: new Uint8Array(await blob.arrayBuffer()) });
    const extracted = await parser.getText();
    await parser.destroy();
    text = extracted.text.trim();
  } catch {
    return Response.json({ error: "无法读取此 PDF 的文本；请上传未加密、可复制文本的 PDF" }, { status: 422 });
  }
  if (!text) return Response.json({ error: "此 PDF 没有可读取文本，暂不支持 OCR 图片 PDF" }, { status: 422 });

  try {
    const draft = await extractDocumentDraft(text);
    const { data: updated, error: updateError } = await supabase
      .from("research_documents")
      .update({ status: "ready_for_review", extracted_fields: draft })
      .eq("id", documentId)
      .select("id, source_filename, status, extracted_fields, updated_at")
      .single();
    if (updateError || !updated) return Response.json({ error: "无法保存审核草稿" }, { status: 500 });
    return Response.json({ data: updated });
  } catch (error) {
    if (error instanceof ResearchProviderUnavailableError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    return Response.json({ error: "PDF 审核提取失败" }, { status: 500 });
  }
}
