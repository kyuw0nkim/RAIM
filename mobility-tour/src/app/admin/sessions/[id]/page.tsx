import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionDetail } from "@/lib/server/analytics";
import { getPublished } from "@/lib/server/content";
import { STAGE_LABEL, VISITOR_OPTIONS } from "@/content/ui";
import { EXHIBIT_IDS, STAGES, type StageKey } from "@/content/types";
import { ProgressDots } from "@/components/admin/charts";
import { fmtDateTime, fmtDuration, fmtTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
  session_started: "투어 시작",
  visitor_info_submitted: "방문객 정보 입력",
  exhibit_selected: "지도에서 전시물 선택",
  stage_viewed: "단계 진입",
  stage_completed: "단계 마침",
  stage_skipped: "단계 건너뜀",
  cta_clicked: "버튼 누름",
  faq_opened: "FAQ 열람",
  hint_opened: "힌트 열람",
  image_hotspot_selected: "벽화 지점 선택",
  quiz_answer_selected: "퀴즈 답 고름",
  quiz_submitted: "퀴즈 제출",
  language_changed: "언어 전환",
  app_backgrounded: "앱 화면 벗어남",
  app_foregrounded: "앱 화면 복귀",
  session_ended: "투어 종료",
  session_idle_reset: "미사용 자동 초기화",
};

export default async function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id);
  const [detail, { content }] = await Promise.all([getSessionDetail(id), getPublished()]);
  if (!detail) notFound();
  const { session, visitors, events } = detail;
  const labels = STAGES.map((s) => STAGE_LABEL[s].ko);
  const reached = (ex: string) =>
    Math.max(0, ...events.filter((e) => e.event_type === "stage_viewed" && e.exhibit_id === ex).map((e) => STAGES.indexOf(e.stage_key as StageKey) + 1));
  const opt = (f: keyof typeof VISITOR_OPTIONS, v: string | null) => VISITOR_OPTIONS[f].find((o) => o.v === v)?.l.ko ?? "미응답";
  const exName = (ex: string | null) => (ex ? content.exhibits[ex as keyof typeof content.exhibits]?.name.ko ?? ex : "");
  const started = String(session.started_at);
  const end = String(session.ended_at ?? session.last_event_at);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <p className="admin-eyebrow">
          <Link href="/admin/sessions">세션 기록</Link> / 상세
        </p>
        <h1>{fmtDateTime(started)} 세션</h1>
        <p className="muted">
          기기 {String(session.device_id ?? "—")} · 시작 언어 {String(session.initial_language ?? "—").toUpperCase()} · 이용 시간{" "}
          {fmtDuration((new Date(end).getTime() - new Date(started).getTime()) / 1000)} · 앱 v{String(session.app_version ?? "—")} ·
          콘텐츠 {session.content_revision_id ? `#${session.content_revision_id}` : "기본"}
        </p>
      </header>

      <section className="grid-2">
        <article className="admin-card">
          <h2>전시물별 진행</h2>
          <ul className="progress-list">
            {EXHIBIT_IDS.map((ex) => (
              <li key={ex}>
                <span>{exName(ex)}</span>
                <ProgressDots reached={reached(ex)} labels={labels} />
              </li>
            ))}
          </ul>
        </article>
        <article className="admin-card">
          <h2>방문객 구성 ({visitors.length}명)</h2>
          {visitors.length ? (
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>#</th>
                  <th>성별</th>
                  <th>구분</th>
                  <th>연령대</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{opt("gender", v.gender)}</td>
                    <td>{opt("origin", v.origin)}</td>
                    <td>{opt("age", v.age_group)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="chart-empty">입력하지 않음 (건너뛰기)</p>
          )}
        </article>
      </section>

      <section className="admin-card">
        <h2>이용 기록 ({events.length})</h2>
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr>
                <th>시각</th>
                <th>이벤트</th>
                <th>전시물</th>
                <th>단계</th>
                <th>대상</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.event_id}>
                  <td>{fmtTime(e.ts)}</td>
                  <td>{EVENT_LABEL[e.event_type] ?? e.event_type}</td>
                  <td>{exName(e.exhibit_id)}</td>
                  <td>{e.stage_key ? STAGE_LABEL[e.stage_key as StageKey]?.ko ?? e.stage_key : ""}</td>
                  <td>{e.target_id ?? ""}</td>
                  <td className="meta">{metaText(e.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function metaText(m: Record<string, unknown> | null) {
  if (!m) return "";
  const parts: string[] = [];
  if (typeof m.duration_ms === "number") parts.push(fmtDuration(m.duration_ms / 1000));
  if (m.exit) parts.push("나감");
  if (m.option) parts.push(`선택 ${String(m.option).toUpperCase()}`);
  if (typeof m.correct === "boolean") parts.push(m.correct ? "정답" : "오답");
  if (m.from) parts.push(`${String(m.from).toUpperCase()}에서 전환`);
  if (Array.isArray(m.visitors)) parts.push(`${m.visitors.length}명`);
  return parts.join(" · ");
}

