import { NextResponse } from "next/server";
import { createSupabaseServerClient, safeReturnTo } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeReturnTo(url.searchParams.get("next"));
  const failure = new URL("/auth/error", url);
  failure.searchParams.set("next", next);
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  if (!tokenHash || (rawType !== "email" && rawType !== "magiclink")) return NextResponse.redirect(failure);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(failure);
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: rawType });
  if (error) return NextResponse.redirect(failure);
  return NextResponse.redirect(new URL(next, url));
}
