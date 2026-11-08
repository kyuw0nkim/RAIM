import { checkBasicAuth } from "@/lib/admin-auth";
import { exportRows, rangeFromDays } from "@/lib/server/analytics";
import { parseRange } from "@/components/admin/RangeFilter";

export const dynamic = "force-dynamic";

/** 비식별 이용 데이터 CSV (엑셀에서 한글이 깨지지 않도록 BOM 포함) */
export async function GET(req: Request) {
  if (checkBasicAuth(req.headers.get("authorization")) !== "ok") return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  if (kind !== "sessions" && kind !== "events" && kind !== "visitors") return new Response("bad kind", { status: 400 });
  const range = parseRange(url.searchParams.get("days") ?? "all");
  const rows = (await exportRows(kind, rangeFromDays(range.days))) as Record<string, unknown>[];
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const cell = (v: unknown) => {
    const s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mobility-tour-${kind}-${range.key}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
