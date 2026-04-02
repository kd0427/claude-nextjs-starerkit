import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * /quotes 경로에 대한 인증 미들웨어
 * 미인증 사용자는 /login 으로 리디렉션
 */
export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith("/quotes");

  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/quotes/:path*"],
};
