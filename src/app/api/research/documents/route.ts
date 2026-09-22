import { randomUUID } from "node:crypto";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const { data, error } = await supabase
    .from("research_documents")
    .select("id, source_filename, byte_size, status, extracted_fields, review_notes, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(30);
  if (error) return Response.json({ error: "无法读取私有文档记录" }, { status: 500 });
  return Response.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  if (!user) return Response.json({ error: "请先登录后上传私有 PDF" }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "请选择一个 PDF 文件" }, { status: 400 });
  }
  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    return Response.json({ error: "仅支持 PDF 文件" }, { status: 400 });
  }
  if (!file.size || file.size > MAX_PDF_BYTES) {
    return Response.json({ error: "PDF 必须小于 10 MB" }, { status: 400 });
  }

  const id = randomUUID();
  const storagePath = `${user.id}/${id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("research-documents")
    .upload(storagePath, file, { contentType: "application/pdf", upsert: false });
  if (uploadError) return Response.json({ error: "无法安全上传 PDF" }, { status: 500 });

  const { data, error } = await supabase
    .from("research_documents")
    .insert({
      id,
      storage_path: storagePath,
      source_filename: file.name.slice(0, 255),
      mime_type: "application/pdf",
      byte_size: file.size,
    })
    .select("id, source_filename, byte_size, status, created_at, updated_at")
    .single();
  if (error || !data) {
    await supabase.storage.from("research-documents").remove([storagePath]);
    return Response.json({ error: "无法创建 PDF 审核记录" }, { status: 500 });
  }
  return Response.json({ data }, { status: 201 });
}
