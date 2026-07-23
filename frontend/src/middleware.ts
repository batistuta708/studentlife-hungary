import { NextRequest, NextResponse } from "next/server";

// `isAuthed` is a first-party, non-httpOnly marker cookie the frontend sets itself on
// login/register/session-bootstrap (see store/auth.store.ts) — NOT the backend's real
// refreshToken cookie. That cookie can't be used here: it's scoped to path=/api/v1/auth
// (never attached to a plain page navigation like this one), and in production the
// frontend and backend are on entirely different domains, so a cookie set by one is
// never visible to requests on the other regardless of path. This check is a UX
// optimization only — it stops an obviously-logged-out visitor from ever seeing a
// protected page flash before the client-side guard (see dashboard/layout.tsx) kicks
// in — real enforcement happens server-side on every API call via the access token.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("isAuthed");
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
