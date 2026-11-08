import Link from "next/link";

export const RANGES = [
  { key: "7", label: "최근 7일", days: 7 },
  { key: "30", label: "최근 30일", days: 30 },
  { key: "90", label: "최근 90일", days: 90 },
  { key: "all", label: "전체", days: null },
] as const;

export function parseRange(v: string | undefined) {
  return RANGES.find((r) => r.key === v) ?? RANGES[1];
}

/** 기간 선택 — 차트 위 한 줄 */
export function RangeFilter({ current, base }: { current: string; base: string }) {
  return (
    <nav className="range-filter" aria-label="기간">
      {RANGES.map((r) => (
        <Link key={r.key} href={`${base}?days=${r.key}`} className={r.key === current ? "active" : ""} aria-current={r.key === current ? "true" : undefined}>
          {r.label}
        </Link>
      ))}
    </nav>
  );
}
