import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard") && !path.includes("/login")) {
    const authCookie = request.cookies.get("pb_auth");
    const pbAuthCookie = request.cookies.get("pocketbase_auth");

    if (!authCookie && !pbAuthCookie) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURIComponent(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
