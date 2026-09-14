import { NextResponse, type NextRequest } from "next/server";
import { updateAuthSession } from "@/lib/supabase/proxy";

const protectedPrefixes = ["/portfolio", "/collections", "/watchlist", "/alerts", "/settings"];

export async function proxy(request: NextRequest) {
  const { response, userId, configured } = await updateAuthSession(request);
  const needsLogin = protectedPrefixes.some((prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`));
  if (configured && needsLogin && !userId) {
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}${request.nextUrl.hash}`;
    const url = new URL("/login", request.url);
    url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }
  if (configured && request.nextUrl.pathname.startsWith("/admin")) {
    // Admin authorization is intentionally not inferred from a browser cookie.
    return NextResponse.redirect(new URL("/login?returnTo=/admin", request.url));
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
