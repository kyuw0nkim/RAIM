import { NextResponse, type NextRequest } from "next/server";
import { checkBasicAuth } from "@/lib/admin-auth";

// /admin 보호: 환경변수 ADMIN_USER / ADMIN_PASSWORD 기반 Basic 인증
export function proxy(req: NextRequest) {
  const result = checkBasicAuth(req.headers.get("authorization"));
  if (result === "ok") return NextResponse.next();
  if (result === "not-configured") {
    return new NextResponse("관리자 계정이 설정되지 않았습니다. Vercel 환경변수 ADMIN_USER / ADMIN_PASSWORD를 등록하세요.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new NextResponse("인증이 필요합니다.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Mobility Tour Admin", charset="UTF-8"', "Content-Type": "text/plain; charset=utf-8" },
  });
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
