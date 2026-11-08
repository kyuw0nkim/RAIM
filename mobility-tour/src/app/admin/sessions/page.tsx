import Link from "next/link";
import { listSessions, rangeFromDays } from "@/lib/server/analytics";
import { getPublished } from "@/lib/server/content";
import { STAGE_LABEL } from "@/content/ui";
import { EXHIBIT_IDS, STAGES } from "@/content/types";
import { RangeFilter, parseRange } from "@/components/admin/RangeFilter";
import { ProgressDots } from "@/components/admin/charts";
import { fmtDateTime, fmtDuration } from "@/lib/format";

export const dynamic = "force-dynamic";
const PAGE = 50;

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ days?: string; page?: string }> }) {
  const sp = await searchParams;
  const range = parseRange(sp.days);
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ rows, total }, { content }] = await Promise.all([
    listSessions(rangeFromDays(range.days), PAGE, (page - 1) * PAGE),
    getPublished(),
  ]);
  const labels = STAGES.map((s) => STAGE_LABEL[s].ko);
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <main className="admin-page wide">
      <header className="admin-header row">
        <div>
          <p className="admin-eyebrow">세션 기록</p>
          <h1>세션별 진행 상황</h1>
          <p className="muted">
            세션 = 태블릿 한 대로 함께 관람한 한 그룹의 투어입니다. 전시물마다 5단계 중 어디까지 갔는지 표시합니다.
          </p>
        </div>
        <RangeFilter current={range.key} base="/admin/sessions" />
      </header>

      <section className="admin-card">
        <div className="table-head">
          <span>
            총 <strong>{total.toLocaleString()}</strong>개 세션
          </span>
          <a className="admin-link" href={`/admin/export?kind=sessions&days=${range.key}`}>
            CSV 내보내기
          </a>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="data-table sessions">
              <thead>
                <tr>
                  <th>시작</th>
                  <th>기기</th>
                  <th>언어</th>
                  <th>인원</th>
                  <th>이용 시간</th>
                  {EXHIBIT_IDS.map((id) => (
                    <th key={id}>{content.exhibits[id].name.ko}</th>
                  ))}
                  <th>종료</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const end = r.ended_at ?? r.last_event_at;
                  const secs = (new Date(end).getTime() - new Date(r.started_at).getTime()) / 1000;
                  return (
                    <tr key={r.session_id}>
                      <td>{fmtDateTime(r.started_at)}</td>
                      <td>{r.device_id ?? "—"}</td>
                      <td>{r.initial_language?.toUpperCase() ?? "—"}</td>
                      <td>{r.visitors || "—"}</td>
                      <td>{fmtDuration(secs)}</td>
                      {EXHIBIT_IDS.map((id) => (
                        <td key={id}>
                          <ProgressDots reached={r.progress[id]} labels={labels} />
                        </td>
                      ))}
                      <td>{r.end_reason === "ended" ? "종료" : r.end_reason === "idle" ? "자동 초기화" : "진행/미확인"}</td>
                      <td>
                        <Link className="admin-link" href={`/admin/sessions/${encodeURIComponent(r.session_id)}`}>
                          상세
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="chart-empty">이 기간에 기록된 세션이 없습니다.</p>
        )}
        {pages > 1 && (
          <nav className="pager">
            {page > 1 && <Link href={`/admin/sessions?days=${range.key}&page=${page - 1}`}>← 이전</Link>}
            <span>
              {page} / {pages}
            </span>
            {page < pages && <Link href={`/admin/sessions?days=${range.key}&page=${page + 1}`}>다음 →</Link>}
          </nav>
        )}
      </section>
    </main>
  );
}
