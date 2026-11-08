import Link from "next/link";
import { getDashboard, rangeFromDays } from "@/lib/server/analytics";
import { getDraft, getPublished } from "@/lib/server/content";
import { EXHIBIT_IMAGE } from "@/content/map";
import { EXHIBIT_IDS } from "@/content/types";
import { fmtDuration, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ExhibitsPage() {
  const [{ content, revisionId }, draft, stats] = await Promise.all([getPublished(), getDraft(), getDashboard(rangeFromDays(30))]);
  return (
    <main className="admin-page">
      <header className="admin-header">
        <p className="admin-eyebrow">전시물</p>
        <h1>전시물별 콘텐츠와 이용</h1>
        <p className="muted">
          발행본 {revisionId ? `#${revisionId}` : "기본 콘텐츠"} 기준 · 이용 통계는 최근 30일
          {draft.draft && " · 발행하지 않은 초안이 있습니다"}
        </p>
      </header>
      <section className="exhibit-cards">
        {EXHIBIT_IDS.map((id) => {
          const ex = content.exhibits[id];
          const st = stats.exhibits.find((e) => e.id === id)!;
          const start = st.funnel[0].sessions;
          const done = st.funnel[4].sessions;
          const faqs = ex.faqs.filter((f) => !f.disabled).length;
          const quiz = ex.quiz?.filter((q) => !q.disabled).length;
          return (
            <article key={id} className="admin-card exhibit-card">
              <div className="exhibit-thumb">
                <img src={EXHIBIT_IMAGE[id].src} alt="" />
              </div>
              <div>
                <h2>{ex.name.ko}</h2>
                <p className="muted">{ex.name.en}</p>
                <p>{ex.tagline.ko}</p>
                <dl className="mini-stats">
                  <div>
                    <dt>시작 세션</dt>
                    <dd>{start}</dd>
                  </div>
                  <div>
                    <dt>완료율</dt>
                    <dd>{pct(done, start)}</dd>
                  </div>
                  <div>
                    <dt>평균 체류</dt>
                    <dd>{fmtDuration(st.avgElapsedMs / 1000)}</dd>
                  </div>
                  <div>
                    <dt>FAQ</dt>
                    <dd>{faqs}개</dd>
                  </div>
                  {quiz !== undefined && (
                    <div>
                      <dt>퀴즈</dt>
                      <dd>{quiz}문항</dd>
                    </div>
                  )}
                  {ex.hotspots && (
                    <div>
                      <dt>벽화 지점</dt>
                      <dd>{ex.hotspots.length}곳</dd>
                    </div>
                  )}
                </dl>
                <div className="card-links">
                  <Link className="btn-admin" href={`/admin/content?exhibit=${id}`}>
                    문구 편집
                  </Link>
                  <Link className="btn-admin ghost" href={`/admin/faq?exhibit=${id}`}>
                    FAQ
                  </Link>
                  {quiz !== undefined && (
                    <Link className="btn-admin ghost" href="/admin/quiz">
                      퀴즈
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
      <p className="chart-caption">이미지와 지도 위 위치는 앱 코드에 고정되어 있습니다 (관리자 편집 대상 아님).</p>
    </main>
  );
}
