import Link from "next/link";
import { getDashboard, rangeFromDays } from "@/lib/server/analytics";
import { getPublished } from "@/lib/server/content";
import { dbStatus } from "@/lib/server/db";
import { getSettings } from "@/lib/server/settings";
import { STAGE_LABEL, VISITOR_OPTIONS } from "@/content/ui";
import { STAGES } from "@/content/types";
import { DayBars, HBars } from "@/components/admin/charts";
import { RangeFilter, parseRange } from "@/components/admin/RangeFilter";
import { fmtDuration, pct } from "@/lib/format";
import { buildInfo } from "@/lib/build-info";
import { releases } from "@/lib/releases";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const range = parseRange((await searchParams).days);
  const [stats, { content, revisionId }, settings] = await Promise.all([
    getDashboard(rangeFromDays(range.days)),
    getPublished(),
    getSettings(),
  ]);
  const db = dbStatus();
  const name = (id: string) => content.exhibits[id as keyof typeof content.exhibits]?.name.ko ?? id;
  const optLabel = (field: keyof typeof VISITOR_OPTIONS, v: string | null) =>
    VISITOR_OPTIONS[field].find((o) => o.v === v)?.l.ko ?? "미응답";
  const langTotal = stats.languages.ko + stats.languages.en;

  // 퀴즈: 문항별 정답률과 선택지 분포
  const quizEx = Object.values(content.exhibits).find((e) => e.quiz?.length);
  const quiz = (quizEx?.quiz ?? []).map((q) => {
    const rows = stats.quiz.filter((r) => r.target_id === q.id);
    const total = rows.reduce((a, r) => a + r.count, 0);
    const correct = rows.filter((r) => r.correct).reduce((a, r) => a + r.count, 0);
    return {
      q,
      total,
      correct,
      options: q.options.map((o) => ({
        label: `${o.key.toUpperCase()}. ${o.text.ko}${o.key === q.answer ? " (정답)" : ""}`,
        value: rows.filter((r) => r.option === o.key).reduce((a, r) => a + r.count, 0),
      })),
    };
  });

  const faqText = (ex: string, id: string) =>
    content.exhibits[ex as keyof typeof content.exhibits]?.faqs.find((f) => f.id === id)?.q.ko ?? id;
  const hotspotText = (id: string) => content.exhibits.mural.hotspots?.find((h) => h.id === id)?.label.ko ?? id;

  return (
    <main className="admin-page">
      <header className="admin-header row">
        <div>
          <p className="admin-eyebrow">대시보드</p>
          <h1>이용 현황</h1>
        </div>
        <RangeFilter current={range.key} base="/admin" />
      </header>

      {(!db.persistent || !settings.analyticsEnabled) && (
        <div className="notice warn">
          {!db.persistent && (
            <p>
              ⚠ 데이터베이스가 연결되지 않아 기록이 저장되지 않습니다. Vercel → Storage에서 Postgres(Neon)를 연결하세요.{" "}
              <Link href="/admin/settings">설정 보기</Link>
            </p>
          )}
          {!settings.analyticsEnabled && (
            <p>
              이용 로그 수집이 꺼져 있습니다. <Link href="/admin/settings">설정</Link>에서 켤 수 있습니다.
            </p>
          )}
        </div>
      )}

      <section className="kpis">
        <div className="kpi">
          <span>이용 세션</span>
          <strong>{stats.sessions.toLocaleString()}</strong>
          <small>{range.label}</small>
        </div>
        <div className="kpi">
          <span>평균 이용 시간</span>
          <strong>{fmtDuration(stats.avgSessionSeconds)}</strong>
          <small>세션 시작~종료</small>
        </div>
        <div className="kpi">
          <span>입력된 방문객</span>
          <strong>{stats.groups.visitors.toLocaleString()}명</strong>
          <small>{stats.groups.withInfo}개 세션에서 입력</small>
        </div>
        <div className="kpi">
          <span>시작 언어</span>
          <strong>
            {pct(stats.languages.en, langTotal)} <em>EN</em> · {pct(stats.languages.ko, langTotal)} <em>KO</em>
          </strong>
          <small>투어 중 언어 전환 {stats.languageChanges}회</small>
        </div>
      </section>

      <section className="admin-card">
        <h2>일별 이용 세션</h2>
        <DayBars data={stats.perDay} days={range.days ?? Math.max(30, stats.perDay.length)} />
      </section>

      <section className="admin-card">
        <h2>전시물별 이용</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>전시물</th>
                <th>지도에서 선택</th>
                <th>시작 세션</th>
                <th>끝까지 본 세션</th>
                <th>완료율</th>
                <th>평균 체류</th>
                <th>힌트</th>
                <th>FAQ 열람</th>
                <th>단계 건너뛰기</th>
              </tr>
            </thead>
            <tbody>
              {stats.exhibits.map((e) => {
                const start = e.funnel[0].sessions;
                const done = e.funnel[4].sessions;
                return (
                  <tr key={e.id}>
                    <td>{name(e.id)}</td>
                    <td>{e.selected}</td>
                    <td>{start}</td>
                    <td>{done}</td>
                    <td>{pct(done, start)}</td>
                    <td>{fmtDuration(e.avgElapsedMs / 1000)}</td>
                    <td>{e.hints}</td>
                    <td>{e.faqs}</td>
                    <td>{e.skipped}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="chart-caption">
          체류 시간은 앱 화면에 머문 시간으로, 실제 전시물 관찰 시간이나 학습 성취를 직접 측정하지 않습니다.
        </p>
      </section>

      <section className="grid-3">
        {stats.exhibits.map((e) => (
          <article key={e.id} className="admin-card">
            <h2>{name(e.id)} · 단계별 도달</h2>
            <HBars
              unit="세션"
              rows={e.funnel.map((f, i) => ({
                label: `${i + 1}. ${STAGE_LABEL[f.stage].ko}`,
                value: f.sessions,
                note: f.avgMs ? `평균 ${fmtDuration(f.avgMs / 1000)}` : undefined,
              }))}
            />
          </article>
        ))}
      </section>

      <section className="grid-2">
        <article className="admin-card">
          <h2>FAQ 열람 순위</h2>
          <HBars rows={stats.faqs.map((f) => ({ label: faqText(f.exhibit_id, f.target_id), value: f.count }))} unit="회" />
        </article>
        <article className="admin-card">
          <h2>벽화 지점 선택</h2>
          <HBars rows={stats.hotspots.map((h) => ({ label: hotspotText(h.target_id), value: h.count }))} unit="회" />
        </article>
      </section>

      <section className="admin-card">
        <h2>퀴즈 응답</h2>
        {quiz.length ? (
          <div className="grid-2 inner">
            {quiz.map(({ q, total, correct, options }) => (
              <div key={q.id}>
                <p className="quiz-title">
                  {q.question.ko}
                  <span className="muted"> · 응답 {total} · 정답률 {pct(correct, total)}</span>
                </p>
                <HBars rows={options} unit="명" empty="아직 응답이 없습니다." />
              </div>
            ))}
          </div>
        ) : (
          <p className="chart-empty">등록된 퀴즈가 없습니다.</p>
        )}
      </section>

      <section className="admin-card">
        <h2>방문객 구성</h2>
        <p className="chart-caption">
          선택 입력값의 집계입니다. 한 세션에 여러 명이 함께 이용할 수 있어, 이용 기록을 특정 개인에게 귀속하지 않습니다.
        </p>
        <div className="grid-3 inner">
          {(["gender", "origin", "age"] as const).map((field) => (
            <div key={field}>
              <h3>{{ gender: "성별", origin: "내국인/외국인", age: "연령대" }[field]}</h3>
              <HBars
                unit="명"
                rows={VISITOR_OPTIONS[field].map((o) => ({
                  label: optLabel(field, o.v),
                  value: stats.composition
                    .filter((c) => c.field === field && (c.value ?? "na") === o.v)
                    .reduce((a, c) => a + c.count, 0),
                }))}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid-2">
        <article className="admin-card">
          <h2>콘텐츠</h2>
          <p>
            현재 발행본: <strong>{revisionId ? `버전 #${revisionId}` : "기본 콘텐츠 (아직 발행 안 함)"}</strong>
          </p>
          <Link className="admin-link" href="/admin/content">
            콘텐츠 편집 →
          </Link>
        </article>
        <article className="admin-card">
          <h2>앱 버전</h2>
          <p>
            <strong>v{buildInfo.version}</strong> · {releases[0].title}
          </p>
          <Link className="admin-link" href="/admin/releases">
            업데이트 내역 →
          </Link>
        </article>
      </section>
    </main>
  );
}
