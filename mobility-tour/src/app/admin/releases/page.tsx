import { buildInfo } from "@/lib/build-info";
import { CHANGE_TYPE_LABEL, releases, type ChangeType } from "@/lib/releases";

const TYPE_ORDER: ChangeType[] = ["added", "changed", "fixed", "content", "security", "removed"];

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${y}년 ${Number(m)}월 ${Number(day)}일`;
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function ReleasesPage() {
  const current = buildInfo.version;
  const hasEntry = releases.some((r) => r.version === current);
  const commitUrl =
    buildInfo.repo && buildInfo.commitSha ? `https://github.com/${buildInfo.repo}/commit/${buildInfo.commitSha}` : null;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">업데이트 내역</p>
          <h1>버전별 변경 사항</h1>
          <p className="muted">배포할 때마다 어떤 부분이 바뀌었는지 기록합니다. 최신 버전이 위에 표시됩니다.</p>
        </div>
      </header>

      <section className="admin-card deploy-card" aria-label="현재 배포 정보">
        <div className="deploy-main">
          <span className="muted">지금 배포된 버전</span>
          <span className="big-version">v{current}</span>
        </div>
        <dl className="deploy-meta">
          <div>
            <dt>환경</dt>
            <dd>
              <span className={`env-badge env-${buildInfo.env}`}>{buildInfo.env}</span>
            </dd>
          </div>
          <div>
            <dt>빌드 시각</dt>
            <dd>{fmtDateTime(buildInfo.builtAt)}</dd>
          </div>
          <div>
            <dt>브랜치</dt>
            <dd>{buildInfo.branch ?? "—"}</dd>
          </div>
          <div>
            <dt>커밋</dt>
            <dd>
              {buildInfo.commitSha ? (
                commitUrl ? (
                  <a href={commitUrl} target="_blank" rel="noreferrer">
                    <code>{buildInfo.commitSha.slice(0, 7)}</code>
                  </a>
                ) : (
                  <code>{buildInfo.commitSha.slice(0, 7)}</code>
                )
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
        <p className="deploy-note">
          태블릿은 투어가 끝나 시작 화면으로 돌아갈 때 새 버전으로 바뀝니다. 시작 화면 오른쪽 아래의 버전 번호로 각
          태블릿의 업데이트 여부를 확인하세요.
        </p>
        {!hasEntry && <p className="warn">⚠ 현재 버전(v{current})에 대한 업데이트 내역이 없습니다.</p>}
      </section>

      <div className="releases-layout">
        <ol className="release-timeline">
          {releases.map((r) => {
            const grouped = TYPE_ORDER.map((type) => ({
              type,
              items: r.changes.filter((c) => c.type === type),
            })).filter((g) => g.items.length);
            const isCurrent = r.version === current;
            return (
              <li key={r.version} id={`v${r.version}`} className={`release ${isCurrent ? "current" : ""}`}>
                <div className="release-marker" aria-hidden />
                <article className="admin-card">
                  <header className="release-head">
                    <h2>
                      v{r.version}
                      {isCurrent && <span className="current-badge">현재 배포됨</span>}
                    </h2>
                    <time dateTime={r.date}>{fmtDate(r.date)}</time>
                  </header>
                  <p className="release-title">{r.title}</p>
                  {r.summary && <p className="muted">{r.summary}</p>}
                  {grouped.map((g) => (
                    <section key={g.type} className="change-group">
                      <h3>
                        <span className={`type-badge t-${g.type}`}>{CHANGE_TYPE_LABEL[g.type]}</span>
                        <span className="count">{g.items.length}</span>
                      </h3>
                      <ul className="change-list">
                        {g.items.map((c, i) => (
                          <li key={i}>{c.text}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </article>
              </li>
            );
          })}
        </ol>

        <aside className="release-index" aria-label="버전 목록">
          <h2>버전</h2>
          <ul>
            {releases.map((r) => (
              <li key={r.version}>
                <a href={`#v${r.version}`}>
                  <span>v{r.version}</span>
                  <small>{r.date}</small>
                </a>
              </li>
            ))}
          </ul>
          <div className="howto">
            <h3>새 버전 기록 방법</h3>
            <ol>
              <li>
                <code>npm run release:new -- patch</code>
                <br />
                <small>기능 추가는 minor</small>
              </li>
              <li>
                <code>src/data/releases.json</code> 맨 위 항목의 TODO 작성
              </li>
              <li>커밋 후 푸시 → Vercel 자동 배포</li>
            </ol>
            <small className="muted">내역이 비어 있으면 빌드가 실패해 배포되지 않습니다.</small>
          </div>
        </aside>
      </div>
    </main>
  );
}
