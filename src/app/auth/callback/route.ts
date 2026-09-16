import { NextResponse } from "next/server";
import { createSupabaseServerClient, safeReturnTo } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeReturnTo(url.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/login", url));

  const code = url.searchParams.get("code");
  if (code) await supabase.auth.exchangeCodeForSession(code);

  const tokenHash = url.searchParams.get("token_hash");
  if (!code && tokenHash) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  }

  return NextResponse.redirect(new URL(next, url));
}
