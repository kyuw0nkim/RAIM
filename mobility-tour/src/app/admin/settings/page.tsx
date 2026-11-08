import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/server/settings";
import { dbStatus } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  const db = dbStatus();
  return (
    <main className="admin-page">
      <header className="admin-header">
        <p className="admin-eyebrow">설정</p>
        <h1>시스템 설정</h1>
      </header>

      <section className="admin-card">
        <h2>데이터베이스</h2>
        {db.connected ? (
          <p>
            <span className="pill ok">연결됨</span> Postgres에 콘텐츠와 이용 기록을 저장합니다.
          </p>
        ) : db.persistent ? (
          <p>
            <span className="pill warn">로컬 저장</span> 이 컴퓨터의 <code>.data/pglite</code> 폴더에 저장 중입니다 (개발용).
          </p>
        ) : (
          <>
            <p>
              <span className="pill bad">연결 안 됨</span> 지금은 기록이 서버에 남지 않습니다 (서버가 재시작되면 사라짐).
            </p>
            <ol className="steps">
              <li>Vercel 프로젝트 → <b>Storage</b> → <b>Create Database</b> → <b>Neon (Postgres)</b> 선택</li>
              <li>이 프로젝트에 연결하면 <code>DATABASE_URL</code> 환경변수가 자동으로 추가됩니다</li>
              <li><b>Deployments</b>에서 최신 배포를 <b>Redeploy</b> — 표가 자동으로 만들어집니다</li>
            </ol>
          </>
        )}
      </section>

      <SettingsForm initial={settings} />

      <section className="admin-card">
        <h2>관리자 계정</h2>
        <p>
          관리자 페이지는 Vercel 환경변수 <code>ADMIN_USER</code> / <code>ADMIN_PASSWORD</code>로 보호됩니다. 비밀번호를 바꾸려면 Vercel → Settings →
          Environment Variables에서 수정한 뒤 다시 배포하세요.
        </p>
        <p className="muted">
          지금은 계정 하나로 편집·발행·통계를 모두 사용합니다. 편집자/발행자/연구자처럼 권한을 나눠야 하면 계정 기반 로그인으로 확장해야 합니다.
        </p>
      </section>

      <section className="admin-card">
        <h2>태블릿 기기 이름</h2>
        <p>
          세션 기록의 ‘기기’ 열은 태블릿마다 자동으로 만들어진 ID입니다. 알아보기 쉬운 이름을 붙이려면 태블릿에서 주소 끝에{" "}
          <code>?device=교육장-1</code>처럼 붙여 한 번 열면 됩니다. 기기 이름은 시작 화면 오른쪽 아래에 버전과 함께 표시됩니다.
        </p>
      </section>
    </main>
  );
}
