import Link from "next/link";
import { buildInfo } from "@/lib/build-info";
import { CHANGE_TYPE_LABEL, releases } from "@/lib/releases";

export default function AdminHome() {
  const latest = releases[0];
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">대시보드</p>
          <h1>Autonomous Mobility Tour</h1>
        </div>
      </header>

      <section className="admin-grid">
        <article className="admin-card">
          <h2>현재 배포 버전</h2>
          <p className="big-version">v{buildInfo.version}</p>
          <p className="muted">
            {latest.date} · {latest.title}
          </p>
          <Link className="admin-link" href="/admin/releases">
            업데이트 내역 전체 보기 →
          </Link>
        </article>

        <article className="admin-card">
          <h2>이번 버전 변경 사항</h2>
          <ul className="change-list compact">
            {latest.changes.slice(0, 5).map((c, i) => (
              <li key={i}>
                <span className={`type-badge t-${c.type}`}>{CHANGE_TYPE_LABEL[c.type]}</span>
                {c.text}
              </li>
            ))}
          </ul>
          {latest.changes.length > 5 && <p className="muted">외 {latest.changes.length - 5}건</p>}
        </article>

        <article className="admin-card wide">
          <h2>이용 통계</h2>
          <p className="muted">
            이용 로그 수집은 개인정보 처리 근거·보유기간 확인 후 활성화됩니다. 데이터베이스(Supabase 등) 연결 후 일별 세션,
            전시물별 선택, 단계 도달률, FAQ 열람, 퀴즈 정답률 차트가 이 자리에 표시됩니다.
          </p>
        </article>
      </section>
    </main>
  );
}
