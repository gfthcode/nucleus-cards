import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const demoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE !== "false" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (request.nextUrl.pathname.startsWith("/admin") && !demoMode) {
    const role = request.cookies.get("nucleus-role")?.value;
    if (role !== "admin")
      return NextResponse.redirect(new URL("/login?next=/admin", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
