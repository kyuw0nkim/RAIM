// /admin 보호용 Basic 인증 검사 (proxy와 서버 액션에서 함께 사용)
// MVP용 최소 보호입니다. 역할 구분(Editor/Publisher/Researcher)이 필요해지면
// 계정 기반 인증으로 교체하세요 (PRD §7.6).
export type AuthResult = "ok" | "unauthorized" | "not-configured";

export function checkBasicAuth(header: string | null): AuthResult {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return process.env.NODE_ENV !== "production" ? "ok" : "not-configured"; // 로컬 개발 편의
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(":");
      if (i >= 0 && safeEqual(decoded.slice(0, i), user) && safeEqual(decoded.slice(i + 1), pass)) return "ok";
    } catch {}
  }
  return "unauthorized";
}

function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
