import { NextResponse, type NextRequest } from "next/server";

// /admin 보호: 환경변수 ADMIN_USER / ADMIN_PASSWORD 기반 Basic 인증.
// MVP용 최소 보호입니다. 역할 구분(Editor/Publisher/Researcher)이 필요해지면
// Supabase Auth 등 계정 기반 인증으로 교체하세요 (PRD §7.6).
export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next(); // 로컬 개발 편의
    return new NextResponse("관리자 계정이 설정되지 않았습니다. Vercel 환경변수 ADMIN_USER / ADMIN_PASSWORD를 등록하세요.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(":");
      if (i >= 0 && safeEqual(decoded.slice(0, i), user) && safeEqual(decoded.slice(i + 1), pass)) {
        return NextResponse.next();
      }
    } catch {}
  }
  return new NextResponse("인증이 필요합니다.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Mobility Tour Admin", charset="UTF-8"', "Content-Type": "text/plain; charset=utf-8" },
  });
}

function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
