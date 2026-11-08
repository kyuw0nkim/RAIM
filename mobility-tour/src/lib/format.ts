const KST = "Asia/Seoul";

export function fmtDateTime(v: string | Date | null | undefined) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("ko-KR", { timeZone: KST, dateStyle: "short", timeStyle: "short" }).format(new Date(v));
}

export function fmtTime(v: string | Date) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: KST, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(v),
  );
}

/** 초 → "3분 20초" */
export function fmtDuration(seconds: number) {
  if (!seconds || seconds < 0) return "—";
  const s = Math.round(seconds);
  if (s < 60) return `${s}초`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 ${s % 60}초`;
  return `${Math.floor(m / 60)}시간 ${m % 60}분`;
}

export function pct(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}
